"use client";

import { memo } from "react";
import { motion } from "framer-motion";

export type AssistantMood = "intro" | "speaking" | "counting" | "celebrating" | "transforming";

interface VirtualAssistantLaunchAvatarProps {
  mood?: AssistantMood;
  isSpeaking?: boolean;
  activeCount?: number | null;
  className?: string;
  size?: "sm" | "md" | "lg" | "hero";
}

export const VirtualAssistantLaunchAvatar = memo(function VirtualAssistantLaunchAvatar({
  mood = "intro",
  isSpeaking = false,
  activeCount = null,
  className = "",
  size = "hero",
}: VirtualAssistantLaunchAvatarProps) {
  const sizeClasses = {
    sm: "w-16 h-16 sm:w-20 sm:h-20",
    md: "w-28 h-28 sm:w-36 sm:h-36",
    lg: "w-44 h-44 sm:w-56 sm:h-56",
    hero: "w-[240px] h-[240px] sm:w-[320px] sm:h-[320px] md:w-[380px] md:h-[380px]",
  };

  return (
    <div className={`relative flex items-center justify-center select-none ${className}`}>
      {/* ── 1. Dynamic Ambient Glowing Auras ── */}
      <motion.div
        animate={{
          scale: mood === "celebrating" ? [1, 1.35, 1] : isSpeaking ? [1, 1.12, 1] : [1, 1.05, 1],
          opacity: mood === "celebrating" ? [0.8, 1, 0.8] : [0.4, 0.75, 0.4],
        }}
        transition={{
          duration: mood === "celebrating" ? 0.8 : isSpeaking ? 1.2 : 2.5,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="absolute inset-0 rounded-full blur-3xl pointer-events-none -z-10"
        style={{
          background:
            mood === "celebrating"
              ? "radial-gradient(circle, rgba(168,85,247,0.7) 0%, rgba(236,72,153,0.5) 40%, rgba(0,230,118,0.3) 70%, transparent 90%)"
              : "radial-gradient(circle, rgba(147,51,234,0.55) 0%, rgba(99,102,241,0.35) 50%, transparent 80%)",
        }}
      />

      {/* ── 2. Headset Audio LED Pulse Ring (Syncs with speech & countdown) ── */}
      {(isSpeaking || mood === "celebrating" || activeCount !== null) && (
        <motion.span
          animate={{
            scale: [1, 1.08, 1],
            opacity: [0.6, 0.95, 0.6],
          }}
          transition={{
            duration: activeCount ? 0.5 : 0.8,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute -inset-2.5 sm:-inset-4 rounded-full border-2 sm:border-[3px] border-purple-400/80 blur-xs pointer-events-none"
        />
      )}

      {/* ── 3. Main Avatar Container with Natural Float & Micro-Nods ── */}
      <motion.div
        animate={{
          y: mood === "celebrating" ? [0, -12, 0] : isSpeaking ? [0, -6, 0] : [0, -4, 0],
          rotate: activeCount ? [-1, 1, -1] : [-0.5, 0.5, -0.5],
        }}
        transition={{
          duration: mood === "celebrating" ? 0.9 : isSpeaking ? 1.6 : 3.2,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className={`relative ${sizeClasses[size]} rounded-full overflow-hidden border-4 sm:border-[6px] border-purple-400/90 shadow-[0_16px_60px_rgba(147,51,234,0.45)] bg-[#09090B] flex items-center justify-center`}
      >
        {/* The Official Street Mobile AI Girl Avatar */}
        <img
          src="/streetla.png"
          alt="Street Mobile Official AI Assistant"
          className="w-full h-full object-cover object-center pointer-events-none select-none transition-transform duration-300"
          draggable={false}
        />

        {/* ── 4. Natural Blinking Overlay (Fires every 4 seconds) ── */}
        <motion.div
          animate={{
            opacity: [0, 0, 0.9, 0, 0],
          }}
          transition={{
            duration: 4.2,
            repeat: Infinity,
            times: [0, 0.92, 0.95, 0.98, 1],
            ease: "easeInOut",
          }}
          className="absolute inset-0 pointer-events-none bg-purple-900/10 mix-blend-multiply"
        />

        {/* ── 5. Natural Speaking Lip-Sync Wave Overlay ── */}
        {isSpeaking && (
          <motion.div
            animate={{
              scale: [0.95, 1.05, 0.98, 1.06, 0.95],
              opacity: [0.2, 0.45, 0.25, 0.5, 0.2],
            }}
            transition={{
              duration: 0.35,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="absolute bottom-[28%] left-1/2 -translate-x-1/2 w-12 sm:w-16 h-6 sm:h-8 rounded-full bg-purple-400/25 blur-sm pointer-events-none"
          />
        )}

        {/* ── 6. Live Status Dot in Avatar Frame ── */}
        <div className="absolute bottom-2 right-2 sm:bottom-4 sm:right-4 z-20 flex items-center justify-center">
          <span className="w-4 h-4 sm:w-6 sm:h-6 rounded-full bg-[#00E676] border-2 sm:border-3 border-black shadow-lg flex items-center justify-center">
            <span className="w-full h-full rounded-full bg-[#00E676] animate-ping opacity-75" />
          </span>
        </div>
      </motion.div>
    </div>
  );
});
