"use client";

import { useEffect, useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { usePathname } from "next/navigation";
import { Zap, ShieldCheck, Sparkles } from "lucide-react";

const STATUS_MESSAGES = [
  "Initializing Street Mobile...",
  "Loading Genuine Devices & Accessories...",
  "Syncing Exclusive Offers...",
  "Welcome to Street Mobile"
];

export default function AppLoadingScreen() {
  const pathname = usePathname();
  const [isVisible, setIsVisible] = useState(true);
  const [progress, setProgress] = useState(0);
  const [statusIndex, setStatusIndex] = useState(0);

  // Don't show public splash for admin pages to keep backend fast
  const isAdmin = useMemo(() => pathname?.startsWith("/admin"), [pathname]);

  useEffect(() => {
    if (isAdmin) {
      setIsVisible(false);
      return;
    }

    // Lock body scroll while splash is active
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    // Smooth incremental progress counter
    const startTime = Date.now();
    const minDuration = 1000; // 1s smooth splash feel
    const maxDuration = 1800; // Safety cap

    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const calculatedProgress = Math.min(100, Math.round((elapsed / minDuration) * 100));

      setProgress((prev) => {
        const next = Math.max(prev, calculatedProgress);
        if (next < 30) setStatusIndex(0);
        else if (next < 65) setStatusIndex(1);
        else if (next < 90) setStatusIndex(2);
        else setStatusIndex(3);
        return next;
      });

      // Complete once duration elapsed and window ready
      if (elapsed >= minDuration) {
        clearInterval(interval);
        setProgress(100);
        setTimeout(() => {
          setIsVisible(false);
          document.body.style.overflow = originalOverflow;
        }, 300);
      }
    }, 30);

    // Ultimate fallback safeguard
    const timeout = setTimeout(() => {
      clearInterval(interval);
      setProgress(100);
      setIsVisible(false);
      document.body.style.overflow = originalOverflow;
    }, maxDuration);

    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
      document.body.style.overflow = originalOverflow;
    };
  }, [isAdmin]);

  if (!isVisible) return null;

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          key="app-loading-screen"
          initial={{ opacity: 1 }}
          exit={{
            opacity: 0,
            scale: 1.04,
            filter: "blur(8px)",
            transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] },
          }}
          className="fixed inset-0 z-[999999] flex flex-col items-center justify-center bg-[#050505] text-white select-none overflow-hidden touch-none font-outfit"
          style={{ willChange: "opacity, transform, filter" }}
        >
          {/* ── Ambient Background Glow Effects ── */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            {/* Top Cyan/Silver Glow */}
            <motion.div
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.15, 0.28, 0.15],
              }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              className="absolute -top-[20%] left-1/2 -translate-x-1/2 w-[340px] sm:w-[500px] h-[340px] sm:h-[500px] rounded-full bg-gradient-to-b from-white/20 via-neutral-400/10 to-transparent blur-[100px]"
            />
            {/* Center Pulsing Aura */}
            <motion.div
              animate={{
                scale: [0.95, 1.15, 0.95],
                opacity: [0.1, 0.22, 0.1],
              }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[280px] h-[280px] rounded-full bg-white/10 blur-[80px]"
            />
            {/* Subtle Grid Lines Background */}
            <div
              className="absolute inset-0 opacity-[0.03]"
              style={{
                backgroundImage:
                  "radial-gradient(circle at 1px 1px, #ffffff 1px, transparent 0)",
                backgroundSize: "28px 28px",
              }}
            />
          </div>

          {/* ── Center Content Container ── */}
          <div className="relative z-10 flex flex-col items-center justify-center px-6 max-w-sm w-full mx-auto">
            {/* 1. Glowing Logo Container */}
            <div className="relative mb-8 flex items-center justify-center">
              {/* Outer Pulsing Rings */}
              <motion.div
                animate={{
                  scale: [1, 1.2, 1],
                  opacity: [0.3, 0.7, 0.3],
                  rotate: [0, 180, 360],
                }}
                transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
                className="absolute w-28 h-28 sm:w-32 sm:h-32 rounded-full border border-dashed border-white/20"
              />
              <motion.div
                animate={{
                  scale: [1.1, 0.95, 1.1],
                  opacity: [0.2, 0.5, 0.2],
                  rotate: [360, 180, 0],
                }}
                transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                className="absolute w-36 h-36 sm:w-40 sm:h-40 rounded-full border border-white/10"
              />

              {/* Logo Card with Glassmorphism */}
              <motion.div
                initial={{ scale: 0.8, opacity: 0, y: 10 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                className="relative z-10 w-20 h-20 sm:w-24 sm:h-24 rounded-3xl bg-neutral-900/90 border border-white/20 p-3.5 flex items-center justify-center shadow-[0_0_40px_rgba(255,255,255,0.12)] backdrop-blur-xl"
              >
                <img
                  src="/logo.png"
                  alt="Street Mobile"
                  className="w-full h-full object-contain filter drop-shadow-[0_2px_10px_rgba(255,255,255,0.2)]"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = "none";
                    const fb = document.getElementById("splash-logo-fallback");
                    if (fb) fb.style.display = "flex";
                  }}
                />
                {/* Fallback Icon / Text if logo fails to load */}
                <div
                  id="splash-logo-fallback"
                  className="hidden flex-col items-center justify-center w-full h-full text-center"
                >
                  <span className="text-xl font-black tracking-tighter text-white">SM</span>
                </div>
              </motion.div>
            </div>

            {/* 2. Brand Titles & Badge */}
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15, duration: 0.5 }}
              className="text-center mb-7"
            >
              <h1 className="text-xl sm:text-2xl font-black tracking-[0.2em] text-white uppercase drop-shadow-sm flex items-center justify-center gap-1.5">
                <span>STREET MOBILE</span>
              </h1>
              <div className="flex items-center justify-center gap-1.5 mt-1.5">
                <span className="h-px w-3 bg-white/20" />
                <p className="text-[10px] sm:text-[11px] font-semibold tracking-[0.25em] text-neutral-400 uppercase">
                  VAVUNIYA • SRI LANKA
                </p>
                <span className="h-px w-3 bg-white/20" />
              </div>
            </motion.div>

            {/* 3. Progress Bar & Percent Indicator */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.25, duration: 0.4 }}
              className="w-full max-w-[240px] flex flex-col items-center gap-2.5"
            >
              {/* Progress Track */}
              <div className="w-full h-1.5 bg-neutral-900 rounded-full overflow-hidden border border-white/10 p-[1px] relative shadow-inner">
                <motion.div
                  className="h-full rounded-full bg-gradient-to-r from-neutral-400 via-white to-white relative"
                  style={{ width: `${progress}%` }}
                  transition={{ ease: "easeOut", duration: 0.1 }}
                >
                  {/* Glowing Leading Head */}
                  <div className="absolute right-0 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-white shadow-[0_0_10px_#ffffff]" />
                </motion.div>
              </div>

              {/* Status and Percentage Label */}
              <div className="w-full flex items-center justify-between text-[11px] text-neutral-400 font-mono pt-0.5">
                <div className="flex items-center gap-1.5">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                    className="w-2.5 h-2.5 rounded-full border border-white/40 border-t-white"
                  />
                  <span className="text-[10px] tracking-wider text-neutral-300 font-sans truncate max-w-[170px]">
                    {STATUS_MESSAGES[statusIndex]}
                  </span>
                </div>
                <span className="font-bold text-white tracking-wider">{progress}%</span>
              </div>
            </motion.div>

            {/* 4. Trust Badges Micro-Pills */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.6 }}
              className="flex items-center justify-center gap-3 mt-10 text-[10px] text-neutral-400"
            >
              <div className="flex items-center gap-1 bg-white/[0.04] border border-white/[0.08] px-2.5 py-1 rounded-full">
                <ShieldCheck className="w-3 h-3 text-white" />
                <span>100% Genuine</span>
              </div>
              <div className="flex items-center gap-1 bg-white/[0.04] border border-white/[0.08] px-2.5 py-1 rounded-full">
                <Zap className="w-3 h-3 text-white" />
                <span>Fast Delivery</span>
              </div>
            </motion.div>
          </div>

          {/* ── Bottom Secure Watermark ── */}
          <div className="absolute bottom-6 left-0 right-0 text-center pointer-events-none">
            <p className="text-[9px] tracking-[0.3em] text-neutral-400 uppercase font-medium">
              STREET MOBILE (PVT) LTD
            </p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
