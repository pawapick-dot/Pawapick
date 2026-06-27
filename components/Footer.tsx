// components/Footer.tsx
import Link from "next/link";
import { Shield } from "lucide-react";

export default function Footer() {
  return (
    <footer className="w-full bg-white border-t border-gray-100 mt-auto">
      <div className="max-w-md mx-auto px-6 py-8 flex flex-col items-center text-center space-y-4">
        
        <div className="flex items-center gap-2 text-gray-400">
          <Shield size={16} />
          <span className="text-[10px] font-bold uppercase tracking-widest">SHA-256 Provably Fair</span>
        </div>

        <div className="flex gap-4 text-sm font-semibold text-gray-500">
          <Link href="/dashboard" className="hover:text-gray-900 transition">Wallet</Link>
          <Link href="/feed" className="hover:text-gray-900 transition">Feed</Link>
          <Link href="/create" className="hover:text-gray-900 transition">Create</Link>
        </div>

        <p className="text-[11px] text-gray-400 font-medium pt-2">
          © 2026 Pawa Pick. No house edge against players.
        </p>
      </div>
    </footer>
  );
}
