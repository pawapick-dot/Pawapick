// app/layout.tsx
import { Toaster } from "sonner";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import AuthModal from "@/components/AuthModal";
import { AuthProvider } from "@/context/AuthContext";
import "./globals.css";

export const metadata = {
  title: "Pawa Pick | Live Betting Network",
  description: "The fastest way to challenge players and win instantly. Transparent, provable, and P2P.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="flex flex-col min-h-screen bg-[#f9fafb]">
        <AuthProvider>
          {/* Global Auth Popup */}
          <AuthModal />
          
          <Navbar />

          <main className="flex-grow w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            {children}
          </main>

          <Footer />

          <Toaster 
            position="top-center" 
            toastOptions={{
              className: 'bg-white border border-gray-100 text-gray-900 rounded-xl shadow-sm font-bold',
              style: { padding: '16px' },
            }} 
          />
        </AuthProvider>
      </body>
    </html>
  );
}
