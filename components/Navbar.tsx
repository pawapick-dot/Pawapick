// components/Navbar.tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X, Home, LayoutDashboard, PlusSquare, ShieldCheck } from "lucide-react";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  const closeMenu = () => setIsOpen(false);

  return (
    <>
      {/* Sticky Top Navbar */}
      <nav className="sticky top-0 z-40 w-full bg-white/80 backdrop-blur-xl border-b border-gray-100 shadow-sm">
        <div className="max-w-md mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2" onClick={closeMenu}>
            <div className="w-8 h-8 bg-gray-900 rounded-lg flex items-center justify-center">
              <span className="text-white font-black text-sm">P</span>
            </div>
            <span className="font-extrabold text-lg tracking-tight">Pawa Pick</span>
          </Link>

          <button 
            onClick={() => setIsOpen(true)}
            className="p-2 bg-gray-50 rounded-full border border-gray-200 text-gray-700 active:scale-95 transition"
          >
            <Menu size={20} />
          </button>
        </div>
      </nav>

      {/* Background Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm z-50 transition-opacity"
          onClick={closeMenu}
        />
      )}

      {/* Slide-out Hamburger Drawer */}
      <div 
        className={`fixed top-0 right-0 h-full w-3/4 max-w-sm bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-in-out flex flex-col ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="p-4 flex justify-end border-b border-gray-100">
          <button 
            onClick={closeMenu}
            className="p-2 bg-gray-50 rounded-full border border-gray-200 text-gray-700 active:scale-95 transition"
          >
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto py-6 px-4 space-y-2">
          <span className="text-xs font-bold text-gray-400 uppercase tracking-widest px-2 mb-2 block">Menu</span>
          
          <Link href="/" onClick={closeMenu} className="flex items-center gap-4 px-4 py-4 rounded-2xl hover:bg-gray-50 transition text-gray-900 font-bold">
            <Home size={22} className="text-gray-400" />
            Home
          </Link>
          
          <Link href="/dashboard" onClick={closeMenu} className="flex items-center gap-4 px-4 py-4 rounded-2xl hover:bg-gray-50 transition text-gray-900 font-bold">
            <LayoutDashboard size={22} className="text-gray-400" />
            Live Feed
          </Link>

          <Link href="/create" onClick={closeMenu} className="flex items-center gap-4 px-4 py-4 rounded-2xl hover:bg-gray-50 transition text-gray-900 font-bold">
            <PlusSquare size={22} className="text-gray-400" />
            Create Challenge
          </Link>

          <Link href="/verify" onClick={closeMenu} className="flex items-center gap-4 px-4 py-4 rounded-2xl hover:bg-gray-50 transition text-gray-900 font-bold">
            <ShieldCheck size={22} className="text-gray-400" />
            Trust Center
          </Link>
        </div>

        <div className="p-6 border-t border-gray-100">
          <p className="text-xs text-gray-400 font-medium text-center">
            Pawa Pick V1 - MVP Mode
          </p>
        </div>
      </div>
    </>
  );
}
