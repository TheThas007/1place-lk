"use client";

import { useEffect } from "react";

export default function HomeScrollReset() {
  useEffect(() => {
    if (typeof window === "undefined") return;

    // 1. Force manual scroll restoration so browsers never restore old scrolled positions
    if ("scrollRestoration" in window.history) {
      window.history.scrollRestoration = "manual";
    }

    // 2. Clear any hash fragments (e.g. #new-arrivals) that might trigger auto-scrolling
    if (window.location.hash) {
      window.history.replaceState(null, "", window.location.pathname + window.location.search);
    }

    // 3. Immediately scroll to top (Hero section)
    window.scrollTo({ top: 0, left: 0, behavior: "instant" as ScrollBehavior });

    // 4. Re-assert top position on next frames and after initial hydration
    const rafId = requestAnimationFrame(() => {
      window.scrollTo(0, 0);
    });

    const timer1 = setTimeout(() => {
      window.scrollTo({ top: 0, left: 0, behavior: "instant" as ScrollBehavior });
    }, 50);

    const timer2 = setTimeout(() => {
      window.scrollTo({ top: 0, left: 0, behavior: "instant" as ScrollBehavior });
    }, 200);

    const handlePageShow = () => {
      window.scrollTo(0, 0);
    };
    window.addEventListener("pageshow", handlePageShow);

    return () => {
      cancelAnimationFrame(rafId);
      clearTimeout(timer1);
      clearTimeout(timer2);
      window.removeEventListener("pageshow", handlePageShow);
    };
  }, []);

  return null;
}
