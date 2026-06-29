"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import { LifeBuoy, AlertCircle, CheckCircle2, Search, ExternalLink, XCircle } from "lucide-react";
import Link from "next/link";

export default function AdminSupport() {
  const { user } = useAuth();
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [processingId, setProcessingId] = useState<string | null>(null);

  useEffect(() => {
    const fetchTickets = async () => {
      if (!user) return;
      try {
        const token = await user.getIdToken();
        const res = await fetch("/api/admin/support", {
          headers: { "Authorization": `Bearer ${token}` }
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error);
        setReports(data.tickets || []);
      } catch (err: any) {
        toast.error(err.message || "Failed to load support tickets");
      } finally {
        setLoading(false);
      }
    };
    fetchTickets();
  }, [user]);

  const handleUpdateStatus = async (id: string, newStatus: string) => {
    if (!user) return;
    setProcessingId(id);
    try {
      const token = await user.getIdToken();
      const res = await fetch(`/api/admin/support/${id}`, {
        method: "PATCH",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}` 
        },
        body: JSON.stringify({ status: newStatus })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setReports(prev => prev.map(r => r.id === id ? { ...r, status: newStatus } : r));
      toast.success(`Ticket marked as ${newStatus}`);
    } catch (err: any) {
      toast.error(err.message || "Failed to update ticket");
    } finally {
      setProcessingId(null);
    }
  };

  const filteredReports = reports.filter(r => 
    r.userName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.subject?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.gameId?.includes(searchTerm)
  );

  if (loading) return <div className="text-slate-400 font-medium animate-pulse">Loading tickets...</div>;

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">Support Center</h1>
          <p className="text-sm text-slate-500 font-medium mt-1">Manage player reports and disputes.</p>
        </div>

        <div className="relative w-full sm:w-72">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
            <Search size={18} />
          </div>
          <input
            type="text"
            placeholder="Search tickets, users, or game IDs..."
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
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Report Info</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">User</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Game Ref</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredReports.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center">
                    <LifeBuoy size={32} className="text-slate-300 mx-auto mb-3" />
                    <p className="text-sm font-bold text-slate-900">Inbox Zero!</p>
                    <p className="text-xs text-slate-500 mt-1">No support tickets found.</p>
                  </td>
                </tr>
              ) : (
                filteredReports.map((r) => (
                  <tr key={r.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <p className="font-bold text-slate-900 text-sm">{r.subject || "General Issue"}</p>
                      <p className="text-xs text-slate-500 mt-1 line-clamp-1 max-w-[200px]" title={r.message}>{r.message}</p>
                      <span className="text-[10px] text-slate-400 font-medium mt-2 block">
                        {new Date(r.createdAt).toLocaleString()}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-bold text-slate-700 text-sm">{r.userName || "Unknown"}</p>
                      <Link href={`/admin/users/${r.userId}`} className="text-[10px] text-blue-600 hover:underline flex items-center gap-1 mt-1">
                        View Profile <ExternalLink size={10} />
                      </Link>
                    </td>
                    <td className="px-6 py-4">
                      {r.gameId ? (
                         <span className="text-xs font-mono bg-slate-100 px-2 py-1 rounded text-slate-600">
                           {r.gameId.substring(0,8)}...
                         </span>
                      ) : (
                        <span className="text-xs text-slate-400">—</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-widest ${
                        r.status === 'open' ? 'bg-amber-50 text-amber-600 border border-amber-100' : 
                        r.status === 'resolved' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 
                        'bg-slate-100 text-slate-500 border border-slate-200'
                      }`}>
                        {r.status || 'open'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      {r.status === "open" ? (
                        <div className="flex items-center justify-end gap-2">
                          <button 
                            onClick={() => handleUpdateStatus(r.id, "dismissed")}
                            disabled={processingId === r.id}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors disabled:opacity-50"
                            title="Dismiss"
                          >
                            <XCircle size={18} />
                          </button>
                          <button 
                            onClick={() => handleUpdateStatus(r.id, "resolved")}
                            disabled={processingId === r.id}
                            className="p-1.5 text-emerald-600 bg-emerald-50 hover:bg-emerald-100 rounded transition-colors disabled:opacity-50"
                            title="Mark Resolved"
                          >
                            <CheckCircle2 size={18} />
                          </button>
                        </div>
                      ) : (
                        <span className="text-xs font-semibold text-slate-400 capitalize">{r.status}</span>
                      )}
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
