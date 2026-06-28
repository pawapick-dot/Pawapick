// app/api/admin/withdrawals/update/route.ts
import { db } from "@/lib/firebase-admin";
import { verifyToken } from "@/lib/verify-token";
import { NextResponse } from "next/server";
import * as admin from "firebase-admin";
import { sendCustomEmail } from "@/lib/email";
import { Templates } from "@/lib/email-templates";
import { sendMoney } from "@/lib/marzpay"; // Import the MarzPay utility

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
    const withdrawalDoc = await withdrawalRef.get();
    
    if (!withdrawalDoc.exists) {
      return NextResponse.json({ error: "Withdrawal not found" }, { status: 404 });
    }
    
    const withdrawalData = withdrawalDoc.data()!;
    if (withdrawalData.status !== "pending") {
      return NextResponse.json({ error: `Withdrawal is already ${withdrawalData.status}` }, { status: 400 });
    }

    // 1. IF APPROVE: Call MarzPay immediately BEFORE locking the database
    if (action === "approve") {
      try {
        await sendMoney({
          amount: withdrawalData.amount,
          phoneNumber: withdrawalData.phoneNumber,
          reference: withdrawalId, // This is now a valid UUID from our updated request route
          description: "Pawa Pick Withdrawal",
        });
      } catch (marzErr: any) {
        return NextResponse.json({ error: `MarzPay Error: ${marzErr.message}` }, { status: 500 });
      }
    }

    // 2. Run Secure Transaction to finalize the records
    const result = await db.runTransaction(async (transaction) => {
      const userRef = db.collection("users").doc(withdrawalData.userId);
      const userDoc = await transaction.get(userRef);
      const userData = userDoc.data() || {};
      
      // If approved, we mark as processing (MarzPay webhook will mark as completed)
      // If rejected, we mark as rejected.
      const newStatus = action === "approve" ? "processing" : "rejected";
      const timestamp = admin.firestore.FieldValue.serverTimestamp();

      transaction.update(withdrawalRef, {
        status: newStatus,
        processedAt: timestamp,
        ...(rejectionReason && { rejectionReason })
      });

      const relatedTxQuery = await db.collection("transactions")
        .where("id", "==", withdrawalId)
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
      const subject = result.status === "processing" ? "Withdrawal Approved" : "Withdrawal Rejected";
      const htmlContent = result.status === "processing" 
        ? Templates.WithdrawalApproved(result.amount.toLocaleString())
        : Templates.WithdrawalRejected(result.amount.toLocaleString(), rejectionReason || "");

      sendCustomEmail({
        toEmail: result.email,
        toName: result.name,
        subject: `${subject} - Pawa Pick`,
        htmlContent: htmlContent
      }).catch(console.error);
    }

    return NextResponse.json({ success: true, status: result.status });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
