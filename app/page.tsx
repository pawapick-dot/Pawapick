// app/page.tsx
import Link from "next/link";
import { Zap, ShieldCheck, TrendingUp } from "lucide-react";

export default function Home() {
  return (
    <div className="max-w-md mx-auto min-h-screen flex flex-col justify-between py-12 px-6">
      
      {/* Hero Section */}
      <div className="text-center space-y-6 pt-12">
        <div className="inline-block px-4 py-1.5 rounded-full bg-gray-900/5 text-gray-900 font-bold text-[10px] tracking-widest uppercase">
          Live Betting Network
        </div>
        
        <h1 className="text-6xl font-extrabold tracking-tighter text-gray-900 leading-[0.9]">
          Pawa<br/>Pick.
        </h1>
        
        <p className="text-lg text-gray-500 font-medium max-w-xs mx-auto">
          The fastest way to challenge players and win instantly. Transparent, provable, and P2P.
        </p>

        {/* Hero CTA */}
        <Link href="/feed" className="block pt-4">
          <button className="w-full bg-gray-900 text-white font-bold text-lg py-5 rounded-2xl shadow-xl hover:bg-gray-800 transition active:scale-[0.98]">
            Enter the Arena
          </button>
        </Link>
      </div>

      {/* Trust Pillars */}
      <div className="grid grid-cols-1 gap-4 mt-12">
        <div className="flex items-center gap-4 bg-white border border-gray-100 p-5 rounded-2xl shadow-sm">
          <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center">
            <Zap size={20} className="text-gray-900" />
          </div>
          <div>
            <h4 className="font-bold text-gray-900 text-sm">Instant Resolution</h4>
            <p className="text-[12px] text-gray-400">Wins paid out the second the match settles.</p>
          </div>
        </div>

        <div className="flex items-center gap-4 bg-white border border-gray-100 p-5 rounded-2xl shadow-sm">
          <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center">
            <ShieldCheck size={20} className="text-gray-900" />
          </div>
          <div>
            <h4 className="font-bold text-gray-900 text-sm">Provably Fair</h4>
            <p className="text-[12px] text-gray-400">Cryptographic audit for every single game.</p>
          </div>
        </div>
      </div>

      {/* Social Proof Stats */}
      <div className="mt-12 flex justify-between px-2">
        <div className="text-center">
          <p className="text-2xl font-black text-gray-900">50+</p>
          <p className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Live Games</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-black text-gray-900">10s</p>
          <p className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Avg Speed</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-black text-gray-900">100%</p>
          <p className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">P2P</p>
        </div>
      </div>
    </div>
  );
}
