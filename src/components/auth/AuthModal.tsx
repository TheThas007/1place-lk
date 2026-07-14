"use client";

import { useState } from "react";
import { Eye, EyeOff, Loader2, X } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { motion, AnimatePresence } from "framer-motion";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AuthModal({ isOpen, onClose }: AuthModalProps) {
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
    setName(""); setEmail(""); setPassword(""); setConfirm("");
    setError(""); setSuccess(""); setShowPassword(false);
  };

  const handleTab = (t: "signin" | "signup") => {
    setTab(t);
    resetForm();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(""); setSuccess("");
    if (tab === "signup") {
      if (!name.trim()) return setError("Please enter your name.");
      if (password !== confirm) return setError("Passwords do not match.");
      if (password.length < 6) return setError("Password must be at least 6 characters.");
    }
    setLoading(true);
    try {
      if (tab === "signin") {
        await signIn(email, password);
        setSuccess("Welcome back!");
        setTimeout(onClose, 900);
      } else {
        await signUp(name, email, password);
        setSuccess("Account created successfully!");
        setTimeout(onClose, 900);
      }
    } catch (err: any) {
      const code = err?.code || "";
      if (code === "auth/user-not-found" || code === "auth/wrong-password" || code === "auth/invalid-credential") {
        setError("Invalid email or password.");
      } else if (code === "auth/email-already-in-use") {
        setError("Email already in use.");
      } else if (code === "auth/invalid-email") {
        setError("Please enter a valid email.");
      } else {
        setError("Authentication failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError(""); setSuccess("");
    setLoading(true);
    try {
      await signInWithGoogle();
      setSuccess("Successfully signed in with Google!");
      setTimeout(onClose, 900);
    } catch (err: any) {
      console.error(err);
      if (err?.code !== "auth/popup-closed-by-user") {
        setError("Google sign-in failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          key="auth-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[60] bg-cover bg-center flex items-center justify-center p-4"
          style={{ 
            backgroundImage: `url('https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=1200&auto=format&fit=crop')` 
          }}
        >
          {/* Dark overlay to ensure readability */}
          <div className="absolute inset-0 bg-black/50 backdrop-blur-[4px]" onClick={onClose} />

          {/* Glassmorphism Card */}
          <motion.div
            key="auth-card"
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ type: "spring", damping: 25, stiffness: 220 }}
            className="relative w-full max-w-[450px] bg-white/[0.06] border border-white/20 backdrop-blur-xl rounded-2xl p-8 sm:p-10 shadow-2xl z-10 flex flex-col"
          >
            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute right-4 top-4 p-2 rounded-full bg-white/5 hover:bg-white/10 text-white/50 hover:text-white transition-all"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Title */}
            <h2 className="text-white text-3xl font-bold text-center mb-8">
              {tab === "signin" ? "Login" : "Register"}
            </h2>

            {/* Form */}
            <form onSubmit={handleSubmit} className="flex flex-col w-full">
              
              {tab === "signup" && (
                <div className="relative mb-6">
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter your name"
                    required
                    className="w-full bg-transparent border-b border-white/30 focus:border-white py-3 text-white text-sm outline-none transition-all placeholder-white/50"
                  />
                </div>
              )}

              <div className="relative mb-6">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  required
                  className="w-full bg-transparent border-b border-white/30 focus:border-white py-3 text-white text-sm outline-none transition-all placeholder-white/50"
                />
              </div>

              <div className="relative mb-6">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  required
                  className="w-full bg-transparent border-b border-white/30 focus:border-white py-3 pr-10 text-white text-sm outline-none transition-all placeholder-white/50"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-white/40 hover:text-white transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              {tab === "signup" && (
                <div className="relative mb-6">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={confirm}
                    onChange={(e) => setConfirm(e.target.value)}
                    placeholder="Confirm your password"
                    required
                    className="w-full bg-transparent border-b border-white/30 focus:border-white py-3 text-white text-sm outline-none transition-all placeholder-white/50"
                  />
                </div>
              )}

              {/* Remember me & Forgot Password */}
              <div className="flex items-center justify-between text-white/70 text-xs mb-8">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input 
                    type="checkbox" 
                    className="rounded border-white/30 bg-transparent text-black focus:ring-0 checked:bg-white checked:border-white accent-white w-4 h-4" 
                  />
                  <span>Remember me</span>
                </label>
                <button type="button" className="hover:underline hover:text-white">
                  Forgot password?
                </button>
              </div>

              {/* Error / Success messages */}
              <AnimatePresence>
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="mb-4 px-4 py-2.5 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs text-center"
                  >
                    {error}
                  </motion.div>
                )}
                {success && (
                  <motion.div
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="mb-4 px-4 py-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs text-center"
                  >
                    {success}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Submit button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 py-3.5 rounded-lg bg-white text-black font-bold text-sm hover:bg-neutral-200 transition-all active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed mb-6 shadow-md"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : (tab === "signin" ? "Log In" : "Register")}
              </button>

              {/* Divider */}
              <div className="relative mb-6 flex items-center justify-center">
                <div className="border-t border-white/10 w-full" />
                <span className="absolute bg-[#181818]/80 backdrop-blur px-3 py-0.5 rounded text-[10px] text-white/40 uppercase tracking-widest">
                  or
                </span>
              </div>

              {/* Google Sign-in */}
              <button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={loading}
                className="w-full flex items-center justify-center gap-3 py-3 rounded-lg border border-white/20 hover:bg-white/5 text-white font-semibold text-sm transition-all active:scale-[0.98] mb-6"
              >
                <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                  <path
                    fill="currentColor"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="currentColor"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                Continue with Google
              </button>

              {/* Register Switcher */}
              <p className="text-center text-xs text-white/70">
                {tab === "signin" ? (
                  <>
                    Don't have an account?{" "}
                    <button type="button" onClick={() => handleTab("signup")} className="text-white font-semibold hover:underline">
                      Register
                    </button>
                  </>
                ) : (
                  <>
                    Already have an account?{" "}
                    <button type="button" onClick={() => handleTab("signin")} className="text-white font-semibold hover:underline">
                      Log In
                    </button>
                  </>
                )}
              </p>

            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
