// app/play/[gameId]/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { useAuth } from "@/context/AuthContext";
import { Lock, ArrowLeft } from "lucide-react";

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
          success: (data) => data.outcome === "player_b_won" ? "You won the pool!" : "You were defeated.",
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

  if (!game || authLoading) return <div className="p-8 text-center font-black tracking-widest text-gray-400 uppercase mt-12 animate-pulse">Scanning Arena...</div>;

  return (
    <div className="max-w-md mx-auto space-y-6 mt-4 pb-12 px-4">
      <button onClick={() => router.push("/feed")} className="text-[10px] font-black text-gray-400 uppercase tracking-widest hover:text-black transition flex items-center gap-1 w-fit">
        <ArrowLeft size={14} /> Abort & Return
      </button>

      {/* Game Header */}
      <div className="bg-white border-2 border-black rounded-none p-5 text-center space-y-1 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
        <p className="text-[10px] font-black text-yellow-500 uppercase tracking-widest">
          {game.gameType.replace("_", " ")}
        </p>
        <h2 className="text-2xl font-black uppercase tracking-tight text-gray-900">{game.creatorUsername}'s Match</h2>
        <div className="inline-block border-2 border-black px-4 py-1.5 bg-yellow-400 mt-2">
          <p className="text-lg font-black text-black">
            {game.stakeAmount.toLocaleString()} <span className="text-xs">UGX</span>
          </p>
        </div>
      </div>

      {/* The Immersive Game Board */}
      <div className="bg-white border-2 border-gray-200 rounded-none p-4 shadow-sm">
        <h3 className="text-center font-black uppercase tracking-widest mb-6 text-gray-900 text-sm">
          {!result ? "Make Your Play" : result.outcome === "player_b_won" ? "🏆 WINNER!" : "💀 DEFEAT"}
        </h3>
        
        {/* 1. REALISTIC PENALTY SHOOTOUT */}
        {game.gameType === "penalty" && (
          <div className="relative w-full h-64 bg-[repeating-linear-gradient(0deg,#2f855a,#2f855a_20px,#22c55e_20px,#22c55e_40px)] border-4 border-white flex flex-col items-center justify-end p-2 overflow-hidden shadow-[4px_4px_0px_0px_rgba(21,128,61,1)] rounded-sm">
            
            {/* The Net */}
            <div className="absolute top-0 w-3/5 h-16 border-b-4 border-l-4 border-r-4 border-white bg-white/20 z-10" style={{ backgroundImage: 'linear-gradient(45deg, rgba(255,255,255,0.4) 25%, transparent 25%, transparent 75%, rgba(255,255,255,0.4) 75%, rgba(255,255,255,0.4)), linear-gradient(45deg, rgba(255,255,255,0.4) 25%, transparent 25%, transparent 75%, rgba(255,255,255,0.4) 75%, rgba(255,255,255,0.4))', backgroundSize: '10px 10px', backgroundPosition: '0 0, 5px 5px' }}></div>
            
            {/* Penalty Arc & Box */}
            <div className="absolute top-16 w-4/5 h-full border-t-4 border-l-4 border-r-4 border-white opacity-80 z-0"></div>
            <div className="absolute top-12 w-24 h-24 border-4 border-white rounded-full opacity-60 z-0"></div>
            
            {/* Human Goalkeeper */}
            <motion.div 
              initial={{ x: 0, y: 0, rotate: 0 }}
              animate={result ? { 
                x: result.creatorChoice === "left" ? -70 : result.creatorChoice === "right" ? 70 : 0, 
                y: result.creatorChoice === "center" ? -15 : 20,
                rotate: result.creatorChoice === "left" ? -75 : result.creatorChoice === "right" ? 75 : 0 
              } : { y: [0, -5, 0] }}
              transition={{ type: "spring", stiffness: 120, damping: 14, repeat: !result ? Infinity : 0, duration: 0.8 }}
              className="absolute top-12 w-16 h-16 text-black z-20 flex flex-col items-center drop-shadow-xl"
            >
              {/* Goalie SVG */}
              <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full">
                <circle cx="12" cy="5" r="3.5" fill="#fcd34d" /> {/* Yellow Jersey Head */}
                <path d="M4 9h16v4h-3v-2H7v2H4z" fill="#000" /> {/* Arms stretched */}
                <path d="M8 9h8v7H8z" fill="#fcd34d" /> {/* Torso */}
                <path d="M9 16h6v6h-2v-4h-2v4H9z" fill="#000" /> {/* Legs */}
              </svg>
            </motion.div>
            
            {/* The Ball & Interaction Targets */}
            <div className="grid grid-cols-3 w-full h-full gap-2 z-30 pt-16">
              {["left", "center", "right"].map(opt => (
                <button key={opt} onClick={() => handleGuess(opt)} disabled={isProcessing || result} className="h-full flex items-end justify-center pb-2 cursor-pointer group">
                  {(!selectedOption || selectedOption === opt) && (
                    <motion.div 
                      initial={{ y: 0, scale: 1, rotate: 0 }}
                      animate={result && selectedOption === opt ? { y: -120, scale: 0.6, rotate: 360 } : {}}
                      transition={{ type: "spring", stiffness: 100, damping: 15 }}
                      className={`w-10 h-10 rounded-full bg-white border-2 border-black drop-shadow-2xl flex items-center justify-center ${selectedOption === opt && result ? 'opacity-100' : 'group-hover:scale-110 transition-transform'}`}
                    >
                      {/* Soccer Ball Pattern */}
                      <div className="w-4 h-4 bg-black rounded-sm rotate-45"></div>
                    </motion.div>
                  )}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* 2. REALISTIC 3-CUP SHUFFLE */}
        {game.gameType === "shuffle" && (
           <div className="relative w-full bg-gradient-to-b from-[#8B4513] to-[#5C2E0B] p-6 border-4 border-[#3E1F07] shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex items-center justify-center min-h-[220px]">
             
             {/* Wood grain overlay */}
             <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'repeating-linear-gradient(90deg, transparent, transparent 10px, rgba(0,0,0,0.2) 10px, rgba(0,0,0,0.2) 20px)' }}></div>

             <div className="grid grid-cols-3 gap-6 relative z-10 w-full max-w-[300px]">
               {["cup_1", "cup_2", "cup_3"].map(opt => (
                 <div key={opt} className="relative flex flex-col items-center">
                   
                   {/* The Gold Coin (Prize) */}
                   {result && result.creatorChoice === opt && (
                     <div className="absolute bottom-2 w-10 h-10 bg-yellow-400 rounded-full border-4 border-yellow-600 z-0 flex items-center justify-center shadow-inner">
                       <span className="text-yellow-700 font-black text-sm">UGX</span>
                     </div>
                   )}
                   
                   {/* The 3D Cup */}
                   <motion.button 
                     onClick={() => handleGuess(opt)} disabled={isProcessing || result}
                     animate={result && (selectedOption === opt || result.creatorChoice === opt) ? { y: -70, rotate: -5 } : { y: 0 }}
                     transition={{ type: "spring", stiffness: 80, damping: 12, delay: result && selectedOption !== opt ? 0.6 : 0 }}
                     className="w-16 h-24 relative z-10 cursor-pointer group"
                   >
                      {/* Cup Body (Trapezoid) */}
                      <div className="w-full h-full bg-gradient-to-r from-red-800 via-red-500 to-red-800 shadow-2xl transition-transform group-hover:-translate-y-2" style={{ clipPath: 'polygon(15% 0%, 85% 0%, 100% 100%, 0% 100%)' }}>
                        {/* Cup Rim */}
                        <div className="absolute top-0 w-full h-3 bg-red-700 rounded-[50%]"></div>
                        <div className="absolute bottom-1 w-full text-center text-red-900/40 font-black text-2xl">{opt.split("_")[1]}</div>
                      </div>
                   </motion.button>
                   
                   {/* Shadow under the cup */}
                   <div className="w-14 h-3 bg-black/40 rounded-[50%] mt-1 z-0 blur-[2px]"></div>
                 </div>
               ))}
             </div>
           </div>
        )}

        {/* 3. GLOSSY COLOR MINEFIELD */}
        {game.gameType === "color" && (
          <div className="grid grid-cols-2 gap-6 bg-gray-900 p-6 border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
            {["blue", "yellow"].map((color) => (
              <motion.button 
                key={color} onClick={() => handleGuess(color)} disabled={isProcessing || result}
                animate={result && selectedOption === color ? { rotateY: 180, scale: 1.05 } : {}}
                transition={{ duration: 0.6, type: "spring" }}
                className={`aspect-square relative cursor-pointer group rounded-xl border-b-8 border-r-8 active:border-b-0 active:border-r-0 active:translate-y-2 active:translate-x-2 transition-all duration-75 ${
                  color === "blue" ? "bg-gradient-to-br from-blue-400 to-blue-700 border-blue-900" : "bg-gradient-to-br from-yellow-300 to-yellow-500 border-yellow-700"
                } ${(result && selectedOption !== color) ? "opacity-30 grayscale" : ""}`}
              >
                {/* Tile Gloss Effect */}
                <div className="absolute top-2 left-2 w-1/3 h-1/4 bg-white/20 rounded-full blur-[4px]"></div>

                {result && selectedOption === color && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="rotate-y-180 absolute inset-0 flex items-center justify-center">
                    {result.outcome === "player_b_won" ? (
                      <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-lg">
                        <span className="text-4xl text-green-500 font-black">✓</span>
                      </div>
                    ) : (
                      <div className="w-16 h-16 bg-black rounded-full flex items-center justify-center shadow-lg border-4 border-red-500">
                        <span className="text-4xl text-red-500 font-black">💥</span>
                      </div>
                    )}
                  </motion.div>
                )}
              </motion.button>
            ))}
          </div>
        )}

        {/* 4. REALISTIC DICE ROLL (Bonus/Future-Proof Mode) */}
        {game.gameType === "dice" && (
          <div className="relative w-full bg-gradient-to-b from-green-700 to-green-900 p-4 border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] rounded-sm">
            <p className="text-center text-green-300 font-black text-xs mb-4 tracking-widest uppercase">Select the winning number</p>
            <div className="grid grid-cols-3 gap-3">
              {[1, 2, 3, 4, 5, 6].map((num) => (
                <button 
                  key={num} onClick={() => handleGuess(num.toString())} disabled={isProcessing || result}
                  className="aspect-square bg-white rounded-xl shadow-[0_6px_0_0_#d1d5db] active:shadow-none active:translate-y-[6px] transition-all flex flex-col items-center justify-center p-2 relative group"
                >
                  {result && selectedOption === num.toString() && (
                    <motion.div 
                      initial={{ opacity: 0, scale: 0.5, rotate: -180 }} animate={{ opacity: 1, scale: 1, rotate: 0 }} 
                      className="absolute inset-0 flex items-center justify-center bg-black/80 rounded-xl z-20"
                    >
                       <span className="text-4xl font-black text-yellow-400">
                         {result.outcome === "player_b_won" ? "✓" : "✗"}
                       </span>
                    </motion.div>
                  )}
                  <span className="text-3xl font-black text-gray-900">{num}</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Post-Game Receipt Action */}
      {result && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.5 }}>
          <div className="bg-gray-50 border-2 border-gray-200 p-4 mb-4 flex items-center justify-between text-sm font-black">
            <span className="text-gray-500 uppercase">Creator's Secret was:</span>
            <span className="text-gray-900 bg-yellow-400 px-3 py-1 border-2 border-black uppercase">{result.creatorChoice.replace("_", " ")}</span>
          </div>
          
          <button 
            onClick={() => router.push(`/verify/${params.gameId}`)} 
            className="w-full bg-black text-white font-black uppercase tracking-widest py-5 border-2 border-black hover:bg-gray-800 transition shadow-[4px_4px_0px_0px_rgba(250,204,21,1)] active:translate-y-1 active:shadow-none"
          >
            Get Cryptographic Receipt
          </button>
        </motion.div>
      )}
    </div>
  );
}
