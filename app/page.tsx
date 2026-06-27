// app/page.tsx
import Link from "next/link";
import { ShieldCheck, BrainCircuit, Wallet, Activity } from "lucide-react";

export default function Home() {
  return (
    <div className="max-w-md mx-auto min-h-screen flex flex-col pt-10 pb-16 px-4">
      
      {/* Hero Section */}
      <div className="text-center space-y-6 pt-8">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-50 text-blue-700 font-medium text-xs border border-blue-100">
          <Activity size={14} />
          Peer-to-Peer Prediction Network
        </div>
        
        <h1 className="text-5xl font-extrabold text-slate-900 tracking-tight leading-tight">
          Forecast.<br/>
          Outsmart.<br/>
          <span className="text-blue-600">Settle.</span>
        </h1>
        
        <p className="text-base text-slate-500 font-medium max-w-xs mx-auto leading-relaxed">
          Test your intuition against real people. Lock your prediction in a smart escrow and win instant UGX when your forecast is correct.
        </p>

        {/* Hero CTA */}
        <div className="pt-4">
          <Link href="/feed" className="block">
            <button className="w-full bg-blue-600 text-white font-semibold text-lg py-4 rounded-xl hover:bg-blue-700 transition-colors">
              View Live Markets
            </button>
          </Link>
        </div>
      </div>

      {/* Value Propositions */}
      <div className="mt-16 space-y-3">
        <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider px-1 mb-3">Platform Features</h3>

        <div className="bg-white border border-slate-200 rounded-2xl p-5 flex gap-4 items-start">
          <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center shrink-0">
            <BrainCircuit size={20} className="text-blue-600" />
          </div>
          <div>
            <h4 className="font-semibold text-slate-900 text-sm">Pure Logic, No House</h4>
            <p className="text-sm text-slate-500 mt-1 leading-relaxed">
              We do not participate in the markets. You only predict against other users. The winner takes the committed pool (minus a 10% platform fee).
            </p>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-5 flex gap-4 items-start">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center shrink-0">
            <Wallet size={20} className="text-emerald-600" />
          </div>
          <div>
            <h4 className="font-semibold text-slate-900 text-sm">Instant Smart Escrow</h4>
            <p className="text-sm text-slate-500 mt-1 leading-relaxed">
              Funds are held securely. The moment a resolution is reached, the UGX is instantly settled into the winner's digital wallet.
            </p>
          </div>
        </div>
      </div>

      {/* How It Works Guide */}
      <div className="mt-12">
        <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider px-1 mb-4">How It Works</h3>

        <div className="bg-white border border-slate-200 rounded-2xl p-2">
          <div className="space-y-1">
            
            <div className="p-4 flex gap-4 items-center">
              <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-500 font-bold text-sm shrink-0 border border-slate-100">1</div>
              <div>
                <h4 className="font-semibold text-sm text-slate-900">Create a Forecast</h4>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">Pick a scenario, lock in your prediction, and commit your UGX to the smart escrow.</p>
              </div>
            </div>

            <div className="p-4 flex gap-4 items-center border-t border-slate-100">
              <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-500 font-bold text-sm shrink-0 border border-slate-100">2</div>
              <div>
                <h4 className="font-semibold text-sm text-slate-900">Wait for an Analyst</h4>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">Your market goes live. Another user matches your UGX and challenges your forecast.</p>
              </div>
            </div>

            <div className="p-4 flex gap-4 items-center border-t border-slate-100">
              <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-500 font-bold text-sm shrink-0 border border-slate-100">3</div>
              <div>
                <h4 className="font-semibold text-sm text-slate-900">Instant Settlement</h4>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">When the scenario resolves, the smart escrow automatically releases the pool to the correct predictor.</p>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* Security Reassurance */}
      <div className="mt-12 bg-blue-50 border border-blue-100 rounded-2xl p-6 text-center">
        <ShieldCheck size={24} className="mx-auto text-blue-600 mb-3" />
        <h4 className="font-semibold text-blue-900 text-sm">Cryptographically Proven</h4>
        <p className="text-xs text-blue-800/80 mt-2 leading-relaxed font-medium">
          Every prediction is sealed using SHA-256 hashing. Both parties receive an immutable receipt to guarantee the outcome was unaltered and 100% fair.
        </p>
      </div>

    </div>
  );
}
