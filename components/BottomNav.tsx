// components/BottomNav.tsx
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { Radio, History as HistoryIcon, Plus, User, Wallet } from "lucide-react";

export default function BottomNav() {
  const pathname = usePathname();
  const { user, openAuthModal } = useAuth();
  const [liveCount, setLiveCount] = useState<number>(0);

  // Fetch the active live challenges count
  useEffect(() => {
    fetch("/api/games/feed")
      .then((res) => res.json())
      .then((data) => {
        if (data.games) {
          setLiveCount(data.games.length);
        }
      })
      .catch(() => setLiveCount(0));
  }, []);

  // Hide the bottom nav on immersive game screens and live markets
  if (pathname.startsWith("/play/") || pathname.startsWith("/games/")) return null;

  // Intercept clicks for protected routes
  const handleProtectedClick = (e: React.MouseEvent, href: string) => {
    if (!user) {
      e.preventDefault();
      openAuthModal();
    }
  };

  const navItems = [
    { name: `Live (${liveCount})`, href: "/feed", icon: Radio, protected: false },
    { name: "History", href: "/history", icon: HistoryIcon, protected: true },
    // Center item (Create) is handled separately
    { name: "Wallet", href: "/wallet", icon: Wallet, protected: true },
    { name: "Profile", href: "/dashboard", icon: User, protected: true },
  ];

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 w-full bg-white/95 backdrop-blur-md border-t border-slate-200 z-40 pb-safe shadow-[0_-4px_20px_rgba(0,0,0,0.03)]">
      <div className="flex justify-around items-end h-16 pb-2 px-1">
        
        {/* Left Side Items */}
        {navItems.slice(0, 2).map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              onClick={(e) => item.protected && handleProtectedClick(e, item.href)}
              className={`flex flex-col items-center justify-end w-16 h-full transition-colors ${
                isActive ? "text-blue-600" : "text-slate-400 hover:text-slate-900"
              }`}
            >
              <Icon size={20} strokeWidth={isActive ? 2.5 : 2} className="mb-1" />
              <span className="text-[10px] font-bold whitespace-nowrap">{item.name}</span>
            </Link>
          );
        })}

        {/* Center Floating Action Button (Create) - Pushed down & scaled slightly */}
        <Link
          href="/create"
          onClick={(e) => handleProtectedClick(e, "/create")}
          className="flex flex-col items-center justify-end group relative -top-1"
        >
          <div className="w-11 h-11 bg-blue-600 rounded-full flex items-center justify-center text-white shadow-[0_4px_15px_rgba(37,99,235,0.4)] mb-1 group-active:scale-95 transition-transform border-[3px] border-white">
            <Plus size={22} strokeWidth={3} />
          </div>
          <span className={`text-[10px] font-bold ${pathname === "/create" ? "text-blue-600" : "text-slate-600"}`}>
            Create
          </span>
        </Link>

        {/* Right Side Items */}
        {navItems.slice(2, 4).map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              onClick={(e) => item.protected && handleProtectedClick(e, item.href)}
              className={`flex flex-col items-center justify-end w-16 h-full transition-colors ${
                isActive ? "text-blue-600" : "text-slate-400 hover:text-slate-900"
              }`}
            >
              <Icon size={20} strokeWidth={isActive ? 2.5 : 2} className="mb-1" />
              <span className="text-[10px] font-bold whitespace-nowrap">{item.name}</span>
            </Link>
          );
        })}

      </div>
    </div>
  );
}
