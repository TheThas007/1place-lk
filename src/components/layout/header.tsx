"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Menu,
  X,
  Phone,
  MapPin,
  ChevronRight,
  ChevronDown,
  ShoppingBag,
  User,
  LogOut,
  Search,
  Heart,
  Package,
  ArrowRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/auth-context";
import { useCart } from "@/lib/cart-context";
import { useWishlist } from "@/lib/wishlist-context";
import AuthModal from "@/components/auth/AuthModal";
import CartDrawer from "@/components/cart/CartDrawer";
import { categories as fallbackCategories } from "@/lib/data";
import { getCategories } from "@/lib/firestore-client";
import { Category } from "@/lib/types";
import { KNOWN_BRAND_NAMES } from "@/lib/migration-audit";

export default function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobileCategoriesOpen, setIsMobileCategoriesOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [isCategoriesOpen, setIsCategoriesOpen] = useState(false);
  const [catList, setCatList] = useState<Category[]>(fallbackCategories);

  const categoriesRef = useRef<HTMLDivElement>(null);
  const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const pathname = usePathname();
  const { user, signOut } = useAuth();
  const { itemCount } = useCart();
  const { wishlist } = useWishlist();

  const handleHomeClick = () => {
    document.cookie = "sm_home_pref=true; path=/; max-age=86400";
  };

  useEffect(() => {
    async function loadCats() {
      try {
        const dbCats = await getCategories();
        if (dbCats && dbCats.length > 0) {
          setCatList(dbCats);
        }
      } catch (e) {
        console.warn("Using fallback categories in Header:", e);
      }
    }
    loadCats();
  }, []);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const handleOpenAuth = () => setAuthOpen(true);
    window.addEventListener("open-auth-modal", handleOpenAuth);
    return () => window.removeEventListener("open-auth-modal", handleOpenAuth);
  }, []);

  useEffect(() => {
    const handleOpenCart = () => setCartOpen(true);
    window.addEventListener("open-cart-drawer", handleOpenCart);
    return () => window.removeEventListener("open-cart-drawer", handleOpenCart);
  }, []);

  useEffect(() => {
    document.body.style.overflow = isMobileMenuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isMobileMenuOpen]);

  // Click outside & Escape key for categories dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (categoriesRef.current && !categoriesRef.current.contains(event.target as Node)) {
        setIsCategoriesOpen(false);
      }
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsCategoriesOpen(false);
        setUserMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  const handleMouseEnterCategories = () => {
    if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
    setIsCategoriesOpen(true);
  };

  const handleMouseLeaveCategories = () => {
    hoverTimeoutRef.current = setTimeout(() => {
      setIsCategoriesOpen(false);
    }, 150);
  };

  const initials = user?.displayName
    ? user.displayName.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase()
    : user?.email?.[0]?.toUpperCase() ?? "U";

  // Deduplicate categories & exclude brand names for clean presentation
  const uniqueNavCategories = useMemo(() => {
    const map = new Map<string, Category>();
    const brandLowerList = KNOWN_BRAND_NAMES.map((b) => b.toLowerCase());
    
    // Combine Firestore categories + fallbackCategories
    const all = [...catList, ...fallbackCategories];
    all.forEach((c) => {
      if (
        c &&
        c.name &&
        !brandLowerList.includes(c.name.toLowerCase().trim()) &&
        !map.has(c.name.toLowerCase().trim())
      ) {
        map.set(c.name.toLowerCase().trim(), c);
      }
    });
    return Array.from(map.values()).sort((a, b) => (a.sort_order || 99) - (b.sort_order || 99));
  }, [catList]);

  return (
    <>
      <motion.header
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: "spring", damping: 25, stiffness: 120, delay: 0.1 }}
        className={cn(
          "fixed top-0 left-0 right-0 z-50 bg-black border-b transition-all duration-500",
          isScrolled ? "border-white/30 shadow-[0_4px_40px_rgba(0,0,0,0.8)]" : "border-white/20"
        )}
      >
        {/* Shimmer accent line */}
        <div className="h-[1.5px] w-full overflow-hidden">
          <motion.div
            className="h-full w-[200%] bg-gradient-to-r from-transparent via-white/30 via-50% to-transparent"
            animate={{ x: ["-50%", "0%"] }}
            transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
          />
        </div>

        <div className="max-w-7xl mx-auto px-4 lg:px-6">
          <div
            className={cn(
              "flex items-center justify-between transition-all duration-300",
              isScrolled ? "h-16 lg:h-16" : "h-[100px] lg:h-[110px]"
            )}
          >
            {/* Logo */}
            <Link href="/" onClick={handleHomeClick} className="flex items-center shrink-0 group">
              <motion.div
                className="relative flex items-center"
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.97 }}
                transition={{ type: "spring", stiffness: 400, damping: 17 }}
              >
                <img
                  src="/logo.png"
                  alt="STREET MOBILE Logo"
                  className={cn(
                    "h-auto object-contain transition-all duration-300",
                    isScrolled
                      ? "w-[100px] sm:w-[120px] lg:w-[140px]"
                      : "w-[130px] sm:w-[160px] lg:w-[200px]"
                  )}
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = "none";
                    const fb = document.getElementById("logo-fallback-header");
                    if (fb) fb.style.display = "flex";
                  }}
                />
                <span
                  id="logo-fallback-header"
                  className="hidden items-center gap-2 font-black text-white text-xl tracking-tight"
                >
                  <span className="w-8 h-8 rounded-xl bg-white flex items-center justify-center text-black text-xs font-black">
                    SM
                  </span>
                  STREET MOBILE
                </span>
              </motion.div>
            </Link>

            {/* Desktop Nav */}
            <nav className="hidden lg:flex items-center gap-1">
              {/* 1. Home Link */}
              <Link
                href="/"
                onClick={handleHomeClick}
                className={cn(
                  "relative px-4 py-2 rounded-lg text-[13px] font-medium transition-all duration-300 group",
                  pathname === "/" ? "text-white" : "text-white/50 hover:text-white"
                )}
              >
                <span className="relative z-10">Home</span>
                {pathname === "/" && (
                  <motion.div
                    layoutId="navActivePill"
                    className="absolute inset-0 rounded-lg bg-white/[0.08] border border-white/[0.08]"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.5 }}
                  />
                )}
                <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-[2px] bg-gradient-to-r from-transparent via-white/60 to-transparent rounded-full transition-all duration-300 group-hover:w-3/4" />
              </Link>

              {/* 2. Shop All Link */}
              <Link
                href="/products"
                className={cn(
                  "relative px-4 py-2 rounded-lg text-[13px] font-medium transition-all duration-300 group",
                  pathname === "/products" ? "text-white" : "text-white/50 hover:text-white"
                )}
              >
                <span className="relative z-10">Shop All</span>
                {pathname === "/products" && (
                  <motion.div
                    layoutId="navActivePill"
                    className="absolute inset-0 rounded-lg bg-white/[0.08] border border-white/[0.08]"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.5 }}
                  />
                )}
                <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-[2px] bg-gradient-to-r from-transparent via-white/60 to-transparent rounded-full transition-all duration-300 group-hover:w-3/4" />
              </Link>

              {/* 3. Categories Link + Apple Minimal Dropdown */}
              <div
                ref={categoriesRef}
                className="relative"
                onMouseEnter={handleMouseEnterCategories}
                onMouseLeave={handleMouseLeaveCategories}
              >
                <button
                  onClick={() => setIsCategoriesOpen(!isCategoriesOpen)}
                  onFocus={() => setIsCategoriesOpen(true)}
                  className={cn(
                    "relative px-4 py-2 rounded-lg text-[13px] font-medium transition-all duration-300 flex items-center gap-1.5 group focus:outline-none focus-visible:ring-2 focus-visible:ring-white",
                    isCategoriesOpen ? "text-white" : "text-white/50 hover:text-white"
                  )}
                >
                  <span className="relative z-10">Categories</span>
                  <ChevronDown
                    className={cn(
                      "w-3.5 h-3.5 transition-transform duration-200 relative z-10",
                      isCategoriesOpen ? "rotate-180 text-white" : "text-white/50 group-hover:text-white"
                    )}
                  />
                  {isCategoriesOpen && (
                    <motion.div
                      layoutId="navActivePill"
                      className="absolute inset-0 rounded-lg bg-white/[0.08] border border-white/[0.08]"
                      transition={{ type: "spring", bounce: 0.2, duration: 0.5 }}
                    />
                  )}
                  <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-[2px] bg-gradient-to-r from-transparent via-white/60 to-transparent rounded-full transition-all duration-300 group-hover:w-3/4" />
                </button>

                {/* Clean White Apple-Inspired Mega Menu Dropdown */}
                <AnimatePresence>
                  {isCategoriesOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -6, scale: 0.98 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -6, scale: 0.98 }}
                      transition={{ duration: 0.18, ease: "easeOut" }}
                      className="absolute left-1/2 -translate-x-1/2 top-full mt-2.5 w-[560px] bg-white border border-[#EAEAEA] rounded-[20px] shadow-[0_16px_50px_rgba(0,0,0,0.12)] p-5 sm:p-6 z-50 text-black"
                    >
                      <div className="flex items-center justify-between pb-3 mb-3 border-b border-gray-100 px-1">
                        <span className="text-[11px] font-black uppercase tracking-wider text-gray-400">
                          Product Categories ({uniqueNavCategories.length})
                        </span>
                        <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-100">
                          Official Sri Lanka Warranty
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-2 max-h-[380px] overflow-y-auto pr-1 custom-scrollbar">
                        {uniqueNavCategories.map((cat) => {
                          const icon = cat.icon || "📱";
                          return (
                            <Link
                              key={cat.id || cat.slug}
                              href={`/products?category=${cat.slug}`}
                              onClick={() => setIsCategoriesOpen(false)}
                              className="group flex items-center justify-between min-h-[46px] px-3.5 py-2.5 rounded-xl bg-[#FAFAFA] hover:bg-black transition-all duration-200 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-black"
                            >
                              <div className="flex items-center gap-3 min-w-0">
                                <span className="text-base shrink-0 group-hover:scale-110 transition-transform">
                                  {icon}
                                </span>
                                <span className="text-xs font-extrabold text-gray-900 group-hover:text-white truncate">
                                  {cat.name}
                                </span>
                              </div>
                              <ChevronRight className="w-3.5 h-3.5 text-gray-400 group-hover:text-white group-hover:translate-x-0.5 transition-all shrink-0" />
                            </Link>
                          );
                        })}
                      </div>

                      {/* Dropdown Footer */}
                      <div className="mt-4 pt-3 border-t border-[#EAEAEA] flex items-center justify-between px-1">
                        <span className="text-[11px] text-gray-500 font-medium">Looking for a specific device?</span>
                        <Link
                          href="/products"
                          onClick={() => setIsCategoriesOpen(false)}
                          className="inline-flex items-center gap-1.5 text-xs font-extrabold text-black hover:text-blue-600 transition-colors"
                        >
                          <span>Browse All Catalog</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </Link>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* 4. Contact Link */}
              <Link
                href="/contact"
                className={cn(
                  "relative px-4 py-2 rounded-lg text-[13px] font-medium transition-all duration-300 group",
                  pathname === "/contact" ? "text-white" : "text-white/50 hover:text-white"
                )}
              >
                <span className="relative z-10">Contact</span>
                {pathname === "/contact" && (
                  <motion.div
                    layoutId="navActivePill"
                    className="absolute inset-0 rounded-lg bg-white/[0.08] border border-white/[0.08]"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.5 }}
                  />
                )}
                <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-[2px] bg-gradient-to-r from-transparent via-white/60 to-transparent rounded-full transition-all duration-300 group-hover:w-3/4" />
              </Link>
            </nav>

            {/* Right Icons / Actions */}
            <div className="flex items-center gap-1.5">
              {/* Search button */}
              <button
                onClick={() => window.dispatchEvent(new CustomEvent("open-search-overlay"))}
                className="p-2.5 rounded-xl text-white/60 hover:text-white hover:bg-white/10 transition-all"
                aria-label="Search site"
              >
                <Search className="w-5 h-5" />
              </button>

              {/* Wishlist button */}
              <Link
                href="/wishlist"
                className="relative p-2.5 rounded-xl text-white/60 hover:text-white hover:bg-white/10 transition-all"
                aria-label="Open wishlist"
              >
                <Heart className="w-5 h-5" />
                {wishlist.length > 0 && (
                  <motion.span
                    key={wishlist.length}
                    initial={{ scale: 0.5 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 flex items-center justify-center bg-red-600 text-white text-[10px] font-black rounded-full leading-none shadow-md shadow-red-600/50"
                  >
                    {wishlist.length}
                  </motion.span>
                )}
              </Link>

              {/* Bag icon */}
              <Link
                href="/cart"
                className="relative p-2.5 rounded-xl text-white/60 hover:text-white hover:bg-white/10 transition-all"
                aria-label="View Shopping Bag"
              >
                <ShoppingBag className="w-5 h-5" />
                {itemCount === 0 ? (
                  <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 flex items-center justify-center bg-gray-700/90 text-white text-[10px] font-black rounded-full leading-none border border-white/30">
                    0
                  </span>
                ) : (
                  <motion.span
                    key={itemCount}
                    initial={{ scale: 0.5 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 flex items-center justify-center bg-red-600 text-white text-[10px] font-black rounded-full leading-none shadow-md shadow-red-600/50"
                  >
                    {itemCount > 99 ? "99+" : itemCount}
                  </motion.span>
                )}
              </Link>

              {/* User icon / avatar */}
              <div className="relative">
                <button
                  onClick={() => (user ? setUserMenuOpen(!userMenuOpen) : setAuthOpen(true))}
                  className="p-2.5 rounded-xl text-white/60 hover:text-white hover:bg-white/10 transition-all"
                  aria-label={user ? "Account menu" : "Sign in"}
                >
                  {user ? (
                    <span className="w-6 h-6 rounded-full bg-white text-black text-xs font-black flex items-center justify-center">
                      {initials}
                    </span>
                  ) : (
                    <User className="w-5 h-5" />
                  )}
                </button>

                {/* User dropdown */}
                <AnimatePresence>
                  {userMenuOpen && user && (
                    <>
                      <div className="fixed inset-0 z-40" onClick={() => setUserMenuOpen(false)} />
                      <motion.div
                        initial={{ opacity: 0, y: 8, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 8, scale: 0.95 }}
                        transition={{ duration: 0.18 }}
                        className="absolute right-0 top-full mt-2 w-56 bg-[#111] border border-white/10 rounded-2xl shadow-2xl overflow-hidden z-50"
                      >
                        <div className="px-4 py-3 border-b border-white/10">
                          <p className="text-white text-sm font-semibold truncate">{user.displayName || "User"}</p>
                          <p className="text-white/40 text-xs truncate">{user.email}</p>
                        </div>
                        <Link
                          href="/orders"
                          onClick={() => setUserMenuOpen(false)}
                          className="flex items-center gap-3 w-full px-4 py-3 text-sm text-white/80 hover:text-white hover:bg-white/[0.04] border-b border-white/10 transition-all"
                        >
                          <Package className="w-4 h-4 text-emerald-400" />
                          My Orders
                        </Link>
                        <button
                          onClick={async () => {
                            await signOut();
                            setUserMenuOpen(false);
                          }}
                          className="flex items-center gap-3 w-full px-4 py-3 text-sm text-white/60 hover:text-white hover:bg-white/[0.04] transition-all"
                        >
                          <LogOut className="w-4 h-4" />
                          Sign Out
                        </button>
                      </motion.div>
                    </>
                  )}
                </AnimatePresence>
              </div>

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

        {/* Bottom glow line */}
        <div className="absolute bottom-0 left-0 right-0 h-[1px] overflow-hidden">
          <motion.div
            className="h-full w-full"
            style={{
              background:
                "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.15) 25%, rgba(255,255,255,0.3) 50%, rgba(255,255,255,0.15) 75%, transparent 100%)",
            }}
            animate={{ opacity: [0.3, 0.7, 0.3] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          />
        </div>
      </motion.header>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
              onClick={() => setIsMobileMenuOpen(false)}
            />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 28, stiffness: 280 }}
              className="fixed top-0 right-0 bottom-0 w-[85%] max-w-[340px] bg-black border-l border-white/[0.06] z-50 lg:hidden flex flex-col"
            >
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

              <nav className="flex-1 overflow-y-auto py-3 px-3">
                {/* Mobile Link 1: Home */}
                <Link
                  href="/"
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    handleHomeClick();
                  }}
                  className={cn(
                    "flex items-center justify-between px-4 py-3.5 rounded-xl text-sm font-medium transition-all mb-1 group min-h-[44px]",
                    pathname === "/"
                      ? "bg-white/[0.08] text-white border border-white/[0.08]"
                      : "text-white/50 hover:text-white hover:bg-white/[0.04]"
                  )}
                >
                  Home
                  <ChevronRight className="w-4 h-4 text-white/20 group-hover:text-white/40" />
                </Link>

                {/* Mobile Link 2: Shop All */}
                <Link
                  href="/products"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={cn(
                    "flex items-center justify-between px-4 py-3.5 rounded-xl text-sm font-medium transition-all mb-1 group min-h-[44px]",
                    pathname === "/products"
                      ? "bg-white/[0.08] text-white border border-white/[0.08]"
                      : "text-white/50 hover:text-white hover:bg-white/[0.04]"
                  )}
                >
                  Shop All
                  <ChevronRight className="w-4 h-4 text-white/20 group-hover:text-white/40" />
                </Link>

                {/* Mobile Link 3: Categories Collapsible Accordion */}
                <div className="mb-1">
                  <button
                    onClick={() => setIsMobileCategoriesOpen(!isMobileCategoriesOpen)}
                    className={cn(
                      "flex items-center justify-between w-full px-4 py-3.5 rounded-xl text-sm font-medium transition-all group min-h-[44px]",
                      isMobileCategoriesOpen
                        ? "bg-white/[0.08] text-white border border-white/[0.08]"
                        : "text-white/50 hover:text-white hover:bg-white/[0.04]"
                    )}
                  >
                    <span>Categories</span>
                    <ChevronDown
                      className={cn(
                        "w-4 h-4 transition-transform duration-200",
                        isMobileCategoriesOpen ? "rotate-180 text-white" : "text-white/20"
                      )}
                    />
                  </button>

                  <AnimatePresence>
                    {isMobileCategoriesOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden pl-4 py-2 space-y-1"
                      >
                        <Link
                          href="/products"
                          onClick={() => setIsMobileMenuOpen(false)}
                          className="flex items-center justify-between px-3.5 py-3 rounded-lg text-xs font-bold text-emerald-400 bg-white/[0.04] min-h-[44px]"
                        >
                          <span>View All Products</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </Link>
                        {uniqueNavCategories.map((cat) => (
                          <Link
                            key={cat.id || cat.slug}
                            href={`/products?category=${cat.slug}`}
                            onClick={() => setIsMobileMenuOpen(false)}
                            className="flex items-center justify-between px-3.5 py-3 rounded-lg text-xs font-medium text-white/80 hover:text-white hover:bg-white/[0.04] transition-all min-h-[44px]"
                          >
                            <span className="flex items-center gap-2.5">
                              <span className="text-sm">{cat.icon || "📱"}</span>
                              <span>{cat.name}</span>
                            </span>
                            <ChevronRight className="w-3.5 h-3.5 text-white/20" />
                          </Link>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Mobile Link 4: Contact */}
                <Link
                  href="/contact"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={cn(
                    "flex items-center justify-between px-4 py-3.5 rounded-xl text-sm font-medium transition-all mb-1 group min-h-[44px]",
                    pathname === "/contact"
                      ? "bg-white/[0.08] text-white border border-white/[0.08]"
                      : "text-white/50 hover:text-white hover:bg-white/[0.04]"
                  )}
                >
                  Contact
                  <ChevronRight className="w-4 h-4 text-white/20 group-hover:text-white/40" />
                </Link>

                <div className="mt-4 pt-4 border-t border-white/[0.06] space-y-1">
                  <button
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      setCartOpen(true);
                    }}
                    className="flex items-center justify-between w-full px-4 py-3.5 rounded-xl text-sm font-medium text-white/50 hover:text-white hover:bg-white/[0.04] transition-all min-h-[44px]"
                  >
                    <span className="flex items-center gap-3">
                      <ShoppingBag className="w-4 h-4" />
                      My Bag
                    </span>
                    {itemCount === 0 ? (
                      <span className="px-2 py-0.5 bg-gray-700/90 text-white text-xs font-black rounded-full animate-pulse border border-white/30">
                        0
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 bg-red-600 text-white text-xs font-black rounded-full">
                        {itemCount}
                      </span>
                    )}
                  </button>

                  <button
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      user ? setUserMenuOpen(true) : setAuthOpen(true);
                    }}
                    className="flex items-center gap-3 w-full px-4 py-3.5 rounded-xl text-sm font-medium text-white/50 hover:text-white hover:bg-white/[0.04] transition-all min-h-[44px]"
                  >
                    <User className="w-4 h-4" />
                    {user ? user.displayName || "Account" : "Sign In / Sign Up"}
                  </button>
                </div>
              </nav>

              <div className="px-5 py-5 border-t border-white/[0.06] space-y-3">
                <motion.a
                  href="tel:+94774141118"
                  className="flex items-center gap-3 w-full px-4 py-3 rounded-xl bg-white text-black text-sm font-semibold relative overflow-hidden min-h-[44px]"
                  whileTap={{ scale: 0.97 }}
                >
                  <Phone className="w-4 h-4" />
                  +94 77 414 1118
                  <motion.span
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent skew-x-[-20deg]"
                    animate={{ x: ["-200%", "200%"] }}
                    transition={{ duration: 3, repeat: Infinity, repeatDelay: 2 }}
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

      {/* Auth Modal */}
      <AuthModal isOpen={authOpen} onClose={() => setAuthOpen(false)} />

      {/* Cart Drawer */}
      <CartDrawer isOpen={cartOpen} onClose={() => setCartOpen(false)} />
    </>
  );
}
