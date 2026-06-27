// app/api/games/[gameId]/route.ts
import { db } from "@/lib/firebase-admin";
import { NextResponse } from "next/server";
import crypto from "crypto";

export async function GET(request: Request, { params }: { params: { gameId: string } }) {
  try {
    const gameRef = db.collection("games").doc(params.gameId);
    const gameDoc = await gameRef.get();

    if (!gameDoc.exists) {
      return NextResponse.json({ error: "Game not found" }, { status: 404 });
    }

    const game = gameDoc.data()!;

    // Perform live cryptographic verification
    let isVerified = false;
    let expectedHash = "";
    
    if (game.creatorChoice && game.serverSeed) {
      const rawData = `${game.creatorChoice}-${game.serverSeed}`;
      expectedHash = crypto.createHash("sha256").update(rawData).digest("hex");
      isVerified = expectedHash === game.publicHash;
    }

    return NextResponse.json({ 
      id: gameDoc.id,
      ...game, 
      verification: {
        expectedHash,
        isVerified
      }
    });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
