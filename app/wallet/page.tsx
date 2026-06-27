// app/wallet/page.tsx
"use client";

import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import { ArrowDownLeft, ArrowUpRight, History, ShieldCheck, Lock } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

type Transaction = {
  id: string;
  type: string;
  amount: number;
  createdAt: string;
  status: string;
};

export default function WalletPage() {
  const { user, loading: authLoading, openAuthModal } = useAuth();
  const [balance, setBalance] = useState<number>(0);
  const [history, setHistory] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchWalletData = useCallback(async () => {
    if (!user) return;
    try {
      const token = await user.getIdToken();
      const res = await fetch("/api/wallet", {
        headers: { "Authorization": `Bearer ${token}` }
      });
      const data = await res.json();
      
      if (res.ok) {
        setBalance(data.balance);
        setHistory(data.history);
      }
    } catch (err) {
      toast.error("Failed to sync secure wallet.");
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (!authLoading && user) {
      fetchWalletData();
    }
  }, [user, authLoading, fetchWalletData]);

  const handleDeposit = async () => {
    if (!user) return openAuthModal();
    const depositAmount = 25000;
    
    try {
      const token = await user.getIdToken();
      toast.promise(
        fetch("/api/wallet", {
          method: "POST",
          headers: { 
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
          },
          body: JSON.stringify({ amount: depositAmount }),
        }).then(async (res) => {
          const data = await res.json();
          if (!res.ok) throw new Error(data.error);
          setBalance(data.balance);
          fetchWalletData(); // Refresh ledger
          return data;
        }),
        {
          loading: "Processing secure deposit...",
          success: `+${depositAmount.toLocaleString()} UGX added.`,
          error: "Deposit failed.",
        }
      );
    } catch (error) {
      toast.error("Authentication error.");
    }
  };

  const handleWithdraw = () => {
    if (balance <= 0) return toast.error("Insufficient funds.");
    toast.info("Withdrawals require live mobile money API integration.");
  };

  if (authLoading) return <div className="p-8 text-center text-gray-400 font-bold uppercase tracking-widest animate-pulse">Decrypting...</div>;

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
        <div className="w-20 h-20 bg-gray-900 flex items-center justify-center mb-6 rounded-none shadow-2xl">
          <Lock size={32} className="text-yellow-400" />
        </div>
        <h1 className="text-3xl font-black text-gray-900 tracking-tight uppercase">Wallet Locked</h1>
        <button 
          onClick={openAuthModal}
          className="mt-8 bg-yellow-400 text-black font-black uppercase tracking-widest text-sm px-10 py-5 rounded-none border-2 border-black hover:bg-yellow-500 hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:translate-y-1 active:shadow-none transition-all"
        >
          Verify Identity
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto space-y-8 mt-6 pb-12 px-4">
      
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
        <button
          onClick={handleDeposit}
          className="bg-white border-2 border-gray-200 rounded-none p-5 hover:border-black hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all active:translate-y-1 active:shadow-none flex flex-col items-center justify-center gap-3 group"
        >
          <div className="w-12 h-12 rounded-none bg-yellow-400 flex items-center justify-center border-2 border-black">
            <ArrowDownLeft size={24} className="text-black" />
          </div>
          <span className="font-black text-gray-900 uppercase tracking-wider text-xs">Top Up</span>
        </button>

        <button
          onClick={handleWithdraw}
          className="bg-white border-2 border-gray-200 rounded-none p-5 hover:border-black hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all active:translate-y-1 active:shadow-none flex flex-col items-center justify-center gap-3 group"
        >
          <div className="w-12 h-12 rounded-none bg-gray-100 flex items-center justify-center border-2 border-transparent group-hover:border-black transition">
            <ArrowUpRight size={24} className="text-gray-900" />
          </div>
          <span className="font-black text-gray-900 uppercase tracking-wider text-xs">Withdraw</span>
        </button>
      </div>

      {/* Wallet Activity Ledger */}
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
                    <p className="text-[10px] font-bold text-gray-400 uppercase">{tx.createdAt}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`font-black text-lg ${tx.amount > 0 ? 'text-gray-900' : 'text-gray-900'}`}>
                    {tx.amount > 0 ? '+' : ''}{tx.amount.toLocaleString()}
                  </p>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{tx.status}</p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
