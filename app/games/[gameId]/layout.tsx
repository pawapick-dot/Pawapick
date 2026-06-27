// app/games/[gameId]/layout.tsx
import { Metadata } from "next";
import { db } from "@/lib/firebase-admin";

// 1. Dynamic Metadata Generator (Runs on the Server)
export async function generateMetadata({ 
  params 
}: { 
  params: { gameId: string } 
}): Promise<Metadata> {
  try {
    const gameDoc = await db.collection("games").doc(params.gameId).get();

    // Fallback if the game doesn't exist
    if (!gameDoc.exists) {
      return {
        title: "Market Not Found | Pawa Pick",
        description: "This prediction market may have been resolved or does not exist.",
      };
    }

    const game = gameDoc.data()!;
    const gameName = game.gameType.replace("_", " ").replace(/\b\w/g, l => l.toUpperCase());
    const prize = (game.stakeAmount * 2 * 0.9).toLocaleString();

    // Format the text that will appear in WhatsApp, iMessage, and Twitter
    const title = `${game.creatorUsername}'s ${gameName} Challenge`;
    const description = `Can you outsmart ${game.creatorUsername}? Accept the challenge to win ${prize} UGX instantly on Pawa Pick!`;

    return {
      title,
      description,
      openGraph: {
        title,
        description,
        siteName: "Pawa Pick",
        type: "website",
        // OPTIONAL: If you design a nice 1200x630 banner image for your platform, 
        // put it in the /public folder and uncomment this section:
        /*
        images: [
          {
            url: "/social-banner.jpg", // e.g., your domain + /social-banner.jpg
            width: 1200,
            height: 630,
            alt: "Pawa Pick Prediction Network",
          }
        ],
        */
      },
      twitter: {
        card: "summary_large_image",
        title,
        description,
      },
    };
  } catch (error) {
    // Failsafe metadata if database fetch fails
    return {
      title: "Pawa Pick | Live Challenge",
      description: "Test your intuition against real people and win instant UGX.",
    };
  }
}

// 2. The Layout Wrapper
export default function GameLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
