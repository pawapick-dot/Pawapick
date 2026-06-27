// app/layout.tsx
import { Toaster } from "sonner";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import "./globals.css";

export const metadata = {
  title: "Pawa Pick | Asynchronous 1v1 Escrow",
  description: "Set the trap. Take the pick. The fastest P2P betting network in East Africa.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="flex flex-col min-h-screen bg-[#f9fafb]">
        {/* Global Navigation */}
        <Navbar />

        {/* Main Content Area */}
        <main className="flex-grow w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {children}
        </main>

        {/* Global Footer */}
        <Footer />

        {/* Global Toast Notifications */}
        <Toaster 
          position="top-center" 
          toastOptions={{
            className: 'bg-white border border-gray-200 text-gray-900 rounded-xl shadow-sm font-medium',
            style: { padding: '16px' },
          }} 
        />
      </body>
    </html>
  );
}
