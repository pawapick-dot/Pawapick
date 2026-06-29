// app/api/admin/dashboard/route.ts
import { db } from "@/lib/firebase-admin";
import { verifyToken } from "@/lib/verify-token";
import { NextResponse } from "next/server";
import * as admin from "firebase-admin";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(request: Request) {
  try {
    // 1. Authenticate & Verify Admin Role
    const uid = await verifyToken(request);
    if (!uid) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const userDoc = await db.collection("users").doc(uid).get();
    if (userDoc.data()?.role !== "admin") {
      return NextResponse.json({ error: "Forbidden. Admin access required." }, { status: 403 });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // 2. Fetch Users Directly from Firebase Authentication
    // (This ensures we get their emails, display names, and phone numbers even if not in Firestore)
    const listUsersResult = await admin.auth().listUsers(1000); 
    const totalUsers = listUsersResult.users.length;

    // 3. Fetch Game Aggregates from Firestore
    const activeGamesSnap = await db.collection("games").where("status", "==", "open").get();
    const activeChallenges = activeGamesSnap.size;

    const completedGamesSnap = await db.collection("games")
      .where("status", "==", "played")
      .get();

    let completedToday = 0;
    let revenueToday = 0;
    let recentActivity: any[] = [];

    completedGamesSnap.forEach((doc) => {
      const game = doc.data();
      const resolvedAt = new Date(game.resolvedAt || game.createdAt);

      // Calculate today's stats
      if (resolvedAt >= today) {
        completedToday++;
        const pool = game.stakeAmount * 2;
        revenueToday += pool * 0.10; // 10% Platform Fee
      }

      // Add to recent activity list
      recentActivity.push({
        id: doc.id,
        type: "game_completed",
        label: `Match Resolved: ${game.gameType?.replace("_", " ") || "Match"}`,
        amount: game.stakeAmount * 2,
        date: game.resolvedAt || game.createdAt,
      });
    });

    // 4. Fetch Pending Withdrawals
    const pendingWithdrawalsSnap = await db.collection("withdrawals").where("status", "==", "pending").get();
    const pendingWithdrawals = pendingWithdrawalsSnap.size;

    // 5. Fetch Deposits & Calculate Total for Today
    const depositsSnap = await db.collection("transactions").where("type", "==", "deposit").get();
    let totalDepositsToday = 0;

    depositsSnap.forEach((doc) => {
      const tx = doc.data();
      
      // Handle Firestore Timestamp vs Standard ISO String date formats securely
      const rawDate = tx.resolvedAt || tx.createdAt;
      const txDate = rawDate && typeof rawDate.toDate === 'function' 
        ? rawDate.toDate() 
        : new Date(rawDate || 0);

      if (tx.status === "completed") {
        // Tally up today's deposits
        if (txDate >= today) {
          totalDepositsToday += tx.amount || 0;
        }

        // Add successful deposits to the Live Activity Feed
        recentActivity.push({
          id: doc.id,
          type: "deposit",
          label: `Wallet Top-up${tx.phoneNumber ? ` (${tx.phoneNumber})` : ""}`,
          amount: tx.amount,
          date: txDate.toISOString(),
        });
      }
    });

    // 6. Sort Auth Users by Creation Time (Newest First)
    const sortedAuthUsers = listUsersResult.users.sort((a, b) => {
      const dateA = new Date(a.metadata.creationTime || 0).getTime();
      const dateB = new Date(b.metadata.creationTime || 0).getTime();
      return dateB - dateA;
    });

    // Add the 5 most recent Auth users to activity
    sortedAuthUsers.slice(0, 5).forEach((userRecord) => {
      // Fallback chain: Display Name -> Email -> Phone -> "Player"
      const identifier = userRecord.displayName || userRecord.email || userRecord.phoneNumber || "Player";
      
      recentActivity.push({
        id: userRecord.uid,
        type: "new_user",
        label: `New User: ${identifier}`,
        amount: 0,
        date: userRecord.metadata.creationTime || new Date().toISOString(),
      });
    });

    // 7. Sort combined recent activity (Newest first)
    recentActivity.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    return NextResponse.json({
      totalUsers,
      activeChallenges,
      completedToday,
      revenueToday,
      pendingWithdrawals,
      totalDepositsToday, 
      recentActivity: recentActivity.slice(0, 8)
    });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
