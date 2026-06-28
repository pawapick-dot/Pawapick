// app/api/wallet/deposit/route.ts
import { db } from "@/lib/firebase-admin";
import { verifyToken } from "@/lib/verify-token";
import { NextResponse } from "next/server";
import * as admin from "firebase-admin";
import { initiateCollection } from "@/lib/marzpay";
import crypto from "crypto"; // Native Node.js UUID generator

export async function POST(request: Request) {
  try {
    const uid = await verifyToken(request);
    if (!uid) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { amount, phoneNumber } = await request.json();
    const depositAmount = Number(amount);

    if (!depositAmount || depositAmount < 500) {
      return NextResponse.json({ error: "Minimum deposit is UGX 500" }, { status: 400 });
    }
    if (!phoneNumber) {
      return NextResponse.json({ error: "Phone number is required" }, { status: 400 });
    }

    // 1. Generate a strict UUID v4 for MarzPay
    const reference = crypto.randomUUID();
    const transactionRef = db.collection("transactions").doc(reference);

    // 2. Save the pending transaction FIRST
    // We do NOT update the user's wallet balance yet. The webhook will do that upon success.
    await transactionRef.set({
      id: reference,
      uid,
      type: "deposit",
      amount: depositAmount,
      status: "pending", 
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      method: "mobile_money",
      phoneNumber
    });

    // 3. Trigger MarzPay API (pushes USSD to phone)
    await initiateCollection({
      amount: depositAmount,
      phoneNumber,
      reference,
      description: "Pawa Pick Wallet Top-up",
    });

    return NextResponse.json({ 
      success: true, 
      message: "Check your phone to enter your PIN." 
    });

  } catch (error: any) {
    console.error("Deposit Error:", error);
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
