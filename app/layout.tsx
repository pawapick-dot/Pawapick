// app/layout.tsx
import { Toaster } from "sonner";
import Navbar from "@/components/Navbar";
import AuthModal from "@/components/AuthModal";
import { AuthProvider } from "@/context/AuthContext";
import "./globals.css";

export const metadata = {
  title: "Pawa Pick | P2P Prediction Network",
  description: "Test your intuition against real people. Transparent, provable, and instantly settled.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      {/* Soft SaaS Background */}
      <body className="flex flex-col min-h-screen bg-slate-50 text-slate-900 selection:bg-blue-100">
        <AuthProvider>
          <AuthModal />
          <Navbar />
          <main className="flex-grow w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            {children}
          </main>
          <Toaster 
            position="top-center" 
            toastOptions={{
              className: 'bg-white border border-slate-100 text-slate-900 rounded-2xl shadow-lg font-medium',
              style: { padding: '16px' },
            }} 
          />
        </AuthProvider>
      </body>
    </html>
  );
}
