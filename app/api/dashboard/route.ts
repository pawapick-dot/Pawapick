// app/api/dashboard/route.ts
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

    const uniqueGames = Array.from(new Map(allGames.map(item => [item.id, item])).values());

    let totalPlayed = 0;
    let wins = 0;
    let activeEscrows = 0;
    let recentGames: any[] = [];

    uniqueGames.forEach(game => {
      const isCreator = game.creatorId === uid;

      if (game.status === "open") {
        activeEscrows++;
        // ADDED: Include open games in recentGames so they appear on the dashboard
        recentGames.push({
          id: game.id,
          gameType: game.gameType,
          opponent: "Pending", // Open games don't have an opponent yet
          stakeAmount: game.stakeAmount,
          payout: 0, // No payout yet
          won: false,
          status: "open",
          createdAt: game.createdAt
        });
      } else if (game.status === "played") {
        totalPlayed++;
        const won = (isCreator && game.outcome === "creator_won") || (!isCreator && game.outcome === "player_b_won");
        if (won) wins++;

        const pool = game.stakeAmount * 2;
        const payout = pool - (pool * 0.10);

        recentGames.push({
          id: game.id,
          gameType: game.gameType,
          opponent: isCreator ? (game.playerBUsername || "Challenger") : game.creatorUsername,
          stakeAmount: game.stakeAmount,
          payout: won ? payout : -game.stakeAmount,
          won,
          status: "played",
          resolvedAt: game.resolvedAt || game.createdAt
        });
      }
    });

    const winRate = totalPlayed > 0 ? Math.round((wins / totalPlayed) * 100) : 0;

    // Sort: Played games first by resolvedAt, then Open games by createdAt
    recentGames.sort((a, b) => {
      const dateA = new Date(a.resolvedAt || a.createdAt).getTime();
      const dateB = new Date(b.resolvedAt || b.createdAt).getTime();
      return dateB - dateA;
    });

    return NextResponse.json({
      winRate,
      totalMatches: totalPlayed,
      activeEscrows,
      wins,
      recentGames: recentGames.slice(0, 10)
    });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
