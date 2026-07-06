"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Menu, X, Phone, MapPin, ChevronRight, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/products", label: "Products" },
  { href: "/categories", label: "Categories" },
  { href: "/gallery", label: "Gallery" },
  { href: "/reviews", label: "Reviews" },
  { href: "/contact", label: "Contact" },
];

export default function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = isMobileMenuOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [isMobileMenuOpen]);

  return (
    <>
      <header
        className={cn(
          "sticky top-0 z-50 transition-all duration-500",
          isScrolled
            ? "bg-black/95 backdrop-blur-xl shadow-[0_1px_0_rgba(255,255,255,0.07)] shadow-black/40"
            : "bg-black"
        )}
      >
        {/* Top accent line */}
        <div className="h-[2px] bg-gradient-to-r from-transparent via-white/20 to-transparent" />

        <div className="max-w-7xl mx-auto px-4 lg:px-6">
          <div className="flex items-center justify-between h-[100px] lg:h-[120px]">

            {/* ── Logo ── */}
            <Link href="/" className="flex items-center shrink-0 group">
              <div className="relative flex items-center">
                <img
                  src="/logo.png"
                  alt="STREET MOBILE Logo"
                  className="w-[150px] sm:w-[180px] lg:w-[220px] h-auto object-contain origin-left transition-transform duration-300 group-hover:scale-105"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = "none";
                    const fb = document.getElementById("logo-fallback-header");
                    if (fb) fb.style.display = "flex";
                  }}
                />
                {/* Fallback */}
                <span
                  id="logo-fallback-header"
                  className="hidden items-center gap-2 font-black text-white text-xl tracking-tight"
                >
                  <span className="w-8 h-8 rounded-xl bg-white flex items-center justify-center text-black text-xs font-black">SM</span>
                  STREET MOBILE
                </span>
              </div>
            </Link>

            {/* ── Desktop Nav ── */}
            <nav className="hidden lg:flex items-center gap-1">
              {navLinks.map((link) => {
                const isActive = pathname === link.href;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={cn(
                      "relative px-3.5 py-2 rounded-lg text-[13px] font-medium transition-all duration-200",
                      isActive
                        ? "text-white bg-white/10"
                        : "text-white/60 hover:text-white hover:bg-white/8"
                    )}
                  >
                    {link.label}
                    {isActive && (
                      <motion.div
                        layoutId="navActivePill"
                        className="absolute inset-0 rounded-lg bg-white/10 border border-white/10"
                        transition={{ type: "spring", bounce: 0.2, duration: 0.4 }}
                      />
                    )}
                  </Link>
                );
              })}
            </nav>

            {/* ── Actions ── */}
            <div className="flex items-center gap-1">
              {/* Search toggle removed per user request */}
              {/* Contact pill — desktop only */}
              <a
                href="tel:+94774141118"
                className="hidden lg:flex items-center gap-2 ml-2 px-4 py-2 rounded-xl bg-white text-black text-[13px] font-semibold hover:bg-white/90 transition-all duration-200 active:scale-95 shadow-lg shadow-white/10"
              >
                <Phone className="w-3.5 h-3.5" />
                Call Us
              </a>

              {/* Mobile hamburger */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                aria-label="Menu"
                className="p-2 rounded-lg text-white/60 hover:text-white hover:bg-white/10 transition-all lg:hidden"
              >
                <AnimatePresence mode="wait" initial={false}>
                  {isMobileMenuOpen ? (
                    <motion.div
                      key="close"
                      initial={{ rotate: -90, opacity: 0 }}
                      animate={{ rotate: 0, opacity: 1 }}
                      exit={{ rotate: 90, opacity: 0 }}
                      transition={{ duration: 0.18 }}
                    >
                      <X className="w-5 h-5 text-white" />
                    </motion.div>
                  ) : (
                    <motion.div
                      key="open"
                      initial={{ rotate: 90, opacity: 0 }}
                      animate={{ rotate: 0, opacity: 1 }}
                      exit={{ rotate: -90, opacity: 0 }}
                      transition={{ duration: 0.18 }}
                    >
                      <Menu className="w-5 h-5 text-white" />
                    </motion.div>
                  )}
                </AnimatePresence>
              </button>
            </div>
          </div>
        </div>

        {/* ── Search Bar ── */}
        <AnimatePresence>
          {isSearchOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
              className="overflow-hidden border-t border-white/8"
            >
              <div className="max-w-7xl mx-auto px-4 lg:px-6 py-3">
                <div className="relative max-w-lg">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                  <input
                    type="text"
                    placeholder="Search products…"
                    autoFocus
                    className="w-full pl-10 pr-4 py-2.5 bg-white/10 text-white placeholder:text-white/35 rounded-xl text-sm outline-none focus:ring-2 focus:ring-white/20 transition-all"
                  />
                  <button
                    onClick={() => setIsSearchOpen(false)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* ── Mobile Menu ── */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
              onClick={() => setIsMobileMenuOpen(false)}
            />

            {/* Drawer */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 28, stiffness: 280 }}
              className="fixed top-0 right-0 bottom-0 w-[82%] max-w-[340px] bg-[#0a0a0a] border-l border-white/8 z-50 lg:hidden shadow-2xl flex flex-col"
            >
              {/* Drawer header */}
              <div className="flex items-center justify-between px-5 py-4 border-b border-white/8">
                <img
                  src="/logo.png"
                  alt="STREET MOBILE"
                  className="h-9 w-auto object-contain"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = "none";
                  }}
                />
                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="p-2 rounded-lg text-white/50 hover:text-white hover:bg-white/10 transition-all"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Nav links */}
              <nav className="flex-1 overflow-y-auto py-3 px-3">
                {navLinks.map((link, index) => {
                  const isActive = pathname === link.href;
                  return (
                    <motion.div
                      key={link.href}
                      initial={{ opacity: 0, x: 24 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.045, duration: 0.3 }}
                    >
                      <Link
                        href={link.href}
                        onClick={() => setIsMobileMenuOpen(false)}
                        className={cn(
                          "flex items-center justify-between px-4 py-3.5 rounded-xl text-sm font-medium transition-all mb-1",
                          isActive
                            ? "bg-white/10 text-white border border-white/10"
                            : "text-white/60 hover:text-white hover:bg-white/6"
                        )}
                      >
                        {link.label}
                        <ChevronRight className={cn("w-4 h-4 transition-colors", isActive ? "text-white/60" : "text-white/20")} />
                      </Link>
                    </motion.div>
                  );
                })}
              </nav>

              {/* Drawer footer */}
              <div className="px-5 py-5 border-t border-white/8 space-y-3">
                <a
                  href="tel:+94774141118"
                  className="flex items-center gap-3 w-full px-4 py-3 rounded-xl bg-white text-black text-sm font-semibold hover:bg-white/90 transition-all active:scale-95"
                >
                  <Phone className="w-4 h-4" />
                  +94 77 414 1118
                </a>
                <p className="flex items-center gap-2 text-xs text-white/30 px-1">
                  <MapPin className="w-3.5 h-3.5" />
                  Vavuniya, Sri Lanka
                </p>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
