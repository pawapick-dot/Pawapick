// lib/email.ts

const BREVO_API_KEY = process.env.BREVO_API_KEY!;
const BREVO_URL = "https://api.brevo.com/v3/smtp/email";

// You will replace these with the actual Template IDs from your Brevo Dashboard
export const EMAIL_TEMPLATES = {
  WELCOME: 1,
  DEPOSIT_SUCCESS: 2,
  CHALLENGE_ACCEPTED: 3,
  GAME_RESULT_WON: 4,
  GAME_RESULT_LOST: 5,
  REFUND_ISSUED: 6,
  WITHDRAWAL_REQUESTED: 7,
  WITHDRAWAL_APPROVED: 8,
  WITHDRAWAL_REJECTED: 9,
};

type SendEmailProps = {
  toEmail: string;
  toName: string;
  templateId: number;
  params?: Record<string, any>; // Dynamic data to inject into the Brevo template
};

/**
 * Universal function to trigger a Brevo transactional email template
 */
export async function sendTemplateEmail({ toEmail, toName, templateId, params = {} }: SendEmailProps) {
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
        to: [{ email: toEmail, name: toName }],
        templateId: templateId,
        params: params, 
        // Example params: { amount: "5,000", currency: "UGX", opponent: "David" }
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
