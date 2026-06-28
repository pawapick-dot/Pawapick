// app/api/webhooks/marzpay/route.ts
import { db } from "@/lib/firebase-admin";
import { NextResponse } from "next/server";
import * as admin from "firebase-admin";
import { sendCustomEmail } from "@/lib/email";
import { Templates } from "@/lib/email-templates";

export async function POST(request: Request) {
  try {
    const payload = await request.json();
    
    // MarzPay payload structure
    const { event_type, transaction: marzTx, collection, disbursement } = payload;

    if (!marzTx || !marzTx.reference) {
      return NextResponse.json({ error: "Invalid payload: Missing reference" }, { status: 400 });
    }

    // The 'reference' is our Firestore Document ID that we generated when creating the request
    const internalRefId = marzTx.reference;
    const txRef = db.collection("transactions").doc(internalRefId);
    
    let emailData: any = null;

    // Run Secure Transaction for Idempotency
    await db.runTransaction(async (transaction) => {
      const txDoc = await transaction.get(txRef);

      if (!txDoc.exists) {
        console.warn(`Webhook ignored: Transaction ${internalRefId} not found in database.`);
        return; // Exit gracefully
      }

      const txData = txDoc.data()!;

      // 1. Idempotency Check: If already processed, do nothing and just return 200
      if (txData.status === "completed" || txData.status === "failed") {
        console.log(`Webhook ignored: Transaction ${internalRefId} is already ${txData.status}.`);
        return; 
      }

      // 2. Handle Deposit (Collection) SUCCESS
      if (event_type === "collection.completed" && txData.type === "deposit") {
        const userRef = db.collection("users").doc(txData.uid);
        const userDoc = await transaction.get(userRef);

        if (userDoc.exists) {
          const userData = userDoc.data()!;
          const currentBalance = userData.walletBalance || 0;
          const newBalance = currentBalance + txData.amount;

          // Credit Wallet
          transaction.set(userRef, { walletBalance: newBalance }, { merge: true });

          // Mark Transaction Complete
          transaction.update(txRef, {
            status: "completed",
            providerTransactionId: collection?.provider_transaction_id || null,
            resolvedAt: admin.firestore.FieldValue.serverTimestamp(),
          });

          // Extract data to send email outside of the Firestore lock
          emailData = {
            type: "deposit_success",
            email: userData.email,
            name: userData.displayName || "Player",
            amount: txData.amount,
            newBalance: newBalance
          };
        }
      }

      // 3. Handle Deposit (Collection) FAILED
      if (event_type === "collection.failed" && txData.type === "deposit") {
        transaction.update(txRef, {
          status: "failed",
          providerTransactionId: collection?.provider_transaction_id || null,
          resolvedAt: admin.firestore.FieldValue.serverTimestamp(),
        });
      }

      // Note: You can add logic here for 'disbursement.completed' and 'disbursement.failed' 
      // if you move admin approvals to asynchronous background jobs.
    });

    // 4. Trigger Brevo Email (Asynchronous)
    if (emailData && emailData.email) {
      if (emailData.type === "deposit_success") {
        sendCustomEmail({
          toEmail: emailData.email,
          toName: emailData.name,
          subject: "Deposit Successful - Pawa Pick",
          htmlContent: Templates.DepositSuccess(
            emailData.amount.toLocaleString(), 
            emailData.newBalance.toLocaleString()
          )
        }).catch((err) => console.error("Failed to send webhook deposit email:", err));
      }
    }

    // Always return 200 OK so MarzPay knows we received it and doesn't retry
    return NextResponse.json({ received: true });

  } catch (error: any) {
    console.error("MarzPay Webhook Processing Error:", error);
    // Return 500 so MarzPay knows to retry the webhook later
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
