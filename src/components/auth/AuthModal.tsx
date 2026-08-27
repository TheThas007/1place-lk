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
} from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { useCart } from "@/lib/cart-context";
import { getPendingPurchaseIntent, executePendingPurchaseIntent } from "@/lib/auth-intent";
import { motion, AnimatePresence } from "framer-motion";
import { auth } from "@/lib/firebase";
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
  const [signupGender, setSignupGender] = useState<"male" | "female">("male");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

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
        await signUp(name, email, password, signupGender);
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
      if (err?.code === "auth/unauthorized-domain") {
        setError("Google sign-in failed: Domain not authorized in Firebase Console.");
      } else if (err?.code === "auth/popup-blocked") {
        setError("Sign-in popup was blocked. Please allow popups and retry.");
      } else if (err?.code !== "auth/popup-closed-by-user") {
        setError("Google sign-in could not be completed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleAppleSignIn = async () => {
    setError("");
    setSuccess("");
    setLoading(true);
    try {
      const provider = new OAuthProvider("apple.com");
      await signInWithPopup(auth, provider);
      setSuccess("Signed in with Apple!");
      setTimeout(() => handlePostAuth(), 400);
    } catch (err: any) {
      console.error(err);
      if (err?.code !== "auth/popup-closed-by-user") {
        setError("Apple sign-in could not be completed. Please use Google or Email.");
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
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-5 overflow-y-auto font-outfit">
          {/* ── 2. BACKDROP: Dark translucent overlay with refined blur ── */}
          <motion.div
            key="auth-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-md"
          />

          {/* ── 1. MODAL CARD: 500px–530px Desktop Width, Clean White Surface, Responsive Max-Height ── */}
          <motion.div
            key="auth-modal-card"
            initial={{ opacity: 0, scale: 0.98, y: 6 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.98, y: 6 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="relative w-full bg-white rounded-[24px] sm:rounded-[28px] px-6 sm:px-8 py-5 sm:py-6 shadow-[0_24px_64px_rgba(0,0,0,0.18)] border border-[#EAEAEA] z-10 text-black overflow-y-auto my-auto select-none [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
            style={{
              width: "min(520px, calc(100vw - 24px))",
              maxHeight: "calc(100vh - 32px)",
            }}
          >
            {/* ── 3. HEADER: Real Street Mobile Shop Logo + Close Button ── */}
            <div className="flex items-center justify-between mb-4 sm:mb-5">
              {/* Real Shop Logo */}
              <div className="flex items-center gap-2.5">
                {!logoError ? (
                  <img
                    src="/logo.png"
                    alt="Street Mobile"
                    className="h-6 sm:h-7 w-auto object-contain"
                    onError={() => setLogoError(true)}
                  />
                ) : (
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-black text-white flex items-center justify-center font-black text-xs">
                      SM
                    </div>
                    <div className="flex flex-col">
                      <span className="text-xs font-black tracking-[0.16em] uppercase text-black leading-none">
                        STREET
                      </span>
                      <span className="text-[9px] font-bold tracking-[0.14em] uppercase text-neutral-400 leading-tight">
                        MOBILE .LK
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Minimal Circular Close Button */}
              <button
                type="button"
                onClick={onClose}
                aria-label="Close modal"
                className="w-8 h-8 rounded-full bg-[#F5F5F5] hover:bg-[#EAEAEA] text-neutral-600 hover:text-black flex items-center justify-center transition-all duration-200 cursor-pointer active:scale-95 shrink-0"
              >
                <X className="w-4 h-4 stroke-[2.4]" />
              </button>
            </div>

            {/* ── 4. SEGMENTED CONTROL TABS: 44px Height ── */}
            <div className="grid grid-cols-2 p-1 bg-[#F5F5F5] rounded-[12px] mb-4 sm:mb-5 h-[44px] items-center">
              <button
                type="button"
                onClick={() => handleTab("signin")}
                className={`h-[36px] text-xs sm:text-sm font-semibold rounded-[9px] transition-all duration-200 text-center cursor-pointer flex items-center justify-center ${
                  tab === "signin"
                    ? "bg-white text-black font-bold shadow-[0_2px_8px_rgba(0,0,0,0.06)]"
                    : "text-neutral-500 hover:text-black"
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => handleTab("signup")}
                className={`h-[36px] text-xs sm:text-sm font-semibold rounded-[9px] transition-all duration-200 text-center cursor-pointer flex items-center justify-center ${
                  tab === "signup"
                    ? "bg-white text-black font-bold shadow-[0_2px_8px_rgba(0,0,0,0.06)]"
                    : "text-neutral-500 hover:text-black"
                }`}
              >
                Create Account
              </button>
            </div>

            {/* ── 6. WELCOME HEADING & DESCRIPTION ── */}
            <div className="mb-4 sm:mb-5 space-y-1">
              <h2 className="text-2xl sm:text-[26px] font-bold tracking-tight text-black leading-tight">
                {tab === "signin" ? "Welcome back" : "Create an account"}
              </h2>
              <p className="text-xs sm:text-[13px] text-neutral-500 leading-snug font-normal">
                {tab === "signin"
                  ? "Sign in to track orders, manage your wishlist & profile."
                  : "Join Street Mobile for genuine devices, order tracking & fast checkout."}
              </p>
            </div>

            {/* ── ERROR & SUCCESS ALERTS ── */}
            <AnimatePresence mode="wait">
              {error && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mb-3.5 flex items-start gap-2.5 p-2.5 bg-[#FAFAFA] border border-neutral-300 rounded-[12px] text-black text-xs font-semibold"
                >
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-black" />
                  <span>{error}</span>
                </motion.div>
              )}
              {success && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mb-3.5 flex items-start gap-2.5 p-2.5 bg-[#FAFAFA] border border-black rounded-[12px] text-black text-xs font-semibold"
                >
                  <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-black" />
                  <span>{success}</span>
                </motion.div>
              )}
            </AnimatePresence>

            {/* ── 7. FORM INPUTS: Compact Rhythm (12–14px Gap) ── */}
            <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-3.5">
              {/* Full Name Input (Sign Up Only) */}
              {tab === "signup" && (
                <>
                  <div className="space-y-1">
                    <label className="block text-[11px] font-bold text-neutral-700 tracking-wide uppercase">
                      Full Name
                    </label>
                    <div className="relative">
                      <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400 stroke-[1.8]" />
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="e.g. Alex Silva"
                        required
                        className="w-full h-[48px] sm:h-[50px] pl-10 pr-4 bg-white border border-[#E5E5E5] focus:border-black rounded-[12px] text-black placeholder:text-[#999999] text-sm font-medium outline-none focus:ring-4 focus:ring-black/5 transition-all"
                      />
                    </div>
                  </div>
                </>
              )}

              {/* Email Address Input */}
              <div className="space-y-1">
                <label className="block text-[11px] font-bold text-neutral-700 tracking-wide uppercase">
                  Email address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400 stroke-[1.8]" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com"
                    required
                    className="w-full h-[48px] sm:h-[50px] pl-10 pr-4 bg-white border border-[#E5E5E5] focus:border-black rounded-[12px] text-black placeholder:text-[#999999] text-sm font-medium outline-none focus:ring-4 focus:ring-black/5 transition-all"
                  />
                </div>
              </div>

              {/* Password Input */}
              <div className="space-y-1">
                <label className="block text-[11px] font-bold text-neutral-700 tracking-wide uppercase">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400 stroke-[1.8]" />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    required
                    className="w-full h-[48px] sm:h-[50px] pl-10 pr-11 bg-white border border-[#E5E5E5] focus:border-black rounded-[12px] text-black placeholder:text-[#999999] text-sm font-medium outline-none focus:ring-4 focus:ring-black/5 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-black p-1 rounded-md transition-colors cursor-pointer"
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4 stroke-[1.8]" />
                    ) : (
                      <Eye className="w-4 h-4 stroke-[1.8]" />
                    )}
                  </button>
                </div>
              </div>

              {/* Confirm Password (Sign Up Only) */}
              {tab === "signup" && (
                <div className="space-y-1">
                  <label className="block text-[11px] font-bold text-neutral-700 tracking-wide uppercase">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400 stroke-[1.8]" />
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      value={confirm}
                      onChange={(e) => setConfirm(e.target.value)}
                      placeholder="••••••••••••"
                      required
                      className="w-full h-[48px] sm:h-[50px] pl-10 pr-11 bg-white border border-[#E5E5E5] focus:border-black rounded-[12px] text-black placeholder:text-[#999999] text-sm font-medium outline-none focus:ring-4 focus:ring-black/5 transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      aria-label={showConfirmPassword ? "Hide confirm password" : "Show confirm password"}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-black p-1 rounded-md transition-colors cursor-pointer"
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="w-4 h-4 stroke-[1.8]" />
                      ) : (
                        <Eye className="w-4 h-4 stroke-[1.8]" />
                      )}
                    </button>
                  </div>
                </div>
              )}

              {/* ── 8. REMEMBER / FORGOT ROW (Sign In Only) ── */}
              {tab === "signin" && (
                <div className="flex items-center justify-between pt-0.5 text-xs">
                  <label className="flex items-center gap-2 cursor-pointer select-none text-neutral-500 hover:text-black transition-colors font-medium">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="w-3.5 h-3.5 rounded border-neutral-300 text-black focus:ring-0 accent-black cursor-pointer"
                    />
                    <span>Remember me</span>
                  </label>

                  <button
                    type="button"
                    onClick={handleForgotPassword}
                    className="text-neutral-500 hover:text-black font-semibold hover:underline underline-offset-2 transition-colors cursor-pointer"
                  >
                    Forgot password?
                  </button>
                </div>
              )}

              {/* ── 9. PRIMARY CTA BUTTON: 50px Height ── */}
              <div className="pt-1.5">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full h-[48px] sm:h-[50px] rounded-[12px] bg-black hover:bg-neutral-900 text-white font-bold text-sm tracking-wide transition-all shadow-sm hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-between px-5 cursor-pointer"
                >
                  {loading ? (
                    <div className="w-full flex items-center justify-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin text-white" />
                      <span>{tab === "signin" ? "Signing In..." : "Creating Account..."}</span>
                    </div>
                  ) : (
                    <>
                      <span>{tab === "signin" ? "Sign In" : "Create Account"}</span>
                      <ArrowRight className="w-4 h-4 stroke-[2.5]" />
                    </>
                  )}
                </button>
              </div>

              {/* ── 11. DIVIDER (──────── OR CONTINUE WITH ────────) ── */}
              <div className="relative py-2 flex items-center justify-center">
                <div className="border-t border-[#EAEAEA] w-full" />
                <span className="absolute bg-white px-3 text-[10px] text-neutral-400 font-bold uppercase tracking-[0.18em]">
                  OR CONTINUE WITH
                </span>
              </div>

              {/* ── 10. SOCIAL LOGIN: FULL-WIDTH STACKED BUTTONS (48px Height, 8-10px Gap) ── */}
              <div className="space-y-2">
                {/* Google Sign-in Button */}
                <button
                  type="button"
                  onClick={handleGoogleSignIn}
                  disabled={loading}
                  className="w-full h-[46px] sm:h-[48px] rounded-[12px] border border-[#E5E5E5] hover:border-neutral-300 bg-white hover:bg-[#F7F7F7] text-black font-semibold text-xs sm:text-sm flex items-center justify-center gap-2.5 transition-all duration-180 active:scale-[0.99] disabled:opacity-60 cursor-pointer"
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

                {/* Apple Sign-in Button */}
                <button
                  type="button"
                  onClick={handleAppleSignIn}
                  disabled={loading}
                  className="w-full h-[46px] sm:h-[48px] rounded-[12px] border border-[#E5E5E5] hover:border-neutral-300 bg-white hover:bg-[#F7F7F7] text-black font-semibold text-xs sm:text-sm flex items-center justify-center gap-2.5 transition-all duration-180 active:scale-[0.99] disabled:opacity-60 cursor-pointer"
                >
                  <svg className="w-4 h-4 shrink-0 fill-current text-black" viewBox="0 0 24 24">
                    <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.85c.66-.8 1.11-1.92.99-3.04-1 .04-2.15.65-2.83 1.45-.6.68-1.12 1.81-1 2.91 1.11.09 2.18-.52 2.84-1.32z" />
                  </svg>
                  <span>Continue with Apple</span>
                </button>
              </div>

              {/* ── 12. BOTTOM SWITCHER ── */}
              <p className="text-center text-xs sm:text-[13px] text-neutral-500 pt-2">
                {tab === "signin" ? (
                  <>
                    Don&apos;t have an account?{" "}
                    <button
                      type="button"
                      onClick={() => handleTab("signup")}
                      className="text-black font-bold hover:underline underline-offset-4 cursor-pointer ml-1"
                    >
                      Sign up
                    </button>
                  </>
                ) : (
                  <>
                    Already have an account?{" "}
                    <button
                      type="button"
                      onClick={() => handleTab("signin")}
                      className="text-black font-bold hover:underline underline-offset-4 cursor-pointer ml-1"
                    >
                      Sign in
                    </button>
                  </>
                )}
              </p>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
