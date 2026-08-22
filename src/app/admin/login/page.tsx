"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Lock, User, Eye, EyeOff, AlertCircle, ArrowLeft, ArrowRight, Shield } from "lucide-react";
import { motion } from "framer-motion";

export default function AdminLoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    // Simple auth check — hardcoded credentials
    await new Promise((resolve) => setTimeout(resolve, 600));

    if (username.trim().toLowerCase() === "admin" && password.trim() === "street2024") {
      sessionStorage.setItem("admin_auth", "true");
      localStorage.setItem("admin_auth", "true");
      router.push("/admin/dashboard");
    } else {
      setError("Invalid username or password. Please try again.");
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-white flex flex-col justify-between items-center p-6 sm:p-10 font-sans text-neutral-900 selection:bg-neutral-900 selection:text-white">
      {/* Top Header Navigation */}
      <header className="w-full max-w-5xl flex items-center justify-between py-2">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs sm:text-sm font-medium text-neutral-500 hover:text-neutral-900 transition-colors group"
        >
          <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
          <span>Back to Store</span>
        </Link>

        <div className="flex items-center gap-2 text-xs font-semibold text-neutral-400 uppercase tracking-widest">
          <Shield className="w-3.5 h-3.5" />
          <span>Secure Admin Portal</span>
        </div>
      </header>

      {/* Main Login Card */}
      <motion.main
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="w-full max-w-[420px] my-auto py-8"
      >
        {/* Minimal Brand Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-neutral-900 text-white shadow-md shadow-neutral-900/10 mb-4">
            <Lock className="w-5 h-5" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-neutral-900">
            Admin Sign In
          </h1>
          <p className="text-sm text-neutral-500 mt-2 font-normal">
            Enter your credentials to access the management dashboard.
          </p>
        </div>

        {/* Minimal White Form Card */}
        <div className="bg-white border border-neutral-200/80 rounded-2xl p-6 sm:p-8 shadow-sm">
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Error Notification */}
            {error && (
              <motion.div
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex items-start gap-2.5 p-3.5 bg-red-50/80 border border-red-200/80 rounded-xl text-red-600 text-xs font-medium"
              >
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{error}</span>
              </motion.div>
            )}

            {/* Username Field */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-neutral-700 uppercase tracking-wider">
                Username
              </label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400 pointer-events-none" />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter username"
                  className="w-full pl-10 pr-4 py-2.5 bg-neutral-50/60 hover:bg-neutral-50 focus:bg-white border border-neutral-200 focus:border-neutral-900 rounded-xl text-neutral-900 placeholder:text-neutral-400 text-sm outline-none focus:ring-4 focus:ring-neutral-900/5 transition-all"
                  required
                  autoFocus
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-neutral-700 uppercase tracking-wider">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400 pointer-events-none" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full pl-10 pr-11 py-2.5 bg-neutral-50/60 hover:bg-neutral-50 focus:bg-white border border-neutral-200 focus:border-neutral-900 rounded-xl text-neutral-900 placeholder:text-neutral-400 text-sm outline-none focus:ring-4 focus:ring-neutral-900/5 transition-all"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-700 transition-colors p-1 rounded-md"
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 px-4 bg-neutral-900 hover:bg-black text-white rounded-xl font-medium text-sm transition-all shadow-sm active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 group"
              >
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Signing in...</span>
                  </>
                ) : (
                  <>
                    <span>Continue to Dashboard</span>
                    <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Minimal footer note */}
          <div className="mt-6 pt-5 border-t border-neutral-100 text-center">
            <p className="text-xs text-neutral-400">
              STREET MOBILE Management System • Authorized Access Only
            </p>
          </div>
        </div>
      </motion.main>

      {/* Page Footer */}
      <footer className="w-full max-w-5xl py-4 text-center text-xs text-neutral-400">
        &copy; {new Date().getFullYear()} Street Mobile. All rights reserved.
      </footer>
    </div>
  );
}
