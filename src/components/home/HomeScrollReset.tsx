"use client";

import { useEffect, useLayoutEffect } from "react";

export default function HomeScrollReset() {
  useLayoutEffect(() => {
    if (typeof window === "undefined") return;

    if ("scrollRestoration" in window.history) {
      window.history.scrollRestoration = "manual";
    }

    // Force top position immediately before painting
    window.scrollTo(0, 0);
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;

    // 1. Clear any hash fragments (e.g. #new-arrivals) that might trigger auto-scrolling
    if (window.location.hash) {
      window.history.replaceState(null, "", window.location.pathname + window.location.search);
    }

    const resetToTop = () => {
      window.scrollTo({ top: 0, left: 0, behavior: "instant" as ScrollBehavior });
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
    };

    resetToTop();

    // 2. Re-assert top position on consecutive frames and after initial hydration
    const rafId = requestAnimationFrame(resetToTop);
    const timer1 = setTimeout(resetToTop, 20);
    const timer2 = setTimeout(resetToTop, 80);
    const timer3 = setTimeout(resetToTop, 250);

    window.addEventListener("pageshow", resetToTop);

    return () => {
      cancelAnimationFrame(rafId);
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
      window.removeEventListener("pageshow", resetToTop);
    };
  }, []);

  return null;
}
