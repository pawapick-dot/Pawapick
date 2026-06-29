import { db } from "@/lib/firebase-admin";
import { verifyToken } from "@/lib/verify-token";
import { NextResponse } from "next/server";
import * as admin from "firebase-admin";

// Helper to generate a 5-digit code (excluding 0, O, 1, I for readability)
const generateCode = () => {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let i = 0; i < 5; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
};

// Helper to ensure the generated code is completely unique in the database
const getUniqueCode = async (): Promise<string> => {
  let isUnique = false;
  let code = "";
  while (!isUnique) {
    code = generateCode();
    const existing = await db.collection("users").where("referralCode", "==", code).limit(1).get();
    if (existing.empty) isUnique = true;
  }
  return code;
};

export async function POST(request: Request) {
  try {
    const uid = await verifyToken(request);
    if (!uid) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { referredBy } = await request.json().catch(() => ({ referredBy: null }));

    const userRef = db.collection("users").doc(uid);
    
    await db.runTransaction(async (transaction) => {
      const userDoc = await transaction.get(userRef);
      
      // If the user already has a code, do nothing and return.
      if (userDoc.exists && userDoc.data()?.referralCode) {
        return;
      }

      // Generate a new unique code
      const newReferralCode = await getUniqueCode();

      if (!userDoc.exists) {
        // SCENARIO 1: Brand new user registration
        // Fetch details from Auth to create the base profile
        const authRecord = await admin.auth().getUser(uid);
        
        transaction.set(userRef, {
          email: authRecord.email || null,
          phoneNumber: authRecord.phoneNumber || null,
          displayName: authRecord.displayName || "Player",
          walletBalance: 0,
          status: "active",
          referralCode: newReferralCode,
          referredBy: referredBy || null, 
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
        });
      } else {
        // SCENARIO 2: Legacy user logging in without a code
        // We use merge: true so we do not overwrite their existing wallet balances
        transaction.set(userRef, {
          referralCode: newReferralCode
        }, { merge: true });
      }
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Sync Error:", error);
    return NextResponse.json({ error: "Failed to sync user data" }, { status: 500 });
  }
}
