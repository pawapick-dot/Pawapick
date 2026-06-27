// app/api/wallet/route.ts
import { db } from "@/lib/firebase-admin";
import { verifyToken } from "@/lib/verify-token";
import { NextResponse } from "next/server";
import * as admin from "firebase-admin";

export async function GET(request: Request) {
  try {
    const uid = await verifyToken(request);
    if (!uid) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const userRef = db.collection("users").doc(uid);
    const userDoc = await userRef.get();
    
    const balance = userDoc.exists ? (userDoc.data()?.walletBalance || 0) : 0;

    // Fetch real ledger history
    const historySnapshot = await db.collection("transactions")
      .where("uid", "==", uid)
      .orderBy("createdAt", "desc")
      .limit(10)
      .get();

    const history = historySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      // Convert Firestore Timestamp to readable string
      createdAt: doc.data().createdAt?.toDate().toLocaleString() || "Just now"
    }));

    return NextResponse.json({ balance, history });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const uid = await verifyToken(request);
    if (!uid) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { amount } = await request.json();
    if (!amount || amount <= 0) throw new Error("Invalid amount");

    const userRef = db.collection("users").doc(uid);
    
    // Atomic transaction: Update balance AND record the ledger entry
    const newBalance = await db.runTransaction(async (transaction) => {
      const userDoc = await transaction.get(userRef);
      const currentBalance = userDoc.exists ? (userDoc.data()?.walletBalance || 0) : 0;
      const updatedBalance = currentBalance + amount;

      // 1. Set new balance
      transaction.set(userRef, { walletBalance: updatedBalance }, { merge: true });

      // 2. Write to immutable ledger
      const txRef = db.collection("transactions").doc();
      transaction.set(txRef, {
        uid,
        type: "deposit",
        amount: amount,
        status: "Completed",
        createdAt: admin.firestore.FieldValue.serverTimestamp()
      });

      return updatedBalance;
    });

    return NextResponse.json({ balance: newBalance });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
