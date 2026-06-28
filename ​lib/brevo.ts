const BREVO_API_KEY = process.env.BREVO_API_KEY;

type EmailPayload = {
  to: { email: string; name?: string }[];
  templateId: number;
  params?: Record<string, any>;
};

export async function sendBrevoEmail({ to, templateId, params }: EmailPayload) {
  if (!BREVO_API_KEY) {
    console.error("Missing BREVO_API_KEY environment variable");
    return { success: false, error: "Missing API Key" };
  }

  try {
    const response = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: {
        "Accept": "application/json",
        "Content-Type": "application/json",
        "api-key": BREVO_API_KEY,
      },
      body: JSON.stringify({
        to,
        templateId,
        params, // Dynamic data injected into your Brevo template (e.g., {{params.amount}})
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("Brevo API Error:", errorData);
      return { success: false, error: errorData };
    }

    const data = await response.json();
    return { success: true, data };
  } catch (error) {
    console.error("Failed to send email via Brevo:", error);
    return { success: false, error };
  }
}
