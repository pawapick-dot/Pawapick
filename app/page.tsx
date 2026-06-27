// app/page.tsx
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ChevronRight, Plus, Target, Palette, Box } from "lucide-react";

export default function Home() {
  const [latestGames, setLatestGames] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch("/api/games/feed")
      .then((res) => res.json())
      .then((data) => {
        if (data.games) {
          const openGames = data.games.filter((g: any) => g.status === "open").slice(0, 4);
          setLatestGames(openGames);
        }
      })
      .catch(() => console.error("Failed to fetch live feed"))
      .finally(() => setIsLoading(false));
  }, []);

  return (
    // Removed max-w-md to allow full desktop expansion
    <div className="w-full min-h-screen flex flex-col pt-8 md:pt-16 pb-24">
      
      {/* Hero Section (Left on Mobile, Centered & Massive on Desktop) */}
      <div className="w-full max-w-6xl mx-auto px-4 space-y-6 text-left md:text-center">
        <h1 className="text-[3.5rem] leading-[1.05] md:text-8xl md:leading-[1.1] font-black text-slate-900 tracking-tighter">
          Predict right.<br className="md:hidden" />
          <span className="text-blue-600 md:block"> And earn right.</span>
        </h1>
        
        <p className="text-lg md:text-2xl text-slate-500 font-medium max-w-[18rem] md:max-w-2xl md:mx-auto leading-relaxed md:leading-normal">
          Create a challenge, lock your stake in secure escrow, and compete against real players. Winners are paid instantly after every verified match.
        </p>

        <div className="pt-4 flex flex-col md:flex-row gap-3 md:justify-center md:max-w-md md:mx-auto">
          <Link href="/create" className="w-full text-center bg-blue-600 text-white font-semibold py-4 md:py-5 rounded-xl hover:bg-blue-700 transition-colors text-lg">
            Create Challenge
          </Link>
          <Link href="/feed" className="w-full text-center bg-slate-100 text-slate-900 font-semibold py-4 md:py-5 rounded-xl border border-slate-200 hover:bg-slate-200 transition-colors text-lg">
            View Markets
          </Link>
        </div>
      </div>

      {/* Live Challenges */}
      <div className="w-full max-w-4xl mx-auto mt-16 md:mt-24">
        {/* Edge-to-Edge on Mobile, Rounded Card on Desktop */}
        <div className="bg-white border-y md:border-x border-slate-200 md:rounded-3xl pt-8 pb-4 md:p-8 md:shadow-sm">
          <div className="px-4 md:px-0 mb-6 md:text-center">
            <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">Play against real people</h2>
            <p className="text-sm md:text-base text-slate-500 font-medium mt-1">Join the challenge now.</p>
          </div>

          {isLoading ? (
            <div className="px-4 py-8 text-center text-slate-400 font-medium animate-pulse">
              Scanning live markets...
            </div>
          ) : latestGames.length > 0 ? (
            <div className="divide-y divide-slate-100 border-t border-slate-100 md:border-none md:bg-slate-50 md:rounded-2xl">
              {latestGames.map((game) => (
                <Link 
                  href={`/games/${game.id}`} 
                  key={game.id} 
                  className="flex items-center justify-between px-4 py-5 hover:bg-slate-100 transition-colors md:px-6"
                >
                  <div>
                    <p className="font-bold text-slate-900 capitalize text-sm md:text-base">{game.gameType.replace("_", " ")}</p>
                    <p className="text-xs md:text-sm text-slate-500 mt-1">Created by {game.creatorUsername}</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="font-extrabold text-blue-600 text-base md:text-lg">{(game.stakeAmount * 2 * 0.9).toLocaleString()}</p>
                      <p className="text-[10px] md:text-xs text-slate-400 font-bold uppercase tracking-widest">To Win</p>
                    </div>
                    <ChevronRight size={20} className="text-slate-300" />
                  </div>
                </Link>
              ))}
              
              <Link href="/feed" className="block text-center py-5 text-sm font-bold text-blue-600 hover:bg-blue-50 transition-colors md:rounded-b-2xl md:text-base">
                View all challenges →
              </Link>
            </div>
          ) : (
            <div className="px-4 py-6 md:px-0">
              <div className="bg-slate-50 border border-slate-200 border-dashed rounded-2xl p-10 text-center">
                <p className="text-slate-500 text-base font-medium mb-6">No open challenges at the moment.</p>
                <Link href="/create" className="inline-flex items-center gap-2 bg-blue-600 text-white font-semibold px-6 py-4 rounded-xl hover:bg-blue-700 transition-colors">
                  <Plus size={20} /> Be the first to create one
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Supported Games (Sharp Edged on Mobile, Wide on Desktop) */}
      <div className="w-full max-w-5xl mx-auto mt-16 md:mt-24 px-2 md:px-4">
        <h3 className="text-xs md:text-sm font-bold text-slate-400 uppercase tracking-widest mb-4 px-2 md:text-center">Supported Games</h3>
        <div className="space-y-3 md:space-y-0 md:grid md:grid-cols-3 md:gap-6">
          
          <div className="bg-white border-2 border-slate-200 rounded-none p-5 md:p-8 flex items-center gap-4 md:flex-col md:text-center hover:border-blue-300 transition-colors">
            <div className="w-12 h-12 md:w-16 md:h-16 bg-blue-50 flex items-center justify-center shrink-0 border border-blue-100">
              <Palette size={24} className="text-blue-600" />
            </div>
            <p className="font-extrabold text-slate-900 text-base md:text-lg">Color Pick</p>
          </div>
          
          <div className="bg-white border-2 border-slate-200 rounded-none p-5 md:p-8 flex items-center gap-4 md:flex-col md:text-center hover:border-rose-300 transition-colors">
            <div className="w-12 h-12 md:w-16 md:h-16 bg-rose-50 flex items-center justify-center shrink-0 border border-rose-100">
              <Box size={24} className="text-rose-600" />
            </div>
            <p className="font-extrabold text-slate-900 text-base md:text-lg">Three Cup Shuffle</p>
          </div>

          <div className="bg-white border-2 border-slate-200 rounded-none p-5 md:p-8 flex items-center gap-4 md:flex-col md:text-center hover:border-emerald-300 transition-colors">
            <div className="w-12 h-12 md:w-16 md:h-16 bg-emerald-50 flex items-center justify-center shrink-0 border border-emerald-100">
              <Target size={24} className="text-emerald-600" />
            </div>
            <p className="font-extrabold text-slate-900 text-base md:text-lg">Penalty Shootout</p>
          </div>

        </div>
      </div>

      {/* Why Choose Us (1 Row on Mobile, 3 Cols on Desktop, Kept Rounded) */}
      <div className="w-full max-w-6xl mx-auto mt-20 md:mt-32 px-4">
        <h3 className="text-xs md:text-sm font-bold text-slate-400 uppercase tracking-widest mb-6 px-1 md:text-center">Why Choose Us</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-8">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 md:p-8 shadow-sm">
            <span className="text-blue-600 font-black text-2xl mb-3 block">01</span>
            <h4 className="font-bold text-slate-900 text-base md:text-lg">No Waiting</h4>
            <p className="text-sm text-slate-500 mt-2 leading-relaxed">Games are asynchronous. You don't have to be online at the same time.</p>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-6 md:p-8 shadow-sm">
            <span className="text-blue-600 font-black text-2xl mb-3 block">02</span>
            <h4 className="font-bold text-slate-900 text-base md:text-lg">No House Betting</h4>
            <p className="text-sm text-slate-500 mt-2 leading-relaxed">You play against people, not against a rigged company algorithm.</p>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-6 md:p-8 shadow-sm">
            <span className="text-blue-600 font-black text-2xl mb-3 block">03</span>
            <h4 className="font-bold text-slate-900 text-base md:text-lg">Instant Wallet Updates</h4>
            <p className="text-sm text-slate-500 mt-2 leading-relaxed">No manual claims. The smart escrow deposits your UGX the second you win.</p>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-6 md:p-8 shadow-sm">
            <span className="text-blue-600 font-black text-2xl mb-3 block">04</span>
            <h4 className="font-bold text-slate-900 text-base md:text-lg">Permanent History</h4>
            <p className="text-sm text-slate-500 mt-2 leading-relaxed">Every match stays on your profile ledger for absolute transparency.</p>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-6 md:p-8 shadow-sm">
            <span className="text-blue-600 font-black text-2xl mb-3 block">05</span>
            <h4 className="font-bold text-slate-900 text-base md:text-lg">Mobile First</h4>
            <p className="text-sm text-slate-500 mt-2 leading-relaxed">Designed for speed, low bandwidth, and fast mobile money transactions.</p>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-6 md:p-8 shadow-sm">
            <span className="text-blue-600 font-black text-2xl mb-3 block">06</span>
            <h4 className="font-bold text-slate-900 text-base md:text-lg">Secure by Design</h4>
            <p className="text-sm text-slate-500 mt-2 leading-relaxed">Server-side SHA-256 verification ensures no one can ever cheat.</p>
          </div>
        </div>
      </div>

    </div>
  );
}
