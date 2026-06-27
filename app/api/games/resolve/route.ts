// app/api/games/resolve/route.ts
import { db } from "@/lib/firebase-admin";
import { NextResponse } from "next/server";

// Hardcoded for MVP testing. In production, this comes from the auth token.
const PLAYER_B_ID = "test_user_ug"; 

export async function POST(request: Request) {
  try {
    const { gameId, guess } = await request.json();

    if (!gameId || !guess) {
      return NextResponse.json({ error: "Missing game ID or guess" }, { status: 400 });
    }

    const gameRef = db.collection("games").doc(gameId);
    const playerBRef = db.collection("users").doc(PLAYER_B_ID);
    const platformWalletRef = db.collection("platform_revenue").doc("escrow_rake");

    // Execute the resolution inside an atomic transaction
    const result = await db.runTransaction(async (transaction) => {
      const [gameDoc, playerBDoc] = await Promise.all([
        transaction.get(gameRef),
        transaction.get(playerBRef)
      ]);

      if (!gameDoc.exists) throw new Error("Game not found");
      const gameData = gameDoc.data()!;

      if (gameData.status !== "open") {
        throw new Error("Too late! Someone else already played this challenge.");
      }
      
      // Prevent the creator from playing their own game
      if (gameData.creatorId === PLAYER_B_ID) {
        throw new Error("You cannot play your own challenge.");
      }

      const playerBBalance = playerBDoc.data()?.walletBalance || 0;
      const stake = gameData.stakeAmount;

      if (playerBBalance < stake) {
        throw new Error("Insufficient funds to accept this challenge.");
      }

      // -- MATCH LOGIC & MATH --
      const totalPool = stake * 2;
      const rake = totalPool * 0.10; // 10% platform fee
      const payout = totalPool - rake;

      let winnerId = "";
      let outcome = "";

      // Did Player B guess the hidden choice?
      if (guess === gameData.creatorChoice) {
        winnerId = PLAYER_B_ID;
        outcome = "player_b_won";
      } else {
        winnerId = gameData.creatorId;
        outcome = "creator_won";
      }

      // -- FINANCIAL SETTLEMENT --
      // 1. Deduct stake from Player B
      transaction.update(playerBRef, { 
        walletBalance: playerBBalance - stake 
      });

      // 2. Pay the winner
      if (winnerId === PLAYER_B_ID) {
        // Player B gets their money back + the winnings
        transaction.update(playerBRef, { 
          walletBalance: (playerBBalance - stake) + payout 
        });
      } else {
        // Player A wins (funds were deducted at creation, so just add payout)
        const playerARef = db.collection("users").doc(gameData.creatorId);
        const playerADoc = await transaction.get(playerARef);
        const playerABalance = playerADoc.data()?.walletBalance || 0;
        
        transaction.update(playerARef, { 
          walletBalance: playerABalance + payout 
        });
      }

      // 3. Log Platform Rake
      transaction.set(platformWalletRef, {
        totalRakeCollected: FirebaseFirestore.FieldValue.increment(rake)
      }, { merge: true });

      // -- LOCK GAME STATE --
      transaction.update(gameRef, {
        status: "played",
        playerBId: PLAYER_B_ID,
        playerBGuess: guess,
        winnerId: winnerId,
        resolvedAt: new Date().toISOString()
      });

      // Return the secret data to the frontend so it can animate the reveal
      return {
        outcome,
        payout,
        creatorChoice: gameData.creatorChoice,
        serverSeed: gameData.serverSeed
      };
    });

    return NextResponse.json({ success: true, ...result });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
