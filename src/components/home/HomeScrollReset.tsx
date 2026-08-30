"use client";

import { useEffect } from "react";

export default function HomeScrollReset() {
  useEffect(() => {
    if (typeof window === "undefined") return;

    // Clear any hash fragments that might trigger unintended hash auto-scrolling
    if (window.location.hash) {
      window.history.replaceState(null, "", window.location.pathname + window.location.search);
    }
  }, []);

  return null;
}
