"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Store, Search, ShoppingCart, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { useCart } from "@/lib/cart-context";

export default function MobileNav() {
  const pathname = usePathname();
  const { itemCount } = useCart();

  // Hide bottom nav on admin, checkout, and product detail pages
  if (
    pathname.startsWith("/admin") ||
    pathname.startsWith("/checkout") ||
    (pathname.startsWith("/products/") && pathname !== "/products")
  ) {
    return null;
  }

  const isHome = pathname === "/";
  const isShop =
    pathname.startsWith("/categories") ||
    pathname.startsWith("/category") ||
    pathname.startsWith("/shop-by-brand");
  const isCart = pathname.startsWith("/cart");
  const isAccount = pathname.startsWith("/orders") || pathname.startsWith("/login");

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-[#090909] border-t border-neutral-800/90 shadow-[0_-4px_20px_rgba(0,0,0,0.4)] safe-bottom select-none font-outfit">
      <div className="grid grid-cols-5 items-center h-14 px-1 max-w-md mx-auto">
        {/* 1. Home */}
        <Link
          href="/"
          className={cn(
            "flex flex-col items-center justify-center gap-1 text-[10px] transition-all relative py-1 min-h-[44px]",
            isHome ? "text-white font-bold" : "text-neutral-400 hover:text-white font-medium"
          )}
        >
          <Home
            className={cn(
              "w-5 h-5 transition-transform",
              isHome ? "text-white fill-white" : "text-neutral-400"
            )}
          />
          <span>Home</span>
        </Link>

        {/* 2. Shop */}
        <Link
          href="/categories"
          className={cn(
            "flex flex-col items-center justify-center gap-1 text-[10px] transition-all relative py-1 min-h-[44px]",
            isShop ? "text-white font-bold" : "text-neutral-400 hover:text-white font-medium"
          )}
        >
          <Store
            className={cn(
              "w-5 h-5 transition-transform",
              isShop ? "text-white stroke-[2.5]" : "text-neutral-400"
            )}
          />
          <span>Shop</span>
        </Link>

        {/* 3. Search */}
        <button
          type="button"
          onClick={() => window.dispatchEvent(new CustomEvent("open-search-overlay"))}
          className="flex flex-col items-center justify-center gap-1 text-[10px] font-medium text-neutral-400 hover:text-white transition-all py-1 min-h-[44px] cursor-pointer"
        >
          <Search className="w-5 h-5 text-neutral-400" />
          <span>Search</span>
        </button>

        {/* 4. Cart */}
        <button
          type="button"
          onClick={() => window.dispatchEvent(new CustomEvent("open-cart-drawer"))}
          className={cn(
            "flex flex-col items-center justify-center gap-1 text-[10px] transition-all py-1 min-h-[44px] relative cursor-pointer",
            isCart ? "text-white font-bold" : "text-neutral-400 hover:text-white font-medium"
          )}
        >
          <div className="relative">
            <ShoppingCart
              className={cn(
                "w-5 h-5 transition-transform",
                isCart ? "text-white stroke-[2.5]" : "text-neutral-400"
              )}
            />
            {itemCount > 0 && (
              <span className="absolute -top-1.5 -right-2 bg-white text-black text-[9px] font-black px-1.5 py-0.2 rounded-full leading-tight shadow-sm border border-black/10">
                {itemCount > 99 ? "99+" : itemCount}
              </span>
            )}
          </div>
          <span>Cart</span>
        </button>

        {/* 5. Account */}
        <Link
          href="/orders"
          className={cn(
            "flex flex-col items-center justify-center gap-1 text-[10px] transition-all relative py-1 min-h-[44px]",
            isAccount ? "text-white font-bold" : "text-neutral-400 hover:text-white font-medium"
          )}
        >
          <User
            className={cn(
              "w-5 h-5 transition-transform",
              isAccount ? "text-white stroke-[2.5]" : "text-neutral-400"
            )}
          />
          <span>Account</span>
        </Link>
      </div>
    </nav>
  );
}
