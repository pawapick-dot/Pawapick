// app/wallet/page.tsx
"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { ArrowDownLeft, ArrowUpRight, History, ShieldCheck, Lock, X } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase"; 

type Transaction = {
  id: string;
  type: string;
  amount: number;
  createdAt: string;
  status: string;
};

function WalletContent() {
  const { user, loading: authLoading, openAuthModal } = useAuth();
  const searchParams = useSearchParams(); 
  
  const [balance, setBalance] = useState<number>(0);
  const [history, setHistory] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Transaction Modal State
  const [actionType, setActionType] = useState<"deposit" | "withdraw" | null>(null);
  const [amount, setAmount] = useState<string>("");
  const [phone, setPhone] = useState<string>("");
  const [provider, setProvider] = useState<"MTN" | "AIRTEL">("MTN");
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  useEffect(() => {
    if (searchParams.get("action") === "deposit") {
      setActionType("deposit");
    }
  }, [searchParams]);

  useEffect(() => {
    if (!user) return;
    const unsubscribe = onSnapshot(doc(db, "users", user.uid), (docSnap) => {
      if (docSnap.exists()) {
        setBalance(docSnap.data().walletBalance || 0);
      }
    });
    return () => unsubscribe();
  }, [user]);

  const fetchHistory = useCallback(async () => {
    if (!user) return;
    try {
      const token = await user.getIdToken();
      const res = await fetch("/api/wallet", {
        headers: { "Authorization": `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) setHistory(data.history || []);
    } catch (err) {
      console.error("Failed to fetch history");
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (!authLoading && user) {
      fetchHistory();
    }
  }, [user, authLoading, fetchHistory]);

  const formatPhoneNumber = (number: string) => {
    let cleaned = number.replace(/\D/g, "");
    if (cleaned.startsWith("0")) cleaned = "256" + cleaned.slice(1);
    if (cleaned.length === 9) cleaned = "256" + cleaned;
    if (!cleaned.startsWith("+")) cleaned = "+" + cleaned;
    return cleaned;
  };

  // 5% processing fee calculation helpers
  const rawAmount = Number(amount) || 0;
  const processingFee = actionType === "deposit" ? Math.round(rawAmount * 0.05) : 0;
  const totalCharge = rawAmount + processingFee;

  const handleTransaction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return openAuthModal();
    
    if (actionType === "deposit" && rawAmount < 500) return toast.error("Minimum deposit is UGX 500.");
    if (actionType === "withdraw" && rawAmount < 1000) return toast.error("Minimum withdrawal is UGX 1,000.");
    if (actionType === "withdraw" && rawAmount > balance) return toast.error("Insufficient funds.");
    if (!phone || phone.length < 9) return toast.error("Please enter a valid phone number.");

    setIsProcessing(true);
    const endpoint = actionType === "deposit" ? "/api/wallet/deposit" : "/api/wallet/withdraw";
    const formattedPhone = formatPhoneNumber(phone);

    try {
      const token = await user.getIdToken();
      const payload: any = { amount: rawAmount, phoneNumber: formattedPhone };
      if (actionType === "withdraw") payload.provider = provider;

      const res = await fetch(endpoint, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Transaction failed");

      if (actionType === "deposit") {
        toast.success(`Prompt sent for UGX ${totalCharge.toLocaleString()}! Check your phone.`);
      } else {
        toast.success("Withdrawal requested successfully!");
      }
      
      fetchHistory(); 
      closeModal();
    } catch (error: any) {
      toast.error(error.message || "Transaction failed.");
    } finally {
      setIsProcessing(false);
    }
  };

  const closeModal = () => {
    setActionType(null);
    setAmount("");
    setPhone("");
    setIsProcessing(false);
  };

  if (authLoading) return <div className="p-8 text-center text-gray-400 font-bold uppercase tracking-widest animate-pulse">Decrypting...</div>;

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
        <div className="w-20 h-20 bg-gray-900 flex items-center justify-center mb-6 rounded-none shadow-2xl">
          <Lock size={32} className="text-yellow-400" />
        </div>
        <h1 className="text-3xl font-black text-gray-900 tracking-tight uppercase">Wallet Locked</h1>
        <button onClick={openAuthModal} className="mt-8 bg-yellow-400 text-black font-black uppercase tracking-widest text-sm px-10 py-5 rounded-none border-2 border-black hover:bg-yellow-500 hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:translate-y-1 active:shadow-none transition-all">
          Verify Identity
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto space-y-8 mt-6 pb-12 px-4 relative">
      {/* Wallet Balance Card */}
      <div className="bg-gray-900 rounded-none p-8 border-2 border-black relative overflow-hidden shadow-[8px_8px_0px_0px_rgba(250,204,21,1)]">
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-2">
            <ShieldCheck size={16} className="text-yellow-400" />
            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Escrow Balance</span>
          </div>
          <h2 className="text-4xl font-black text-white tracking-tighter">
            {loading ? "..." : `${balance.toLocaleString()}`}
            <span className="text-lg text-yellow-400 ml-2">UGX</span>
          </h2>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="grid grid-cols-2 gap-6">
        <button onClick={() => setActionType("deposit")} className="bg-white border-2 border-gray-200 rounded-none p-5 hover:border-black hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all active:translate-y-1 active:shadow-none flex flex-col items-center justify-center gap-3 group">
          <div className="w-12 h-12 rounded-none bg-yellow-400 flex items-center justify-center border-2 border-black">
            <ArrowDownLeft size={24} className="text-black" />
          </div>
          <span className="font-black text-gray-900 uppercase tracking-wider text-xs">Top Up</span>
        </button>
        <button onClick={() => setActionType("withdraw")} className="bg-white border-2 border-gray-200 rounded-none p-5 hover:border-black hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all active:translate-y-1 active:shadow-none flex flex-col items-center justify-center gap-3 group">
          <div className="w-12 h-12 rounded-none bg-gray-100 flex items-center justify-center border-2 border-transparent group-hover:border-black transition">
            <ArrowUpRight size={24} className="text-gray-900" />
          </div>
          <span className="font-black text-gray-900 uppercase tracking-wider text-xs">Withdraw</span>
        </button>
      </div>

      {/* Ledger UI */}
      <div className="bg-white border-2 border-gray-100 rounded-none mt-8">
        <div className="flex items-center gap-2 p-5 border-b-2 border-gray-100 bg-gray-50">
          <History size={18} className="text-black" />
          <span className="font-black text-gray-900 uppercase tracking-wider text-sm">Immutable Ledger</span>
        </div>
        <div className="divide-y-2 divide-gray-50">
          {history.length === 0 ? (
            <div className="p-8 text-center text-gray-400 font-bold uppercase tracking-widest text-[10px]">No transaction history found</div>
          ) : (
            history.map((tx) => (
              <div key={tx.id} className="flex items-center justify-between p-4 hover:bg-gray-50 transition">
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-none border-2 flex items-center justify-center ${
                    tx.type === 'deposit' || tx.type === 'game_win' ? 'bg-green-50 border-green-200 text-green-600' : 'bg-gray-50 border-gray-200 text-gray-500'
                  }`}>
                    {tx.type === 'deposit' || tx.type === 'game_win' ? <ArrowDownLeft size={16} /> : <ArrowUpRight size={16} />}
                  </div>
                  <div>
                    <p className="font-black text-sm text-gray-900 uppercase tracking-wide">{tx.type.replace("_", " ")}</p>
                    <p className="text-[10px] font-bold text-gray-400 uppercase">{new Date(tx.createdAt).toLocaleString()}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`font-black text-lg ${tx.amount > 0 ? 'text-green-600' : 'text-gray-900'}`}>
                    {tx.amount > 0 ? '+' : ''}{tx.amount.toLocaleString()}
                  </p>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{tx.status}</p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Transaction Modal Overlay */}
      {actionType && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white border-4 border-black p-6 w-full max-w-sm rounded-none shadow-[8px_8px_0px_0px_rgba(250,204,21,1)] relative">
            <button onClick={closeModal} className="absolute top-4 right-4 text-gray-400 hover:text-black transition"><X size={24} /></button>
            <h3 className="text-2xl font-black uppercase tracking-tight text-gray-900 mb-6 border-b-2 border-gray-100 pb-4">
              {actionType === "deposit" ? "Top Up Wallet" : "Cash Out"}
            </h3>
            <form onSubmit={handleTransaction} className="space-y-5">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">Amount (UGX)</label>
                <input 
                  type="number" value={amount} onChange={(e) => setAmount(e.target.value)}
                  placeholder={actionType === "deposit" ? "Min. 500" : "Min. 1000"} required
                  className="w-full bg-gray-50 border-2 border-gray-200 p-4 font-black text-xl text-gray-900 focus:outline-none focus:border-yellow-400 focus:bg-white transition"
                />
                
                {/* Dynamically display processing fee breakdown for deposits */}
                {actionType === "deposit" && rawAmount >= 500 && (
                  <div className="flex justify-between px-1 pt-1 text-[11px] font-bold text-slate-500 uppercase tracking-wide">
                    <span>Processing Fee:</span>
                    <span className="text-gray-900">+ UGX {processingFee.toLocaleString()}</span>
                  </div>
                )}
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">Mobile Money Number</label>
                <input 
                  type="tel" value={phone} onChange={(e) => setPhone(e.target.value)}
                  placeholder="e.g. 0770000000" required
                  className="w-full bg-gray-50 border-2 border-gray-200 p-4 font-black text-xl text-gray-900 focus:outline-none focus:border-yellow-400 focus:bg-white transition"
                />
              </div>
              {actionType === "withdraw" && (
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">Network Provider</label>
                  <div className="grid grid-cols-2 gap-3">
                    <button type="button" onClick={() => setProvider("MTN")} className={`p-3 border-2 font-black text-sm uppercase tracking-wider transition ${provider === "MTN" ? "border-black bg-yellow-400 text-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]" : "border-gray-200 bg-gray-50 text-gray-400 hover:border-gray-300"}`}>MTN</button>
                    <button type="button" onClick={() => setProvider("AIRTEL")} className={`p-3 border-2 font-black text-sm uppercase tracking-wider transition ${provider === "AIRTEL" ? "border-black bg-red-500 text-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]" : "border-gray-200 bg-gray-50 text-gray-400 hover:border-gray-300"}`}>Airtel</button>
                  </div>
                </div>
              )}
              <button type="submit" disabled={isProcessing} className="w-full bg-black text-white font-black uppercase tracking-widest text-sm p-4 border-2 border-black hover:bg-gray-900 transition disabled:opacity-50 disabled:cursor-not-allowed mt-4">
                {isProcessing ? "Processing..." : actionType === "deposit" ? `Pay UGX ${totalCharge.toLocaleString()}` : "Confirm Withdrawal"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default function WalletPageWrapper() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-gray-400 font-bold uppercase tracking-widest animate-pulse">Loading Wallet...</div>}>
      <WalletContent />
    </Suspense>
  );
}
