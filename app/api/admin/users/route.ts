// app/api/admin/users/route.ts
import { db } from "@/lib/firebase-admin";
import { verifyToken } from "@/lib/verify-token";
import { NextResponse } from "next/server";
import * as admin from "firebase-admin";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const uid = await verifyToken(request);
    if (!uid) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const adminDoc = await db.collection("users").doc(uid).get();
    if (adminDoc.data()?.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // 1. Fetch Auth Users
    const listUsersResult = await admin.auth().listUsers(1000);
    
    // 2. Fetch Firestore Users (for wallet balances and status)
    const usersSnap = await db.collection("users").get();
    const firestoreUsers = new Map();
    usersSnap.forEach(doc => firestoreUsers.set(doc.id, doc.data()));

    // 3. Merge the data together
    const users = listUsersResult.users.map(userRecord => {
      const fsData = firestoreUsers.get(userRecord.uid) || {};
      
      return {
        id: userRecord.uid,
        name: userRecord.displayName || userRecord.email || userRecord.phoneNumber || "Player",
        phone: userRecord.phoneNumber || "N/A",
        walletBalance: fsData.walletBalance || 0,
        isVerified: userRecord.emailVerified || !!userRecord.phoneNumber,
        status: fsData.status || (userRecord.disabled ? "suspended" : "active"),
        createdAt: userRecord.metadata.creationTime
      };
    });

    // Sort by newest first
    users.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return NextResponse.json({ users });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
