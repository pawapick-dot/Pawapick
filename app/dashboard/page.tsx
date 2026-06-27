// app/dashboard/page.tsx
"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import { 
  Plus, 
  LayoutGrid, 
  Wallet,
  ChevronRight,
  Lock,
  Flame,
  ShieldCheck,
  ArrowRight
} from "lucide-react";

type RecentGame = {
  id: string;
  gameType: string;
  opponent: string;
  stakeAmount: number;
  payout: number;
  won: boolean;
  choice: string;
};

export default function Dashboard() {
  const { user, loading: authLoading, openAuthModal } = useAuth();

  const [stats, setStats] = useState({
    winRate: 0,
    totalMatches: 0,
    activeEscrows: 0,
    wins: 0,
    recentGames: [] as RecentGame[]
  });
  const [isFetchingStats, setIsFetchingStats] = useState(true);

  // Simulated Streak (To be connected to backend later)
  const loginStreak = 3; 

  const fetchDashboardStats = useCallback(async () => {
    if (!user) return;
    try {
      const token = await user.getIdToken();
      const res = await fetch("/api/dashboard", {
        headers: { "Authorization": `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) {
        setStats(data);
      }
    } catch (err) {
      toast.error("Failed to sync dashboard data.");
    } finally {
      setIsFetchingStats(false);
    }
  }, [user]);

  useEffect(() => {
    if (!authLoading && user) fetchDashboardStats();
    else if (!authLoading && !user) setIsFetchingStats(false);
  }, [user, authLoading, fetchDashboardStats]);

  if (authLoading || (isFetchingStats && user)) {
    return (
      <div className="w-full max-w-2xl mx-auto p-4 animate-pulse space-y-8 mt-6">
        <div className="h-10 bg-slate-200 w-1/3 rounded-lg mb-8"></div>
        <div className="h-24 bg-slate-100 w-full rounded-2xl"></div>
        <div className="grid grid-cols-2 gap-4">
          <div className="h-32 bg-blue-50 rounded-2xl"></div>
          <div className="h-32 bg-slate-50 rounded-2xl"></div>
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
          Please authenticate to view your dashboard and manage your funds.
        </p>
        <button 
          onClick={openAuthModal}
          className="mt-8 bg-slate-900 text-white font-semibold text-sm px-8 py-4 rounded-xl hover:bg-slate-800 transition-colors"
        >
          Secure Login
        </button>
      </div>
    );
  }

  // Filter games the user created (where the opponent is marked as "Challenger" by the API)
  const myCreatedChallenges = stats.recentGames.filter(g => g.opponent === "Challenger");

  return (
    <div className="w-full max-w-2xl mx-auto mt-6 pb-16 overflow-hidden md:overflow-visible">

      {/* Greeting */}
      <div className="px-4">
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
          Welcome back, {user.displayName?.split(" ")[0] || "Analyst"}!
        </h1>
        <p className="text-sm text-slate-500 font-medium mt-1">
          Here is what's happening with your account today.
        </p>
      </div>

      {/* Edge-to-Edge Wallet Banner */}
      <div className="mt-8 -mx-4 md:mx-0 px-6 py-5 bg-slate-900 md:rounded-2xl flex items-center justify-between group cursor-pointer" onClick={() => window.location.href = '/wallet'}>
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center">
            <Wallet size={20} className="text-white" />
          </div>
          <div>
            <p className="text-white font-semibold">Jump to Wallet</p>
            <p className="text-slate-400 text-xs font-medium mt-0.5">Manage funds & withdraw earnings</p>
          </div>
        </div>
        <ChevronRight size={20} className="text-slate-500 group-hover:text-white transition-colors" />
      </div>

      {/* Next Challenge Prompts */}
      <div className="mt-10 px-4 md:px-0">
        <h3 className="text-sm font-bold text-slate-900 mb-4">Ready for your next challenge?</h3>
        
        <div className="grid grid-cols-2 gap-3 md:gap-4">
          {/* Create Challenge (Light Blue) */}
          <Link href="/create" className="bg-blue-50 border border-blue-100 rounded-2xl p-5 hover:border-blue-300 transition-colors group flex flex-col justify-between aspect-square md:aspect-auto md:h-40">
            <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-sm text-blue-600 mb-3">
              <Plus size={18} />
            </div>
            <div>
              <p className="font-bold text-slate-900 text-sm">Create a challenge</p>
              <p className="text-[11px] text-slate-500 font-medium mt-1 leading-relaxed hidden sm:block">Set your stake and lock in your prediction.</p>
            </div>
            <div className="mt-4 flex justify-end">
              <ArrowRight size={18} className="text-blue-600 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

          {/* View Live Challenges (Light Gray) */}
          <Link href="/feed" className="bg-slate-50 border border-slate-200 rounded-2xl p-5 hover:border-slate-300 transition-colors group flex flex-col justify-between aspect-square md:aspect-auto md:h-40">
            <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-sm text-slate-600 mb-3">
              <LayoutGrid size={18} />
            </div>
            <div>
              <p className="font-bold text-slate-900 text-sm">Live challenges</p>
              <p className="text-[11px] text-slate-500 font-medium mt-1 leading-relaxed hidden sm:block">Browse open markets and compete instantly.</p>
            </div>
            <div className="mt-4 flex justify-end">
              <ArrowRight size={18} className="text-slate-600 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>
        </div>
      </div>

      {/* Streak Counter */}
      <div className="mt-8 px-4 md:px-0">
        <div className="bg-orange-50 border border-orange-100 rounded-2xl p-4 flex items-center gap-4">
          <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-orange-500 shadow-sm shrink-0">
            <Flame size={20} />
          </div>
          <div>
            <p className="text-orange-900 font-bold text-sm">Keep your streak running!</p>
            <p className="text-orange-700/80 text-xs font-medium mt-0.5">You have logged in for {loginStreak} consecutive days.</p>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="mt-10 px-4 md:px-0">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold text-slate-900">Recent Activity</h3>
          <Link href="/history" className="text-xs font-bold text-blue-600 hover:text-blue-800 transition-colors flex items-center">
            View All <ChevronRight size={14} className="ml-0.5" />
          </Link>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
          <div className="divide-y divide-slate-100">
            {stats.recentGames.length === 0 ? (
              <div className="p-8 text-center text-xs font-medium text-slate-400">
                No recent activity. Play a game to see your history here.
              </div>
            ) : (
              stats.recentGames.slice(0, 5).map((game) => (
                <Link href={`/verify/${game.id}`} key={game.id} className="flex items-center justify-between p-4 hover:bg-slate-50 transition-colors block">
                  <div className="flex items-center gap-3">
                    <div className={`w-2 h-2 rounded-full ${game.won ? 'bg-emerald-500' : 'bg-rose-500'}`}></div>
                    <div>
                      <p className="font-semibold text-sm text-slate-900 capitalize">{game.gameType.replace("_", " ")}</p>
                      <p className="text-[11px] text-slate-500 font-medium mt-0.5">
                        vs. {game.opponent}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`font-bold text-sm ${game.won ? 'text-emerald-600' : 'text-slate-900'}`}>
                      {game.payout > 0 ? '+' : ''}{game.payout.toLocaleString()} <span className="text-[10px] text-slate-400 font-medium">UGX</span>
                    </p>
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Challenges You Have Created */}
      <div className="mt-10 px-4 md:px-0">
        <h3 className="text-sm font-bold text-slate-900 mb-4">Challenges you have created</h3>
        
        {myCreatedChallenges.length === 0 ? (
          <div className="bg-slate-50 border border-slate-200 border-dashed rounded-2xl p-6 text-center">
            <p className="text-slate-500 text-sm font-medium mb-4">You don't have any active challenges.</p>
            <Link href="/create" className="inline-block bg-white border border-slate-200 text-slate-900 font-semibold text-sm px-5 py-2.5 rounded-lg hover:border-slate-300 transition-colors shadow-sm">
              Create your first challenge for as low as 1,000 UGX
            </Link>
          </div>
        ) : (
          <div className="space-y-2">
            {myCreatedChallenges.map((game) => (
              <div key={game.id} className="bg-white border border-slate-200 rounded-xl p-4 flex items-center justify-between">
                <div>
                  <p className="font-semibold text-sm text-slate-900 capitalize">{game.gameType.replace("_", " ")}</p>
                  <p className="text-xs text-slate-500 mt-0.5">Stake: {game.stakeAmount.toLocaleString()} UGX</p>
                </div>
                <Link href={`/verify/${game.id}`} className="text-blue-600 text-xs font-bold bg-blue-50 px-3 py-1.5 rounded-lg hover:bg-blue-100 transition-colors">
                  View Receipt
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer Trust Marker */}
      <div className="mt-12 text-center flex items-center justify-center gap-1.5 text-slate-400">
        <ShieldCheck size={14} />
        <span className="text-xs font-medium uppercase tracking-widest">Every game is verified</span>
      </div>

    </div>
  );
}
