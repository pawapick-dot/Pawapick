import { db } from "@/lib/firebase-admin";
import { verifyToken } from "@/lib/verify-token";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const uid = await verifyToken(request);
    if (!uid) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const adminDoc = await db.collection("users").doc(uid).get();
    if (adminDoc.data()?.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Fetch all tickets, newest first
    const snapshot = await db.collection("support_tickets")
      .orderBy("createdAt", "desc")
      .get();

    const tickets = snapshot.docs.map(doc => {
      const data = doc.data();
      const rawDate = data.createdAt;
      const createdAt = rawDate && typeof rawDate.toDate === 'function' 
        ? rawDate.toDate().toISOString() 
        : new Date(rawDate || 0).toISOString();

      return {
        id: doc.id,
        ...data,
        createdAt
      };
    });

    return NextResponse.json({ tickets });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
