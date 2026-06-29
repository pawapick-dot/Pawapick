// app/referrals/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import { Copy, Share2, Users, Trophy, Loader2, Gift, ChevronRight } from "lucide-react";

export default function ReferralsPage() {
  const { user, loading: authLoading, openAuthModal } = useAuth();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isCopied, setIsCopied] = useState(false);

  useEffect(() => {
    const fetchReferrals = async () => {
      if (!user) return;
      try {
        const token = await user.getIdToken();
        const res = await fetch("/api/referrals", {
          headers: { "Authorization": `Bearer ${token}` }
        });
        const json = await res.json();
        if (res.ok) setData(json);
      } catch (error) {
        console.error("Failed to load referral data");
      } finally {
        setLoading(false);
      }
    };

    if (!authLoading && user) fetchReferrals();
  }, [user, authLoading]);

  const copyToClipboard = () => {
    if (!data?.personalStats?.code) return;
    const inviteLink = `https://pawapick.com/?ref=${data.personalStats.code}`;
    navigator.clipboard.writeText(inviteLink);
    setIsCopied(true);
    toast.success("Invite link copied to clipboard!");
    setTimeout(() => setIsCopied(false), 2000);
  };

  const shareToWhatsApp = () => {
    if (!data?.personalStats?.code) return;
    const inviteLink = `https://pawapick.com/?ref=${data.personalStats.code}`;
    const message = `Hey! I'm predicting matches on Pawa Pick. Sign up using my link and we both win when you make your first deposit! 🏆\n\n${inviteLink}`;
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, "_blank");
  };

  if (authLoading) return <div className="flex justify-center items-center min-h-[60vh]"><Loader2 className="w-8 h-8 text-blue-500 animate-spin" /></div>;

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
        <div className="w-20 h-20 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mb-6 shadow-sm border border-blue-100">
          <Users size={32} />
        </div>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Invite & Earn</h1>
        <p className="text-slate-500 mt-2 font-medium max-w-sm">Sign in to get your unique invite link and start earning bonuses for every friend who joins.</p>
        <button 
          onClick={openAuthModal} 
          className="mt-8 bg-blue-600 text-white font-bold text-sm px-8 py-3.5 rounded-xl hover:bg-blue-700 shadow-sm transition-all active:scale-[0.98]"
        >
          Sign In
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto space-y-6 mt-4 pb-12 px-4 relative">
      
      {/* 1. Header & Stats Section */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-[2rem] p-8 relative overflow-hidden shadow-xl shadow-slate-900/10 border border-slate-800">
        <div className="absolute top-0 right-0 -mr-8 -mt-8 w-32 h-32 rounded-full bg-blue-500/20 blur-2xl"></div>
        <div className="absolute bottom-0 left-0 -ml-8 -mb-8 w-32 h-32 rounded-full bg-purple-500/20 blur-2xl"></div>
        
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-2xl font-extrabold text-white tracking-tight">Referrals</h1>
            <div className="flex items-center gap-1.5 bg-white/10 px-3 py-1.5 rounded-full backdrop-blur-sm border border-white/5">
              <Gift size={14} className="text-emerald-400" />
              <span className="text-xs font-bold text-white tracking-wide">200 UGX / Friend</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 divide-x divide-white/10">
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-1">Total Earned</p>
              <p className="text-3xl font-black text-white">
                {loading ? "..." : data?.personalStats?.totalEarned.toLocaleString()} <span className="text-sm text-slate-400">UGX</span>
              </p>
            </div>
            <div className="pl-4">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-1">Friends Invited</p>
              <p className="text-3xl font-black text-white">
                {loading ? "..." : data?.personalStats?.totalInvited}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Share Action Area */}
      <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm text-center">
        <h3 className="font-extrabold text-slate-900 mb-1">Your Invite Link</h3>
        <p className="text-xs font-medium text-slate-500 mb-4">Share this link. When they deposit 1,000 UGX, you get paid instantly.</p>
        
        <div className="flex items-center gap-2 bg-slate-50 p-2 rounded-xl border border-slate-100">
          <div className="flex-1 overflow-hidden px-3 text-sm font-semibold text-slate-600 truncate text-left">
            {loading ? "Generating link..." : `pawapick.com/?ref=${data?.personalStats?.code}`}
          </div>
          <button 
            onClick={copyToClipboard}
            className="p-3 bg-white text-slate-700 hover:text-blue-600 rounded-lg shadow-sm border border-slate-200 transition-colors"
          >
            {isCopied ? <CheckCircle2 size={18} className="text-emerald-500" /> : <Copy size={18} />}
          </button>
        </div>

        <button 
          onClick={shareToWhatsApp}
          className="w-full mt-4 flex items-center justify-center gap-2 bg-[#25D366] text-white font-bold text-sm py-4 rounded-xl hover:bg-[#20b858] shadow-sm transition-all active:scale-[0.98]"
        >
          <Share2 size={18} /> Share on WhatsApp
        </button>
      </div>

      {/* 3. Leaderboard */}
      <div className="bg-white border border-slate-100 rounded-[2rem] shadow-sm overflow-hidden">
        <div className="flex items-center gap-2 p-6 border-b border-slate-50 bg-slate-50/50">
          <Trophy size={18} className="text-amber-500" />
          <span className="font-bold text-slate-900 text-sm">Top Referrers</span>
        </div>

        <div className="divide-y divide-slate-50">
          {loading ? (
            <div className="p-12 text-center text-sm font-medium text-slate-400">Loading rankings...</div>
          ) : data?.leaderboard?.length === 0 ? (
            <div className="p-12 text-center text-sm font-medium text-slate-400">No bonuses claimed yet. Be the first!</div>
          ) : (
            data.leaderboard.map((user: any, index: number) => (
              <div key={index} className={`flex items-center justify-between p-5 transition-colors ${user.isMe ? 'bg-blue-50/50' : 'hover:bg-slate-50/50'}`}>
                <div className="flex items-center gap-4">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-black shrink-0 ${
                    index === 0 ? 'bg-amber-100 text-amber-600' : 
                    index === 1 ? 'bg-slate-200 text-slate-600' : 
                    index === 2 ? 'bg-orange-100 text-orange-600' : 
                    'bg-slate-50 text-slate-400'
                  }`}>
                    #{index + 1}
                  </div>
                  <div>
                    <p className="font-bold text-sm text-slate-900">
                      {user.name} {user.isMe && <span className="ml-1 text-[10px] bg-blue-100 text-blue-600 px-1.5 py-0.5 rounded uppercase tracking-wider">You</span>}
                    </p>
                    <p className="text-xs font-medium text-slate-500">{user.invites} active invites</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-extrabold text-sm text-emerald-600">
                    +{user.amount.toLocaleString()} <span className="text-[10px] text-slate-400 font-bold ml-0.5">UGX</span>
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
