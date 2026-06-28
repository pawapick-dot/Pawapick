// app/api/admin/withdrawals/update/route.ts
import { db } from "@/lib/firebase-admin";
import { verifyToken } from "@/lib/verify-token";
import { NextResponse } from "next/server";
import * as admin from "firebase-admin";
import { sendTemplateEmail, EMAIL_TEMPLATES } from "@/lib/email";

export async function POST(request: Request) {
  try {
    // 1. Verify Admin Status (Ensure only you can access this)
    const uid = await verifyToken(request);
    if (!uid) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    
    const adminDoc = await db.collection("users").doc(uid).get();
    if (adminDoc.data()?.role !== "admin") {
      return NextResponse.json({ error: "Forbidden: Admin access required" }, { status: 403 });
    }

    const { withdrawalId, action, rejectionReason } = await request.json(); // action = "approve" or "reject"
    if (!withdrawalId || !action) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const withdrawalRef = db.collection("withdrawals").doc(withdrawalId);

    // 2. Run Secure Transaction
    const result = await db.runTransaction(async (transaction) => {
      const withdrawalDoc = await transaction.get(withdrawalRef);
      if (!withdrawalDoc.exists) throw new Error("Withdrawal not found");

      const withdrawalData = withdrawalDoc.data()!;
      if (withdrawalData.status !== "pending") {
        throw new Error(`Withdrawal is already ${withdrawalData.status}`);
      }

      const userRef = db.collection("users").doc(withdrawalData.userId);
      const userDoc = await transaction.get(userRef);
      const userData = userDoc.data() || {};
      
      const newStatus = action === "approve" ? "approved" : "rejected";
      const timestamp = admin.firestore.FieldValue.serverTimestamp();

      // Update the withdrawal record
      transaction.update(withdrawalRef, {
        status: newStatus,
        processedAt: timestamp,
        ...(rejectionReason && { rejectionReason })
      });

      // Update the associated transaction record to match
      const relatedTxQuery = await db.collection("transactions")
        .where("uid", "==", withdrawalData.userId)
        .where("type", "==", "withdrawal_request")
        .where("amount", "==", -withdrawalData.amount)
        .where("status", "==", "pending")
        .limit(1)
        .get();

      if (!relatedTxQuery.empty) {
        transaction.update(relatedTxQuery.docs[0].ref, { status: newStatus });
      }

      // IF REJECTED: Refund the user's wallet
      if (action === "reject") {
        const currentBalance = userData.walletBalance || 0;
        const refundedBalance = currentBalance + withdrawalData.amount;
        transaction.set(userRef, { walletBalance: refundedBalance }, { merge: true });

        // Write a refund receipt
        const refundTxRef = db.collection("transactions").doc();
        transaction.set(refundTxRef, {
          id: refundTxRef.id,
          uid: withdrawalData.userId,
          type: "withdrawal_refund",
          amount: withdrawalData.amount,
          status: "completed",
          createdAt: timestamp
        });
      }

      return {
        email: userData.email,
        name: userData.displayName || "Player",
        amount: withdrawalData.amount,
        status: newStatus
      };
    });

    // 3. Trigger Brevo Email (Asynchronous)
    if (result.email) {
      const templateId = result.status === "approved" 
        ? EMAIL_TEMPLATES.WITHDRAWAL_APPROVED 
        : EMAIL_TEMPLATES.WITHDRAWAL_REJECTED;

      sendTemplateEmail({
        toEmail: result.email,
        toName: result.name,
        templateId: templateId,
        params: {
          amount: result.amount.toLocaleString(),
          currency: "UGX",
          ...(rejectionReason && { reason: rejectionReason })
        }
      }).catch((err) => console.error(`Failed to send ${result.status} email:`, err));
    }

    return NextResponse.json({ success: true, status: result.status });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
