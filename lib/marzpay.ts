// lib/marzpay.ts

const API_KEY = process.env.MARZPAY_API_KEY!;
const API_SECRET = process.env.MARZPAY_API_SECRET!;
const BASE_URL = "https://wallet.wearemarz.com/api/v1";
const APP_URL = process.env.NEXT_PUBLIC_APP_URL!;

/**
 * Generates the Base64 Basic Auth string required by MarzPay
 */
const getAuthHeader = () => {
  const credentials = Buffer.from(`${API_KEY}:${API_SECRET}`).toString("base64");
  return `Basic ${credentials}`;
};

type CollectionProps = {
  amount: number;
  phoneNumber: string; // Must be formatted like +2567XXXXXXXX
  reference: string;   // Must be a unique UUID v4
  description: string;
};

/**
 * 1. Initiate a Deposit (Collection)
 * Triggers a USSD prompt on the user's phone.
 */
export async function initiateCollection({ amount, phoneNumber, reference, description }: CollectionProps) {
  const response = await fetch(`${BASE_URL}/collect-money`, {
    method: "POST",
    headers: {
      "Authorization": getAuthHeader(),
      "Content-Type": "application/json",
      "Accept": "application/json",
    },
    body: JSON.stringify({
      amount: amount,
      phone_number: phoneNumber,
      country: "UG",
      reference: reference,
      description: description,
      callback_url: `${APP_URL}/api/webhooks/marzpay`,
    }),
  });

  const data = await response.json();
  
  if (!response.ok || data.status === "error") {
    throw new Error(data.message || "Failed to initiate MarzPay collection");
  }

  return data;
}

type DisbursementProps = {
  amount: number;
  phoneNumber: string;
  reference: string;
  description: string;
};

/**
 * 2. Send Money (Withdrawal/Disbursement)
 * Pushes funds from your MarzPay business wallet to the user's mobile money.
 */
export async function sendMoney({ amount, phoneNumber, reference, description }: DisbursementProps) {
  const response = await fetch(`${BASE_URL}/send-money`, {
    method: "POST",
    headers: {
      "Authorization": getAuthHeader(),
      "Content-Type": "application/json",
      "Accept": "application/json",
    },
    body: JSON.stringify({
      amount: amount,
      phone_number: phoneNumber,
      country: "UG",
      reference: reference,
      description: description,
      callback_url: `${APP_URL}/api/webhooks/marzpay`,
    }),
  });

  const data = await response.json();

  if (!response.ok || data.status === "error") {
    throw new Error(data.message || "Failed to send money via MarzPay");
  }

  return data;
}
