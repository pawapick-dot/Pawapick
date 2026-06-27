// app/dashboard/page.tsx
"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import { 
  TrendingUp, 
  Swords, 
  Clock, 
  History, 
  LayoutGrid, 
  PlusSquare, 
  Wallet,
  ChevronRight,
  Lock,
  Activity
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
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);
  
  const [stats, setStats] = useState({
    winRate: 0,
    totalMatches: 0,
    activeEscrows: 0,
    wins: 0,
    recentGames: [] as RecentGame[]
  });
  const [isFetchingStats, setIsFetchingStats] = useState(true);

  // Fetch live stats
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
      toast.error("Failed to sync arena telemetry.");
    } finally {
      setIsFetchingStats(false);
    }
  }, [user]);

  useEffect(() => {
    if (!authLoading && user) {
      fetchDashboardStats();
    } else if (!authLoading && !user) {
      setIsFetchingStats(false);
    }
  }, [user, authLoading, fetchDashboardStats]);

  // Auto-scrolling logic for the mobile swiper
  useEffect(() => {
    const el = scrollRef.current;
    if (!el || isHovered || isFetchingStats || !user) return;

    let animationFrameId: number;
    let direction = 1;

    const scroll = () => {
      if (el.scrollWidth > el.clientWidth) {
        if (el.scrollLeft + el.clientWidth >= el.scrollWidth - 1) direction = -1;
        if (el.scrollLeft <= 0) direction = 1;
        el.scrollLeft += direction * 0.5;
      }
      animationFrameId = requestAnimationFrame(scroll);
    };

    animationFrameId = requestAnimationFrame(scroll);
    return () => cancelAnimationFrame(animationFrameId);
  }, [isHovered, isFetchingStats, user]);

  // Loading State
  if (authLoading || (isFetchingStats && user)) {
    return (
      <div className="w-full max-w-7xl mx-auto p-4 animate-pulse space-y-8 mt-6">
        <div className="h-12 bg-gray-200 w-1/3 rounded-none"></div>
        <div className="grid grid-cols-4 gap-8">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-32 bg-gray-100 rounded-none border-2 border-gray-200"></div>
          ))}
        </div>
      </div>
    );
  }

  // Secured Locked State
  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] text-center px-4">
        <div className="w-20 h-20 bg-gray-900 flex items-center justify-center mb-6 rounded-none shadow-[8px_8px_0px_0px_rgba(250,204,21,1)] border-2 border-black">
          <Lock size={32} className="text-yellow-400" />
        </div>
        <h1 className="text-4xl font-black text-gray-900 tracking-tight uppercase">Arena Locked</h1>
        <p className="text-gray-500 font-medium mt-3 max-w-sm">
          You must authenticate your identity to access the command center and view your escrow statistics.
        </p>
        <button 
          onClick={openAuthModal}
          className="mt-8 bg-yellow-400 text-black font-black uppercase tracking-widest text-sm px-10 py-5 rounded-none border-2 border-black hover:bg-yellow-500 hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:translate-y-1 active:shadow-none transition-all"
        >
          Verify Identity
        </button>
      </div>
    );
  }

  return (
    <div className="w-full max-w-7xl mx-auto space-y-10 mt-6 pb-12">
      
      {/* Welcome Header */}
      <div className="px-4 border-l-4 border-yellow-400 pl-4">
        <h1 className="text-3xl font-black text-gray-900 tracking-tighter uppercase">
          {user.displayName ? `Agent ${user.displayName}` : "Command Center"}
        </h1>
        <p className="text-sm text-gray-500 font-medium tracking-wide mt-1">
          SYSTEM STATUS: <span className="text-green-600 font-bold">ONLINE</span>
        </p>
      </div>

      {/* Top Stats: Swiper (Mobile) / Max-4 Bento Grid (Desktop) */}
      <div 
        ref={scrollRef}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onTouchStart={() => setIsHovered(true)}
        onTouchEnd={() => setIsHovered(false)}
        className="flex gap-4 overflow-x-auto hide-scrollbar px-4 md:grid md:grid-cols-4 md:gap-8 md:overflow-visible"
      >
        <div className="min-w-[160px] bg-gray-50 border-2 border-gray-200 rounded-none p-6 flex-1 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition">
            <TrendingUp size={48} className="text-black" />
          </div>
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Win Rate</p>
          <p className="text-4xl font-black text-gray-900 mt-2">{stats.winRate}%</p>
        </div>

        <div className="min-w-[160px] bg-gray-50 border-2 border-gray-200 rounded-none p-6 flex-1 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition">
            <Swords size={48} className="text-black" />
          </div>
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Matches</p>
          <p className="text-4xl font-black text-gray-900 mt-2">{stats.totalMatches}</p>
        </div>

        <div className="min-w-[160px] bg-gray-50 border-2 border-gray-200 rounded-none p-6 flex-1 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition">
            <Clock size={48} className="text-black" />
          </div>
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Active Escrow</p>
          <p className="text-4xl font-black text-gray-900 mt-2">{stats.activeEscrows}</p>
        </div>

        <div className="min-w-[160px] bg-gray-900 border-2 border-black rounded-none p-6 flex-1 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition">
            <Activity size={48} className="text-yellow-400" />
          </div>
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Global Rank</p>
          <p className="text-4xl font-black text-yellow-400 mt-2">
            #{Math.max(1, 1000 - stats.wins * 5)}
          </p>
        </div>
      </div>

      {/* Quick Links Grid */}
      <div className="px-4">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-2 h-2 bg-yellow-400"></div>
          <h3 className="text-[11px] font-black text-gray-400 uppercase tracking-widest">Operations</h3>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8">
          <Link href="/feed" className="bg-white border-2 border-gray-200 rounded-none p-6 hover:border-black hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:translate-y-1 active:shadow-none transition-all group flex flex-col justify-between aspect-square">
            <LayoutGrid size={28} className="text-gray-400 group-hover:text-black transition" />
            <div>
              <p className="font-black text-gray-900 uppercase tracking-wide">Live Feed</p>
              <p className="text-[10px] font-bold text-gray-400 uppercase">Find Matches</p>
            </div>
          </Link>

          <Link href="/create" className="bg-white border-2 border-gray-200 rounded-none p-6 hover:border-black hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:translate-y-1 active:shadow-none transition-all group flex flex-col justify-between aspect-square">
            <PlusSquare size={28} className="text-gray-400 group-hover:text-black transition" />
            <div>
              <p className="font-black text-gray-900 uppercase tracking-wide">Create</p>
              <p className="text-[10px] font-bold text-gray-400 uppercase">Set a Trap</p>
            </div>
          </Link>

          <Link href="/wallet" className="bg-yellow-400 border-2 border-black rounded-none p-6 hover:bg-yellow-500 hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:translate-y-1 active:shadow-none transition-all group flex flex-col justify-between aspect-square">
            <Wallet size={28} className="text-black" />
            <div>
              <p className="font-black text-black uppercase tracking-wide">Wallet</p>
              <p className="text-[10px] font-bold text-gray-800 uppercase">Manage Funds</p>
            </div>
          </Link>

          <Link href="#" className="bg-gray-50 border-2 border-gray-200 rounded-none p-6 opacity-60 flex flex-col justify-between aspect-square cursor-not-allowed">
            <History size={28} className="text-gray-400" />
            <div>
              <p className="font-black text-gray-900 uppercase tracking-wide">History</p>
              <p className="text-[10px] font-bold text-gray-400 uppercase">Full Ledger</p>
            </div>
          </Link>
        </div>
      </div>

      {/* Recent Activity List */}
      <div className="px-4">
        <div className="bg-white border-2 border-gray-200 rounded-none">
          <div className="flex items-center justify-between p-5 border-b-2 border-gray-200 bg-gray-50">
            <span className="font-black text-gray-900 uppercase tracking-wider text-sm">Recent Conflicts</span>
            <Link href="/wallet" className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center hover:text-black transition">
              View Ledger <ChevronRight size={14} />
            </Link>
          </div>
          
          <div className="divide-y-2 divide-gray-100">
            {stats.recentGames.length === 0 ? (
              <div className="p-8 text-center text-[10px] font-black tracking-widest text-gray-400 uppercase">
                No recent combat data found.
              </div>
            ) : (
              stats.recentGames.map((game) => (
                <Link href={`/verify/${game.id}`} key={game.id} className="flex items-center justify-between p-5 hover:bg-gray-50 transition block">
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 flex items-center justify-center border-2 rounded-none ${
                      game.won ? 'bg-green-50 border-green-200 text-green-600' : 'bg-red-50 border-red-200 text-red-600'
                    }`}>
                      <span className="font-black text-[10px] tracking-widest">
                        {game.won ? 'WIN' : 'LOSS'}
                      </span>
                    </div>
                    <div>
                      <p className="font-bold text-sm text-gray-900 uppercase tracking-wide">{game.gameType.replace("_", " ")}</p>
                      <p className="text-[10px] font-bold text-gray-400 uppercase">
                        Target: {game.choice} • vs. {game.opponent}
                      </p>
                    </div>
                  </div>
                  <p className="font-black text-gray-900">
                    {game.payout > 0 ? '+' : ''}{game.payout.toLocaleString()} <span className="text-[10px] text-gray-400">UGX</span>
                  </p>
                </Link>
              ))
            )}
          </div>
        </div>
      </div>

    </div>
  );
}
