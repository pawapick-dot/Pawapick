// app/verify/[gameId]/page.tsx
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { ShieldCheck, Copy, CheckCircle, AlertTriangle, ArrowLeft } from "lucide-react";

export default function VerifyGame({ params }: { params: { gameId: string } }) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

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
      .catch(() => toast.error("Failed to fetch cryptographic receipt."))
      .finally(() => setLoading(false));
  }, [params.gameId]);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard!");
  };

  if (loading) {
    return (
      <div className="max-w-md mx-auto p-8 text-center font-black tracking-widest text-gray-400 uppercase animate-pulse mt-12">
        Decrypting Ledger...
      </div>
    );
  }

  if (!data) {
    return (
      <div className="max-w-md mx-auto p-8 text-center mt-12">
        <AlertTriangle size={48} className="mx-auto text-red-500 mb-4" />
        <h1 className="text-2xl font-black uppercase tracking-tight text-gray-900">Hash Not Found</h1>
        <p className="text-sm font-medium text-gray-500 mt-2">This match does not exist on the immutable ledger.</p>
        <Link href="/dashboard" className="inline-block mt-6 bg-black text-white font-black uppercase tracking-widest px-8 py-4 border-2 border-black hover:bg-gray-800 transition">
          Return to Base
        </Link>
      </div>
    );
  }

  const { isVerified } = data.verification;

  return (
    <div className="max-w-md mx-auto space-y-8 mt-6 pb-12 px-4">
      <Link href="/dashboard" className="text-[10px] font-black text-gray-400 uppercase tracking-widest hover:text-black transition flex items-center gap-1 w-fit">
        <ArrowLeft size={14} /> Back to Command Center
      </Link>

      {/* Header */}
      <div className="bg-white border-2 border-black rounded-none p-6 shadow-[8px_8px_0px_0px_rgba(250,204,21,1)]">
        <div className="flex items-center gap-3 mb-2">
          <ShieldCheck size={24} className={isVerified ? "text-green-600" : "text-red-600"} />
          <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
            Cryptographic Receipt
          </span>
        </div>
        <h1 className="text-3xl font-black uppercase tracking-tighter text-gray-900 leading-none">
          Provably Fair
        </h1>
        <p className="text-xs font-bold text-gray-500 uppercase mt-4 bg-gray-50 p-2 border border-gray-200">
          ID: {data.id}
        </p>
      </div>

      {/* Verification Status */}
      <div className={`p-5 border-2 rounded-none flex items-center justify-between ${
        isVerified ? "bg-green-50 border-green-600" : "bg-red-50 border-red-600"
      }`}>
        <div>
          <p className="font-black uppercase tracking-wider text-sm text-gray-900">
            Audit Status
          </p>
          <p className={`text-[10px] font-bold uppercase ${isVerified ? "text-green-700" : "text-red-700"}`}>
            {isVerified ? "Hashes match perfectly" : "Hash mismatch detected!"}
          </p>
        </div>
        {isVerified ? (
          <CheckCircle size={32} className="text-green-600" />
        ) : (
          <AlertTriangle size={32} className="text-red-600" />
        )}
      </div>

      {/* The Math Breakdown */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-2 h-2 bg-yellow-400"></div>
          <h3 className="text-[11px] font-black text-gray-400 uppercase tracking-widest">The Formula</h3>
        </div>

        {/* 1. Target */}
        <div className="bg-white border-2 border-gray-200 p-4 rounded-none">
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">1. Creator's Choice (Hidden)</p>
          <p className="text-lg font-black text-gray-900 uppercase">{data.creatorChoice}</p>
        </div>

        {/* 2. Salt */}
        <div className="bg-white border-2 border-gray-200 p-4 rounded-none">
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">2. Server Seed (Salt)</p>
          <div className="flex items-center justify-between gap-2">
            <p className="text-sm font-bold text-gray-700 break-all">{data.serverSeed}</p>
            <button onClick={() => copyToClipboard(data.serverSeed)} className="p-2 bg-gray-50 hover:bg-yellow-50 hover:text-yellow-600 transition border border-gray-200 shrink-0">
              <Copy size={16} />
            </button>
          </div>
        </div>

        {/* 3. The Hash */}
        <div className="bg-gray-900 border-2 border-black p-5 rounded-none shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
          <p className="text-[10px] font-black text-yellow-400 uppercase tracking-widest mb-3">3. SHA-256 Output (Public Hash)</p>
          
          <div className="bg-black border border-gray-800 p-3 mb-3">
            <code className="text-green-400 text-xs font-mono break-all leading-relaxed">
              hash = sha256("{data.creatorChoice}-{data.serverSeed}")
            </code>
          </div>

          <div className="flex items-start justify-between gap-2 mt-4">
            <p className="text-sm font-bold text-white break-all">{data.publicHash}</p>
            <button onClick={() => copyToClipboard(data.publicHash)} className="p-2 bg-gray-800 text-white hover:bg-yellow-400 hover:text-black transition border border-gray-700 shrink-0">
              <Copy size={16} />
            </button>
          </div>
        </div>
      </div>

      <div className="pt-4">
        <Link href="/feed" className="block text-center w-full bg-yellow-400 text-black font-black uppercase tracking-widest py-5 border-2 border-black hover:bg-yellow-500 transition shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:translate-y-1 active:shadow-none">
          Verify Another Match
        </Link>
      </div>
    </div>
  );
}
