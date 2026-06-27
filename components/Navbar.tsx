// components/Navbar.tsx
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { 
  Menu, X, LayoutGrid, Plus, Wallet, ShieldCheck, 
  LayoutDashboard, ChevronDown, History as HistoryIcon, 
  Info, HelpCircle, Mail, FileText 
} from "lucide-react";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  const { user, openAuthModal } = useAuth();

  const closeMenu = () => setIsOpen(false);

  // Close mobile menu automatically on route change
  useEffect(() => {
    closeMenu();
  }, [pathname]);

  // Centralized Navigation Configuration
  const navLinks = [
    { href: "/feed", label: "Live Markets", icon: LayoutGrid, isProtected: false },
    { href: "/create", label: "Create Forecast", icon: Plus, isProtected: true },
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard, isProtected: true },
    { href: "/history", label: "Match Ledger", icon: HistoryIcon, isProtected: true },
    { href: "/wallet", label: "Wallet", icon: Wallet, isProtected: true },
    { href: "/verify", label: "Trust Center", icon: ShieldCheck, isProtected: false },
    { href: "/how-to", label: "How to Play", icon: HelpCircle, isProtected: false },
    { href: "/about", label: "About Us", icon: Info, isProtected: false },
    { href: "/contact", label: "Contact", icon: Mail, isProtected: false },
    { href: "/policy", label: "Platform Policy", icon: FileText, isProtected: false },
  ];

  return (
    <>
      {/* Sticky Top Navbar */}
      <nav className="sticky top-0 z-40 w-full bg-white/90 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">

          {/* LEFT: Hamburger (Mobile) + Logo */}
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsOpen(true)}
              className="md:hidden p-2 -ml-2 text-slate-500 hover:text-slate-900 transition-colors rounded-lg"
              aria-label="Open Menu"
            >
              <Menu size={24} strokeWidth={2.5} />
            </button>

            <Link href="/" className="font-extrabold text-xl tracking-tight" onClick={closeMenu}>
              <span className="text-slate-900">Pawa-</span>
              <span className="text-blue-600">Pick</span>
            </Link>

            {/* DESKTOP: Primary Links & Hover Dropdown */}
            <div className="hidden md:flex items-center gap-1 ml-6">
              <Link href="/feed" className={`px-4 py-2 text-sm font-semibold rounded-lg transition-colors ${pathname === "/feed" ? "text-blue-600 bg-blue-50" : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"}`}>
                Markets
              </Link>
              
              {/* Protected Desktop Create Link */}
              {user ? (
                <Link href="/create" className={`px-4 py-2 text-sm font-semibold rounded-lg transition-colors ${pathname === "/create" ? "text-blue-600 bg-blue-50" : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"}`}>
                  Create
                </Link>
              ) : (
                <button onClick={openAuthModal} className="px-4 py-2 text-sm font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-lg transition-colors">
                  Create
                </button>
              )}

              {/* Hover Dropdown Menu for Info Links */}
              <div className="relative group">
                <button className="flex items-center gap-1 px-4 py-2 text-sm font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-lg transition-colors">
                  Resources <ChevronDown size={14} className="text-slate-400 group-hover:rotate-180 transition-transform duration-200" />
                </button>

                {/* Dropdown Content */}
                <div className="absolute left-0 top-full pt-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                  <div className="w-48 bg-white border border-slate-200 rounded-xl py-2 flex flex-col shadow-lg">
                    <Link href="/verify" className="flex items-center gap-3 px-4 py-2.5 text-sm font-semibold text-slate-600 hover:text-blue-600 hover:bg-blue-50 transition-colors">
                      <ShieldCheck size={16} /> Trust Center
                    </Link>
                    <Link href="/how-to" className="flex items-center gap-3 px-4 py-2.5 text-sm font-semibold text-slate-600 hover:text-blue-600 hover:bg-blue-50 transition-colors">
                      <HelpCircle size={16} /> How to Play
                    </Link>
                    <Link href="/about" className="flex items-center gap-3 px-4 py-2.5 text-sm font-semibold text-slate-600 hover:text-blue-600 hover:bg-blue-50 transition-colors">
                      <Info size={16} /> About Us
                    </Link>
                    <Link href="/contact" className="flex items-center gap-3 px-4 py-2.5 text-sm font-semibold text-slate-600 hover:text-blue-600 hover:bg-blue-50 transition-colors">
                      <Mail size={16} /> Contact
                    </Link>
                    <Link href="/policy" className="flex items-center gap-3 px-4 py-2.5 text-sm font-semibold text-slate-600 hover:text-blue-600 hover:bg-blue-50 transition-colors">
                      <FileText size={16} /> Policy
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT: Login / Protected Actions */}
          <div>
            {user ? (
              <div className="flex items-center gap-1">
                <Link href="/history" className="hidden lg:flex px-3 py-2 text-sm font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-lg transition-colors">
                  History
                </Link>
                <Link href="/wallet" className="hidden lg:flex px-3 py-2 text-sm font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-lg transition-colors mr-2">
                  Wallet
                </Link>
                <Link 
                  href="/dashboard" 
                  className="flex items-center gap-2 bg-blue-600 text-white font-semibold text-sm px-5 py-2.5 rounded-xl hover:bg-blue-700 transition-colors shadow-sm"
                >
                  <LayoutDashboard size={18} />
                  <span className="hidden sm:inline">Dashboard</span>
                </Link>
              </div>
            ) : (
              <button 
                onClick={openAuthModal}
                className="bg-slate-900 text-white font-semibold text-sm px-6 py-2.5 rounded-xl hover:bg-slate-800 transition-colors shadow-sm active:scale-95"
              >
                Login
              </button>
            )}
          </div>

        </div>
      </nav>

      {/* Background Overlay for Mobile Drawer */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/20 backdrop-blur-sm z-50 transition-opacity md:hidden"
          onClick={closeMenu}
        />
      )}

      {/* Slide-out Hamburger Drawer (Mobile Only) - Reduced width to w-64 for cleaner spacing */}
      <div 
        className={`fixed top-0 left-0 h-full w-64 bg-white z-50 transform transition-transform duration-300 ease-in-out flex flex-col border-r border-slate-200 md:hidden shadow-xl ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Drawer Header */}
        <div className="px-4 h-16 flex justify-between items-center border-b border-slate-100">
          <span className="font-extrabold text-lg tracking-tight">
            <span className="text-slate-900">Pawa-</span>
            <span className="text-blue-600">Pick</span>
          </span>
          <button 
            onClick={closeMenu}
            className="p-2 -mr-2 text-slate-400 hover:text-slate-900 hover:bg-slate-50 rounded-lg transition-colors"
            aria-label="Close Menu"
          >
            <X size={20} />
          </button>
        </div>

        {/* Navigation Links with Active Highlighting */}
        <div className="flex-1 overflow-y-auto py-4 px-3 space-y-1 hide-scrollbar">
          {navLinks.map((link, index) => {
            const Icon = link.icon;
            const isActive = pathname === link.href;
            
            // Render divider above Resources
            const showDivider = link.label === "Trust Center";

            // If route is protected and user is not logged in, trigger Modal
            if (link.isProtected && !user) {
              return (
                <div key={link.href}>
                  {showDivider && <div className="h-px bg-slate-100 my-3 mx-2"></div>}
                  <button 
                    onClick={() => { openAuthModal(); closeMenu(); }}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors text-slate-600 hover:bg-slate-50 hover:text-slate-900 font-semibold"
                  >
                    <Icon size={18} className="text-slate-400" />
                    {link.label}
                  </button>
                </div>
              );
            }

            // Normal Navigation Link (With Active State Highlighting)
            return (
              <div key={link.href}>
                {showDivider && <div className="h-px bg-slate-100 my-3 mx-2"></div>}
                <Link 
                  href={link.href} 
                  onClick={closeMenu} 
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors font-semibold ${
                    isActive 
                      ? "bg-blue-50 text-blue-600" 
                      : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                  }`}
                >
                  <Icon size={18} className={isActive ? "text-blue-600" : "text-slate-400"} />
                  {link.label}
                </Link>
              </div>
            );
          })}
        </div>

        {/* Drawer Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200">
          <div className="flex items-center justify-center gap-2 text-slate-500">
            <ShieldCheck size={16} className="text-emerald-500" />
            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Secured by Escrow</span>
          </div>
        </div>
      </div>
    </>
  );
}
