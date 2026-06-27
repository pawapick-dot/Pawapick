// app/about/page.tsx
import Link from "next/link";
import { ArrowLeft, ShieldCheck, Users, Zap } from "lucide-react";

export default function AboutPage() {
  return (
    <div className="w-full min-h-screen bg-slate-50 pb-20">
      {/* Header */}
      <div className="max-w-3xl mx-auto px-4 py-6">
        <Link href="/" className="inline-flex items-center gap-1.5 text-slate-500 hover:text-slate-900 transition-colors font-semibold text-sm bg-white border border-slate-200 px-3 py-2 rounded-lg shadow-sm">
          <ArrowLeft size={16} /> Back
        </Link>
      </div>

      {/* Hero */}
      <div className="max-w-3xl mx-auto px-4 mt-4 mb-12 text-center">
        <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight mb-4">
          Prediction markets,<br />
          <span className="text-blue-600">reimagined for fairness.</span>
        </h1>
        <p className="text-slate-500 text-lg font-medium max-w-xl mx-auto leading-relaxed">
          Pawa Pick was built with a single goal: to remove the "house" from the equation and let players compete directly with absolute transparency.
        </p>
      </div>

      {/* Core Values */}
      <div className="max-w-3xl mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
          <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center mb-4">
            <Users size={24} />
          </div>
          <h3 className="text-lg font-bold text-slate-900 mb-2">Peer-to-Peer</h3>
          <p className="text-sm text-slate-500 font-medium leading-relaxed">
            You are never playing against a rigged algorithm. Every match is against a real human challenger.
          </p>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
          <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center mb-4">
            <ShieldCheck size={24} />
          </div>
          <h3 className="text-lg font-bold text-slate-900 mb-2">Provably Fair</h3>
          <p className="text-sm text-slate-500 font-medium leading-relaxed">
            Choices are cryptographically locked using SHA-256 before the match begins, ensuring zero manipulation.
          </p>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
          <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center mb-4">
            <Zap size={24} />
          </div>
          <h3 className="text-lg font-bold text-slate-900 mb-2">Instant Settlement</h3>
          <p className="text-sm text-slate-500 font-medium leading-relaxed">
            Smart escrows automatically route UGX to the winner's wallet the exact second the match resolves.
          </p>
        </div>
      </div>
    </div>
  );
}
