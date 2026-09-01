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
        await signUp(name, email, password, signupGender);
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
        setError("Google sign-in could not be completed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!email.trim()) {
      setError("Please enter your email address first, then click Forgot password.");
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
    <div className="min-h-screen w-full bg-[#FAFAFA] sm:bg-[#F4F4F5] flex flex-col justify-between items-center selection:bg-black selection:text-white font-outfit px-3 py-4 sm:px-6 sm:py-6">
      {/* ── Top Navigation Bar (Desktop) ── */}
      <div className="hidden sm:flex w-full max-w-4xl items-center justify-between py-2 px-2 shrink-0">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-neutral-600 hover:text-black transition-colors group"
        >
          <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
          <span>Back to Street Mobile</span>
        </Link>
        <div className="flex items-center gap-1.5 text-xs text-neutral-500 font-bold uppercase tracking-wider">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>100% Genuine Care &amp; Warranty</span>
        </div>
      </div>

      {/* ── Main Authentication Card (Perfect compact mobile size) ── */}
      <div className="w-full max-w-[420px] sm:max-w-4xl bg-white rounded-3xl sm:rounded-[32px] border border-neutral-200/90 shadow-[0_12px_45px_-10px_rgba(0,0,0,0.08)] overflow-hidden my-auto grid grid-cols-1 sm:grid-cols-12">
        {/* ══════════════════════════════════════════════════════
            DESKTOP BRAND LEFT PANEL (>= 640px)
           ══════════════════════════════════════════════════════ */}
        <div className="hidden sm:flex sm:col-span-5 bg-[#090909] text-white p-8 lg:p-10 flex-col justify-between relative overflow-hidden border-r border-neutral-800">
          <div className="absolute inset-0 bg-gradient-to-b from-sky-500/10 via-transparent to-purple-500/10 pointer-events-none" />

          {/* Brand Stack */}
          <div className="relative z-10">
            <Link href="/" className="inline-block">
              <img
                src="/logo.png"
                alt="STREET MOBILE"
                className="h-20 lg:h-24 w-auto object-contain max-w-[240px]"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = "/logo.svg";
                }}
              />
            </Link>

            <div className="mt-8">
              <span className="text-[11px] font-bold text-neutral-400 tracking-[0.25em] uppercase">
                VAVUNIYA • SRI LANKA
              </span>
              <h2 className="text-xl lg:text-2xl font-black tracking-tight text-white leading-tight mt-2">
                Your destination for genuine tech.
              </h2>
              <p className="mt-2.5 text-xs lg:text-sm text-neutral-400 font-medium leading-relaxed">
                Official company warranty, island-wide express delivery, and friendly customer care.
              </p>
            </div>
          </div>

          {/* Bottom Trust Badges */}
          <div className="relative z-10 pt-6 border-t border-neutral-800/80">
            <div className="flex items-center gap-2 text-xs text-neutral-300 font-semibold">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>100% Genuine Devices &amp; Care</span>
            </div>
          </div>
        </div>

        {/* ══════════════════════════════════════════════════════
            AUTH FORM (MOBILE + DESKTOP)
           ══════════════════════════════════════════════════════ */}
        <div className="sm:col-span-7 bg-white p-5 sm:p-8 lg:p-10 flex flex-col justify-center">
          <div className="w-full max-w-[360px] sm:max-w-[380px] mx-auto">
            {/* Mobile Header: Street Mobile Logo + Back Button */}
            <div className="flex sm:hidden items-center justify-between pb-4 mb-2 border-b border-neutral-100">
              <Link href="/" className="inline-flex items-center">
                <img
                  src="/logo.png"
                  alt="STREET MOBILE"
                  className="h-8 w-auto object-contain"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = "/logo.svg";
                  }}
                />
              </Link>
              <Link
                href="/"
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-neutral-100 hover:bg-neutral-200 text-neutral-700 text-xs font-semibold transition-all cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back</span>
              </Link>
            </div>

            {/* Segmented Pill Tabs */}
            <div className="grid grid-cols-2 p-1 bg-neutral-100 rounded-2xl mb-4 h-11 items-center border border-neutral-200/80 shadow-inner">
              <button
                type="button"
                onClick={() => handleTab("signin")}
                className={`h-9 text-xs sm:text-sm font-bold rounded-xl transition-all duration-200 flex items-center justify-center cursor-pointer ${
                  tab === "signin"
                    ? "bg-white text-black shadow-xs"
                    : "text-neutral-500 hover:text-black"
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => handleTab("signup")}
                className={`h-9 text-xs sm:text-sm font-bold rounded-xl transition-all duration-200 flex items-center justify-center cursor-pointer ${
                  tab === "signup"
                    ? "bg-white text-black shadow-xs"
                    : "text-neutral-500 hover:text-black"
                }`}
              >
                Create Account
              </button>
            </div>

            {/* One-Tap Google Sign-In Button */}
            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={loading}
              className="w-full flex items-center justify-center gap-2.5 h-11 px-4 rounded-2xl bg-white border border-neutral-300 hover:border-neutral-900 hover:bg-neutral-50 text-neutral-900 font-bold text-xs sm:text-sm transition-all duration-150 active:scale-[0.98] disabled:opacity-60 shadow-2xs cursor-pointer mb-3.5"
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
            <div className="relative py-1 flex items-center justify-center mb-3">
              <div className="border-t border-neutral-200 w-full" />
              <span className="absolute bg-white px-2.5 text-[9.5px] tracking-widest text-neutral-400 uppercase font-extrabold">
                OR WITH EMAIL
              </span>
            </div>

            {/* Error / Success Notifications */}
            <AnimatePresence mode="wait">
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  className="mb-3 p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs font-semibold flex items-start gap-2"
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
                  className="mb-3 p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl text-xs font-semibold flex items-start gap-2"
                >
                  <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-emerald-600" />
                  <span>{success}</span>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Form Inputs */}
            <form onSubmit={handleSubmit} className="space-y-3">
              {/* Full Name & Gender (Sign Up mode) */}
              {tab === "signup" && (
                <>
                  <div className="space-y-1">
                    <label className="block text-[10.5px] font-extrabold text-neutral-700 uppercase tracking-wider">
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
                        className="w-full h-11 pl-10 pr-3.5 bg-neutral-50 focus:bg-white border border-neutral-200 focus:border-black rounded-xl text-neutral-900 placeholder:text-neutral-400 text-xs sm:text-sm font-medium outline-none focus:ring-2 focus:ring-black/5 transition-all"
                      />
                    </div>
                  </div>

                  {/* Gender Selector with Visual Avatars */}
                  <div className="space-y-1">
                    <label className="block text-[10.5px] font-extrabold text-neutral-700 uppercase tracking-wider">
                      Avatar Gender
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setSignupGender("male")}
                        className={`h-10 px-2 text-xs font-bold rounded-xl border transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                          signupGender === "male"
                            ? "bg-black text-white border-black shadow-2xs"
                            : "bg-neutral-50 text-neutral-700 border-neutral-200 hover:border-neutral-400"
                        }`}
                      >
                        <span>👨 Male</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setSignupGender("female")}
                        className={`h-10 px-2 text-xs font-bold rounded-xl border transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                          signupGender === "female"
                            ? "bg-black text-white border-black shadow-2xs"
                            : "bg-neutral-50 text-neutral-700 border-neutral-200 hover:border-neutral-400"
                        }`}
                      >
                        <span>👩 Female</span>
                      </button>
                    </div>
                  </div>
                </>
              )}

              {/* Email Address */}
              <div className="space-y-1">
                <label className="block text-[10.5px] font-extrabold text-neutral-700 uppercase tracking-wider">
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
                    className="w-full h-11 pl-10 pr-3.5 bg-neutral-50 focus:bg-white border border-neutral-200 focus:border-black rounded-xl text-neutral-900 placeholder:text-neutral-400 text-xs sm:text-sm font-medium outline-none focus:ring-2 focus:ring-black/5 transition-all"
                  />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="block text-[10.5px] font-extrabold text-neutral-700 uppercase tracking-wider">
                    Password
                  </label>
                  {tab === "signin" && (
                    <button
                      type="button"
                      onClick={handleForgotPassword}
                      disabled={resetLoading}
                      className="text-[11px] text-neutral-500 hover:text-black font-semibold transition-colors cursor-pointer"
                    >
                      {resetLoading ? "Sending..." : "Forgot password?"}
                    </button>
                  )}
                </div>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="w-full h-11 pl-10 pr-10 bg-neutral-50 focus:bg-white border border-neutral-200 focus:border-black rounded-xl text-neutral-900 placeholder:text-neutral-400 text-xs sm:text-sm font-medium outline-none focus:ring-2 focus:ring-black/5 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-black p-1 transition-colors cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Confirm Password (Sign Up mode) */}
              {tab === "signup" && (
                <div className="space-y-1">
                  <label className="block text-[10.5px] font-extrabold text-neutral-700 uppercase tracking-wider">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                    <input
                      type={showPassword ? "text" : "password"}
                      value={confirm}
                      onChange={(e) => setConfirm(e.target.value)}
                      placeholder="••••••••"
                      required
                      className="w-full h-11 pl-10 pr-3.5 bg-neutral-50 focus:bg-white border border-neutral-200 focus:border-black rounded-xl text-neutral-900 placeholder:text-neutral-400 text-xs sm:text-sm font-medium outline-none focus:ring-2 focus:ring-black/5 transition-all"
                    />
                  </div>
                </div>
              )}

              {/* Remember Me Toggle */}
              {tab === "signin" && (
                <div className="pt-0.5">
                  <label className="inline-flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="w-3.5 h-3.5 rounded border-neutral-300 text-black focus:ring-black accent-black cursor-pointer"
                    />
                    <span className="text-xs text-neutral-600 font-medium">Keep me signed in</span>
                  </label>
                </div>
              )}

              {/* Primary CTA Button */}
              <div className="pt-1.5">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full h-11 sm:h-12 px-4 rounded-xl sm:rounded-2xl bg-black hover:bg-neutral-800 text-white font-extrabold text-xs sm:text-sm transition-all duration-150 shadow-md active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 group cursor-pointer"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>{tab === "signin" ? "Signing In..." : "Creating Account..."}</span>
                    </>
                  ) : (
                    <>
                      <span>{tab === "signin" ? "Sign In" : "Create Account"}</span>
                      <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
                    </>
                  )}
                </button>
              </div>

              {/* Bottom Switcher */}
              <p className="text-center text-xs text-neutral-500 pt-2">
                {tab === "signin" ? "Don't have an account? " : "Already have an account? "}
                <button
                  type="button"
                  onClick={() => handleTab(tab === "signin" ? "signup" : "signin")}
                  className="text-black font-extrabold underline underline-offset-2 hover:text-neutral-700 cursor-pointer"
                >
                  {tab === "signin" ? "Create account" : "Sign in"}
                </button>
              </p>
            </form>
          </div>
        </div>
      </div>

      {/* ── Footer ── */}
      <div className="w-full py-2 text-center text-neutral-400 text-[11px] font-medium">
        &copy; {new Date().getFullYear()} STREET MOBILE LK • Vavuniya, Sri Lanka
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-white flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-black" />
        </div>
      }
    >
      <LoginFormContent />
    </Suspense>
  );
}
