"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Grid3X3, Search, ShoppingBag, Heart } from "lucide-react";
import { cn } from "@/lib/utils";
import { useCart } from "@/lib/cart-context";
import { motion } from "framer-motion";

export default function MobileNav() {
  const pathname = usePathname();
  const { itemCount } = useCart();

  // Hide bottom nav on admin routes
  if (pathname.startsWith("/admin")) return null;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 lg:hidden bg-zinc-950/90 backdrop-blur-xl border-t border-white/10 safe-bottom">
      <div className="grid grid-cols-4 items-center h-14 sm:h-16 px-2">
        {/* Home */}
        <Link
          href="/"
          className={cn(
            "flex flex-col items-center justify-center gap-0.5 text-[10px] font-medium transition-all relative py-1",
            pathname === "/" ? "text-white font-semibold" : "text-white/40 hover:text-white/80"
          )}
        >
          <Home className={cn("w-5 h-5 transition-transform", pathname === "/" && "scale-110 text-white")} />
          <span>Home</span>
          {pathname === "/" && (
            <motion.div
              layoutId="bottomNavIndicator"
              className="absolute bottom-1 w-1 h-1 rounded-full bg-white"
              transition={{ type: "spring", stiffness: 400, damping: 30 }}
            />
          )}
        </Link>

        {/* Categories */}
        <Link
          href="/categories"
          className={cn(
            "flex flex-col items-center justify-center gap-0.5 text-[10px] font-medium transition-all relative py-1",
            pathname.startsWith("/categories") ? "text-white font-semibold" : "text-white/40 hover:text-white/80"
          )}
        >
          <Grid3X3 className={cn("w-5 h-5 transition-transform", pathname.startsWith("/categories") && "scale-110 text-white")} />
          <span>Categories</span>
          {pathname.startsWith("/categories") && (
            <motion.div
              layoutId="bottomNavIndicator"
              className="absolute bottom-1 w-1 h-1 rounded-full bg-white"
              transition={{ type: "spring", stiffness: 400, damping: 30 }}
            />
          )}
        </Link>

        {/* Search */}
        <button
          onClick={() => window.dispatchEvent(new CustomEvent("open-search-overlay"))}
          className="flex flex-col items-center justify-center gap-0.5 text-[10px] font-medium text-white/40 hover:text-white/80 transition-all py-1"
        >
          <Search className="w-5 h-5" />
          <span>Search</span>
        </button>

        {/* Products / Shop */}
        <Link
          href="/products"
          className={cn(
            "flex flex-col items-center justify-center gap-0.5 text-[10px] font-medium transition-all relative py-1",
            pathname.startsWith("/products") ? "text-white font-semibold" : "text-white/40 hover:text-white/80"
          )}
        >
          <div className="relative">
            <ShoppingBag className={cn("w-5 h-5 transition-transform", pathname.startsWith("/products") && "scale-110 text-white")} />
            {itemCount > 0 && (
              <span className="absolute -top-1.5 -right-2 bg-red-600 text-white text-[9px] font-black px-1.5 py-0.2 rounded-full leading-tight">
                {itemCount > 99 ? "99+" : itemCount}
              </span>
            )}
          </div>
          <span>Shop</span>
          {pathname.startsWith("/products") && (
            <motion.div
              layoutId="bottomNavIndicator"
              className="absolute bottom-1 w-1 h-1 rounded-full bg-white"
              transition={{ type: "spring", stiffness: 400, damping: 30 }}
            />
          )}
        </Link>
      </div>
    </nav>
  );
}
