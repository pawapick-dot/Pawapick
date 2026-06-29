// app/api/referrals/route.ts
import { db } from "@/lib/firebase-admin";
import { verifyToken } from "@/lib/verify-token";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const uid = await verifyToken(request);
    if (!uid) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    // 1. Get Logged-in User's Data
    const userDoc = await db.collection("users").doc(uid).get();
    const userData = userDoc.data() || {};
    const myCode = userData.referralCode || "SYNCING...";

    // 2. Calculate Personal Stats
    // Friends who signed up using the code
    const referralsSnap = await db.collection("users").where("referredBy", "==", myCode).get();
    const totalInvited = referralsSnap.size;

    // Actual bonuses paid out (transactions)
    const bonusesSnap = await db.collection("transactions")
      .where("uid", "==", uid)
      .where("type", "==", "referral_bonus")
      .get();
    
    const totalEarned = bonusesSnap.docs.reduce((sum, doc) => sum + (doc.data().amount || 0), 0);

    // 3. Generate the Leaderboard
    // Fetch all referral bonuses on the platform to rank the top earners
    const allBonusesSnap = await db.collection("transactions")
      .where("type", "==", "referral_bonus")
      .get();

    const earningsMap: Record<string, { uid: string, amount: number, count: number }> = {};
    
    allBonusesSnap.forEach(doc => {
      const tx = doc.data();
      if (!earningsMap[tx.uid]) {
        earningsMap[tx.uid] = { uid: tx.uid, amount: 0, count: 0 };
      }
      earningsMap[tx.uid].amount += (tx.amount || 0);
      earningsMap[tx.uid].count += 1;
    });

    // Sort by amount descending and slice the top 10
    const topEarners = Object.values(earningsMap)
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 10);

    // Fetch display names for the leaderboard
    const leaderboard = await Promise.all(
      topEarners.map(async (earner) => {
        const earnerDoc = await db.collection("users").doc(earner.uid).get();
        return {
          name: earnerDoc.data()?.displayName || "Anonymous Player",
          amount: earner.amount,
          invites: earner.count,
          isMe: earner.uid === uid
        };
      })
    );

    return NextResponse.json({
      personalStats: { code: myCode, totalInvited, totalEarned },
      leaderboard
    });

  } catch (error: any) {
    console.error("Referrals API Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
