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
import MegaMenu from "@/components/layout/MegaMenu";
import { categories as fallbackCategories, DEFAULT_MEGA_MENU_SETTINGS } from "@/lib/data";
import { getCategories } from "@/lib/firestore-client";
import { Category, MegaMenuSettings } from "@/lib/types";
import { KNOWN_BRAND_NAMES } from "@/lib/migration-audit";
import { db } from "@/lib/firebase";
import { doc, onSnapshot } from "firebase/firestore";
import UserAvatar from "@/components/ui/UserAvatar";

export default function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobileCategoriesOpen, setIsMobileCategoriesOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [isCategoriesOpen, setIsCategoriesOpen] = useState(false);
  const [catList, setCatList] = useState<Category[]>(fallbackCategories);
  const [megaMenuSettings, setMegaMenuSettings] = useState<MegaMenuSettings>(DEFAULT_MEGA_MENU_SETTINGS);

  const categoriesRef = useRef<HTMLDivElement>(null);
  const openTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const closeTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const headerRef = useRef<HTMLElement>(null);
  const pathname = usePathname();
  const { user, profile, gender, updateGender, signOut } = useAuth();
  const { itemCount } = useCart();
  const { wishlist } = useWishlist();



  // ── ResizeObserver: dynamically update --navbar-height CSS variable ──
  useEffect(() => {
    const el = headerRef.current;
    if (!el) return;
    const observer = new ResizeObserver(([entry]) => {
      const h = entry.contentRect.height;
      if (h > 0) {
        document.documentElement.style.setProperty("--navbar-height", `${h}px`);
      }
    });
    observer.observe(el);
    // Set initial value immediately
    const initialH = el.getBoundingClientRect().height;
    if (initialH > 0) {
      document.documentElement.style.setProperty("--navbar-height", `${initialH}px`);
    }
    return () => observer.disconnect();
  }, []);

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
    try {
      const unsub = onSnapshot(doc(db, "settings", "mega_menu"), (snap) => {
        if (snap.exists()) {
          const data = snap.data() as MegaMenuSettings;
          setMegaMenuSettings((prev) => ({
            ...prev,
            ...data,
            columns: data.columns && data.columns.length > 0 ? data.columns : prev.columns,
          }));
        }
      });
      return () => unsub();
    } catch (e) {
      console.warn("Could not listen to mega menu settings:", e);
    }
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
    if (closeTimeoutRef.current) clearTimeout(closeTimeoutRef.current);
    if (openTimeoutRef.current) clearTimeout(openTimeoutRef.current);
    openTimeoutRef.current = setTimeout(() => {
      setIsCategoriesOpen(true);
    }, 140); // 140ms intentional hover delay
  };

  const handleMouseLeaveCategories = () => {
    if (openTimeoutRef.current) clearTimeout(openTimeoutRef.current);
    if (closeTimeoutRef.current) clearTimeout(closeTimeoutRef.current);
    closeTimeoutRef.current = setTimeout(() => {
      setIsCategoriesOpen(false);
    }, 160); // 160ms closing buffer
  };

  const handleMouseEnterMegaMenu = () => {
    if (closeTimeoutRef.current) clearTimeout(closeTimeoutRef.current);
  };

  const handleMouseLeaveMegaMenu = () => {
    if (closeTimeoutRef.current) clearTimeout(closeTimeoutRef.current);
    closeTimeoutRef.current = setTimeout(() => {
      setIsCategoriesOpen(false);
    }, 160);
  };

  const initials = user?.displayName
    ? user.displayName.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase()
    : user?.email?.[0]?.toUpperCase() ?? "U";

  // Deduplicate categories & exclude brand names for clean presentation
  const uniqueNavCategories = useMemo(() => {
    const seenIds = new Set<string>();
    const seenSlugs = new Set<string>();
    const seenNames = new Set<string>();
    const brandLowerList = KNOWN_BRAND_NAMES.map((b) => b.toLowerCase());
    
    // Combine Firestore categories + fallbackCategories
    const all = [...catList, ...fallbackCategories];
    const unique: Category[] = [];

    all.forEach((c) => {
      if (!c || !c.name) return;
      const cleanName = c.name.toLowerCase().trim();
      const cleanId = (c.id || "").toLowerCase().trim();
      const cleanSlug = (c.slug || "").toLowerCase().trim();

      if (brandLowerList.includes(cleanName)) return;

      // Skip if already seen by ID, slug, or name
      if (cleanId && seenIds.has(cleanId)) return;
      if (cleanSlug && seenSlugs.has(cleanSlug)) return;
      if (seenNames.has(cleanName)) return;

      if (cleanId) seenIds.add(cleanId);
      if (cleanSlug) seenSlugs.add(cleanSlug);
      seenNames.add(cleanName);

      unique.push(c);
    });

    return unique.sort((a, b) => (a.sort_order || 99) - (b.sort_order || 99));
  }, [catList]);

  // Hide header navbar on admin and login pages
  if (pathname.startsWith("/admin") || pathname.startsWith("/login")) {
    return null;
  }

  return (
    <>
      <motion.header
        ref={headerRef}
        data-site-header
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: "spring", damping: 25, stiffness: 120, delay: 0.1 }}
        className={cn(
          "fixed top-0 left-0 right-0 z-50 bg-black border-b transition-all duration-500 mb-0 font-outfit",
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
              isScrolled ? "h-14 lg:h-14" : "h-16 lg:h-[72px]"
            )}
          >
            {/* Logo */}
            <Link
              href="/"
              onClick={() => {
                if (pathname === "/") {
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }
              }}
              className="flex items-center shrink-0 group cursor-pointer"
            >
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
                      ? "w-[90px] sm:w-[100px] lg:w-[120px]"
                      : "w-[100px] sm:w-[120px] lg:w-[150px]"
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

              {/* 3. Shop by Category Mega Menu Trigger */}
              <div
                ref={categoriesRef}
                className="relative"
                onMouseEnter={handleMouseEnterCategories}
                onMouseLeave={handleMouseLeaveCategories}
              >
                <button
                  onClick={() => setIsCategoriesOpen(!isCategoriesOpen)}
                  onFocus={() => setIsCategoriesOpen(true)}
                  aria-expanded={isCategoriesOpen}
                  aria-haspopup="true"
                  className={cn(
                    "relative px-4 py-2 rounded-lg text-[13px] font-medium transition-all duration-300 flex items-center gap-1.5 group focus:outline-none focus-visible:ring-2 focus-visible:ring-white",
                    isCategoriesOpen ? "text-white" : "text-white/50 hover:text-white"
                  )}
                >
                  <span className="relative z-10">Shop by Category</span>
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
              </div>
            </nav>

            {/* Right Icons / Actions */}
            <div className="flex items-center gap-2 lg:gap-2.5">
              {/* Ultra-Premium Highlighted Desktop Search Bar Control */}
              <button
                onClick={() => window.dispatchEvent(new CustomEvent("open-search-overlay"))}
                className="hidden md:flex items-center gap-2.5 px-3.5 h-[42px] w-[280px] lg:w-[320px] xl:w-[350px] rounded-full bg-white/[0.07] hover:bg-white/[0.12] active:bg-white/[0.15] border border-white/15 hover:border-white/35 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40 transition-all duration-300 ease-out text-left group cursor-pointer shadow-[inset_0_1px_1.5px_rgba(255,255,255,0.18),0_2px_12px_rgba(0,0,0,0.35)] hover:shadow-[0_0_24px_-2px_rgba(255,255,255,0.16)] relative overflow-hidden"
                aria-label="Search devices, accessories and brands"
              >
                {/* Specular Ambient Glow Sweep Beam on Hover */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.1] to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 pointer-events-none" />

                <div className="w-6 h-6 rounded-full bg-white/[0.08] group-hover:bg-white/[0.16] flex items-center justify-center transition-colors shrink-0 border border-white/10 shadow-2xs">
                  <Search className="w-3.5 h-3.5 text-white/70 group-hover:text-white transition-colors" strokeWidth={2} />
                </div>
                
                <span className="text-[13px] text-white/55 group-hover:text-white/85 font-medium truncate select-none tracking-tight transition-colors">
                  Search products, brands...
                </span>

                <div className="ml-auto flex items-center gap-1 shrink-0 select-none">
                  <kbd className="hidden xl:inline-flex items-center justify-center px-1.5 min-w-[26px] h-[20px] text-[10px] font-bold font-mono text-white/50 bg-white/[0.08] border border-white/15 rounded-md leading-none shadow-xs group-hover:border-white/30 group-hover:text-white transition-colors">
                    ⌘K
                  </kbd>
                </div>
              </button>

              {/* Wishlist button (Hidden on mobile < 768px - accessible in bottom nav) */}
              <div className="hidden md:flex group/item relative items-center justify-center">
                <Link
                  href="/wishlist"
                  className="w-10 h-10 flex items-center justify-center rounded-full text-white/60 hover:text-white hover:bg-white/[0.06] hover:scale-105 active:scale-95 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-white/40 transition-all duration-200 relative"
                  aria-label="Open wishlist"
                >
                  <Heart className="w-[20px] h-[20px]" strokeWidth={1.75} />
                  {wishlist.length > 0 && (
                    <motion.span
                      key={wishlist.length}
                      initial={{ scale: 0.6 }}
                      animate={{ scale: 1 }}
                      transition={{ duration: 0.15 }}
                      className="absolute top-1.5 right-1.5 min-w-[17px] h-[17px] px-1 flex items-center justify-center bg-white text-black text-[10px] font-black rounded-full leading-none border-[1.5px] border-[#0A0A0A] shadow-xs"
                    >
                      {wishlist.length}
                    </motion.span>
                  )}
                </Link>
                {/* Accessible Tooltip */}
                <span className="pointer-events-none absolute -bottom-9 left-1/2 -translate-x-1/2 px-2 py-1 rounded-md bg-[#18181b] border border-white/10 text-white/90 text-[10px] font-medium tracking-normal whitespace-nowrap opacity-0 group-hover/item:opacity-100 transition-opacity duration-150 shadow-md z-50">
                  Wishlist
                </span>
              </div>

              {/* Bag / Cart icon */}
              <div className="group/item relative flex items-center justify-center">
                <Link
                  href="/cart"
                  className="w-10 h-10 flex items-center justify-center rounded-full text-white/60 hover:text-white hover:bg-white/[0.06] hover:scale-105 active:scale-95 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-white/40 transition-all duration-200 relative"
                  aria-label="View Shopping Bag"
                >
                  <ShoppingBag className="w-[20px] h-[20px]" strokeWidth={1.75} />
                  {itemCount > 0 && (
                    <motion.span
                      key={itemCount}
                      initial={{ scale: 0.6 }}
                      animate={{ scale: 1 }}
                      transition={{ duration: 0.15 }}
                      className="absolute top-1.5 right-1.5 min-w-[17px] h-[17px] px-1 flex items-center justify-center bg-white text-black text-[10px] font-black rounded-full leading-none border-[1.5px] border-[#0A0A0A] shadow-xs"
                    >
                      {itemCount > 99 ? "99+" : itemCount}
                    </motion.span>
                  )}
                </Link>
                {/* Accessible Tooltip */}
                <span className="pointer-events-none absolute -bottom-9 left-1/2 -translate-x-1/2 px-2 py-1 rounded-md bg-[#18181b] border border-white/10 text-white/90 text-[10px] font-medium tracking-normal whitespace-nowrap opacity-0 group-hover/item:opacity-100 transition-opacity duration-150 shadow-md z-50">
                  Shopping Bag
                </span>
              </div>

              {/* User icon / Profile avatar */}
              <div className="hidden sm:flex group/item relative items-center justify-center">
                <button
                  onClick={() => (user ? setUserMenuOpen(!userMenuOpen) : setAuthOpen(true))}
                  className="w-10 h-10 flex items-center justify-center rounded-full text-white/60 hover:text-white hover:bg-white/[0.06] hover:scale-105 active:scale-95 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-white/40 transition-all duration-200"
                  aria-label={user ? "Account menu" : "Sign in"}
                >
                  {user ? (
                    <UserAvatar
                      gender={gender || profile?.gender || "male"}
                      name={user.displayName || "User"}
                      photoURL={user.photoURL}
                      size="md"
                    />
                  ) : (
                    <User className="w-[20px] h-[20px]" strokeWidth={1.75} />
                  )}
                </button>
                {/* Accessible Tooltip */}
                {!userMenuOpen && (
                  <span className="pointer-events-none absolute -bottom-9 left-1/2 -translate-x-1/2 px-2 py-1 rounded-md bg-[#18181b] border border-white/10 text-white/90 text-[10px] font-medium tracking-normal whitespace-nowrap opacity-0 group-hover/item:opacity-100 transition-opacity duration-150 shadow-md z-50">
                    {user ? "Account" : "Sign In"}
                  </span>
                )}

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
                        className="absolute right-0 top-full mt-2 w-64 bg-[#111] border border-white/10 rounded-2xl shadow-2xl overflow-hidden z-50 p-1.5"
                      >
                        {/* Profile Header Card */}
                        <div className="px-3 py-3 border-b border-white/10 flex items-center gap-3">
                          <UserAvatar
                            gender={gender || profile?.gender || "male"}
                            name={user.displayName || "User"}
                            photoURL={user.photoURL}
                            size="lg"
                            showBadge
                          />
                          <div className="min-w-0 flex-1">
                            <p className="text-white text-xs font-bold truncate">{user.displayName || "User"}</p>
                            <p className="text-white/40 text-[11px] truncate font-mono">{user.email}</p>
                          </div>
                        </div>

                        <Link
                          href="/orders"
                          onClick={() => setUserMenuOpen(false)}
                          className="flex items-center gap-2.5 w-full px-3 py-2.5 text-xs font-semibold text-white/80 hover:text-white hover:bg-white/[0.06] rounded-xl transition-all"
                        >
                          <Package className="w-4 h-4 text-white/80" />
                          My Orders &amp; Track
                        </Link>
                        <button
                          onClick={async () => {
                            await signOut();
                            setUserMenuOpen(false);
                          }}
                          className="flex items-center gap-2.5 w-full px-3 py-2.5 text-xs font-semibold text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-xl transition-all cursor-pointer"
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

      {/* Apple-Inspired Full-Width Text-Based Mega Menu Dropdown */}
      <MegaMenu
        isOpen={isCategoriesOpen}
        onClose={() => setIsCategoriesOpen(false)}
        onMouseEnter={handleMouseEnterMegaMenu}
        onMouseLeave={handleMouseLeaveMegaMenu}
        categories={uniqueNavCategories}
        initialSettings={megaMenuSettings}
      />

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
                <Link
                  href="/"
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    if (pathname === "/") {
                      window.scrollTo({ top: 0, behavior: "smooth" });
                    }
                  }}
                  className="flex items-center"
                >
                  <img
                    src="/logo.png"
                    alt="STREET MOBILE"
                    className="h-9 w-auto object-contain cursor-pointer"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = "none";
                    }}
                  />
                </Link>
                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="p-2 rounded-lg text-white/50 hover:text-white hover:bg-white/10 transition-all"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <nav className="flex-1 overflow-y-auto py-3 px-3">
                {/* Mobile Drawer Search Bar Button */}
                <div className="px-1 mb-3">
                  <button
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      window.dispatchEvent(new CustomEvent("open-search-overlay"));
                    }}
                    className="w-full flex items-center gap-3 px-4 py-3 bg-white/[0.07] hover:bg-white/[0.12] border border-white/[0.15] rounded-2xl text-left text-xs font-semibold text-white/70 hover:text-white transition-all shadow-sm"
                  >
                    <Search className="w-4 h-4 text-white/70" />
                    <span>Search phones, accessories, brands...</span>
                  </button>
                </div>

                {/* Mobile Link 1: Home */}
                <Link
                  href="/"
                  onClick={() => setIsMobileMenuOpen(false)}
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

                {/* Mobile Link 3: Shop by Category Text-Based Accordion */}
                <div className="mb-1">
                  <button
                    onClick={() => setIsMobileCategoriesOpen(!isMobileCategoriesOpen)}
                    aria-expanded={isMobileCategoriesOpen}
                    className={cn(
                      "flex items-center justify-between w-full px-4 py-3.5 rounded-xl text-sm font-medium transition-all group min-h-[44px]",
                      isMobileCategoriesOpen
                        ? "bg-white/[0.08] text-white border border-white/[0.08]"
                        : "text-white/50 hover:text-white hover:bg-white/[0.04]"
                    )}
                  >
                    <span>Shop by Category</span>
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
                        className="overflow-hidden pl-2 py-2 space-y-3"
                      >
                        {/* Prominent Shop All Products */}
                        <Link
                          href="/products"
                          onClick={() => setIsMobileMenuOpen(false)}
                          className="flex items-center justify-between px-3.5 py-3 rounded-lg text-xs font-bold text-white bg-white/[0.06] hover:bg-white/10 transition-all min-h-[44px]"
                        >
                          <span>Shop All Products</span>
                          <ArrowRight className="w-3.5 h-3.5 text-white/60" />
                        </Link>

                        {/* Render Configured Columns as Accordion Sections */}
                        {megaMenuSettings.columns
                          ?.filter((col) => col.enabled !== false)
                          .map((col, colIdx) => (
                            <div key={col.id || colIdx} className="space-y-1 pt-1">
                              <span className="text-[10px] uppercase font-bold tracking-wider text-white/40 px-3.5 block mb-1 select-none">
                                {col.heading}
                              </span>
                              {col.items
                                ?.filter((it) => it.enabled !== false)
                                .map((item, itemIdx) => (
                                  <Link
                                    key={item.id || itemIdx}
                                    href={item.href}
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    className="flex items-center justify-between px-3.5 py-2.5 rounded-lg text-xs font-medium text-white/80 hover:text-white hover:bg-white/[0.04] transition-all min-h-[44px]"
                                  >
                                    <span className={item.bold ? "font-bold text-white truncate" : "truncate"}>
                                      {item.label}
                                    </span>
                                    {item.badgeEnabled && item.badgeLabel ? (
                                      <span
                                        className="px-2 py-0.5 text-[9px] font-black text-black bg-white rounded-full uppercase tracking-wider shrink-0"
                                      >
                                        {item.badgeLabel}
                                      </span>
                                    ) : (
                                      <ChevronRight className="w-3.5 h-3.5 text-white/20" />
                                    )}
                                  </Link>
                                ))}
                            </div>
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
                      <span className="px-2 py-0.5 bg-neutral-800 text-white text-xs font-black rounded-full border border-white/20">
                        0
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 bg-white text-black text-xs font-black rounded-full">
                        {itemCount}
                      </span>
                    )}
                  </button>

                  {user ? (
                    <div className="pt-2 pb-1 space-y-1">
                      <div className="p-3 bg-white/[0.05] border border-white/[0.08] rounded-2xl mb-2">
                        <div className="flex items-center gap-3">
                          <UserAvatar
                            gender={gender || profile?.gender || "male"}
                            name={user.displayName || "User"}
                            photoURL={user.photoURL}
                            size="md"
                            showBadge
                          />
                          <div className="min-w-0 flex-1">
                            <p className="text-white text-xs font-bold truncate">{user.displayName || "Customer"}</p>
                            <p className="text-white/40 text-[10px] truncate font-mono">{user.email}</p>
                          </div>
                        </div>
                      </div>

                      <Link
                        href="/orders"
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="flex items-center justify-between px-4 py-3 rounded-xl text-xs font-semibold text-white/80 hover:text-white hover:bg-white/[0.04] transition-all min-h-[44px]"
                      >
                        <span className="flex items-center gap-2.5">
                          <Package className="w-4 h-4 text-white/70" />
                          My Orders &amp; Track
                        </span>
                        <ChevronRight className="w-3.5 h-3.5 text-white/30" />
                      </Link>

                      <Link
                        href="/wishlist"
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="flex items-center justify-between px-4 py-3 rounded-xl text-xs font-semibold text-white/80 hover:text-white hover:bg-white/[0.04] transition-all min-h-[44px]"
                      >
                        <span className="flex items-center gap-2.5">
                          <Heart className="w-4 h-4 text-white/70" />
                          My Wishlist
                        </span>
                        <ChevronRight className="w-3.5 h-3.5 text-white/30" />
                      </Link>

                      <button
                        type="button"
                        onClick={async () => {
                          await signOut();
                          setIsMobileMenuOpen(false);
                        }}
                        className="flex items-center gap-2.5 w-full px-4 py-3 text-xs font-bold text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-xl transition-all cursor-pointer min-h-[44px]"
                      >
                        <LogOut className="w-4 h-4 text-red-400" />
                        Sign Out
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => {
                        setIsMobileMenuOpen(false);
                        setAuthOpen(true);
                      }}
                      className="flex items-center justify-between w-full px-4 py-3.5 rounded-xl text-sm font-semibold text-white bg-white/[0.08] hover:bg-white/15 border border-white/10 transition-all min-h-[44px] shadow-sm cursor-pointer"
                    >
                      <span className="flex items-center gap-3">
                        <User className="w-4 h-4 text-white" />
                        Sign In / Create Account
                      </span>
                      <ChevronRight className="w-4 h-4 text-white/40" />
                    </button>
                  )}
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
