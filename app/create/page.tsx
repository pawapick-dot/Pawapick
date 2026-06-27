// app/create/page.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import { Lock, Target, Coins, ShieldCheck, ArrowRight } from "lucide-react";

export default function CreateGame() {
  const router = useRouter();
  const { user, loading, openAuthModal } = useAuth();
  
  const [step, setStep] = useState(1);
  const [gameType, setGameType] = useState("");
  const [stakeAmount, setStakeAmount] = useState(1000);
  const [creatorChoice, setCreatorChoice] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  // Auto-advance when selecting a game
  const handleSelectGame = (type: string) => {
    setGameType(type);
    setStep(2);
  };

  const handleCreate = async () => {
    if (!user) return openAuthModal();
    if (!creatorChoice) return toast.error("You must hide a choice!");

    setIsProcessing(true);
    
    try {
      const token = await user.getIdToken();
      toast.promise(
        fetch("/api/games/create", {
          method: "POST",
          headers: { 
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}` 
          },
          body: JSON.stringify({ gameType, stakeAmount, creatorChoice }),
        }).then(async (res) => {
          const data = await res.json();
          if (!res.ok) throw new Error(data.error);
          return data;
        }),
        {
          loading: "Locking funds & generating hash...",
          success: (data) => {
            setTimeout(() => router.push("/dashboard"), 1000);
            return "Trap set! Match is now live on the feed.";
          },
          error: (err) => {
            setIsProcessing(false);
            return err.message;
          },
        }
      );
    } catch (error) {
      toast.error("Authentication error");
      setIsProcessing(false);
    }
  };

  if (loading) return <div className="p-8 text-center animate-pulse font-bold tracking-widest text-gray-400">Loading...</div>;

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
        <div className="w-20 h-20 bg-yellow-400 flex items-center justify-center mb-6 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
          <Lock size={32} className="text-black" />
        </div>
        <h1 className="text-3xl font-black text-gray-900 tracking-tight uppercase">Creation Locked</h1>
        <p className="text-gray-500 font-medium mt-2 max-w-sm text-sm">
          You must log in to access the escrow engine and set challenges.
        </p>
        <button 
          onClick={openAuthModal}
          className="mt-8 bg-black text-white font-black uppercase tracking-widest text-sm px-10 py-5 hover:bg-gray-800 transition-all"
        >
          Verify Identity
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto space-y-6 mt-4 pb-12 px-4">
      
      {/* Progress Bar */}
      <div className="flex gap-2 mb-8">
        {[1, 2, 3].map((num) => (
          <div key={num} className={`h-2 flex-1 transition-all duration-300 ${step >= num ? 'bg-yellow-400' : 'bg-gray-200'}`} />
        ))}
      </div>

      {/* STEP 1: CHOOSE BATTLEFIELD */}
      {step === 1 && (
        <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
          <div>
            <h2 className="text-2xl font-black text-gray-900 uppercase tracking-tight">Choose Arena</h2>
            <p className="text-sm font-medium text-gray-500 mt-2">
              Select the battlefield. Each game has different psychological dynamics to outsmart your opponent.
            </p>
          </div>

          <div className="space-y-4">
            <button 
              onClick={() => handleSelectGame("penalty")} 
              className="w-full bg-green-500 border-2 border-green-700 p-6 flex items-center justify-between hover:bg-green-600 hover:shadow-[4px_4px_0px_0px_rgba(21,128,61,1)] active:translate-y-1 active:shadow-none transition-all group"
            >
              <div className="text-left">
                <p className="font-black text-white uppercase text-xl">Penalty Shootout</p>
                <p className="text-green-100 font-medium text-xs mt-1">3 Options • 33% Win Chance</p>
              </div>
              <Target size={32} className="text-green-200 group-hover:text-white transition-colors" />
            </button>

            <button 
              onClick={() => handleSelectGame("color")} 
              className="w-full bg-blue-500 border-2 border-blue-700 p-6 flex items-center justify-between hover:bg-blue-600 hover:shadow-[4px_4px_0px_0px_rgba(29,78,216,1)] active:translate-y-1 active:shadow-none transition-all group"
            >
              <div className="text-left">
                <p className="font-black text-white uppercase text-xl">Color Minefield</p>
                <p className="text-blue-100 font-medium text-xs mt-1">2 Options • 50% Win Chance</p>
              </div>
              <div className="flex gap-1">
                <div className="w-4 h-8 bg-blue-300 border border-blue-200"></div>
                <div className="w-4 h-8 bg-yellow-400 border border-yellow-200"></div>
              </div>
            </button>

            <button 
              onClick={() => handleSelectGame("shuffle")} 
              className="w-full bg-red-500 border-2 border-red-700 p-6 flex items-center justify-between hover:bg-red-600 hover:shadow-[4px_4px_0px_0px_rgba(185,28,28,1)] active:translate-y-1 active:shadow-none transition-all group"
            >
              <div className="text-left">
                <p className="font-black text-white uppercase text-xl">3-Cup Shuffle</p>
                <p className="text-red-100 font-medium text-xs mt-1">3 Options • 33% Win Chance</p>
              </div>
              <div className="flex gap-1">
                <div className="w-6 h-8 bg-red-700 rounded-t-sm rounded-b-lg"></div>
                <div className="w-6 h-8 bg-red-700 rounded-t-sm rounded-b-lg"></div>
              </div>
            </button>
          </div>
        </div>
      )}

      {/* STEP 2: SET STAKE */}
      {step === 2 && (
        <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
          <button onClick={() => setStep(1)} className="text-[10px] font-black text-gray-400 uppercase tracking-widest hover:text-black">← Back</button>
          
          <div>
            <h2 className="text-2xl font-black text-gray-900 uppercase tracking-tight">Define Stakes</h2>
            <p className="text-sm font-medium text-gray-500 mt-2">
              How much UGX are you willing to lock in the smart escrow? High stakes attract faster challengers.
            </p>
          </div>

          <div className="bg-yellow-50 border-2 border-yellow-400 p-8 text-center">
            <Coins size={32} className="mx-auto text-yellow-500 mb-4" />
            <input 
              type="number" 
              value={stakeAmount} 
              onChange={(e) => setStakeAmount(Number(e.target.value))}
              className="w-full text-center text-4xl font-black bg-transparent border-b-4 border-yellow-300 focus:outline-none focus:border-yellow-500 pb-2 text-black"
            />
            <span className="block mt-2 font-black text-gray-500 uppercase tracking-widest text-xs">UGX</span>
          </div>

          <div className="grid grid-cols-3 gap-2">
            {[1000, 5000, 10000].map(amt => (
              <button 
                key={amt} 
                onClick={() => setStakeAmount(amt)}
                className="bg-white border-2 border-gray-200 py-4 font-black text-gray-900 hover:border-yellow-400 transition-colors"
              >
                {amt.toLocaleString()}
              </button>
            ))}
          </div>

          <button 
            onClick={() => setStep(3)} 
            className="w-full bg-black text-white font-black py-5 uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-gray-800 transition-colors shadow-[4px_4px_0px_0px_rgba(250,204,21,1)]"
          >
            Confirm Stake <ArrowRight size={18} />
          </button>
        </div>
      )}

      {/* STEP 3: SET TRAP */}
      {step === 3 && (
        <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
          <button onClick={() => setStep(2)} className="text-[10px] font-black text-gray-400 uppercase tracking-widest hover:text-black">← Back</button>
          
          <div>
            <h2 className="text-2xl font-black text-gray-900 uppercase tracking-tight">Set the Trap</h2>
            <p className="text-sm font-medium text-gray-500 mt-2">
              Hide your choice. Once submitted, this selection is cryptographically sealed and cannot be changed.
            </p>
          </div>

          <div className="bg-gray-50 border-2 border-gray-200 p-6">
            
            {gameType === "penalty" && (
              <div className="grid grid-cols-3 gap-3">
                {["left", "center", "right"].map(opt => (
                  <button 
                    key={opt} 
                    onClick={() => setCreatorChoice(opt)} 
                    className={`py-8 font-black uppercase border-2 transition-all ${creatorChoice === opt ? 'bg-green-500 text-white border-green-700 shadow-[4px_4px_0px_0px_rgba(21,128,61,1)]' : 'bg-white text-gray-400 border-gray-200 hover:border-gray-400'}`}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            )}

            {gameType === "color" && (
              <div className="grid grid-cols-2 gap-4">
                {["blue", "yellow"].map(opt => (
                  <button 
                    key={opt} 
                    onClick={() => setCreatorChoice(opt)} 
                    className={`py-12 font-black uppercase border-2 transition-all ${
                      creatorChoice === opt && opt === "blue" ? 'bg-blue-500 text-white border-blue-700 shadow-[4px_4px_0px_0px_rgba(29,78,216,1)]' : 
                      creatorChoice === opt && opt === "yellow" ? 'bg-yellow-400 text-black border-yellow-600 shadow-[4px_4px_0px_0px_rgba(202,138,4,1)]' : 
                      'bg-white text-gray-400 border-gray-200 hover:border-gray-400'
                    }`}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            )}

            {gameType === "shuffle" && (
               <div className="grid grid-cols-3 gap-3">
                 {["cup_1", "cup_2", "cup_3"].map(opt => (
                   <button 
                     key={opt} 
                     onClick={() => setCreatorChoice(opt)} 
                     className={`py-8 font-black uppercase text-xs border-2 transition-all ${creatorChoice === opt ? 'bg-red-500 text-white border-red-700 shadow-[4px_4px_0px_0px_rgba(185,28,28,1)]' : 'bg-white text-gray-400 border-gray-200 hover:border-gray-400'}`}
                   >
                     {opt.replace("_", " ")}
                   </button>
                 ))}
               </div>
            )}
          </div>

          <div className="bg-gray-900 text-gray-400 p-4 flex items-start gap-3 text-xs font-medium">
            <ShieldCheck size={16} className="text-yellow-400 shrink-0 mt-0.5" />
            <p>Your stake of <strong className="text-white">{stakeAmount.toLocaleString()} UGX</strong> will be locked. This hash will be publicly verifiable.</p>
          </div>

          <button 
            onClick={handleCreate} 
            disabled={!creatorChoice || isProcessing}
            className={`w-full font-black py-5 uppercase tracking-widest transition-all ${!creatorChoice || isProcessing ? 'bg-gray-200 text-gray-400 cursor-not-allowed' : 'bg-yellow-400 text-black border-2 border-black hover:bg-yellow-500 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:translate-y-1 active:shadow-none'}`}
          >
            {isProcessing ? "Deploying Smart Escrow..." : "Lock Escrow & Deploy"}
          </button>
        </div>
      )}
    </div>
  );
}
