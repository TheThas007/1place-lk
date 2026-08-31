"use client";

import { useEffect, useState, useRef, useCallback } from "react";
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
} from "@/lib/launch/voice-engine";
import {
  VirtualAssistantLaunchAvatar,
  AssistantMood,
} from "./VirtualAssistantLaunchAvatar";

interface VirtualAssistantLaunchProps {
  totalRemainingSeconds?: number;
  title?: string;
  tagline?: string;
  glowColor?: string;
  onLaunchComplete: () => void;
}

export function VirtualAssistantLaunch({
  totalRemainingSeconds = 50,
  title = "STREET MOBILE",
  tagline = "VAVUNIYA • SRI LANKA",
  glowColor = "#C4E2F5",
  onLaunchComplete,
}: VirtualAssistantLaunchProps) {
  // Sound toggle state
  const [soundActive, setSoundActive] = useState<boolean>(true);

  // Synchronized countdown seconds display
  const [displayedSeconds, setDisplayedSeconds] = useState<number>(50);

  // Dialogues & Subtitles matching user uploaded design
  const [speechBubbleTitle, setSpeechBubbleTitle] = useState<string>("Vanakkam everyone! 👋");
  const [speechBubbleBody, setSpeechBubbleBody] = useState<string>(
    "Welcome to Street Mobile!\n\nUngalukkaaga latest smartphones, premium gadgets, and genuine accessories ore idathula kondu vara naanga romba excited-a irukkom!"
  );
  const [bottomPillTop, setBottomPillTop] = useState<string>("Welcome to the Grand Launch!");
  const [bottomPillBottom, setBottomPillBottom] = useState<string>(
    "Bringing genuine devices right to you ✨"
  );

  // Avatar & Visual States
  const [mood, setMood] = useState<AssistantMood>("intro");
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [activeCountNumber, setActiveCountNumber] = useState<number | null>(null);

  // Celebration state
  const [isLiveCelebration, setIsLiveCelebration] = useState<boolean>(false);
  const [isGlidingToBottomRight, setIsGlidingToBottomRight] = useState<boolean>(false);

  // Canvas Confetti Ref
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Helper function to convert hex to rgba
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

  // Canvas Confetti Particle System for 0s Celebration
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
        p.vy += 0.45; // gravity
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

    return () => {
      if (animationFrame) cancelAnimationFrame(animationFrame);
    };
  }, []);

  // ── Master Continuous Audio & Countdown Director (50 Seconds: 40s Speaking + 10s Countdown) ──
  useEffect(() => {
    // Initialize voice and soft ambient aura pad
    getLockedFemaleVoice();
    startAmbientAuraMusic();

    let isCancelled = false;

    // Smooth clock ticker for 50s down to 10s
    let clockSeconds = 50;
    const clockInterval = setInterval(() => {
      if (clockSeconds > 10) {
        clockSeconds -= 1;
        setDisplayedSeconds(clockSeconds);
      }
    }, 1000);

    const runMasterLaunchFlow = async () => {
      // Small tick for browser audio context preparation
      await new Promise((r) => setTimeout(r, 300));
      if (isCancelled) return;

      // ── Phase 1 (50s – 41s): Welcome & Personal Introduction ──
      setMood("intro");
      setSpeechBubbleTitle("Vanakkam everyone! 👋");
      setSpeechBubbleBody(
        "Welcome to Street Mobile!\n\nI'm Street, your virtual shopping assistant, and I am so thrilled to welcome all of you to our grand launch today!"
      );
      setBottomPillTop("Welcome to the Grand Launch!");
      setBottomPillBottom("Bringing genuine devices right to you ✨");

      await speakLaunchText(
        "Vanakkam everyone! Welcome to Street Mobile! I'm Street, your virtual shopping assistant, and I am so thrilled to welcome all of you to our official grand launch today!",
        {
          onStart: () => setIsSpeaking(true),
          onEnd: () => setIsSpeaking(false),
        }
      );

      if (isCancelled) return;

      // ── Phase 2 (40s – 31s): Genuine Smartphones & Vavuniya Flagship Store ──
      setMood("speaking");
      setSpeechBubbleTitle("Latest Genuine Tech 📱");
      setSpeechBubbleBody(
        "Flagship smartphones, amazing gadgets & 100% genuine accessories — right here in Vavuniya and across Sri Lanka!"
      );
      setBottomPillTop("Flagship Smartphones & Gadgets");
      setBottomPillBottom("100% Genuine Quality in Vavuniya & Island-wide 📱");

      await speakLaunchText(
        "Street Mobile is here to bring you the latest genuine smartphones, flagship devices, premium audio, and authentic accessories, right here in Vavuniya and delivered all across Sri Lanka!",
        {
          onStart: () => setIsSpeaking(true),
          onEnd: () => setIsSpeaking(false),
        }
      );

      if (isCancelled) return;

      // ── Phase 3 (30s – 21s): Genuine Warranties & We Are Always Here For You ──
      setMood("speaking");
      setSpeechBubbleTitle("We Are Always Right Here For You! 🛡️");
      setSpeechBubbleBody(
        "100% Genuine Company Warranties, Express Delivery, Easy Installment Plans & 24/7 Smart Assistant Support!"
      );
      setBottomPillTop("Genuine Warranty & Express Delivery");
      setBottomPillBottom("We are always right here for you 💖");

      await speakLaunchText(
        "With 100% genuine company warranties, instant express delivery, easy installment plans, and 24/7 smart assistant support — we are always right here for you!",
        {
          onStart: () => setIsSpeaking(true),
          onEnd: () => setIsSpeaking(false),
        }
      );

      if (isCancelled) return;

      // ── Phase 4 (20s – 12s): Shared Milestone & Excitement ──
      setMood("speaking");
      setSpeechBubbleTitle("The Wait Is Finally Over! ⏳");
      setSpeechBubbleBody(
        "We have all been waiting for this grand moment together, and now... our showroom and online experience are going live!"
      );
      setBottomPillTop("The Wait Is Finally Over!");
      setBottomPillBottom("Get ready for the official grand reveal 🔥");

      await speakLaunchText(
        "We have all been waiting for this very special moment together, and now... the wait is finally over! Our full showroom and online store are about to go live!",
        {
          onStart: () => setIsSpeaking(true),
          onEnd: () => setIsSpeaking(false),
        }
      );

      if (isCancelled) return;

      // ── Phase 5 (11s): The Grand Call to Launch ──
      setMood("speaking");
      setSpeechBubbleTitle("Are You All Ready? 🚀");
      setSpeechBubbleBody("Take a deep breath! Let's count down and launch Street Mobile together in...");
      setBottomPillTop("Are you all ready?");
      setBottomPillBottom("Let's launch Street Mobile in... 🚀");

      await speakLaunchText(
        "So, are you all ready? Take a deep breath! Let's count down and launch Street Mobile together in...",
        {
          onStart: () => setIsSpeaking(true),
          onEnd: () => setIsSpeaking(false),
        }
      );

      if (isCancelled) return;
      clearInterval(clockInterval);

      // ── Phase 6: The 10-Second Grand Countdown (10 -> 1) ──
      setMood("counting");
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

      for (let sec = 10; sec >= 1; sec--) {
        if (isCancelled) return;

        setDisplayedSeconds(sec);
        setActiveCountNumber(sec);
        setSpeechBubbleTitle(`Launching in ${sec} seconds... 🔥`);
        setSpeechBubbleBody(`Get ready! Counting down: ${countdownWords[sec]}`);
        setBottomPillTop("Counting Down Together!");
        setBottomPillBottom(`Launching in ${sec}...`);

        playCountdownTick(sec);

        speakLaunchText(countdownWords[sec], {
          onStart: () => setIsSpeaking(true),
          onEnd: () => setIsSpeaking(false),
        });

        await new Promise((r) => setTimeout(r, 1000));
      }

      if (isCancelled) return;

      // ── Phase 7: 0s - Official Live Launch & Grand Celebration ──
      setDisplayedSeconds(0);
      setActiveCountNumber(null);
      setMood("celebrating");
      setIsLiveCelebration(true);
      setSpeechBubbleTitle("STREET MOBILE IS LIVE! 🚀");
      setSpeechBubbleBody(
        "Welcome to the all-new Street Mobile! Explore genuine smartphones, gadgets & accessories now!"
      );
      setBottomPillTop("WE ARE OFFICIALLY LIVE! 🎉");
      setBottomPillBottom("Welcome to the all-new Street Mobile!");

      playCelebrationFanfare();
      triggerConfetti();

      await speakLaunchText(
        "And... we are officially live! 🎉 Welcome to the all-new Street Mobile! We are always right here for you!",
        {
          onStart: () => setIsSpeaking(true),
          onEnd: () => setIsSpeaking(false),
        }
      );

      if (isCancelled) return;

      // Hold celebration for 3.5s, then glide to bottom-right
      await new Promise((r) => setTimeout(r, 3500));
      if (isCancelled) return;

      setIsGlidingToBottomRight(true);
      setMood("transforming");

      setTimeout(() => {
        onLaunchComplete();
      }, 1600);
    };

    runMasterLaunchFlow();

    return () => {
      isCancelled = true;
      clearInterval(clockInterval);
      stopAmbientAuraMusic();
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
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

      {/* ── Top Micro-Labels Header (Matching User Uploaded Image) ── */}
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

      {/* ── Middle Top: Street Mobile Logo + Tagline + Countdown Boxes ── */}
      <div className="w-full max-w-4xl flex flex-col items-center justify-center text-center space-y-3 sm:space-y-4 pt-1 sm:pt-2">
        {/* Street Mobile Official Logo */}
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

      {/* ── Center Stage: Speech Bubble (Left) + 3D Girl Avatar (Center) + Live Audio Waveform (Right) ── */}
      <div className="w-full max-w-6xl flex items-center justify-center relative my-auto py-2 sm:py-4">
        {/* Left: Floating Speech Bubble */}
        <AnimatePresence>
          {!isLiveCelebration && !isGlidingToBottomRight && (
            <motion.div
              initial={{ opacity: 0, x: -30, scale: 0.92 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: -20, scale: 0.95 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              className="hidden md:flex flex-col text-left max-w-[280px] lg:max-w-[340px] p-5 rounded-3xl bg-white border border-neutral-200/90 shadow-[0_12px_40px_-8px_rgba(0,0,0,0.12)] relative mr-4 z-20"
            >
              {/* Pointing triangle to the avatar */}
              <div className="absolute top-1/2 -right-2.5 -translate-y-1/2 w-0 h-0 border-t-[9px] border-t-transparent border-b-[9px] border-b-transparent border-l-[10px] border-l-white" />

              <h4 className="font-extrabold text-sm sm:text-base text-neutral-950 mb-1">
                {speechBubbleTitle}
              </h4>
              <p className="text-xs sm:text-[13px] leading-relaxed text-neutral-700 whitespace-pre-line font-medium">
                {speechBubbleBody}
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Center: 3D Girl Avatar Character */}
        <motion.div
          animate={
            isGlidingToBottomRight
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
            ease: [0.16, 1, 0.3, 1],
          }}
          className="relative z-30"
        >
          <VirtualAssistantLaunchAvatar
            mood={mood}
            isSpeaking={isSpeaking}
            size="hero"
          />
        </motion.div>

        {/* Right: Floating Purple Audio Waveform Card */}
        <AnimatePresence>
          {!isLiveCelebration && !isGlidingToBottomRight && (
            <motion.div
              initial={{ opacity: 0, x: 30, scale: 0.92 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 20, scale: 0.95 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              className="hidden md:flex flex-col items-center justify-center p-4 sm:p-5 rounded-3xl bg-white border border-purple-100 shadow-[0_12px_40px_-8px_rgba(147,51,234,0.14)] ml-4 z-20 min-w-[220px] lg:min-w-[260px]"
            >
              {/* Dynamic Animated Equalizer Bars */}
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
                {isSpeaking ? "AI ASSISTANT IS SPEAKING..." : "AI ASSISTANT READY"}
              </span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── Mobile Speech Bubble (Shown on Small Screens Below Avatar) ── */}
      <div className="md:hidden w-full max-w-sm px-3 z-30 -mt-2">
        <div className="p-3.5 rounded-2xl bg-white border border-neutral-200/90 shadow-md text-left">
          <h5 className="font-extrabold text-xs text-neutral-950">{speechBubbleTitle}</h5>
          <p className="text-[11px] text-neutral-700 leading-snug mt-0.5 line-clamp-3">
            {speechBubbleBody}
          </p>
        </div>
      </div>

      {/* ── Bottom Subtitle Pill Card (Exact Match to User Uploaded Image) ── */}
      {!isGlidingToBottomRight && (
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md mx-auto py-2.5 sm:py-3.5 px-6 rounded-3xl bg-white/90 backdrop-blur-xl border border-neutral-200/80 shadow-[0_8px_30px_rgba(0,0,0,0.06)] text-center z-30"
        >
          <p className="text-xs sm:text-sm font-semibold text-neutral-800 leading-tight">
            {bottomPillTop}
          </p>
          <p className="text-xs sm:text-[13.5px] font-extrabold text-purple-600 leading-tight mt-0.5">
            {bottomPillBottom}
          </p>
        </motion.div>
      )}

      {/* ── 0s Official Launch Celebration Overlay ── */}
      <AnimatePresence>
        {isLiveCelebration && !isGlidingToBottomRight && (
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
              Welcome to the all-new Street Mobile. We are always right here for you!
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
