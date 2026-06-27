// app/page.tsx
import Link from "next/link";
import { ShieldCheck, Swords, Wallet, CheckSquare } from "lucide-react";

export default function Home() {
  return (
    <div className="max-w-md mx-auto min-h-screen flex flex-col pt-8 pb-16 px-4">
      
      {/* Hero Section */}
      <div className="text-center space-y-6 pt-8">
        <div className="inline-block px-4 py-1.5 border-2 border-black bg-yellow-400 text-black font-black text-[10px] tracking-widest uppercase shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
          100% Peer-to-Peer Betting
        </div>
        
        <h1 className="text-6xl font-black tracking-tighter text-gray-900 leading-[0.9] uppercase">
          Pawa<br/>Pick.
        </h1>
        
        <p className="text-lg text-gray-600 font-medium max-w-xs mx-auto leading-snug">
          Stop betting against the company. Play directly against real people, win instant UGX, and withdraw your money.
        </p>

        {/* Hero CTA */}
        <div className="pt-6">
          <Link href="/feed" className="block">
            <button className="w-full bg-black text-white font-black uppercase tracking-widest text-lg py-5 border-2 border-black hover:bg-gray-800 transition shadow-[6px_6px_0px_0px_rgba(250,204,21,1)] active:translate-y-1 active:shadow-none">
              Enter the Arena
            </button>
          </Link>
        </div>
      </div>

      {/* Why Play Here? (Value Props) */}
      <div className="mt-16 space-y-4">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-2 h-2 bg-yellow-400"></div>
          <h3 className="text-[11px] font-black text-gray-400 uppercase tracking-widest">Why Pawa Pick?</h3>
        </div>

        <div className="bg-white border-2 border-black rounded-none p-5 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex gap-4 items-start">
          <div className="w-10 h-10 bg-yellow-400 border-2 border-black flex items-center justify-center shrink-0">
            <Swords size={20} className="text-black" />
          </div>
          <div>
            <h4 className="font-black text-gray-900 uppercase tracking-wide text-sm">No "House Edge"</h4>
            <p className="text-xs text-gray-600 mt-1 font-medium leading-relaxed">
              Betting companies are designed to make you lose. Here, you only play against other humans. Winner takes the pool (minus a small 10% platform fee to keep the lights on).
            </p>
          </div>
        </div>

        <div className="bg-white border-2 border-black rounded-none p-5 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex gap-4 items-start">
          <div className="w-10 h-10 bg-green-400 border-2 border-black flex items-center justify-center shrink-0">
            <Wallet size={20} className="text-black" />
          </div>
          <div>
            <h4 className="font-black text-gray-900 uppercase tracking-wide text-sm">Instant UGX Settlement</h4>
            <p className="text-xs text-gray-600 mt-1 font-medium leading-relaxed">
              When you win a match, the smart escrow instantly moves the money to your wallet. No waiting for admins to approve your money.
            </p>
          </div>
        </div>
      </div>

      {/* How It Works Guide */}
      <div className="mt-12">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-2 h-2 bg-yellow-400"></div>
          <h3 className="text-[11px] font-black text-gray-400 uppercase tracking-widest">How to Play</h3>
        </div>

        <div className="bg-gray-50 border-2 border-gray-200 p-1">
          <div className="space-y-1">
            
            <div className="bg-white p-5 border border-gray-100 flex gap-4 items-center">
              <span className="text-3xl font-black text-gray-200">1</span>
              <div>
                <h4 className="font-black text-sm text-gray-900 uppercase">Set a Trap</h4>
                <p className="text-[11px] text-gray-500 font-medium mt-0.5">Pick a game like Penalty or Colors. Hide your choice and lock in your UGX stake.</p>
              </div>
            </div>

            <div className="bg-white p-5 border border-gray-100 flex gap-4 items-center">
              <span className="text-3xl font-black text-gray-200">2</span>
              <div>
                <h4 className="font-black text-sm text-gray-900 uppercase">Wait for a Challenger</h4>
                <p className="text-[11px] text-gray-500 font-medium mt-0.5">Your game goes to the Live Feed. Someone matches your UGX and tries to guess your choice.</p>
              </div>
            </div>

            <div className="bg-white p-5 border border-gray-100 flex gap-4 items-center">
              <span className="text-3xl font-black text-gray-200">3</span>
              <div>
                <h4 className="font-black text-sm text-gray-900 uppercase">Take the Money</h4>
                <p className="text-[11px] text-gray-500 font-medium mt-0.5">If they guess wrong, you win their money. If they guess right, they take yours.</p>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* Security Reassurance */}
      <div className="mt-12 bg-gray-900 border-2 border-black p-6 text-center shadow-[4px_4px_0px_0px_rgba(250,204,21,1)]">
        <ShieldCheck size={28} className="mx-auto text-yellow-400 mb-3" />
        <h4 className="font-black text-white uppercase tracking-widest text-sm">Can people cheat?</h4>
        <p className="text-xs text-gray-400 mt-2 font-medium leading-relaxed">
          Impossible. When you create a match, your choice is locked using military-grade math (SHA-256 Cryptography). We give both players a receipt to prove the game was 100% fair.
        </p>
      </div>

    </div>
  );
}
