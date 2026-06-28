import { NextResponse } from "next/server";
import { sendCustomEmail } from "@/lib/email";
import { Templates } from "@/lib/email-templates";

export async function POST(request: Request) {
  try {
    const { email, name } = await request.json();

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    const success = await sendCustomEmail({
      toEmail: email,
      toName: name || "Player",
      subject: "Welcome to Pawa Pick!",
      htmlContent: Templates.Welcome(name || "Player")
    });

    if (!success) throw new Error("Failed to send welcome email");

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Welcome Email Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
