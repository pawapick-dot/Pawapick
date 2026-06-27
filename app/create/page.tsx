// app/create/page.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import { Target, Coins, ShieldCheck, ArrowRight, ChevronRight, Lock } from "lucide-react";

export default function CreateGame() {
  const router = useRouter();
  const { user, loading, openAuthModal } = useAuth();
  
  const [step, setStep] = useState(1);
  const [gameType, setGameType] = useState("");
  const [stakeAmount, setStakeAmount] = useState(5000);
  const [creatorChoice, setCreatorChoice] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSelectGame = (type: string) => {
    setGameType(type);
    setStep(2);
  };

  const handleCreate = async () => {
    if (!user) return openAuthModal();
    if (!creatorChoice) return toast.error("Please make a selection.");

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
          loading: "Initializing smart escrow...",
          success: () => {
            setTimeout(() => router.push("/dashboard"), 1000);
            return "Market created successfully.";
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

  if (loading) return <div className="p-8 text-center font-medium text-slate-400">Loading portal...</div>;

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-6">
        <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mb-6">
          <Lock size={28} className="text-blue-600" />
        </div>
        <h1 className="text-2xl font-bold text-slate-900">Access Restricted</h1>
        <p className="text-slate-500 mt-2 max-w-sm text-sm">Please authenticate to manage your prediction markets.</p>
        <button onClick={openAuthModal} className="mt-8 bg-slate-900 text-white font-semibold px-8 py-3 rounded-xl hover:bg-slate-800 transition">
          Secure Login
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto py-8 px-4">
      
      {/* Progress */}
      <div className="flex gap-2 mb-10">
        {[1, 2, 3].map((num) => (
          <div key={num} className={`h-1.5 flex-1 rounded-full transition-colors ${step >= num ? 'bg-blue-600' : 'bg-slate-200'}`} />
        ))}
      </div>

      {step === 1 && (
        <div className="space-y-6">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">Select Market</h2>
            <p className="text-slate-500 mt-2 text-sm">Choose the category for your prediction.</p>
          </div>

          <div className="space-y-3">
            {[
              { id: "penalty", name: "Penalty Shootout", desc: "Choose the target zone (3 options)", color: "text-emerald-600" },
              { id: "color", name: "Color Minefield", desc: "Select the hidden tile (2 options)", color: "text-blue-600" },
              { id: "shuffle", name: "3-Cup Shuffle", desc: "Hide the prize under a cup (3 options)", color: "text-rose-600" }
            ].map(item => (
              <button 
                key={item.id}
                onClick={() => handleSelectGame(item.id)}
                className="w-full flex items-center justify-between p-5 bg-white border border-slate-200 rounded-2xl hover:border-blue-300 transition-all text-left group"
              >
                <div>
                  <p className={`font-semibold ${item.color}`}>{item.name}</p>
                  <p className="text-xs text-slate-400 mt-0.5">{item.desc}</p>
                </div>
                <ChevronRight size={18} className="text-slate-300 group-hover:text-blue-600" />
              </button>
            ))}
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-6">
          <button onClick={() => setStep(1)} className="text-xs font-semibold text-slate-400 hover:text-slate-900">← Back</button>
          <div>
            <h2 className="text-2xl font-bold text-slate-900">Commitment Amount</h2>
            <p className="text-slate-500 mt-2 text-sm">Set the amount for your prediction pool (UGX).</p>
          </div>

          <div className="bg-white p-8 border border-slate-200 rounded-2xl text-center">
            <input 
              type="number" 
              value={stakeAmount} 
              onChange={(e) => setStakeAmount(Number(e.target.value))}
              className="w-full text-center text-4xl font-bold bg-transparent focus:outline-none text-slate-900"
            />
            <p className="text-xs font-semibold text-slate-400 mt-2 uppercase tracking-widest">UGX</p>
          </div>

          <div className="grid grid-cols-3 gap-3">
            {[2000, 5000, 10000].map(amt => (
              <button key={amt} onClick={() => setStakeAmount(amt)} className="py-3 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-sm hover:border-blue-300 transition">
                {amt.toLocaleString()}
              </button>
            ))}
          </div>

          <button onClick={() => setStep(3)} className="w-full bg-blue-600 text-white font-semibold py-4 rounded-xl hover:bg-blue-700">Next Step</button>
        </div>
      )}

      {step === 3 && (
        <div className="space-y-6">
          <button onClick={() => setStep(2)} className="text-xs font-semibold text-slate-400 hover:text-slate-900">← Back</button>
          <div>
            <h2 className="text-2xl font-bold text-slate-900">Seal your Forecast</h2>
            <p className="text-slate-500 mt-2 text-sm">Make your selection. It will be cryptographically locked.</p>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-6">
            {gameType === "penalty" && (
              <div className="grid grid-cols-3 gap-3">
                {["left", "center", "right"].map(opt => (
                  <button key={opt} onClick={() => setCreatorChoice(opt)} className={`py-6 rounded-xl font-semibold capitalize ${creatorChoice === opt ? 'bg-blue-600 text-white' : 'bg-slate-50 text-slate-600'}`}>{opt}</button>
                ))}
              </div>
            )}
            {gameType === "color" && (
              <div className="grid grid-cols-2 gap-3">
                {["blue", "yellow"].map(opt => (
                  <button key={opt} onClick={() => setCreatorChoice(opt)} className={`py-6 rounded-xl font-semibold capitalize ${creatorChoice === opt ? 'bg-blue-600 text-white' : 'bg-slate-50 text-slate-600'}`}>{opt}</button>
                ))}
              </div>
            )}
            {gameType === "shuffle" && (
              <div className="grid grid-cols-3 gap-3">
                {["cup_1", "cup_2", "cup_3"].map(opt => (
                  <button key={opt} onClick={() => setCreatorChoice(opt)} className={`py-6 rounded-xl font-semibold capitalize ${creatorChoice === opt ? 'bg-blue-600 text-white' : 'bg-slate-50 text-slate-600'}`}>{opt.replace("_", " ")}</button>
                ))}
              </div>
            )}
          </div>

          <div className="bg-blue-50 p-4 rounded-xl flex gap-3">
            <ShieldCheck size={20} className="text-blue-600 shrink-0" />
            <p className="text-xs text-blue-900 font-medium">Your choice is hashed and sealed. This ensures absolute fairness for your challenger.</p>
          </div>

          <button 
            onClick={handleCreate} 
            disabled={!creatorChoice || isProcessing}
            className="w-full bg-slate-900 text-white font-semibold py-4 rounded-xl hover:bg-slate-800 disabled:bg-slate-300 transition"
          >
            {isProcessing ? "Deploying..." : "Launch Market"}
          </button>
        </div>
      )}
    </div>
  );
}
