// app/api/dashboard/route.ts
import { db } from "@/lib/firebase-admin";
import { verifyToken } from "@/lib/verify-token";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const uid = await verifyToken(request);
    if (!uid) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    // Fetch games where user is the creator
    const createdSnapshot = await db.collection("games").where("creatorId", "==", uid).get();
    
    // Fetch games where user is the challenger
    const challengedSnapshot = await db.collection("games").where("playerBId", "==", uid).get();

    // Combine all games
    let allGames: any[] = [];
    createdSnapshot.forEach(doc => allGames.push({ id: doc.id, ...doc.data() }));
    challengedSnapshot.forEach(doc => allGames.push({ id: doc.id, ...doc.data() }));

    // Remove any potential duplicates
    const uniqueGames = Array.from(new Map(allGames.map(item => [item.id, item])).values());

    let totalPlayed = 0;
    let wins = 0;
    let activeEscrows = 0;
    let recentGames: any[] = [];

    uniqueGames.forEach(game => {
      if (game.status === "open") {
        activeEscrows++;
      } else if (game.status === "played") {
        totalPlayed++;
        
        const isCreator = game.creatorId === uid;
        const won = (isCreator && game.outcome === "creator_won") || (!isCreator && game.outcome === "player_b_won");
        
        if (won) wins++;
        
        // Calculate the payout context
        const pool = game.stakeAmount * 2;
        const payout = pool - (pool * 0.10);

        recentGames.push({
          id: game.id,
          gameType: game.gameType,
          opponent: isCreator ? "Challenger" : game.creatorUsername,
          stakeAmount: game.stakeAmount,
          payout: won ? payout : -game.stakeAmount,
          won,
          choice: isCreator ? game.creatorChoice : game.playerBGuess,
          resolvedAt: game.resolvedAt || game.createdAt
        });
      }
    });

    const winRate = totalPlayed > 0 ? Math.round((wins / totalPlayed) * 100) : 0;
    
    // Sort recent games by most recently resolved
    recentGames.sort((a, b) => new Date(b.resolvedAt).getTime() - new Date(a.resolvedAt).getTime());

    return NextResponse.json({
      winRate,
      totalMatches: totalPlayed,
      activeEscrows,
      wins,
      recentGames: recentGames.slice(0, 10) // Return top 10 recent games
    });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
