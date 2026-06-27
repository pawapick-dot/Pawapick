// app/verify/page.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ShieldCheck, Search, FileText, ArrowRight } from "lucide-react";

export default function VerifyLanding() {
  const router = useRouter();
  const [searchId, setSearchId] = useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchId.trim()) return;
    router.push(`/verify/${searchId.trim()}`);
  };

  return (
    <div className="w-full max-w-lg mx-auto space-y-8 mt-10 pb-16 px-4">

      {/* Header */}
      <div className="text-center space-y-4">
        <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto text-blue-600 mb-2">
          <ShieldCheck size={32} />
        </div>
        <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight leading-tight">
          Provably Fair.<br/>
          <span className="text-blue-600">100% Transparent.</span>
        </h1>
        <p className="text-sm text-slate-500 font-medium max-w-sm mx-auto">
          Verify the cryptographic integrity, timeline, and financial settlement of any match on the network.
        </p>
      </div>

      {/* Search Box */}
      <form onSubmit={handleSearch} className="bg-white border border-slate-200 rounded-3xl p-2 shadow-sm flex items-center mt-8">
        <div className="pl-4 text-slate-400">
          <Search size={20} />
        </div>
        <input 
          type="text" 
          value={searchId}
          onChange={(e) => setSearchId(e.target.value)}
          placeholder="Enter Game ID (e.g., abc123...)" 
          className="flex-1 bg-transparent border-none p-4 font-semibold text-slate-900 focus:outline-none placeholder:text-slate-300 placeholder:font-medium"
        />
        <button 
          type="submit"
          disabled={!searchId.trim()}
          className={`p-4 rounded-2xl font-bold transition-all flex items-center gap-2 ${
            searchId.trim() 
              ? "bg-blue-600 text-white hover:bg-blue-700 shadow-sm" 
              : "bg-slate-100 text-slate-400 cursor-not-allowed"
          }`}
        >
          <span className="hidden sm:inline">Fetch Receipt</span>
          <ArrowRight size={18} />
        </button>
      </form>

      {/* Info Card */}
      <div className="bg-slate-50 border border-slate-200 p-5 rounded-2xl flex gap-4 items-start mt-8">
        <div className="w-10 h-10 bg-white border border-slate-200 rounded-xl flex items-center justify-center shrink-0 shadow-sm">
          <FileText size={20} className="text-slate-400" />
        </div>
        <div>
          <h4 className="font-bold text-slate-900 text-sm">Where do I find a Game ID?</h4>
          <p className="text-xs text-slate-500 mt-1 font-medium leading-relaxed">
            You can find the unique Game ID in your Dashboard under the "Recent Activity" ledger, or attached to the URL when you finish playing a match.
          </p>
        </div>
      </div>

    </div>
  );
}
