"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Eye,
  EyeOff,
  Loader2,
  X,
  Mail,
  Lock,
  User,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { useCart } from "@/lib/cart-context";
import { getPendingPurchaseIntent, executePendingPurchaseIntent } from "@/lib/auth-intent";
import { motion, AnimatePresence } from "framer-motion";
import { auth } from "@/lib/firebase";
import { getAuthSettings } from "@/lib/firestore-client";
import { sendPasswordResetEmail, OAuthProvider, signInWithPopup } from "firebase/auth";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AuthModal({ isOpen, onClose }: AuthModalProps) {
  const router = useRouter();
  const { addToCart } = useCart();
  const { signIn, signUp, signInWithGoogle } = useAuth();

  const [tab, setTab] = useState<"signin" | "signup">("signin");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [googleAuthEnabled, setGoogleAuthEnabled] = useState<boolean>(false);

  // Load cached Auth Settings
  useEffect(() => {
    if (!isOpen) return;
    getAuthSettings().then((settings) => {
      if (settings) {
        setGoogleAuthEnabled(Boolean(settings.googleAuthEnabled));
      }
    }).catch(() => {});
  }, [isOpen]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [logoError, setLogoError] = useState(false);

  // Prevent background body scrolling when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  const resetForm = () => {
    setName("");
    setEmail("");
    setPassword("");
    setConfirm("");
    setError("");
    setSuccess("");
    setShowPassword(false);
    setShowConfirmPassword(false);
  };

  const handleTab = (t: "signin" | "signup") => {
    setTab(t);
    resetForm();
  };

  const handlePostAuth = async () => {
    const pendingIntent = getPendingPurchaseIntent();
    if (pendingIntent) {
      await executePendingPurchaseIntent(pendingIntent, addToCart, router);
    }
    onClose();
    resetForm();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (tab === "signup") {
      if (!name.trim()) return setError("Please enter your full name.");
      if (password !== confirm) return setError("Passwords do not match.");
      if (password.length < 6) return setError("Password must be at least 6 characters.");
    }

    setLoading(true);
    try {
      if (tab === "signin") {
        await signIn(email, password);
        setSuccess("Signed in successfully. Welcome back!");
        setTimeout(() => handlePostAuth(), 400);
      } else {
        await signUp(name, email, password, "male");
        setSuccess("Account created successfully!");
        setTimeout(() => handlePostAuth(), 400);
      }
    } catch (err: any) {
      const code = err?.code || "";
      if (
        code === "auth/user-not-found" ||
        code === "auth/wrong-password" ||
        code === "auth/invalid-credential"
      ) {
        setError("Invalid email or password. Please try again.");
      } else if (code === "auth/email-already-in-use") {
        setError("This email is already registered. Please sign in.");
      } else if (code === "auth/invalid-email") {
        setError("Please enter a valid email address.");
      } else {
        setError(err?.message || "Authentication failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError("");
    setSuccess("");
    setLoading(true);
    try {
      await signInWithGoogle();
      setSuccess("Signed in with Google!");
      setTimeout(() => handlePostAuth(), 400);
    } catch (err: any) {
      console.error(err);
      if (err?.code !== "auth/popup-closed-by-user") {
        setError("Google sign-in could not be completed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!email.trim()) {
      setError("Please enter your email address to reset your password.");
      return;
    }
    try {
      setLoading(true);
      setError("");
      await sendPasswordResetEmail(auth, email.trim());
      setSuccess(`Password reset email sent to ${email.trim()}. Please check your inbox.`);
    } catch (err: any) {
      setError(err?.message || "Failed to send password reset email.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4 overflow-y-auto font-outfit">
          {/* Backdrop */}
          <motion.div
            key="auth-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-md"
          />

          {/* Modal / Bottom Sheet Card */}
          <motion.div
            key="auth-modal-card"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 40 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="relative w-full bg-white rounded-t-[28px] sm:rounded-[28px] px-5 sm:px-8 py-6 shadow-[0_24px_64px_rgba(0,0,0,0.25)] border-t sm:border border-neutral-200 z-10 text-black overflow-y-auto max-h-[92vh] sm:max-h-[calc(100vh-40px)] select-none [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
            style={{
              width: "min(500px, 100vw)",
            }}
          >
            {/* Mobile Sheet Drag Indicator */}
            <div className="sm:hidden w-10 h-1 bg-neutral-300 rounded-full mx-auto mb-4" />

            {/* Header: Logo + Close Button */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                {!logoError ? (
                  <img
                    src="/logo.png"
                    alt="Street Mobile"
                    className="h-7 w-auto object-contain drop-shadow-sm"
                    onError={() => setLogoError(true)}
                  />
                ) : (
                  <span className="font-black text-sm uppercase tracking-widest text-black">
                    STREET MOBILE
                  </span>
                )}
              </div>

              <button
                type="button"
                onClick={onClose}
                aria-label="Close modal"
                className="w-8 h-8 rounded-full bg-neutral-100 hover:bg-neutral-200 text-neutral-600 hover:text-black flex items-center justify-center transition-all cursor-pointer active:scale-95 shrink-0"
              >
                <X className="w-4 h-4 stroke-[2.4]" />
              </button>
            </div>

            {/* Segmented Control Tabs */}
            <div className="grid grid-cols-2 p-1 bg-neutral-100 rounded-2xl mb-4 h-11 items-center border border-neutral-200/60">
              <button
                type="button"
                onClick={() => handleTab("signin")}
                className={`h-9 text-xs sm:text-sm font-bold rounded-xl transition-all flex items-center justify-center cursor-pointer ${
                  tab === "signin"
                    ? "bg-white text-black shadow-xs font-black"
                    : "text-neutral-500 hover:text-black"
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => handleTab("signup")}
                className={`h-9 text-xs sm:text-sm font-bold rounded-xl transition-all flex items-center justify-center cursor-pointer ${
                  tab === "signup"
                    ? "bg-white text-black shadow-xs font-black"
                    : "text-neutral-500 hover:text-black"
                }`}
              >
                Create Account
              </button>
            </div>

            {/* Heading & Subtitle */}
            <div className="mb-4">
              <h2 className="text-xl font-extrabold text-black tracking-tight">
                {tab === "signin" ? "Welcome back 👋" : "Create an account ✨"}
              </h2>
              <p className="text-xs text-neutral-500 font-medium mt-0.5">
                {tab === "signin"
                  ? "Sign in to track your orders, wishlist, and warranty."
                  : "Join Street Mobile for exclusive launch deals and island-wide delivery."}
              </p>
            </div>

            {/* Optional 1-Tap Google Sign-In at Top (Enabled via Admin Panel) */}
            {googleAuthEnabled && (
              <>
                <button
                  type="button"
                  onClick={handleGoogleSignIn}
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-3 h-12 px-4 rounded-2xl bg-white border-2 border-neutral-200 hover:border-black hover:bg-neutral-50 text-neutral-900 font-bold text-sm transition-all active:scale-[0.98] disabled:opacity-60 shadow-xs cursor-pointer mb-3.5"
                >
                  <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    />
                  </svg>
                  <span>Continue with Google</span>
                </button>

                {/* Divider */}
                <div className="relative py-2 flex items-center justify-center mb-3.5">
                  <div className="border-t border-neutral-200 w-full" />
                  <span className="absolute bg-white px-2.5 text-[9.5px] text-neutral-400 font-extrabold uppercase tracking-widest">
                    OR WITH EMAIL
                  </span>
                </div>
              </>
            )}

            {/* Alerts */}
            <AnimatePresence mode="wait">
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  className="mb-3 p-3 bg-red-50 border border-red-200 rounded-2xl text-red-700 text-xs font-semibold flex items-start gap-2"
                >
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-600" />
                  <span>{error}</span>
                </motion.div>
              )}
              {success && (
                <motion.div
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  className="mb-3 p-3 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-700 text-xs font-semibold flex items-start gap-2"
                >
                  <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-emerald-600" />
                  <span>{success}</span>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Form Inputs */}
            <form onSubmit={handleSubmit} className="space-y-3">
              {/* Full Name (Sign Up Only) */}
              {tab === "signup" && (
                <div className="space-y-1">
                  <label className="block text-[10.5px] font-extrabold text-neutral-700 tracking-wider uppercase">
                    Full Name
                  </label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Alex Silva"
                      required
                      className="w-full h-11.5 pl-10 pr-4 bg-neutral-50 focus:bg-white border border-neutral-200 focus:border-black rounded-2xl text-black placeholder:text-neutral-400 text-sm font-medium outline-none focus:ring-4 focus:ring-black/5 transition-all"
                    />
                  </div>
                </div>
              )}

              {/* Email Address */}
              <div className="space-y-1">
                <label className="block text-[10.5px] font-extrabold text-neutral-700 tracking-wider uppercase">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com"
                    required
                    className="w-full h-11.5 pl-10 pr-4 bg-neutral-50 focus:bg-white border border-neutral-200 focus:border-black rounded-2xl text-black placeholder:text-neutral-400 text-sm font-medium outline-none focus:ring-4 focus:ring-black/5 transition-all"
                  />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="block text-[10.5px] font-extrabold text-neutral-700 tracking-wider uppercase">
                    Password
                  </label>
                  {tab === "signin" && (
                    <button
                      type="button"
                      onClick={handleForgotPassword}
                      className="text-xs text-neutral-500 hover:text-black font-bold transition-colors cursor-pointer"
                    >
                      Forgot?
                    </button>
                  )}
                </div>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    required
                    className="w-full h-11.5 pl-10 pr-11 bg-neutral-50 focus:bg-white border border-neutral-200 focus:border-black rounded-2xl text-black placeholder:text-neutral-400 text-sm font-medium outline-none focus:ring-4 focus:ring-black/5 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-black p-1 transition-colors cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Confirm Password (Sign Up Only) */}
              {tab === "signup" && (
                <div className="space-y-1">
                  <label className="block text-[10.5px] font-extrabold text-neutral-700 tracking-wider uppercase">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      value={confirm}
                      onChange={(e) => setConfirm(e.target.value)}
                      placeholder="••••••••••••"
                      required
                      className="w-full h-11.5 pl-10 pr-11 bg-neutral-50 focus:bg-white border border-neutral-200 focus:border-black rounded-2xl text-black placeholder:text-neutral-400 text-sm font-medium outline-none focus:ring-4 focus:ring-black/5 transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      aria-label={showConfirmPassword ? "Hide confirm password" : "Show confirm password"}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-black p-1 transition-colors cursor-pointer"
                    >
                      {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              )}

              {/* Remember Me */}
              {tab === "signin" && (
                <div className="pt-0.5">
                  <label className="flex items-center gap-2 cursor-pointer select-none text-xs text-neutral-600 font-medium">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="w-3.5 h-3.5 rounded border-neutral-300 text-black focus:ring-0 accent-black cursor-pointer"
                    />
                    <span>Keep me signed in</span>
                  </label>
                </div>
              )}

              {/* Primary Action Button */}
              <div className="pt-1">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full h-12 rounded-2xl bg-black hover:bg-neutral-900 text-white font-extrabold text-sm transition-all shadow-md active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>{tab === "signin" ? "Signing In..." : "Creating Account..."}</span>
                    </>
                  ) : (
                    <>
                      <span>{tab === "signin" ? "Sign In" : "Create Account"}</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>

              {/* Bottom Switcher */}
              <p className="text-center text-xs text-neutral-500 pt-2 pb-1">
                {tab === "signin" ? "Don't have an account? " : "Already have an account? "}
                <button
                  type="button"
                  onClick={() => handleTab(tab === "signin" ? "signup" : "signin")}
                  className="text-black font-extrabold underline underline-offset-2 hover:text-neutral-700 cursor-pointer"
                >
                  {tab === "signin" ? "Sign up" : "Sign in"}
                </button>
              </p>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
