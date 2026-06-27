// app/admin/page.tsx
"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import { 
  Users, Swords, CheckCircle2, DollarSign, 
  ArrowDownToLine, ArrowUpFromLine, Activity
} from "lucide-react";

export default function AdminDashboard() {
  const { user } = useAuth();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      if (!user) return;
      try {
        const token = await user.getIdToken();
        const res = await fetch("/api/admin/dashboard", {
          headers: { "Authorization": `Bearer ${token}` }
        });
        const json = await res.json();
        
        if (!res.ok) throw new Error(json.error);
        setData(json);
      } catch (err: any) {
        toast.error(err.message || "Failed to load dashboard data");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, [user]);

  if (loading) {
    return <div className="text-slate-400 font-medium animate-pulse">Syncing platform metrics...</div>;
  }

  if (!data) return null;

  const statCards = [
    { label: "Total Users", value: data.totalUsers, icon: Users, color: "text-blue-600", bg: "bg-blue-50" },
    { label: "Active Challenges", value: data.activeChallenges, icon: Swords, color: "text-amber-600", bg: "bg-amber-50" },
    { label: "Completed Today", value: data.completedToday, icon: CheckCircle2, color: "text-emerald-600", bg: "bg-emerald-50" },
    { label: "Revenue Today (UGX)", value: data.revenueToday.toLocaleString(), icon: DollarSign, color: "text-indigo-600", bg: "bg-indigo-50" },
    { label: "Pending Withdrawals", value: data.pendingWithdrawals, icon: ArrowUpFromLine, color: "text-rose-600", bg: "bg-rose-50" },
    { label: "Deposits Today (UGX)", value: data.totalDepositsToday.toLocaleString(), icon: ArrowDownToLine, color: "text-emerald-600", bg: "bg-emerald-50" },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">Overview</h1>
        <p className="text-sm text-slate-500 font-medium mt-1">Platform telemetry and daily metrics.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        {statCards.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <div key={i} className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex items-start gap-4">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${stat.bg} ${stat.color}`}>
                <Icon size={24} />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">{stat.label}</p>
                <p className="text-2xl font-extrabold text-slate-900">{stat.value}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Recent Activity Table */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="px-6 py-5 border-b border-slate-100 flex items-center gap-2">
          <Activity size={18} className="text-slate-400" />
          <h3 className="font-bold text-slate-900">Live Activity Feed</h3>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50">
                <th className="px-6 py-3 text-xs font-bold text-slate-400 uppercase tracking-wider">Event</th>
                <th className="px-6 py-3 text-xs font-bold text-slate-400 uppercase tracking-wider">Amount</th>
                <th className="px-6 py-3 text-xs font-bold text-slate-400 uppercase tracking-wider">Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {data.recentActivity.length === 0 ? (
                <tr>
                  <td colSpan={3} className="px-6 py-8 text-center text-sm text-slate-400 font-medium">No recent activity detected.</td>
                </tr>
              ) : (
                data.recentActivity.map((act: any, i: number) => (
                  <tr key={i} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-2 h-2 rounded-full ${act.type === 'game_completed' ? 'bg-emerald-500' : 'bg-blue-500'}`}></div>
                        <span className="text-sm font-semibold text-slate-900">{act.label}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm font-medium text-slate-600">
                        {act.amount > 0 ? `${act.amount.toLocaleString()} UGX` : '-'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-xs font-medium text-slate-500">
                        {new Date(act.date).toLocaleTimeString()}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
