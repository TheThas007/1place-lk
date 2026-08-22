"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Sparkles, LayoutGrid, ShoppingBag, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { useCart } from "@/lib/cart-context";
import { useAuth } from "@/lib/auth-context";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";

export default function MobileNav() {
  const pathname = usePathname();
  const { itemCount } = useCart();
  const { user } = useAuth();

  // Hide nav when virtual keyboard is open (prevents overlap with input fields)
  const [keyboardOpen, setKeyboardOpen] = useState(false);

  useEffect(() => {
    const vv = window.visualViewport;
    if (!vv) return;

    const handleResize = () => {
      // Check if visualViewport shrunk significantly compared to window.innerHeight
      const diff = window.innerHeight - vv.height;
      setKeyboardOpen(diff > 150);
    };

    vv.addEventListener("resize", handleResize);
    return () => vv.removeEventListener("resize", handleResize);
  }, []);

  // Hide bottom nav on admin, checkout, and product detail pages
  if (
    keyboardOpen ||
    pathname.startsWith("/admin") ||
    pathname.startsWith("/checkout") ||
    (pathname.startsWith("/products/") && pathname !== "/products")
  ) {
    return null;
  }

  const handleOpenAssistant = () => {
    window.dispatchEvent(new CustomEvent("open-street-assistant"));
  };

  const handleOpenCart = () => {
    window.dispatchEvent(new CustomEvent("open-cart-drawer"));
  };

  const handleAccountClick = () => {
    if (!user) {
      window.dispatchEvent(new CustomEvent("open-auth-modal"));
    }
  };

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-[#090D14]/95 backdrop-blur-xl border-t border-white/10"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <div className="grid grid-cols-5 items-center h-[56px] px-1">
        {/* 1. For You (Home) */}
        <Link
          href="/"
          className={cn(
            "flex flex-col items-center justify-center gap-0.5 text-[10px] font-medium transition-all relative py-1",
            pathname === "/" ? "text-white font-black" : "text-white/40 hover:text-white/80"
          )}
        >
          <Home className={cn("w-5 h-5 transition-transform", pathname === "/" && "scale-110 text-white")} />
          <span>For You</span>
          {pathname === "/" && (
            <motion.div
              layoutId="bottomNavIndicator"
              className="absolute bottom-0.5 w-1 h-1 rounded-full bg-white"
              transition={{ type: "spring", stiffness: 400, damping: 30 }}
            />
          )}
        </Link>

        {/* 2. Assistant (Streetla AI) */}
        <button
          type="button"
          onClick={handleOpenAssistant}
          className="flex flex-col items-center justify-center gap-0.5 text-[10px] font-medium text-white/50 hover:text-white transition-all py-1 cursor-pointer"
        >
          <div className="relative">
            <Sparkles className="w-5 h-5 text-amber-400" />
          </div>
          <span>Assistant</span>
        </button>

        {/* 3. Categories (Shop Catalog) */}
        <Link
          href="/categories"
          className={cn(
            "flex flex-col items-center justify-center gap-0.5 text-[10px] font-medium transition-all relative py-1",
            pathname.startsWith("/categories") || pathname === "/products"
              ? "text-white font-black"
              : "text-white/40 hover:text-white/80"
          )}
        >
          <LayoutGrid className={cn("w-5 h-5 transition-transform", (pathname.startsWith("/categories") || pathname === "/products") && "scale-110 text-white")} />
          <span>Categories</span>
          {(pathname.startsWith("/categories") || pathname === "/products") && (
            <motion.div
              layoutId="bottomNavIndicator"
              className="absolute bottom-0.5 w-1 h-1 rounded-full bg-white"
              transition={{ type: "spring", stiffness: 400, damping: 30 }}
            />
          )}
        </Link>

        {/* 4. Cart */}
        <Link
          href="/cart"
          className={cn(
            "flex flex-col items-center justify-center gap-0.5 text-[10px] font-medium transition-all py-1 relative",
            pathname === "/cart" ? "text-white font-black" : "text-white/40 hover:text-white/80"
          )}
        >
          <div className="relative">
            <ShoppingBag className="w-5 h-5" />
            {itemCount > 0 && (
              <span className="absolute -top-1.5 -right-2 bg-red-600 text-white text-[9px] font-black px-1.5 py-0.2 rounded-full leading-tight">
                {itemCount > 99 ? "99+" : itemCount}
              </span>
            )}
          </div>
          <span>Cart</span>
          {pathname === "/cart" && (
            <motion.div
              layoutId="bottomNavIndicator"
              className="absolute bottom-0.5 w-1 h-1 rounded-full bg-white"
              transition={{ type: "spring", stiffness: 400, damping: 30 }}
            />
          )}
        </Link>

        {/* 5. Account */}
        {user ? (
          <Link
            href="/orders"
            className={cn(
              "flex flex-col items-center justify-center gap-0.5 text-[10px] font-medium transition-all relative py-1",
              pathname.startsWith("/orders") ? "text-white font-black" : "text-white/40 hover:text-white/80"
            )}
          >
            <User className="w-5 h-5" />
            <span>Account</span>
            {pathname.startsWith("/orders") && (
              <motion.div
                layoutId="bottomNavIndicator"
                className="absolute bottom-0.5 w-1 h-1 rounded-full bg-white"
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
              />
            )}
          </Link>
        ) : (
          <button
            type="button"
            onClick={handleAccountClick}
            className="flex flex-col items-center justify-center gap-0.5 text-[10px] font-medium text-white/40 hover:text-white/80 transition-all py-1 cursor-pointer"
          >
            <User className="w-5 h-5" />
            <span>Account</span>
          </button>
        )}
      </div>
    </nav>
  );
}
