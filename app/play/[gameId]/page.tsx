// app/play/[gameId]/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { motion } from "framer-motion";

export default function PlayGame({ params }: { params: { gameId: string } }) {
  const router = useRouter();
  const [game, setGame] = useState<any>(null);
  const [result, setResult] = useState<any>(null);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // Fetch the public game data on load
  useEffect(() => {
    fetch(`/api/games/feed`)
      .then((res) => res.json())
      .then((data) => {
        const found = data.games?.find((g: any) => g.id === params.gameId);
        setGame(found);
      });
  }, [params.gameId]);

  const handleGuess = async (guess: string) => {
    if (isProcessing || result) return;
    
    setSelectedOption(guess);
    setIsProcessing(true);

    toast.promise(
      fetch("/api/games/resolve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ gameId: params.gameId, guess }),
      }).then(async (res) => {
        const data = await res.json();
        if (!res.ok) throw new Error(data.error);
        setResult(data);
        setIsProcessing(false);
        return data;
      }),
      {
        loading: "Locking funds & resolving match...",
        success: (data) => data.outcome === "player_b_won" ? "You won!" : "You lost.",
        error: (err) => {
          setIsProcessing(false);
          setSelectedOption(null);
          return err.message;
        },
      }
    );
  };

  if (!game) return <div className="p-8 text-center text-gray-400">Loading challenge...</div>;

  return (
    <div className="max-w-md mx-auto space-y-6 mt-4 pb-12">
      <button onClick={() => router.push("/dashboard")} className="text-sm font-semibold text-gray-500 px-2">
        ← Feed
      </button>

      {/* Game Header */}
      <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm text-center space-y-2">
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
          {game.gameType.replace("_", " ")}
        </p>
        <h2 className="text-2xl font-bold">{game.creatorUsername}'s Challenge</h2>
        <p className="text-lg font-bold text-gray-900 bg-gray-50 inline-block px-4 py-1 rounded-full">
          Stake: {game.stakeAmount.toLocaleString()} UGX
        </p>
      </div>

      {/* Animated Game Board */}
      <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm overflow-hidden">
        <h3 className="text-center font-bold mb-6 text-gray-900">
          {!result ? "Make Your Play" : result.outcome === "player_b_won" ? "WINNER!" : "DEFEAT"}
        </h3>
        
        {/* 1. PENALTY SHOOTOUT VISUAL */}
        {game.gameType === "penalty" && (
          <div className="relative w-full h-56 bg-green-50 rounded-xl border-2 border-green-100 flex flex-col items-center justify-end p-2 overflow-hidden">
            {/* Goalpost lines */}
            <div className="absolute top-4 w-4/5 h-full border-t-4 border-l-4 border-r-4 border-white rounded-t-lg"></div>
            
            {/* Animated Goalkeeper */}
            <motion.div 
              initial={{ x: 0, y: 0 }}
              animate={
                result ? { 
                  x: result.creatorChoice === "left" ? -80 : result.creatorChoice === "right" ? 80 : 0,
                  y: result.creatorChoice === "center" ? -20 : 10
                } : {}
              }
              transition={{ type: "spring", stiffness: 100, damping: 15 }}
              className="absolute top-1/2 -translate-y-1/2 w-12 h-12 bg-gray-800 rounded-full flex items-center justify-center shadow-lg z-20"
            >
              <span className="text-white text-[10px] font-bold">GK</span>
            </motion.div>
            
            {/* Target Zones & Ball */}
            <div className="grid grid-cols-3 w-full h-full gap-2 z-30 pt-8">
              {["left", "center", "right"].map(opt => (
                <button 
                  key={opt} 
                  onClick={() => handleGuess(opt)} 
                  disabled={isProcessing || result}
                  className="h-full border-2 border-dashed border-transparent hover:border-white/50 rounded-lg flex items-end justify-center pb-4"
                >
                  {(!selectedOption || selectedOption === opt) && (
                    <motion.div 
                      initial={{ y: 0, scale: 1 }}
                      animate={
                        result && selectedOption === opt ? { 
                          y: -100, 
                          scale: 0.7 
                        } : {}
                      }
                      transition={{ type: "spring", stiffness: 120 }}
                      className={`w-8 h-8 rounded-full shadow-md flex items-center justify-center ${selectedOption === opt && result ? 'bg-white' : 'bg-white opacity-80'}`}
                    >
                      ⚽
                    </motion.div>
                  )}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* 2. COLOR MINEFIELD VISUAL */}
        {game.gameType === "color" && (
          <div className="grid grid-cols-2 gap-4">
            {["blue", "yellow"].map((color) => (
              <motion.button 
                key={color}
                onClick={() => handleGuess(color)}
                disabled={isProcessing || result}
                animate={result && selectedOption === color ? { rotateY: 180, scale: 1.05 } : {}}
                transition={{ duration: 0.6 }}
                className={`aspect-[3/4] rounded-2xl shadow-md border-4 flex items-center justify-center ${
                  color === "blue" ? "bg-blue-500 border-blue-200" : "bg-yellow-400 border-yellow-200"
                } ${(result && selectedOption !== color) ? "opacity-30 grayscale" : ""}`}
              >
                {/* Back of card reveal content */}
                {result && selectedOption === color && (
                  <motion.div 
                    initial={{ opacity: 0 }} 
                    animate={{ opacity: 1 }} 
                    transition={{ delay: 0.3 }}
                    className="rotate-y-180 text-white font-bold text-2xl"
                  >
                    {result.outcome === "player_b_won" ? "✓" : "✗"}
                  </motion.div>
                )}
                {!result && <div className="w-12 h-12 rounded-full border-4 border-white/30"></div>}
              </motion.button>
            ))}
          </div>
        )}

        {/* 3. THE 3-CUP SHUFFLE VISUAL */}
        {game.gameType === "shuffle" && (
           <div className="grid grid-cols-3 gap-2 pt-12 pb-4">
             {["cup_1", "cup_2", "cup_3"].map(opt => (
               <div key={opt} className="relative flex flex-col items-center">
                 
                 {/* The hidden coin (Only renders under the correct cup) */}
                 {result && result.creatorChoice === opt && (
                   <div className="absolute bottom-4 w-8 h-8 bg-yellow-400 rounded-full border-2 border-yellow-600 shadow-inner z-0 flex items-center justify-center">
                     <span className="text-[10px] font-bold text-yellow-700">$</span>
                   </div>
                 )}

                 {/* The Animated Cup */}
                 <motion.button 
                   onClick={() => handleGuess(opt)} 
                   disabled={isProcessing || result}
                   animate={
                     result && (selectedOption === opt || result.creatorChoice === opt) 
                     ? { y: -60 } // Lift the cup up
                     : { y: 0 }
                   }
                   transition={{ type: "spring", stiffness: 80, damping: 12, delay: result && selectedOption !== opt ? 0.5 : 0 }}
                   className="w-16 h-20 bg-red-500 rounded-t-lg rounded-b-3xl shadow-md relative z-10 border-b-8 border-red-700 flex items-center justify-center"
                 >
                    <span className="text-red-300 font-bold opacity-50">{opt.split("_")[1]}</span>
                 </motion.button>
                 
                 {/* Cup Shadow */}
                 <div className="w-12 h-2 bg-gray-200 rounded-full mt-2 z-0"></div>
               </div>
             ))}
           </div>
        )}
      </div>

      {/* Post-Game Action */}
      {result && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ delay: 1 }}
        >
          <button 
            onClick={() => router.push(`/verify/${params.gameId}`)} 
            className="w-full bg-gray-900 text-white font-bold py-4 rounded-xl shadow-md active:scale-[0.98] transition"
          >
            View Provably Fair Receipt
          </button>
        </motion.div>
      )}
    </div>
  );
}
