// app/dashboard/page.tsx
"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";

export default function Dashboard() {
  const [balance, setBalance] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);

  // Fetch wallet balance from our API route
  const fetchBalance = async () => {
    try {
      const res = await fetch("/api/wallet");
      const data = await res.json();
      if (res.ok) {
        setBalance(data.balance);
      }
    } catch (err) {
      toast.error("Failed to sync wallet with server.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBalance();
  }, []);

  // Trigger a mock mobile money load
  const handleMockDeposit = async () => {
    const depositAmount = 25000; // Adding 25,000 UGX per tap

    toast.promise(
      fetch("/api/wallet", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: depositAmount }),
      }).then(async (res) => {
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Transaction failed");
        setBalance(data.balance);
        return data;
      }),
      {
        loading: "Simulating Mobile Money network push...",
        success: () => `Success! +${depositAmount.toLocaleString()} UGX added to wallet.`,
        error: (err) => err.message,
      }
    );
  };

  return (
    <div className="max-w-md mx-auto space-y-6 mt-4">
      {/* App Header Branding */}
      <div className="flex justify-between items-center px-2">
        <span className="text-xl font-bold tracking-tight">Pawa Pick</span>
        <span className="text-xs bg-gray-200 text-gray-700 px-2 py-1 rounded-full font-mono font-bold">MVP MODE</span>
      </div>

      {/* Premium Bento Box: Wallet Status */}
      <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm space-y-4">
        <div>
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Available Balance</p>
          <h2 className="text-3xl font-bold tracking-tight mt-1">
            {loading ? "..." : `${balance.toLocaleString()} UGX`}
          </h2>
        </div>
        
        <button
          onClick={handleMockDeposit}
          className="w-full bg-gray-900 text-white font-medium py-3 rounded-xl hover:bg-gray-800 transition active:scale-[0.98]"
        >
          Add 25,000 UGX Test Money
        </button>
      </div>

      {/* Placeholder Section for Next Task: Game Grid */}
      <div className="border border-dashed border-gray-200 rounded-3xl p-8 text-center bg-gray-50/50">
        <p className="text-sm text-gray-400 font-medium">Global Challenge Feed Coming Next</p>
      </div>
    </div>
  );
}
