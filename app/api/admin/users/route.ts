// app/api/admin/users/route.ts
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

    const usersSnap = await db.collection("users").orderBy("createdAt", "desc").get();
    
    const users = usersSnap.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        name: data.displayName || "Unknown",
        phone: data.phoneNumber || "N/A",
        walletBalance: data.walletBalance || 0,
        isVerified: data.isVerified || false,
        status: data.status || "active",
        createdAt: data.createdAt
      };
    });

    return NextResponse.json({ users });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
