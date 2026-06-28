import { NextResponse } from "next/server";
import { sendBrevoEmail } from "@/lib/brevo";
import { EMAIL_TEMPLATES } from "@/lib/email-templates";

export async function POST(req: Request) {
  try {
    const { userId, userEmail, userName, amount } = await req.json();

    // 1. Logic to add money to user's wallet in Database
    // await db.wallet.update(...)

    // 2. Fire the email notification in the background
    // We intentionally don't 'await' this so the user isn't waiting for the email server
    sendBrevoEmail({
      to: [{ email: userEmail, name: userName }],
      templateId: EMAIL_TEMPLATES.TOP_UP_SUCCESS,
      params: {
        username: userName,
        amount: amount.toLocaleString(),
        new_balance: "50,000", // calculate this from your DB
        date: new Date().toLocaleDateString(),
      }
    });

    return NextResponse.json({ success: true, message: "Top up successful" });

  } catch (error) {
    return NextResponse.json({ success: false, error: "Top up failed" }, { status: 500 });
  }
}
