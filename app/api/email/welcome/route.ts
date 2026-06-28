// app/api/email/welcome/route.ts
import { NextResponse } from "next/server";
import { sendTemplateEmail, EMAIL_TEMPLATES } from "@/lib/email";

export async function POST(request: Request) {
  try {
    const { email, name } = await request.json();

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    // Trigger the Brevo template
    const success = await sendTemplateEmail({
      toEmail: email,
      toName: name || "Player",
      templateId: EMAIL_TEMPLATES.WELCOME,
      params: {
        // Add any dynamic variables your Brevo Welcome template expects
        login_url: "https://pawapick.com"
      }
    });

    if (!success) throw new Error("Failed to send welcome email");

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Welcome Email Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
