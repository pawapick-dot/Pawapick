// app/admin/transactions/page.tsx
"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import { ArrowRightLeft, Search } from "lucide-react";

export default function AdminTransactions() {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const fetchTransactions = async () => {
      if (!user) return;
      try {
        const token = await user.getIdToken();
        const res = await fetch("/api/admin/transactions", { headers: { "Authorization": `Bearer ${token}` } });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error);
        setTransactions(data.transactions);
      } catch (err: any) {
        toast.error(err.message || "Failed to load transactions");
      } finally {
        setLoading(false);
      }
    };
    fetchTransactions();
  }, [user]);

  const filteredTx = transactions.filter(tx => 
    tx.id.includes(searchTerm) || tx.userName?.toLowerCase().includes(searchTerm.toLowerCase()) || tx.type.includes(searchTerm.toLowerCase())
  );

  const getTypeStyle = (type: string) => {
    switch (type) {
      case "deposit": return "bg-emerald-50 text-emerald-600 border-emerald-100";
      case "withdrawal": return "bg-rose-50 text-rose-600 border-rose-100";
      case "prize": return "bg-blue-50 text-blue-600 border-blue-100";
      case "refund": return "bg-amber-50 text-amber-600 border-amber-100";
      default: return "bg-slate-50 text-slate-600 border-slate-200";
    }
  };

  if (loading) return <div className="text-slate-400 font-medium animate-pulse">Scanning ledger...</div>;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">Financial Ledger</h1>
          <p className="text-sm text-slate-500 font-medium mt-1">Immutable record of all platform transactions.</p>
        </div>
        
        <div className="relative w-full sm:w-72">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
            <Search size={18} />
          </div>
          <input
            type="text"
            placeholder="Search ID, User, or Type..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow shadow-sm"
          />
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Transaction ID</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">User</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Type</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Amount</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider text-right">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredTx.map((tx) => (
                <tr key={tx.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <ArrowRightLeft size={14} className="text-slate-400" />
                      <span className="text-xs font-mono text-slate-600">{tx.id}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 font-bold text-slate-900 text-sm">{tx.userName}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 border rounded text-[10px] font-bold uppercase tracking-widest ${getTypeStyle(tx.type)}`}>
                      {tx.type.replace("_", " ")}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <p className={`font-bold text-sm ${tx.type === 'withdrawal' || tx.type === 'stake' ? 'text-rose-600' : 'text-emerald-600'}`}>
                      {tx.type === 'withdrawal' || tx.type === 'stake' ? '-' : '+'}{tx.amount.toLocaleString()} <span className="text-[10px] font-bold">UGX</span>
                    </p>
                  </td>
                  <td className="px-6 py-4 text-right text-xs text-slate-500 font-medium">
                    {new Date(tx.createdAt).toLocaleString()}
                  </td>
                </tr>
              ))}
              {filteredTx.length === 0 && (
                <tr><td colSpan={5} className="px-6 py-12 text-center text-sm font-medium text-slate-400">No transactions match your search.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
