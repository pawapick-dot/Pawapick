// app/api/admin/dashboard/route.ts
import { db } from "@/lib/firebase-admin";
import { verifyToken } from "@/lib/verify-token";
import { NextResponse } from "next/server";

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

    // 2. Fetch Aggregated Data
    // (Using standard .get().size for max compatibility with all Firebase versions)
    const usersSnap = await db.collection("users").get();
    const totalUsers = usersSnap.size;

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
        label: `Match Resolved: ${game.gameType.replace("_", " ")}`,
        amount: game.stakeAmount * 2,
        date: game.resolvedAt || game.createdAt,
      });
    });

    const pendingWithdrawalsSnap = await db.collection("withdrawals").where("status", "==", "pending").get();
    const pendingWithdrawals = pendingWithdrawalsSnap.size;

    // Optional: Add recent users to activity
    usersSnap.docs.slice(-5).forEach(doc => {
      recentActivity.push({
        id: doc.id,
        type: "new_user",
        label: `New User: ${doc.data().displayName || doc.data().phoneNumber}`,
        amount: 0,
        date: doc.data().createdAt || new Date().toISOString(),
      });
    });

    // Sort recent activity (Newest first)
    recentActivity.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    return NextResponse.json({
      totalUsers,
      activeChallenges,
      completedToday,
      revenueToday,
      pendingWithdrawals,
      totalDepositsToday: 0, // Placeholder until deposit API is wired up
      recentActivity: recentActivity.slice(0, 8)
    });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
