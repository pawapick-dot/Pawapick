// app/create/page.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export default function CreateChallenge() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [gameType, setGameType] = useState("");
  const [stake, setStake] = useState(5000);
  const [choice, setChoice] = useState("");

  const games = [
    { id: "penalty", name: "Penalty Shootout", desc: "Shoot Left, Center, or Right" },
    { id: "dice", name: "High Roller Dice", desc: "Roll high to win the pot" },
    { id: "shuffle", name: "3-Cup Shuffle", desc: "Hide a coin under a cup" },
    { id: "color", name: "Color Minefield", desc: "Pick Blue or Yellow" },
  ];

  const handleNextStep = () => {
    if (step === 1 && !gameType) return toast.error("Please select a game first");
    if (step === 2 && (!stake || stake < 1000)) return toast.error("Minimum stake is 1,000 UGX");
    if (step === 3 && !choice) return toast.error("Please lock in your choice");
    setStep((prev) => prev + 1);
  };

  const handleCreateGame = async () => {
    toast.promise(
      fetch("/api/games/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ gameType, stakeAmount: stake, creatorChoice: choice }),
      }).then(async (res) => {
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed to post challenge");
        router.push("/dashboard");
        return data;
      }),
      {
        loading: "Generating security hashes and locking funds...",
        success: "Challenge is live on the global Pawa Pick feed!",
        error: (err) => err.message,
      }
    );
  };

  return (
    <div className="max-w-md mx-auto space-y-6 mt-4 pb-12">
      <div className="flex items-center justify-between px-2">
        <button onClick={() => step > 1 ? setStep(step - 1) : router.push("/dashboard")} className="text-sm font-semibold text-gray-500">
          ← Back
        </button>
        <span className="text-xs font-mono font-bold bg-gray-100 text-gray-600 px-3 py-1 rounded-full">
          STEP {step} OF 4
        </span>
      </div>

      {/* Step 1: Choose Game */}
      {step === 1 && (
        <div className="space-y-4">
          <h2 className="text-2xl font-bold tracking-tight px-1">Select a Game</h2>
          <div className="space-y-3">
            {games.map((g) => (
              <button
                key={g.id}
                onClick={() => setGameType(g.id)}
                className={`w-full text-left p-5 rounded-3xl border transition ${
                  gameType === g.id ? "bg-gray-900 text-white border-gray-900" : "bg-white text-gray-900 border-gray-100 shadow-sm"
                }`}
              >
                <p className="font-bold text-lg">{g.name}</p>
                <p className={`text-xs mt-1 ${gameType === g.id ? "text-gray-300" : "text-gray-400"}`}>{g.desc}</p>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Step 2: Choose Stake */}
      {step === 2 && (
        <div className="space-y-4">
          <h2 className="text-2xl font-bold tracking-tight px-1">Configure Stake</h2>
          <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm space-y-6">
            <div className="grid grid-cols-3 gap-2">
              {[2000, 5000, 10000].map((amt) => (
                <button
                  key={amt}
                  onClick={() => setStake(amt)}
                  className={`py-3 rounded-xl font-bold border text-sm transition ${
                    stake === amt ? "bg-gray-900 text-white border-gray-900" : "bg-gray-50 border-gray-200"
                  }`}
                >
                  {amt.toLocaleString()}
                </button>
              ))}
            </div>
            <div className="space-y-2">
              <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider block">Custom Amount (UGX)</label>
              <input
                type="number"
                value={stake}
                onChange={(e) => setStake(Number(e.target.value))}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 font-bold text-lg focus:outline-none focus:border-gray-900"
                placeholder="Enter amount"
              />
            </div>
          </div>
        </div>
      )}

      {/* Step 3: Setup the Trap Choice */}
      {step === 3 && (
        <div className="space-y-4">
          <h2 className="text-2xl font-bold tracking-tight px-1">Make Your Secret Choice</h2>
          <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm">
            
            {gameType === "penalty" && (
              <div className="grid grid-cols-3 gap-2">
                {["left", "center", "right"].map((dir) => (
                  <button key={dir} onClick={() => setChoice(dir)} className={`py-6 rounded-xl font-bold border uppercase tracking-wider text-xs ${choice === dir ? "bg-gray-900 text-white" : "bg-gray-50"}`}>
                    {dir}
                  </button>
                ))}
              </div>
            )}

            {gameType === "color" && (
              <div className="grid grid-cols-2 gap-3">
                {["blue", "yellow"].map((col) => (
                  <button key={col} onClick={() => setChoice(col)} className={`py-12 rounded-xl font-bold border uppercase tracking-wider text-sm ${choice === col ? "bg-gray-900 text-white" : "bg-gray-50"}`}>
                    {col}
                  </button>
                ))}
              </div>
            )}

            {gameType === "shuffle" && (
              <div className="grid grid-cols-3 gap-2">
                {["cup_1", "cup_2", "cup_3"].map((cup) => (
                  <button key={cup} onClick={() => setChoice(cup)} className={`py-8 rounded-xl font-bold border text-xs uppercase ${choice === cup ? "bg-gray-900 text-white" : "bg-gray-50"}`}>
                    {cup.replace("_", " ")}
                  </button>
                ))}
              </div>
            )}

            {gameType === "dice" && (
              <div className="space-y-3">
                <p className="text-xs text-gray-400 text-center mb-2">In High Roller, the system registers a random auto-roll for you.</p>
                <button onClick={() => setChoice("autoroll")} className={`w-full py-4 rounded-xl font-bold border uppercase tracking-wider text-xs ${choice === "autoroll" ? "bg-gray-900 text-white" : "bg-gray-50"}`}>
                  Authorize System Roll
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Step 4: Final Confirmation */}
      {step === 4 && (
        <div className="space-y-4">
          <h2 className="text-2xl font-bold tracking-tight px-1">Confirm Challenge</h2>
          <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm space-y-4">
            <div className="flex justify-between border-b border-gray-100 pb-3 text-sm">
              <span className="text-gray-400">Game Mode</span>
              <span className="font-bold uppercase tracking-wide">{gameType}</span>
            </div>
            <div className="flex justify-between border-b border-gray-100 pb-3 text-sm">
              <span className="text-gray-400">Locked Stake</span>
              <span className="font-bold text-gray-900">{stake.toLocaleString()} UGX</span>
            </div>
            <div className="flex justify-between pb-1 text-sm">
              <span className="text-gray-400">Your Hidden Choice</span>
              <span className="font-bold text-gray-900 uppercase tracking-wider">{choice.replace("_", " ")}</span>
            </div>
            <p className="text-[11px] text-gray-400 text-center pt-4">
              Funds will be safely isolated in escrow. This entry cannot be modified once published to the feed.
            </p>
          </div>
        </div>
      )}

      {/* Navigation Footer Action */}
      <button
        onClick={step === 4 ? handleCreateGame : handleNextStep}
        className="w-full bg-gray-900 text-white font-medium py-4 rounded-xl hover:bg-gray-800 transition active:scale-[0.99] shadow-sm"
      >
        {step === 4 ? "Publish to Feed" : "Continue"}
      </button>
    </div>
  );
}
