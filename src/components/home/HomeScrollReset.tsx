"use client";

import { useEffect } from "react";

export default function HomeScrollReset() {
  useEffect(() => {
    // Reset scroll position to top instantly without smooth animation
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, left: 0, behavior: "instant" as ScrollBehavior });
      
      // Also clear any legacy hash fragments like #new-arrivals from the URL bar cleanly without triggering reload
      if (window.location.hash) {
        window.history.replaceState(null, "", window.location.pathname + window.location.search);
      }
    }
  }, []);

  return null;
}
