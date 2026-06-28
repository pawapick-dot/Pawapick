// components/Navbar.tsx
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { 
  Menu, X, LayoutGrid, Plus, Wallet, ShieldCheck, 
  LayoutDashboard, ChevronDown, History as HistoryIcon, 
  Info, HelpCircle, Mail, FileText, Eye, EyeOff, ShieldAlert 
} from "lucide-react";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [showBalance, setShowBalance] = useState(false);
  const pathname = usePathname();
  
  const auth = useAuth() as any;
  const { user, openAuthModal } = auth;
  // Safely check for admin status
  const isAdmin = auth.isAdmin || user?.role === "admin";

  const closeMenu = () => setIsOpen(false);

  // Close mobile menu automatically on route change
  useEffect(() => {
    closeMenu();
  }, [pathname]);

  // Completely hide Navbar on the Admin side so the AdminLayout handles navigation
  if (pathname.startsWith("/admin")) return null;

  // Centralized Navigation Configuration (Admin link conditionally injected)
  const navLinks = [
    { href: "/feed", label: "Live Markets", icon: LayoutGrid, isProtected: false },
    { href: "/create", label: "Create Forecast", icon: Plus, isProtected: true },
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard, isProtected: true },
    { href: "/history", label: "Match Ledger", icon: HistoryIcon, isProtected: true },
    { href: "/wallet", label: "Wallet", icon: Wallet, isProtected: true },
    ...(isAdmin ? [{ href: "/admin", label: "Admin Console", icon: ShieldAlert, isProtected: true }] : []),
    { href: "/verify", label: "Trust Center", icon: ShieldCheck, isProtected: false },
    { href: "/how-to", label: "How to Play", icon: HelpCircle, isProtected: false },
    { href: "/about", label: "About Us", icon: Info, isProtected: false },
    { href: "/contact", label: "Contact", icon: Mail, isProtected: false },
    { href: "/policy", label: "Platform Policy", icon: FileText, isProtected: false },
  ];

  return (
    <>
      {/* Sticky Header Group wrapping both Navs */}
      <header className="sticky top-0 z-40 flex flex-col shadow-sm">

        {/* Main Top Navbar (Significantly Reduced Height: h-12) */}
        <nav className="w-full bg-white/95 backdrop-blur-md border-b border-slate-200">
          <div className="max-w-7xl mx-auto px-4 h-12 flex items-center justify-between">

            {/* LEFT: Hamburger (Mobile) + Logo */}
            <div className="flex items-center gap-3">
              <button 
                onClick={() => setIsOpen(true)}
                className="md:hidden p-1 -ml-1 text-slate-500 hover:text-slate-900 transition-colors rounded-lg"
                aria-label="Open Menu"
              >
                <Menu size={20} strokeWidth={2.5} />
              </button>

              <Link href="/" className="font-extrabold text-base md:text-lg tracking-tight" onClick={closeMenu}>
                <span className="text-slate-900">Pawa-</span>
                <span className="text-blue-600">Pick</span>
              </Link>

              {/* DESKTOP: Primary Links & Hover Dropdown */}
              <div className="hidden md:flex items-center gap-1 ml-4">
                <Link href="/feed" className={`px-2.5 py-1 text-xs md:text-sm font-semibold rounded-lg transition-colors ${pathname === "/feed" ? "text-blue-600 bg-blue-50" : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"}`}>
                  Markets
                </Link>

                {/* Protected Desktop Create Link */}
                {user ? (
                  <Link href="/create" className={`px-2.5 py-1 text-xs md:text-sm font-semibold rounded-lg transition-colors ${pathname === "/create" ? "text-blue-600 bg-blue-50" : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"}`}>
                    Create
                  </Link>
                ) : (
                  <button onClick={openAuthModal} className="px-2.5 py-1 text-xs md:text-sm font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-lg transition-colors">
                    Create
                  </button>
                )}

                {/* Hover Dropdown Menu for Info Links */}
                <div className="relative group">
                  <button className="flex items-center gap-1 px-2.5 py-1 text-xs md:text-sm font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-lg transition-colors">
                    Resources <ChevronDown size={14} className="text-slate-400 group-hover:rotate-180 transition-transform duration-200" />
                  </button>

                  {/* Dropdown Content */}
                  <div className="absolute left-0 top-full pt-1 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                    <div className="w-48 bg-white border border-slate-200 rounded-xl py-1.5 flex flex-col shadow-lg">
                      <Link href="/verify" className="flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-slate-600 hover:text-blue-600 hover:bg-blue-50 transition-colors">
                        <ShieldCheck size={14} /> Trust Center
                      </Link>
                      <Link href="/how-to" className="flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-slate-600 hover:text-blue-600 hover:bg-blue-50 transition-colors">
                        <HelpCircle size={14} /> How to Play
                      </Link>
                      <Link href="/about" className="flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-slate-600 hover:text-blue-600 hover:bg-blue-50 transition-colors">
                        <Info size={14} /> About Us
                      </Link>
                      <Link href="/contact" className="flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-slate-600 hover:text-blue-600 hover:bg-blue-50 transition-colors">
                        <Mail size={14} /> Contact
                      </Link>
                      <Link href="/policy" className="flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-slate-600 hover:text-blue-600 hover:bg-blue-50 transition-colors">
                        <FileText size={14} /> Policy
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
                  
                  {/* Desktop Admin Quick Link */}
                  {isAdmin && (
                    <Link 
                      href="/admin" 
                      className="hidden lg:flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 rounded-lg transition-colors mr-1 border border-rose-100"
                    >
                      <ShieldAlert size={14} />
                      Admin
                    </Link>
                  )}

                  <Link href="/history" className="hidden lg:flex px-2.5 py-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-lg transition-colors">
                    History
                  </Link>
                  <Link href="/wallet" className="hidden lg:flex px-2.5 py-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-lg transition-colors mr-2">
                    Wallet
                  </Link>
                  <Link 
                    href="/dashboard" 
                    className="flex items-center gap-1.5 bg-blue-600 text-white font-semibold text-xs px-3 py-1.5 rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
                  >
                    <LayoutDashboard size={14} />
                    <span className="hidden sm:inline">Dashboard</span>
                  </Link>
                </div>
              ) : (
                <button 
                  onClick={openAuthModal}
                  className="bg-slate-900 text-white font-semibold text-xs px-4 py-1.5 rounded-lg hover:bg-slate-800 transition-colors shadow-sm active:scale-95"
                >
                  Login
                </button>
              )}
            </div>

          </div>
        </nav>

        {/* Secondary Sub-Nav for Balance (Significantly Reduced Height: h-10) */}
        {user && (
          <div className="w-full bg-slate-50 border-b border-slate-200">
            <div className="max-w-7xl mx-auto px-4 h-10 flex items-center justify-between">

              {/* Left Side: Welcome Greeting */}
              <div className="flex items-center gap-2">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                <span className="text-[10px] md:text-xs font-bold text-slate-600 tracking-wide truncate max-w-[120px] md:max-w-xs">
                  Welcome, {user.displayName?.split(" ")[0] || "Player"}
                </span>
              </div>

              {/* Right Side: Wallet Balance Pill */}
              <div className="flex items-center bg-white border border-slate-200 rounded-full pl-2.5 pr-1 py-0.5 shadow-sm">
                <button 
                  onClick={() => setShowBalance(!showBalance)} 
                  className="text-slate-400 hover:text-slate-600 transition-colors mr-1.5 focus:outline-none"
                  title={showBalance ? "Hide Balance" : "Show Balance"}
                >
                  {showBalance ? <Eye size={14} /> : <EyeOff size={14} />}
                </button>
                <span className="text-xs md:text-sm font-extrabold text-slate-900 mr-2 tracking-tight">
                  {showBalance ? "UGX 0.00" : "UGX ****"}
                </span>
                <Link 
                  href="/wallet" 
                  className="bg-emerald-500 text-white p-1 rounded-full hover:bg-emerald-600 transition-colors shadow-sm flex items-center justify-center"
                  title="Deposit Funds"
                >
                  <Plus size={14} strokeWidth={3} />
                </Link>
              </div>

            </div>
          </div>
        )}
      </header>

      {/* Background Overlay for Mobile Drawer */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/20 backdrop-blur-sm z-50 transition-opacity md:hidden"
          onClick={closeMenu}
        />
      )}

      {/* Slide-out Hamburger Drawer (Mobile Only) */}
      <div 
        className={`fixed top-0 left-0 h-full w-64 bg-white z-50 transform transition-transform duration-300 ease-in-out flex flex-col border-r border-slate-200 md:hidden shadow-xl ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Drawer Header */}
        <div className="px-4 h-14 flex justify-between items-center border-b border-slate-100">
          <span className="font-extrabold text-lg tracking-tight">
            <span className="text-slate-900">Pawa-</span>
            <span className="text-blue-600">Pick</span>
          </span>
          <button 
            onClick={closeMenu}
            className="p-1.5 -mr-1.5 text-slate-400 hover:text-slate-900 hover:bg-slate-50 rounded-lg transition-colors"
            aria-label="Close Menu"
          >
            <X size={20} />
          </button>
        </div>

        {/* Navigation Links with Active Highlighting */}
        <div className="flex-1 overflow-y-auto py-4 px-3 space-y-1 hide-scrollbar">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href;

            // Render divider above Resources or Admin section for separation
            const showDivider = link.label === "Trust Center" || link.label === "Admin Console";

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
                      : link.label === "Admin Console"
                      ? "text-rose-600 hover:bg-rose-50"
                      : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                  }`}
                >
                  <Icon size={18} className={isActive ? "text-blue-600" : link.label === "Admin Console" ? "text-rose-500" : "text-slate-400"} />
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
