// lib/email.ts

const BREVO_API_KEY = process.env.BREVO_API_KEY!;
const BREVO_URL = "https://api.brevo.com/v3/smtp/email";
const SENDER_EMAIL = "support@pawapick.com"; // Change this to your actual verified domain email
const SENDER_NAME = "Pawa Pick";

type SendEmailProps = {
  toEmail: string;
  toName: string;
  subject: string;
  htmlContent: string;
};

/**
 * Universal function to trigger a raw HTML email via Brevo
 */
export async function sendCustomEmail({ toEmail, toName, subject, htmlContent }: SendEmailProps) {
  if (!BREVO_API_KEY) {
    console.error("BREVO_API_KEY is missing from environment variables.");
    return false;
  }

  try {
    const response = await fetch(BREVO_URL, {
      method: "POST",
      headers: {
        "Accept": "application/json",
        "Content-Type": "application/json",
        "api-key": BREVO_API_KEY,
      },
      body: JSON.stringify({
        sender: { name: SENDER_NAME, email: SENDER_EMAIL },
        to: [{ email: toEmail, name: toName }],
        subject: subject,
        htmlContent: htmlContent,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("Brevo API Error:", errorData);
      return false;
    }

    return true;
  } catch (error) {
    console.error("Failed to send email via Brevo:", error);
    return false;
  }
}
