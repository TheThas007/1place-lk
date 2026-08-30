"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Lock, Eye, ArrowRight, ShieldCheck, AlertCircle, ExternalLink, RefreshCw } from "lucide-react";
import Link from "next/link";

export default function AdminPreviewPage() {
  const router = useRouter();
  const [accessCode, setAccessCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Check existing session auth on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const hasAuth =
        sessionStorage.getItem("admin_auth") === "true" ||
        localStorage.getItem("admin_auth") === "true" ||
        document.cookie.includes("sm_admin_preview=authenticated");
      if (hasAuth) {
        setIsAuthenticated(true);
      }
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/admin/validate-preview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: accessCode }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        sessionStorage.setItem("admin_auth", "true");
        localStorage.setItem("admin_auth", "true");
        document.cookie = "sm_admin_preview=authenticated; path=/; max-age=86400";
        setIsAuthenticated(true);
      } else {
        setError(data.message || "Invalid access code");
      }
    } catch {
      setError("Connection error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleLogoutPreview = () => {
    document.cookie = "sm_admin_preview=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
    sessionStorage.removeItem("admin_auth");
    localStorage.removeItem("admin_auth");
    setIsAuthenticated(false);
    setAccessCode("");
  };

  // ── 1. Unauthenticated: Luxury Secret Code Screen ──
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#09090B] text-white px-4 font-outfit relative overflow-hidden">
        {/* Ambient Glows */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-red-600/10 rounded-full blur-[140px]" />
          <div className="absolute bottom-10 right-10 w-72 h-72 bg-blue-600/10 rounded-full blur-[120px]" />
        </div>

        <div className="relative w-full max-w-md">
          {/* Brand Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-3xl bg-white/5 border border-white/10 shadow-2xl mb-4">
              <Lock className="w-7 h-7 text-white/80" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-[0.2em] text-white uppercase">
              STREET MOBILE
            </h1>
            <p className="text-xs font-bold tracking-[0.25em] text-white/50 uppercase mt-1">
              ADMIN PREVIEW ACCESS
            </p>
          </div>

          {/* Access Code Card */}
          <div className="bg-[#121216]/90 backdrop-blur-2xl border border-white/10 rounded-3xl p-7 sm:p-8 shadow-[0_20px_60px_rgba(0,0,0,0.6)]">
            <form onSubmit={handleSubmit} className="space-y-5">
              {error && (
                <div className="flex items-center gap-2.5 p-3.5 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-400 text-xs font-semibold">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <div>
                <label className="block text-[11px] font-bold text-white/60 mb-2 uppercase tracking-wider">
                  Enter Access Code
                </label>
                <div className="relative">
                  <input
                    type="password"
                    value={accessCode}
                    onChange={(e) => setAccessCode(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-4 py-3.5 bg-white/5 border border-white/15 rounded-2xl text-white font-mono placeholder:text-white/20 text-sm outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-all text-center tracking-[0.3em]"
                    required
                    autoFocus
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 bg-white hover:bg-neutral-200 text-black font-extrabold text-xs sm:text-sm rounded-2xl shadow-lg transition-all active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-black/20 border-t-black rounded-full animate-spin" />
                    <span>Verifying...</span>
                  </>
                ) : (
                  <>
                    <span>ACCESS PREVIEW</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            <div className="mt-6 pt-5 border-t border-white/5 text-center">
              <p className="text-[10px] text-white/30 tracking-widest uppercase">
                AUTHORIZED ADMINISTRATORS ONLY
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── 2. Authenticated: Admin Preview Hub ──
  return (
    <div className="min-h-screen bg-[#09090B] text-white font-outfit flex flex-col">
      {/* ── Top Floating Admin Control Bar ── */}
      <header className="sticky top-0 z-50 bg-[#121216]/95 backdrop-blur-xl border-b border-white/10 px-4 sm:px-6 py-3.5 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
          <div>
            <span className="text-xs sm:text-sm font-extrabold tracking-wide text-white flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              ADMIN PREVIEW ACTIVE
            </span>
            <p className="text-[10px] text-white/50 hidden sm:block">
              Launch countdown is bypassed for this browser session.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <Link
            href="/"
            className="px-3.5 py-1.5 bg-white text-black font-extrabold text-xs rounded-xl hover:bg-neutral-200 transition-all flex items-center gap-1.5 shadow-md"
          >
            <Eye className="w-3.5 h-3.5" /> View Public Site
          </Link>
          <Link
            href="/admin/dashboard?tab=launch"
            className="px-3.5 py-1.5 bg-white/10 hover:bg-white/15 border border-white/10 text-white font-bold text-xs rounded-xl transition-all hidden sm:flex items-center gap-1.5"
          >
            Launch Controls
          </Link>
          <button
            onClick={handleLogoutPreview}
            className="px-3 py-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 font-bold text-xs rounded-xl transition-all"
          >
            Lock
          </button>
        </div>
      </header>

      {/* ── Main Preview Content Container ── */}
      <main className="flex-1 max-w-6xl w-full mx-auto p-4 sm:p-8 space-y-6">
        <div className="bg-[#121216] border border-white/10 rounded-3xl p-6 sm:p-8">
          <div className="max-w-2xl space-y-4">
            <span className="text-[10px] font-extrabold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 rounded-full uppercase tracking-wider">
              Preview Mode Enabled
            </span>
            <h2 className="text-2xl sm:text-3xl font-black">
              Welcome to the Pre-Launch Inspection Hub
            </h2>
            <p className="text-sm text-white/60 leading-relaxed">
              Your browser session is authorized to preview the full Street Mobile website before the public countdown completes. You can navigate through every page, inspect catalog items, test categories, and place test orders.
            </p>
          </div>

          {/* Quick Links Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 pt-6 mt-6 border-t border-white/10">
            <Link
              href="/"
              className="p-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl flex items-center justify-between group transition-all"
            >
              <div>
                <h4 className="font-extrabold text-sm text-white group-hover:text-red-400 transition-colors">
                  Homepage
                </h4>
                <p className="text-[11px] text-white/40 mt-0.5">Hero, Showcase, Reviews</p>
              </div>
              <ExternalLink className="w-4 h-4 text-white/40 group-hover:text-white transition-colors" />
            </Link>

            <Link
              href="/products"
              className="p-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl flex items-center justify-between group transition-all"
            >
              <div>
                <h4 className="font-extrabold text-sm text-white group-hover:text-red-400 transition-colors">
                  All Products
                </h4>
                <p className="text-[11px] text-white/40 mt-0.5">Smartphones & Accessories</p>
              </div>
              <ExternalLink className="w-4 h-4 text-white/40 group-hover:text-white transition-colors" />
            </Link>

            <Link
              href="/categories"
              className="p-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl flex items-center justify-between group transition-all"
            >
              <div>
                <h4 className="font-extrabold text-sm text-white group-hover:text-red-400 transition-colors">
                  Categories
                </h4>
                <p className="text-[11px] text-white/40 mt-0.5">Shop by Department & Brands</p>
              </div>
              <ExternalLink className="w-4 h-4 text-white/40 group-hover:text-white transition-colors" />
            </Link>

            <Link
              href="/gallery"
              className="p-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl flex items-center justify-between group transition-all"
            >
              <div>
                <h4 className="font-extrabold text-sm text-white group-hover:text-red-400 transition-colors">
                  Store Gallery
                </h4>
                <p className="text-[11px] text-white/40 mt-0.5">Repairs, Customer Photos</p>
              </div>
              <ExternalLink className="w-4 h-4 text-white/40 group-hover:text-white transition-colors" />
            </Link>

            <Link
              href="/reviews"
              className="p-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl flex items-center justify-between group transition-all"
            >
              <div>
                <h4 className="font-extrabold text-sm text-white group-hover:text-red-400 transition-colors">
                  Customer Reviews
                </h4>
                <p className="text-[11px] text-white/40 mt-0.5">Google Verified Testimonials</p>
              </div>
              <ExternalLink className="w-4 h-4 text-white/40 group-hover:text-white transition-colors" />
            </Link>

            <Link
              href="/admin/dashboard?tab=launch"
              className="p-4 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 rounded-2xl flex items-center justify-between group transition-all"
            >
              <div>
                <h4 className="font-extrabold text-sm text-red-400">
                  Launch Control Panel
                </h4>
                <p className="text-[11px] text-white/40 mt-0.5">Edit launch date & countdown</p>
              </div>
              <ExternalLink className="w-4 h-4 text-red-400" />
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
