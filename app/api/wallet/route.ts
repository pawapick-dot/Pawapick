// app/api/wallet/route.ts
import { db } from "@/lib/firebase-admin";
import { NextResponse } from "next/server";

// Using a static ID for local MVP testing until phone authentication is fully integrated
const MOCK_USER_ID = "test_user_ug";

export async function GET() {
  try {
    const userRef = db.collection("users").doc(MOCK_USER_ID);
    const userDoc = await userRef.get();

    if (!userDoc.exists) {
      // Initialize a new user profile if it doesn't exist yet
      await userRef.set({
        uid: MOCK_USER_ID,
        username: "PawaPlayer",
        walletBalance: 0,
        createdAt: new Date().toISOString(),
      });
      return NextResponse.json({ balance: 0 });
    }

    return NextResponse.json({ balance: userDoc.data()?.walletBalance || 0 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { amount } = await request.json();

    if (!amount || amount <= 0) {
      return NextResponse.json({ error: "Invalid deposit amount" }, { status: 400 });
    }

    const userRef = db.collection("users").doc(MOCK_USER_ID);

    // Secure database transaction to prevent data corruption
    const newBalance = await db.runTransaction(async (transaction) => {
      const userDoc = await transaction.get(userRef);
      
      let currentBalance = 0;
      if (userDoc.exists) {
        currentBalance = userDoc.data()?.walletBalance || 0;
      }

      const updatedBalance = currentBalance + amount;

      transaction.set(userRef, {
        walletBalance: updatedBalance
      }, { merge: true });

      // Create an audit record in a transactions log
      const logRef = db.collection("transactions").doc();
      transaction.set(logRef, {
        userId: MOCK_USER_ID,
        type: "mock_deposit",
        amount: amount,
        timestamp: new Date().toISOString(),
        status: "completed"
      });

      return updatedBalance;
    });

    return NextResponse.json({ success: true, balance: newBalance });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
