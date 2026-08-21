"use client";

import React, { createContext, useContext, useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import Lenis from "lenis";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { db } from "@/lib/firebase";
import { doc, onSnapshot } from "firebase/firestore";
import { DEFAULT_MOTION_SETTINGS } from "@/lib/data";
import { MotionSettings } from "@/lib/types";

// Register ScrollTrigger once on client
if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

interface SmoothScrollContextType {
  lenis: Lenis | null;
  motionSettings: MotionSettings;
  isReducedMotion: boolean;
}

const SmoothScrollContext = createContext<SmoothScrollContextType>({
  lenis: null,
  motionSettings: DEFAULT_MOTION_SETTINGS,
  isReducedMotion: false,
});

export const useSmoothScroll = () => useContext(SmoothScrollContext);

export default function SmoothScrollProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [lenis, setLenis] = useState<Lenis | null>(null);
  const [motionSettings, setMotionSettings] = useState<MotionSettings>(DEFAULT_MOTION_SETTINGS);
  const [isReducedMotion, setIsReducedMotion] = useState(false);
  const lenisRef = useRef<Lenis | null>(null);

  // 1. Fetch real-time motion settings from Firestore
  useEffect(() => {
    try {
      const docRef = doc(db, "settings", "motion");
      const unsubscribe = onSnapshot(
        docRef,
        (snap) => {
          if (snap.exists()) {
            setMotionSettings({ ...DEFAULT_MOTION_SETTINGS, ...snap.data() } as MotionSettings);
          } else {
            setMotionSettings(DEFAULT_MOTION_SETTINGS);
          }
        },
        () => setMotionSettings(DEFAULT_MOTION_SETTINGS)
      );
      return () => unsubscribe();
    } catch {
      setMotionSettings(DEFAULT_MOTION_SETTINGS);
    }
  }, []);

  // 2. Check prefers-reduced-motion
  useEffect(() => {
    if (typeof window === "undefined") return;
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    setIsReducedMotion(mediaQuery.matches);

    const handleChange = (e: MediaQueryListEvent) => {
      setIsReducedMotion(e.matches);
    };

    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, []);

  // 3. Initialize single Lenis instance at application root
  useEffect(() => {
    // Disable in admin dashboard, login page, or if reduced motion is enabled
    const isAdminRoute = pathname?.startsWith("/admin") || pathname === "/login";
    if (isAdminRoute || isReducedMotion || motionSettings.enableSmoothScroll === false) {
      if (lenisRef.current) {
        lenisRef.current.destroy();
        lenisRef.current = null;
        setLenis(null);
      }
      return;
    }

    const instance = new Lenis({
      duration: 1.05,
      smoothWheel: true,
      wheelMultiplier: 0.9,
      touchMultiplier: 1,
      infinite: false,
      syncTouch: false,
    });

    lenisRef.current = instance;
    setLenis(instance);

    // Synchronize Lenis with GSAP ScrollTrigger
    instance.on("scroll", () => {
      ScrollTrigger.update();
    });

    const updateTicker = (time: number) => {
      instance.raf(time * 1000);
    };

    gsap.ticker.add(updateTicker);
    gsap.ticker.lagSmoothing(0);

    return () => {
      gsap.ticker.remove(updateTicker);
      instance.destroy();
      lenisRef.current = null;
      setLenis(null);
    };
  }, [pathname, isReducedMotion, motionSettings.enableSmoothScroll]);

  // 4. Smooth Anchor link navigation handling with navbar height offset
  useEffect(() => {
    const handleAnchorClick = (e: MouseEvent) => {
      const target = (e.target as HTMLElement)?.closest("a");
      if (!target) return;

      const href = target.getAttribute("href");
      if (!href || href.startsWith("http") || href.startsWith("mailto:") || href.startsWith("tel:")) return;

      // Handle internal in-page anchor links (e.g., #featured-products or /#reviews)
      let hash = "";
      if (href.startsWith("#")) {
        hash = href;
      } else if (href.startsWith("/#") && pathname === "/") {
        hash = href.replace("/", "");
      }

      if (hash && hash !== "#") {
        const targetElement = document.querySelector(hash);
        if (targetElement) {
          e.preventDefault();
          if (lenisRef.current) {
            lenisRef.current.scrollTo(targetElement as HTMLElement, {
              offset: -74,
              duration: 1.1,
              easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
            });
          } else {
            targetElement.scrollIntoView({ behavior: "smooth" });
          }
          window.history.pushState(null, "", hash);
        }
      }
    };

    document.addEventListener("click", handleAnchorClick);
    return () => document.removeEventListener("click", handleAnchorClick);
  }, [pathname]);

  // 5. Scroll to top on route navigation
  useEffect(() => {
    if (lenisRef.current) {
      lenisRef.current.scrollTo(0, { immediate: true });
    } else if (typeof window !== "undefined") {
      window.scrollTo(0, 0);
    }
  }, [pathname]);

  return (
    <SmoothScrollContext.Provider value={{ lenis, motionSettings, isReducedMotion }}>
      {children}
    </SmoothScrollContext.Provider>
  );
}
