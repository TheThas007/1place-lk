"use client";

import { memo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Lock, X, ArrowRight, AlertCircle, Eye, EyeOff } from "lucide-react";
import { LaunchCountdownState } from "@/lib/types";

interface CountdownScreenProps {
  countdown: LaunchCountdownState;
  title?: string;
  tagline?: string;
  isTestMode?: boolean;
  onSecretUnlock?: () => void;
}

export const CountdownScreen = memo(function CountdownScreen({
  countdown,
  title = "STREET MOBILE",
  tagline = "VAVUNIYA • SRI LANKA",
  isTestMode = false,
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

        {/* Clickable SRI LANKA trigger for secret admin preview access */}
        <button
          type="button"
          onClick={() => {
            setError("");
            setPassword("");
            setIsSecretModalOpen(true);
          }}
          className="flex items-center gap-1.5 text-[10px] sm:text-xs font-semibold tracking-[0.2em] text-[#A1A1AA] hover:text-[#09090B] uppercase transition-colors cursor-pointer outline-none group"
          title="Sri Lanka"
        >
          <span className="group-hover:tracking-[0.25em] transition-all">SRI LANKA</span>
        </button>
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
            <button
              type="button"
              onClick={() => {
                setError("");
                setPassword("");
                setIsSecretModalOpen(true);
              }}
              className="text-[10px] sm:text-xs md:text-sm font-semibold tracking-[0.3em] text-[#71717A] hover:text-[#09090B] uppercase transition-colors cursor-pointer"
            >
              {tagline}
            </button>
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
                  <div className="relative flex items-center justify-center bg-[#F4F4F5] border border-[#E4E4E7] rounded-2xl sm:rounded-3xl shadow-[0_4px_24px_rgba(0,0,0,0.03)] px-3 py-3 sm:px-6 sm:py-6 md:px-8 md:py-8 min-w-[64px] sm:min-w-[96px] md:min-w-[130px] lg:min-w-[150px]">
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

      {/* ── Secret Password Dialog (Triggered on clicking SRI LANKA) ── */}
      <AnimatePresence>
        {isSecretModalOpen && (
          <div className="fixed inset-0 z-[99999999] bg-black/60 backdrop-blur-md flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
              className="bg-[#09090B] text-white border border-white/15 rounded-3xl p-6 sm:p-8 max-w-sm w-full shadow-2xl space-y-5"
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center text-white">
                    <Lock className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-extrabold tracking-wide uppercase">Admin Access</h3>
                    <p className="text-[10px] text-white/50 tracking-wider">PREVIEW WEBSITE</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsSecretModalOpen(false)}
                  className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 text-white/50 hover:text-white flex items-center justify-center transition-all"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Form */}
              <form onSubmit={handleSecretSubmit} className="space-y-4">
                {error && (
                  <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-xs font-semibold">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{error}</span>
                  </div>
                )}

                <div>
                  <label className="block text-[11px] font-bold text-white/70 mb-2 uppercase tracking-wider">
                    Enter Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-4 pr-11 py-3 bg-white/5 border border-white/15 rounded-xl text-white font-mono text-sm outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-all text-center tracking-[0.2em]"
                      required
                      autoFocus
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/40 hover:text-white transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsSecretModalOpen(false)}
                    className="flex-1 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-xs font-bold text-white/70 transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 py-3 bg-white hover:bg-neutral-200 text-black font-extrabold text-xs rounded-xl shadow-lg transition-all active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-1.5"
                  >
                    {loading ? (
                      <div className="w-3.5 h-3.5 border-2 border-black/20 border-t-black rounded-full animate-spin" />
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
