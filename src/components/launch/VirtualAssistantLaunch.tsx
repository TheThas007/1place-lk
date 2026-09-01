"use client";

import { useEffect, useState, useRef, useCallback, memo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Volume2, VolumeX, Sparkles } from "lucide-react";
import {
  playLaunchVoice,
  playCountdownTick,
  playCelebrationFanfare,
  startAmbientAuraMusic,
  stopAmbientAuraMusic,
  setLaunchSoundEnabled,
  primeAudioAndVoice,
  stopAllAudioAndSpeech,
} from "@/lib/launch/voice-engine";
import {
  VirtualAssistantLaunchAvatar,
  AssistantMood,
} from "./VirtualAssistantLaunchAvatar";

export type LaunchPhase =
  | "WELCOME"
  | "PRODUCTS"
  | "WARRANTY"
  | "SHOWROOM"
  | "BUILDUP"
  | "COUNTDOWN"
  | "REVEAL";

interface VirtualAssistantLaunchProps {
  totalRemainingSeconds?: number;
  title?: string;
  tagline?: string;
  glowColor?: string;
  onLaunchComplete: () => void;
}

const COUNTDOWN_WORDS: Record<number, string> = {
  10: "Ten!",
  9: "Nine!",
  8: "Eight!",
  7: "Seven!",
  6: "Six!",
  5: "Five!",
  4: "Four!",
  3: "Three!",
  2: "Two!",
  1: "One!",
};

