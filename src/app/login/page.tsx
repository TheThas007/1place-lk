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
  ShoppingBag,
  ArrowRight,
} from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { useCart } from "@/lib/cart-context";
import { auth } from "@/lib/firebase";
import {
  getPendingPurchaseIntent,
  executePendingPurchaseIntent,
  sanitizeReturnUrl,
} from "@/lib/auth-intent";
import { motion, AnimatePresence } from "framer-motion";

function LoginFormContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { signIn, signUp, signInWithGoogle, user } = useAuth();
  const { addToCart } = useCart();

  const redirectParam = searchParams.get("redirect");
  const intentParam = searchParams.get("intent");

  const [tab, setTab] = useState<"signin" | "signup">("signin");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [signupGender, setSignupGender] = useState<"male" | "female">("male");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Check if there is an active purchase/checkout intent
  const [hasPurchaseIntent, setHasPurchaseIntent] = useState(false);

  useEffect(() => {
    const intent = getPendingPurchaseIntent();
    if (intent || redirectParam?.includes("checkout") || intentParam) {
      setHasPurchaseIntent(true);
    }
  }, [redirectParam, intentParam]);

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
        setTimeout(() => handlePostAuthRedirect(), 500);
      } else {
        await signUp(name, email, password, signupGender);
        setSuccess("Account created successfully!");
        setTimeout(() => handlePostAuthRedirect(), 500);
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
      setTimeout(() => handlePostAuthRedirect(), 500);
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
      const { OAuthProvider, signInWithPopup } = await import("firebase/auth");
      const provider = new OAuthProvider("apple.com");
      provider.addScope("email");
      provider.addScope("name");
      await signInWithPopup(auth, provider);
      setSuccess("Signed in with Apple!");
      setTimeout(() => handlePostAuthRedirect(), 500);
    } catch (err: any) {
      if (err?.code === "auth/popup-closed-by-user") {
        // User closed popup
      } else if (
        err?.code === "auth/operation-not-allowed" ||
        err?.code === "auth/configuration-not-found" ||
        err?.code === "auth/invalid-oauth-provider"
      ) {
        setError("Apple Sign-In is in setup mode for this store domain. Please continue with Google or Email.");
      } else {
        setError(err?.message || "Apple sign-in could not be completed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!email.trim()) {
      setError("Please enter your email address above, then click Forgot password.");
      return;
    }
    setError("");
    setResetLoading(true);
    try {
      const { sendPasswordResetEmail } = await import("firebase/auth");
      await sendPasswordResetEmail(auth, email.trim());
      setSuccess(`Password reset instructions have been sent to ${email.trim()}.`);
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
    <div className="fixed inset-0 z-40 bg-[#FFFFFF] overflow-y-auto flex flex-col justify-between items-center p-4 sm:p-6 lg:p-10 font-sans text-[#111111] selection:bg-[#000000] selection:text-[#FFFFFF]">
      {/* Top Bar Navigation */}
      <div className="w-full max-w-5xl flex items-center justify-between py-2 px-1 mb-2">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs sm:text-sm font-medium text-[#666666] hover:text-[#111111] transition-colors group"
        >
          <span className="transition-transform group-hover:-translate-x-1">&larr;</span>
          <span>Back to Street Mobile</span>
        </Link>
      </div>

      {/* Main Centered Authentication Container */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: "easeOut" }}
        className="w-full max-w-5xl my-auto bg-[#FFFFFF] rounded-[24px] sm:rounded-[28px] border border-[#E5E5E5] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.07),0_1px_3px_rgba(0,0,0,0.04)] overflow-hidden grid grid-cols-1 md:grid-cols-12"
      >
        {/* ══════════════════════════════════════════════════════
            MOBILE BRAND HEADER (< 768px)
           ══════════════════════════════════════════════════════ */}
        <div className="md:hidden bg-[#000000] text-[#FFFFFF] p-6 border-b border-[#1a1a1a] relative overflow-hidden">
          <div className="flex items-center justify-between">
            <Link href="/" className="inline-flex items-center">
              <img
                src="/logo.png"
                alt="STREET MOBILE Logo"
                className="h-14 sm:h-16 w-auto object-contain"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = "/logo.svg";
                }}
              />
            </Link>
            <Link
              href="/"
              className="text-xs font-medium text-neutral-400 hover:text-white transition-colors"
            >
              Back to Store &rarr;
            </Link>
          </div>
          <div className="mt-5">
            <h2 className="text-xl font-semibold text-[#FFFFFF] tracking-tight">
              Welcome back.
            </h2>
            <p className="mt-1 text-xs text-neutral-400 font-normal">
              Sign in to manage your orders and tech purchases.
            </p>
          </div>
        </div>

        {/* ══════════════════════════════════════════════════════
            LEFT PANEL — BRAND EXPERIENCE (~42% Desktop Width)
           ══════════════════════════════════════════════════════ */}
        <div className="hidden md:flex md:col-span-5 bg-[#000000] text-[#FFFFFF] p-8 sm:p-10 lg:p-12 flex-col justify-between relative overflow-hidden border-r border-[#1a1a1a]">
          {/* Subtle Abstract Monochrome Vector Line Pattern */}
          <svg
            className="absolute inset-0 w-full h-full pointer-events-none opacity-20"
            viewBox="0 0 500 700"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
          >
            <path
              d="M -60 160 C 120 70 280 340 560 200"
              stroke="#FFFFFF"
              strokeWidth="1"
              strokeDasharray="4 4"
            />
            <path
              d="M -60 240 C 140 140 310 410 560 270"
              stroke="#FFFFFF"
              strokeWidth="1"
            />
            <path
              d="M -60 320 C 160 210 340 480 560 340"
              stroke="#FFFFFF"
              strokeWidth="1"
              strokeDasharray="6 6"
            />
            <path
              d="M -60 400 C 180 280 370 550 560 410"
              stroke="#FFFFFF"
              strokeWidth="1"
            />
            <path
              d="M -60 480 C 200 350 400 620 560 480"
              stroke="#FFFFFF"
              strokeWidth="1"
            />
            <circle cx="420" cy="180" r="160" stroke="#FFFFFF" strokeOpacity="0.05" strokeWidth="1" />
            <circle cx="420" cy="180" r="240" stroke="#FFFFFF" strokeOpacity="0.03" strokeWidth="1" />
          </svg>

          {/* Top Brand Stack */}
          <div className="relative z-10">
            <Link href="/" className="inline-block">
              <img
                src="/logo.png"
                alt="STREET MOBILE Logo"
                className="h-24 sm:h-28 lg:h-32 w-auto object-contain max-w-[320px]"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = "/logo.svg";
                }}
              />
            </Link>

            {/* Statement & Welcome Heading */}
            <div className="mt-8 sm:mt-10 lg:mt-12">
              <h2 className="text-2xl sm:text-3xl lg:text-3xl font-semibold tracking-tight text-[#FFFFFF] leading-tight">
                Welcome back.
              </h2>
              <p className="mt-3 text-xs sm:text-sm text-neutral-400 font-normal leading-relaxed">
                Your trusted destination for premium smartphones and technology in Sri Lanka.
              </p>
            </div>
          </div>

          {/* Bottom Navigation Link (Desktop) */}
          <div className="relative z-10 mt-8 pt-6 border-t border-[#1a1a1a]">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-xs font-medium text-neutral-400 hover:text-white transition-colors group"
            >
              <span className="transition-transform group-hover:-translate-x-1">&larr;</span>
              <span>Back to Street Mobile</span>
            </Link>
          </div>
        </div>

        {/* ══════════════════════════════════════════════════════
            RIGHT PANEL — LOGIN FORM (~58% Desktop Width)
           ══════════════════════════════════════════════════════ */}
        <div className="md:col-span-7 bg-[#FFFFFF] p-7 sm:p-10 lg:p-12 flex flex-col justify-center">
          <div className="w-full max-w-[420px] mx-auto">
            {/* Minimal Tab Switcher (Sign In / Create Account) */}
            <div className="inline-flex p-1 bg-[#F7F7F7] border border-[#E5E5E5] rounded-xl mb-6 w-full">
              <button
                type="button"
                onClick={() => handleTab("signin")}
                className={`flex-1 py-2 text-xs font-medium rounded-lg transition-all ${tab === "signin"
                    ? "bg-[#FFFFFF] text-[#111111] shadow-[0_1px_3px_rgba(0,0,0,0.06)]"
                    : "text-[#666666] hover:text-[#111111]"
                  }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => handleTab("signup")}
                className={`flex-1 py-2 text-xs font-medium rounded-lg transition-all ${tab === "signup"
                    ? "bg-[#FFFFFF] text-[#111111] shadow-[0_1px_3px_rgba(0,0,0,0.06)]"
                    : "text-[#666666] hover:text-[#111111]"
                  }`}
              >
                Create Account
              </button>
            </div>

            {/* Purchase Intent Notice */}
            {hasPurchaseIntent && (
              <div className="mb-5 p-3.5 bg-[#111111] text-white rounded-xl flex items-center gap-3 text-xs shadow-sm">
                <ShoppingBag className="w-4 h-4 text-white shrink-0" />
                <span className="font-medium leading-snug">
                  Please sign in to add products to your cart or continue your checkout.
                </span>
              </div>
            )}

            {/* Large, Clean Heading */}
            <div className="mb-6">
              <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight text-[#111111]">
                {tab === "signin" ? "Sign in" : "Create account"}
              </h1>
              <p className="text-xs sm:text-sm text-[#666666] mt-2 font-normal">
                {tab === "signin"
                  ? "Welcome back. Enter your details to continue."
                  : "Create your account to start shopping."}
              </p>
            </div>

            {/* Monochrome Notifications */}
            <AnimatePresence mode="wait">
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  className="mb-5 p-3.5 bg-[#111111] text-white rounded-xl text-xs flex items-start gap-2.5"
                >
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-white/80" />
                  <span className="text-white/95 font-medium">{error}</span>
                </motion.div>
              )}
              {success && (
                <motion.div
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  className="mb-5 p-3.5 bg-[#111111] text-white rounded-xl text-xs flex items-start gap-2.5"
                >
                  <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-white/80" />
                  <span className="text-white/95 font-medium">{success}</span>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Form Elements */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Full Name (Sign Up mode) */}
              {tab === "signup" && (
                <>
                  <div className="space-y-1.5">
                    <label className="block text-xs font-medium text-[#111111]">
                      Full name
                    </label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Enter your full name"
                      required
                      className="w-full px-4 py-3 bg-[#F7F7F7] focus:bg-[#FFFFFF] border border-[#E5E5E5] focus:border-[#111111] rounded-xl text-[#111111] placeholder:text-[#999999] text-sm outline-none transition-all duration-150"
                    />
                  </div>
                </>
              )}

              {/* Email Address */}
              <div className="space-y-1.5">
                <label className="block text-xs font-medium text-[#111111]">
                  Email address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  required
                  className="w-full px-4 py-3 bg-[#F7F7F7] focus:bg-[#FFFFFF] border border-[#E5E5E5] focus:border-[#111111] rounded-xl text-[#111111] placeholder:text-[#999999] text-sm outline-none transition-all duration-150"
                />
              </div>

              {/* Password */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-medium text-[#111111]">
                    Password
                  </label>
                  {tab === "signin" && (
                    <button
                      type="button"
                      onClick={handleForgotPassword}
                      disabled={resetLoading}
                      className="text-xs text-[#666666] hover:text-[#111111] font-medium transition-colors"
                    >
                      {resetLoading ? "Sending..." : "Forgot password?"}
                    </button>
                  )}
                </div>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    required
                    className="w-full px-4 py-3 pr-11 bg-[#F7F7F7] focus:bg-[#FFFFFF] border border-[#E5E5E5] focus:border-[#111111] rounded-xl text-[#111111] placeholder:text-[#999999] text-sm outline-none transition-all duration-150"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#666666] hover:text-[#111111] p-1 transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Confirm Password (Sign Up mode) */}
              {tab === "signup" && (
                <div className="space-y-1.5">
                  <label className="block text-xs font-medium text-[#111111]">
                    Confirm password
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      value={confirm}
                      onChange={(e) => setConfirm(e.target.value)}
                      placeholder="Confirm your password"
                      required
                      className="w-full px-4 py-3 bg-[#F7F7F7] focus:bg-[#FFFFFF] border border-[#E5E5E5] focus:border-[#111111] rounded-xl text-[#111111] placeholder:text-[#999999] text-sm outline-none transition-all duration-150"
                    />
                  </div>
                </div>
              )}

              {/* Remember Me Checkbox */}
              {tab === "signin" && (
                <div className="pt-0.5">
                  <label className="inline-flex items-center gap-2.5 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="w-4 h-4 rounded border-[#E5E5E5] text-[#000000] focus:ring-[#000000] accent-[#000000]"
                    />
                    <span className="text-xs text-[#666666] font-medium">Remember me</span>
                  </label>
                </div>
              )}

              {/* Large Black Primary Action Button */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 px-5 rounded-xl bg-[#000000] hover:bg-[#222222] text-[#FFFFFF] font-medium text-sm transition-all duration-150 shadow-sm active:scale-[0.99] disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 group"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>{tab === "signin" ? "Signing in..." : "Creating account..."}</span>
                    </>
                  ) : (
                    <>
                      <span>{tab === "signin" ? "Sign In" : "Create Account"}</span>
                      <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                    </>
                  )}
                </button>
              </div>

              {/* Divider */}
              <div className="relative py-2.5 flex items-center justify-center">
                <div className="border-t border-[#E5E5E5] w-full" />
                <span className="absolute bg-[#FFFFFF] px-3 text-[10px] tracking-widest text-[#888888] uppercase font-medium">
                  OR CONTINUE WITH
                </span>
              </div>

              {/* Social Login Buttons */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Google Button */}
                <button
                  type="button"
                  onClick={handleGoogleSignIn}
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-2.5 py-3 px-4 rounded-xl bg-[#FFFFFF] border border-[#E5E5E5] hover:border-[#111111] hover:bg-[#F7F7F7] text-[#111111] font-medium text-xs sm:text-sm transition-all active:scale-[0.99] disabled:opacity-60"
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

                {/* Apple Button */}
                <button
                  type="button"
                  onClick={handleAppleSignIn}
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-2.5 py-3 px-4 rounded-xl bg-[#FFFFFF] border border-[#E5E5E5] hover:border-[#111111] hover:bg-[#F7F7F7] text-[#111111] font-medium text-xs sm:text-sm transition-all active:scale-[0.99] disabled:opacity-60"
                >
                  <svg className="w-4 h-4 shrink-0 fill-current text-[#111111]" viewBox="0 0 24 24">
                    <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.37c.62-.75 1.04-1.8 0.92-2.85-.9.04-1.99.6-2.63 1.35-.57.65-1.07 1.72-.94 2.74 1.01.08 2.03-.49 2.65-1.24z" />
                  </svg>
                  <span>Continue with Apple</span>
                </button>
              </div>

              {/* Bottom Account Toggle */}
              <p className="text-center text-xs text-[#666666] pt-3">
                {tab === "signin" ? (
                  <>
                    Don&apos;t have an account?{" "}
                    <button
                      type="button"
                      onClick={() => handleTab("signup")}
                      className="text-[#111111] font-semibold hover:underline"
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
                      className="text-[#111111] font-semibold hover:underline"
                    >
                      Sign in
                    </button>
                  </>
                )}
              </p>
            </form>
          </div>
        </div>
      </motion.div>

      {/* Subtle Bottom Copyright */}
      <div className="w-full max-w-5xl py-2 text-center text-xs text-[#888888]">
        &copy; {new Date().getFullYear()} Street Mobile .LK. All rights reserved.
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="fixed inset-0 z-40 bg-[#FFFFFF] flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-[#000000]" />
        </div>
      }
    >
      <LoginFormContent />
    </Suspense>
  );
}
