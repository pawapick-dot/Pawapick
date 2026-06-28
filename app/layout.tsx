// app/layout.tsx
import { Toaster } from "sonner";
import { Metadata, Viewport } from "next";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import AuthModal from "@/components/AuthModal";
import { AuthProvider } from "@/context/AuthContext";
import "./globals.css";

// Viewport configuration for PWA and Mobile responsiveness
export const viewport: Viewport = {
  themeColor: "#2563eb",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

// Global Metadata & App Icons configuration
export const metadata: Metadata = {
  title: "Pawa Pick | P2P Prediction Network",
  description: "Test your intuition against real people. Transparent, provable, and instantly settled.",
  manifest: "/manifest.json",
  icons: {
    // Array handles both tiny browser favicons and Google's 48px+ indexing requirements
    icon: [
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon-512.png", sizes: "512x512", type: "image/png" }
    ],
    // Specific icon for iOS home screens
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" }
    ],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Pawa Pick",
  },
  formatDetection: {
    telephone: false,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="flex flex-col min-h-screen bg-slate-50 text-slate-900 antialiased selection:bg-blue-100 selection:text-blue-900">
        <AuthProvider>
          {/* Global Authentication Modal */}
          <AuthModal />

          {/* Persistent Navbar */}
          <Navbar />

          {/* Main content wrapper with flex-grow to push footer to bottom */}
          <main className="flex-grow w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            {children}
          </main>

          {/* Persistent Footer */}
          <Footer />

          {/* Global Toast Notifications */}
          <Toaster 
            position="top-center" 
            richColors
            toastOptions={{
              className: 'bg-white border border-slate-200 text-slate-900 rounded-xl shadow-sm font-medium',
              style: { padding: '16px' },
            }} 
          />
        </AuthProvider>
      </body>
    </html>
  );
}
