// app/history/page.tsx
"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import { ArrowLeft, Lock, Calendar, History as HistoryIcon } from "lucide-react";

type HistoryItem = {
  id: string;
  gameType: string;
  opponent: string;
  stakeAmount: number;
  payout: number;
  won: boolean;
  status: string;
  date: string;
};

export default function HistoryPage() {
  const { user, loading: authLoading, openAuthModal } = useAuth();
  const [games, setGames] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "won" | "lost" | "pending">("all");

  const fetchHistory = useCallback(async () => {
    if (!user) return;
    try {
      const token = await user.getIdToken();
      const res = await fetch("/api/history", {
        headers: { "Authorization": `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) {
        setGames(data.history);
      } else {
        throw new Error(data.error);
      }
    } catch (err) {
      toast.error("Failed to load match ledger.");
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (!authLoading && user) fetchHistory();
    else if (!authLoading && !user) setLoading(false);
  }, [user, authLoading, fetchHistory]);

  if (authLoading || (loading && user)) {
    return (
      <div className="w-full max-w-2xl mx-auto p-4 animate-pulse space-y-6 mt-6">
        <div className="h-10 bg-slate-200 w-1/3 rounded-lg"></div>
        <div className="h-12 bg-slate-100 w-full rounded-xl"></div>
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-20 bg-slate-50 rounded-2xl"></div>
          ))}
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] text-center px-4">
        <div className="w-16 h-16 bg-blue-50 flex items-center justify-center mb-6 rounded-2xl">
          <Lock size={28} className="text-blue-600" />
        </div>
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Access Restricted</h1>
        <p className="text-slate-500 font-medium mt-2 max-w-sm">
          Please authenticate to view your full match ledger.
        </p>
        <button 
          onClick={openAuthModal}
          className="mt-8 bg-slate-900 text-white font-semibold text-sm px-8 py-4 rounded-xl hover:bg-slate-800 transition-colors shadow-md active:scale-95"
        >
          Secure Login
        </button>
      </div>
    );
  }

  // Apply filters
  const filteredGames = games.filter(game => {
    if (filter === "all") return true;
    if (filter === "pending") return game.status === "open";
    if (filter === "won") return game.status === "played" && game.won;
    if (filter === "lost") return game.status === "played" && !game.won;
    return true;
  });

  return (
    <div className="w-full max-w-2xl mx-auto mt-6 pb-16 px-4 md:px-0">
      
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <Link href="/dashboard" className="flex items-center gap-1.5 text-slate-500 hover:text-slate-900 transition-colors font-semibold text-sm bg-white border border-slate-200 px-3 py-2 rounded-lg shadow-sm">
          <ArrowLeft size={16} /> Back
        </Link>
      </div>

      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-3">
          <HistoryIcon size={28} className="text-blue-600" />
          Match Ledger
        </h1>
        <p className="text-sm text-slate-500 font-medium mt-1">
          A complete, immutable record of your arena activity.
        </p>
      </div>

      {/* Quick Filters */}
      <div className="flex gap-2 overflow-x-auto hide-scrollbar pb-4 mb-2">
        {[
          { id: "all", label: "All Matches" },
          { id: "won", label: "Wins" },
          { id: "lost", label: "Losses" },
          { id: "pending", label: "Pending" }
        ].map((f) => (
          <button
            key={f.id}
            onClick={() => setFilter(f.id as any)}
            className={`whitespace-nowrap px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors border ${
              filter === f.id 
                ? "bg-slate-900 text-white border-slate-900" 
                : "bg-white text-slate-600 border-slate-200 hover:border-slate-300 hover:bg-slate-50"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Ledger List */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
        <div className="divide-y divide-slate-100">
          {filteredGames.length === 0 ? (
            <div className="p-12 text-center flex flex-col items-center">
              <Calendar size={32} className="text-slate-300 mb-3" />
              <p className="text-sm font-medium text-slate-400">
                No activity found for this filter.
              </p>
            </div>
          ) : (
            filteredGames.map((game) => (
              <Link 
                href={game.status === "open" ? `/games/${game.id}` : `/verify/${game.id}`} 
                key={game.id} 
                className="flex items-center justify-between p-4 md:p-5 hover:bg-slate-50 transition-colors block group"
              >
                <div className="flex items-center gap-4">
                  <div className={`w-2.5 h-2.5 rounded-full shrink-0 ${
                    game.status === "open" ? 'bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]' : 
                    game.won ? 'bg-emerald-500' : 'bg-rose-500'
                  }`}></div>
                  <div>
                    <p className="font-bold text-sm text-slate-900 capitalize flex items-center gap-2">
                      {game.gameType.replace("_", " ")}
                    </p>
                    <p className="text-xs text-slate-500 font-medium mt-0.5">
                      {game.status === "open" ? "Awaiting Challenger" : `vs. ${game.opponent}`} • {new Date(game.date).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                
                <div className="text-right">
                  {game.status === "open" ? (
                    <div>
                      <span className="text-[10px] font-bold text-blue-500 uppercase tracking-widest bg-blue-50 px-2 py-1 rounded-md border border-blue-100">Open</span>
                      <p className="text-xs font-bold text-slate-500 mt-1">Staked: {game.stakeAmount.toLocaleString()} UGX</p>
                    </div>
                  ) : (
                    <>
                      <p className={`font-extrabold text-sm md:text-base ${game.won ? 'text-emerald-600' : 'text-slate-900'}`}>
                        {game.payout > 0 ? '+' : ''}{game.payout.toLocaleString()} <span className="text-[10px] text-slate-400 font-bold">UGX</span>
                      </p>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5 group-hover:text-blue-600 transition-colors">
                        View Receipt
                      </p>
                    </>
                  )}
                </div>
              </Link>
            ))
          )}
        </div>
      </div>

    </div>
  );
}
