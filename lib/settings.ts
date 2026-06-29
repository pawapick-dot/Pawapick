import { db } from "@/lib/firebase-admin";

export const DEFAULT_SETTINGS = {
  platformFee: 10,
  minDeposit: 500,
  minWithdrawal: 1000,
  games: { penalty: true, shuffle: true, color: true }
};

export async function getGlobalSettings() {
  try {
    const doc = await db.collection("system").doc("settings").get();
    if (doc.exists) {
      return { ...DEFAULT_SETTINGS, ...doc.data() };
    }
    return DEFAULT_SETTINGS;
  } catch (error) {
    return DEFAULT_SETTINGS;
  }
}
