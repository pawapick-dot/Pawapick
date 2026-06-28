// context/AuthContext.tsx
"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { 
  onAuthStateChanged, 
  User, 
  GoogleAuthProvider, 
  signInWithPopup, 
  signOut 
} from "firebase/auth";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase"; // Adjust import path based on your setup

interface AuthContextType {
  user: User | null;
  loading: boolean;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  openAuthModal: () => void;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      
      // SYNC AUTH DATA TO FIRESTORE
      if (currentUser) {
        try {
          const userRef = doc(db, "users", currentUser.uid);
          const userSnap = await getDoc(userRef);

          if (!userSnap.exists()) {
            // First time login: Create the document with a 0 balance
            await setDoc(userRef, {
              id: currentUser.uid,
              email: currentUser.email,
              displayName: currentUser.displayName || "Player",
              photoURL: currentUser.photoURL || "",
              walletBalance: 0,
              createdAt: new Date().toISOString()
            });
          } else {
            // Returning user: Just make sure their latest name/email is synced
            // We use { merge: true } so we NEVER overwrite their walletBalance!
            await setDoc(userRef, {
              email: currentUser.email,
              displayName: currentUser.displayName || "Player",
              photoURL: currentUser.photoURL || "",
              lastLogin: new Date().toISOString()
            }, { merge: true });
          }
        } catch (error) {
          console.error("Error syncing user to Firestore:", error);
        }
      }
      
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const loginWithGoogle = async () => {
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      setIsModalOpen(false);
    } catch (error) {
      console.error("Google login failed", error);
    }
  };

  const logout = async () => {
    await signOut(auth);
  };

  const openAuthModal = () => setIsModalOpen(true);

  return (
    <AuthContext.Provider value={{ user, loading, loginWithGoogle, logout, openAuthModal }}>
      {children}
      {/* Assuming your AuthModal is rendered elsewhere and listens to a global state, 
          or you can render it conditionally here based on isModalOpen */}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
