"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface LaunchRevealProps {
  onComplete: () => void;
  title?: string;
  tagline?: string;
}

export function LaunchReveal({ onComplete, title = "STREET MOBILE", tagline = "VAVUNIYA • SRI LANKA" }: LaunchRevealProps) {
  // Phase 1: freeze -> Phase 2: fadeOutCountdown -> Phase 3: showLogo -> Phase 4: logoHold -> Phase 5: logoFadeOut -> Phase 6: dissolveToWeb
  const [phase, setPhase] = useState<number>(1);

  useEffect(() => {
    // Phase 1: Freeze briefly at 00:00:00:00 (500ms)
    const t1 = setTimeout(() => {
      setPhase(2); // Countdown fades out
    }, 600);

    // Phase 2: Fade out countdown -> reveal logo (1200ms)
    const t2 = setTimeout(() => {
      setPhase(3); // Logo appears
    }, 1400);

    // Phase 3 & 4: Logo hold & subtle glow (2400ms)
    const t3 = setTimeout(() => {
      setPhase(4); // Logo hold
    }, 2400);

    // Phase 5: Logo fades out (3400ms)
    const t4 = setTimeout(() => {
      setPhase(5); // Logo fade out
    }, 3500);

    // Phase 6: White curtain dissolves into the full website (4400ms)
    const t5 = setTimeout(() => {
      setPhase(6); // Dissolve curtain
    }, 4300);

    // Phase 7: Complete and unmount reveal overlay (5000ms)
    const t6 = setTimeout(() => {
      onComplete();
    }, 5200);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
      clearTimeout(t5);
      clearTimeout(t6);
    };
  }, [onComplete]);

  return (
    <div
      className="fixed inset-0 w-screen h-screen z-[99999999] bg-[#FFFFFF] flex flex-col items-center justify-center pointer-events-none select-none overflow-hidden font-outfit"
      style={{
        backgroundColor: "#FFFFFF",
      }}
    >
      <AnimatePresence mode="wait">
        {/* Phase 1 & 2: Freezing and fading out the 00:00:00:00 timer */}
        {(phase === 1 || phase === 2) && (
          <motion.div
            key="reveal-countdown-frozen"
            initial={{ opacity: 1, scale: 1 }}
            animate={{
              opacity: phase === 2 ? 0 : 1,
              scale: phase === 2 ? 0.96 : 1,
              filter: phase === 2 ? "blur(8px)" : "blur(0px)",
            }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="w-full max-w-4xl text-center px-4"
          >
            <h1
              className="font-black tracking-[0.2em] text-[#09090B] uppercase mb-8"
              style={{ fontSize: "clamp(1.75rem, 5.5vw, 4.5rem)" }}
            >
              {title}
            </h1>

            <div className="flex items-center justify-center gap-2 sm:gap-4 md:gap-6">
              {["00", "00", "00", "00"].map((num, idx) => (
                <div key={idx} className="flex items-center">
                  <div className="bg-[#F4F4F5] border border-[#E4E4E7] rounded-2xl sm:rounded-3xl px-3 py-3 sm:px-6 sm:py-6 md:px-8 md:py-8 min-w-[64px] sm:min-w-[96px] md:min-w-[130px]">
                    <span
                      className="font-black tracking-tight text-[#09090B] font-mono"
                      style={{ fontSize: "clamp(1.75rem, 6.5vw, 5.5rem)" }}
                    >
                      {num}
                    </span>
                  </div>
                  {idx < 3 && (
                    <span
                      className="font-black text-[#A1A1AA] pb-4 px-1"
                      style={{ fontSize: "clamp(1.25rem, 4vw, 3.5rem)" }}
                    >
                      :
                    </span>
                  )}
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Phase 3, 4, 5: Official Street Mobile Logo Reveal */}
        {(phase === 3 || phase === 4 || phase === 5) && (
          <motion.div
            key="reveal-logo-center"
            initial={{ opacity: 0, scale: 0.88, filter: "blur(12px)" }}
            animate={{
              opacity: phase === 5 ? 0 : 1,
              scale: phase === 5 ? 1.08 : 1,
              filter: phase === 5 ? "blur(8px)" : "blur(0px)",
            }}
            transition={{ duration: phase === 5 ? 0.7 : 0.9, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-col items-center justify-center text-center px-6"
          >
            {/* Center Logo Card */}
            <div className="relative mb-6 flex items-center justify-center">
              <motion.div
                initial={{ scale: 0.9 }}
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
                className="w-32 h-32 sm:w-44 sm:h-44 md:w-52 md:h-52 rounded-3xl bg-[#09090B] p-6 sm:p-8 flex items-center justify-center shadow-[0_20px_60px_rgba(0,0,0,0.18)]"
              >
                <img
                  src="/logo.png"
                  alt="Street Mobile Official Logo"
                  className="w-full h-full object-contain filter drop-shadow-[0_4px_12px_rgba(255,255,255,0.2)]"
                />
              </motion.div>
            </div>

            {/* Brand Title */}
            <motion.h2
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.6 }}
              className="text-2xl sm:text-4xl md:text-5xl font-black tracking-[0.25em] text-[#09090B] uppercase"
            >
              {title}
            </motion.h2>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.6 }}
              className="text-xs sm:text-sm font-semibold tracking-[0.35em] text-[#71717A] uppercase mt-2.5"
            >
              {tagline}
            </motion.p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Phase 6: Curtain Dissolve Overlay */}
      {phase === 6 && (
        <motion.div
          initial={{ opacity: 1 }}
          animate={{
            opacity: 0,
            scale: 1.04,
            filter: "blur(12px)",
          }}
          transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
          className="absolute inset-0 bg-white"
        />
      )}
    </div>
  );
}

export default LaunchReveal;
