// app/api/history/route.ts
import { db } from "@/lib/firebase-admin";
import { verifyToken } from "@/lib/verify-token";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const uid = await verifyToken(request);
    if (!uid) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    // Fetch games where user is the creator OR challenger
    const createdSnapshot = await db.collection("games").where("creatorId", "==", uid).get();
    const challengedSnapshot = await db.collection("games").where("playerBId", "==", uid).get();

    let allGames: any[] = [];
    createdSnapshot.forEach(doc => allGames.push({ id: doc.id, ...doc.data() }));
    challengedSnapshot.forEach(doc => allGames.push({ id: doc.id, ...doc.data() }));

    // Remove potential duplicates
    const uniqueGames = Array.from(new Map(allGames.map(item => [item.id, item])).values());

    let history: any[] = [];

    uniqueGames.forEach(game => {
      const isCreator = game.creatorId === uid;

      if (game.status === "open") {
        history.push({
          id: game.id,
          gameType: game.gameType,
          opponent: "Pending",
          stakeAmount: game.stakeAmount,
          payout: 0,
          won: false,
          status: "open",
          date: game.createdAt
        });
      } else if (game.status === "played") {
        const won = (isCreator && game.outcome === "creator_won") || (!isCreator && game.outcome === "player_b_won");
        const pool = game.stakeAmount * 2;
        const payout = pool - (pool * 0.10);

        history.push({
          id: game.id,
          gameType: game.gameType,
          opponent: isCreator ? (game.playerBUsername || "Challenger") : game.creatorUsername,
          stakeAmount: game.stakeAmount,
          payout: won ? payout : -game.stakeAmount,
          won,
          status: "played",
          date: game.resolvedAt || game.createdAt
        });
      }
    });

    // Sort all games by date (Newest first)
    history.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    return NextResponse.json({ history });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
