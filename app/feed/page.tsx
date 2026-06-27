// app/feed/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Filter } from "lucide-react";

type FeedGame = {
  id: string;
  creatorUsername: string;
  gameType: string;
  stakeAmount: number;
  createdAt: string;
};

export default function GlobalFeed() {
  const router = useRouter();
  const [games, setGames] = useState<FeedGame[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [filter, setFilter] = useState<string>("all");

  useEffect(() => {
    fetch("/api/games/feed")
      .then((res) => res.json())
      .then((data) => {
        if (data.games) setGames(data.games);
      })
      .catch(() => toast.error("Failed to load feed"))
      .finally(() => setLoading(false));
  }, []);

  const filteredGames = filter === "all" 
    ? games 
    : games.filter((g) => g.gameType === filter);

  const filters = [
    { id: "all", label: "All" },
    { id: "penalty", label: "Penalty" },
    { id: "color", label: "Colors" },
    { id: "shuffle", label: "Shuffle" },
    { id: "dice", label: "Dice" },
  ];

  return (
    <div className="w-full space-y-6 mt-4 pb-12">
      {/* Header & Filter Bar */}
      <div className="max-w-md mx-auto px-2 space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-extrabold tracking-tight text-gray-900">Live Feed</h1>
          <Filter size={20} className="text-gray-400" />
        </div>

        {/* Mobile Swiper for Filters */}
        <div className="flex gap-2 overflow-x-auto hide-scrollbar pb-2">
          {filters.map((f) => (
            <button
              key={f.id}
              onClick={() => setFilter(f.id)}
              className={`whitespace-nowrap px-5 py-2 rounded-full text-sm font-bold transition active:scale-95 ${
                filter === f.id 
                  ? "bg-gray-900 text-white shadow-md" 
                  : "bg-white text-gray-500 border border-gray-200 hover:bg-gray-50"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Game Grid / List */}
      <div className="px-2">
        {loading ? (
          <div className="max-w-md mx-auto text-center py-12">
            <p className="text-gray-400 font-medium animate-pulse">Scanning network for challenges...</p>
          </div>
        ) : filteredGames.length === 0 ? (
          <div className="max-w-md mx-auto bg-white border border-gray-100 rounded-3xl p-8 text-center shadow-sm">
            <p className="text-gray-500 font-medium">No open challenges match this filter.</p>
            <button 
              onClick={() => router.push("/create")} 
              className="mt-4 bg-gray-100 text-gray-900 font-bold px-6 py-3 rounded-xl border border-gray-200 active:scale-95 transition"
            >
              Create One Now
            </button>
          </div>
        ) : (
          /* Desktop Bento Grid (Max 4) & Mobile Stack */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8 max-w-7xl mx-auto">
            {filteredGames.map((game) => (
              <div 
                key={game.id} 
                onClick={() => router.push(`/games/${game.id}`)}
                className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm flex flex-col justify-between active:scale-[0.98] transition cursor-pointer hover:shadow-md"
              >
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest bg-gray-50 px-2 py-1 rounded-md">
                      {game.gameType.replace("_", " ")}
                    </span>
                    <h3 className="text-lg font-bold text-gray-900 mt-2">{game.creatorUsername}</h3>
                  </div>
                </div>
                
                <div className="border-t border-gray-50 pt-4 flex justify-between items-end">
                  <span className="text-xs text-gray-400 font-semibold uppercase tracking-wider">Stake Amount</span>
                  <div className="text-right">
                    <p className="text-2xl font-black text-gray-900">{game.stakeAmount.toLocaleString()}</p>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">UGX</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
