// app/api/games/feed/route.ts
import { db } from "@/lib/firebase-admin";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    // Fetch only games that are currently waiting for a challenger
    const gamesSnapshot = await db
      .collection("games")
      .where("status", "==", "open")
      .orderBy("createdAt", "desc")
      .limit(20)
      .get();

    const openGames = gamesSnapshot.docs.map((doc) => {
      const data = doc.data();
      
      // We only return the public data to the browser.
      // Notice we are NOT returning creatorChoice or serverSeed.
      return {
        id: doc.id,
        creatorUsername: data.creatorUsername,
        gameType: data.gameType,
        stakeAmount: data.stakeAmount,
        createdAt: data.createdAt,
      };
    });

    return NextResponse.json({ games: openGames });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
