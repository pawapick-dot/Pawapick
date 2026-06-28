// app/admin/withdrawals/page.tsx
"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import { Search, Check, X as RejectIcon, Clock } from "lucide-react";

export default function AdminWithdrawals() {
  const { user } = useAuth();
  const [withdrawals, setWithdrawals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [processingId, setProcessingId] = useState<string | null>(null);

  useEffect(() => {
    const fetchWithdrawals = async () => {
      if (!user) return;
      try {
        const token = await user.getIdToken();
        const res = await fetch("/api/admin/withdrawals", {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        
        if (!res.ok) throw new Error("Failed to fetch withdrawals");
        
        const data = await res.json();
        setWithdrawals(data.withdrawals);
      } catch (err) {
        console.error(err);
        toast.error("Could not load withdrawal requests.");
      } finally {
        setLoading(false);
      }
    };

    fetchWithdrawals();
  }, [user]);

  const handleAction = async (id: string, action: "approve" | "reject") => {
    if (!user) return;
    
    // Optional Rejection Reason
    let rejectionReason = "";
    if (action === "reject") {
      const promptReason = prompt("Are you sure you want to reject this? Optional: Enter a reason for the user:");
      if (promptReason === null) return; // User clicked Cancel on the prompt
      rejectionReason = promptReason;
    } else {
      if (!confirm("Have you sent the mobile money? Click OK to approve and finalize this withdrawal.")) return;
    }

    setProcessingId(id);
    try {
      const token = await user.getIdToken();
      
      const res = await fetch(`/api/admin/withdrawals/update`, { 
        method: "POST", 
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ 
          withdrawalId: id, 
          action,
          ...(rejectionReason && { rejectionReason })
        }) 
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Action failed");

      toast.success(`Withdrawal ${action}d successfully.`);
      
      // Remove the processed item from the UI
      setWithdrawals((prev) => prev.filter(w => w.id !== id));
    } catch (err: any) {
      toast.error(err.message || `Failed to ${action} withdrawal`);
    } finally {
      setProcessingId(null);
    }
  };

  const filteredWithdrawals = withdrawals.filter(w => 
    w.userName?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    w.phone?.includes(searchTerm)
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-slate-400 font-bold animate-pulse tracking-widest uppercase text-sm">
          Loading requests...
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">Withdrawal Requests</h1>
          <p className="text-sm text-slate-500 font-medium mt-1">Review and process user payouts securely.</p>
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
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all shadow-sm"
          />
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                <th className="px-6 py-4 text-xs font-extrabold text-slate-400 uppercase tracking-wider">User</th>
                <th className="px-6 py-4 text-xs font-extrabold text-slate-400 uppercase tracking-wider">Mobile Money</th>
                <th className="px-6 py-4 text-xs font-extrabold text-slate-400 uppercase tracking-wider">Amount</th>
                <th className="px-6 py-4 text-xs font-extrabold text-slate-400 uppercase tracking-wider">Requested</th>
                <th className="px-6 py-4 text-xs font-extrabold text-slate-400 uppercase tracking-wider text-right">Actions</th>
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
                    <p className="font-extrabold text-slate-900 text-sm">
                      {w.amount.toLocaleString()} <span className="text-[10px] text-slate-400 uppercase tracking-widest ml-0.5">UGX</span>
                    </p>
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
                        title="Reject & Refund"
                      >
                        <RejectIcon size={18} />
                      </button>
                      <button 
                        onClick={() => handleAction(w.id, "approve")}
                        disabled={processingId === w.id}
                        className="px-4 py-2 bg-emerald-600 text-white font-bold text-xs rounded-lg hover:bg-emerald-700 transition-colors shadow-sm disabled:opacity-50 flex items-center gap-1.5 active:scale-95"
                      >
                        <Check size={16} strokeWidth={3} /> Approve
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredWithdrawals.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center">
                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-slate-50 border border-slate-100 mb-3">
                      <Check size={20} className="text-emerald-500" />
                    </div>
                    <p className="text-sm font-bold text-slate-900">All caught up!</p>
                    <p className="text-xs font-medium text-slate-400 mt-1">No pending withdrawal requests at the moment.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
