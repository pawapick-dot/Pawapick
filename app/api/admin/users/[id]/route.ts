// app/api/admin/users/[id]/route.ts
import { db } from "@/lib/firebase-admin";
import { verifyToken } from "@/lib/verify-token";
import { NextResponse } from "next/server";

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const uid = await verifyToken(request);
    if (!uid) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const adminDoc = await db.collection("users").doc(uid).get();
    if (adminDoc.data()?.role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const userId = params.id;

    // 1. Get User Profile
    const userDoc = await db.collection("users").doc(userId).get();
    if (!userDoc.exists) return NextResponse.json({ error: "User not found" }, { status: 404 });
    const userData = { id: userDoc.id, ...userDoc.data() };

    // 2. Get User's Games (Created or Challenged)
    const createdSnap = await db.collection("games").where("creatorId", "==", userId).get();
    const challengedSnap = await db.collection("games").where("playerBId", "==", userId).get();
    
    let allGames: any[] = [];
    createdSnap.forEach(doc => allGames.push({ id: doc.id, role: "Creator", ...doc.data() }));
    challengedSnap.forEach(doc => allGames.push({ id: doc.id, role: "Opponent", ...doc.data() }));
    
    // Sort games newest first
    allGames.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    // 3. Get User's Transactions (Deposits, Withdrawals, etc.)
    const txSnap = await db.collection("transactions").where("userId", "==", userId).orderBy("createdAt", "desc").get();
    const transactions = txSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    return NextResponse.json({ user: userData, games: allGames, transactions });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// Handle Suspend / Reactivate
export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  try {
    const uid = await verifyToken(request);
    if (!uid) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const adminDoc = await db.collection("users").doc(uid).get();
    if (adminDoc.data()?.role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const { status } = await request.json();
    if (!["active", "suspended"].includes(status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }

    await db.collection("users").doc(params.id).update({ status });

    return NextResponse.json({ success: true, status });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
