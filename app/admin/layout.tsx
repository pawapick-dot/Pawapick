// app/admin/layout.tsx
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { 
  LayoutDashboard, Users, Swords, ArrowRightLeft, 
  Banknote, ShieldCheck, LifeBuoy, Settings, Menu, X, LogOut
} from "lucide-react";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { user, loading, logout } = useAuth();
  const [isChecking, setIsChecking] = useState(true);

  // Silently redirect unauthorized users before rendering anything
  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.replace("/"); // replace() ensures they can't use the back button to return here
      } else {
        setIsChecking(false);
      }
    }
  }, [user, loading, router]);

  // Return a completely blank screen while checking to prevent UI flashes
  if (loading || isChecking) {
    return <div className="min-h-screen bg-slate-50"></div>;
  }

  const navLinks = [
    { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
    { href: "/admin/users", label: "Users", icon: Users },
    { href: "/admin/games", label: "Challenges", icon: Swords },
    { href: "/admin/transactions", label: "Transactions", icon: ArrowRightLeft },
    { href: "/admin/withdrawals", label: "Withdrawals", icon: Banknote },
    { href: "/admin/verification", label: "Verification", icon: ShieldCheck },
    { href: "/admin/support", label: "Support", icon: LifeBuoy },
    { href: "/admin/settings", label: "Settings", icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/20 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`fixed lg:sticky top-0 left-0 h-screen w-64 bg-slate-900 text-white flex flex-col z-50 transition-transform duration-300 ${isSidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}`}>
        <div className="h-16 flex items-center justify-between px-6 border-b border-slate-800">
          <Link href="/admin" className="font-extrabold text-xl tracking-tight">
            Pawa<span className="text-blue-500">Admin</span>
          </Link>
          <button onClick={() => setIsSidebarOpen(false)} className="lg:hidden text-slate-400 hover:text-white">
            <X size={20} />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto py-6 px-4 space-y-1 hide-scrollbar">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = link.href === "/admin" ? pathname === "/admin" : pathname.startsWith(link.href);

            return (
              <Link 
                key={link.href}
                href={link.href}
                onClick={() => setIsSidebarOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl font-semibold transition-colors ${isActive ? "bg-blue-600 text-white" : "text-slate-400 hover:bg-slate-800 hover:text-slate-200"}`}
              >
                <Icon size={18} className={isActive ? "text-white" : "text-slate-500"} />
                {link.label}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-slate-800">
          <button onClick={() => { if(logout) logout(); router.push('/'); }} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl font-semibold text-rose-400 hover:bg-rose-500/10 transition-colors">
            <LogOut size={18} /> Exit Admin
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        {/* Mobile Header */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center px-4 lg:hidden shrink-0">
          <button onClick={() => setIsSidebarOpen(true)} className="p-2 -ml-2 text-slate-500 hover:text-slate-900 rounded-lg">
            <Menu size={24} />
          </button>
          <span className="ml-2 font-extrabold text-lg text-slate-900">Admin Console</span>
        </header>

        {/* Page Content (Scrollable) */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
