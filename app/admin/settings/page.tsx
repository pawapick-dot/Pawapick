"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import { Settings as SettingsIcon, Save, Percent, Gamepad2, Banknote } from "lucide-react";

export default function AdminSettings() {
  const { user } = useAuth();
  const [isSaving, setIsSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  const [config, setConfig] = useState({
    platformFee: 10,
    minDeposit: 500,
    minWithdrawal: 1000,
    games: { penalty: true, shuffle: true, color: true }
  });

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await fetch("/api/settings");
        const data = await res.json();
        if (res.ok && data.settings) {
          setConfig(data.settings);
        }
      } catch (error) {
        console.error("Failed to load settings");
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, []);

  const handleSave = async () => {
    if (!user) return;
    setIsSaving(true);
    
    try {
      const token = await user.getIdToken();
      const res = await fetch("/api/admin/settings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(config)
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      toast.success("Platform settings updated successfully");
    } catch (error: any) {
      toast.error(error.message || "Failed to update settings");
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) return <div className="text-slate-400 font-medium animate-pulse">Loading settings...</div>;

  return (
    <div className="max-w-4xl space-y-8 pb-12">
      <div>
        <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">Platform Settings</h1>
        <p className="text-sm text-slate-500 font-medium mt-1">Configure financial logic and active modules.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

        {/* Financial Settings */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-6">
          <div className="flex items-center gap-2 mb-2">
            <Percent size={20} className="text-blue-600" />
            <h2 className="font-bold text-slate-900">Financial Rules</h2>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-500 uppercase tracking-widest block mb-2">Platform Fee (%)</label>
            <input 
              type="number" 
              value={config.platformFee}
              onChange={(e) => setConfig({...config, platformFee: Number(e.target.value)})}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-900 focus:outline-none focus:border-blue-500"
            />
            <p className="text-[11px] text-slate-400 font-medium mt-1.5">Percentage taken from the total pool of a completed match.</p>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-500 uppercase tracking-widest block mb-2">Minimum Deposit (UGX)</label>
            <input 
              type="number" 
              value={config.minDeposit}
              onChange={(e) => setConfig({...config, minDeposit: Number(e.target.value)})}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-900 focus:outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-slate-500 uppercase tracking-widest block mb-2">Minimum Withdrawal (UGX)</label>
            <input 
              type="number" 
              value={config.minWithdrawal}
              onChange={(e) => setConfig({...config, minWithdrawal: Number(e.target.value)})}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-900 focus:outline-none focus:border-blue-500"
            />
          </div>
        </div>

        {/* Game Modules */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-6">
          <div className="flex items-center gap-2 mb-2">
            <Gamepad2 size={20} className="text-emerald-600" />
            <h2 className="font-bold text-slate-900">Active Game Modules</h2>
          </div>
          <p className="text-xs text-slate-500 font-medium">Disable a game to hide it from the "Create" menu for all users.</p>

          <div className="space-y-4 pt-2">
            {Object.entries(config.games).map(([key, isActive]) => (
              <div key={key} className="flex items-center justify-between p-4 bg-slate-50 border border-slate-100 rounded-xl">
                <div>
                  <p className="font-bold text-slate-900 capitalize">{key.replace("_", " ")}</p>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{isActive ? "Enabled" : "Disabled"}</p>
                </div>
                <button
                  onClick={() => setConfig({
                    ...config, 
                    games: { ...config.games, [key as keyof typeof config.games]: !isActive }
                  })}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${isActive ? 'bg-emerald-500' : 'bg-slate-300'}`}
                >
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${isActive ? 'translate-x-6' : 'translate-x-1'}`} />
                </button>
              </div>
            ))}
          </div>
        </div>

      </div>

      <div className="flex justify-end pt-4">
        <button 
          onClick={handleSave}
          disabled={isSaving}
          className="bg-slate-900 text-white font-bold px-8 py-4 rounded-xl hover:bg-slate-800 transition-colors shadow-sm disabled:opacity-50 flex items-center gap-2"
        >
          {isSaving ? "Saving..." : <><Save size={18} /> Save Configuration</>}
        </button>
      </div>
    </div>
  );
}
