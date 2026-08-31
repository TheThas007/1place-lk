"use client";

import { useEffect } from "react";

/**
 * Globally disables mouse wheel scrolling from changing number input values.
 * Also blurs active number inputs on wheel to prevent accidental changes during scroll.
 */
export default function DisableNumberScroll() {
  useEffect(() => {
    // Prevent mouse wheel from incrementing/decrementing when hovering or focusing number inputs
    const handleWheel = (e: WheelEvent) => {
      const target = e.target as HTMLElement | null;
      if (
        target &&
        target.tagName === "INPUT" &&
        (target as HTMLInputElement).type === "number"
      ) {
        // Prevent default stepping behavior
        e.preventDefault();
        // Blur if currently focused so wheel continues scrolling the page naturally
        if (document.activeElement === target) {
          (target as HTMLInputElement).blur();
        }
      }
    };

    // Attach with passive: false to allow e.preventDefault()
    window.addEventListener("wheel", handleWheel, { passive: false });
    document.addEventListener("wheel", handleWheel, { passive: false });

    return () => {
      window.removeEventListener("wheel", handleWheel);
      document.removeEventListener("wheel", handleWheel);
    };
  }, []);

  return null;
}
