// app/api/admin/transactions/route.ts
import { db } from "@/lib/firebase-admin";
import { verifyToken } from "@/lib/verify-token";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const uid = await verifyToken(request);
    if (!uid) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const adminDoc = await db.collection("users").doc(uid).get();
    if (adminDoc.data()?.role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    // Fetch transactions
    const txSnap = await db.collection("transactions").orderBy("createdAt", "desc").limit(500).get();
    
    // We also want to map User IDs to Display Names for a clean table
    const usersSnap = await db.collection("users").get();
    const userMap: Record<string, string> = {};
    usersSnap.forEach(doc => { userMap[doc.id] = doc.data().displayName || doc.data().phoneNumber || "Unknown"; });

    const transactions = txSnap.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        userName: userMap[data.userId] || "System/Unknown",
        ...data
      };
    });

    return NextResponse.json({ transactions });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
