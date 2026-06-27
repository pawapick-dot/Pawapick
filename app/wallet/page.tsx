// app/wallet/page.tsx
"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { ArrowDownLeft, ArrowUpRight, History, ShieldCheck } from "lucide-react";

export default function WalletPage() {
  const [balance, setBalance] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);

  // Fetch wallet balance
  const fetchBalance = async () => {
    try {
      const res = await fetch("/api/wallet");
      const data = await res.json();
      if (res.ok) {
        setBalance(data.balance);
      }
    } catch (err) {
      toast.error("Failed to sync wallet.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBalance();
  }, []);

  // Top Up Action
  const handleDeposit = async () => {
    const depositAmount = 25000;
    toast.promise(
      fetch("/api/wallet", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: depositAmount }),
      }).then(async (res) => {
        const data = await res.json();
        if (!res.ok) throw new Error(data.error);
        setBalance(data.balance);
        return data;
      }),
      {
        loading: "Processing Mobile Money deposit...",
        success: `+${depositAmount.toLocaleString()} UGX added to your balance.`,
        error: "Deposit failed.",
      }
    );
  };

  // Withdraw Action (Mocked for MVP)
  const handleWithdraw = () => {
    if (balance <= 0) return toast.error("Insufficient funds to withdraw.");
    toast.info("Withdrawals are disabled in MVP Mode. API integration required.");
  };

  // Mock History Data (Until you build the /api/wallet/history route)
  const mockHistory = [
    { id: 1, type: "deposit", amount: 25000, date: "Today, 14:30", status: "Completed" },
    { id: 2, type: "game_win", amount: 4500, date: "Yesterday, 18:45", status: "Completed" },
    { id: 3, type: "game_loss", amount: -2000, date: "Yesterday, 16:20", status: "Completed" },
  ];

  return (
    <div className="max-w-md mx-auto space-y-6 mt-4 pb-12 px-2">
      
      {/* Wallet Balance Card (Black & Yellow Branding) */}
      <div className="bg-gray-900 rounded-[2rem] p-8 shadow-xl relative overflow-hidden">
        {/* Background Accent */}
        <div className="absolute -right-12 -top-12 w-40 h-40 bg-yellow-400 rounded-full blur-[80px] opacity-20"></div>
        
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-2">
            <ShieldCheck size={16} className="text-yellow-400" />
            <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Escrow Balance</span>
          </div>
          
          <h2 className="text-4xl font-black text-white tracking-tight">
            {loading ? "..." : `${balance.toLocaleString()}`}
            <span className="text-lg text-yellow-400 ml-2">UGX</span>
          </h2>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="grid grid-cols-2 gap-4">
        <button
          onClick={handleDeposit}
          className="bg-white border border-gray-100 rounded-3xl p-5 shadow-sm hover:border-yellow-200 hover:shadow-md transition active:scale-95 flex flex-col items-center justify-center gap-2 group"
        >
          <div className="w-12 h-12 rounded-full bg-yellow-50 flex items-center justify-center group-hover:bg-yellow-100 transition">
            <ArrowDownLeft size={24} className="text-yellow-600" />
          </div>
          <span className="font-bold text-gray-900">Top Up</span>
        </button>

        <button
          onClick={handleWithdraw}
          className="bg-white border border-gray-100 rounded-3xl p-5 shadow-sm hover:border-gray-300 hover:shadow-md transition active:scale-95 flex flex-col items-center justify-center gap-2 group"
        >
          <div className="w-12 h-12 rounded-full bg-gray-50 flex items-center justify-center group-hover:bg-gray-100 transition">
            <ArrowUpRight size={24} className="text-gray-900" />
          </div>
          <span className="font-bold text-gray-900">Withdraw</span>
        </button>
      </div>

      {/* Wallet Activity Ledger */}
      <div className="bg-white border border-gray-100 rounded-3xl p-1 shadow-sm mt-8">
        <div className="flex items-center gap-2 p-5 border-b border-gray-50">
          <History size={18} className="text-gray-400" />
          <span className="font-bold text-gray-900">Recent Activity</span>
        </div>

        <div className="p-2 space-y-1">
          {mockHistory.map((tx) => (
            <div key={tx.id} className="flex items-center justify-between p-3 rounded-2xl hover:bg-gray-50 transition">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  tx.type === 'deposit' || tx.type === 'game_win' ? 'bg-green-50 text-green-600' : 'bg-gray-100 text-gray-500'
                }`}>
                  {tx.type === 'deposit' || tx.type === 'game_win' ? <ArrowDownLeft size={16} /> : <ArrowUpRight size={16} />}
                </div>
                <div>
                  <p className="font-bold text-sm text-gray-900 capitalize">{tx.type.replace("_", " ")}</p>
                  <p className="text-[10px] text-gray-400">{tx.date}</p>
                </div>
              </div>
              <div className="text-right">
                <p className={`font-bold ${tx.amount > 0 ? 'text-gray-900' : 'text-gray-900'}`}>
                  {tx.amount > 0 ? '+' : ''}{tx.amount.toLocaleString()}
                </p>
                <p className="text-[10px] text-gray-400 uppercase">{tx.status}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