export const VirtualAssistantLaunch = memo(function VirtualAssistantLaunch({
  totalRemainingSeconds = 60,
  title = "STREET MOBILE",
  tagline = "VAVUNIYA • SRI LANKA",
  glowColor = "#C4E2F5",
  onLaunchComplete,
}: VirtualAssistantLaunchProps) {
  // Master Clock State: Counts down 1 second per second from 60 to 0
  const initialSeconds = Math.max(1, Math.min(60, Number(totalRemainingSeconds) || 60));
  const [secondsLeft, setSecondsLeft] = useState<number>(initialSeconds);

  // Sound state
  const [soundActive, setSoundActive] = useState<boolean>(true);

  // Avatar & Speaking state
  const [mood, setMood] = useState<AssistantMood>("intro");
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);

  // Climax & Reveal states
  const [isRevealed, setIsRevealed] = useState<boolean>(false);
  const [isGliding, setIsGliding] = useState<boolean>(false);
  const [isFlashFlickering, setIsFlashFlickering] = useState<boolean>(false);

  // Confetti Canvas Ref
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const onLaunchCompleteRef = useRef(onLaunchComplete);
  const lastPhaseTriggeredRef = useRef<string>("");
  const lastCountTriggeredRef = useRef<number | null>(null);
  const revealStartedRef = useRef<boolean>(false);

  useEffect(() => {
    onLaunchCompleteRef.current = onLaunchComplete;
  }, [onLaunchComplete]);

  // Helper for hexToRgba
  const hexToRgba = (hex: string, alpha: number) => {
    const cleanHex = hex.replace("#", "");
    const r = parseInt(cleanHex.substring(0, 2), 16) || 196;
    const g = parseInt(cleanHex.substring(2, 4), 16) || 226;
    const b = parseInt(cleanHex.substring(4, 6), 16) || 245;
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  };

  // Sound Toggle Handler
  const toggleSound = useCallback(() => {
    primeAudioAndVoice();
    const next = !soundActive;
    setSoundActive(next);
    setLaunchSoundEnabled(next);
    if (next) {
      startAmbientAuraMusic();
    } else {
      stopAmbientAuraMusic();
    }
  }, [soundActive]);

  // Seamless global user interaction listener to unlock audio & voice anywhere
  useEffect(() => {
    primeAudioAndVoice();
    startAmbientAuraMusic();

    const handleGesture = () => {
      primeAudioAndVoice();
      if (soundActive) {
        startAmbientAuraMusic();
      }
    };
    window.addEventListener("pointerdown", handleGesture, { passive: true });
    window.addEventListener("click", handleGesture, { passive: true });
    window.addEventListener("touchstart", handleGesture, { passive: true });
    window.addEventListener("scroll", handleGesture, { passive: true });
    return () => {
      window.removeEventListener("pointerdown", handleGesture);
      window.removeEventListener("click", handleGesture);
      window.removeEventListener("touchstart", handleGesture);
      window.removeEventListener("scroll", handleGesture);
    };
  }, [soundActive]);

  // Canvas Confetti Particle System for 0s Reveal
  const triggerConfetti = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const particles: Array<{
      x: number;
      y: number;
      vx: number;
      vy: number;
      size: number;
      color: string;
      rotation: number;
      rotSpeed: number;
      opacity: number;
    }> = [];

    const colors = ["#A855F7", "#EC4899", "#00E676", "#38BDF8", "#FBBF24", "#ED0712", "#FFFFFF"];

    for (let i = 0; i < 280; i++) {
      particles.push({
        x: canvas.width / 2 + (Math.random() - 0.5) * 380,
        y: canvas.height * 0.38,
        vx: (Math.random() - 0.5) * 32,
        vy: -Math.random() * 28 - 6,
        size: Math.random() * 12 + 6,
        color: colors[Math.floor(Math.random() * colors.length)],
        rotation: Math.random() * 360,
        rotSpeed: (Math.random() - 0.5) * 14,
        opacity: 1,
      });
    }

    let animationFrame: number;
    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      let alive = false;
      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.45;
        p.vx *= 0.98;
        p.rotation += p.rotSpeed;
        p.opacity -= 0.007;

        if (p.opacity > 0) {
          alive = true;
          ctx.save();
          ctx.translate(p.x, p.y);
          ctx.rotate((p.rotation * Math.PI) / 180);
          ctx.fillStyle = p.color;
          ctx.globalAlpha = Math.max(0, p.opacity);
          ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
          ctx.restore();
        }
      });

      if (alive) {
        animationFrame = requestAnimationFrame(render);
      }
    };

    render();
  }, []);

  // ── MASTER 1-SECOND INTERVAL TIMER ──
  useEffect(() => {
    primeAudioAndVoice();
    startAmbientAuraMusic();

    const interval = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      clearInterval(interval);
      stopAllAudioAndSpeech();
    };
  }, []);

  // Compute Current Phase derived directly from real seconds left
  const currentPhase: LaunchPhase = (() => {
    if (secondsLeft > 50) return "WELCOME";
    if (secondsLeft > 40) return "PRODUCTS";
    if (secondsLeft > 30) return "WARRANTY";
    if (secondsLeft > 20) return "SHOWROOM";
    if (secondsLeft > 10) return "BUILDUP";
    if (secondsLeft > 0) return "COUNTDOWN";
    return "REVEAL";
  })();

  // Trigger Audio & Content on Phase/Seconds Transitions
  useEffect(() => {
    // ── Phase 1: WELCOME (60s -> 51s) ──
    if (currentPhase === "WELCOME") {
      setMood("intro");
      if (lastPhaseTriggeredRef.current !== "WELCOME") {
        lastPhaseTriggeredRef.current = "WELCOME";
        playLaunchVoice(
          "/audio/launch/phase1_welcome.mp3",
          "Hey everyone! Welcome to Street Mobile! I'm Street-lah, your virtual assistant, and we are right near you!",
          {
            onStart: () => setIsSpeaking(true),
            onEnd: () => setIsSpeaking(false),
          }
        );
      }
    }

    // ── Phase 2: PRODUCTS (50s -> 41s) ──
    else if (currentPhase === "PRODUCTS") {
      setMood("speaking");
      if (lastPhaseTriggeredRef.current !== "PRODUCTS") {
        lastPhaseTriggeredRef.current = "PRODUCTS";
        playLaunchVoice(
          "/audio/launch/phase2_products.mp3",
          "Discover latest flagship smartphones, premium audio, and accessories at unbeatable prices!",
          {
            onStart: () => setIsSpeaking(true),
            onEnd: () => setIsSpeaking(false),
          }
        );
      }
    }

    // ── Phase 3: WARRANTY (40s -> 31s) ──
    else if (currentPhase === "WARRANTY") {
      setMood("speaking");
      if (lastPhaseTriggeredRef.current !== "WARRANTY") {
        lastPhaseTriggeredRef.current = "WARRANTY";
        playLaunchVoice(
          "/audio/launch/phase3_warranty.mp3",
          "Every single device comes with official company warranty, fast island-wide delivery, and friendly care!",
          {
            onStart: () => setIsSpeaking(true),
            onEnd: () => setIsSpeaking(false),
          }
        );
      }
    }

    // ── Phase 4: SHOWROOM (30s -> 21s) ──
    else if (currentPhase === "SHOWROOM") {
      setMood("speaking");
      if (lastPhaseTriggeredRef.current !== "SHOWROOM") {
        lastPhaseTriggeredRef.current = "SHOWROOM";
        playLaunchVoice(
          "/audio/launch/phase4_deals.mp3",
          "Enjoy exclusive launch discounts, zero percent installments, and express doorstep delivery!",
          {
            onStart: () => setIsSpeaking(true),
            onEnd: () => setIsSpeaking(false),
          }
        );
      }
    }

    // ── Phase 5: BUILDUP (20s -> 11s) ──
    else if (currentPhase === "BUILDUP") {
      setMood("speaking");
      if (lastPhaseTriggeredRef.current !== "BUILDUP") {
        lastPhaseTriggeredRef.current = "BUILDUP";
        playLaunchVoice(
          "/audio/launch/phase5_buildup.mp3",
          "The wait is over! Get ready as we count down together in 3, 2, 1!",
          {
            onStart: () => setIsSpeaking(true),
            onEnd: () => setIsSpeaking(false),
          }
        );
      }
    }

    // ── Phase 6: COUNTDOWN (10s -> 1s) ──
    else if (currentPhase === "COUNTDOWN") {
      setMood("counting");
      if (lastCountTriggeredRef.current !== secondsLeft) {
        lastCountTriggeredRef.current = secondsLeft;
        playCountdownTick(secondsLeft);
        playLaunchVoice(
          `/audio/launch/count_${secondsLeft}.mp3`,
          COUNTDOWN_WORDS[secondsLeft] || String(secondsLeft),
          {
            onStart: () => setIsSpeaking(true),
            onEnd: () => setIsSpeaking(false),
          }
        );
      }
    }

    // ── Phase 7: REVEAL AT 0s (STREETLA Introduces Herself FULLY Before Website Reveal) ──
    else if (currentPhase === "REVEAL") {
      setMood("celebrating");
      if (!revealStartedRef.current) {
        revealStartedRef.current = true;
        setIsRevealed(true);
        stopAmbientAuraMusic();
        playCelebrationFanfare();
        triggerConfetti();

        // Play full assistant introduction and welcome
        playLaunchVoice(
          "/audio/launch/phase_reveal.mp3",
          "And we are officially live! Welcome to the brand new Street Mobile! I'm STREETLA, your virtual shopping assistant. Whenever you need help finding anything, simply chat with me right at the bottom corner of your screen. Have a wonderful time, and enjoy your shopping!",
          {
            onStart: () => setIsSpeaking(true),
            onEnd: () => {
              setIsSpeaking(false);
              // Wait 2.2 seconds after she COMPLETELY finishes her introduction before starting the reveal transformation!
              setTimeout(() => {
                setIsFlashFlickering(true);
                setIsGliding(true);
                setMood("transforming");

                setTimeout(() => {
                  stopAllAudioAndSpeech();
                  if (onLaunchCompleteRef.current) {
                    onLaunchCompleteRef.current();
                  }
                }, 2000);
              }, 2200);
            },
          }
        );
      }
    }
  }, [currentPhase, secondsLeft, triggerConfetti]);

  // Card Content derived from Current Phase
  const bubbleTitle = (() => {
    switch (currentPhase) {
      case "WELCOME":
        return "WELCOME TO STREET MOBILE 👋";
      case "PRODUCTS":
        return "LATEST GENUINE TECH 📱";
      case "WARRANTY":
        return "OFFICIAL WARRANTY & CARE 🛡️";
      case "SHOWROOM":
        return "EXCLUSIVE LAUNCH DEALS 🎁";
      case "BUILDUP":
        return "ARE YOU READY? 🚀";
      case "COUNTDOWN":
        return `LAUNCHING IN ${secondsLeft}... 🔥`;
      case "REVEAL":
        return "MEET STREETLA, YOUR ASSISTANT 👧✨";
    }
  })();

  const bubbleBody = (() => {
    switch (currentPhase) {
      case "WELCOME":
        return "Hey everyone! I'm STREETLA, your friendly virtual shopping assistant. We are so excited to welcome you to our grand launch!";
      case "PRODUCTS":
        return "Discover flagship smartphones, premium audio, and authentic accessories at unbeatable prices!";
      case "WARRANTY":
        return "100% genuine products with official company warranty, fast island-wide delivery, and friendly care.";
      case "SHOWROOM":
        return "Huge launch discounts, 0% interest installment plans, and express delivery right to your door!";
      case "BUILDUP":
        return "The wait is finally over! Let's count down together in 3, 2, 1!";
      case "COUNTDOWN":
        return `Get ready! Counting down: ${COUNTDOWN_WORDS[secondsLeft] || secondsLeft}`;
      case "REVEAL":
        return "And we are officially live! I'm STREETLA, your virtual shopping assistant. Whenever you need help finding anything, simply chat with me right at the bottom corner. Enjoy your shopping!";
    }
  })();

  const bottomSubtitle = (() => {
    switch (currentPhase) {
      case "WELCOME":
        return "Welcome to the Grand Launch • We are near you ✨";
      case "PRODUCTS":
        return "Flagship Smartphones & Accessories • 100% Genuine Quality";
      case "WARRANTY":
        return "Genuine Warranty & Express Delivery • We are near you 💙";
      case "SHOWROOM":
        return "Exclusive Launch Deals • Express Island-wide Delivery 🚚";
      case "BUILDUP":
        return "The Wait Is Over • Get Ready For The Grand Reveal 🔥";
      case "COUNTDOWN":
        return `COUNTING DOWN TOGETHER • LAUNCHING IN ${secondsLeft}...`;
      case "REVEAL":
        return "WE ARE LIVE! 🎉 • Chat with STREETLA at the bottom corner anytime!";
    }
  })();

  // Format single digit with leading zero
  const padZero = (n: number) => (n < 10 ? `0${n}` : `${n}`);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Street Mobile Virtual AI Assistant Launch Experience"
      className="fixed inset-0 w-screen h-screen z-[9999999] bg-[#FFFFFF] text-[#090909] flex flex-col justify-between items-center px-4 sm:px-8 py-5 sm:py-7 select-none overflow-hidden font-outfit"
      style={{ backgroundColor: "#FFFFFF", touchAction: "none" }}
    >
      {/* Canvas for Full-screen Confetti Explosion */}
      <canvas
        ref={canvasRef}
        className="fixed inset-0 pointer-events-none z-50 w-full h-full"
      />

      {/* ── Cinematic Shutter Flicker & Web Unveil Flash Wave ── */}
      <AnimatePresence>
        {isFlashFlickering && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{
              opacity: [0, 0.98, 0.25, 0.95, 0.35, 0.9, 0],
            }}
            transition={{ duration: 1.4, ease: "easeInOut" }}
            className="fixed inset-0 pointer-events-none z-[99999999] bg-white flex items-center justify-center"
          >
            {/* Center Light Aperture Beam */}
            <motion.div
              initial={{ scale: 0.2, opacity: 0 }}
              animate={{ scale: [0.2, 2.8, 5.0], opacity: [0, 1, 0] }}
              transition={{ duration: 1.2, ease: "easeOut" }}
              className="w-[500px] h-[500px] rounded-full bg-gradient-to-r from-sky-400 via-purple-500 to-pink-500 blur-3xl opacity-80"
            />
            {/* Laser Scanline Sweep */}
            <motion.div
              initial={{ top: "0%", opacity: 0 }}
              animate={{ top: ["0%", "50%", "100%"], opacity: [0, 1, 0] }}
              transition={{ duration: 0.85, ease: "easeInOut" }}
              className="absolute left-0 right-0 h-1.5 bg-gradient-to-r from-transparent via-cyan-400 to-transparent shadow-[0_0_24px_#00E5FF]"
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Dynamic Ambient Glow Mesh ── */}
      <div
        className="fixed inset-0 pointer-events-none -z-10"
        style={{
          background: `radial-gradient(ellipse 90% 90% at 50% 35%, ${hexToRgba(glowColor, 0.35)} 0%, rgba(255,255,255,0) 80%)`,
        }}
      />
      <div
        className="fixed -bottom-32 left-1/2 -translate-x-1/2 w-[700px] h-[400px] rounded-full blur-3xl pointer-events-none -z-10 opacity-30"
        style={{ backgroundColor: glowColor }}
      />

      {/* ── Top Header ── */}
      <div className="w-full max-w-[1400px] flex items-center justify-between z-40">
        <div className="flex items-center gap-2.5">
          <div
            className="w-2.5 h-2.5 rounded-full animate-pulse"
            style={{
              backgroundColor: glowColor || "#0EA5E9",
              boxShadow: `0 0 10px ${hexToRgba(glowColor, 0.8)}`,
            }}
          />
          <span className="text-[11px] sm:text-xs font-bold tracking-[0.25em] text-[#6B7280] uppercase">
            {currentPhase === "REVEAL" ? "GRAND REVEAL LIVE" : "OFFICIAL LAUNCH"}
          </span>
        </div>

        {/* Right: Sound toggle & Location */}
        <div className="flex items-center gap-3 sm:gap-6">
          <button
            onClick={toggleSound}
            className="px-3 py-1.5 rounded-full bg-neutral-100 hover:bg-neutral-200 text-xs font-bold text-neutral-700 flex items-center gap-2 transition-colors cursor-pointer border border-neutral-200 shadow-2xs"
          >
            {soundActive ? (
              <>
                <Volume2 className="w-4 h-4 text-purple-600 animate-pulse" />
                <span className="hidden sm:inline">Sound ON</span>
              </>
            ) : (
              <>
                <VolumeX className="w-4 h-4 text-neutral-400" />
                <span className="hidden sm:inline">Sound OFF</span>
              </>
            )}
          </button>

          <span className="text-[11px] sm:text-xs font-bold tracking-[0.25em] text-[#6B7280] uppercase">
            SRI LANKA
          </span>
        </div>
      </div>

      {/* ── Middle Top: Street Mobile Logo + Tagline + Countdown Boxes ── */}
      <div className="w-full max-w-4xl flex flex-col items-center justify-center text-center space-y-3 sm:space-y-4 pt-1 sm:pt-2">
        {/* Official Street Mobile Logo */}
        <div className="relative flex flex-col items-center justify-center">
          <img
            src="/logo.png"
            alt={title}
            style={{
              filter: `brightness(0) drop-shadow(0 8px 20px ${hexToRgba(glowColor, 0.75)}) drop-shadow(0 2px 6px rgba(0,0,0,0.06))`,
            }}
            className="w-[200px] sm:w-[280px] md:w-[340px] h-auto object-contain mx-auto select-none"
          />
          <p className="text-[9px] sm:text-[11px] md:text-xs font-semibold tracking-[0.32em] text-[#6B7280] uppercase mt-1">
            {tagline}
          </p>
        </div>

        {/* ── 4 Countdown White Boxes (Replaced cleanly by Live Badge during REVEAL) ── */}
        {currentPhase !== "REVEAL" && !isRevealed ? (
          <div className="flex items-center justify-center gap-2 sm:gap-4 md:gap-6 pt-1 sm:pt-2 transition-opacity duration-500">
            {[
              { value: "00", label: "DAYS" },
              { value: "00", label: "HOURS" },
              { value: "00", label: "MINUTES" },
              { value: padZero(secondsLeft), label: "SECONDS" },
            ].map((unit, idx) => (
              <div key={unit.label} className="flex items-center">
                <div className="flex flex-col items-center">
                  <div
                    className="bg-[#FFFFFF] rounded-2xl sm:rounded-3xl px-3.5 py-2.5 sm:px-6 sm:py-4 md:px-8 md:py-5 min-w-[62px] sm:min-w-[90px] md:min-w-[115px] flex items-center justify-center transition-all"
                    style={{
                      border: `1px solid ${hexToRgba(glowColor, 0.55)}`,
                      boxShadow: `0 8px 28px ${hexToRgba(glowColor, 0.22)}`,
                    }}
                  >
                    <span className="font-black text-2xl sm:text-4xl md:text-5xl font-mono text-[#090909] tracking-tight tabular-nums">
                      {unit.value}
                    </span>
                  </div>
                  <span className="mt-1.5 sm:mt-2 text-[8.5px] sm:text-[10.5px] md:text-xs font-bold tracking-[0.25em] text-[#6B7280] uppercase">
                    {unit.label}
                  </span>
                </div>
                {idx < 3 && (
                  <div
                    className="font-mono text-2xl sm:text-4xl font-extrabold text-[#090909] mx-1 sm:mx-2 mb-4"
                    style={{ opacity: 0.35 }}
                  >
                    :
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="pt-2 sm:pt-3 flex flex-col items-center">
            <div className="inline-flex items-center gap-2 px-6 py-2 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-black text-xs sm:text-sm md:text-base uppercase tracking-widest shadow-lg shadow-emerald-500/25">
              <span className="w-2 h-2 rounded-full bg-white animate-ping" />
              <span>WE ARE OFFICIALLY LIVE! 🎉</span>
            </div>
          </div>
        )}
      </div>

      {/* ── Center Stage: Speech Bubble (Left) + STREETLA Avatar (Center) + Waveform (Right) ── */}
      <div className="w-full max-w-6xl flex items-center justify-center relative my-auto py-2 sm:py-4">
        {/* Left: Floating Speech Bubble (Remains fully visible until glide!) */}
        <AnimatePresence>
          {!isGliding && (
            <motion.div
              initial={{ opacity: 0, x: -30, scale: 0.92 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: -20, scale: 0.95 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              className="hidden md:flex flex-col text-left max-w-[280px] lg:max-w-[350px] p-5 rounded-3xl bg-white border border-neutral-200/90 shadow-[0_12px_40px_-8px_rgba(0,0,0,0.12)] relative mr-4 z-20"
            >
              <div className="absolute top-1/2 -right-2.5 -translate-y-1/2 w-0 h-0 border-t-[9px] border-t-transparent border-b-[9px] border-b-transparent border-l-[10px] border-l-white" />

              <h4 className="font-extrabold text-sm sm:text-base text-neutral-950 mb-1">
                {bubbleTitle}
              </h4>
              <p className="text-xs sm:text-[13px] leading-relaxed text-neutral-700 whitespace-pre-line font-medium">
                {bubbleBody}
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Center: STREETLA 3D Avatar */}
        <motion.div
          animate={
            isGliding
              ? {
                  x: typeof window !== "undefined" ? window.innerWidth / 2 - 50 : 300,
                  y: typeof window !== "undefined" ? window.innerHeight / 2 - 50 : 300,
                  scale: 0.28,
                  opacity: [1, 1, 0.9],
                }
              : {
                  x: 0,
                  y: 0,
                  scale: 1,
                  opacity: 1,
                }
          }
          transition={{ duration: 1.8, ease: [0.16, 1, 0.3, 1] }}
          className="relative flex items-center justify-center z-30"
        >
          {/* Avatar Ring Halo */}
          <div
            className="absolute inset-0 rounded-full blur-2xl pointer-events-none scale-125"
            style={{
              background: `radial-gradient(circle, ${hexToRgba(glowColor, 0.70)} 0%, rgba(255,255,255,0) 75%)`,
            }}
          />

          <VirtualAssistantLaunchAvatar
            mood={mood}
            isSpeaking={isSpeaking}
            activeCount={currentPhase === "COUNTDOWN" ? secondsLeft : null}
          />
        </motion.div>

        {/* Right: 20-Bar Purple Waveform Card (Remains fully visible until glide!) */}
        <AnimatePresence>
          {!isGliding && (
            <motion.div
              initial={{ opacity: 0, x: 30, scale: 0.92 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 20, scale: 0.95 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              className="hidden md:flex flex-col items-center justify-center p-4 sm:p-5 rounded-3xl bg-white border border-purple-100 shadow-[0_12px_40px_-8px_rgba(147,51,234,0.14)] ml-4 z-20 min-w-[220px] lg:min-w-[260px]"
            >
              <div className="flex items-center gap-1 h-8 px-3">
                {[4, 12, 22, 16, 28, 14, 26, 20, 32, 18, 24, 12, 30, 16, 22, 14, 8, 16, 24, 10].map(
                  (h, i) => (
                    <motion.span
                      key={i}
                      animate={
                        isSpeaking
                          ? {
                              height: [4, h, 6, h * 0.9, 4],
                              opacity: [0.4, 1, 0.5, 0.9, 0.4],
                            }
                          : { height: 4, opacity: 0.3 }
                      }
                      transition={{
                        duration: 0.45 + (i % 5) * 0.1,
                        repeat: Infinity,
                        ease: "easeInOut",
                      }}
                      className="w-1 rounded-full bg-gradient-to-t from-purple-600 to-indigo-500"
                      style={{ minHeight: "4px" }}
                    />
                  )
                )}
              </div>

              <span className="mt-3 text-[10px] font-extrabold tracking-[0.22em] text-purple-700 uppercase">
                {isSpeaking ? "STREETLA IS SPEAKING..." : "STREETLA READY"}
              </span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── Mobile Speech Bubble (Remains fully visible until glide!) ── */}
      {!isGliding && (
        <div className="md:hidden w-full max-w-sm px-3 z-30 -mt-2">
          <div className="p-3.5 rounded-2xl bg-white border border-neutral-200/90 shadow-md text-left">
            <h5 className="font-extrabold text-xs text-neutral-950">{bubbleTitle}</h5>
            <p className="text-[11px] text-neutral-700 leading-snug mt-0.5 line-clamp-3">
              {bubbleBody}
            </p>
          </div>
        </div>
      )}

      {/* ── Bottom Subtitle Pill Card ── */}
      {!isGliding && (
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-lg mx-auto py-2.5 sm:py-3.5 px-6 rounded-3xl bg-white/90 backdrop-blur-xl border border-neutral-200/80 shadow-[0_8px_30px_rgba(0,0,0,0.06)] text-center z-30"
        >
          <p className="text-xs sm:text-[13px] font-extrabold text-purple-700 leading-tight">
            {bottomSubtitle}
          </p>
        </motion.div>
      )}

      {/* ── 0s Official Live Launch Climax Overlay ── */}
      <AnimatePresence>
        {isRevealed && !isGliding && (
          <motion.div
            initial={{ scale: 0.6, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="fixed inset-0 z-40 flex flex-col items-center justify-center p-4 text-center pointer-events-none bg-white/60 backdrop-blur-xs"
          >
            <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-700 text-xs sm:text-sm font-extrabold uppercase tracking-widest shadow-md">
              <Sparkles className="w-4 h-4 text-emerald-600" />
              STREET MOBILE OFFICIALLY LAUNCHED
            </div>

            <h2 className="text-4xl sm:text-6xl md:text-7xl font-black tracking-tight text-neutral-950 uppercase mt-3 drop-shadow-[0_4px_20px_rgba(0,0,0,0.1)]">
              WE ARE LIVE! 🚀
            </h2>

            <p className="text-xs sm:text-base font-semibold text-neutral-700 max-w-md mx-auto mt-2">
              Welcome to the all-new Street Mobile. I&apos;m STREETLA, and I&apos;m always here to help you!
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
});
