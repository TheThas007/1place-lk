"use client";

import { memo, useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Lock, X, ArrowRight, AlertCircle, Eye, EyeOff } from "lucide-react";
import { LaunchCountdownState, PreLaunchExperienceSettings, Review } from "@/lib/types";
import RotatingContentShowcase from "./RotatingContentShowcase";
import { primeAudioAndVoice } from "@/lib/launch/voice-engine";

interface CountdownScreenProps {
  countdown: LaunchCountdownState;
  title?: string;
  tagline?: string;
  glowColor?: string;
  isTestMode?: boolean;
  preLaunchSettings?: PreLaunchExperienceSettings;
  reviews?: Review[];
  galleryImages?: any[];
  onSecretUnlock?: () => void;
}

// Helper to convert any hex color code to rgba
function hexToRgba(hex: string, alpha: number): string {
  if (!hex) return `rgba(196, 226, 245, ${alpha})`;
  let c = hex.replace("#", "").trim();
  if (c.length === 3) {
    c = c[0] + c[0] + c[1] + c[1] + c[2] + c[2];
  }
  const num = parseInt(c, 16);
  if (isNaN(num)) return `rgba(196, 226, 245, ${alpha})`;
  const r = (num >> 16) & 255;
  const g = (num >> 8) & 255;
  const b = num & 255;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

export const CountdownScreen = memo(function CountdownScreen({
  countdown,
  title = "STREET MOBILE",
  tagline = "VAVUNIYA • SRI LANKA",
  glowColor = "#C4E2F5",
  isTestMode = false,
  preLaunchSettings,
  reviews,
  galleryImages,
  onSecretUnlock,
}: CountdownScreenProps) {
  const { days, hours, minutes, seconds } = countdown;

  // Secret Password Modal State (Triggered by clicking "SRI LANKA")
  const [isSecretModalOpen, setIsSecretModalOpen] = useState(false);
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Prime browser audio permissions on first user touch/interaction
  useEffect(() => {
    const unlockAudio = () => {
      primeAudioAndVoice();
    };
    window.addEventListener("pointerdown", unlockAudio, { passive: true, once: true });
    window.addEventListener("click", unlockAudio, { passive: true, once: true });
    window.addEventListener("touchstart", unlockAudio, { passive: true, once: true });
    window.addEventListener("scroll", unlockAudio, { passive: true, once: true });
    return () => {
      window.removeEventListener("pointerdown", unlockAudio);
      window.removeEventListener("click", unlockAudio);
      window.removeEventListener("touchstart", unlockAudio);
      window.removeEventListener("scroll", unlockAudio);
    };
  }, []);

  const timeUnits = [
    { value: days, label: "DAYS" },
    { value: hours, label: "HOURS" },
    { value: minutes, label: "MINUTES" },
    { value: seconds, label: "SECONDS" },
  ];

  const handleSecretSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/admin/validate-preview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: password }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        if (typeof window !== "undefined") {
          sessionStorage.setItem("admin_auth", "true");
          localStorage.setItem("admin_auth", "true");
          document.cookie = "sm_admin_preview=authenticated; path=/; max-age=86400";
        }
        setIsSecretModalOpen(false);
        if (onSecretUnlock) {
          onSecretUnlock();
        }
      } else {
        setError(data.message || "Incorrect password");
      }
    } catch {
      setError("Connection error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 w-screen h-screen z-[9999999] bg-[#FFFFFF] text-[#090909] flex flex-col justify-center items-center px-4 sm:px-6 md:px-10 py-5 sm:py-8 select-none overflow-y-auto overflow-x-hidden font-outfit"
      style={{
        backgroundColor: "#FFFFFF",
      }}
    >
      {/* ── Dynamic Fullscreen Ambient Beat Aura (Spreads across whole screen on each second) ── */}
      <motion.div
        key={`fullscreen-glow-${seconds}`}
        initial={{ opacity: 0.35, scale: 0.8 }}
        animate={{ opacity: [0.35, 0.9, 0.3], scale: [0.8, 1.35, 1.5] }}
        transition={{ duration: 0.95, ease: [0.16, 1, 0.3, 1] }}
        className="fixed inset-0 pointer-events-none -z-10"
        style={{
          background: `radial-gradient(ellipse at center, ${hexToRgba(glowColor, 0.75)} 0%, ${hexToRgba(glowColor, 0.35)} 45%, rgba(255,255,255,0) 75%)`,
        }}
      />
      {/* Permanent Soft Backdrop Mesh */}
      <div
        className="fixed inset-0 pointer-events-none -z-20"
        style={{
          background: `radial-gradient(ellipse 90% 90% at 50% 35%, ${hexToRgba(glowColor, 0.30)} 0%, rgba(255,255,255,0) 80%)`,
        }}
      />

      {/* ── Top Micro-Labels Header (Absolute Top for Perfect Center Alignment) ── */}
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-[1400px] flex items-center justify-between pt-1 px-4 sm:px-8 absolute top-4 sm:top-7 left-0 right-0 mx-auto z-20 pointer-events-auto"
      >
        <div className="flex items-center gap-2.5">
          <div
            className="w-2.5 h-2.5 rounded-full animate-pulse"
            style={{
              backgroundColor: glowColor || "#ED0712",
              boxShadow: `0 0 8px ${hexToRgba(glowColor, 0.8)}`,
            }}
          />
          <span className="text-[11px] sm:text-xs font-bold tracking-[0.25em] text-[#6B7280] uppercase">
            {isTestMode ? "PREVIEW TEST MODE" : "OFFICIAL LAUNCH"}
          </span>
        </div>

        {/* Clickable SRI LANKA trigger for secret admin preview access */}
        <button
          type="button"
          onClick={() => {
            setError("");
            setPassword("");
            setIsSecretModalOpen(true);
          }}
          className="flex items-center gap-1.5 text-[11px] sm:text-xs font-semibold tracking-[0.25em] text-[#6B7280] hover:text-[#090909] uppercase transition-colors cursor-pointer outline-none group"
          title="Sri Lanka"
        >
          <span className="group-hover:tracking-[0.3em] transition-all">SRI LANKA</span>
        </button>
      </motion.div>

      {/* ── Center Container: Bold Branding + Substantial Countdown + Large Showcase (1400px) ── */}
      <div className="w-full max-w-[1400px] flex flex-col items-center justify-center my-auto -translate-y-6 sm:-translate-y-12 md:-translate-y-16 text-center px-2 py-4 sm:py-8 space-y-6 sm:space-y-8">
        {/* ── 1. Official Street Mobile Logo with Beat-Synced Ambient Glow ── */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: -14 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          className="relative flex flex-col items-center justify-center space-y-3 sm:space-y-4 mb-2 sm:mb-4"
        >
          {/* Ambient Glow Heartbeat Effect synced with countdown seconds */}
          <motion.div
            key={`glow-heartbeat-${seconds}-${glowColor}`}
            initial={{ scale: 0.94, opacity: 0.6 }}
            animate={{ scale: [1, 1.4, 1], opacity: [0.6, 1, 0.6] }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[360px] sm:w-[540px] md:w-[680px] h-[150px] sm:h-[220px] blur-3xl rounded-full pointer-events-none -z-10"
            style={{
              background: `radial-gradient(ellipse at center, ${hexToRgba(glowColor, 0.95)} 0%, ${hexToRgba(glowColor, 0.65)} 50%, rgba(255,255,255,0) 80%)`,
              boxShadow: `0 0 90px ${hexToRgba(glowColor, 0.9)}`,
            }}
          />

          {/* Inner Core Pulse */}
          <motion.div
            key={`glow-core-${seconds}-${glowColor}`}
            initial={{ scale: 0.9, opacity: 0.55 }}
            animate={{ scale: [1, 1.25, 1], opacity: [0.55, 1, 0.55] }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[260px] sm:w-[380px] md:w-[500px] h-[90px] sm:h-[130px] blur-2xl rounded-full pointer-events-none -z-10"
            style={{
              backgroundColor: glowColor,
              boxShadow: `0 0 50px ${glowColor}`,
            }}
          />

          {/* Logo with subtle micro-beat on each second */}
          <motion.div
            key={`logo-beat-${seconds}`}
            animate={{ scale: [1, 1.018, 1] }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="relative flex items-center justify-center"
          >
            <img
              src="/logo.png"
              alt={title || "STREET MOBILE"}
              style={{
                filter: `brightness(0) drop-shadow(0 10px 24px ${hexToRgba(glowColor, 0.85)}) drop-shadow(0 2px 8px rgba(0, 0, 0, 0.08))`,
              }}
              className="w-[240px] sm:w-[350px] md:w-[470px] lg:w-[540px] h-auto object-contain mx-auto transition-all select-none relative z-10"
              loading="eager"
            />
          </motion.div>

          <div className="relative z-10 flex items-center justify-center gap-3 pt-0.5">
            <span
              className="h-[1px] w-8 sm:w-16"
              style={{ backgroundColor: hexToRgba(glowColor, 0.85) }}
            />
            <button
              type="button"
              onClick={() => {
                setError("");
                setPassword("");
                setIsSecretModalOpen(true);
              }}
              className="text-[11px] sm:text-xs md:text-sm font-semibold tracking-[0.32em] text-[#6B7280] hover:text-[#090909] uppercase transition-colors cursor-pointer"
            >
              {tagline}
            </button>
            <span
              className="h-[1px] w-8 sm:w-16"
              style={{ backgroundColor: hexToRgba(glowColor, 0.85) }}
            />
          </div>
        </motion.div>

        {/* ── 2. Large Apple-Style Countdown (Visually Dominant & Animated) ── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="w-full max-w-4xl pt-7 sm:pt-12 md:pt-16"
        >
          <div className="flex items-center justify-center gap-2 sm:gap-4 md:gap-6 lg:gap-8">
            {timeUnits.map((unit, index) => (
              <div key={unit.label} className="flex items-center">
                {/* Large Number Box */}
                <div className="flex flex-col items-center">
                  <div
                    className="relative flex items-center justify-center bg-[#FFFFFF] rounded-2xl sm:rounded-3xl px-3.5 py-3.5 sm:px-7 sm:py-6 md:px-9 md:py-7 min-w-[68px] sm:min-w-[110px] md:min-w-[145px] lg:min-w-[160px] overflow-hidden transition-all"
                    style={{
                      border: `1px solid ${hexToRgba(glowColor, 0.45)}`,
                      boxShadow: `0 8px 30px ${hexToRgba(glowColor, 0.18)}`,
                    }}
                  >
                    <AnimatePresence mode="popLayout" initial={false}>
                      <motion.span
                        key={unit.value}
                        initial={{ y: -8, opacity: 0.35, scale: 0.94 }}
                        animate={{ y: 0, opacity: 1, scale: 1 }}
                        exit={{ y: 8, opacity: 0, scale: 0.94 }}
                        transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                        className="font-black tracking-tight text-[#090909] font-mono leading-none tabular-nums inline-block"
                        style={{
                          fontSize: "clamp(1.75rem, 5.5vw, 4.25rem)",
                        }}
                      >
                        {unit.value}
                      </motion.span>
                    </AnimatePresence>
                  </div>

                  {/* Unit Label */}
                  <span className="mt-2 sm:mt-3 text-[9px] sm:text-xs md:text-sm font-bold tracking-[0.25em] sm:tracking-[0.3em] text-[#6B7280] uppercase">
                    {unit.label}
                  </span>
                </div>

                {/* Accent Colon Divider */}
                {index < timeUnits.length - 1 && (
                  <div
                    className="flex flex-col items-center justify-center font-black pb-6 sm:pb-8 px-1 sm:px-2 md:px-3 select-none"
                    style={{
                      fontSize: "clamp(1.25rem, 4vw, 3rem)",
                      color: glowColor || "#ED0712",
                    }}
                  >
                    <motion.span
                      key={`colon-${seconds}`}
                      animate={{ scale: [1, 1.25, 1], opacity: [0.65, 1, 0.65] }}
                      transition={{ duration: 0.5, ease: "easeOut" }}
                      className="inline-block"
                      style={{
                        textShadow: `0 0 12px ${hexToRgba(glowColor, 0.8)}`,
                      }}
                    >
                      :
                    </motion.span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </motion.div>

        {/* ── 3. Large Side-by-Side Showcase (Store Gallery 50% | Google Reviews 50%) ── */}
        <RotatingContentShowcase
          settings={preLaunchSettings}
          reviews={reviews}
          galleryImages={galleryImages}
          freeze={false}
        />
      </div>

      {/* ── Bottom Watermark (Absolute Bottom for Perfect Center Alignment) ── */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 0.4 }}
        className="w-full text-center pb-2 pointer-events-none absolute bottom-4 sm:bottom-6 left-0 right-0 mx-auto z-20"
      >
        <p className="text-[10px] sm:text-xs tracking-[0.35em] text-[#9CA3AF] font-bold uppercase">
          STREET MOBILE (PVT) LTD • PREPARING FOR LAUNCH
        </p>
      </motion.div>

      {/* ── Secret Password Dialog (Triggered on clicking SRI LANKA) ── */}
      <AnimatePresence>
        {isSecretModalOpen && (
          <div className="fixed inset-0 z-[99999999] bg-black/50 backdrop-blur-md flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
              className="bg-[#FFFFFF] text-[#090909] border border-[#E8E8E8] rounded-3xl p-6 sm:p-8 max-w-sm w-full shadow-[0_20px_60px_rgba(0,0,0,0.15)] space-y-5"
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between border-b border-[#E8E8E8] pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-[#090909] flex items-center justify-center text-white">
                    <Lock className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-extrabold tracking-wide uppercase text-[#090909]">Admin Access</h3>
                    <p className="text-[10px] text-[#6B7280] tracking-wider">PREVIEW WEBSITE</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsSecretModalOpen(false)}
                  className="w-8 h-8 rounded-full bg-[#F4F4F5] hover:bg-[#E8E8E8] text-[#6B7280] hover:text-[#090909] flex items-center justify-center transition-all"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Form */}
              <form onSubmit={handleSecretSubmit} className="space-y-4">
                {error && (
                  <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-[#ED0712] text-xs font-semibold">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{error}</span>
                  </div>
                )}

                <div>
                  <label className="block text-[11px] font-bold text-[#6B7280] mb-2 uppercase tracking-wider">
                    Enter Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-4 pr-11 py-3 bg-[#F9FAFB] border border-[#E8E8E8] rounded-xl text-[#090909] font-mono text-sm outline-none focus:border-[#ED0712] focus:ring-1 focus:ring-[#ED0712] transition-all text-center tracking-[0.2em]"
                      required
                      autoFocus
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#6B7280] hover:text-[#090909] transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsSecretModalOpen(false)}
                    className="flex-1 py-3 bg-[#F4F4F5] hover:bg-[#E8E8E8] border border-[#E8E8E8] rounded-xl text-xs font-bold text-[#6B7280] transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 py-3 bg-[#090909] hover:bg-[#27272A] text-white font-extrabold text-xs rounded-xl shadow-md transition-all active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-1.5"
                  >
                    {loading ? (
                      <div className="w-3.5 h-3.5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                    ) : (
                      <>
                        <span>Unlock</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </>
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
});

export default CountdownScreen;
