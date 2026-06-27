// app/verify/[gameId]/page.tsx
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { 
  ShieldCheck, Copy, CheckCircle2, AlertTriangle, 
  ArrowLeft, Share2, Trophy, Clock, Wallet, ChevronDown 
} from "lucide-react";

export default function VerifyGame({ params }: { params: { gameId: string } }) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showCrypto, setShowCrypto] = useState(false);

  useEffect(() => {
    fetch(`/api/games/${params.gameId}`)
      .then((res) => res.json())
      .then((json) => {
        if (json.error) {
          toast.error(json.error);
        } else {
          setData(json);
        }
      })
      .catch(() => toast.error("Failed to fetch receipt."))
      .finally(() => setLoading(false));
  }, [params.gameId]);

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied!`);
  };

  const handleShare = async () => {
    const shareData = {
      title: "Verified Match Receipt",
      text: `View the verified receipt and cryptographic proof for match ${params.gameId}`,
      url: window.location.href,
    };
    try {
      if (navigator.share) await navigator.share(shareData);
      else copyToClipboard(window.location.href, "Link");
    } catch (err) {}
  };

  if (loading) {
    return (
      <div className="w-full min-h-screen flex items-center justify-center">
        <p className="text-slate-400 font-medium animate-pulse">Decrypting Ledger...</p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="max-w-md mx-auto p-8 text-center mt-12 bg-slate-50 rounded-3xl border border-slate-200">
        <AlertTriangle size={48} className="mx-auto text-rose-500 mb-4" />
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Hash Not Found</h1>
        <p className="text-sm font-medium text-slate-500 mt-2">This match does not exist on the immutable ledger.</p>
        <Link href="/dashboard" className="inline-block mt-6 bg-slate-900 text-white font-semibold px-8 py-4 rounded-xl hover:bg-slate-800 transition-colors">
          Return Home
        </Link>
      </div>
    );
  }

  const { isVerified } = data.verification || { isVerified: false };
  
  // Safe Fallbacks
  const creator = data.creatorUsername || "Creator";
  const opponent = data.playerBUsername || "Opponent";
  const status = data.status || "open";
  const stake = data.stakeAmount || 0;
  const pool = stake * 2;
  const fee = pool * 0.10;
  const payout = pool - fee;

  // Determine Winner logically
  let winnerName = "Pending";
  if (data.outcome === "creator_won") winnerName = creator;
  if (data.outcome === "player_b_won") winnerName = opponent;

  // Format Dates
  const createdDate = data.createdAt ? new Date(data.createdAt).toLocaleDateString() : "Unknown";
  const createdTime = data.createdAt ? new Date(data.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : "";
  
  return (
    <div className="w-full min-h-screen bg-slate-50/50 pb-20">
      
      {/* Top Header */}
      <div className="max-w-5xl mx-auto px-4 py-6 flex items-center justify-between">
        <Link href="/dashboard" className="flex items-center gap-1.5 text-slate-500 hover:text-slate-900 transition-colors font-semibold text-sm bg-white border border-slate-200 px-3 py-2 rounded-lg shadow-sm">
          <ArrowLeft size={16} /> Back
        </Link>
        <button onClick={handleShare} className="flex items-center gap-1.5 text-blue-600 bg-blue-50 hover:bg-blue-100 transition-colors font-semibold text-sm px-3 py-2 rounded-lg">
          Share <Share2 size={16} />
        </button>
      </div>

      {/* Verification Banner (Edge-to-Edge on Mobile) */}
      <div className={`w-full py-8 border-y ${isVerified ? "bg-emerald-50 border-emerald-100" : "bg-amber-50 border-amber-100"}`}>
        <div className="max-w-5xl mx-auto px-4 flex flex-col items-center text-center">
          <div className={`w-14 h-14 rounded-full flex items-center justify-center mb-4 shadow-sm ${isVerified ? "bg-emerald-100 text-emerald-600" : "bg-amber-100 text-amber-600"}`}>
            {isVerified ? <CheckCircle2 size={32} /> : <Clock size={32} />}
          </div>
          <h1 className={`text-2xl md:text-3xl font-extrabold tracking-tight ${isVerified ? "text-emerald-900" : "text-amber-900"}`}>
            {isVerified ? "VERIFIED MATCH" : "PENDING MATCH"}
          </h1>
          <p className={`text-sm font-medium mt-2 max-w-md ${isVerified ? "text-emerald-700/80" : "text-amber-700/80"}`}>
            {isVerified 
              ? "This match has been securely completed. Result confirmed. Payout settled. Receipt generated." 
              : "This match is currently active. The creator's stake is locked in escrow waiting for a challenger."}
          </p>
          <div className="mt-4 flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-slate-400 bg-white/60 px-3 py-1.5 rounded-lg border border-white/50">
            Game ID: <span className="text-slate-900 normal-case tracking-normal">{params.gameId.substring(0, 10)}...</span>
            <button onClick={() => copyToClipboard(params.gameId, "Game ID")}><Copy size={14} className="text-slate-400 hover:text-slate-900 transition-colors"/></button>
          </div>
        </div>
      </div>

      {/* Main Content: 2 Columns on Desktop */}
      <div className="max-w-5xl mx-auto px-4 mt-8 grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
        
        {/* LEFT COLUMN */}
        <div className="space-y-6 md:space-y-8">
          
          {/* Match Summary & Result */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
            <div className="flex justify-between items-start mb-6">
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Match Summary</p>
                <h3 className="font-bold text-slate-900 text-lg capitalize">{data.gameType?.replace("_", " ")}</h3>
              </div>
              <div className="text-right">
                <p className="text-xs text-slate-500 font-medium">{createdDate}</p>
                <p className="text-xs text-slate-400 font-medium mt-0.5">{createdTime}</p>
              </div>
            </div>

            {status === "played" && (
              <div className="bg-slate-50 border border-slate-100 rounded-xl p-5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-yellow-100 text-yellow-600 rounded-full flex items-center justify-center">
                    <Trophy size={20} />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-0.5">Winner</p>
                    <p className="font-extrabold text-slate-900 text-lg">{winnerName}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest mb-0.5 bg-emerald-50 px-2 py-0.5 rounded-md inline-block border border-emerald-100">Paid</p>
                  <p className="font-extrabold text-emerald-600 text-lg">{payout.toLocaleString()} <span className="text-xs">UGX</span></p>
                </div>
              </div>
            )}
          </div>

          {/* Players */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Verified Players</p>
            <div className="flex justify-between items-center py-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-slate-500 w-16">Creator</span>
                <span className="font-bold text-slate-900">{creator}</span>
              </div>
              <CheckCircle2 size={16} className="text-emerald-500" />
            </div>
            <div className="flex justify-between items-center py-3">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-slate-500 w-16">Opponent</span>
                <span className="font-bold text-slate-900">{status === "played" ? opponent : "Waiting..."}</span>
              </div>
              {status === "played" ? <CheckCircle2 size={16} className="text-emerald-500" /> : <Clock size={16} className="text-amber-500" />}
            </div>
          </div>

          {/* Financial Breakdown */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Prize Breakdown</p>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between text-slate-600">
                <span>Creator Stake Locked</span>
                <span className="font-semibold text-slate-900">{stake.toLocaleString()} UGX</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Opponent Stake Locked</span>
                <span className="font-semibold text-slate-900">{status === "played" ? stake.toLocaleString() : "0"} UGX</span>
              </div>
              <div className="w-full h-px bg-slate-100 my-2"></div>
              <div className="flex justify-between text-slate-600">
                <span>Total Escrow Pool</span>
                <span className="font-semibold text-slate-900">{status === "played" ? pool.toLocaleString() : stake.toLocaleString()} UGX</span>
              </div>
              {status === "played" && (
                <>
                  <div className="flex justify-between text-slate-400">
                    <span>Platform Fee (10%)</span>
                    <span>-{fee.toLocaleString()} UGX</span>
                  </div>
                  <div className="flex justify-between font-bold text-emerald-600 pt-2 border-t border-slate-100">
                    <span>Winner Received</span>
                    <span>{payout.toLocaleString()} UGX</span>
                  </div>
                </>
              )}
            </div>
          </div>

        </div>

        {/* RIGHT COLUMN */}
        <div className="space-y-6 md:space-y-8">
          
          {/* Trust Checklist Timeline */}
          <div className="bg-slate-900 rounded-2xl p-6 shadow-sm text-white">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-6">Platform Trust Checklist</p>
            
            <div className="space-y-6 relative before:absolute before:inset-0 before:ml-3 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-slate-800">
              
              <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                <div className="flex items-center justify-center w-6 h-6 rounded-full border-2 border-slate-900 bg-emerald-500 text-slate-900 shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 shadow-[0_0_0_4px_#0f172a]">
                  <CheckCircle2 size={14} />
                </div>
                <div className="w-[calc(100%-2.5rem)] md:w-[calc(50%-1.5rem)] p-3 rounded-xl bg-slate-800 border border-slate-700">
                  <p className="font-bold text-sm">Challenge Created</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">Stakes securely locked</p>
                </div>
              </div>

              <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                <div className={`flex items-center justify-center w-6 h-6 rounded-full border-2 border-slate-900 shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 shadow-[0_0_0_4px_#0f172a] ${status === "played" ? "bg-emerald-500 text-slate-900" : "bg-slate-800 text-slate-500"}`}>
                  {status === "played" ? <CheckCircle2 size={14} /> : <div className="w-2 h-2 bg-slate-500 rounded-full"></div>}
                </div>
                <div className={`w-[calc(100%-2.5rem)] md:w-[calc(50%-1.5rem)] p-3 rounded-xl border ${status === "played" ? "bg-slate-800 border-slate-700" : "bg-slate-900 border-slate-800 opacity-50"}`}>
                  <p className="font-bold text-sm">Match Completed</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">Opponent joined & verified</p>
                </div>
              </div>

              <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                <div className={`flex items-center justify-center w-6 h-6 rounded-full border-2 border-slate-900 shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 shadow-[0_0_0_4px_#0f172a] ${isVerified ? "bg-emerald-500 text-slate-900" : "bg-slate-800 text-slate-500"}`}>
                  {isVerified ? <CheckCircle2 size={14} /> : <div className="w-2 h-2 bg-slate-500 rounded-full"></div>}
                </div>
                <div className={`w-[calc(100%-2.5rem)] md:w-[calc(50%-1.5rem)] p-3 rounded-xl border ${isVerified ? "bg-slate-800 border-slate-700" : "bg-slate-900 border-slate-800 opacity-50"}`}>
                  <p className="font-bold text-sm">Winner Determined</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">Cryptographically sound</p>
                </div>
              </div>

              <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                <div className={`flex items-center justify-center w-6 h-6 rounded-full border-2 border-slate-900 shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 shadow-[0_0_0_4px_#0f172a] ${status === "played" ? "bg-emerald-500 text-slate-900" : "bg-slate-800 text-slate-500"}`}>
                  {status === "played" ? <CheckCircle2 size={14} /> : <div className="w-2 h-2 bg-slate-500 rounded-full"></div>}
                </div>
                <div className={`w-[calc(100%-2.5rem)] md:w-[calc(50%-1.5rem)] p-3 rounded-xl border ${status === "played" ? "bg-slate-800 border-slate-700" : "bg-slate-900 border-slate-800 opacity-50"}`}>
                  <p className="font-bold text-sm">Wallet Credited</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">Funds settled instantly</p>
                </div>
              </div>

            </div>
          </div>

          {/* Cryptographic Proof (Advanced) */}
          <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
            <button 
              onClick={() => setShowCrypto(!showCrypto)}
              className="w-full flex items-center justify-between p-6 bg-slate-50 hover:bg-slate-100 transition-colors"
            >
              <div>
                <h3 className="font-bold text-slate-900 text-left">Technical Verification</h3>
                <p className="text-xs font-medium text-slate-500 mt-1 text-left">Advanced cryptographic proof</p>
              </div>
              <ChevronDown size={20} className={`text-slate-400 transition-transform ${showCrypto ? "rotate-180" : ""}`} />
            </button>
            
            {showCrypto && (
              <div className="p-6 border-t border-slate-200 space-y-5 bg-white">
                <div className="bg-blue-50 text-blue-800 text-xs font-medium p-3 rounded-lg border border-blue-100 leading-relaxed mb-4">
                  <strong>What does this mean?</strong> The creator's choice was sealed into a secure "Hash" before the match began. This guarantees they could not change their answer after the opponent played.
                </div>

                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Reveal Value (Creator's Choice)</p>
                  <p className="font-bold text-slate-900 uppercase">{data.creatorChoice}</p>
                </div>
                
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Server Salt</p>
                  <div className="flex items-center gap-2">
                    <p className="text-xs font-mono text-slate-600 break-all bg-slate-50 p-2 rounded border border-slate-100">{data.serverSeed}</p>
                    <button onClick={() => copyToClipboard(data.serverSeed, "Salt")} className="p-2 bg-slate-50 border border-slate-200 rounded hover:bg-slate-100"><Copy size={14}/></button>
                  </div>
                </div>

                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Commit Hash (Public)</p>
                  <div className="flex items-center gap-2">
                    <p className="text-xs font-mono text-slate-600 break-all bg-slate-50 p-2 rounded border border-slate-100">{data.publicHash}</p>
                    <button onClick={() => copyToClipboard(data.publicHash, "Hash")} className="p-2 bg-slate-50 border border-slate-200 rounded hover:bg-slate-100"><Copy size={14}/></button>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-500 uppercase">Verification Status</span>
                  <span className={`text-sm font-bold flex items-center gap-1 ${isVerified ? "text-emerald-600" : "text-rose-600"}`}>
                    {isVerified ? <><CheckCircle2 size={16}/> Validated</> : <><AlertTriangle size={16}/> Failed</>}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Action Links */}
          <div className="pt-2 space-y-3">
            <Link href="/create" className="flex items-center justify-center w-full bg-blue-600 text-white font-bold py-4 rounded-xl hover:bg-blue-700 transition-colors shadow-sm">
              Create New Challenge
            </Link>
            <Link href="/feed" className="flex items-center justify-center w-full bg-white text-slate-700 border border-slate-200 font-bold py-4 rounded-xl hover:bg-slate-50 transition-colors shadow-sm">
              View Similar Matches
            </Link>
          </div>

        </div>
      </div>

      {/* Footer Trust Markers */}
      <div className="text-center mt-16 pb-8">
        <p className="text-sm font-bold text-slate-900">Verified by Pawa Pick</p>
        <div className="flex items-center justify-center gap-1.5 text-slate-400 mt-1">
          <ShieldCheck size={14} />
          <span className="text-[11px] font-bold uppercase tracking-widest text-slate-400">SHA-256 Protected</span>
        </div>
        <p className="text-xs font-medium text-slate-400 mt-3">Every game counts</p>
      </div>

    </div>
  );
}
