"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Menu,
  X,
  Phone,
  MapPin,
  ChevronRight,
} from "lucide-react";
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

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isMobileMenuOpen]);

  return (
    <>
      {/* Main Header */}
      <header
        className={cn(
          "sticky top-0 z-50 transition-all duration-500 bg-black",
          isScrolled
            ? "shadow-[0_1px_0_rgba(255,255,255,0.08)]"
            : ""
        )}
      >
        <div className="max-w-7xl mx-auto px-4 lg:px-6">
          <div className="flex items-center justify-between h-28 lg:h-36">
            {/* Logo */}
            <Link href="/" className="flex items-center shrink-0 group">
              <div className="relative w-[360px] h-[96px] sm:w-[460px] sm:h-[100px] lg:w-[640px] lg:h-[130px] flex items-center justify-start transition-transform group-hover:scale-105">
                {/* The actual logo image */}
                <img 
                  src="/logo.png" 
                  alt="STREET MOBILE Logo" 
                  className="absolute inset-0 w-full h-full object-contain object-left z-10"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none';
                    // Show fallback if image fails
                    const fallback = document.getElementById('logo-fallback-header');
                    if (fallback) fallback.style.display = 'block';
                  }}
                />
                {/* Fallback text if image fails to load (hidden by default) */}
                <span id="logo-fallback-header" className="font-bold text-lg tracking-tight hidden z-0">
                  STREET MOBILE
                </span>
              </div>
            </Link>

            {/* Desktop Nav */}
            <nav className="hidden lg:flex items-center gap-8">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-sm text-white/70 hover:text-white transition-colors duration-200 relative group"
                >
                  {link.label}
                  <span className="absolute -bottom-1 left-0 w-0 h-[1.5px] bg-white transition-all duration-300 group-hover:w-full" />
                </Link>
              ))}
            </nav>

            {/* Actions */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsSearchOpen(!isSearchOpen)}
                className="p-2 rounded-full hover:bg-white/10 transition-colors text-white"
                aria-label="Search"
              >
                <Search className="w-5 h-5 text-white" />
              </button>
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="p-2 rounded-full hover:bg-white/10 transition-colors lg:hidden text-white"
                aria-label="Menu"
              >
                {isMobileMenuOpen ? (
                  <X className="w-5 h-5 text-white" />
                ) : (
                  <Menu className="w-5 h-5 text-white" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Search Bar */}
        <AnimatePresence>
          {isSearchOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              className="overflow-hidden border-t border-white/10"
            >
              <div className="max-w-7xl mx-auto px-4 lg:px-6 py-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/50" />
                  <input
                    type="text"
                    placeholder="Search products..."
                    className="w-full pl-10 pr-4 py-2.5 bg-white/10 text-white placeholder:text-white/40 rounded-xl text-sm outline-none focus:ring-2 focus:ring-white/20 transition-all"
                    autoFocus
                  />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="fixed inset-0 bg-black/40 z-40 lg:hidden"
              onClick={() => setIsMobileMenuOpen(false)}
            />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="fixed top-0 right-0 bottom-0 w-[85%] max-w-sm bg-white z-50 lg:hidden shadow-2xl"
            >
              <div className="flex flex-col h-full">
                <div className="flex items-center justify-between p-4 border-b border-border">
                  <span className="font-semibold text-sm">Menu</span>
                  <button
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="p-2 rounded-full hover:bg-card"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <nav className="flex-1 overflow-y-auto py-4">
                  {navLinks.map((link, index) => (
                    <motion.div
                      key={link.href}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <Link
                        href={link.href}
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="flex items-center justify-between px-6 py-4 text-sm hover:bg-card transition-colors"
                      >
                        {link.label}
                        <ChevronRight className="w-4 h-4 text-muted" />
                      </Link>
                    </motion.div>
                  ))}
                </nav>
                <div className="p-4 border-t border-border space-y-3">
                  <a
                    href="tel:+94774141118"
                    className="flex items-center gap-2 text-sm text-muted"
                  >
                    <Phone className="w-4 h-4" />
                    +94 77 414 1118
                  </a>
                  <p className="flex items-center gap-2 text-sm text-muted">
                    <MapPin className="w-4 h-4" />
                    Vavuniya, Sri Lanka
                  </p>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
