// components/Navbar.tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { Menu, X, LayoutGrid, Plus, Wallet, ShieldCheck, LayoutDashboard, ChevronDown } from "lucide-react";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const { user, openAuthModal } = useAuth();

  const closeMenu = () => setIsOpen(false);

  return (
    <>
      {/* Sticky Top Navbar */}
      <nav className="sticky top-0 z-40 w-full bg-white/90 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          
          {/* LEFT: Hamburger (Mobile) + Logo */}
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsOpen(true)}
              className="md:hidden p-2 text-slate-500 hover:text-slate-900 transition-colors rounded-lg"
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
              <Link href="/feed" className="px-4 py-2 text-sm font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-lg transition-colors">
                Markets
              </Link>
              <Link href="/create" className="px-4 py-2 text-sm font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-lg transition-colors">
                Create
              </Link>

              {/* Hover Dropdown Menu */}
              <div className="relative group">
                <button className="flex items-center gap-1 px-4 py-2 text-sm font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-lg transition-colors">
                  More <ChevronDown size={14} className="text-slate-400 group-hover:rotate-180 transition-transform duration-200" />
                </button>
                
                {/* Dropdown Content */}
                <div className="absolute left-0 top-full pt-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                  <div className="w-48 bg-white border border-slate-200 rounded-xl py-2 flex flex-col shadow-lg">
                    <Link href="/wallet" className="flex items-center gap-3 px-4 py-2.5 text-sm font-semibold text-slate-600 hover:text-blue-600 hover:bg-blue-50 transition-colors">
                      <Wallet size={16} /> Wallet
                    </Link>
                    <Link href="/verify" className="flex items-center gap-3 px-4 py-2.5 text-sm font-semibold text-slate-600 hover:text-blue-600 hover:bg-blue-50 transition-colors">
                      <ShieldCheck size={16} /> Trust Center
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT: Login / Dashboard */}
          <div>
            {user ? (
              <Link 
                href="/dashboard" 
                className="flex items-center gap-2 bg-blue-600 text-white font-semibold text-sm px-5 py-2.5 rounded-xl hover:bg-blue-700 transition-colors"
              >
                <LayoutDashboard size={18} />
                <span className="hidden sm:inline">Dashboard</span>
              </Link>
            ) : (
              <button 
                onClick={openAuthModal}
                className="bg-slate-900 text-white font-semibold text-sm px-6 py-2.5 rounded-xl hover:bg-slate-800 transition-colors"
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

      {/* Slide-out Hamburger Drawer (Mobile Only) */}
      <div 
        className={`fixed top-0 left-0 h-full w-72 bg-white z-50 transform transition-transform duration-300 ease-in-out flex flex-col border-r border-slate-200 md:hidden ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Drawer Header */}
        <div className="p-4 h-16 flex justify-between items-center border-b border-slate-100">
          <span className="font-extrabold text-lg tracking-tight">
            <span className="text-slate-900">Pawa-</span>
            <span className="text-blue-600">Pick</span>
          </span>
          <button 
            onClick={closeMenu}
            className="p-2 text-slate-400 hover:text-slate-900 hover:bg-slate-50 rounded-lg transition-colors"
            aria-label="Close Menu"
          >
            <X size={20} />
          </button>
        </div>

        {/* Navigation Links */}
        <div className="flex-1 overflow-y-auto py-6 px-4 space-y-2">
          <Link href="/feed" onClick={closeMenu} className="flex items-center gap-4 px-4 py-3.5 rounded-xl hover:bg-slate-50 transition-colors text-slate-700 font-semibold group">
            <LayoutGrid size={20} className="text-slate-400 group-hover:text-blue-600 transition-colors" />
            Live Markets
          </Link>

          <Link href="/create" onClick={closeMenu} className="flex items-center gap-4 px-4 py-3.5 rounded-xl hover:bg-slate-50 transition-colors text-slate-700 font-semibold group">
            <Plus size={20} className="text-slate-400 group-hover:text-blue-600 transition-colors" />
            Create Forecast
          </Link>

          <div className="h-px bg-slate-100 my-2"></div>

          <Link href="/wallet" onClick={closeMenu} className="flex items-center gap-4 px-4 py-3.5 rounded-xl hover:bg-slate-50 transition-colors text-slate-700 font-semibold group">
            <Wallet size={20} className="text-slate-400 group-hover:text-blue-600 transition-colors" />
            Wallet
          </Link>
          
          <Link href="/verify" onClick={closeMenu} className="flex items-center gap-4 px-4 py-3.5 rounded-xl hover:bg-slate-50 transition-colors text-slate-700 font-semibold group">
            <ShieldCheck size={20} className="text-slate-400 group-hover:text-blue-600 transition-colors" />
            Trust Center
          </Link>
        </div>

        {/* Drawer Footer */}
        <div className="p-6 bg-slate-50 border-t border-slate-200">
          <div className="flex items-center justify-center gap-2 text-slate-500">
            <ShieldCheck size={16} className="text-emerald-500" />
            <span className="text-[11px] font-semibold uppercase tracking-widest">Secured by Escrow</span>
          </div>
        </div>
      </div>
    </>
  );
}
