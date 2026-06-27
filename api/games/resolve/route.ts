// app/api/games/resolve/route.ts
import { db } from "@/lib/firebase-admin";
import { verifyToken } from "@/lib/verify-token";
import { NextResponse } from "next/server";
import * as admin from "firebase-admin";

export async function POST(request: Request) {
  try {
    // 1. Verify User
    const uid = await verifyToken(request);
    if (!uid) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { gameId, guess } = await request.json();
    if (!gameId || !guess) return NextResponse.json({ error: "Missing fields" }, { status: 400 });

    const gameRef = db.collection("games").doc(gameId);
    const challengerRef = db.collection("users").doc(uid);

    const result = await db.runTransaction(async (transaction) => {
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

      const challengerBalance = challengerDoc.exists ? (challengerDoc.data()?.walletBalance || 0) : 0;
      const creatorBalance = creatorDoc.exists ? (creatorDoc.data()?.walletBalance || 0) : 0;

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

      return { outcome, creatorChoice: game.creatorChoice, payout };
    });

    return NextResponse.json(result);

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
