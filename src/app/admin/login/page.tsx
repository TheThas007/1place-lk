"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Lock, User, Eye, EyeOff, AlertCircle } from "lucide-react";

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
    await new Promise((resolve) => setTimeout(resolve, 800));

    if (username.trim().toLowerCase() === "admin" && password.trim() === "street2024") {
      // Store auth in sessionStorage
      sessionStorage.setItem("admin_auth", "true");
      localStorage.setItem("admin_auth", "true");
      router.push("/admin/dashboard");
    } else {
      setError("Invalid username or password");
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#121358] px-4 font-sans relative overflow-hidden">
      {/* Background glow halos */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-[#6C63FF]/15 rounded-full blur-[140px]" />
        <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-[#4F46E5]/15 rounded-full blur-[140px]" />
        {/* Subtle decorative grid */}
        <div className="absolute inset-0 bg-[radial-gradient(#2A2D73_1px,transparent_1px)] [background-size:24px_24px] opacity-40" />
      </div>

      <div className="relative w-full max-w-md z-10">
        {/* Logo area */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-tr from-[#6C63FF] to-[#4F46E5] text-white shadow-xl shadow-[#6C63FF]/25 border border-white/20 mb-4 ring-4 ring-[#1E2175]">
            <Lock className="w-8 h-8 text-white" />
          </div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#181A66] border border-[#2A2D73] text-[11px] font-semibold text-[#A8ABCC] uppercase tracking-wider mb-2">
            <span className="w-2 h-2 rounded-full bg-[#10B981] animate-pulse" />
            StreetMobile Management
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight font-sans">
            Admin Portal
          </h1>
          <p className="text-xs sm:text-sm text-[#A8ABCC] mt-1 font-sans">
            Sign in to manage inventory, orders, and store operations
          </p>
        </div>

        {/* Login Card */}
        <div className="bg-[#181A66]/90 backdrop-blur-xl border border-[#2A2D73] rounded-3xl p-8 shadow-2xl shadow-black/40">
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Error Message */}
            {error && (
              <div className="flex items-center gap-2 p-3 bg-rose-500/10 border border-rose-500/25 rounded-xl text-rose-300 text-xs font-medium">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                {error}
              </div>
            )}

            {/* Username */}
            <div>
              <label className="block text-xs font-semibold text-[#A8ABCC] mb-2 uppercase tracking-wider">
                Username
              </label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#A8ABCC]" />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter admin username"
                  className="w-full pl-11 pr-4 py-3.5 bg-[#121358]/80 border border-[#2A2D73] rounded-xl text-white placeholder:text-[#A8ABCC]/50 text-sm outline-none focus:border-[#6C63FF] focus:ring-2 focus:ring-[#6C63FF]/30 transition-all"
                  required
                  autoFocus
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-semibold text-[#A8ABCC] mb-2 uppercase tracking-wider">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#A8ABCC]" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter admin password"
                  className="w-full pl-11 pr-12 py-3.5 bg-[#121358]/80 border border-[#2A2D73] rounded-xl text-white placeholder:text-[#A8ABCC]/50 text-sm outline-none focus:border-[#6C63FF] focus:ring-2 focus:ring-[#6C63FF]/30 transition-all"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-[#A8ABCC] hover:text-white transition-colors"
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 bg-[#6C63FF] hover:bg-[#5B54E0] text-white rounded-xl font-semibold text-sm shadow-lg shadow-[#6C63FF]/30 transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Authenticating...
                </>
              ) : (
                "Sign In to Console"
              )}
            </button>
          </form>

          <div className="mt-6 pt-5 border-t border-[#2A2D73]/60 flex items-center justify-between text-xs text-[#A8ABCC]">
            <span>StreetMobile.lk Admin v2.0</span>
            <span className="text-[11px] bg-[#1E2175] text-[#A8ABCC] px-2 py-0.5 rounded border border-[#2A2D73]">
              SSL Secured
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
