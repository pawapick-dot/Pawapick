// app/verify/page.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ShieldCheck, Search, FileText } from "lucide-react";

export default function VerifyLanding() {
  const router = useRouter();
  const [searchId, setSearchId] = useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchId.trim()) return;
    // Redirect to the dynamic verify page we already built
    router.push(`/verify/${searchId.trim()}`);
  };

  return (
    <div className="max-w-md mx-auto space-y-8 mt-6 pb-12 px-4">
      
      {/* Header */}
      <div className="bg-white border-2 border-black rounded-none p-6 shadow-[8px_8px_0px_0px_rgba(250,204,21,1)]">
        <div className="flex items-center gap-3 mb-2">
          <ShieldCheck size={24} className="text-yellow-500" />
          <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
            The Trust Center
          </span>
        </div>
        <h1 className="text-4xl font-black uppercase tracking-tighter text-gray-900 leading-none">
          Provably<br/>Fair
        </h1>
        <p className="text-xs font-bold text-gray-500 uppercase mt-4">
          Verify the cryptographic integrity of any match on the network.
        </p>
      </div>

      {/* Search Box */}
      <form onSubmit={handleSearch} className="space-y-4 pt-4">
        <div className="space-y-2">
          <label className="text-[11px] font-black text-gray-900 uppercase tracking-widest flex items-center gap-2">
            <Search size={14} className="text-yellow-500" /> Enter Game ID
          </label>
          <input 
            type="text" 
            value={searchId}
            onChange={(e) => setSearchId(e.target.value)}
            placeholder="e.g., abc123xyz456..." 
            className="w-full bg-white border-2 border-gray-200 p-5 font-bold text-gray-900 focus:outline-none focus:border-black transition-colors rounded-none placeholder:text-gray-300 placeholder:font-medium"
          />
        </div>

        <button 
          type="submit"
          disabled={!searchId.trim()}
          className={`w-full font-black py-5 uppercase tracking-widest transition-all ${
            searchId.trim() 
              ? "bg-black text-white border-2 border-black hover:bg-gray-800 shadow-[4px_4px_0px_0px_rgba(250,204,21,1)] active:translate-y-1 active:shadow-none" 
              : "bg-gray-100 text-gray-400 border-2 border-gray-200 cursor-not-allowed"
          }`}
        >
          Fetch Receipt
        </button>
      </form>

      {/* Info Card */}
      <div className="bg-gray-50 border-2 border-gray-200 p-5 rounded-none flex gap-4 items-start mt-8">
        <div className="w-10 h-10 bg-white border-2 border-gray-200 flex items-center justify-center shrink-0">
          <FileText size={20} className="text-gray-400" />
        </div>
        <div>
          <h4 className="font-black text-gray-900 uppercase tracking-wide text-xs">Where do I find a Game ID?</h4>
          <p className="text-[11px] text-gray-500 mt-1 font-medium leading-relaxed">
            You can find the unique Game ID in your Dashboard under the "Recent Conflicts" ledger, or attached to the URL when you finish playing a match.
          </p>
        </div>
      </div>

    </div>
  );
}
