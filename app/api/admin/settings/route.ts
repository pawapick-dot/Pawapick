import { db } from "@/lib/firebase-admin";
import { verifyToken } from "@/lib/verify-token";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const uid = await verifyToken(request);
    if (!uid) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const adminDoc = await db.collection("users").doc(uid).get();
    if (adminDoc.data()?.role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const settings = await request.json();
    
    // Save to Firestore
    await db.collection("system").doc("settings").set(settings, { merge: true });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
