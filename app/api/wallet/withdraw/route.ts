// app/api/wallet/withdraw/route.ts
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

    const { amount, phoneNumber, provider } = await request.json();
    const withdrawAmount = Number(amount);

    if (!withdrawAmount || withdrawAmount < 1000) {
      return NextResponse.json({ error: "Minimum withdrawal is UGX 1,000" }, { status: 400 });
    }
    if (!phoneNumber || !provider) {
      return NextResponse.json({ error: "Phone number and provider are required" }, { status: 400 });
    }

    const userRef = db.collection("users").doc(uid);
    const withdrawalRef = db.collection("withdrawals").doc();
    const transactionRef = db.collection("transactions").doc();

    // 2. Run Secure Transaction
    const result = await db.runTransaction(async (transaction) => {
      const userDoc = await transaction.get(userRef);
      if (!userDoc.exists) throw new Error("User profile not found");

      const userData = userDoc.data()!;
      const currentBalance = userData.walletBalance || 0;

      if (currentBalance < withdrawAmount) {
        throw new Error("Insufficient funds for this withdrawal");
      }

      const newBalance = currentBalance - withdrawAmount;
      const timestamp = admin.firestore.FieldValue.serverTimestamp();

      // Deduct Balance
      transaction.set(userRef, { walletBalance: newBalance }, { merge: true });

      // Create Pending Withdrawal Record
      transaction.set(withdrawalRef, {
        id: withdrawalRef.id,
        userId: uid,
        amount: withdrawAmount,
        phoneNumber,
        provider,
        status: "pending",
        createdAt: timestamp
      });

      // Create Ledger Receipt
      transaction.set(transactionRef, {
        id: transactionRef.id,
        uid,
        type: "withdrawal_request",
        amount: -withdrawAmount,
        status: "pending",
        createdAt: timestamp
      });

      return {
        email: userData.email,
        name: userData.displayName || "Player",
        withdrawalId: withdrawalRef.id,
        newBalance
      };
    });

    // 3. Trigger Brevo Email (Asynchronous)
    if (result.email) {
      sendCustomEmail({
        toEmail: result.email,
        toName: result.name,
        subject: "Withdrawal Requested - Pawa Pick",
        htmlContent: Templates.WithdrawalRequested(
          withdrawAmount.toLocaleString(),
          phoneNumber,
          provider
        )
      }).catch((err) => console.error("Failed to send withdrawal email:", err));
    }

    return NextResponse.json({ 
      success: true, 
      message: "Withdrawal requested successfully",
      newBalance: result.newBalance 
    });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
