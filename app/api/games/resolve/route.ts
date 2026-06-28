// app/api/games/resolve/route.ts
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

    const { gameId, guess } = await request.json();
    if (!gameId || !guess) return NextResponse.json({ error: "Missing fields" }, { status: 400 });

    const gameRef = db.collection("games").doc(gameId);
    const challengerRef = db.collection("users").doc(uid);

    // Run Secure Transaction
    const transactionResult = await db.runTransaction(async (transaction) => {
      // 2. READ ALL DATA FIRST (Firestore transaction rule)
      const gameDoc = await transaction.get(gameRef);
      if (!gameDoc.exists) throw new Error("Game not found");

      const game = gameDoc.data()!;
      if (game.status !== "open") throw new Error("Match already resolved by another player.");
      if (game.creatorId === uid) throw new Error("You cannot play your own game.");

      const creatorRef = db.collection("users").doc(game.creatorId);
      const [challengerDoc, creatorDoc] = await Promise.all([
        transaction.get(challengerRef),
        transaction.get(creatorRef)
      ]);

      const challengerData = challengerDoc.data() || {};
      const creatorData = creatorDoc.data() || {};

      const challengerBalance = challengerData.walletBalance || 0;
      const creatorBalance = creatorData.walletBalance || 0;

      if (challengerBalance < game.stakeAmount) {
        throw new Error("Insufficient funds to challenge. Please top up your wallet.");
      }

      // 3. EXECUTE MATH & LOGIC
      const pool = game.stakeAmount * 2;
      const rake = pool * 0.10;
      const payout = pool - rake;

      const isChallengerWin = guess === game.creatorChoice;
      const outcome = isChallengerWin ? "player_b_won" : "creator_won";

      // Calculate final balances
      let newChallengerBalance = challengerBalance - game.stakeAmount;
      let newCreatorBalance = creatorBalance; // Creator stake was deducted on creation

      if (isChallengerWin) {
        newChallengerBalance += payout;
      } else {
        newCreatorBalance += payout;
      }

      // 4. WRITE UPDATES
      // Update Wallets
      transaction.set(challengerRef, { walletBalance: newChallengerBalance }, { merge: true });
      transaction.set(creatorRef, { walletBalance: newCreatorBalance }, { merge: true });

      const timestamp = admin.firestore.FieldValue.serverTimestamp();

      // Write Ledger Receipts
      transaction.set(db.collection("transactions").doc(), {
        uid, type: "stake_deduction", amount: -game.stakeAmount, status: "Completed", createdAt: timestamp
      });

      if (isChallengerWin) {
        transaction.set(db.collection("transactions").doc(), {
          uid, type: "game_win", amount: payout, status: "Completed", createdAt: timestamp
        });
      } else {
        transaction.set(db.collection("transactions").doc(), {
          uid: game.creatorId, type: "game_win", amount: payout, status: "Completed", createdAt: timestamp
        });
      }

      // Seal the Game
      transaction.update(gameRef, {
        status: "played",
        playerBId: uid,
        playerBGuess: guess,
        outcome,
        resolvedAt: new Date().toISOString()
      });

      // Pass user data out of the transaction to handle emails asynchronously
      return { 
        outcome, 
        creatorChoice: game.creatorChoice, 
        payout,
        gameType: game.gameType,
        isChallengerWin,
        challenger: {
          email: challengerData.email,
          name: challengerData.displayName || "Player",
        },
        creator: {
          email: creatorData.email,
          name: creatorData.displayName || "Player",
        }
      };
    });

    // 5. TRIGGER BREVO EMAILS (Post-Transaction)
    // Run these concurrently so we don't block the API response for too long
    const winner = transactionResult.isChallengerWin ? transactionResult.challenger : transactionResult.creator;
    const loser = transactionResult.isChallengerWin ? transactionResult.creator : transactionResult.challenger;
    const verifyLink = `https://pawapick.com/verify/${gameId}`;

    const emailPromises = [];

    if (winner.email) {
      emailPromises.push(
        sendTemplateEmail({
          toEmail: winner.email,
          toName: winner.name,
          templateId: EMAIL_TEMPLATES.GAME_RESULT_WON,
          params: {
            game_type: transactionResult.gameType?.replace("_", " ") || "Match",
            prize_amount: transactionResult.payout.toLocaleString(),
            verify_link: verifyLink
          }
        })
      );
    }

    if (loser.email) {
      emailPromises.push(
        sendTemplateEmail({
          toEmail: loser.email,
          toName: loser.name,
          templateId: EMAIL_TEMPLATES.GAME_RESULT_LOST,
          params: {
            game_type: transactionResult.gameType?.replace("_", " ") || "Match",
            verify_link: verifyLink
          }
        })
      );
    }

    // Await all emails to ensure Vercel doesn't kill the background task prematurely
    await Promise.allSettled(emailPromises);

    // Return the result to the client UI
    return NextResponse.json({
      outcome: transactionResult.outcome,
      creatorChoice: transactionResult.creatorChoice,
      payout: transactionResult.payout
    });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
