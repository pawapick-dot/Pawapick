// app/dashboard/page.tsx
import Link from "next/link";
import { 
  TrendingUp, 
  Swords, 
  Clock, 
  History, 
  LayoutGrid, 
  PlusSquare, 
  Wallet,
  ChevronRight
} from "lucide-react";

export default function Dashboard() {
  return (
    <div className="w-full max-w-7xl mx-auto space-y-6 mt-4 pb-12">
      
      {/* Welcome Header */}
      <div className="px-2">
        <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">Welcome back, PawaPlayer</h1>
        <p className="text-sm text-gray-500 font-medium">Here is your arena overview.</p>
      </div>

      {/* Stats Swiper (Mobile) / Bento Grid (Desktop) */}
      <div className="flex gap-4 overflow-x-auto hide-scrollbar px-2 md:grid md:grid-cols-4 md:overflow-visible">
        
        <div className="min-w-[140px] bg-white border border-gray-100 rounded-3xl p-5 shadow-sm flex-1">
          <div className="w-8 h-8 rounded-full bg-yellow-50 flex items-center justify-center mb-3">
            <TrendingUp size={16} className="text-yellow-600" />
          </div>
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Win Rate</p>
          <p className="text-2xl font-black text-gray-900 mt-1">68%</p>
        </div>

        <div className="min-w-[140px] bg-white border border-gray-100 rounded-3xl p-5 shadow-sm flex-1">
          <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center mb-3">
            <Swords size={16} className="text-gray-900" />
          </div>
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Matches Played</p>
          <p className="text-2xl font-black text-gray-900 mt-1">24</p>
        </div>

        <div className="min-w-[140px] bg-white border border-gray-100 rounded-3xl p-5 shadow-sm flex-1">
          <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center mb-3">
            <Clock size={16} className="text-gray-900" />
          </div>
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Active Escrows</p>
          <p className="text-2xl font-black text-gray-900 mt-1">2</p>
        </div>

      </div>

      {/* Quick Links Bento Grid */}
      <div className="px-2 mt-8">
        <h3 className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-3 px-1">Quick Actions</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 lg:gap-6">
          
          <Link href="/feed" className="bg-white border border-gray-100 rounded-3xl p-5 shadow-sm hover:border-yellow-200 hover:shadow-md transition group flex flex-col justify-between aspect-square">
            <LayoutGrid size={24} className="text-gray-400 group-hover:text-yellow-500 transition" />
            <div>
              <p className="font-bold text-gray-900">Live Feed</p>
              <p className="text-[10px] text-gray-500">Find matches</p>
            </div>
          </Link>

          <Link href="/create" className="bg-white border border-gray-100 rounded-3xl p-5 shadow-sm hover:border-yellow-200 hover:shadow-md transition group flex flex-col justify-between aspect-square">
            <PlusSquare size={24} className="text-gray-400 group-hover:text-yellow-500 transition" />
            <div>
              <p className="font-bold text-gray-900">Create</p>
              <p className="text-[10px] text-gray-500">Set a trap</p>
            </div>
          </Link>

          <Link href="/wallet" className="bg-gray-900 rounded-3xl p-5 shadow-sm hover:bg-black transition group flex flex-col justify-between aspect-square">
            <Wallet size={24} className="text-yellow-400" />
            <div>
              <p className="font-bold text-white">Wallet</p>
              <p className="text-[10px] text-gray-400">Manage funds</p>
            </div>
          </Link>

          <Link href="#" className="bg-white border border-gray-100 rounded-3xl p-5 shadow-sm hover:border-yellow-200 hover:shadow-md transition group flex flex-col justify-between aspect-square opacity-60">
            <History size={24} className="text-gray-400 group-hover:text-yellow-500 transition" />
            <div>
              <p className="font-bold text-gray-900">History</p>
              <p className="text-[10px] text-gray-500">Coming soon</p>
            </div>
          </Link>

        </div>
      </div>

      {/* Recent Activity Widget */}
      <div className="px-2 mt-6">
        <div className="bg-white border border-gray-100 rounded-3xl p-1 shadow-sm">
          <div className="flex items-center justify-between p-4 border-b border-gray-50">
            <span className="font-bold text-gray-900">Recent Games</span>
            <button className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center">
              View All <ChevronRight size={14} />
            </button>
          </div>
          
          <div className="p-2 space-y-1">
            {/* Placeholder Game Items */}
            <div className="flex items-center justify-between p-3 rounded-2xl hover:bg-gray-50 transition cursor-pointer">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center border border-green-100">
                  <span className="text-green-600 font-bold text-xs">WIN</span>
                </div>
                <div>
                  <p className="font-bold text-sm text-gray-900">Penalty Shootout</p>
                  <p className="text-[10px] text-gray-400">vs. Alex99</p>
                </div>
              </div>
              <p className="font-bold text-gray-900">+4,500 <span className="text-[10px] text-gray-400">UGX</span></p>
            </div>

            <div className="flex items-center justify-between p-3 rounded-2xl hover:bg-gray-50 transition cursor-pointer">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center border border-red-100">
                  <span className="text-red-600 font-bold text-xs">LOSS</span>
                </div>
                <div>
                  <p className="font-bold text-sm text-gray-900">Color Minefield</p>
                  <p className="text-[10px] text-gray-400">vs. SarahG</p>
                </div>
              </div>
              <p className="font-bold text-gray-900">-2,000 <span className="text-[10px] text-gray-400">UGX</span></p>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}
