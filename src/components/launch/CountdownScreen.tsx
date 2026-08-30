"use client";

import { memo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Lock, X, ArrowRight, AlertCircle, Eye, EyeOff } from "lucide-react";
import { LaunchCountdownState, PreLaunchExperienceSettings, Review } from "@/lib/types";
import RotatingContentShowcase from "./RotatingContentShowcase";

interface CountdownScreenProps {
  countdown: LaunchCountdownState;
  title?: string;
  tagline?: string;
  isTestMode?: boolean;
  preLaunchSettings?: PreLaunchExperienceSettings;
  reviews?: Review[];
  galleryImages?: any[];
  onSecretUnlock?: () => void;
}

export const CountdownScreen = memo(function CountdownScreen({
  countdown,
  title = "STREET MOBILE",
  tagline = "VAVUNIYA • SRI LANKA",
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
      className="fixed inset-0 w-screen h-screen z-[9999999] bg-[#FFFFFF] text-[#090909] flex flex-col justify-between items-center px-4 sm:px-6 md:px-10 py-5 sm:py-8 select-none overflow-y-auto overflow-x-hidden font-outfit"
      style={{
        backgroundColor: "#FFFFFF",
      }}
    >
      {/* ── Top Micro-Labels Header (Max Width 1400px) ── */}
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-[1400px] flex items-center justify-between pt-1 px-2 sm:px-4 shrink-0"
      >
        <div className="flex items-center gap-2.5">
          <div className="w-2.5 h-2.5 rounded-full bg-[#ED0712] animate-pulse" />
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
      <div className="w-full max-w-[1400px] flex flex-col items-center justify-center my-auto text-center px-2 py-4 sm:py-6 space-y-6 sm:space-y-8">
        {/* ── 1. Official Street Mobile Logo ── */}
        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.9, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          className="flex flex-col items-center justify-center space-y-2 sm:space-y-3"
        >
          <div className="relative flex items-center justify-center">
            <img
              src="/logo.png"
              alt={title || "STREET MOBILE"}
              className="h-12 sm:h-16 md:h-20 lg:h-24 w-auto max-w-[320px] sm:max-w-[420px] md:max-w-[520px] object-contain mx-auto transition-all"
              loading="eager"
            />
          </div>

          <div className="flex items-center justify-center gap-3 pt-1">
            <span className="h-[1px] w-8 sm:w-14 bg-[#E8E8E8]" />
            <button
              type="button"
              onClick={() => {
                setError("");
                setPassword("");
                setIsSecretModalOpen(true);
              }}
              className="text-[10px] sm:text-xs md:text-sm font-semibold tracking-[0.32em] text-[#6B7280] hover:text-[#090909] uppercase transition-colors cursor-pointer"
            >
              {tagline}
            </button>
            <span className="h-[1px] w-8 sm:w-14 bg-[#E8E8E8]" />
          </div>
        </motion.div>

        {/* ── 2. Large Apple-Style Countdown (Visually Dominant) ── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="w-full max-w-4xl"
        >
          <div className="flex items-center justify-center gap-2 sm:gap-4 md:gap-6 lg:gap-8">
            {timeUnits.map((unit, index) => (
              <div key={unit.label} className="flex items-center">
                {/* Large Number Box */}
                <div className="flex flex-col items-center">
                  <div
                    className="relative flex items-center justify-center bg-[#FFFFFF] border border-[#E8E8E8] rounded-2xl sm:rounded-3xl shadow-[0_6px_28px_rgba(0,0,0,0.04)] px-3.5 py-3.5 sm:px-7 sm:py-6 md:px-9 md:py-7 min-w-[68px] sm:min-w-[110px] md:min-w-[145px] lg:min-w-[160px]"
                  >
                    <span
                      className="font-black tracking-tight text-[#090909] font-mono leading-none tabular-nums"
                      style={{
                        fontSize: "clamp(1.75rem, 5.5vw, 4.25rem)",
                      }}
                    >
                      {unit.value}
                    </span>
                  </div>

                  {/* Unit Label */}
                  <span className="mt-2 sm:mt-3 text-[9px] sm:text-xs md:text-sm font-bold tracking-[0.25em] sm:tracking-[0.3em] text-[#6B7280] uppercase">
                    {unit.label}
                  </span>
                </div>

                {/* Red Accent Colon Divider */}
                {index < timeUnits.length - 1 && (
                  <div
                    className="flex flex-col items-center justify-center font-black text-[#ED0712] pb-6 sm:pb-8 px-1 sm:px-2 md:px-3 select-none"
                    style={{
                      fontSize: "clamp(1.25rem, 4vw, 3rem)",
                    }}
                  >
                    <span className="animate-pulse">:</span>
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

      {/* ── Bottom Watermark (Apple Minimal Hierarchy) ── */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 0.4 }}
        className="w-full text-center pb-2 shrink-0 pointer-events-none mt-4"
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
