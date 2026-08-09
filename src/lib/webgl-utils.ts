/**
 * Utility functions for WebGL detection, hardware capabilities, and motion preferences.
 */

export function isWebGLAvailable(): boolean {
  if (typeof window === "undefined") return false;

  try {
    const canvas = document.createElement("canvas");
    const gl =
      canvas.getContext("webgl2") ||
      canvas.getContext("webgl") ||
      canvas.getContext("experimental-webgl");
    
    if (!gl) return false;

    // Additional check to verify context isn't lost
    const isLost = typeof (gl as WebGLRenderingContext).isContextLost === "function" 
      ? (gl as WebGLRenderingContext).isContextLost() 
      : false;

    return !isLost;
  } catch {
    return false;
  }
}

export function prefersReducedMotion(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export function isLowPowerDevice(): boolean {
  if (typeof window === "undefined") return false;

  // Check hardware concurrency (CPU cores)
  if (typeof navigator.hardwareConcurrency === "number" && navigator.hardwareConcurrency <= 4) {
    return true;
  }

  // Check device memory in GB if supported by browser
  const nav = navigator as Navigator & { deviceMemory?: number };
  if (typeof nav.deviceMemory === "number" && nav.deviceMemory < 4) {
    return true;
  }

  return false;
}
