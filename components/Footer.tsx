// components/Footer.tsx
import Link from "next/link";
import { Shield } from "lucide-react";

export default function Footer() {
  return (
    <footer className="w-full bg-white border-t border-gray-200 mt-auto">
      <div className="max-w-md mx-auto px-6 py-8 flex flex-col items-center text-center space-y-4">
        
        <div className="flex items-center gap-2 text-gray-400">
          <Shield size={16} />
          <span className="text-xs font-bold uppercase tracking-wider">Secured by SHA-256</span>
        </div>

        <div className="flex gap-4 text-sm font-semibold text-gray-500">
          <Link href="/dashboard" className="hover:text-gray-900 transition">Feed</Link>
          <Link href="/create" className="hover:text-gray-900 transition">Create</Link>
          <span className="text-gray-300">|</span>
          <Link href="#" className="hover:text-gray-900 transition">Terms</Link>
        </div>

        <p className="text-xs text-gray-400 font-medium pt-2">
          © 2026 Pawa Pick. No house edge.
        </p>
      </div>
    </footer>
  );
}
