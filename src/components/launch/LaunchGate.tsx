"use client";

import { useState, useEffect, useCallback, useMemo, ReactNode } from "react";
import { usePathname } from "next/navigation";
import { useLaunchSettings } from "@/hooks/useLaunchSettings";
import { useServerTime } from "@/hooks/useServerTime";
import { collection, onSnapshot, query } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Review } from "@/lib/types";
import CountdownScreen from "./CountdownScreen";
import LaunchReveal from "./LaunchReveal";

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

  // Listen for admin test launch event
  useEffect(() => {
    const handleTestLaunch = (e: any) => {
      const seconds = e?.detail?.seconds || 10;
      setTestCountdownTarget(Date.now() + seconds * 1000);
      setIsRevealing(false);
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
    if (loading || !isSynced) return true; // Fail securely while initializing
    if (settings.manualReveal === true) return false;
    if (settings.enabled === false) return false;
    if (testCountdownTarget && !countdown.isExpired) return true;

    // Normal launch check
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

  // Reveal animation complete
  const handleRevealComplete = useCallback(() => {
    setIsRevealing(false);
    setHasManuallyRevealed(true);
    setTestCountdownTarget(null);
  }, []);

  // If on admin or unblocked route, render children directly
  if (isBypassedRoute) {
    return <>{children}</>;
  }

  // Initial loading placeholder (Pure white to avoid any flash of unreleased website)
  if (loading && !isBypassedRoute) {
    return (
      <div className="fixed inset-0 w-screen h-screen z-[99999999] bg-[#FFFFFF] flex flex-col items-center justify-center font-outfit select-none">
        <h1 className="text-2xl sm:text-3xl font-black tracking-[0.22em] text-[#09090B] uppercase">
          STREET MOBILE
        </h1>
        <p className="text-xs font-semibold tracking-[0.25em] text-[#71717A] uppercase mt-2">
          PREPARING FOR LAUNCH...
        </p>
      </div>
    );
  }

  return (
    <>
      {/* ── 1. Full-Screen White Launch Countdown ── */}
      {isLaunchActive && !isRevealing && (
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

      {/* ── 2. 7-Phase Cinematic Reveal Animation ── */}
      {isRevealing && (
        <LaunchReveal
          onComplete={handleRevealComplete}
          title={settings.title || "STREET MOBILE"}
          tagline={settings.tagline || "VAVUNIYA • SRI LANKA"}
        />
      )}

      {/* ── 3. Normal Website Content (Only rendered when launch passed or bypassed) ── */}
      {(!isLaunchActive || isRevealing || hasManuallyRevealed) && children}
    </>
  );
}
