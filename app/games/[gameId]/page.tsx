// app/games/[gameId]/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Share2, CheckCircle2, ArrowDown, ShieldCheck } from "lucide-react";
import { toast } from "sonner";

export default function GameDetails({ params }: { params: { gameId: string } }) {
  const router = useRouter();
  const [game, setGame] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/games/feed`)
      .then((res) => res.json())
      .then((data) => {
        const found = data.games?.find((g: any) => g.id === params.gameId);
        setGame(found);
      })
      .catch(() => toast.error("Failed to load match details"))
      .finally(() => setLoading(false));
  }, [params.gameId]);

  if (loading || !game) {
    return (
      <div className="w-full min-h-screen flex items-center justify-center">
        <p className="text-slate-400 font-medium animate-pulse">Loading market data...</p>
      </div>
    );
  }

  const totalPool = game.stakeAmount * 2;
  const potentialPayout = totalPool - (totalPool * 0.10);

  // Dynamic Theme & Content based on Game Type
  const getGameConfig = (type: string) => {
    switch (type) {
      case "penalty":
        return {
          title: "Penalty Shootout",
          desc: "Guess where the keeper will dive.",
          bg: "bg-emerald-50 border-emerald-100",
          text: "text-emerald-900",
        };
      case "shuffle":
        return {
          title: "Three Cup Shuffle",
          desc: "Find the hidden prize under the cups.",
          bg: "bg-orange-50 border-orange-100",
          text: "text-orange-900",
        };
      case "color":
      default:
        return {
          title: "Color Minefield",
          desc: "Pick the safe tile and avoid the trap.",
          bg: "bg-blue-50 border-blue-100",
          text: "text-blue-900",
        };
    }
  };

  const config = getGameConfig(game.gameType);

  // Time formatting
  const getTimeAgo = (dateString: string) => {
    const diffInSeconds = Math.floor((new Date().getTime() - new Date(dateString).getTime()) / 1000);
    if (diffInSeconds < 60) return `${diffInSeconds}s ago`;
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    return `${Math.floor(diffInSeconds / 86400)}d ago`;
  };

  // Native Web Share API for sharing
  const handleShare = async () => {
    const shareData = {
      title: `${game.creatorUsername}'s ${config.title} Challenge`,
      text: `Can you outsmart ${game.creatorUsername} in ${config.title}? Accept the challenge to win ${potentialPayout.toLocaleString()} UGX instantly!`,
      url: window.location.href,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(window.location.href);
        toast.success("Link copied to clipboard!");
      }
    } catch (err) {
      console.log("Share cancelled or failed.");
    }
  };

  return (
    // Note: pb-28 ensures content isn't hidden behind the fixed bottom bar
    <div className="w-full min-h-screen bg-white pb-28 flex flex-col">
      
      {/* Top Navigation */}
      <div className="flex items-center justify-between px-4 py-4 w-full max-w-2xl mx-auto">
        <button 
          onClick={() => router.push("/feed")} 
          className="flex items-center gap-1.5 text-slate-500 hover:text-slate-900 transition-colors font-semibold text-sm bg-slate-50 px-3 py-2 rounded-lg"
        >
          <ArrowLeft size={16} /> Back
        </button>
        <button 
          onClick={handleShare}
          className="flex items-center gap-1.5 text-blue-600 bg-blue-50 hover:bg-blue-100 transition-colors font-semibold text-sm px-3 py-2 rounded-lg"
        >
          Share <Share2 size={16} />
        </button>
      </div>

      {/* Edge-to-Edge Hero Section */}
      <div className={`w-full py-10 border-y ${config.bg}`}>
        <div className="max-w-2xl mx-auto px-4 text-center">
          <h1 className={`text-3xl font-extrabold tracking-tight capitalize ${config.text}`}>
            {config.title}
          </h1>
          <p className="text-slate-600 font-medium mt-2">{config.desc}</p>
          <div className="inline-block mt-4 bg-white/60 backdrop-blur-sm border border-white/50 px-3 py-1.5 rounded-md">
            <p className="text-xs font-semibold text-slate-600">
              Challenge started: {getTimeAgo(game.createdAt)}
            </p>
          </div>
        </div>
      </div>

      {/* Main Content Wrapper */}
      <div className="max-w-2xl mx-auto w-full px-4 space-y-8 mt-8">
        
        {/* Financials & Creator */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-blue-50 border border-blue-100 rounded-2xl p-5">
            <p className="text-xs font-bold text-blue-500 uppercase tracking-widest mb-1">Potential Prize</p>
            <p className="text-2xl font-extrabold text-blue-700">{potentialPayout.toLocaleString()} <span className="text-sm font-semibold">UGX</span></p>
          </div>
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Stake Required</p>
            <p className="text-2xl font-extrabold text-slate-900">{game.stakeAmount.toLocaleString()} <span className="text-sm font-semibold">UGX</span></p>
          </div>
        </div>

        <div className="flex items-center gap-2 px-1">
          <p className="text-sm text-slate-500 font-medium">Created by:</p>
          <p className="text-base font-bold text-slate-900">{game.creatorUsername}</p>
        </div>

        {/* Trust Card */}
        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <ShieldCheck size={20} className="text-slate-900" />
            <h3 className="font-bold text-slate-900">Protected by Pawa Pick</h3>
          </div>
          <div className="space-y-3">
            <div className="flex items-center gap-3 text-slate-600">
              <CheckCircle2 size={16} className="text-emerald-500 shrink-0" />
              <p className="text-sm font-medium">Stake already secured in escrow</p>
            </div>
            <div className="flex items-center gap-3 text-slate-600">
              <CheckCircle2 size={16} className="text-emerald-500 shrink-0" />
              <p className="text-sm font-medium">Instant payout upon winning</p>
            </div>
            <div className="flex items-center gap-3 text-slate-600">
              <CheckCircle2 size={16} className="text-emerald-500 shrink-0" />
              <p className="text-sm font-medium">Match outcome is cryptographically verifiable</p>
            </div>
          </div>
          <button className="mt-5 text-sm font-bold text-blue-600 hover:text-blue-800 transition-colors flex items-center gap-1">
            Learn More <ArrowLeft size={14} className="rotate-180" />
          </button>
        </div>

        {/* How It Works (Stepper) */}
        <div className="px-1 pt-2">
          <h3 className="font-bold text-slate-900 mb-6">How it works</h3>
          
          <div className="flex flex-col items-center text-center space-y-3">
            <div className="w-full bg-slate-50 border border-slate-200 rounded-xl py-4 font-semibold text-sm text-slate-700 flex items-center justify-center gap-3">
              <span className="w-6 h-6 rounded-full bg-white border border-slate-200 flex items-center justify-center text-xs">1</span>
              Accept Challenge
            </div>
            
            <ArrowDown size={20} className="text-slate-300" />

            <div className="w-full bg-slate-50 border border-slate-200 rounded-xl py-4 font-semibold text-sm text-slate-700 flex items-center justify-center gap-3">
              <span className="w-6 h-6 rounded-full bg-white border border-slate-200 flex items-center justify-center text-xs">2</span>
              Make Your Choice
            </div>

            <ArrowDown size={20} className="text-slate-300" />

            <div className="w-full bg-blue-50 border border-blue-100 rounded-xl py-4 font-semibold text-sm text-blue-700 flex items-center justify-center gap-3">
              <span className="w-6 h-6 rounded-full bg-white border border-blue-100 flex items-center justify-center text-xs">3</span>
              Winner Gets Paid
            </div>
          </div>
        </div>

      </div>

      {/* Floating Action Bar (Fixed to Bottom) */}
      <div className="fixed bottom-0 left-0 right-0 w-full bg-white border-t border-slate-200 p-4 pb-safe z-50 shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <div>
            <p className="font-bold text-slate-900">Accept challenge</p>
            <p className="text-xs text-slate-500 font-medium mt-0.5">{game.stakeAmount.toLocaleString()} UGX stake</p>
          </div>
          <button 
            onClick={() => router.push(`/play/${game.id}`)}
            className="bg-blue-600 text-white px-8 py-3.5 rounded-xl font-bold text-sm hover:bg-blue-700 transition-colors shadow-sm active:scale-95"
          >
            ACCEPT
          </button>
        </div>
      </div>

    </div>
  );
}
