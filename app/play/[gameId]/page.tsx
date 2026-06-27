// app/play/[gameId]/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { useAuth } from "@/context/AuthContext";
import { Lock } from "lucide-react";

export default function PlayGame({ params }: { params: { gameId: string } }) {
  const router = useRouter();
  const { user, loading: authLoading, openAuthModal } = useAuth();
  
  const [game, setGame] = useState<any>(null);
  const [result, setResult] = useState<any>(null);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    fetch(`/api/games/feed`)
      .then((res) => res.json())
      .then((data) => {
        const found = data.games?.find((g: any) => g.id === params.gameId);
        setGame(found);
      });
  }, [params.gameId]);

  const handleGuess = async (guess: string) => {
    if (!user) return openAuthModal();
    if (isProcessing || result) return;
    if (game.creatorId === user.uid) return toast.error("You cannot play your own game!");
    
    setSelectedOption(guess);
    setIsProcessing(true);

    try {
      const token = await user.getIdToken();
      toast.promise(
        fetch("/api/games/resolve", {
          method: "POST",
          headers: { 
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
          },
          body: JSON.stringify({ gameId: params.gameId, guess }),
        }).then(async (res) => {
          const data = await res.json();
          if (!res.ok) throw new Error(data.error);
          setResult(data);
          setIsProcessing(false);
          return data;
        }),
        {
          loading: "Locking escrow & resolving match...",
          success: (data) => data.outcome === "player_b_won" ? "You won!" : "Defeat.",
          error: (err) => {
            setIsProcessing(false);
            setSelectedOption(null);
            return err.message;
          },
        }
      );
    } catch (error) {
      toast.error("Authentication error.");
      setIsProcessing(false);
    }
  };

  if (!game || authLoading) return <div className="p-8 text-center font-black tracking-widest text-gray-400 uppercase">Scanning Arena...</div>;

  return (
    <div className="max-w-md mx-auto space-y-8 mt-6 pb-12 px-4">
      <button onClick={() => router.push("/feed")} className="text-[10px] font-black text-gray-400 uppercase tracking-widest hover:text-black transition">
        ← Abort & Return
      </button>

      {/* Game Header */}
      <div className="bg-white border-2 border-black rounded-none p-6 text-center space-y-2 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
        <p className="text-[10px] font-black text-yellow-500 uppercase tracking-widest">
          {game.gameType.replace("_", " ")}
        </p>
        <h2 className="text-3xl font-black uppercase tracking-tight text-gray-900">{game.creatorUsername}'s Match</h2>
        <div className="inline-block border-2 border-black px-4 py-2 bg-yellow-400 mt-2">
          <p className="text-xl font-black text-black">
            {game.stakeAmount.toLocaleString()} <span className="text-sm">UGX</span>
          </p>
        </div>
      </div>

      {/* Animated Game Board */}
      <div className="bg-white border-2 border-gray-200 rounded-none p-6">
        <h3 className="text-center font-black uppercase tracking-widest mb-8 text-gray-900">
          {!result ? "Make Your Play" : result.outcome === "player_b_won" ? "WINNER!" : "DEFEAT"}
        </h3>
        
        {/* PENALTY SHOOTOUT */}
        {game.gameType === "penalty" && (
          <div className="relative w-full h-56 bg-green-50 border-2 border-green-700 flex flex-col items-center justify-end p-2 overflow-hidden shadow-[4px_4px_0px_0px_rgba(21,128,61,1)]">
            <div className="absolute top-4 w-4/5 h-full border-t-4 border-l-4 border-r-4 border-white"></div>
            
            <motion.div 
              initial={{ x: 0, y: 0 }}
              animate={result ? { x: result.creatorChoice === "left" ? -80 : result.creatorChoice === "right" ? 80 : 0, y: result.creatorChoice === "center" ? -20 : 10 } : {}}
              transition={{ type: "spring", stiffness: 100, damping: 15 }}
              className="absolute top-1/2 -translate-y-1/2 w-12 h-12 bg-black flex items-center justify-center border-2 border-white z-20"
            >
              <span className="text-yellow-400 text-[10px] font-black">GK</span>
            </motion.div>
            
            <div className="grid grid-cols-3 w-full h-full gap-2 z-30 pt-8">
              {["left", "center", "right"].map(opt => (
                <button key={opt} onClick={() => handleGuess(opt)} disabled={isProcessing || result} className="h-full border-2 border-dashed border-transparent hover:border-white/50 flex items-end justify-center pb-4">
                  {(!selectedOption || selectedOption === opt) && (
                    <motion.div 
                      initial={{ y: 0, scale: 1 }}
                      animate={result && selectedOption === opt ? { y: -100, scale: 0.7 } : {}}
                      transition={{ type: "spring", stiffness: 120 }}
                      className={`w-8 h-8 flex items-center justify-center bg-white border-2 border-black ${selectedOption === opt && result ? 'opacity-100' : 'opacity-80'}`}
                    >⚽</motion.div>
                  )}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* COLOR MINEFIELD */}
        {game.gameType === "color" && (
          <div className="grid grid-cols-2 gap-4">
            {["blue", "yellow"].map((color) => (
              <motion.button 
                key={color} onClick={() => handleGuess(color)} disabled={isProcessing || result}
                animate={result && selectedOption === color ? { rotateY: 180, scale: 1.05 } : {}}
                transition={{ duration: 0.6 }}
                className={`aspect-[3/4] border-2 flex items-center justify-center ${color === "blue" ? "bg-blue-500 border-blue-700 shadow-[4px_4px_0px_0px_rgba(29,78,216,1)]" : "bg-yellow-400 border-yellow-600 shadow-[4px_4px_0px_0px_rgba(202,138,4,1)]"} ${(result && selectedOption !== color) ? "opacity-30 grayscale" : ""}`}
              >
                {result && selectedOption === color && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} className="rotate-y-180 text-white font-black text-4xl">
                    {result.outcome === "player_b_won" ? "✓" : "✗"}
                  </motion.div>
                )}
                {!result && <div className="w-12 h-12 border-4 border-white/30"></div>}
              </motion.button>
            ))}
          </div>
        )}

        {/* 3-CUP SHUFFLE */}
        {game.gameType === "shuffle" && (
           <div className="grid grid-cols-3 gap-3 pt-12 pb-4">
             {["cup_1", "cup_2", "cup_3"].map(opt => (
               <div key={opt} className="relative flex flex-col items-center">
                 {result && result.creatorChoice === opt && (
                   <div className="absolute bottom-4 w-8 h-8 bg-yellow-400 border-2 border-black z-0 flex items-center justify-center">
                     <span className="text-[10px] font-black text-black">$</span>
                   </div>
                 )}
                 <motion.button 
                   onClick={() => handleGuess(opt)} disabled={isProcessing || result}
                   animate={result && (selectedOption === opt || result.creatorChoice === opt) ? { y: -60 } : { y: 0 }}
                   transition={{ type: "spring", stiffness: 80, damping: 12, delay: result && selectedOption !== opt ? 0.5 : 0 }}
                   className="w-16 h-20 bg-red-500 border-2 border-red-700 border-b-8 shadow-[4px_4px_0px_0px_rgba(185,28,28,1)] relative z-10 flex items-center justify-center"
                 >
                    <span className="text-red-200 font-black opacity-50">{opt.split("_")[1]}</span>
                 </motion.button>
                 <div className="w-12 h-2 bg-gray-200 mt-2 z-0"></div>
               </div>
             ))}
           </div>
        )}
      </div>

      {result && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1 }}>
          <button 
            onClick={() => router.push(`/verify/${params.gameId}`)} 
            className="w-full bg-black text-white font-black uppercase tracking-widest py-5 border-2 border-black hover:bg-gray-800 transition shadow-[4px_4px_0px_0px_rgba(250,204,21,1)] active:translate-y-1 active:shadow-none"
          >
            Cryptographic Receipt
          </button>
        </motion.div>
      )}
    </div>
  );
}
