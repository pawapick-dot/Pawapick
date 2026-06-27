// app/api/admin/games/[id]/route.ts
import { db } from "@/lib/firebase-admin";
import { verifyToken } from "@/lib/verify-token";
import { NextResponse } from "next/server";

export async function POST(request: Request, { params }: { params: { id: string } }) {
  try {
    const uid = await verifyToken(request);
    if (!uid) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const adminDoc = await db.collection("users").doc(uid).get();
    if (adminDoc.data()?.role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const { action } = await request.json();
    if (action !== "cancel_and_refund") return NextResponse.json({ error: "Invalid action" }, { status: 400 });

    const gameRef = db.collection("games").doc(params.id);

    // Run as a secure atomic transaction
    await db.runTransaction(async (transaction) => {
      const gameDoc = await transaction.get(gameRef);
      if (!gameDoc.exists) throw new Error("Game not found.");
      
      const game = gameDoc.data()!;
      if (game.status !== "open") throw new Error("Only 'open' games can be cancelled and refunded.");

      const creatorRef = db.collection("users").doc(game.creatorId);
      const creatorDoc = await transaction.get(creatorRef);
      const creatorData = creatorDoc.data();

      // Refund the creator
      const currentBalance = creatorData?.walletBalance || 0;
      transaction.update(creatorRef, { walletBalance: currentBalance + game.stakeAmount });

      // Mark game as cancelled
      transaction.update(gameRef, { status: "cancelled", resolvedAt: new Date().toISOString() });

      // Log the refund transaction
      const txRef = db.collection("transactions").doc();
      transaction.set(txRef, {
        userId: game.creatorId,
        type: "refund",
        amount: game.stakeAmount,
        status: "completed",
        gameId: params.id,
        createdAt: new Date().toISOString()
      });
    });

    return NextResponse.json({ success: true, message: "Game cancelled and refunded successfully." });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
