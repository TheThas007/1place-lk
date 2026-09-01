"use client";

import { useState, useEffect, useCallback, useMemo, ReactNode } from "react";
import { usePathname } from "next/navigation";
import { useLaunchSettings } from "@/hooks/useLaunchSettings";
import { useServerTime } from "@/hooks/useServerTime";
import { collection, onSnapshot, query } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Review } from "@/lib/types";
import CountdownScreen from "./CountdownScreen";
import { VirtualAssistantLaunch } from "./VirtualAssistantLaunch";

interface LaunchGateProps {
  children: ReactNode;
}

export default function LaunchGate({ children }: LaunchGateProps) {
  const pathname = usePathname();
  const { settings, loading } = useLaunchSettings();

  // Live Firestore Reviews & Store Gallery State
  const [liveReviews, setLiveReviews] = useState<Review[]>([]);
  const [liveGallery, setLiveGallery] = useState<any[]>([]);

  useEffect(() => {
    let unsubReviews: (() => void) | null = null;
    let unsubGallery: (() => void) | null = null;

    try {
      const qReviews = query(collection(db, "reviews"));
      unsubReviews = onSnapshot(qReviews, (snap) => {
        const docs = snap.docs.map((d) => ({ ...d.data(), id: d.id } as Review));
        if (docs.length > 0) {
          setLiveReviews(docs.sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0)));
        }
      });

      const qGallery = query(collection(db, "gallery"));
      unsubGallery = onSnapshot(qGallery, (snap) => {
        const docs = snap.docs.map((d) => ({ ...d.data(), id: d.id }));
        if (docs.length > 0) {
          setLiveGallery(docs);
        }
      });
    } catch (e) {
      console.warn("Could not subscribe to live reviews or gallery:", e);
    }

    return () => {
      if (unsubReviews) unsubReviews();
      if (unsubGallery) unsubGallery();
    };
  }, []);

  // Test mode state (triggered from admin panel)
  const [testCountdownTarget, setTestCountdownTarget] = useState<number | null>(null);
  const [isRevealing, setIsRevealing] = useState<boolean>(false);
  const [hasManuallyRevealed, setHasManuallyRevealed] = useState<boolean>(false);
  const [isAssistantActive, setIsAssistantActive] = useState<boolean>(false);

  // Check if launch was already experienced in this browser
  useEffect(() => {
    if (typeof window !== "undefined") {
      const experienced = localStorage.getItem("sm_launch_experienced") === "true";
      if (experienced && settings?.enabled === false) {
        setHasManuallyRevealed(true);
      }
    }
  }, [settings?.enabled]);

  // Exclude admin routes from launch lock
  const isBypassedRoute = useMemo(() => {
    if (!pathname) return false;
    return (
      pathname.startsWith("/admin") ||
      pathname.startsWith("/admin-preview") ||
      pathname.startsWith("/api")
    );
  }, [pathname]);

  // Check admin preview cookie/session
  const [hasAdminPreviewAuth, setHasAdminPreviewAuth] = useState<boolean>(false);
  useEffect(() => {
    if (typeof window !== "undefined") {
      const isPreviewAuth =
        sessionStorage.getItem("admin_auth") === "true" ||
        localStorage.getItem("admin_auth") === "true" ||
        document.cookie.includes("sm_admin_preview=authenticated");
      setHasAdminPreviewAuth(isPreviewAuth);
    }
  }, [pathname]);

  // Handle countdown zero transition
  const handleCountdownZero = useCallback(() => {
    setIsRevealing(true);
  }, []);

  // Server-synchronized countdown
  const targetTimestamp = useMemo(() => {
    if (testCountdownTarget) return testCountdownTarget;
    return settings?.launchTimestamp;
  }, [testCountdownTarget, settings?.launchTimestamp]);

  const { countdown, isSynced } = useServerTime({
    targetTimestamp,
    onZero: handleCountdownZero,
  });

  // Listen for admin test launch event (defaults to 60s)
  useEffect(() => {
    const handleTestLaunch = (e: any) => {
      const seconds = e?.detail?.seconds || 60;
      setTestCountdownTarget(Date.now() + seconds * 1000);
      setIsRevealing(false);
      setHasManuallyRevealed(false);
      setIsAssistantActive(true);
    };

    window.addEventListener("street-mobile-test-launch" as any, handleTestLaunch);
    return () => {
      window.removeEventListener("street-mobile-test-launch" as any, handleTestLaunch);
    };
  }, []);

  // Determine if launch screen should be active
  const isLaunchActive = useMemo(() => {
    if (isBypassedRoute) return false;
    if (hasAdminPreviewAuth && pathname === "/admin-preview") return false;
    if (hasManuallyRevealed) return false;
    if (loading || !isSynced) return true;
    if (settings.manualReveal === true) return false;
    if (settings.enabled === false) return false;
    if (testCountdownTarget && !countdown.isExpired) return true;

    return !countdown.isExpired;
  }, [
    isBypassedRoute,
    hasAdminPreviewAuth,
    pathname,
    hasManuallyRevealed,
    loading,
    isSynced,
    settings.manualReveal,
    settings.enabled,
    testCountdownTarget,
    countdown.isExpired,
  ]);

  // Activate Virtual Assistant when countdown hits 60s or less
  useEffect(() => {
    if (isLaunchActive && countdown.totalSeconds <= 60 && !hasManuallyRevealed) {
      setIsAssistantActive(true);
    }
  }, [isLaunchActive, countdown.totalSeconds, hasManuallyRevealed]);

  // Reveal animation complete: called ONLY AFTER assistant finishes her full speech
  const handleRevealComplete = useCallback(() => {
    setIsAssistantActive(false);
    setIsRevealing(false);
    setHasManuallyRevealed(true);
    setTestCountdownTarget(null);
    if (typeof window !== "undefined") {
      localStorage.setItem("sm_launch_experienced", "true");
    }
  }, []);

  // If on admin, unblocked route, or revealed, render children directly
  if (isBypassedRoute || hasManuallyRevealed) {
    return <>{children}</>;
  }

  // Initial silent white background while loading settings (No 'Preparing for launch' screen)
  if (loading && !isBypassedRoute && !hasManuallyRevealed) {
    return (
      <div className="fixed inset-0 w-screen h-screen z-[99999999] bg-[#FFFFFF]" />
    );
  }

  return (
    <>
      {/* ── 1. Above 60 Seconds: Full-Screen White Launch Countdown ── */}
      {isLaunchActive && !isAssistantActive && countdown.totalSeconds > 60 && !isRevealing && (
        <CountdownScreen
          countdown={countdown}
          title={settings.title || "STREET MOBILE"}
          tagline={settings.tagline || "VAVUNIYA • SRI LANKA"}
          glowColor={settings.glowColor || "#C4E2F5"}
          isTestMode={Boolean(testCountdownTarget)}
          preLaunchSettings={settings.preLaunchExperience}
          reviews={liveReviews.length > 0 ? liveReviews : undefined}
          galleryImages={liveGallery.length > 0 ? liveGallery : undefined}
          onSecretUnlock={() => {
            setHasManuallyRevealed(true);
            setHasAdminPreviewAuth(true);
          }}
        />
      )}

      {/* ── 2. Final 60 Seconds + Reveal: Virtual AI Assistant Launch Experience ── */}
      {(isAssistantActive || (isLaunchActive && countdown.totalSeconds <= 60)) && !hasManuallyRevealed && (
        <VirtualAssistantLaunch
          totalRemainingSeconds={countdown.totalSeconds > 0 ? countdown.totalSeconds : 60}
          title={settings.title || "STREET MOBILE"}
          tagline={settings.tagline || "VAVUNIYA • SRI LANKA"}
          glowColor={settings.glowColor || "#C4E2F5"}
          onLaunchComplete={handleRevealComplete}
        />
      )}

      {/* ── 3. Normal Website Content (Rendered when revealed or completed) ── */}
      {hasManuallyRevealed && children}
    </>
  );
}
