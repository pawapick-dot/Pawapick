// app/api/games/create/route.ts
import { db } from "@/lib/firebase-admin";
import { NextResponse } from "next/server";
import crypto from "crypto";

const MOCK_USER_ID = "test_user_ug";

export async function POST(request: Request) {
  try {
    const { gameType, stakeAmount, creatorChoice } = await request.json();

    // 1. Core Validations
    if (!gameType || !stakeAmount || !creatorChoice) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }
    if (stakeAmount < 1000) {
      return NextResponse.json({ error: "Minimum stake is 1,000 UGX" }, { status: 400 });
    }

    const userRef = db.collection("users").doc(MOCK_USER_ID);
    const gameRef = db.collection("games").doc();

    // 2. Cryptographic Security Layer (Provably Fair)
    // Server generates a completely random secret key
    const serverSeed = crypto.randomBytes(16).toString("hex");
    
    // Combine choice + seed to lock it in place via SHA-256
    const publicHash = crypto
      .createHash("sha256")
      .update(`${creatorChoice}-${serverSeed}`)
      .digest("hex");

    // 3. Execution via Atomic Database Transaction
    const result = await db.runTransaction(async (transaction) => {
      const userDoc = await transaction.get(userRef);

      if (!userDoc.exists) {
        throw new Error("User account not found");
      }

      const balance = userDoc.data()?.walletBalance || 0;

      if (balance < stakeAmount) {
        throw new Error("Insufficient balance. Top up your wallet first.");
      }

      // Deduct the stake from the creator's wallet balance
      transaction.update(userRef, {
        walletBalance: balance - stakeAmount,
      });

      // Write the complete, unalterable challenge contract to Firestore
      const newGameData = {
        id: gameRef.id,
        creatorId: MOCK_USER_ID,
        creatorUsername: userDoc.data()?.username || "PawaPlayer",
        gameType, // penalty | dice | shuffle | color
        stakeAmount,
        status: "open",
        createdAt: new Date().toISOString(),
        
        // Trust and Verification Fields
        publicHash, // Visible to anyone immediately
        serverSeed, // HIDDEN until game finishes (stored securely)
        creatorChoice, // HIDDEN until game finishes (stored securely)
      };

      transaction.set(gameRef, newGameData);

      // Audit Log tracking the escrow lock
      const logRef = db.collection("transactions").doc();
      transaction.set(logRef, {
        userId: MOCK_USER_ID,
        gameId: gameRef.id,
        type: "stake_escrow_lock",
        amount: stakeAmount,
        timestamp: new Date().toISOString(),
        status: "completed"
      });

      return { gameId: gameRef.id, publicHash };
    });

    return NextResponse.json({ success: true, ...result });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
