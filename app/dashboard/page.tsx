// app/dashboard/page.tsx (Updated)
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

// Define the type for our safe game data
type FeedGame = {
  id: string;
  creatorUsername: string;
  gameType: string;
  stakeAmount: number;
};

export default function Dashboard() {
  const router = useRouter();
  const [balance, setBalance] = useState<number>(0);
  const [games, setGames] = useState<FeedGame[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchDashboardData = async () => {
    try {
      const [walletRes, feedRes] = await Promise.all([
        fetch("/api/wallet"),
        fetch("/api/games/feed")
      ]);
      
      const walletData = await walletRes.json();
      const feedData = await feedRes.json();
      
      if (walletRes.ok) setBalance(walletData.balance);
      if (feedRes.ok) setGames(feedData.games);
    } catch (err) {
      toast.error("Failed to sync data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleMockDeposit = async () => {
    const depositAmount = 25000;
    toast.promise(
      fetch("/api/wallet", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: depositAmount }),
      }).then(async (res) => {
        const data = await res.json();
        if (!res.ok) throw new Error(data.error);
        setBalance(data.balance);
        return data;
      }),
      {
        loading: "Simulating Mobile Money load...",
        success: () => `+${depositAmount.toLocaleString()} UGX added.`,
        error: (err) => err.message,
      }
    );
  };

  return (
    <div className="max-w-md mx-auto space-y-6 mt-4 pb-12">
      {/* Header */}
      <div className="flex justify-between items-center px-2">
        <span className="text-xl font-bold tracking-tight">Pawa Pick</span>
        <button 
          onClick={() => router.push("/create")} 
          className="bg-gray-900 text-white text-xs font-bold px-4 py-2 rounded-full active:scale-95 transition"
        >
          + CREATE
        </button>
      </div>

      {/* Wallet Bento */}
      <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm space-y-4">
        <div>
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Available Balance</p>
          <h2 className="text-3xl font-bold tracking-tight mt-1">
            {loading ? "..." : `${balance.toLocaleString()} UGX`}
          </h2>
        </div>
        <button
          onClick={handleMockDeposit}
          className="w-full bg-gray-50 border border-gray-200 text-gray-900 font-medium py-3 rounded-xl hover:bg-gray-100 transition active:scale-[0.98]"
        >
          Add Mock Funds
        </button>
      </div>

      {/* Global Feed */}
      <div className="space-y-4 px-1">
        <h3 className="text-lg font-bold tracking-tight">Live Challenges</h3>
        
        {loading ? (
          <p className="text-sm text-gray-400 text-center py-8">Loading feed...</p>
        ) : games.length === 0 ? (
          <div className="border border-dashed border-gray-200 rounded-3xl p-8 text-center bg-gray-50/50">
            <p className="text-sm text-gray-400 font-medium">No open challenges right now.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {games.map((game) => (
              <div 
                key={game.id} 
                onClick={() => router.push(`/play/${game.id}`)}
                className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm flex items-center justify-between active:scale-[0.98] transition cursor-pointer"
              >
                <div>
                  <p className="text-xs text-gray-400 font-semibold mb-1 uppercase tracking-wider">{game.gameType.replace("_", " ")}</p>
                  <p className="text-sm font-bold text-gray-900">{game.creatorUsername}'s Challenge</p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-gray-900">{game.stakeAmount.toLocaleString()}</p>
                  <p className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">UGX</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
