"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X, Home, Wallet, LayoutGrid, PlusSquare, ShieldCheck, LayoutDashboard } from "lucide-react";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  const closeMenu = () => setIsOpen(false);

  return (
    <>
      {/* Sticky Top Navbar */}
      <nav className="sticky top-0 z-40 w-full bg-white/90 backdrop-blur-xl border-b border-gray-100 shadow-sm">
        <div className="max-w-md mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2" onClick={closeMenu}>
            <div className="w-8 h-8 bg-yellow-400 rounded-lg flex items-center justify-center shadow-sm">
              <span className="text-black font-black text-sm">P</span>
            </div>
            <span className="font-extrabold text-xl tracking-tight">
              <span className="text-yellow-500">Pawa</span>
              <span className="text-black">Pick</span>
            </span>
          </Link>

          <button 
            onClick={() => setIsOpen(true)}
            className="p-2 bg-white rounded-full border border-gray-200 text-black active:scale-95 transition hover:bg-yellow-50 hover:text-yellow-600 hover:border-yellow-200"
            aria-label="Open Menu"
          >
            <Menu size={20} />
          </button>
        </div>
      </nav>

      {/* Background Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 transition-opacity"
          onClick={closeMenu}
        />
      )}

      {/* Slide-out Hamburger Drawer */}
      <div 
        className={`fixed top-0 right-0 h-full w-64 max-w-[80vw] bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-in-out flex flex-col ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Drawer Header */}
        <div className="p-4 flex justify-between items-center border-b border-gray-100">
          <span className="font-black text-yellow-500 tracking-widest text-sm uppercase">
            Menu
          </span>
          <button 
            onClick={closeMenu}
            className="p-2 bg-gray-50 rounded-full border border-gray-200 text-black active:scale-95 transition hover:bg-yellow-50 hover:text-yellow-600 hover:border-yellow-200"
            aria-label="Close Menu"
          >
            <X size={20} />
          </button>
        </div>

        {/* Navigation Links */}
        <div className="flex-1 overflow-y-auto py-6 px-4 space-y-1">
          <Link href="/" onClick={closeMenu} className="flex items-center gap-4 px-4 py-4 rounded-2xl hover:bg-yellow-50 transition text-black font-bold group">
            <Home size={22} className="text-gray-400 group-hover:text-yellow-500 transition" />
            Home
          </Link>

          <Link href="/dashboard" onClick={closeMenu} className="flex items-center gap-4 px-4 py-4 rounded-2xl hover:bg-yellow-50 transition text-black font-bold group">
            <LayoutDashboard size={22} className="text-gray-400 group-hover:text-yellow-500 transition" />
            Dashboard
          </Link>

          <Link href="/wallet" onClick={closeMenu} className="flex items-center gap-4 px-4 py-4 rounded-2xl hover:bg-yellow-50 transition text-black font-bold group">
            <Wallet size={22} className="text-gray-400 group-hover:text-yellow-500 transition" />
            Wallet
          </Link>
          
          <Link href="/feed" onClick={closeMenu} className="flex items-center gap-4 px-4 py-4 rounded-2xl hover:bg-yellow-50 transition text-black font-bold group">
            <LayoutGrid size={22} className="text-gray-400 group-hover:text-yellow-500 transition" />
            Live Feed
          </Link>

          <Link href="/create" onClick={closeMenu} className="flex items-center gap-4 px-4 py-4 rounded-2xl hover:bg-yellow-50 transition text-black font-bold group">
            <PlusSquare size={22} className="text-gray-400 group-hover:text-yellow-500 transition" />
            Create Match
          </Link>

          <Link href="/verify" onClick={closeMenu} className="flex items-center gap-4 px-4 py-4 rounded-2xl hover:bg-yellow-50 transition text-black font-bold group">
            <ShieldCheck size={22} className="text-gray-400 group-hover:text-yellow-500 transition" />
            Verify
          </Link>
        </div>

        {/* Drawer Footer */}
        <div className="p-6 border-t border-gray-100 bg-gray-50/50">
          <div className="flex items-center justify-center gap-2 text-black">
            <ShieldCheck size={16} className="text-yellow-500" />
            <span className="text-[10px] font-bold uppercase tracking-widest">Secured by Escrow</span>
          </div>
        </div>
      </div>
    </>
  );
}
