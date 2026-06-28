// app/api/wallet/deposit-test/route.ts
import { db } from "@/lib/firebase-admin";
import { verifyToken } from "@/lib/verify-token";
import { NextResponse } from "next/server";
import * as admin from "firebase-admin";
import { sendCustomEmail } from "@/lib/email";
import { Templates } from "@/lib/email-templates";

export async function POST(request: Request) {
  try {
    // 1. Verify User
    const uid = await verifyToken(request);
    if (!uid) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { amount } = await request.json();
    const depositAmount = Number(amount);

    if (!depositAmount || depositAmount <= 0) {
      return NextResponse.json({ error: "Invalid deposit amount" }, { status: 400 });
    }

    const userRef = db.collection("users").doc(uid);
    const transactionRef = db.collection("transactions").doc();

    // 2. Run Secure Transaction
    const result = await db.runTransaction(async (transaction) => {
      const userDoc = await transaction.get(userRef);

      let currentBalance = 0;
      let userData: any = {};

      if (userDoc.exists) {
        userData = userDoc.data()!;
        currentBalance = userData.walletBalance || 0;
      } else {
        throw new Error("User profile not found. Please log out and log back in.");
      }

      const newBalance = currentBalance + depositAmount;
      const timestamp = admin.firestore.FieldValue.serverTimestamp();

      // Add Funds
      transaction.set(userRef, { walletBalance: newBalance }, { merge: true });

      // Create Ledger Receipt
      transaction.set(transactionRef, {
        id: transactionRef.id,
        uid,
        type: "deposit",
        amount: depositAmount,
        status: "completed",
        createdAt: timestamp,
        method: "test_gateway"
      });

      return {
        email: userData.email,
        name: userData.displayName || "Player",
        transactionId: transactionRef.id,
        newBalance
      };
    });

    // 3. Trigger Brevo Email (Asynchronous)
    if (result.email) {
      sendCustomEmail({
        toEmail: result.email,
        toName: result.name,
        subject: "Deposit Successful - Pawa Pick",
        htmlContent: Templates.DepositSuccess(
          depositAmount.toLocaleString(), 
          result.newBalance.toLocaleString()
        )
      }).catch((err) => console.error("Failed to send deposit email:", err));
    }

    return NextResponse.json({ 
      success: true, 
      message: "Test deposit successful",
      newBalance: result.newBalance 
    });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
