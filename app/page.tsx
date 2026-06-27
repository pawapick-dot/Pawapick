// app/page.tsx
import Link from "next/link";

export default function Home() {
  return (
    <div className="max-w-md mx-auto space-y-8 mt-12 pb-12 px-2">
      
      {/* Hero Section */}
      <div className="text-center space-y-4">
        <span className="text-xs font-mono font-bold bg-gray-900 text-white px-3 py-1 rounded-full uppercase tracking-widest">
          Pawa Pick V1
        </span>
        <h1 className="text-5xl font-extrabold tracking-tight text-gray-900 leading-tight">
          Set the Trap. <br />
          <span className="text-gray-400">Take the Pick.</span>
        </h1>
        <p className="text-gray-500 text-lg font-medium px-4">
          The fastest 1v1 asynchronous betting network in East Africa. No house edge against players, just pure peer-to-peer escrow.
        </p>
      </div>

      {/* Primary Call to Action */}
      <div className="pt-4 px-2">
        <Link href="/dashboard" className="block">
          <button className="w-full bg-gray-900 text-white font-bold text-lg py-5 rounded-2xl shadow-lg hover:bg-gray-800 transition active:scale-[0.98]">
            Enter the Arena →
          </button>
        </Link>
      </div>

      {/* How It Works (Bento Style) */}
      <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm space-y-6 mt-8">
        <h3 className="text-center font-bold text-gray-900 uppercase tracking-wider text-sm mb-2">
          How it Works
        </h3>
        
        <div className="flex gap-4 items-start">
          <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center font-bold text-sm shrink-0">1</div>
          <div>
            <h4 className="font-bold text-gray-900">Lock the Escrow</h4>
            <p className="text-sm text-gray-500 mt-1">Player A hides a choice (like a coin under a cup) and stakes UGX.</p>
          </div>
        </div>

        <div className="flex gap-4 items-start">
          <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center font-bold text-sm shrink-0">2</div>
          <div>
            <h4 className="font-bold text-gray-900">Accept the Challenge</h4>
            <p className="text-sm text-gray-500 mt-1">Player B finds the game on the live feed, matches the stake, and guesses.</p>
          </div>
        </div>

        <div className="flex gap-4 items-start">
          <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center font-bold text-sm shrink-0">3</div>
          <div>
            <h4 className="font-bold text-gray-900">Provably Fair Payout</h4>
            <p className="text-sm text-gray-500 mt-1">The smart contract resolves the math, pays the winner instantly, and generates a cryptographic receipt.</p>
          </div>
        </div>
      </div>

      {/* Trust Badge */}
      <div className="text-center pt-6">
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
          Secured by SHA-256 Cryptography
        </p>
      </div>

    </div>
  );
}
