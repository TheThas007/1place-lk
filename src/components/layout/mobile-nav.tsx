"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, LayoutGrid, Search, Heart, ShoppingCart } from "lucide-react";
import { cn } from "@/lib/utils";
import { useCart } from "@/lib/cart-context";
import { useWishlist } from "@/lib/wishlist-context";

export default function MobileNav() {
  const pathname = usePathname();
  const { itemCount } = useCart();
  const { wishlist } = useWishlist();

  // Hide bottom nav on admin, checkout, and product detail pages (where sticky purchase bar is active)
  if (
    pathname.startsWith("/admin") ||
    pathname.startsWith("/checkout") ||
    (pathname.startsWith("/products/") && pathname !== "/products")
  ) {
    return null;
  }

  const isHome = pathname === "/";
  const isShop = pathname.startsWith("/products") || pathname.startsWith("/categories");
  const isWishlist = pathname.startsWith("/wishlist");
  const isCart = pathname.startsWith("/cart");

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 lg:hidden bg-white border-t border-neutral-200/90 shadow-[0_-4px_16px_rgba(0,0,0,0.05)] safe-bottom">
      <div className="grid grid-cols-5 items-center h-14 sm:h-16 px-1 max-w-md mx-auto">
        {/* 1. Home */}
        <Link
          href="/"
          className={cn(
            "flex flex-col items-center justify-center gap-0.5 text-[10px] transition-all relative py-1",
            isHome ? "text-[#ED0712] font-bold" : "text-neutral-600 hover:text-neutral-900 font-medium"
          )}
        >
          <Home
            className={cn(
              "w-5 h-5 transition-transform",
              isHome ? "text-[#ED0712] fill-[#ED0712]" : "text-neutral-700"
            )}
          />
          <span>Home</span>
        </Link>

        {/* 2. Shop */}
        <Link
          href="/products"
          className={cn(
            "flex flex-col items-center justify-center gap-0.5 text-[10px] transition-all relative py-1",
            isShop ? "text-[#ED0712] font-bold" : "text-neutral-600 hover:text-neutral-900 font-medium"
          )}
        >
          <LayoutGrid
            className={cn(
              "w-5 h-5 transition-transform",
              isShop ? "text-[#ED0712]" : "text-neutral-700"
            )}
          />
          <span>Shop</span>
        </Link>

        {/* 3. Search */}
        <button
          type="button"
          onClick={() => window.dispatchEvent(new CustomEvent("open-search-overlay"))}
          className="flex flex-col items-center justify-center gap-0.5 text-[10px] font-medium text-neutral-600 hover:text-neutral-900 transition-all py-1 cursor-pointer"
        >
          <Search className="w-5 h-5 text-neutral-700" />
          <span>Search</span>
        </button>

        {/* 4. Wishlist */}
        <Link
          href="/wishlist"
          className={cn(
            "flex flex-col items-center justify-center gap-0.5 text-[10px] transition-all relative py-1",
            isWishlist ? "text-[#ED0712] font-bold" : "text-neutral-600 hover:text-neutral-900 font-medium"
          )}
        >
          <div className="relative">
            <Heart
              className={cn(
                "w-5 h-5 transition-transform",
                isWishlist ? "text-[#ED0712] fill-[#ED0712]" : "text-neutral-700"
              )}
            />
            {wishlist.length > 0 && (
              <span className="absolute -top-1.5 -right-2 bg-[#ED0712] text-white text-[9px] font-black px-1.5 py-0.2 rounded-full leading-tight">
                {wishlist.length}
              </span>
            )}
          </div>
          <span>Wishlist</span>
        </Link>

        {/* 5. Cart */}
        <button
          type="button"
          onClick={() => window.dispatchEvent(new CustomEvent("open-cart-drawer"))}
          className={cn(
            "flex flex-col items-center justify-center gap-0.5 text-[10px] transition-all py-1 relative cursor-pointer",
            isCart ? "text-[#ED0712] font-bold" : "text-neutral-600 hover:text-neutral-900 font-medium"
          )}
        >
          <div className="relative">
            <ShoppingCart
              className={cn(
                "w-5 h-5 transition-transform",
                isCart ? "text-[#ED0712]" : "text-neutral-700"
              )}
            />
            {itemCount > 0 && (
              <span className="absolute -top-1.5 -right-2 bg-[#ED0712] text-white text-[9px] font-black px-1.5 py-0.2 rounded-full leading-tight">
                {itemCount > 99 ? "99+" : itemCount}
              </span>
            )}
          </div>
          <span>Cart</span>
        </button>
      </div>
    </nav>
  );
}
