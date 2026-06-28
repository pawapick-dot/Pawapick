import { db } from "@/lib/firebase-admin";
import { verifyToken } from "@/lib/verify-token";
import { NextResponse } from "next/server";
import * as admin from "firebase-admin";
import { sendCustomEmail } from "@/lib/email";
import { Templates } from "@/lib/email-templates";

export async function POST(request: Request) {
  try {
    const uid = await verifyToken(request);
    if (!uid) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    
    const adminDoc = await db.collection("users").doc(uid).get();
    if (adminDoc.data()?.role !== "admin") {
      return NextResponse.json({ error: "Forbidden: Admin access required" }, { status: 403 });
    }

    const { withdrawalId, action, rejectionReason } = await request.json(); 
    if (!withdrawalId || !action) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const withdrawalRef = db.collection("withdrawals").doc(withdrawalId);

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

      transaction.update(withdrawalRef, {
        status: newStatus,
        processedAt: timestamp,
        ...(rejectionReason && { rejectionReason })
      });

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

      if (action === "reject") {
        const currentBalance = userData.walletBalance || 0;
        const refundedBalance = currentBalance + withdrawalData.amount;
        transaction.set(userRef, { walletBalance: refundedBalance }, { merge: true });

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

    if (result.email) {
      const subject = result.status === "approved" ? "Withdrawal Approved" : "Withdrawal Rejected";
      const htmlContent = result.status === "approved" 
        ? Templates.WithdrawalApproved(result.amount.toLocaleString())
        : Templates.WithdrawalRejected(result.amount.toLocaleString(), rejectionReason || "");

      sendCustomEmail({
        toEmail: result.email,
        toName: result.name,
        subject: `${subject} - Pawa Pick`,
        htmlContent: htmlContent
      }).catch((err) => console.error(`Failed to send ${result.status} email:`, err));
    }

    return NextResponse.json({ success: true, status: result.status });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
