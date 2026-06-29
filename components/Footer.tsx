// components/Footer.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ShieldCheck, MapPin } from "lucide-react";

export default function Footer() {
  const pathname = usePathname();
  const currentYear = new Date().getFullYear();

  // Hide the footer entirely on Admin pages
  if (pathname.startsWith("/admin")) return null;

  return (
    <footer className="bg-white border-t border-slate-200 pt-12 pb-8 mt-auto z-10 relative">
      <div className="max-w-7xl mx-auto px-4">
        
        {/* Responsive Grid: 2 columns on mobile, Flex/Justify-between on desktop */}
        <div className="grid grid-cols-2 md:flex md:justify-between gap-10 md:gap-8">

          {/* Brand & Motto - Spans full width on mobile (col-span-2), auto width on desktop */}
          <div className="col-span-2 md:col-span-1 md:max-w-sm space-y-4">
            <Link href="/" className="font-extrabold text-2xl tracking-tight inline-block">
              <span className="text-slate-900">Pawa-</span>
              <span className="text-blue-600">Pick</span>
            </Link>
            <p className="text-slate-500 font-medium leading-relaxed text-sm">
              The provably fair prediction network where players compete directly. No house edge, instant payouts, and cryptographic transparency.
            </p>
            <div className="pt-2">
              <p className="text-sm font-bold text-slate-900 uppercase tracking-widest">
                Every game counts.
              </p>
            </div>
          </div>

          {/* Links - Platform */}
          <div>
            <h4 className="font-bold text-slate-900 mb-4">Platform</h4>
            <ul className="space-y-3">
              <li>
                <Link href="/feed" className="text-sm font-medium text-slate-500 hover:text-blue-600 transition-colors">
                  Live Markets
                </Link>
              </li>
              <li>
                <Link href="/create" className="text-sm font-medium text-slate-500 hover:text-blue-600 transition-colors">
                  Create Forecast
                </Link>
              </li>
              <li>
                <Link href="/history" className="text-sm font-medium text-slate-500 hover:text-blue-600 transition-colors">
                  Match Ledger
                </Link>
              </li>
              <li>
                <Link href="/verify" className="text-sm font-medium text-slate-500 hover:text-blue-600 transition-colors">
                  Trust Center
                </Link>
              </li>
            </ul>
          </div>

          {/* Links - Resources */}
          <div>
            <h4 className="font-bold text-slate-900 mb-4">Resources</h4>
            <ul className="space-y-3">
              <li>
                <Link href="/how-to" className="text-sm font-medium text-slate-500 hover:text-blue-600 transition-colors">
                  How to Play
                </Link>
              </li>
              <li>
                <Link href="/about" className="text-sm font-medium text-slate-500 hover:text-blue-600 transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-sm font-medium text-slate-500 hover:text-blue-600 transition-colors">
                  Contact
                </Link>
              </li>
              <li>
                <Link href="/policy" className="text-sm font-medium text-slate-500 hover:text-blue-600 transition-colors">
                  Platform Policy
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Divider */}
        <div className="w-full h-px bg-slate-100 my-8"></div>

        {/* Bottom Bar */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs font-medium text-slate-400 text-center md:text-left">
            &copy; {currentYear} Pawa Pick. All rights reserved.
          </p>

          <div className="flex items-center gap-6">
            <div className="flex items-center gap-1.5 text-slate-400">
              <MapPin size={14} />
              <span className="text-xs font-medium">Kabale, Uganda</span>
            </div>
            <div className="flex items-center gap-1.5 text-slate-400 bg-slate-50 px-2 py-1 rounded-md border border-slate-100">
              <ShieldCheck size={14} className="text-emerald-500" />
              <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">SHA-256 Secured</span>
            </div>
          </div>
        </div>

      </div>
    </footer>
  );
}
