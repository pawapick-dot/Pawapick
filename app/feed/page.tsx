// app/feed/page.tsx
"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { RefreshCw, ArrowRight, ShieldCheck, Hourglass } from "lucide-react";

type FeedGame = {
  id: string;
  creatorUsername: string;
  gameType: string;
  stakeAmount: number;
  createdAt: string;
  status: string;
};

export default function GlobalFeed() {
  const [games, setGames] = useState<FeedGame[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [filter, setFilter] = useState<string>("all");

  const fetchGames = useCallback(async (isRefresh = false) => {
    if (isRefresh) setIsRefreshing(true);
    try {
      const res = await fetch("/api/games/feed");
      const data = await res.json();
      if (data.games) {
        // Only show open games
        setGames(data.games.filter((g: any) => g.status === "open"));
      }
    } catch (err) {
      toast.error("Failed to load live markets");
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchGames();
  }, [fetchGames]);

  const filteredGames = filter === "all" 
    ? games 
    : games.filter((g) => g.gameType === filter);

  // Helper to calculate time ago
  const getTimeAgo = (dateString: string) => {
    const diffInSeconds = Math.floor((new Date().getTime() - new Date(dateString).getTime()) / 1000);
    if (diffInSeconds < 60) return `${diffInSeconds}s ago`;
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    return `${Math.floor(diffInSeconds / 86400)}d ago`;
  };

  // Helper for dynamic card styling based on game type
  const getCardStyle = (type: string) => {
    switch (type) {
      case "penalty":
        return "bg-emerald-50 border-emerald-200 hover:bg-emerald-100 hover:border-emerald-300";
      case "shuffle":
        return "bg-orange-50 border-orange-200 hover:bg-orange-100 hover:border-orange-300";
      case "color":
      default:
        return "bg-slate-50 border-slate-200 hover:bg-slate-100 hover:border-slate-300";
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto space-y-6 mt-6 md:mt-10 pb-16">
      
      {/* Header & Refresh */}
      <div className="px-4 flex items-start justify-between">
        <div>
          <h1 className="text-[2rem] md:text-4xl font-extrabold tracking-tight leading-[1.1]">
            <span className="text-blue-600">{games.length > 0 ? `${games.length}+` : '0'}</span><br className="md:hidden" /> 
            <span className="text-slate-900"> Live challenges</span>
          </h1>
        </div>
        <button 
          onClick={() => fetchGames(true)}
          disabled={isRefreshing}
          className="p-3 bg-blue-50 text-blue-600 rounded-xl border border-blue-100 hover:bg-blue-100 transition-colors shrink-0 disabled:opacity-50"
        >
          <RefreshCw size={20} className={isRefreshing ? "animate-spin" : ""} />
        </button>
      </div>

      {/* Quick Filters (2x2 Grid on Mobile, Row on Desktop) */}
      <div className="px-4 mt-6">
        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Quick Filter</p>
        <div className="grid grid-cols-2 md:flex gap-2 md:gap-3">
          {[
            { id: "all", label: "All" },
            { id: "shuffle", label: "Shuffle" },
            { id: "penalty", label: "Penalty" },
            { id: "color", label: "Color Minefield" }
          ].map((f) => (
            <button
              key={f.id}
              onClick={() => setFilter(f.id)}
              className={`px-4 py-3 rounded-xl text-sm font-semibold transition-colors border ${
                filter === f.id 
                  ? "bg-slate-900 text-white border-slate-900" 
                  : "bg-white text-slate-600 border-slate-200 hover:border-slate-300 hover:bg-slate-50"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Game Cards / Feed */}
      <div className="mt-8 md:mt-10 px-4">
        {loading ? (
          <div className="py-12 text-center text-slate-400 font-medium animate-pulse">
            Scanning network...
          </div>
        ) : filteredGames.length === 0 ? (
          <div className="py-12 text-center">
            <p className="text-slate-500 font-medium">
              No active challenges right now.<br/> 
              Check back later or <Link href="/create" className="text-blue-600 font-semibold underline decoration-blue-200 underline-offset-4 hover:decoration-blue-600 transition-colors">create a challenge</Link>.
            </p>
          </div>
        ) : (
          /* Grid for desktop, stacked list for mobile */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredGames.map((game) => {
              const prize = game.stakeAmount * 2 * 0.9;
              const cardTheme = getCardStyle(game.gameType);
              
              return (
                <Link 
                  href={`/games/${game.id}`}
                  key={game.id} 
                  className={`block border-2 rounded-xl p-5 transition-colors group ${cardTheme}`}
                >
                  {/* Top: Name & Time */}
                  <div className="flex justify-between items-start mb-5">
                    <div>
                      <h3 className="font-bold text-slate-900 text-base capitalize">{game.gameType.replace("_", " ")}</h3>
                      <p className="text-xs text-slate-600 mt-1">Created by <span className="font-bold text-slate-900">{game.creatorUsername}</span></p>
                    </div>
                    <div className="flex items-center gap-1 text-xs font-semibold text-slate-500 bg-white/60 px-2 py-1 rounded-md border border-white/50">
                      <Hourglass size={12} />
                      {getTimeAgo(game.createdAt)}
                    </div>
                  </div>

                  {/* Middle: Structured Credit-Card Style Stats (Inner Box) */}
                  <div className="bg-white/60 border border-white/50 rounded-xl p-4 flex justify-between items-center mb-5 backdrop-blur-sm shadow-sm">
                    <div>
                      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-0.5">Stake</p>
                      <p className="font-extrabold text-slate-900 text-lg">{game.stakeAmount.toLocaleString()}</p>
                    </div>
                    <div className="w-px h-8 bg-slate-300/50"></div>
                    <div className="text-right">
                      <p className="text-[10px] font-bold text-blue-600 uppercase tracking-widest mb-0.5">Prize</p>
                      <p className="font-extrabold text-blue-700 text-lg">{prize.toLocaleString()}</p>
                    </div>
                  </div>

                  {/* Bottom: Action Link */}
                  <div className="flex justify-between items-center text-sm font-bold text-slate-900">
                    <span>View details</span>
                    <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>

      {/* Footer Markers */}
      <div className="text-center mt-12 pb-6">
        <div className="flex items-center justify-center gap-1.5 text-slate-400 mb-1.5">
          <ShieldCheck size={16} />
          <span className="text-xs font-bold uppercase tracking-widest text-slate-400">SHA 256 Verified</span>
        </div>
        <p className="text-xs font-medium text-slate-400">Every game counts</p>
      </div>

    </div>
  );
}
