// app/api/wallet/deposit/route.ts
import { db } from "@/lib/firebase-admin";
import { verifyToken } from "@/lib/verify-token";
import { NextResponse } from "next/server";
import * as admin from "firebase-admin";
import { initiateCollection } from "@/lib/marzpay";
import crypto from "crypto";

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

    // 1. Calculate the 5% payment processing fee to charge via MarzPay
    const fee = Math.round(depositAmount * 0.05);
    const totalToCharge = depositAmount + fee;

    const reference = crypto.randomUUID();
    const transactionRef = db.collection("transactions").doc(reference);

    // 2. Log the raw deposit amount.
    // This ensures they are only credited the exact amount they requested once approved.
    await transactionRef.set({
      id: reference,
      uid,
      type: "deposit",
      amount: depositAmount, 
      processingFeeCharged: fee,
      status: "pending", 
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      method: "mobile_money",
      phoneNumber
    });

    // 3. Fire the custom collection request to MarzPay passing the total amount
    await initiateCollection({
      amount: totalToCharge, // This will push the +5% value (e.g. 525) straight to their USSD popup
      phoneNumber,
      reference,
      description: `Pawa Pick Top-up (Incl. processing)`,
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
