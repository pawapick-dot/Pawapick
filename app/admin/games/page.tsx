// app/admin/games/page.tsx
"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import { Swords, Search, Ban, CheckCircle2, Clock } from "lucide-react";

export default function AdminGames() {
  const { user } = useAuth();
  const [games, setGames] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [processingId, setProcessingId] = useState<string | null>(null);

  useEffect(() => {
    const fetchGames = async () => {
      if (!user) return;
      try {
        const token = await user.getIdToken();
        const res = await fetch("/api/admin/games", { headers: { "Authorization": `Bearer ${token}` } });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error);
        setGames(data.games);
      } catch (err: any) {
        toast.error(err.message || "Failed to load challenges");
      } finally {
        setLoading(false);
      }
    };
    fetchGames();
  }, [user]);

  const handleCancelAndRefund = async (gameId: string) => {
    if (!confirm("Are you sure? This will cancel the game and refund the creator's stake.")) return;
    setProcessingId(gameId);
    try {
      const token = await user?.getIdToken();
      const res = await fetch(`/api/admin/games/${gameId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
        body: JSON.stringify({ action: "cancel_and_refund" })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      
      toast.success(data.message);
      setGames(games.map(g => g.id === gameId ? { ...g, status: "cancelled" } : g));
    } catch (err: any) {
      toast.error(err.message || "Failed to cancel game");
    } finally {
      setProcessingId(null);
    }
  };

  const filteredGames = games.filter(g => 
    g.id.includes(searchTerm) || g.creatorUsername?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return <div className="text-slate-400 font-medium animate-pulse">Loading challenges...</div>;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">Challenge Monitor</h1>
          <p className="text-sm text-slate-500 font-medium mt-1">Global view of all escrows.</p>
        </div>
        
        <div className="relative w-full sm:w-72">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
            <Search size={18} />
          </div>
          <input
            type="text"
            placeholder="Search Game ID or Creator..."
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
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Game Info</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Players</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Stake</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredGames.map((g) => (
                <tr key={g.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <p className="font-bold text-slate-900 text-sm capitalize flex items-center gap-2">
                      <Swords size={14} className="text-slate-400" /> {g.gameType.replace("_", " ")}
                    </p>
                    <p className="text-[10px] font-mono text-slate-400 mt-1 uppercase">ID: {g.id.substring(0,8)}...</p>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm font-bold text-slate-900">{g.creatorUsername || "Creator"}</p>
                    <p className="text-xs text-slate-500 font-medium mt-0.5">vs {g.status === "played" ? (g.playerBUsername || "Opponent") : "Pending"}</p>
                  </td>
                  <td className="px-6 py-4">
                    <p className="font-bold text-slate-900 text-sm">{g.stakeAmount.toLocaleString()} <span className="text-[10px] text-slate-400">UGX</span></p>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1.5">
                      {g.status === 'open' && <Clock size={14} className="text-blue-500"/>}
                      {g.status === 'played' && <CheckCircle2 size={14} className="text-emerald-500"/>}
                      {g.status === 'cancelled' && <Ban size={14} className="text-rose-500"/>}
                      <span className={`text-[10px] font-bold uppercase tracking-widest ${g.status === 'open' ? 'text-blue-600' : g.status === 'played' ? 'text-emerald-600' : 'text-rose-600'}`}>
                        {g.status}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    {g.status === "open" ? (
                      <button 
                        onClick={() => handleCancelAndRefund(g.id)}
                        disabled={processingId === g.id}
                        className="text-xs font-bold text-rose-600 bg-rose-50 hover:bg-rose-100 px-3 py-1.5 rounded-lg transition-colors border border-rose-100 disabled:opacity-50"
                      >
                        {processingId === g.id ? "Refunding..." : "Cancel & Refund"}
                      </button>
                    ) : (
                      <span className="text-xs text-slate-400 font-medium">Locked</span>
                    )}
                  </td>
                </tr>
              ))}
              {filteredGames.length === 0 && (
                <tr><td colSpan={5} className="px-6 py-12 text-center text-sm font-medium text-slate-400">No challenges found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
