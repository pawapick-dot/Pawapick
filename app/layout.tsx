import { Toaster } from "sonner";
import "./globals.css";

export const metadata = {
  title: "Pawa Pick",
  description: "Set the trap. Take the pick.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <main className="min-h-screen max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {children}
        </main>
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
