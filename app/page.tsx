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
          // Filter for open games and grab the top 4
          const openGames = data.games.filter((g: any) => g.status === "open").slice(0, 4);
          setLatestGames(openGames);
        }
      })
      .catch(() => console.error("Failed to fetch live feed"))
      .finally(() => setIsLoading(false));
  }, []);

  return (
    // Removed horizontal padding from the main wrapper so we can create edge-to-edge sections
    <div className="max-w-md mx-auto min-h-screen flex flex-col pt-10 pb-16">
      
      {/* Hero Section */}
      <div className="text-center space-y-6 pt-4 px-4">
        <h1 className="text-5xl font-extrabold text-slate-900 tracking-tight leading-tight">
          Predict right.<br/>
          <span className="text-blue-600">And earn right.</span>
        </h1>
        
        <p className="text-base text-slate-500 font-medium max-w-sm mx-auto leading-relaxed">
          Create a challenge, lock your stake in secure escrow, and compete against real players. Winners are paid instantly after every verified match.
        </p>

        <div className="pt-2 flex gap-3">
          <Link href="/create" className="flex-1 bg-blue-600 text-white font-semibold py-4 rounded-xl hover:bg-blue-700 transition-colors">
            Create Challenge
          </Link>
          <Link href="/feed" className="flex-1 bg-slate-100 text-slate-900 font-semibold py-4 rounded-xl border border-slate-200 hover:bg-slate-200 transition-colors">
            View Markets
          </Link>
        </div>
      </div>

      {/* Live Challenges (Edge-to-Edge) */}
      <div className="mt-16 bg-white border-y border-slate-200 pt-8 pb-4">
        <div className="px-4 mb-5">
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">Play against real people</h2>
          <p className="text-sm text-slate-500 font-medium mt-1">Join the challenge now.</p>
        </div>

        {isLoading ? (
          <div className="px-4 py-8 text-center text-slate-400 font-medium animate-pulse">
            Scanning live markets...
          </div>
        ) : latestGames.length > 0 ? (
          <div className="divide-y divide-slate-100 border-t border-slate-100">
            {latestGames.map((game) => (
              <Link 
                href={`/games/${game.id}`} 
                key={game.id} 
                className="flex items-center justify-between px-4 py-4 hover:bg-slate-50 transition-colors"
              >
                <div>
                  <p className="font-semibold text-slate-900 capitalize text-sm">{game.gameType.replace("_", " ")}</p>
                  <p className="text-xs text-slate-500 mt-0.5">Created by {game.creatorUsername}</p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <p className="font-bold text-blue-600 text-sm">{(game.stakeAmount * 2 * 0.9).toLocaleString()}</p>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">To Win</p>
                  </div>
                  <ChevronRight size={18} className="text-slate-300" />
                </div>
              </Link>
            ))}
            
            <Link href="/feed" className="block text-center py-4 text-sm font-bold text-blue-600 hover:bg-blue-50 transition-colors">
              View all challenges →
            </Link>
          </div>
        ) : (
          <div className="px-4 py-6">
            <div className="bg-slate-50 border border-slate-200 border-dashed rounded-2xl p-8 text-center">
              <p className="text-slate-500 text-sm font-medium mb-4">No open challenges at the moment.</p>
              <Link href="/create" className="inline-flex items-center gap-2 bg-blue-600 text-white font-semibold px-6 py-3 rounded-xl hover:bg-blue-700 transition-colors">
                <Plus size={18} /> Be the first to create one
              </Link>
            </div>
          </div>
        )}
      </div>

      {/* Supported Games */}
      <div className="mt-12 px-4">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4 px-1">Supported Games</h3>
        <div className="space-y-3">
          <div className="bg-white border border-slate-200 rounded-2xl p-4 flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center shrink-0">
              <Palette size={20} className="text-blue-600" />
            </div>
            <p className="font-semibold text-slate-900 text-sm">Color Pick</p>
          </div>
          
          <div className="bg-white border border-slate-200 rounded-2xl p-4 flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-rose-50 flex items-center justify-center shrink-0">
              <Box size={20} className="text-rose-600" />
            </div>
            <p className="font-semibold text-slate-900 text-sm">Three Cup Shuffle</p>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-4 flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center shrink-0">
              <Target size={20} className="text-emerald-600" />
            </div>
            <p className="font-semibold text-slate-900 text-sm">Penalty Shootout</p>
          </div>
        </div>
      </div>

      {/* Why Choose Us Grid */}
      <div className="mt-14 px-4">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-5 px-1">Why Choose Us</h3>
        
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5">
            <span className="text-blue-600 font-bold text-lg mb-2 block">01</span>
            <h4 className="font-bold text-slate-900 text-sm">No Waiting</h4>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">Games are asynchronous.</p>
          </div>

          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5">
            <span className="text-blue-600 font-bold text-lg mb-2 block">02</span>
            <h4 className="font-bold text-slate-900 text-sm">No House Betting</h4>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">You play against people.</p>
          </div>

          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5">
            <span className="text-blue-600 font-bold text-lg mb-2 block">03</span>
            <h4 className="font-bold text-slate-900 text-sm">Instant Wallet Updates</h4>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">No manual claims.</p>
          </div>

          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5">
            <span className="text-blue-600 font-bold text-lg mb-2 block">04</span>
            <h4 className="font-bold text-slate-900 text-sm">Permanent Match History</h4>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">Every game stays on your profile.</p>
          </div>

          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5">
            <span className="text-blue-600 font-bold text-lg mb-2 block">05</span>
            <h4 className="font-bold text-slate-900 text-sm">Mobile First</h4>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">Designed for speed.</p>
          </div>

          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5">
            <span className="text-blue-600 font-bold text-lg mb-2 block">06</span>
            <h4 className="font-bold text-slate-900 text-sm">Secure by Design</h4>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">Server-side verification.</p>
          </div>
        </div>
      </div>

    </div>
  );
}
