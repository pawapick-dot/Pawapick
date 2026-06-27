// app/play/[gameId]/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/context/AuthContext";
import { ArrowLeft, Info, CheckCircle2, XCircle, Home, RotateCcw } from "lucide-react";

type GameState = "loading" | "idle" | "confirming" | "locked" | "revealing" | "result";

export default function PlayGame({ params }: { params: { gameId: string } }) {
  const router = useRouter();
  const { user, loading: authLoading, openAuthModal } = useAuth();

  const [game, setGame] = useState<any>(null);
  const [result, setResult] = useState<any>(null);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [gameState, setGameState] = useState<GameState>("loading");

  useEffect(() => {
    fetch(`/api/games/feed`)
      .then((res) => res.json())
      .then((data) => {
        const found = data.games?.find((g: any) => g.id === params.gameId);
        setGame(found);
        setGameState("idle");
      });
  }, [params.gameId]);

  const handleSelect = (option: string) => {
    if (gameState !== "idle") return;
    // Mobile haptic feedback (if supported)
    if (typeof window !== "undefined" && window.navigator && window.navigator.vibrate) {
      window.navigator.vibrate(10);
    }
    setSelectedOption(option);
    setGameState("confirming");
  };

  const handleConfirm = async () => {
    if (!user) return openAuthModal();
    if (game.creatorId === user.uid) return toast.error("You cannot play your own game!");
    
    // Cinematic Lock
    setGameState("locked");

    try {
      const token = await user.getIdToken();
      const res = await fetch("/api/games/resolve", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ gameId: params.gameId, guess: selectedOption }),
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      
      setResult(data);
      
      // Cinematic pause before reveal
      setTimeout(() => {
        setGameState("revealing");
        // Wait for animation to finish before showing result screen
        setTimeout(() => {
          if (typeof window !== "undefined" && window.navigator && window.navigator.vibrate) {
             window.navigator.vibrate(data.outcome === "player_b_won" ? [50, 50, 100] : 50);
          }
          setGameState("result");
        }, 1500); 
      }, 1000);

    } catch (error: any) {
      toast.error(error.message || "Something went wrong.");
      setGameState("idle");
      setSelectedOption(null);
    }
  };

  if (authLoading || gameState === "loading" || !game) {
    return (
      <div className="w-full min-h-screen bg-slate-50 flex items-center justify-center">
        <p className="text-slate-400 font-medium animate-pulse">Loading Arena...</p>
      </div>
    );
  }

  const potentialPrize = game.stakeAmount * 2 * 0.9;
  const isWon = result?.outcome === "player_b_won";

  return (
    <div className="w-full min-h-screen bg-slate-50 flex flex-col relative overflow-hidden">
      
      {/* 1. HEADER */}
      <header className="w-full px-4 py-5 flex items-center justify-between z-10 relative">
        <button 
          onClick={() => router.push("/feed")}
          disabled={gameState !== "idle" && gameState !== "confirming"}
          className={`flex items-center gap-1 font-semibold text-sm transition-colors ${gameState === "idle" || gameState === "confirming" ? "text-slate-500 hover:text-slate-900" : "text-slate-300 cursor-not-allowed"}`}
        >
          <ArrowLeft size={18} /> {game.gameType.replace("_", " ")}
        </button>
        
        {/* Subtle timer placeholder as requested in design */}
        <div className="text-slate-400 font-medium text-sm flex items-center gap-1.5">
           vs {game.creatorUsername}
        </div>
      </header>

      {/* 2. HERO AREA (The Game Board) */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 w-full max-w-lg mx-auto z-10">
        
        {/* PENALTY SHOOTOUT */}
        {game.gameType === "penalty" && (
          <div className="w-full flex flex-col items-center justify-center space-y-12">
            <div className="relative w-full max-w-[280px] aspect-video flex flex-col items-center justify-end border-b-2 border-slate-200 pb-2">
              {/* Goal Net */}
              <div className="absolute top-0 w-4/5 h-full border-t-4 border-l-4 border-r-4 border-slate-300 rounded-t-lg opacity-50">
                {/* Net Pattern */}
                <div className="w-full h-full" style={{ backgroundImage: 'linear-gradient(45deg, #cbd5e1 25%, transparent 25%, transparent 75%, #cbd5e1 75%, #cbd5e1), linear-gradient(45deg, #cbd5e1 25%, transparent 25%, transparent 75%, #cbd5e1 75%, #cbd5e1)', backgroundSize: '10px 10px', backgroundPosition: '0 0, 5px 5px', opacity: 0.3 }}></div>
              </div>

              {/* Keeper Emoji */}
              <motion.div 
                initial={{ x: 0, y: 0 }}
                animate={
                  gameState === "revealing" || gameState === "result"
                    ? { 
                        x: result.creatorChoice === "left" ? -80 : result.creatorChoice === "right" ? 80 : 0,
                        y: result.creatorChoice === "center" ? -20 : -10,
                        rotate: result.creatorChoice === "left" ? -45 : result.creatorChoice === "right" ? 45 : 0 
                      } 
                    : { y: [0, -5, 0] }
                }
                transition={gameState === "idle" || gameState === "confirming" ? { repeat: Infinity, duration: 1.5 } : { type: "spring", stiffness: 100 }}
                className="text-6xl z-10"
              >
                🧍
              </motion.div>

              {/* Ball Emoji */}
              <motion.div
                initial={{ y: 0, x: 0, scale: 1 }}
                animate={
                  (gameState === "revealing" || gameState === "result") && selectedOption
                    ? { 
                        y: -80, 
                        x: selectedOption === "left" ? -80 : selectedOption === "right" ? 80 : 0,
                        scale: 0.7 
                      }
                    : { y: 0, x: 0 }
                }
                transition={{ type: "spring", stiffness: 90 }}
                className="text-4xl absolute -bottom-6 z-20"
              >
                ⚽
              </motion.div>
            </div>

            <p className="text-slate-500 font-medium text-lg">Where will the keeper dive?</p>

            {/* Controls */}
            <div className={`grid grid-cols-3 gap-6 w-full max-w-[280px] transition-opacity ${(gameState === "locked" || gameState === "revealing" || gameState === "result") ? "opacity-0 pointer-events-none" : "opacity-100"}`}>
              {["left", "center", "right"].map((opt) => (
                <button 
                  key={opt}
                  onClick={() => handleSelect(opt)}
                  className={`aspect-square rounded-full flex flex-col items-center justify-center transition-all ${selectedOption === opt ? "bg-blue-100 border-2 border-blue-500 text-blue-700 shadow-sm" : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 shadow-sm"}`}
                >
                  <span className="text-xl">{opt === "left" ? "←" : opt === "right" ? "→" : "↑"}</span>
                  <span className="text-xs font-semibold uppercase mt-1">{opt}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* 3-CUP SHUFFLE */}
        {game.gameType === "shuffle" && (
          <div className="w-full flex flex-col items-center justify-center space-y-16 mt-10">
            
            <div className="flex gap-6 relative">
              {["cup_1", "cup_2", "cup_3"].map((opt, i) => (
                <div key={opt} className="relative flex flex-col items-center">
                  {/* Coin (Revealed under chosen or correct cup) */}
                  {(gameState === "revealing" || gameState === "result") && result?.creatorChoice === opt && (
                    <div className="absolute bottom-2 text-3xl z-0">
                      🪙
                    </div>
                  )}

                  {/* Cup */}
                  <motion.button
                    onClick={() => handleSelect(opt)}
                    animate={
                      (gameState === "revealing" || gameState === "result") && (result?.creatorChoice === opt || selectedOption === opt)
                        ? { y: -50 }
                        : { y: 0 }
                    }
                    transition={{ type: "spring", stiffness: 100 }}
                    className={`text-7xl relative z-10 transition-all ${selectedOption === opt && gameState === "confirming" ? "drop-shadow-[0_0_15px_rgba(37,99,235,0.4)] scale-110" : ""}`}
                  >
                    🥤
                  </motion.button>
                </div>
              ))}
            </div>

            <p className="text-slate-500 font-medium text-lg">Where is the coin?</p>
          </div>
        )}

        {/* COLOR CARDS */}
        {game.gameType === "color" && (
          <div className="w-full flex flex-col items-center justify-center space-y-12">
            
            <div className="flex gap-8">
              {["blue", "yellow"].map((color) => (
                <motion.button
                  key={color}
                  onClick={() => handleSelect(color)}
                  animate={
                    (gameState === "revealing" || gameState === "result") && selectedOption === color
                      ? { rotateY: 180, scale: 1.05 }
                      : { rotateY: 0, scale: selectedOption === color && gameState === "confirming" ? 1.05 : 1 }
                  }
                  transition={{ type: "spring", stiffness: 80 }}
                  className={`w-32 h-40 rounded-2xl relative shadow-md transition-shadow ${selectedOption === color && gameState === "confirming" ? "shadow-[0_0_20px_rgba(37,99,235,0.4)]" : ""} ${color === "blue" ? "bg-blue-500" : "bg-yellow-400"}`}
                  style={{ transformStyle: "preserve-3d" }}
                >
                  {/* Card Back (Result) */}
                  {(gameState === "revealing" || gameState === "result") && selectedOption === color && (
                    <div className="absolute inset-0 flex items-center justify-center bg-white rounded-2xl shadow-inner border border-slate-100" style={{ transform: "rotateY(180deg)", backfaceVisibility: "hidden" }}>
                       {result?.outcome === "player_b_won" ? (
                         <span className="text-5xl">🎉</span>
                       ) : (
                         <span className="text-5xl">💥</span>
                       )}
                    </div>
                  )}
                </motion.button>
              ))}
            </div>

            <p className="text-slate-500 font-medium text-lg">Pick the safe card</p>
          </div>
        )}
      </main>

      {/* 3. BOTTOM ACTION AREA */}
      <div className="w-full max-w-lg mx-auto p-4 z-20 min-h-[140px] flex flex-col justify-end">
        
        <AnimatePresence mode="wait">
          
          {/* CONFIRMATION STATE */}
          {gameState === "confirming" && (
            <motion.div 
              key="confirming"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 20, opacity: 0 }}
              className="bg-white rounded-2xl p-4 shadow-[0_-4px_20px_rgba(0,0,0,0.05)] border border-slate-100"
            >
              <p className="text-center text-sm font-medium text-slate-500 mb-4">
                You selected <span className="font-bold text-slate-900 uppercase">{selectedOption?.replace("_", " ")}</span>
              </p>
              <div className="flex gap-3">
                <button 
                  onClick={() => { setSelectedOption(null); setGameState("idle"); }}
                  className="flex-1 py-3.5 rounded-xl font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors"
                >
                  Change
                </button>
                <button 
                  onClick={handleConfirm}
                  className="flex-1 py-3.5 rounded-xl font-bold text-white bg-blue-600 hover:bg-blue-700 transition-colors shadow-sm"
                >
                  Confirm
                </button>
              </div>
            </motion.div>
          )}

          {/* LOCKED / REVEALING STATE */}
          {(gameState === "locked" || gameState === "revealing") && (
            <motion.div 
              key="locked"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="bg-white rounded-2xl p-6 shadow-[0_-4px_20px_rgba(0,0,0,0.05)] border border-slate-100 text-center"
            >
              <div className="w-8 h-8 mx-auto border-4 border-slate-200 border-t-blue-600 rounded-full animate-spin mb-3"></div>
              <p className="font-bold text-slate-900">
                {gameState === "locked" ? "Choice Locked ✓" : "Checking..."}
              </p>
            </motion.div>
          )}

        </AnimatePresence>
      </div>

      {/* 4. ABSOLUTE RESULT SCREEN OVERLAY */}
      <AnimatePresence>
        {gameState === "result" && (
          <motion.div 
            initial={{ opacity: 0, y: "100%" }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: "spring", damping: 20, stiffness: 100 }}
            className={`absolute inset-0 z-50 flex flex-col items-center justify-center p-6 ${isWon ? "bg-emerald-50" : "bg-slate-50"}`}
          >
            <div className="text-center space-y-6 max-w-sm w-full">
              
              <div className="text-6xl mb-6">
                {isWon ? "🎉" : "😔"}
              </div>

              <h1 className={`text-4xl font-extrabold tracking-tight ${isWon ? "text-emerald-900" : "text-slate-900"}`}>
                {isWon ? "You Won!" : "Better Luck Next Time"}
              </h1>

              <div className={`py-4 rounded-2xl ${isWon ? "bg-emerald-100/50" : "bg-slate-100"}`}>
                <p className={`text-3xl font-black ${isWon ? "text-emerald-600" : "text-slate-500"}`}>
                  {isWon ? "+" : "-"}{game.stakeAmount.toLocaleString()} UGX
                </p>
                {isWon && <p className="text-sm font-semibold text-emerald-700 mt-2">Wallet Updated</p>}
              </div>

              <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm mb-8 text-sm font-medium text-slate-600 flex justify-between items-center">
                <span>Creator's choice was:</span>
                <span className="font-bold text-slate-900 uppercase px-3 py-1 bg-slate-100 rounded-lg">{result?.creatorChoice.replace("_", " ")}</span>
              </div>

              <div className="space-y-3 pt-4">
                <button 
                  onClick={() => router.push("/feed")}
                  className="w-full flex items-center justify-center gap-2 bg-slate-900 text-white font-bold py-4 rounded-xl hover:bg-slate-800 transition shadow-sm"
                >
                  <RotateCcw size={18} /> Play Again
                </button>
                <button 
                  onClick={() => router.push("/dashboard")}
                  className="w-full flex items-center justify-center gap-2 bg-white text-slate-700 font-bold py-4 rounded-xl border border-slate-200 hover:bg-slate-50 transition"
                >
                  <Home size={18} /> Home
                </button>
              </div>

            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Subtle Info Button (Hidden during animation/result) */}
      {gameState === "idle" && (
        <button className="absolute bottom-6 left-6 text-slate-400 hover:text-slate-600 transition p-2 bg-white rounded-full shadow-sm border border-slate-100 z-10">
          <Info size={18} />
        </button>
      )}

    </div>
  );
}
