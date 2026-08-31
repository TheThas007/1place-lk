"use client";

import { useEffect, useState, useRef, useCallback, memo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Volume2, VolumeX, Sparkles, Rocket } from "lucide-react";
import {
  speakLaunchText,
  playCountdownTick,
  playCelebrationFanfare,
  startAmbientAuraMusic,
  stopAmbientAuraMusic,
  setLaunchSoundEnabled,
  getLockedFemaleVoice,
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

/**
 * ─────────────────────────────────────────────────────────────
 * PURE PHASE RESOLVER (CONTRACT 1 & 2)
 * ─────────────────────────────────────────────────────────────
 * Pure deterministic mapping: elapsedMs -> LaunchPhase & countdownNumber
 */
export function phaseResolver(elapsedMs: number): {
  phase: LaunchPhase;
  countdownNumber?: number;
} {
  if (elapsedMs < 8000) {
    return { phase: "WELCOME" };
  }
  if (elapsedMs < 16000) {
    return { phase: "PRODUCTS" };
  }
  if (elapsedMs < 24000) {
    return { phase: "WARRANTY" };
  }
  if (elapsedMs < 33000) {
    return { phase: "SHOWROOM" };
  }
  if (elapsedMs < 40000) {
    return { phase: "BUILDUP" };
  }
  if (elapsedMs < 50000) {
    const n = 10 - Math.floor((elapsedMs - 40000) / 1000);
    return {
      phase: "COUNTDOWN",
      countdownNumber: Math.max(1, Math.min(10, n)),
    };
  }
  return {
    phase: "REVEAL",
  };
}

interface VirtualAssistantLaunchProps {
  totalRemainingSeconds?: number;
  title?: string;
  tagline?: string;
  glowColor?: string;
  onLaunchComplete: () => void;
}

export const VirtualAssistantLaunch = memo(function VirtualAssistantLaunch({
  title = "STREET MOBILE",
  tagline = "VAVUNIYA • SRI LANKA",
  glowColor = "#C4E2F5",
  onLaunchComplete,
}: VirtualAssistantLaunchProps) {
  // Sound state
  const [soundActive, setSoundActive] = useState<boolean>(true);

  // UI Reactive States (Updated ONLY on phase or countdown changes — never 60fps!)
  const [currentPhase, setCurrentPhase] = useState<LaunchPhase>("WELCOME");
  const [activeCountdownNumber, setActiveCountdownNumber] = useState<number | null>(null);
  const [displayedSeconds, setDisplayedSeconds] = useState<number>(50);

  // Content Cards
  const [bubbleTitle, setBubbleTitle] = useState<string>("WELCOME TO STREET MOBILE 👋");
  const [bubbleBody, setBubbleBody] = useState<string>("I'm STREETLA, your virtual shopping assistant.");
  const [bottomSubtitle, setBottomSubtitle] = useState<string>(
    "Welcome to the Grand Launch • Your smarter way to shop for technology ✨"
  );

  // Avatar & Speaking state
  const [mood, setMood] = useState<AssistantMood>("intro");
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);

  // Climax states
  const [isRevealed, setIsRevealed] = useState<boolean>(false);
  const [isGliding, setIsGliding] = useState<boolean>(false);

  // Confetti Canvas Ref
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Master Clock & Guard Refs
  const animFrameIdRef = useRef<number | null>(null);
  const launchStartRef = useRef<number>(0);
  const lastPhaseRef = useRef<LaunchPhase | null>(null);
  const lastCountdownNumberRef = useRef<number | null>(null);
  const revealTriggeredRef = useRef<boolean>(false);

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
    const next = !soundActive;
    setSoundActive(next);
    setLaunchSoundEnabled(next);
    if (next) {
      startAmbientAuraMusic();
    } else {
      stopAmbientAuraMusic();
    }
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

    for (let i = 0; i < 220; i++) {
      particles.push({
        x: canvas.width / 2 + (Math.random() - 0.5) * 320,
        y: canvas.height * 0.38,
        vx: (Math.random() - 0.5) * 28,
        vy: -Math.random() * 26 - 6,
        size: Math.random() * 11 + 6,
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
        p.opacity -= 0.004;

        if (p.opacity > 0 && p.y < canvas.height + 60) {
          alive = true;
          ctx.save();
          ctx.translate(p.x, p.y);
          ctx.rotate((p.rotation * Math.PI) / 180);
          ctx.fillStyle = p.color;
          ctx.globalAlpha = Math.max(0, p.opacity);
          ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.6);
          ctx.restore();
        }
      });

      if (alive) {
        animationFrame = requestAnimationFrame(render);
      }
    };

    render();
  }, []);

  /**
   * ─────────────────────────────────────────────────────────────
   * MASTER CLOCK LOOP (CONTRACT 1, 2, 4, 5)
   * ─────────────────────────────────────────────────────────────
   */
  useEffect(() => {
    // 1. Prime audio, discover locked female voice, start ambient aura music
    primeAudioAndVoice();
    startAmbientAuraMusic();

    // 2. Set authoritative start timestamp
    launchStartRef.current = performance.now();
    lastPhaseRef.current = null;
    lastCountdownNumberRef.current = null;
    revealTriggeredRef.current = false;

    // Countdown words
    const countdownWords: Record<number, string> = {
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

    function frame(now: number) {
      const elapsedMs = now - launchStartRef.current;
      const { phase, countdownNumber } = phaseResolver(elapsedMs);

      // ── Handle Phase Transitions (Guarded by lastPhaseRef) ──
      if (phase !== lastPhaseRef.current) {
        lastPhaseRef.current = phase;
        setCurrentPhase(phase);

        // Phase 1: WELCOME (0s -> 8s)
        if (phase === "WELCOME") {
          setMood("intro");
          setDisplayedSeconds(50);
          setActiveCountdownNumber(null);
          setBubbleTitle("WELCOME TO STREET MOBILE 👋");
          setBubbleBody("I'm STREETLA, your virtual shopping assistant.");
          setBottomSubtitle("Welcome to the Grand Launch • Your smarter way to shop for technology ✨");

          speakLaunchText(
            "Hello everyone! Welcome to Street Mobile! I'm STREETLA, your virtual shopping assistant, and I'm so excited to welcome you all to this very special moment!",
            {
              onStart: () => setIsSpeaking(true),
              onEnd: () => setIsSpeaking(false),
            }
          );
        }

        // Phase 2: PRODUCTS (8s -> 16s)
        else if (phase === "PRODUCTS") {
          setMood("speaking");
          setDisplayedSeconds(42);
          setBubbleTitle("LATEST GENUINE TECH 📱");
          setBubbleBody("Flagship smartphones, premium audio and authentic accessories.");
          setBottomSubtitle("Flagship Smartphones & Accessories • 100% Genuine Quality");

          speakLaunchText(
            "From the latest smartphones and flagship devices, to premium audio and genuine accessories, Street Mobile is bringing amazing technology right here to Vavuniya!",
            {
              onStart: () => setIsSpeaking(true),
              onEnd: () => setIsSpeaking(false),
            }
          );
        }

        // Phase 3: WARRANTY (16s -> 24s)
        else if (phase === "WARRANTY") {
          setMood("speaking");
          setDisplayedSeconds(34);
          setBubbleTitle("WE'RE ALWAYS HERE FOR YOU 🛡️");
          setBubbleBody("Genuine products, official warranty, fast delivery and friendly support.");
          setBottomSubtitle("Genuine Warranty & Express Delivery • We're here for you 💙");

          speakLaunchText(
            "With genuine products, official company warranty, fast delivery, easy payment options, and friendly support, we're here to make your shopping experience simple and worry-free.",
            {
              onStart: () => setIsSpeaking(true),
              onEnd: () => setIsSpeaking(false),
            }
          );
        }

        // Phase 4: SHOWROOM (24s -> 33s)
        else if (phase === "SHOWROOM") {
          setMood("speaking");
          setDisplayedSeconds(26);
          setBubbleTitle("VAVUNIYA → SRI LANKA 🇱🇰");
          setBubbleBody("Visit our flagship showroom or shop online from anywhere in Sri Lanka.");
          setBottomSubtitle("Visit Us or Shop Online • Street Mobile is ready for you");

          speakLaunchText(
            "Whether you're visiting our flagship showroom or shopping with us online from anywhere in Sri Lanka, Street Mobile is ready to serve you!",
            {
              onStart: () => setIsSpeaking(true),
              onEnd: () => setIsSpeaking(false),
            }
          );
        }

        // Phase 5: BUILDUP (33s -> 40s)
        else if (phase === "BUILDUP") {
          setMood("speaking");
          setDisplayedSeconds(17);
          setBubbleTitle("ARE YOU READY? 🚀");
          setBubbleBody("The wait is finally over!");
          setBottomSubtitle("The Wait Is Over • Get Ready For The Grand Reveal 🔥");

          speakLaunchText(
            "We've been waiting for this moment together… and now, the wait is finally over! So everyone, are you ready? Because Street Mobile is about to go live!",
            {
              onStart: () => setIsSpeaking(true),
              onEnd: () => setIsSpeaking(false),
            }
          );
        }

        // Phase 6: COUNTDOWN Entry at exactly 40,000ms
        else if (phase === "COUNTDOWN") {
          // CONTRACT 2: Cancel Phase 5 speech immediately
          if (typeof window !== "undefined" && "speechSynthesis" in window) {
            window.speechSynthesis.cancel();
          }
          setMood("counting");
        }
      }

      // ── Handle Countdown Numbers (40,000ms -> 50,000ms) ──
      if (phase === "COUNTDOWN" && countdownNumber !== undefined) {
        if (countdownNumber !== lastCountdownNumberRef.current) {
          lastCountdownNumberRef.current = countdownNumber;

          // Update React UI state for this single second step
          setActiveCountdownNumber(countdownNumber);
          setDisplayedSeconds(countdownNumber);
          setBubbleTitle(`LAUNCHING IN ${countdownNumber}... 🔥`);
          setBubbleBody(`Get ready! Counting down: ${countdownWords[countdownNumber] || countdownNumber}`);
          setBottomSubtitle(`COUNTING DOWN TOGETHER • LAUNCHING IN ${countdownNumber}...`);

          // Play crystal chime
          playCountdownTick(countdownNumber);

          // Cancel any previous tick speech and speak new number
          if (typeof window !== "undefined" && "speechSynthesis" in window) {
            window.speechSynthesis.cancel();
          }
          speakLaunchText(countdownWords[countdownNumber] || String(countdownNumber), {
            onStart: () => setIsSpeaking(true),
            onEnd: () => setIsSpeaking(false),
          });
        }
      }

      // ── Handle Exact 0s Reveal Trigger (Contract 4 & Section 18) ──
      if (elapsedMs >= 50000 && !revealTriggeredRef.current) {
        revealTriggeredRef.current = true;

        // Cancel countdown speech
        if (typeof window !== "undefined" && "speechSynthesis" in window) {
          window.speechSynthesis.cancel();
        }

        setDisplayedSeconds(0);
        setActiveCountdownNumber(null);
        setMood("celebrating");
        setIsRevealed(true);
        setBubbleTitle("STREET MOBILE IS LIVE! 🚀");
        setBubbleBody("Explore genuine smartphones, gadgets and more.");
        setBottomSubtitle("WE ARE OFFICIALLY LIVE! 🎉 • Welcome to Street Mobile!");

        // Play C-Major fanfare & confetti
        playCelebrationFanfare();
        triggerConfetti();

        // Climax Launch Announcement
        speakLaunchText(
          "And we are officially live! Welcome to the all-new Street Mobile! I'm STREETLA, and I'm always here to help you!",
          {
            onStart: () => setIsSpeaking(true),
            onEnd: () => setIsSpeaking(false),
          }
        );

        // Section 21: STREETLA Chatbot Transformation (4.2 seconds hold, then glide)
        setTimeout(() => {
          setIsGliding(true);
          setMood("transforming");

          setTimeout(() => {
            onLaunchComplete();
          }, 1600);
        }, 4200);
      }

      // Continue master clock loop while active
      if (!revealTriggeredRef.current || elapsedMs < 55000) {
        animFrameIdRef.current = requestAnimationFrame(frame);
      }
    }

    animFrameIdRef.current = requestAnimationFrame(frame);

    // Section 43: Complete Cleanup Contract
    return () => {
      if (animFrameIdRef.current) {
        cancelAnimationFrame(animFrameIdRef.current);
      }
      stopAllAudioAndSpeech();
    };
  }, [onLaunchComplete, triggerConfetti]);

  const padZero = (n: number) => String(Math.max(0, n)).padStart(2, "0");

  return (
    <div
      className="fixed inset-0 w-screen h-screen z-[9999999] bg-[#FFFFFF] text-[#090909] flex flex-col justify-between items-center px-4 sm:px-8 py-5 sm:py-7 select-none overflow-hidden font-outfit"
      style={{ backgroundColor: "#FFFFFF" }}
    >
      {/* Canvas for Full-screen Confetti Explosion */}
      <canvas
        ref={canvasRef}
        className="fixed inset-0 pointer-events-none z-50 w-full h-full"
      />

      {/* ── Dynamic Ambient Glow Mesh (Ice Sky Blue / Glow Color) ── */}
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

      {/* ── Top Header (Section 30) ── */}
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
            OFFICIAL LAUNCH
          </span>
        </div>

        {/* Right Label & Sound Toggle */}
        <div className="flex items-center gap-4">
          <button
            onClick={toggleSound}
            className="px-3 py-1 rounded-full bg-neutral-100 hover:bg-neutral-200 text-[11px] font-bold text-neutral-700 flex items-center gap-1.5 transition-colors cursor-pointer border border-neutral-200"
          >
            {soundActive ? (
              <>
                <Volume2 className="w-3.5 h-3.5 text-purple-600 animate-pulse" />
                <span className="hidden sm:inline">Sound ON</span>
              </>
            ) : (
              <>
                <VolumeX className="w-3.5 h-3.5 text-neutral-400" />
                <span className="hidden sm:inline">Sound OFF</span>
              </>
            )}
          </button>

          <span className="text-[11px] sm:text-xs font-semibold tracking-[0.25em] text-[#6B7280] uppercase">
            SRI LANKA
          </span>
        </div>
      </div>

      {/* ── Middle Top: Street Mobile Logo + Tagline + Countdown Boxes (Section 31 & 32) ── */}
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

        {/* ── 4 Countdown White Boxes (DAYS : HOURS : MINUTES : SECONDS) ── */}
        <div className="flex items-center justify-center gap-2 sm:gap-4 md:gap-6 pt-1 sm:pt-2">
          {[
            { value: "00", label: "DAYS" },
            { value: "00", label: "HOURS" },
            { value: "00", label: "MINUTES" },
            { value: padZero(displayedSeconds), label: "SECONDS" },
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

              {/* Colon divider */}
              {idx < 3 && (
                <div
                  className="font-black text-xl sm:text-3xl px-1 sm:px-2 pb-4 select-none"
                  style={{ color: glowColor || "#C4E2F5" }}
                >
                  :
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* ── Center Stage: Speech Bubble (Left) + STREETLA Avatar (Center) + Waveform (Right) (Section 33) ── */}
      <div className="w-full max-w-6xl flex items-center justify-center relative my-auto py-2 sm:py-4">
        {/* Left: Floating Speech Bubble */}
        <AnimatePresence>
          {!isRevealed && !isGliding && (
            <motion.div
              initial={{ opacity: 0, x: -30, scale: 0.92 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: -20, scale: 0.95 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              className="hidden md:flex flex-col text-left max-w-[280px] lg:max-w-[340px] p-5 rounded-3xl bg-white border border-neutral-200/90 shadow-[0_12px_40px_-8px_rgba(0,0,0,0.12)] relative mr-4 z-20"
            >
              {/* Pointing triangle to STREETLA */}
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

        {/* Center: STREETLA 3D Avatar (Section 35 & 21) */}
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
          transition={{
            duration: 1.4,
            ease: [0.34, 1.56, 0.64, 1],
          }}
          className="relative z-30 flex flex-col items-center"
        >
          <VirtualAssistantLaunchAvatar
            mood={mood}
            isSpeaking={isSpeaking}
            size="hero"
          />

          {/* Section 14: Giant Center Countdown Number Overlay during Countdown */}
          <AnimatePresence mode="wait">
            {activeCountdownNumber !== null && !isRevealed && (
              <motion.div
                key={activeCountdownNumber}
                initial={{ scale: 0.85, opacity: 0, y: 10 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 1.25, opacity: 0 }}
                transition={{ duration: 0.45, ease: "easeOut" }}
                className="absolute inset-0 flex items-center justify-center pointer-events-none z-40"
              >
                <span className="text-8xl sm:text-9xl font-black font-mono tracking-tighter text-white drop-shadow-[0_0_40px_rgba(168,85,247,0.95)] drop-shadow-[0_0_80px_rgba(14,165,233,0.85)]">
                  {activeCountdownNumber}
                </span>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Right: 20-Bar Purple Waveform Card (Section 33 & 34) */}
        <AnimatePresence>
          {!isRevealed && !isGliding && (
            <motion.div
              initial={{ opacity: 0, x: 30, scale: 0.92 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 20, scale: 0.95 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              className="hidden md:flex flex-col items-center justify-center p-4 sm:p-5 rounded-3xl bg-white border border-purple-100 shadow-[0_12px_40px_-8px_rgba(147,51,234,0.14)] ml-4 z-20 min-w-[220px] lg:min-w-[260px]"
            >
              {/* Dynamic 20 Animated Equalizer Bars */}
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

      {/* ── Mobile Speech Bubble (Shown on Small Screens Below STREETLA) ── */}
      <div className="md:hidden w-full max-w-sm px-3 z-30 -mt-2">
        <div className="p-3.5 rounded-2xl bg-white border border-neutral-200/90 shadow-md text-left">
          <h5 className="font-extrabold text-xs text-neutral-950">{bubbleTitle}</h5>
          <p className="text-[11px] text-neutral-700 leading-snug mt-0.5 line-clamp-3">
            {bubbleBody}
          </p>
        </div>
      </div>

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

      {/* ── 0s Official Live Launch Climax Overlay (Section 18 & 20) ── */}
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
