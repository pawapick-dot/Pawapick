// app/admin/withdrawals/page.tsx
"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import { Banknote, Search, Check, X as RejectIcon, Clock } from "lucide-react";

export default function AdminWithdrawals() {
  const { user } = useAuth();
  const [withdrawals, setWithdrawals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [processingId, setProcessingId] = useState<string | null>(null);

  useEffect(() => {
    // Placeholder for actual API fetch
    // fetch("/api/admin/withdrawals").then(...)
    setLoading(false);
  }, [user]);

  const handleAction = async (id: string, action: "approve" | "reject") => {
    if (!confirm(`Are you sure you want to ${action} this withdrawal?`)) return;
    setProcessingId(id);
    try {
      // Placeholder for actual API mutation
      // await fetch(`/api/admin/withdrawals/${id}`, { method: "POST", body: JSON.stringify({ action }) })
      toast.success(`Withdrawal ${action}d successfully.`);
      setWithdrawals(withdrawals.filter(w => w.id !== id));
    } catch (err: any) {
      toast.error(err.message || `Failed to ${action} withdrawal`);
    } finally {
      setProcessingId(null);
    }
  };

  const filteredWithdrawals = withdrawals.filter(w => 
    w.userName?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    w.phone.includes(searchTerm)
  );

  if (loading) return <div className="text-slate-400 font-medium animate-pulse">Loading requests...</div>;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">Withdrawal Requests</h1>
          <p className="text-sm text-slate-500 font-medium mt-1">Review and process user payouts.</p>
        </div>
        
        <div className="relative w-full sm:w-72">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
            <Search size={18} />
          </div>
          <input
            type="text"
            placeholder="Search user or phone..."
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
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">User</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Mobile Money</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Amount</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Requested</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredWithdrawals.map((w) => (
                <tr key={w.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <p className="font-bold text-slate-900 text-sm">{w.userName}</p>
                    <p className="text-[10px] font-mono text-slate-400 mt-1 uppercase">ID: {w.id.substring(0,8)}</p>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm font-bold text-slate-700">{w.phone}</p>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{w.network || "Airtel/MTN"}</span>
                  </td>
                  <td className="px-6 py-4">
                    <p className="font-bold text-slate-900 text-sm">{w.amount.toLocaleString()} <span className="text-[10px] text-slate-400">UGX</span></p>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1.5 text-slate-500 text-xs font-medium">
                      <Clock size={14} />
                      {new Date(w.createdAt).toLocaleString()}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button 
                        onClick={() => handleAction(w.id, "reject")}
                        disabled={processingId === w.id}
                        className="p-2 text-rose-600 bg-rose-50 hover:bg-rose-100 rounded-lg transition-colors border border-rose-100 disabled:opacity-50"
                        title="Reject"
                      >
                        <RejectIcon size={18} />
                      </button>
                      <button 
                        onClick={() => handleAction(w.id, "approve")}
                        disabled={processingId === w.id}
                        className="px-4 py-2 bg-emerald-600 text-white font-bold text-xs rounded-lg hover:bg-emerald-700 transition-colors shadow-sm disabled:opacity-50 flex items-center gap-1.5"
                      >
                        <Check size={16} /> Approve
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredWithdrawals.length === 0 && (
                <tr><td colSpan={5} className="px-6 py-12 text-center text-sm font-medium text-slate-400">No pending withdrawal requests.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
