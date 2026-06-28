// app/api/games/cancel/route.ts
import { db } from "@/lib/firebase-admin";
import { verifyToken } from "@/lib/verify-token";
import { NextResponse } from "next/server";
import * as admin from "firebase-admin";
import { sendTemplateEmail, EMAIL_TEMPLATES } from "@/lib/email";

export async function POST(request: Request) {
  try {
    // 1. Verify User
    const uid = await verifyToken(request);
    if (!uid) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { gameId } = await request.json();
    if (!gameId) return NextResponse.json({ error: "Game ID is required" }, { status: 400 });

    const gameRef = db.collection("games").doc(gameId);
    const userRef = db.collection("users").doc(uid);

    // 2. Run Secure Transaction
    const result = await db.runTransaction(async (transaction) => {
      const gameDoc = await transaction.get(gameRef);
      if (!gameDoc.exists) throw new Error("Game not found");

      const game = gameDoc.data()!;
      if (game.creatorId !== uid) throw new Error("You can only cancel your own games");
      if (game.status !== "open") throw new Error("Only open games can be cancelled");

      const userDoc = await transaction.get(userRef);
      const userData = userDoc.data() || {};
      const currentBalance = userData.walletBalance || 0;

      const refundAmount = game.stakeAmount;
      const newBalance = currentBalance + refundAmount;
      const timestamp = admin.firestore.FieldValue.serverTimestamp();

      // Refund the wallet
      transaction.set(userRef, { walletBalance: newBalance }, { merge: true });

      // Create Ledger Receipt for the refund
      const transactionRef = db.collection("transactions").doc();
      transaction.set(transactionRef, {
        id: transactionRef.id,
        uid,
        type: "game_refund",
        amount: refundAmount,
        status: "completed",
        gameId: gameId,
        createdAt: timestamp
      });

      // Mark game as cancelled
      transaction.update(gameRef, {
        status: "cancelled",
        resolvedAt: new Date().toISOString()
      });

      return {
        email: userData.email,
        name: userData.displayName || "Player",
        refundAmount,
        newBalance
      };
    });

    // 3. Trigger Brevo Email (Asynchronous)
    if (result.email) {
      sendTemplateEmail({
        toEmail: result.email,
        toName: result.name,
        templateId: EMAIL_TEMPLATES.REFUND_ISSUED,
        params: {
          amount: result.refundAmount.toLocaleString(),
          currency: "UGX",
          new_balance: result.newBalance.toLocaleString()
        }
      }).catch((err) => console.error("Failed to send refund email:", err));
    }

    return NextResponse.json({ 
      success: true, 
      message: "Game cancelled and stake refunded",
      newBalance: result.newBalance 
    });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
