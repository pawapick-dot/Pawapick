// app/admin/verification/page.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ShieldCheck, Search, FileText, ArrowRight } from "lucide-react";

export default function AdminVerification() {
  const [gameId, setGameId] = useState("");
  const router = useRouter();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!gameId.trim()) return;
    // Route to the official verification page
    router.push(`/verify/${gameId.trim()}`);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8 mt-4">
      <div>
        <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">Audit & Verification</h1>
        <p className="text-sm text-slate-500 font-medium mt-1">Customer support lookup tool for match receipts.</p>
      </div>

      <div className="bg-white border border-slate-200 rounded-3xl p-6 md:p-8 shadow-sm">
        <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 mb-6">
          <ShieldCheck size={32} />
        </div>
        
        <h2 className="text-xl font-bold text-slate-900 mb-2">Cryptographic Lookup</h2>
        <p className="text-sm text-slate-500 font-medium mb-6">
          Enter a Game ID or Verification Hash to view the immutable ledger record, stakes, and payout status.
        </p>

        <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
              <Search size={20} />
            </div>
            <input 
              type="text" 
              value={gameId}
              onChange={(e) => setGameId(e.target.value)}
              placeholder="e.g., abc123xyz456..." 
              className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-900 focus:outline-none focus:border-blue-500 focus:bg-white transition-colors"
            />
          </div>
          <button 
            type="submit"
            disabled={!gameId.trim()}
            className="bg-slate-900 text-white font-bold px-8 py-4 rounded-xl hover:bg-slate-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            Fetch Audit <ArrowRight size={18} />
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-slate-100 flex items-start gap-4">
          <div className="w-10 h-10 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-center shrink-0">
            <FileText size={20} className="text-slate-400" />
          </div>
          <div>
            <p className="text-sm font-bold text-slate-900">Why use this?</p>
            <p className="text-xs text-slate-500 font-medium mt-1 leading-relaxed">
              If a user reports a missing payout or claims a game was rigged, use this tool to pull the cryptographic hash and prove the match's exact timeline and server seed.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
