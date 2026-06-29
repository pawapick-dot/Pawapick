// app/wallet/page.tsx
"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { ArrowDownLeft, ArrowUpRight, History, ShieldCheck, Lock, X, Wallet, Loader2, Clock } from "lucide-react";
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

  if (authLoading) return (
    <div className="flex justify-center items-center h-64">
      <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
    </div>
  );

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
        <div className="w-20 h-20 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mb-6 shadow-sm border border-blue-100">
          <Lock size={32} />
        </div>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Wallet Locked</h1>
        <p className="text-slate-500 mt-2 font-medium">Please sign in to access your funds and transaction history.</p>
        <button 
          onClick={openAuthModal} 
          className="mt-8 bg-blue-600 text-white font-bold text-sm px-8 py-3.5 rounded-xl hover:bg-blue-700 shadow-sm transition-all active:scale-[0.98]"
        >
          Verify Identity
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto space-y-6 mt-6 pb-12 px-4 relative">
      {/* Modern Wallet Balance Card */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-[2rem] p-8 relative overflow-hidden shadow-xl shadow-slate-900/10 border border-slate-800">
        {/* Subtle background glow effect */}
        <div className="absolute top-0 right-0 -mr-8 -mt-8 w-32 h-32 rounded-full bg-blue-500/20 blur-2xl"></div>
        <div className="absolute bottom-0 left-0 -ml-8 -mb-8 w-32 h-32 rounded-full bg-emerald-500/20 blur-2xl"></div>
        
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-3">
            <ShieldCheck size={16} className="text-emerald-400" />
            <span className="text-xs font-semibold text-slate-300 uppercase tracking-widest">Available Balance</span>
          </div>
          <div className="flex items-baseline gap-2">
            <h2 className="text-4xl md:text-5xl font-extrabold text-white tracking-tight">
              {loading ? "..." : balance.toLocaleString()}
            </h2>
            <span className="text-lg font-bold text-slate-400">UGX</span>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="grid grid-cols-2 gap-4">
        <button 
          onClick={() => setActionType("deposit")} 
          className="bg-white border border-slate-100 rounded-2xl p-5 hover:border-emerald-200 hover:shadow-md hover:shadow-emerald-500/5 transition-all active:scale-[0.98] flex flex-col items-center justify-center gap-3 group"
        >
          <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:scale-110 transition-transform">
            <ArrowDownLeft size={24} strokeWidth={2.5} />
          </div>
          <span className="font-bold text-slate-700 text-sm">Top Up</span>
        </button>
        
        <button 
          onClick={() => setActionType("withdraw")} 
          className="bg-white border border-slate-100 rounded-2xl p-5 hover:border-blue-200 hover:shadow-md hover:shadow-blue-500/5 transition-all active:scale-[0.98] flex flex-col items-center justify-center gap-3 group"
        >
          <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center group-hover:scale-110 transition-transform">
            <ArrowUpRight size={24} strokeWidth={2.5} />
          </div>
          <span className="font-bold text-slate-700 text-sm">Withdraw</span>
        </button>
      </div>

      {/* Ledger UI */}
      <div className="bg-white border border-slate-100 rounded-[2rem] shadow-sm overflow-hidden mt-6">
        <div className="flex items-center gap-2 p-6 border-b border-slate-50 bg-slate-50/50">
          <History size={18} className="text-slate-400" />
          <span className="font-bold text-slate-900 text-sm">Recent Transactions</span>
        </div>
        
        <div className="divide-y divide-slate-50">
          {history.length === 0 ? (
            <div className="p-12 text-center flex flex-col items-center">
              <Wallet size={32} className="text-slate-200 mb-3" />
              <p className="text-slate-500 font-medium text-sm">No transaction history found</p>
            </div>
          ) : (
            history.map((tx) => (
              <div key={tx.id} className="flex items-center justify-between p-5 hover:bg-slate-50/50 transition-colors">
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                    tx.type === 'deposit' || tx.type === 'game_win' ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-50 text-slate-600'
                  }`}>
                    {tx.type === 'deposit' || tx.type === 'game_win' ? <ArrowDownLeft size={18} /> : <ArrowUpRight size={18} />}
                  </div>
                  <div>
                    <p className="font-bold text-sm text-slate-900 capitalize">{tx.type.replace(/_/g, " ")}</p>
                    <div className="flex items-center gap-1 mt-1 text-[10px] font-semibold text-slate-400">
                      <Clock size={10} />
                      {new Date(tx.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`font-extrabold text-sm ${tx.amount > 0 ? 'text-emerald-600' : 'text-slate-900'}`}>
                    {tx.amount > 0 ? '+' : ''}{tx.amount.toLocaleString()} <span className="text-[10px] text-slate-400 font-bold ml-0.5">UGX</span>
                  </p>
                  <span className={`inline-block mt-1 px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-widest ${
                    tx.status.toLowerCase() === 'completed' ? 'bg-emerald-50 text-emerald-600' :
                    tx.status.toLowerCase() === 'pending' ? 'bg-amber-50 text-amber-600' :
                    'bg-slate-100 text-slate-500'
                  }`}>
                    {tx.status}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Transaction Modal Overlay with Glass Mask */}
      {actionType && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-md">
          <div className="bg-white p-6 sm:p-8 w-full max-w-sm rounded-[2rem] shadow-2xl relative animate-in fade-in zoom-in-95 duration-200">
            
            <button 
              onClick={closeModal} 
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-full transition-colors"
            >
              <X size={20} />
            </button>

            <div className="mb-6">
              <h3 className="text-xl font-extrabold text-slate-900">
                {actionType === "deposit" ? "Top Up Wallet" : "Cash Out"}
              </h3>
              <p className="text-sm text-slate-500 font-medium mt-1">
                {actionType === "deposit" ? "Add funds securely via mobile money." : "Withdraw your winnings to your mobile wallet."}
              </p>
            </div>

            <form onSubmit={handleTransaction} className="space-y-5">
              
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wide">Amount (UGX)</label>
                <div className="relative">
                  <input 
                    type="number" 
                    value={amount} 
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder={actionType === "deposit" ? "Min. 500" : "Min. 1,000"} 
                    required
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3.5 pl-12 font-bold text-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition"
                  />
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">UGX</span>
                </div>
                
                {/* Dynamically display processing fee breakdown for deposits */}
                {actionType === "deposit" && rawAmount >= 500 && (
                  <div className="flex justify-between px-1 pt-1.5 text-xs font-semibold text-slate-500">
                    <span>Processing Fee (5%):</span>
                    <span className="text-slate-900">+ {processingFee.toLocaleString()} UGX</span>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wide">Mobile Money Number</label>
                <input 
                  type="tel" 
                  value={phone} 
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="e.g. 0770000000" 
                  required
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3.5 font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition"
                />
              </div>

              {actionType === "withdraw" && (
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wide">Network Provider</label>
                  <div className="flex p-1 bg-slate-100 rounded-xl">
                    <button 
                      type="button" 
                      onClick={() => setProvider("MTN")} 
                      className={`flex-1 py-2.5 rounded-lg text-sm font-bold transition-all ${provider === "MTN" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
                    >
                      MTN
                    </button>
                    <button 
                      type="button" 
                      onClick={() => setProvider("AIRTEL")} 
                      className={`flex-1 py-2.5 rounded-lg text-sm font-bold transition-all ${provider === "AIRTEL" ? "bg-white text-rose-600 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
                    >
                      Airtel
                    </button>
                  </div>
                </div>
              )}

              <div className="pt-2">
                <button 
                  type="submit" 
                  disabled={isProcessing} 
                  className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white font-bold text-sm py-4 rounded-xl hover:bg-blue-700 shadow-sm transition-all active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {isProcessing && <Loader2 size={18} className="animate-spin" />}
                  {isProcessing ? "Processing..." : actionType === "deposit" ? `Pay ${totalCharge.toLocaleString()} UGX` : "Confirm Withdrawal"}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default function WalletPageWrapper() {
  return (
    <Suspense fallback={<div className="flex justify-center items-center min-h-[60vh]"><Loader2 className="w-8 h-8 text-blue-500 animate-spin" /></div>}>
      <WalletContent />
    </Suspense>
  );
}
