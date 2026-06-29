"use client";

import { useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

export default function UserSync() {
  const { user } = useAuth();
  const searchParams = useSearchParams();
  const hasSynced = useRef(false);

  // 1. Capture the referral code from the URL and save it to local storage
  useEffect(() => {
    const refCode = searchParams.get("ref");
    if (refCode) {
      // Store it for up to 7 days
      localStorage.setItem("pawa_ref_code", refCode.toUpperCase());
    }
  }, [searchParams]);

  // 2. Sync the user profile to ensure they have a unique code in Firestore
  useEffect(() => {
    const syncUserProfile = async () => {
      if (!user || hasSynced.current) return;
      
      try {
        const token = await user.getIdToken();
        const storedRef = localStorage.getItem("pawa_ref_code");

        const res = await fetch("/api/user/sync", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
          },
          body: JSON.stringify({
            referredBy: storedRef || null
          })
        });

        if (res.ok) {
          hasSynced.current = true; // Prevent duplicate calls during the session
          // Once synced successfully, clear the local storage so they don't 
          // accidentally refer themselves again if they delete their account.
          if (storedRef) localStorage.removeItem("pawa_ref_code"); 
        }
      } catch (error) {
        console.error("User sync failed:", error);
      }
    };

    syncUserProfile();
  }, [user]);

  return null; // This is a logic-only component, it renders nothing.
}
