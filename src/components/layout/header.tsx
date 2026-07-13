"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, Phone, MapPin, ChevronRight } from "lucide-react";
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
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = isMobileMenuOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [isMobileMenuOpen]);

  return (
    <>
      <motion.header
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: "spring", damping: 25, stiffness: 120, delay: 0.1 }}
        className={cn(
          "fixed top-0 left-0 right-0 z-50 bg-black border-b transition-shadow duration-500",
          isScrolled
            ? "border-white/10 shadow-[0_4px_40px_rgba(0,0,0,0.6)]"
            : "border-white/[0.06]"
        )}
      >
        {/* ── Animated shimmer accent line ── */}
        <div className="h-[1.5px] w-full overflow-hidden">
          <motion.div
            className="h-full w-[200%] bg-gradient-to-r from-transparent via-white/30 via-50% to-transparent"
            animate={{ x: ["-50%", "0%"] }}
            transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
          />
        </div>

        <div className="max-w-7xl mx-auto px-4 lg:px-6">
          <div className="flex items-center justify-between h-[100px] lg:h-[110px]">

            {/* ── Logo ── */}
            <Link href="/" className="flex items-center shrink-0 group">
              <motion.div
                className="relative flex items-center"
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.97 }}
                transition={{ type: "spring", stiffness: 400, damping: 17 }}
              >
                <img
                  src="/logo.png"
                  alt="STREET MOBILE Logo"
                  className="w-[130px] sm:w-[160px] lg:w-[200px] h-auto object-contain"
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
              </motion.div>
            </Link>

            {/* ── Desktop Nav ── */}
            <nav className="hidden lg:flex items-center gap-0.5">
              {navLinks.map((link, i) => {
                const isActive = pathname === link.href;
                return (
                  <motion.div
                    key={link.href}
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 + i * 0.06, duration: 0.4 }}
                  >
                    <Link
                      href={link.href}
                      className={cn(
                        "relative px-4 py-2 rounded-lg text-[13px] font-medium transition-all duration-300 group",
                        isActive
                          ? "text-white"
                          : "text-white/50 hover:text-white"
                      )}
                    >
                      <span className="relative z-10">{link.label}</span>

                      {/* Active indicator — animated pill */}
                      {isActive && (
                        <motion.div
                          layoutId="navActivePill"
                          className="absolute inset-0 rounded-lg bg-white/[0.08] border border-white/[0.08]"
                          transition={{ type: "spring", bounce: 0.2, duration: 0.5 }}
                        />
                      )}

                      {/* Hover glow underline */}
                      <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-[2px] bg-gradient-to-r from-transparent via-white/60 to-transparent rounded-full transition-all duration-300 group-hover:w-3/4" />
                    </Link>
                  </motion.div>
                );
              })}
            </nav>

            {/* ── Actions ── */}
            <div className="flex items-center gap-2">
              {/* Contact pill — desktop only */}
              <motion.a
                href="tel:+94774141118"
                className="hidden lg:flex items-center gap-2 ml-2 px-5 py-2.5 rounded-full bg-white text-black text-[13px] font-semibold shadow-[0_0_20px_rgba(255,255,255,0.1)] overflow-hidden relative"
                whileHover={{ scale: 1.05, boxShadow: "0 0 30px rgba(255,255,255,0.2)" }}
                whileTap={{ scale: 0.95 }}
                transition={{ type: "spring", stiffness: 400, damping: 17 }}
              >
                <Phone className="w-3.5 h-3.5" />
                Call Us
                {/* Shine sweep effect */}
                <motion.span
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent skew-x-[-20deg]"
                  animate={{ x: ["-200%", "200%"] }}
                  transition={{ duration: 3, repeat: Infinity, repeatDelay: 2, ease: "easeInOut" }}
                />
              </motion.a>

              {/* Mobile hamburger */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                aria-label="Menu"
                className="p-2.5 rounded-lg text-white/60 hover:text-white hover:bg-white/10 transition-all lg:hidden"
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

        {/* ── Animated bottom glow line ── */}
        <div className="absolute bottom-0 left-0 right-0 h-[1px] overflow-hidden">
          <motion.div
            className="h-full w-full"
            style={{
              background: "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.15) 25%, rgba(255,255,255,0.3) 50%, rgba(255,255,255,0.15) 75%, transparent 100%)",
            }}
            animate={{ opacity: [0.3, 0.7, 0.3] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          />
        </div>
      </motion.header>

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
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
              onClick={() => setIsMobileMenuOpen(false)}
            />

            {/* Drawer */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 28, stiffness: 280 }}
              className="fixed top-0 right-0 bottom-0 w-[82%] max-w-[340px] bg-black border-l border-white/[0.06] z-50 lg:hidden shadow-[−20px_0_60px_rgba(0,0,0,0.8)] flex flex-col"
            >
              {/* Drawer header */}
              <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.06]">
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
                      initial={{ opacity: 0, x: 30 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.1 + index * 0.05, duration: 0.35, ease: "easeOut" }}
                    >
                      <Link
                        href={link.href}
                        onClick={() => setIsMobileMenuOpen(false)}
                        className={cn(
                          "flex items-center justify-between px-4 py-3.5 rounded-xl text-sm font-medium transition-all mb-1 group",
                          isActive
                            ? "bg-white/[0.08] text-white border border-white/[0.08]"
                            : "text-white/50 hover:text-white hover:bg-white/[0.04]"
                        )}
                      >
                        {link.label}
                        <ChevronRight className={cn(
                          "w-4 h-4 transition-all duration-300",
                          isActive ? "text-white/60" : "text-white/15 group-hover:text-white/40 group-hover:translate-x-0.5"
                        )} />
                      </Link>
                    </motion.div>
                  );
                })}
              </nav>

              {/* Drawer footer */}
              <div className="px-5 py-5 border-t border-white/[0.06] space-y-3">
                <motion.a
                  href="tel:+94774141118"
                  className="flex items-center gap-3 w-full px-4 py-3 rounded-xl bg-white text-black text-sm font-semibold relative overflow-hidden"
                  whileTap={{ scale: 0.97 }}
                >
                  <Phone className="w-4 h-4" />
                  +94 77 414 1118
                  <motion.span
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent skew-x-[-20deg]"
                    animate={{ x: ["-200%", "200%"] }}
                    transition={{ duration: 3, repeat: Infinity, repeatDelay: 2, ease: "easeInOut" }}
                  />
                </motion.a>
                <p className="flex items-center gap-2 text-xs text-white/25 px-1">
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
