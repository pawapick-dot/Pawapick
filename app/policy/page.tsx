// app/policy/page.tsx
import Link from "next/link";
import { ArrowLeft, FileText } from "lucide-react";

export default function PolicyPage() {
  return (
    <div className="w-full min-h-screen bg-slate-50 pb-20">
      <div className="max-w-3xl mx-auto px-4 py-6">
        <Link href="/" className="inline-flex items-center gap-1.5 text-slate-500 hover:text-slate-900 transition-colors font-semibold text-sm bg-white border border-slate-200 px-3 py-2 rounded-lg shadow-sm">
          <ArrowLeft size={16} /> Back
        </Link>
      </div>

      <div className="max-w-3xl mx-auto px-4 mt-4">
        <div className="flex items-center gap-3 mb-6">
          <FileText size={28} className="text-slate-900" />
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Platform Policies</h1>
        </div>
        
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm divide-y divide-slate-100 overflow-hidden">
          
          <div className="p-6 md:p-8">
            <h2 className="text-lg font-bold text-slate-900 mb-3">1. Smart Escrow & Fees</h2>
            <p className="text-sm text-slate-600 font-medium leading-relaxed">
              When a challenge is created or accepted, funds are immediately deducted from your wallet and held in a secure escrow. Upon resolution, the winner receives the total pool minus a standard 10% platform maintenance fee. Abandoned open challenges can be canceled, returning the original stake to the creator.
            </p>
          </div>

          <div className="p-6 md:p-8">
            <h2 className="text-lg font-bold text-slate-900 mb-3">2. Cryptographic Fairness</h2>
            <p className="text-sm text-slate-600 font-medium leading-relaxed">
              Pawa Pick operates on a provably fair system. We use SHA-256 hashing combined with unique server salts to lock predictions. Users agree that the cryptographic receipt generated post-match is the final, undisputed record of the game's outcome.
            </p>
          </div>

          <div className="p-6 md:p-8">
            <h2 className="text-lg font-bold text-slate-900 mb-3">3. Withdrawals & Mobile Money</h2>
            <p className="text-sm text-slate-600 font-medium leading-relaxed">
              All transactions are settled in UGX. Withdrawals are processed through connected local mobile money networks. Users are responsible for ensuring the phone numbers linked to their accounts are accurate and capable of receiving digital funds.
            </p>
          </div>

          <div className="p-6 md:p-8">
            <h2 className="text-lg font-bold text-slate-900 mb-3">4. Account Security</h2>
            <p className="text-sm text-slate-600 font-medium leading-relaxed">
              Your account security is your responsibility. Pawa Pick will never ask for your password or OTP outside of the secure login portal. Fraudulent chargebacks or exploiting system glitches will result in immediate account termination.
            </p>
          </div>

        </div>
      </div>
    </div>
  );
}
