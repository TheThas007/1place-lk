"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Loader2, X, Mail, Lock, User, CheckCircle2, AlertCircle } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { useCart } from "@/lib/cart-context";
import { getPendingPurchaseIntent, executePendingPurchaseIntent } from "@/lib/auth-intent";
import { motion, AnimatePresence } from "framer-motion";

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
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

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
        setTimeout(() => handlePostAuth(), 600);
      } else {
        await signUp(name, email, password);
        setSuccess("Account created successfully!");
        setTimeout(() => handlePostAuth(), 600);
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
      setTimeout(() => handlePostAuth(), 600);
    } catch (err: any) {
      console.error(err);
      if (err?.code === "auth/unauthorized-domain") {
        setError(
          "Google sign-in failed: Domain not authorized in Firebase Console."
        );
      } else if (err?.code === "auth/popup-blocked") {
        setError("Sign-in popup was blocked. Please allow popups and retry.");
      } else if (err?.code !== "auth/popup-closed-by-user") {
        setError("Google sign-in could not be completed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
          {/* Backdrop overlay */}
          <motion.div
            key="auth-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm"
          />

          {/* Minimal White Modal Container */}
          <motion.div
            key="auth-modal-card"
            initial={{ opacity: 0, scale: 0.96, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 10 }}
            transition={{ type: "spring", damping: 26, stiffness: 320 }}
            className="relative w-full max-w-[440px] bg-white rounded-3xl p-7 sm:p-9 shadow-2xl shadow-neutral-900/15 border border-neutral-100 z-10 font-sans text-neutral-900 overflow-hidden"
          >
            {/* Close Button */}
            <button
              onClick={onClose}
              aria-label="Close dialog"
              className="absolute right-5 top-5 p-2 rounded-full text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Header / Tab Switcher */}
            <div className="mb-6">
              <div className="inline-flex p-1 bg-neutral-100/80 rounded-xl mb-5 w-full">
                <button
                  type="button"
                  onClick={() => handleTab("signin")}
                  className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all ${
                    tab === "signin"
                      ? "bg-white text-neutral-900 shadow-sm"
                      : "text-neutral-500 hover:text-neutral-800"
                  }`}
                >
                  Sign In
                </button>
                <button
                  type="button"
                  onClick={() => handleTab("signup")}
                  className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all ${
                    tab === "signup"
                      ? "bg-white text-neutral-900 shadow-sm"
                      : "text-neutral-500 hover:text-neutral-800"
                  }`}
                >
                  Create Account
                </button>
              </div>

              <h2 className="text-2xl font-bold tracking-tight text-neutral-900">
                {tab === "signin" ? "Welcome back" : "Create an account"}
              </h2>
              <p className="text-xs sm:text-sm text-neutral-500 mt-1">
                {tab === "signin"
                  ? "Sign in to track orders, manage wishlist & profile"
                  : "Join Street Mobile for exclusive offers and fast checkout"}
              </p>
            </div>

            {/* Error / Success Notifications */}
            <AnimatePresence mode="wait">
              {error && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mb-4 flex items-start gap-2.5 p-3 bg-red-50 border border-red-200/80 rounded-xl text-red-600 text-xs font-medium"
                >
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{error}</span>
                </motion.div>
              )}
              {success && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mb-4 flex items-start gap-2.5 p-3 bg-emerald-50 border border-emerald-200/80 rounded-xl text-emerald-700 text-xs font-medium"
                >
                  <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{success}</span>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-3.5">
              {tab === "signup" && (
                <div className="space-y-1">
                  <label className="block text-[11px] font-semibold text-neutral-600 uppercase tracking-wider">
                    Full Name
                  </label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Alex Silva"
                      required
                      className="w-full pl-10 pr-4 py-2.5 bg-neutral-50/70 hover:bg-neutral-50 focus:bg-white border border-neutral-200 focus:border-neutral-900 rounded-xl text-neutral-900 placeholder:text-neutral-400 text-sm outline-none focus:ring-4 focus:ring-neutral-900/5 transition-all"
                    />
                  </div>
                </div>
              )}

              <div className="space-y-1">
                <label className="block text-[11px] font-semibold text-neutral-600 uppercase tracking-wider">
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
                    className="w-full pl-10 pr-4 py-2.5 bg-neutral-50/70 hover:bg-neutral-50 focus:bg-white border border-neutral-200 focus:border-neutral-900 rounded-xl text-neutral-900 placeholder:text-neutral-400 text-sm outline-none focus:ring-4 focus:ring-neutral-900/5 transition-all"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-[11px] font-semibold text-neutral-600 uppercase tracking-wider">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    required
                    className="w-full pl-10 pr-11 py-2.5 bg-neutral-50/70 hover:bg-neutral-50 focus:bg-white border border-neutral-200 focus:border-neutral-900 rounded-xl text-neutral-900 placeholder:text-neutral-400 text-sm outline-none focus:ring-4 focus:ring-neutral-900/5 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-700 p-1 rounded-md transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {tab === "signup" && (
                <div className="space-y-1">
                  <label className="block text-[11px] font-semibold text-neutral-600 uppercase tracking-wider">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                    <input
                      type={showPassword ? "text" : "password"}
                      value={confirm}
                      onChange={(e) => setConfirm(e.target.value)}
                      placeholder="••••••••••••"
                      required
                      className="w-full pl-10 pr-4 py-2.5 bg-neutral-50/70 hover:bg-neutral-50 focus:bg-white border border-neutral-200 focus:border-neutral-900 rounded-xl text-neutral-900 placeholder:text-neutral-400 text-sm outline-none focus:ring-4 focus:ring-neutral-900/5 transition-all"
                    />
                  </div>
                </div>
              )}

              {/* Extra options */}
              {tab === "signin" && (
                <div className="flex items-center justify-between pt-1 text-xs text-neutral-500">
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      defaultChecked
                      className="w-4 h-4 rounded border-neutral-300 text-neutral-900 focus:ring-neutral-900/10 accent-neutral-900"
                    />
                    <span>Remember me</span>
                  </label>
                  <button
                    type="button"
                    onClick={() =>
                      alert("Password reset instructions will be sent to your email address.")
                    }
                    className="text-neutral-600 hover:text-neutral-900 font-medium hover:underline transition-colors"
                  >
                    Forgot password?
                  </button>
                </div>
              )}

              {/* Primary Submit Button */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 px-4 rounded-xl bg-neutral-900 hover:bg-black text-white font-medium text-sm transition-all shadow-sm active:scale-[0.99] disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>{tab === "signin" ? "Signing in..." : "Creating account..."}</span>
                    </>
                  ) : (
                    <span>{tab === "signin" ? "Sign In" : "Create Account"}</span>
                  )}
                </button>
              </div>

              {/* Minimal Divider */}
              <div className="relative py-2 flex items-center justify-center">
                <div className="border-t border-neutral-200 w-full" />
                <span className="absolute bg-white px-3 text-[11px] text-neutral-400 uppercase tracking-wider font-medium">
                  or continue with
                </span>
              </div>

              {/* Google Sign-in Button */}
              <button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={loading}
                className="w-full flex items-center justify-center gap-3 py-2.5 px-4 rounded-xl border border-neutral-200 hover:border-neutral-300 hover:bg-neutral-50 text-neutral-700 font-medium text-sm transition-all active:scale-[0.99] disabled:opacity-60"
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
                <span>Google</span>
              </button>

              {/* Bottom Switcher */}
              <p className="text-center text-xs text-neutral-500 pt-2">
                {tab === "signin" ? (
                  <>
                    Don&apos;t have an account?{" "}
                    <button
                      type="button"
                      onClick={() => handleTab("signup")}
                      className="text-neutral-900 font-semibold hover:underline"
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
                      className="text-neutral-900 font-semibold hover:underline"
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
