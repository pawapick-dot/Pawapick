// app/api/webhooks/marzpay/route.ts
import { db } from "@/lib/firebase-admin";
import { NextResponse } from "next/server";
import * as admin from "firebase-admin";
import { sendCustomEmail } from "@/lib/email";
import { Templates } from "@/lib/email-templates";

export async function POST(request: Request) {
  try {
    const payload = await request.json();

    const { event_type, transaction: marzTx, collection, disbursement } = payload;

    if (!marzTx || !marzTx.reference) {
      return NextResponse.json({ error: "Invalid payload: Missing reference" }, { status: 400 });
    }

    const internalRefId = marzTx.reference;
    const txRef = db.collection("transactions").doc(internalRefId);

    let emailData: any = null;

    // Run Secure Transaction for Idempotency
    await db.runTransaction(async (transaction) => {
      const txDoc = await transaction.get(txRef);

      if (!txDoc.exists) {
        console.warn(`Webhook ignored: Transaction ${internalRefId} not found.`);
        return; 
      }

      const txData = txDoc.data()!;

      if (txData.status === "completed" || txData.status === "failed") {
        return; 
      }

      // 1. Handle Deposit (Collection) SUCCESS
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

          // Create Deposit Notification
          transaction.set(db.collection("notifications").doc(), {
            uid: txData.uid,
            title: "Wallet Top-up Complete",
            message: `Your deposit of ${txData.amount.toLocaleString()} UGX has been successfully credited.`,
            type: "deposit",
            isRead: false,
            createdAt: admin.firestore.FieldValue.serverTimestamp()
          });

          // ==========================================
          // PHASE 2: REFERRAL BONUS TRIGGER LOGIC
          // ==========================================
          // Check if user was referred, hasn't triggered a bonus yet, and deposited 1000+ UGX
          if (userData.referredBy && !userData.referralBonusPaid && txData.amount >= 1000) {
            
            // Query for the referrer using their unique code
            const referrerQuery = await transaction.get(
              db.collection("users").where("referralCode", "==", userData.referredBy).limit(1)
            );
            
            if (!referrerQuery.empty) {
              const referrerDoc = referrerQuery.docs[0];
              const referrerRef = referrerDoc.ref;
              const referrerData = referrerDoc.data();
              
              const newReferrerBalance = (referrerData.walletBalance || 0) + 200;
              
              // Credit the referrer
              transaction.set(referrerRef, { walletBalance: newReferrerBalance }, { merge: true });
              
              // Mark the new user so they can't trigger another bonus
              transaction.set(userRef, { referralBonusPaid: true }, { merge: true });

              // Write to the immutable ledger
              transaction.set(db.collection("transactions").doc(), {
                uid: referrerDoc.id,
                type: "referral_bonus",
                amount: 200,
                status: "completed",
                referredUser: userData.displayName || "A friend",
                createdAt: admin.firestore.FieldValue.serverTimestamp()
              });

              // Send a notification to the referrer
              transaction.set(db.collection("notifications").doc(), {
                uid: referrerDoc.id,
                title: "Referral Bonus Unlocked! 🎉",
                message: `Your friend ${userData.displayName || "Player"} made a qualifying deposit. 200 UGX has been added to your wallet!`,
                type: "system",
                isRead: false,
                createdAt: admin.firestore.FieldValue.serverTimestamp()
              });
            }
          }
          // ==========================================

          emailData = {
            type: "deposit_success",
            email: userData.email,
            name: userData.displayName || "Player",
            amount: txData.amount,
            newBalance: newBalance
          };
        }
      }

      // 2. Handle Deposit (Collection) FAILED
      if (event_type === "collection.failed" && txData.type === "deposit") {
        transaction.update(txRef, {
          status: "failed",
          providerTransactionId: collection?.provider_transaction_id || null,
          resolvedAt: admin.firestore.FieldValue.serverTimestamp(),
        });
        
        transaction.set(db.collection("notifications").doc(), {
          uid: txData.uid,
          title: "Deposit Failed",
          message: `Your attempt to deposit ${txData.amount.toLocaleString()} UGX was unsuccessful. Please try again.`,
          type: "system",
          isRead: false,
          createdAt: admin.firestore.FieldValue.serverTimestamp()
        });
      }
    });

    // Trigger Brevo Email (Asynchronous)
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
        }).catch(console.error);
      }
    }

    return NextResponse.json({ received: true });

  } catch (error: any) {
    console.error("MarzPay Webhook Processing Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
