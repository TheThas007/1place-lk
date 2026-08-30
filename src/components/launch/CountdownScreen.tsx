"use client";

import { memo } from "react";
import { motion } from "framer-motion";
import { LaunchCountdownState } from "@/lib/types";

interface CountdownScreenProps {
  countdown: LaunchCountdownState;
  title?: string;
  tagline?: string;
  isTestMode?: boolean;
}

export const CountdownScreen = memo(function CountdownScreen({
  countdown,
  title = "STREET MOBILE",
  tagline = "VAVUNIYA • SRI LANKA",
  isTestMode = false,
}: CountdownScreenProps) {
  const { days, hours, minutes, seconds } = countdown;

  const timeUnits = [
    { value: days, label: "DAYS" },
    { value: hours, label: "HOURS" },
    { value: minutes, label: "MINUTES" },
    { value: seconds, label: "SECONDS" },
  ];

  return (
    <div
      className="fixed inset-0 w-screen h-screen z-[9999999] bg-[#FFFFFF] text-[#0A0A0A] flex flex-col justify-between items-center px-4 py-8 sm:py-12 select-none overflow-hidden touch-none font-outfit"
      style={{
        backgroundColor: "#FFFFFF",
      }}
    >
      {/* ── Top Subtle Brand Eyebrow ── */}
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-5xl flex items-center justify-between pt-2 px-2 sm:px-6"
      >
        <div className="flex items-center gap-2.5">
          <div className="w-2 h-2 rounded-full bg-[#ED0712] animate-pulse" />
          <span className="text-[10px] sm:text-xs font-bold tracking-[0.25em] text-[#71717A] uppercase">
            {isTestMode ? "PREVIEW TEST MODE" : "OFFICIAL LAUNCH"}
          </span>
        </div>

        <div className="flex items-center gap-2 text-[10px] sm:text-xs font-semibold tracking-[0.2em] text-[#A1A1AA] uppercase">
          <span>SRI LANKA</span>
        </div>
      </motion.div>

      {/* ── Center Hero Section: Title & Premium Countdown ── */}
      <div className="w-full max-w-5xl flex flex-col items-center justify-center my-auto text-center px-2">
        {/* Brand Main Title */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.9, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          className="mb-6 sm:mb-10 md:mb-14"
        >
          <h1
            className="font-black tracking-[0.18em] sm:tracking-[0.22em] text-[#09090B] uppercase drop-shadow-sm leading-none"
            style={{
              fontSize: "clamp(1.75rem, 5.5vw, 4.5rem)",
            }}
          >
            {title}
          </h1>

          <div className="flex items-center justify-center gap-3 mt-3 sm:mt-4">
            <span className="h-[1px] w-6 sm:w-10 bg-[#E4E4E7]" />
            <p className="text-[10px] sm:text-xs md:text-sm font-semibold tracking-[0.3em] text-[#71717A] uppercase">
              {tagline}
            </p>
            <span className="h-[1px] w-6 sm:w-10 bg-[#E4E4E7]" />
          </div>
        </motion.div>

        {/* ── Main Responsive Countdown Grid ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.25, ease: [0.16, 1, 0.3, 1] }}
          className="w-full max-w-4xl"
        >
          <div className="flex items-center justify-center gap-1.5 sm:gap-3 md:gap-6 lg:gap-8">
            {timeUnits.map((unit, index) => (
              <div key={unit.label} className="flex items-center">
                {/* Number Box */}
                <div className="flex flex-col items-center">
                  <div
                    className="relative flex items-center justify-center bg-[#F4F4F5] border border-[#E4E4E7] rounded-2xl sm:rounded-3xl shadow-[0_4px_24px_rgba(0,0,0,0.03)] px-3 py-3 sm:px-6 sm:py-6 md:px-8 md:py-8 min-w-[64px] sm:min-w-[96px] md:min-w-[130px] lg:min-w-[150px]"
                  >
                    <span
                      className="font-black tracking-tight text-[#09090B] font-mono leading-none tabular-nums"
                      style={{
                        fontSize: "clamp(1.75rem, 6.5vw, 5.5rem)",
                      }}
                    >
                      {unit.value}
                    </span>
                  </div>

                  {/* Unit Label */}
                  <span className="mt-2.5 sm:mt-3.5 text-[9px] sm:text-xs md:text-sm font-bold tracking-[0.25em] sm:tracking-[0.3em] text-[#71717A] uppercase">
                    {unit.label}
                  </span>
                </div>

                {/* Colon Divider (except after the last item) */}
                {index < timeUnits.length - 1 && (
                  <div
                    className="flex flex-col items-center justify-center font-black text-[#A1A1AA] pb-5 sm:pb-7 px-0.5 sm:px-1.5 md:px-2 select-none"
                    style={{
                      fontSize: "clamp(1.25rem, 4vw, 3.5rem)",
                    }}
                  >
                    <span className="animate-pulse">:</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* ── Bottom Footer Watermark ── */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 0.4 }}
        className="w-full text-center pb-2 pointer-events-none"
      >
        <p className="text-[9px] sm:text-[10px] tracking-[0.35em] text-[#A1A1AA] font-semibold uppercase">
          STREET MOBILE (PVT) LTD • PREPARING FOR LAUNCH
        </p>
      </motion.div>
    </div>
  );
});

export default CountdownScreen;
