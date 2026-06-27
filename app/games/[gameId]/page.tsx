// app/games/[gameId]/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ShieldCheck, Trophy, Info, ArrowLeft, Target } from "lucide-react";

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
    return (
      <div className="max-w-md mx-auto p-8 text-center font-black tracking-widest text-gray-400 uppercase animate-pulse mt-12">
        Scanning Escrow...
      </div>
    );
  }

  const totalPool = game.stakeAmount * 2;
  const potentialPayout = totalPool - (totalPool * 0.10);

  // Dynamic Game Instructions
  const getGameInstructions = (type: string) => {
    switch (type) {
      case "penalty":
        return "The creator is the Goalkeeper and has committed to diving Left, Center, or Right. Choose your target. If you shoot where they dive, they win your stake. If you shoot where they aren't, you take the pool.";
      case "color":
        return "A trap is hidden under either the Blue or Yellow tile. Pick the safe tile to win. If you step on the trap, the creator takes your stake. You have a 50/50 chance.";
      case "shuffle":
        return "The creator has hidden the prize under Cup 1, 2, or 3. Trust your instincts and select the correct cup to win the entire pool. You have a 1 in 3 chance.";
      default:
        return "Outsmart the creator to win the pool.";
    }
  };

  return (
    <div className="max-w-md mx-auto space-y-8 mt-6 pb-12 px-4">
      <button 
        onClick={() => router.push("/feed")} 
        className="text-[10px] font-black text-gray-400 uppercase tracking-widest hover:text-black transition flex items-center gap-1 w-fit"
      >
        <ArrowLeft size={14} /> Back to Feed
      </button>

      {/* Hero Details */}
      <div className="bg-white border-2 border-black rounded-none p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] text-center space-y-4">
        <div className="mx-auto w-16 h-16 bg-yellow-400 border-2 border-black flex items-center justify-center mb-2">
           <Trophy size={28} className="text-black" />
        </div>
        <h1 className="text-3xl font-black text-gray-900 tracking-tighter uppercase leading-none">
          {game.creatorUsername}'s Challenge
        </h1>
        <p className="text-xs text-gray-500 font-bold uppercase tracking-widest">
          Game Type: <span className="text-black">{game.gameType.replace("_", " ")}</span>
        </p>
      </div>

      {/* Financial Breakdown Bento */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white border-2 border-gray-200 rounded-none p-5">
          <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Required Stake</span>
          <p className="text-2xl font-black text-gray-900 mt-1">{game.stakeAmount.toLocaleString()} <span className="text-xs">UGX</span></p>
        </div>
        <div className="bg-gray-900 border-2 border-black rounded-none p-5 text-white shadow-[4px_4px_0px_0px_rgba(250,204,21,1)]">
          <span className="text-[10px] font-black text-yellow-400 uppercase tracking-widest">To Win</span>
          <p className="text-2xl font-black mt-1">{potentialPayout.toLocaleString()} <span className="text-xs text-gray-400">UGX</span></p>
        </div>
      </div>

      {/* Clean Rules Section (No Background/Borders) */}
      <div className="space-y-6 pt-4 px-2">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Target size={18} className="text-gray-900" />
            <h3 className="font-black text-gray-900 uppercase tracking-wider text-sm">How to Play</h3>
          </div>
          <p className="text-sm text-gray-600 font-medium leading-relaxed pl-6">
            {getGameInstructions(game.gameType)}
          </p>
        </div>

        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <ShieldCheck size={18} className="text-gray-900" />
            <h3 className="font-black text-gray-900 uppercase tracking-wider text-sm">Escrow Security</h3>
          </div>
          <p className="text-sm text-gray-600 font-medium leading-relaxed pl-6">
            The creator's choice is already locked via SHA-256 cryptography and cannot be changed. By accepting, your stake will be locked in the smart contract until the match resolves.
          </p>
        </div>
      </div>

      {/* Action */}
      <div className="pt-4">
        <button 
          onClick={() => router.push(`/play/${game.id}`)}
          className="w-full bg-yellow-400 text-black font-black uppercase tracking-widest text-lg py-5 border-2 border-black hover:bg-yellow-500 transition shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] active:translate-y-1 active:shadow-none"
        >
          Accept Challenge
        </button>
      </div>
    </div>
  );
}
