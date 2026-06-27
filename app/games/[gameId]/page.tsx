// app/games/[gameId]/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ShieldCheck, Trophy, Info } from "lucide-react";

export default function GameDetails({ params }: { params: { gameId: string } }) {
  const router = useRouter();
  const [game, setGame] = useState<any>(null);

  useEffect(() => {
    fetch(`/api/games/feed`)
      .then((res) => res.json())
      .then((data) => {
        const found = data.games?.find((g: any) => g.id === params.gameId);
        setGame(found);
      });
  }, [params.gameId]);

  if (!game) {
    return <div className="max-w-md mx-auto p-8 text-center text-gray-400 animate-pulse">Loading details...</div>;
  }

  const totalPool = game.stakeAmount * 2;
  const potentialPayout = totalPool - (totalPool * 0.10);

  return (
    <div className="max-w-md mx-auto space-y-6 mt-4 pb-12">
      <button onClick={() => router.push("/feed")} className="text-sm font-semibold text-gray-500 px-2">
        ← Back to Feed
      </button>

      {/* Hero Details */}
      <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm text-center space-y-4">
        <div className="mx-auto w-16 h-16 bg-gray-50 rounded-2xl border border-gray-100 flex items-center justify-center mb-2">
           <Trophy size={28} className="text-gray-900" />
        </div>
        <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">
          {game.creatorUsername}'s Challenge
        </h1>
        <p className="text-sm text-gray-500 font-medium">
          A <strong className="uppercase">{game.gameType.replace("_", " ")}</strong> match is waiting for a challenger.
        </p>
      </div>

      {/* Financial Breakdown Bento */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white border border-gray-100 rounded-3xl p-5 shadow-sm">
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Required Stake</span>
          <p className="text-xl font-black text-gray-900 mt-1">{game.stakeAmount.toLocaleString()} <span className="text-xs">UGX</span></p>
        </div>
        <div className="bg-gray-900 rounded-3xl p-5 shadow-sm text-white">
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">To Win</span>
          <p className="text-xl font-black mt-1">{potentialPayout.toLocaleString()} <span className="text-xs text-gray-400">UGX</span></p>
        </div>
      </div>

      {/* Rules & Security */}
      <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm space-y-4">
        <div className="flex items-start gap-3">
          <Info size={18} className="text-gray-400 mt-0.5 shrink-0" />
          <p className="text-sm text-gray-600 font-medium">
            By accepting, your stake will be locked in escrow. The winner takes the pool minus a 10% platform fee.
          </p>
        </div>
        <div className="flex items-start gap-3 border-t border-gray-50 pt-4">
          <ShieldCheck size={18} className="text-gray-400 mt-0.5 shrink-0" />
          <p className="text-sm text-gray-600 font-medium">
            This match is cryptographically secured. The creator's choice is locked via SHA-256 and cannot be changed.
          </p>
        </div>
      </div>

      {/* Action */}
      <button 
        onClick={() => router.push(`/play/${game.id}`)}
        className="w-full bg-gray-900 text-white font-bold py-5 rounded-2xl shadow-lg hover:bg-gray-800 transition active:scale-[0.98]"
      >
        Accept Challenge & Play
      </button>
    </div>
  );
}
