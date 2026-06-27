// app/how-to/page.tsx
import Link from "next/link";
import { ArrowLeft, Plus, Target, CheckCircle2, ShieldCheck } from "lucide-react";

export default function HowToPage() {
  return (
    <div className="w-full min-h-screen bg-slate-50 pb-20">
      <div className="max-w-3xl mx-auto px-4 py-6">
        <Link href="/" className="inline-flex items-center gap-1.5 text-slate-500 hover:text-slate-900 transition-colors font-semibold text-sm bg-white border border-slate-200 px-3 py-2 rounded-lg shadow-sm">
          <ArrowLeft size={16} /> Back
        </Link>
      </div>

      <div className="max-w-2xl mx-auto px-4 mt-4">
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight mb-2">How to Play</h1>
        <p className="text-slate-500 font-medium mb-10">Master the platform in four simple steps.</p>

        <div className="space-y-6">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex gap-6">
            <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center shrink-0 font-black text-xl">1</div>
            <div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">Fund Your Wallet</h3>
              <p className="text-sm text-slate-600 font-medium leading-relaxed">
                Top up your Pawa Pick wallet using your local mobile money network. Funds are securely held and ready for instant staking.
              </p>
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex gap-6">
            <div className="w-12 h-12 bg-slate-100 text-slate-600 rounded-full flex items-center justify-center shrink-0 font-black text-xl">2</div>
            <div>
              <h3 className="text-lg font-bold text-slate-900 mb-2 flex items-center gap-2">Create a Challenge <Plus size={18} className="text-slate-400"/></h3>
              <p className="text-sm text-slate-600 font-medium leading-relaxed">
                Choose a game (like Penalty Shootout), set your UGX stake, and lock in your secret choice. Your choice is instantly encrypted.
              </p>
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex gap-6">
            <div className="w-12 h-12 bg-slate-100 text-slate-600 rounded-full flex items-center justify-center shrink-0 font-black text-xl">3</div>
            <div>
              <h3 className="text-lg font-bold text-slate-900 mb-2 flex items-center gap-2">Accept a Match <Target size={18} className="text-slate-400"/></h3>
              <p className="text-sm text-slate-600 font-medium leading-relaxed">
                Browse the Live Feed to find open challenges. Match the creator's stake and attempt to outsmart their hidden choice.
              </p>
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex gap-6">
            <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center shrink-0 font-black text-xl">
              <CheckCircle2 size={24} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900 mb-2 flex items-center gap-2">Instant Payout & Verification <ShieldCheck size={18} className="text-emerald-500"/></h3>
              <p className="text-sm text-slate-600 font-medium leading-relaxed">
                The winner receives the pooled UGX automatically. You can then view the immutable cryptographic receipt to verify the match was 100% fair.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
