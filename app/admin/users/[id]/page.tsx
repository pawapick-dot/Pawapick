// app/api/admin/users/[id]/route.ts
import { db } from "@/lib/firebase-admin";
import { verifyToken } from "@/lib/verify-token";
import { NextResponse } from "next/server";
import * as admin from "firebase-admin";

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const adminUid = await verifyToken(request);
    if (!adminUid) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const adminDoc = await db.collection("users").doc(adminUid).get();
    if (adminDoc.data()?.role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const userId = params.id;

    // 1. Get User Profile from Auth
    let authUser;
    try {
      authUser = await admin.auth().getUser(userId);
    } catch (e) {
      return NextResponse.json({ error: "User not found in Authentication" }, { status: 404 });
    }

    // 2. Get User Wallet/Status from Firestore
    const userDoc = await db.collection("users").doc(userId).get();
    const fsData = userDoc.exists ? userDoc.data() : {};

    const userData = {
      id: authUser.uid,
      displayName: authUser.displayName || authUser.email || authUser.phoneNumber || "Player",
      phoneNumber: authUser.phoneNumber || "N/A",
      email: authUser.email || "",
      walletBalance: fsData?.walletBalance || 0,
      status: fsData?.status || (authUser.disabled ? "suspended" : "active"),
      createdAt: authUser.metadata.creationTime,
    };

    // 3. Get User's Games (Created or Challenged)
    const createdSnap = await db.collection("games").where("creatorId", "==", userId).get();
    const challengedSnap = await db.collection("games").where("playerBId", "==", userId).get();

    let allGames: any[] = [];
    createdSnap.forEach(doc => allGames.push({ id: doc.id, role: "Creator", ...doc.data() }));
    challengedSnap.forEach(doc => allGames.push({ id: doc.id, role: "Opponent", ...doc.data() }));

    // Sort games newest first
    allGames.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    // 4. Get User's Transactions (FIXED: Uses 'uid' instead of 'userId')
    const txSnap = await db.collection("transactions").where("uid", "==", userId).orderBy("createdAt", "desc").get();
    const transactions = txSnap.docs.map(doc => {
      const data = doc.data();
      // Handle timestamp conversion
      const rawDate = data.createdAt;
      const txDate = rawDate && typeof rawDate.toDate === 'function' ? rawDate.toDate() : new Date();
      return { id: doc.id, ...data, createdAt: txDate.toISOString() };
    });

    return NextResponse.json({ user: userData, games: allGames, transactions });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// Handle Suspend / Reactivate
export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  try {
    const adminUid = await verifyToken(request);
    if (!adminUid) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const adminDoc = await db.collection("users").doc(adminUid).get();
    if (adminDoc.data()?.role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const { status } = await request.json();
    if (!["active", "suspended"].includes(status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }

    const isDisabled = status === "suspended";

    // 1. Actually disable/enable them in Firebase Auth so they can't log in
    await admin.auth().updateUser(params.id, { disabled: isDisabled });

    // 2. Update their Firestore status badge
    await db.collection("users").doc(params.id).set({ status }, { merge: true });

    return NextResponse.json({ success: true, status });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
