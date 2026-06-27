// context/AuthContext.tsx
"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { User, onAuthStateChanged, signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";

type AuthContextType = {
  user: User | null;
  loading: boolean;
  isModalOpen: boolean;
  openAuthModal: () => void;
  closeAuthModal: () => void;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
      if (currentUser) setIsModalOpen(false); // Auto-close modal on success
    });
    return () => unsubscribe();
  }, []);

  const openAuthModal = () => setIsModalOpen(true);
  const closeAuthModal = () => setIsModalOpen(false);
  const logout = () => signOut(auth);

  return (
    <AuthContext.Provider value={{ user, loading, isModalOpen, openAuthModal, closeAuthModal, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
};
