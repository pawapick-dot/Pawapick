// app/play/[gameId]/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export default function PlayGame({ params }: { params: { gameId: string } }) {
  const router = useRouter();
  const [game, setGame] = useState<any>(null);
  const [result, setResult] = useState<any>(null);

  // Fetch the public game data on load
  useEffect(() => {
    fetch(`/api/games/feed`)
      .then(res => res.json())
      .then(data => {
        const found = data.games?.find((g: any) => g.id === params.gameId);
        setGame(found);
      });
  }, [params.gameId]);

  const handleGuess = async (guess: string) => {
    toast.promise(
      fetch("/api/games/resolve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ gameId: params.gameId, guess }),
      }).then(async (res) => {
        const data = await res.json();
        if (!res.ok) throw new Error(data.error);
        setResult(data);
        return data;
      }),
      {
        loading: "Locking funds & resolving match...",
        success: (data) => data.outcome === "player_b_won" ? "You won!" : "You lost.",
        error: (err) => err.message,
      }
    );
  };

  if (!game) return <div className="p-8 text-center text-gray-400">Loading challenge...</div>;

  return (
    <div className="max-w-md mx-auto space-y-6 mt-4 pb-12">
      <button onClick={() => router.push("/dashboard")} className="text-sm font-semibold text-gray-500 px-2">← Feed</button>

      {/* Game Header */}
      <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm text-center space-y-2">
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">{game.gameType.replace("_", " ")}</p>
        <h2 className="text-2xl font-bold">{game.creatorUsername}'s Challenge</h2>
        <p className="text-lg font-bold text-gray-900 bg-gray-50 inline-block px-4 py-1 rounded-full">
          Stake: {game.stakeAmount.toLocaleString()} UGX
        </p>
      </div>

      {/* Game Board or Result */}
      {!result ? (
        <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm">
          <h3 className="text-center font-bold mb-6 text-gray-900">Make Your Guess</h3>
          
          {game.gameType === "penalty" && (
            <div className="grid grid-cols-3 gap-2">
              {["left", "center", "right"].map(opt => (
                <button key={opt} onClick={() => handleGuess(opt)} className="py-6 rounded-xl font-bold border uppercase text-xs hover:bg-gray-50 active:bg-gray-100">{opt}</button>
              ))}
            </div>
          )}

          {game.gameType === "color" && (
            <div className="grid grid-cols-2 gap-3">
              {["blue", "yellow"].map(opt => (
                <button key={opt} onClick={() => handleGuess(opt)} className="py-12 rounded-xl font-bold border uppercase text-sm hover:bg-gray-50 active:bg-gray-100">{opt}</button>
              ))}
            </div>
          )}

          {game.gameType === "shuffle" && (
             <div className="grid grid-cols-3 gap-2">
               {["cup_1", "cup_2", "cup_3"].map(opt => (
                 <button key={opt} onClick={() => handleGuess(opt)} className="py-8 rounded-xl font-bold border uppercase text-xs hover:bg-gray-50 active:bg-gray-100">{opt.replace("_", " ")}</button>
               ))}
             </div>
          )}
        </div>
      ) : (
        <div className="bg-white border border-gray-100 rounded-3xl p-8 shadow-sm text-center space-y-4">
          <h2 className={`text-3xl font-bold ${result.outcome === "player_b_won" ? "text-gray-900" : "text-gray-400"}`}>
            {result.outcome === "player_b_won" ? "WINNER!" : "DEFEAT"}
          </h2>
          <p className="text-gray-500">The hidden choice was <strong className="text-gray-900 uppercase">{result.creatorChoice}</strong>.</p>
          
          <button onClick={() => router.push(`/verify/${params.gameId}`)} className="mt-4 w-full bg-gray-100 text-gray-900 font-bold py-3 rounded-xl border border-gray-200 active:scale-95 transition">
            View Cryptographic Receipt
          </button>
        </div>
      )}
    </div>
  );
}
