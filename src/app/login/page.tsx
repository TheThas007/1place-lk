"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  Eye,
  EyeOff,
  Loader2,
  AlertCircle,
  CheckCircle2,
  ArrowRight,
  User as UserIcon,
  Mail,
  Lock,
  ArrowLeft,
  ShieldCheck,
  Truck,
  RotateCcw,
} from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { useCart } from "@/lib/cart-context";
import { auth } from "@/lib/firebase";
import { getAuthSettings } from "@/lib/firestore-client";
import {
  getPendingPurchaseIntent,
  executePendingPurchaseIntent,
  sanitizeReturnUrl,
} from "@/lib/auth-intent";
import { motion, AnimatePresence } from "framer-motion";

function LoginFormContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { signIn, signUp, signInWithGoogle, signInWithApple, user } = useAuth();
  const { addToCart } = useCart();

  const redirectParam = searchParams.get("redirect");

  const [tab, setTab] = useState<"signin" | "signup">("signin");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [googleAuthEnabled, setGoogleAuthEnabled] = useState<boolean>(true);
  const [appleAuthEnabled, setAppleAuthEnabled] = useState<boolean>(true);

  // Load cached Auth Settings
  useEffect(() => {
    getAuthSettings()
      .then((settings) => {
        if (settings) {
          setGoogleAuthEnabled(settings.googleAuthEnabled !== false);
          setAppleAuthEnabled(settings.appleAuthEnabled !== false);
        }
      })
      .catch(() => {});
  }, []);

  // If already authenticated, execute pending intent or redirect
  useEffect(() => {
    if (user) {
      const intent = getPendingPurchaseIntent();
      if (intent) {
        executePendingPurchaseIntent(intent, addToCart, router);
      } else if (redirectParam) {
        const safeUrl = sanitizeReturnUrl(redirectParam, "/");
        router.push(safeUrl);
      }
    }
  }, [user, redirectParam, addToCart, router]);

  const resetForm = () => {
    setName("");
    setEmail("");
    setPassword("");
    setConfirm("");
    setError("");
    setSuccess("");
    setShowPassword(false);
  };

  const handleTab = (t: "signin" | "signup") => {
    setTab(t);
    resetForm();
  };

  const handlePostAuthRedirect = async () => {
    const pendingIntent = getPendingPurchaseIntent();
    if (pendingIntent) {
      const res = await executePendingPurchaseIntent(pendingIntent, addToCart, router);
      if (!res.success && res.message) {
        setError(res.message);
        const safeUrl = sanitizeReturnUrl(redirectParam, "/products");
        setTimeout(() => router.push(safeUrl), 1500);
      }
    } else if (redirectParam) {
      const safeUrl = sanitizeReturnUrl(redirectParam, "/");
      router.push(safeUrl);
    } else {
      router.push("/");
    }
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
        setSuccess("Signed in successfully!");
        setTimeout(() => handlePostAuthRedirect(), 400);
      } else {
        await signUp(name, email, password, "male");
        setSuccess("Account created successfully!");
        setTimeout(() => handlePostAuthRedirect(), 400);
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
      } else if (code === "auth/weak-password") {
        setError("Password should be at least 6 characters.");
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
      setTimeout(() => handlePostAuthRedirect(), 400);
    } catch (err: any) {
      console.error(err);
      if (err?.code === "auth/unauthorized-domain") {
        setError("Google sign-in failed: Domain not authorized in Firebase Console.");
      } else if (err?.code === "auth/popup-blocked") {
        setError("Sign-in popup was blocked. Please allow popups and retry.");
      } else if (err?.code !== "auth/popup-closed-by-user") {
        setError(err?.message || "Google sign-in could not be completed. Please try again.");
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
      await signInWithApple();
      setSuccess("Signed in with Apple!");
      setTimeout(() => handlePostAuthRedirect(), 400);
    } catch (err: any) {
      console.error(err);
      if (err?.code === "auth/unauthorized-domain") {
        setError("Apple sign-in failed: Domain not authorized in Firebase Console.");
      } else if (err?.code === "auth/popup-blocked") {
        setError("Sign-in popup was blocked. Please allow popups and retry.");
      } else if (err?.code === "auth/operation-not-allowed") {
        setError("Apple sign-in is not enabled yet in Firebase Console. Please sign in with email or Google.");
      } else if (err?.code !== "auth/popup-closed-by-user") {
        setError(err?.message || "Apple sign-in could not be completed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!email.trim()) {
      setError("Please enter your email address first, then click Forgot Password.");
      return;
    }
    setError("");
    setResetLoading(true);
    try {
      const { sendPasswordResetEmail } = await import("firebase/auth");
      await sendPasswordResetEmail(auth, email.trim());
      setSuccess(`Password reset email sent to ${email.trim()}. Check your inbox.`);
    } catch (err: any) {
      if (err?.code === "auth/user-not-found") {
        setError("No registered account found with this email address.");
      } else if (err?.code === "auth/invalid-email") {
        setError("Please enter a valid email address.");
      } else {
        setError(err?.message || "Failed to send reset email. Please try again.");
      }
    } finally {
      setResetLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#EAEAEA] sm:bg-[#ECECEC] flex flex-col justify-between items-center selection:bg-[#64152F] selection:text-white font-sans px-3 py-4 sm:px-6 sm:py-8">
      {/* ── Top Bar with Back Link ── */}
      <div className="w-full max-w-5xl flex items-center justify-between py-2 px-2 shrink-0">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-neutral-600 hover:text-black transition-colors group"
        >
          <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
          <span>Back to 1place.lk</span>
        </Link>
        <div className="flex items-center gap-1.5 text-xs text-neutral-500 font-bold uppercase tracking-wider">
          <ShieldCheck className="w-4 h-4 text-[#64152F]" />
          <span>100% Genuine Care &amp; Warranty</span>
        </div>
      </div>

      {/* ── Main Dual-Tone Authentication Card ── */}
      <div className="w-full max-w-5xl bg-white rounded-[28px] sm:rounded-[36px] border border-neutral-200/90 shadow-[0_20px_60px_rgba(0,0,0,0.12)] overflow-hidden my-auto grid grid-cols-1 lg:grid-cols-12">
        {/* ══════════════════════════════════════════════════════
            DESKTOP LUXURY BURGUNDY BRAND LEFT PANEL (>= 1024px)
           ══════════════════════════════════════════════════════ */}
        <div className="hidden lg:flex lg:col-span-5 bg-gradient-to-br from-[#120207] via-[#2A0510] to-[#500A1F] text-white p-9 lg:p-11 flex-col justify-between relative overflow-hidden">
          {/* Subtle glowing ambient wave curves */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            <div className="absolute -top-24 -left-24 w-80 h-80 bg-[#8B1D41]/30 rounded-full blur-[90px]" />
            <div className="absolute -bottom-24 -right-24 w-80 h-80 bg-[#64152F]/40 rounded-full blur-[90px]" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(161,27,69,0.3),transparent_65%)]" />
            <svg
              className="absolute inset-0 w-full h-full opacity-20 pointer-events-none"
              preserveAspectRatio="none"
              viewBox="0 0 400 600"
            >
              <path d="M0,220 C140,290 260,160 400,340 L400,600 L0,600 Z" fill="url(#brandGrad)" />
              <defs>
                <linearGradient id="brandGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#A11B45" stopOpacity="0.5" />
                  <stop offset="100%" stopColor="#350713" stopOpacity="0" />
                </linearGradient>
              </defs>
            </svg>
          </div>

          {/* Top: Official Stacked ONEPLACE Logo */}
          <div className="relative z-10">
            <Link href="/" className="inline-block group">
              <img
                src="/logo-original.png"
                alt="ONEPLACE.LK"
                className="h-20 w-auto object-contain drop-shadow-md transition-transform group-hover:scale-105"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = "/logo.png";
                }}
              />
            </Link>
          </div>

          {/* Middle: Headline & Three Key Trust Highlights */}
          <div className="relative z-10 my-auto py-8">
            <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white leading-tight">
              Welcome <br />
              <span className="text-[#B91C47] drop-shadow-sm">Back</span>
            </h1>
            <p className="mt-3 text-xs sm:text-sm text-neutral-300 font-medium leading-relaxed max-w-xs">
              Sign in to continue your shopping experience at 1place.lk.
            </p>

            {/* Three Value Proposition Items */}
            <div className="mt-8 space-y-4">
              {/* Item 1: Free Delivery */}
              <div className="flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-full bg-white/[0.08] border border-white/10 flex items-center justify-center shrink-0 text-white shadow-xs">
                  <Truck className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs sm:text-sm font-bold text-white">Free Delivery</h4>
                  <p className="text-[11px] text-neutral-400">for orders over LKR 5,000</p>
                </div>
              </div>

              {/* Item 2: 100% Authentic Products */}
              <div className="flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-full bg-white/[0.08] border border-white/10 flex items-center justify-center shrink-0 text-white shadow-xs">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs sm:text-sm font-bold text-white">100% Authentic Products</h4>
                  <p className="text-[11px] text-neutral-400">Genuine warranty &amp; verified suppliers</p>
                </div>
              </div>

              {/* Item 3: Easy Returns */}
              <div className="flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-full bg-white/[0.08] border border-white/10 flex items-center justify-center shrink-0 text-white shadow-xs">
                  <RotateCcw className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs sm:text-sm font-bold text-white">Easy Returns</h4>
                  <p className="text-[11px] text-neutral-400">Hassle free shopping experience</p>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom: Luxury Market Watermark */}
          <div className="relative z-10 pt-4 border-t border-white/10">
            <div className="w-8 h-1 bg-[#8B1D41] rounded-full mb-3" />
            <p className="text-[9.5px] font-bold text-neutral-300 tracking-[0.25em] uppercase">
              PREMIUM SRI LANKA MARKETPLACE
            </p>
            <p className="text-[8.5px] font-semibold text-neutral-500 tracking-[0.18em] uppercase mt-0.5">
              EVERYTHING YOU NEED, IN ONE PLACE.
            </p>
          </div>
        </div>

        {/* ══════════════════════════════════════════════════════
            RIGHT SIGN IN / SIGN UP FORM PANEL (7 Columns)
           ══════════════════════════════════════════════════════ */}
        <div className="lg:col-span-7 bg-white p-6 sm:p-10 lg:p-12 flex flex-col justify-center">
          <div className="w-full max-w-[440px] mx-auto">
            {/* Mobile Header: Logo + Switch */}
            <div className="flex lg:hidden items-center justify-between pb-4 mb-4 border-b border-neutral-100">
              <Link href="/" className="inline-flex items-center">
                <img
                  src="/logo.png"
                  alt="ONEPLACE"
                  className="h-7 w-auto object-contain"
                />
              </Link>
              <button
                type="button"
                onClick={() => handleTab(tab === "signin" ? "signup" : "signin")}
                className="text-xs font-bold text-[#64152F] hover:text-[#450C1F]"
              >
                {tab === "signin" ? "Sign Up" : "Sign In"}
              </button>
            </div>

            {/* Desktop Top Right: Sign In / Sign Up switcher link */}
            <div className="hidden lg:flex items-center justify-end mb-6">
              <p className="text-xs text-neutral-600 font-medium">
                {tab === "signin" ? "Don't have an account? " : "Already have an account? "}
                <button
                  type="button"
                  onClick={() => handleTab(tab === "signin" ? "signup" : "signin")}
                  className="font-bold text-[#64152F] hover:text-[#450C1F] hover:underline transition-colors cursor-pointer"
                >
                  {tab === "signin" ? "Sign Up" : "Sign In"}
                </button>
              </p>
            </div>

            {/* Heading and Subtitle */}
            <div className="mb-6">
              <h2 className="text-2xl sm:text-3xl font-extrabold text-neutral-900 tracking-tight">
                {tab === "signin" ? "Sign In" : "Create Account"}
              </h2>
              <p className="text-xs sm:text-sm text-neutral-500 font-medium mt-1">
                {tab === "signin"
                  ? "Welcome back! Please sign in to your account."
                  : "Join 1place.lk for exclusive offers, fast checkout, and order tracking."}
              </p>
            </div>

            {/* Social Authentication: Continue with Google & Continue with Apple */}
            {(googleAuthEnabled || appleAuthEnabled) && (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-5">
                  {/* Continue with Google */}
                  {googleAuthEnabled && (
                    <button
                      type="button"
                      onClick={handleGoogleSignIn}
                      disabled={loading}
                      className="w-full flex items-center justify-center gap-2.5 h-11 px-3 rounded-xl bg-white border border-neutral-200/90 hover:border-neutral-900 hover:bg-neutral-50/80 text-neutral-800 font-semibold text-xs sm:text-[13px] transition-all shadow-2xs cursor-pointer active:scale-[0.98] disabled:opacity-60"
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
                  )}

                  {/* Continue with Apple */}
                  {appleAuthEnabled && (
                    <button
                      type="button"
                      onClick={handleAppleSignIn}
                      disabled={loading}
                      className="w-full flex items-center justify-center gap-2.5 h-11 px-3 rounded-xl bg-white border border-neutral-200/90 hover:border-neutral-900 hover:bg-neutral-50/80 text-neutral-800 font-semibold text-xs sm:text-[13px] transition-all shadow-2xs cursor-pointer active:scale-[0.98] disabled:opacity-60"
                    >
                      <svg className="w-4 h-4 shrink-0 fill-current text-black" viewBox="0 0 170 170">
                        <path d="M150.37 130.25c-2.45 5.66-5.35 10.87-8.71 15.66-4.58 6.53-8.33 11.05-11.22 13.56-4.48 4.12-9.28 6.23-14.42 6.35-3.69 0-8.14-1.05-13.32-3.18-5.19-2.12-9.97-3.17-14.34-3.17-4.58 0-9.49 1.05-14.74 3.17-5.26 2.13-9.5 3.24-12.74 3.35-4.35.13-9.16-1.9-14.42-6.08-3.7-3.08-7.7-7.86-12.01-14.36-6.08-9.17-10.9-19.34-14.46-30.51-3.56-11.17-5.34-21.93-5.34-32.28 0-14.53 3.65-26.68 10.95-36.46 7.3-9.78 16.57-14.75 27.81-14.92 5.03 0 10.51 1.34 16.44 4.02 5.93 2.68 9.94 4.08 12.03 4.2 1.89-.12 6.08-1.59 12.58-4.41 6.5-2.82 12.06-4.08 16.69-3.78 12.85.84 23.01 5.66 30.49 14.46-11.53 6.94-17.18 16.51-16.94 28.71.24 9.54 3.99 17.58 11.26 24.12 7.27 6.54 15.93 10.3 25.99 11.28-2.6 7.9-5.91 16.03-9.93 24.39zM119.22 31.84c0-7.39 2.69-14.28 8.07-20.67 5.38-6.39 12.04-10.37 19.98-11.17.12 1.01.18 1.95.18 2.82 0 7.28-2.81 14.26-8.43 20.94-5.62 6.68-12.44 10.59-20.46 11.18-.36-1.07-.54-2.1-.54-3.1z" />
                      </svg>
                      <span>Continue with Apple</span>
                    </button>
                  )}
                </div>

                {/* OR Divider */}
                <div className="relative py-2 flex items-center justify-center mb-5">
                  <div className="border-t border-neutral-200/90 w-full" />
                  <span className="absolute bg-white px-3 text-[11px] text-neutral-400 font-semibold tracking-wider">
                    OR
                  </span>
                </div>
              </>
            )}

            {/* Error / Success Notifications */}
            <AnimatePresence mode="wait">
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  className="mb-4 p-3.5 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs font-semibold flex items-start gap-2"
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
                  className="mb-4 p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl text-xs font-semibold flex items-start gap-2"
                >
                  <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-emerald-600" />
                  <span>{success}</span>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Form Inputs */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Full Name (Sign Up mode) */}
              {tab === "signup" && (
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-neutral-800">
                    Full Name
                  </label>
                  <div className="relative">
                    <UserIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Enter your full name"
                      required
                      className="w-full h-11 pl-10 pr-4 bg-white border border-neutral-200 focus:border-[#64152F] rounded-xl text-sm font-medium text-neutral-900 placeholder:text-neutral-400 outline-none focus:ring-2 focus:ring-[#64152F]/10 transition-all"
                    />
                  </div>
                </div>
              )}

              {/* Email Address */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-neutral-800">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email address"
                    required
                    className="w-full h-11 pl-10 pr-4 bg-white border border-neutral-200 focus:border-[#64152F] rounded-xl text-sm font-medium text-neutral-900 placeholder:text-neutral-400 outline-none focus:ring-2 focus:ring-[#64152F]/10 transition-all"
                  />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-neutral-800">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    required
                    className="w-full h-11 pl-10 pr-11 bg-white border border-neutral-200 focus:border-[#64152F] rounded-xl text-sm font-medium text-neutral-900 placeholder:text-neutral-400 outline-none focus:ring-2 focus:ring-[#64152F]/10 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-neutral-400 hover:text-neutral-700 transition-colors cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Confirm Password (Sign Up mode) */}
              {tab === "signup" && (
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-neutral-800">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                    <input
                      type={showPassword ? "text" : "password"}
                      value={confirm}
                      onChange={(e) => setConfirm(e.target.value)}
                      placeholder="Confirm your password"
                      required
                      className="w-full h-11 pl-10 pr-4 bg-white border border-neutral-200 focus:border-[#64152F] rounded-xl text-sm font-medium text-neutral-900 placeholder:text-neutral-400 outline-none focus:ring-2 focus:ring-[#64152F]/10 transition-all"
                    />
                  </div>
                </div>
              )}

              {/* Options Row: Remember Me & Forgot Password */}
              <div className="flex items-center justify-between pt-1 mb-2">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 rounded-sm border-neutral-300 text-[#64152F] focus:ring-[#64152F] accent-[#64152F] cursor-pointer"
                  />
                  <span className="text-xs font-semibold text-neutral-700">Remember me</span>
                </label>

                {tab === "signin" && (
                  <button
                    type="button"
                    onClick={handleForgotPassword}
                    disabled={resetLoading}
                    className="text-xs font-bold text-[#64152F] hover:text-[#450C1F] hover:underline transition-colors cursor-pointer"
                  >
                    {resetLoading ? "Sending..." : "Forgot Password?"}
                  </button>
                )}
              </div>

              {/* Primary CTA Button */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full h-12 bg-[#64152F] hover:bg-[#4E0F23] text-white rounded-xl font-bold text-sm shadow-md shadow-[#64152F]/20 transition-all active:scale-[0.99] disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 group cursor-pointer"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>{tab === "signin" ? "Signing In..." : "Creating Account..."}</span>
                    </>
                  ) : (
                    <>
                      <span>{tab === "signin" ? "Sign In" : "Create Account"}</span>
                      <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                    </>
                  )}
                </button>
              </div>

              {/* Mobile Bottom Switcher */}
              <p className="text-center text-xs text-neutral-500 pt-3 lg:hidden">
                {tab === "signin" ? "Don't have an account? " : "Already have an account? "}
                <button
                  type="button"
                  onClick={() => handleTab(tab === "signin" ? "signup" : "signin")}
                  className="text-[#64152F] font-bold underline cursor-pointer"
                >
                  {tab === "signin" ? "Sign up" : "Sign in"}
                </button>
              </p>
            </form>

            {/* Bottom Security Reassurance */}
            <div className="flex items-center justify-center gap-2 mt-6 text-xs text-neutral-500 font-medium">
              <ShieldCheck className="w-4 h-4 text-[#64152F]" />
              <span>Your data is secure with 1place.lk</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Page Footer ── */}
      <div className="w-full py-3 text-center text-neutral-400 text-[11px] font-medium">
        &copy; {new Date().getFullYear()} 1PLACE.LK • Colombo, Sri Lanka
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-white flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-[#64152F]" />
        </div>
      }
    >
      <LoginFormContent />
    </Suspense>
  );
}
