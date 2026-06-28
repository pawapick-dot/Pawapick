// app/api/admin/withdrawals/route.ts
import { db } from "@/lib/firebase-admin";
import { verifyToken } from "@/lib/verify-token";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic"; // Ensure this route is never statically cached

export async function GET(request: Request) {
  try {
    // 1. Verify Admin Status
    const uid = await verifyToken(request);
    if (!uid) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const adminDoc = await db.collection("users").doc(uid).get();
    if (adminDoc.data()?.role !== "admin") {
      return NextResponse.json({ error: "Forbidden: Admin access required" }, { status: 403 });
    }

    // 2. Fetch pending withdrawals
    const snapshot = await db.collection("withdrawals")
      .where("status", "==", "pending")
      .orderBy("createdAt", "desc")
      .get();

    // 3. Attach user details to each withdrawal request
    const withdrawals = await Promise.all(snapshot.docs.map(async (doc) => {
      const data = doc.data();
      
      // Fetch the associated user to get their current display name
      const userDoc = await db.collection("users").doc(data.userId).get();
      const userData = userDoc.data() || {};

      return {
        id: doc.id,
        amount: data.amount,
        phone: data.phoneNumber,
        network: data.provider,
        status: data.status,
        userName: userData.displayName || "Unknown Player",
        // Convert Firestore Timestamp to standard ISO string for the frontend
        createdAt: data.createdAt?.toDate().toISOString() || new Date().toISOString()
      };
    }));

    return NextResponse.json({ withdrawals });

  } catch (error: any) {
    console.error("Error fetching withdrawals:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
