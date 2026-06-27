// app/api/games/create/route.ts
import { db } from "@/lib/firebase-admin";
import { verifyToken } from "@/lib/verify-token";
import { NextResponse } from "next/server";
import crypto from "crypto";

export async function POST(request: Request) {
  try {
    // 1. Verify User
    const uid = await verifyToken(request);
    if (!uid) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { gameType, stakeAmount, creatorChoice } = await request.json();

    if (!gameType || !stakeAmount || !creatorChoice) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const userRef = db.collection("users").doc(uid);
    
    // 2. Execute Atomic Creation
    const result = await db.runTransaction(async (transaction) => {
      const userDoc = await transaction.get(userRef);
      const userData = userDoc.data();
      const balance = userData?.walletBalance || 0;
      
      // Use the displayName if they have one, otherwise fallback to a default
      const username = userData?.displayName || "Agent";

      if (balance < stakeAmount) {
        throw new Error("Insufficient funds. Please top up your wallet.");
      }

      // Deduct stake from creator
      transaction.update(userRef, { 
        walletBalance: balance - stakeAmount 
      });

      // Generate Cryptographic Proof
      const serverSeed = crypto.randomBytes(16).toString("hex");
      const rawData = `${creatorChoice}-${serverSeed}`;
      const publicHash = crypto.createHash("sha256").update(rawData).digest("hex");

      // Save Game
      const gameRef = db.collection("games").doc();
      const gameData = {
        creatorId: uid,
        creatorUsername: username,
        gameType,
        stakeAmount,
        creatorChoice,
        serverSeed,
        publicHash,
        status: "open",
        createdAt: new Date().toISOString()
      };

      transaction.set(gameRef, gameData);

      return { id: gameRef.id, publicHash };
    });

    return NextResponse.json({ success: true, ...result });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
