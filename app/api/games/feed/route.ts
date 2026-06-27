// app/api/games/feed/route.ts
import { db } from "@/lib/firebase-admin";
import { NextResponse } from "next/server";

// THIS IS THE CRITICAL FIX: Forces Next.js to ALWAYS fetch fresh data.
// This ensures your Home Page and Live Feed update instantly.
export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  try {
    // 1. Fetch only games that are currently waiting for a challenger
    const gamesSnapshot = await db
      .collection("games")
      .where("status", "==", "open")
      .get();

    let openGames = gamesSnapshot.docs.map((doc) => {
      const data = doc.data();

      // We only return the public data to the browser.
      // Notice we are NOT returning creatorChoice or serverSeed.
      return {
        id: doc.id,
        creatorUsername: data.creatorUsername,
        gameType: data.gameType,
        stakeAmount: data.stakeAmount,
        createdAt: data.createdAt,
        status: data.status, // Included so the frontend can double-check
      };
    });

    // 2. SORT IN MEMORY: This prevents Firebase from crashing due to a missing Composite Index
    openGames.sort((a, b) => {
      const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return dateB - dateA; // Puts the newest challenges at the very top
    });

    // 3. Limit to the 20 most recent games to keep the app fast
    const limitedGames = openGames.slice(0, 20);

    return NextResponse.json({ games: limitedGames });
  } catch (error: any) {
    console.error("Feed API Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
