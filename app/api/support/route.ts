import { db } from "@/lib/firebase-admin";
import { verifyToken } from "@/lib/verify-token";
import { NextResponse } from "next/server";
import * as admin from "firebase-admin";

export async function POST(request: Request) {
  try {
    const uid = await verifyToken(request);
    if (!uid) return NextResponse.json({ error: "Unauthorized. Please log in to contact support." }, { status: 401 });

    const { subject, message, gameId } = await request.json();
    
    if (!subject || !message) {
      return NextResponse.json({ error: "Subject and message are required." }, { status: 400 });
    }

    // Get the user's display name to attach to the ticket
    const userDoc = await db.collection("users").doc(uid).get();
    const userData = userDoc.data() || {};

    const ticketRef = db.collection("support_tickets").doc();
    
    await ticketRef.set({
      userId: uid,
      userName: userData.displayName || userData.phoneNumber || userData.email || "Player",
      subject,
      message,
      gameId: gameId || null,
      status: "open",
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    return NextResponse.json({ success: true, ticketId: ticketRef.id });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
