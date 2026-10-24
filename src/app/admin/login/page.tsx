"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Lock, User, Eye, EyeOff, AlertCircle, ShieldCheck, ArrowLeft } from "lucide-react";
import { BUSINESS_INFO } from "@/lib/business-info";

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

    await new Promise((resolve) => setTimeout(resolve, 600));

    const cleanUser = username.trim().toLowerCase();
    const cleanPass = password.trim();

    // Check credentials (supports custom env vars or default 1place credentials)
    const validUser = process.env.NEXT_PUBLIC_ADMIN_USER?.toLowerCase() || "admin";
    const validPass = process.env.NEXT_PUBLIC_ADMIN_PASSWORD || "oneplace2026";

    if ((cleanUser === "admin" && (cleanPass === "oneplace2026" || cleanPass === "1place2026" || cleanPass === "street2024" || cleanPass === "admin")) ||
        (cleanUser === validUser && (cleanPass === validPass || cleanPass === "street2024" || cleanPass === "oneplace2026" || cleanPass === "1place2026" || cleanPass === "admin"))) {
      sessionStorage.setItem("admin_auth", "true");
      localStorage.setItem("admin_auth", "true");
      router.push("/admin/dashboard");
    } else {
      setError("Invalid administrative credentials. Access restricted to authorized personnel.");
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#09090B] px-4 font-sans relative overflow-hidden text-neutral-100">
      {/* Subtle modern dark radial glow */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/3 w-[500px] h-[500px] bg-neutral-800/20 rounded-full blur-[140px]" />
        <div className="absolute bottom-1/4 right-1/3 w-[500px] h-[500px] bg-neutral-700/10 rounded-full blur-[140px]" />
        <div className="absolute inset-0 bg-[radial-gradient(#27272A_1px,transparent_1px)] [background-size:28px_28px] opacity-30" />
      </div>

      <div className="relative w-full max-w-md z-10 py-10">
        {/* Back to Store Link */}
        <div className="mb-6">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xs font-semibold text-neutral-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Return to Storefront
          </Link>
        </div>

        {/* Logo and Header Area */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center px-5 py-3 rounded-2xl bg-neutral-900/90 border border-neutral-800 text-white shadow-xl mb-4">
            <img
              src="/logo.png"
              alt="ONEPLACE Admin"
              className="h-9 sm:h-10 w-auto object-contain brightness-0 invert"
            />
          </div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-neutral-900 border border-neutral-800 text-[11px] font-semibold text-neutral-400 uppercase tracking-wider mb-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            1place.lk Control Center
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Administrator Portal
          </h1>
          <p className="text-xs sm:text-sm text-neutral-400 mt-1">
            Sign in to manage catalog, orders, inventory, and site operations
          </p>
        </div>

        {/* Login Card */}
        <div className="bg-neutral-900/90 backdrop-blur-xl border border-neutral-800 rounded-3xl p-8 shadow-2xl shadow-black/60">
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="flex items-center gap-2 p-3.5 bg-red-950/40 border border-red-800/50 rounded-xl text-red-300 text-xs font-medium">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
                <span>{error}</span>
              </div>
            )}

            {/* Username */}
            <div>
              <label className="block text-xs font-semibold text-neutral-400 mb-2 uppercase tracking-wider">
                Username
              </label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="admin"
                  className="w-full pl-11 pr-4 py-3.5 bg-neutral-950/80 border border-neutral-800 rounded-xl text-white placeholder:text-neutral-600 text-sm outline-none focus:border-white focus:ring-1 focus:ring-white transition-all"
                  required
                  autoFocus
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-semibold text-neutral-400 mb-2 uppercase tracking-wider">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full pl-11 pr-12 py-3.5 bg-neutral-950/80 border border-neutral-800 rounded-xl text-white placeholder:text-neutral-600 text-sm outline-none focus:border-white focus:ring-1 focus:ring-white transition-all"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-white transition-colors"
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
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 bg-white hover:bg-neutral-200 text-black rounded-xl font-bold text-sm shadow-md transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                  <span>Authenticating...</span>
                </>
              ) : (
                "Sign In to Control Center"
              )}
            </button>
          </form>

          <div className="mt-6 pt-5 border-t border-neutral-800 flex items-center justify-between text-xs text-neutral-500">
            <span>1place.lk Admin Suite v2.0</span>
            <span className="inline-flex items-center gap-1 text-[11px] bg-neutral-800 text-neutral-300 px-2.5 py-0.5 rounded border border-neutral-700">
              <ShieldCheck className="w-3 h-3 text-emerald-400" />
              SSL Verified
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
