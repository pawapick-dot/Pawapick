// app/api/wallet/withdraw/route.ts
import { db } from "@/lib/firebase-admin";
import { verifyToken } from "@/lib/verify-token";
import { NextResponse } from "next/server";
import * as admin from "firebase-admin";
import { sendCustomEmail } from "@/lib/email";
import { Templates } from "@/lib/email-templates";
import crypto from "crypto"; 
import { getGlobalSettings } from "@/lib/settings";

export async function POST(request: Request) {
  try {
    const uid = await verifyToken(request);
    if (!uid) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { amount, phoneNumber, provider } = await request.json();
    const withdrawAmount = Number(amount);

    // Fetch dynamic settings
    const settings = await getGlobalSettings();

    if (!withdrawAmount || withdrawAmount < settings.minWithdrawal) {
      return NextResponse.json({ error: `Minimum withdrawal is UGX ${settings.minWithdrawal.toLocaleString()}` }, { status: 400 });
    }
    if (!phoneNumber || !provider) {
      return NextResponse.json({ error: "Phone number and provider are required" }, { status: 400 });
    }

    const WITHDRAWAL_FEE = 500;
    const totalDeduction = withdrawAmount + WITHDRAWAL_FEE;

    const userRef = db.collection("users").doc(uid);
    const withdrawalId = crypto.randomUUID();
    const withdrawalRef = db.collection("withdrawals").doc(withdrawalId);
    const transactionRef = db.collection("transactions").doc(withdrawalId);

    const result = await db.runTransaction(async (transaction) => {
      const userDoc = await transaction.get(userRef);
      if (!userDoc.exists) throw new Error("User profile not found");

      const userData = userDoc.data()!;
      const currentBalance = userData.walletBalance || 0;

      // Restrict user if their balance can't cover both the amount and the 500 UGX cost
      if (currentBalance < totalDeduction) {
        throw new Error(`Insufficient funds. You need at least ${totalDeduction.toLocaleString()} UGX (including the 500 UGX network fee) to withdraw ${withdrawAmount.toLocaleString()} UGX.`);
      }

      const newBalance = currentBalance - totalDeduction;
      const timestamp = admin.firestore.FieldValue.serverTimestamp();

      transaction.set(userRef, { walletBalance: newBalance }, { merge: true });

      transaction.set(withdrawalRef, {
        id: withdrawalId,
        userId: uid,
        amount: withdrawAmount, // Raw amount sent to MarzPay
        fee: WITHDRAWAL_FEE,
        totalDeducted: totalDeduction,
        phoneNumber,
        provider,
        status: "pending",
        createdAt: timestamp
      });

      transaction.set(transactionRef, {
        id: withdrawalId,
        uid,
        type: "withdrawal_request",
        amount: -totalDeduction, // Deduct the full amount from their ledger log
        status: "pending",
        createdAt: timestamp
      });

      return {
        email: userData.email,
        name: userData.displayName || "Player",
        withdrawalId,
        newBalance
      };
    });

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
      }).catch(console.error);
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
