// app/admin/users/[id]/page.tsx
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import { ArrowLeft, Wallet, ShieldAlert, CheckCircle2, History, ArrowRightLeft } from "lucide-react";

export default function AdminUserDetails({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { user } = useAuth();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    const fetchUserDetails = async () => {
      if (!user) return;
      try {
        const token = await user.getIdToken();
        const res = await fetch(`/api/admin/users/${params.id}`, {
          headers: { "Authorization": `Bearer ${token}` }
        });
        const json = await res.json();
        if (!res.ok) throw new Error(json.error);
        setData(json);
      } catch (err: any) {
        toast.error(err.message || "Failed to load user details");
        router.push("/admin/users");
      } finally {
        setLoading(false);
      }
    };
    fetchUserDetails();
  }, [user, params.id, router]);

  const toggleStatus = async () => {
    if (!confirm("Are you sure you want to change this user's account status?")) return;
    setIsUpdating(true);
    try {
      const token = await user?.getIdToken();
      const newStatus = data.user.status === "suspended" ? "active" : "suspended";
      
      const res = await fetch(`/api/admin/users/${params.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
        body: JSON.stringify({ status: newStatus })
      });
      
      const json = await res.json();
      if (!res.ok) throw new Error(json.error);
      
      setData({ ...data, user: { ...data.user, status: newStatus } });
      toast.success(`User ${newStatus} successfully.`);
    } catch (err: any) {
      toast.error(err.message || "Failed to update status");
    } finally {
      setIsUpdating(false);
    }
  };

  if (loading) return <div className="text-slate-400 font-medium animate-pulse">Loading profile...</div>;
  if (!data) return null;

  const { user: profile, games, transactions } = data;

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      <Link href="/admin/users" className="inline-flex items-center gap-1.5 text-slate-500 hover:text-slate-900 transition-colors font-semibold text-sm bg-white border border-slate-200 px-3 py-2 rounded-lg shadow-sm w-fit">
        <ArrowLeft size={16} /> Back to Users
      </Link>

      {/* User Header Card */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">{profile.displayName || "Unknown User"}</h1>
          <p className="text-sm font-medium text-slate-500 mt-1">{profile.phoneNumber || "No Phone Number"} • Joined {new Date(profile.createdAt).toLocaleDateString()}</p>
          <div className="mt-3 flex items-center gap-2">
            <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-widest ${profile.status === 'suspended' ? 'bg-rose-50 text-rose-600 border border-rose-100' : 'bg-emerald-50 text-emerald-600 border border-emerald-100'}`}>
              {profile.status || "Active"}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-4 w-full md:w-auto">
          <div className="bg-slate-50 border border-slate-100 rounded-xl p-4 flex-1 md:flex-none md:min-w-[180px]">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1 flex items-center gap-1"><Wallet size={14}/> Wallet</p>
            <p className="text-2xl font-extrabold text-slate-900">{(profile.walletBalance || 0).toLocaleString()} <span className="text-sm text-slate-400 font-bold">UGX</span></p>
          </div>
          
          <button 
            onClick={toggleStatus}
            disabled={isUpdating}
            className={`px-6 py-4 rounded-xl font-bold text-sm shadow-sm transition-colors flex-shrink-0 ${
              profile.status === "suspended" 
                ? "bg-emerald-600 hover:bg-emerald-700 text-white" 
                : "bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200"
            }`}
          >
            {isUpdating ? "Updating..." : profile.status === "suspended" ? "Reactivate User" : "Suspend User"}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Game History */}
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden flex flex-col h-[500px]">
          <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2">
              <History size={18} className="text-slate-400" />
              <h3 className="font-bold text-slate-900">Game History</h3>
            </div>
            <span className="text-xs font-bold bg-slate-100 text-slate-500 px-2 py-1 rounded-md">{games.length} Total</span>
          </div>
          <div className="overflow-y-auto flex-1 p-4 space-y-3 bg-slate-50/50">
            {games.length === 0 ? (
              <p className="text-center text-sm font-medium text-slate-400 mt-10">No games played yet.</p>
            ) : (
              games.map((g: any) => (
                <div key={g.id} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded border ${g.role === "Creator" ? "bg-blue-50 text-blue-600 border-blue-100" : "bg-purple-50 text-purple-600 border-purple-100"}`}>{g.role}</span>
                      <span className="text-xs font-medium text-slate-500">{new Date(g.createdAt).toLocaleDateString()}</span>
                    </div>
                    <p className="font-bold text-slate-900 text-sm capitalize">{g.gameType.replace("_", " ")}</p>
                  </div>
                  <div className="text-right">
                    <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-md ${g.status === 'open' ? 'text-blue-500 bg-blue-50' : 'text-slate-500 bg-slate-100'}`}>{g.status}</span>
                    <p className="font-bold text-slate-900 mt-1">{g.stakeAmount.toLocaleString()} <span className="text-[10px] text-slate-400">UGX</span></p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Transaction History */}
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden flex flex-col h-[500px]">
          <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2">
              <ArrowRightLeft size={18} className="text-slate-400" />
              <h3 className="font-bold text-slate-900">Transaction History</h3>
            </div>
          </div>
          <div className="overflow-y-auto flex-1 p-4 space-y-3 bg-slate-50/50">
            {transactions.length === 0 ? (
              <p className="text-center text-sm font-medium text-slate-400 mt-10">No financial transactions recorded.</p>
            ) : (
              transactions.map((tx: any) => (
                <div key={tx.id} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
                  <div>
                     <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded border ${tx.type === "deposit" ? "bg-emerald-50 text-emerald-600 border-emerald-100" : tx.type === "withdrawal" ? "bg-rose-50 text-rose-600 border-rose-100" : "bg-slate-50 text-slate-600 border-slate-200"}`}>{tx.type}</span>
                     <p className="text-xs font-medium text-slate-500 mt-1.5">{new Date(tx.createdAt).toLocaleDateString()}</p>
                  </div>
                  <div className="text-right">
                     <p className={`font-bold text-sm ${tx.type === "deposit" || tx.type === "prize" ? "text-emerald-600" : "text-slate-900"}`}>
                       {tx.type === "deposit" || tx.type === "prize" ? "+" : "-"}{tx.amount.toLocaleString()} <span className="text-[10px] text-slate-400">UGX</span>
                     </p>
                     <span className={`text-[10px] font-bold uppercase tracking-widest ${tx.status === 'completed' ? 'text-emerald-500' : 'text-amber-500'}`}>{tx.status}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
