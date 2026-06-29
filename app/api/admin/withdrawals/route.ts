// app/api/admin/withdrawals/route.ts
import { db } from "@/lib/firebase-admin";
import { verifyToken } from "@/lib/verify-token";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    // 1. Verify Admin Status
    const uid = await verifyToken(request);
    if (!uid) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const adminDoc = await db.collection("users").doc(uid).get();
    if (adminDoc.data()?.role !== "admin") {
      return NextResponse.json({ error: "Forbidden: Admin access required" }, { status: 403 });
    }

    // 2. Fetch ALL withdrawals sorted by date (Requires NO manual composite index)
    const snapshot = await db.collection("withdrawals")
      .orderBy("createdAt", "desc")
      .get();

    // 3. Attach user details and safely parse dates
    const withdrawals = await Promise.all(snapshot.docs.map(async (doc) => {
      const data = doc.data();

      let userData: any = {};
      if (data.userId) {
        const userDoc = await db.collection("users").doc(data.userId).get();
        userData = userDoc.data() || {};
      }

      // Secure date parsing to prevent .toDate() crashes
      const rawDate = data.createdAt;
      const txDate = rawDate && typeof rawDate.toDate === 'function' 
        ? rawDate.toDate() 
        : new Date(rawDate || 0);

      return {
        id: doc.id,
        amount: data.amount || 0,
        phone: data.phoneNumber || "N/A",
        network: data.provider || "N/A",
        status: data.status || "pending",
        userName: userData.displayName || userData.phoneNumber || "Unknown Player",
        createdAt: txDate.toISOString()
      };
    }));

    return NextResponse.json({ withdrawals });

  } catch (error: any) {
    console.error("Error fetching withdrawals:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
