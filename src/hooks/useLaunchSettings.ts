"use client";

import { useState, useEffect, useCallback } from "react";
import { doc, onSnapshot, setDoc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { LaunchSettings } from "@/lib/types";
import { DEFAULT_LAUNCH_SETTINGS } from "@/lib/data";

export function useLaunchSettings() {
  const [settings, setSettings] = useState<LaunchSettings>(DEFAULT_LAUNCH_SETTINGS);
  const [loading, setLoading] = useState<boolean>(true);
  const [isOffline, setIsOffline] = useState<boolean>(false);

  useEffect(() => {
    let unsub: (() => void) | null = null;
    try {
      const docRef = doc(db, "settings", "launch");
      unsub = onSnapshot(
        docRef,
        (snap) => {
          if (snap.exists()) {
            const data = snap.data() as Partial<LaunchSettings>;
            setSettings({
              ...DEFAULT_LAUNCH_SETTINGS,
              ...data,
            });
          } else {
            setSettings(DEFAULT_LAUNCH_SETTINGS);
          }
          setLoading(false);
        },
        (error) => {
          console.warn("Could not listen to launch settings snapshot:", error);
          setIsOffline(true);
          setLoading(false);
        }
      );
    } catch (e) {
      console.warn("Firestore error in useLaunchSettings:", e);
      setIsOffline(true);
      setLoading(false);
    }

    return () => {
      if (unsub) unsub();
    };
  }, []);

  const saveSettings = useCallback(async (updates: Partial<LaunchSettings>) => {
    try {
      const docRef = doc(db, "settings", "launch");
      const updatedData: LaunchSettings = {
        ...settings,
        ...updates,
        updatedAt: new Date().toISOString(),
      };
      await setDoc(docRef, updatedData, { merge: true });
      setSettings(updatedData);
      return { success: true };
    } catch (error) {
      console.error("Failed to save launch settings:", error);
      throw error;
    }
  }, [settings]);

  const revealNow = useCallback(async () => {
    return saveSettings({ manualReveal: true, enabled: false });
  }, [saveSettings]);

  const disableCountdown = useCallback(async () => {
    return saveSettings({ enabled: false });
  }, [saveSettings]);

  const enableCountdown = useCallback(async (timestamp?: string) => {
    const launchTimestamp = timestamp || settings.launchTimestamp || DEFAULT_LAUNCH_SETTINGS.launchTimestamp;
    return saveSettings({ enabled: true, manualReveal: false, launchTimestamp });
  }, [saveSettings, settings.launchTimestamp]);

  return {
    settings,
    loading,
    isOffline,
    saveSettings,
    revealNow,
    disableCountdown,
    enableCountdown,
  };
}
