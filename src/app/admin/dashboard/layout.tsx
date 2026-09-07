"use client";

import { useState, useEffect, useRef, useMemo, Suspense } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  LayoutDashboard,
  Package,
  FolderOpen,
  FolderTree,
  Tag,
  LayoutGrid,
  Sparkles,
  Flame,
  ShoppingBag,
  Wrench,
  DollarSign,
  ShieldCheck,
  Users,
  Images,
  ImageIcon,
  Globe,
  HardDrive,
  CreditCard,
  Star,
  BarChart3,
  Bot,
  Smartphone,
  Settings,
  Clock,
  LogOut,
  Search,
  Plus,
  HelpCircle,
  Menu,
  X,
  Sun,
  Moon,
  Bell,
  ChevronRight,
  ChevronLeft,
  ExternalLink,
} from "lucide-react";
import { formatPrice } from "@/lib/utils";
import { db } from "@/lib/firebase";
import { collection, getDocs } from "firebase/firestore";
import ProductModal from "@/components/admin/ProductModal";
import CommandPalette from "@/components/admin/CommandPalette";

interface NavItem {
  id: string;
  label: string;
  icon: any;
  href: string;
}

interface NavGroup {
  group: string;
  items: NavItem[];
}

const SIDEBAR_GROUPS: NavGroup[] = [
  {
    group: "OVERVIEW",
    items: [
      { id: "overview", label: "Dashboard", icon: LayoutDashboard, href: "/admin/dashboard" },
    ],
  },
  {
    group: "CATALOG",
    items: [
      { id: "products", label: "Products", icon: Package, href: "/admin/dashboard?tab=products" },
      { id: "categories", label: "Shop by Category", icon: FolderOpen, href: "/admin/dashboard?tab=categories" },
      { id: "mega-menu", label: "Category Mega Menu", icon: FolderTree, href: "/admin/dashboard?tab=mega-menu" },
      { id: "brands", label: "Shop by Brand", icon: Tag, href: "/admin/dashboard?tab=brands" },
      { id: "collections", label: "Featured Collections", icon: LayoutGrid, href: "/admin/dashboard?tab=collections" },
      { id: "showcase", label: "Visual Showcase", icon: Sparkles, href: "/admin/dashboard?tab=showcase" },
    ],
  },
  {
    group: "SALES",
    items: [
      { id: "orders", label: "Orders", icon: ShoppingBag, href: "/admin/dashboard?tab=orders" },
      { id: "today-deal", label: "Today’s Deal", icon: Flame, href: "/admin/dashboard?tab=today-deal" },
      { id: "coupons", label: "Promo Codes & Coupons", icon: Tag, href: "/admin/dashboard?tab=coupons" },
      { id: "payments", label: "Payments & Gateways", icon: CreditCard, href: "/admin/dashboard?tab=payments" },
      { id: "analytics", label: "Analytics & Reports", icon: BarChart3, href: "/admin/dashboard?tab=analytics" },
    ],
  },
  {
    group: "OPERATIONS",
    items: [
      { id: "inventory", label: "Inventory Levels", icon: HardDrive, href: "/admin/dashboard?tab=inventory" },
      { id: "repairs", label: "Mobile Repairs", icon: Wrench, href: "/admin/dashboard?tab=repairs" },
      { id: "cashflow", label: "Cash Flow Accounts", icon: DollarSign, href: "/admin/dashboard?tab=cashflow" },
      { id: "warranties", label: "Warranty Management", icon: ShieldCheck, href: "/admin/dashboard?tab=warranties" },
      { id: "users", label: "Customers Directory", icon: Users, href: "/admin/dashboard?tab=users" },
    ],
  },
  {
    group: "MARKETING",
    items: [
      { id: "gallery", label: "Store Gallery Wall", icon: Images, href: "/admin/dashboard?tab=gallery" },
      { id: "hero", label: "Homepage Hero Slider", icon: Sparkles, href: "/admin/dashboard?tab=hero" },
      { id: "banners", label: "Offers & Banners", icon: ImageIcon, href: "/admin/dashboard?tab=banners" },
      { id: "reviews", label: "Google Reviews", icon: Star, href: "/admin/dashboard?tab=reviews" },
      { id: "footer", label: "Footer Configuration", icon: Globe, href: "/admin/dashboard?tab=footer" },
    ],
  },
  {
    group: "SYSTEM",
    items: [
      { id: "assistant", label: "Streetla AI Assistant", icon: Bot, href: "/admin/dashboard?tab=assistant" },
      { id: "mobile", label: "Mobile Experience", icon: Smartphone, href: "/admin/dashboard?tab=mobile" },
      { id: "settings", label: "Store & Auth Settings", icon: Settings, href: "/admin/dashboard?tab=settings" },
      { id: "contact-settings", label: "Contact & Store Times", icon: Clock, href: "/admin/dashboard?tab=contact-settings" },
    ],
  },
];

function DashboardLayoutContent({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const activeTabParam = searchParams.get("tab") || "overview";

  // Authentication State
  const [isAuthed, setIsAuthed] = useState<boolean>(() => {
    if (typeof window !== "undefined") {
      return (
        sessionStorage.getItem("admin_auth") === "true" ||
        localStorage.getItem("admin_auth") === "true"
      );
    }
    return true;
  });

  // Theme State
  const [theme, setTheme] = useState<"dark" | "light">(() => {
    if (typeof window !== "undefined") {
      return (localStorage.getItem("admin_theme") as "dark" | "light") || "dark";
    }
    return "dark";
  });

  const toggleTheme = () => {
    const nextTheme = theme === "dark" ? "light" : "dark";
    setTheme(nextTheme);
    if (typeof window !== "undefined") {
      localStorage.setItem("admin_theme", nextTheme);
    }
  };

  // Sidebar Layout States
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // Command Palette & Modals
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [isAddProductOpen, setIsAddProductOpen] = useState(false);

  // Live order alert state
  const [liveAlert, setLiveAlert] = useState<any | null>(null);
  const [hasUnreadAlert, setHasUnreadAlert] = useState(false);
  const lastOrderId = useRef<string | null>(null);

  // Active Tab Metadata for Breadcrumbs
  const currentTabMeta = useMemo(() => {
    for (const group of SIDEBAR_GROUPS) {
      const match = group.items.find((item) => item.id === activeTabParam);
      if (match) {
        return { group: group.group, label: match.label, icon: match.icon };
      }
    }
    return { group: "OVERVIEW", label: "Dashboard", icon: LayoutDashboard };
  }, [activeTabParam]);

  // Auth Guard
  useEffect(() => {
    if (typeof window !== "undefined") {
      const auth =
        sessionStorage.getItem("admin_auth") === "true" ||
        localStorage.getItem("admin_auth") === "true";
      if (!auth) {
        router.push("/admin/login");
      } else {
        setIsAuthed(true);
      }
    }
  }, [router]);

  // Keyboard shortcut: ⌘K or Ctrl+K for Command Palette
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setIsCommandPaletteOpen((prev) => !prev);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Listen for global open product modal event
  useEffect(() => {
    const handleOpenModal = () => setIsAddProductOpen(true);
    window.addEventListener("open-add-product-modal", handleOpenModal);
    return () => window.removeEventListener("open-add-product-modal", handleOpenModal);
  }, []);

  // Poll for latest incoming orders
  useEffect(() => {
    if (!isAuthed) return;

    const fetchLatestOrder = async () => {
      try {
        const snapshot = await getDocs(collection(db, "orders"));
        const sorted = snapshot.docs
          .map((d) => ({ ...d.data(), id: d.id }))
          .sort((a: any, b: any) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());

        if (sorted.length) {
          const doc = sorted[0];
          if (lastOrderId.current && lastOrderId.current !== doc.id) {
            setLiveAlert({ ...doc });
            setHasUnreadAlert(true);
            try {
              const audio = new Audio("https://assets.mixkit.co/active_storage/sfx/2869/2869-200.wav");
              audio.play().catch(() => {});
            } catch (e) {}
          }
          lastOrderId.current = doc.id;
        }
      } catch (error) {
        console.error("Error fetching latest order:", error);
      }
    };

    fetchLatestOrder();
    const interval = setInterval(fetchLatestOrder, 30000);
    return () => clearInterval(interval);
  }, [isAuthed]);

  useEffect(() => {
    if (liveAlert) {
      const timer = setTimeout(() => setLiveAlert(null), 6000);
      return () => clearTimeout(timer);
    }
  }, [liveAlert]);

  const handleLogout = () => {
    sessionStorage.removeItem("admin_auth");
    localStorage.removeItem("admin_auth");
    router.push("/admin/login");
  };

  if (!isAuthed) {
    return (
      <div className="min-h-screen bg-[#090D14] flex flex-col items-center justify-center text-white font-sans p-4 gap-4">
        <div className="flex items-center gap-2 font-bold text-sm text-white/80">
          <div className="w-4 h-4 rounded-full border-2 border-blue-500 border-t-transparent animate-spin" />
          Authenticating Admin Session...
        </div>
        <Link
          href="/admin/login"
          className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl shadow-lg transition-all"
        >
          Go to Admin Login
        </Link>
      </div>
    );
  }

  const isLight = theme === "light";

  return (
    <div
      data-admin-root
      data-admin-theme={theme}
      className={`flex h-screen overflow-hidden font-sans transition-colors duration-150 ${
        isLight ? "bg-[#F8FAFC] text-[#0F172A]" : "bg-[#090D14] text-[#F8FAFC]"
      }`}
    >
      {/* ── Mobile Sidebar Drawer Backdrop ── */}
      {mobileSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/70 backdrop-blur-xs z-40 lg:hidden animate-in fade-in"
          onClick={() => setMobileSidebarOpen(false)}
        />
      )}

      {/* ── Left Navigation Sidebar (Grouped & POS Compact) ── */}
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-50 flex flex-col transition-all duration-200 shrink-0 border-r ${
          sidebarCollapsed ? "w-[68px]" : "w-[248px]"
        } ${
          isLight
            ? "bg-[#FFFFFF] border-[#E2E8F0] shadow-sm"
            : "bg-[#0F172A] border-white/10"
        } ${
          mobileSidebarOpen ? "translate-x-0 w-[260px]" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        {/* 1. Brand Logo Header */}
        <div
          className={`h-16 px-4 border-b flex items-center shrink-0 ${
            isLight ? "border-[#E2E8F0]" : "border-white/10"
          } ${sidebarCollapsed ? "justify-center" : "justify-between"}`}
        >
          <Link href="/admin/dashboard" className="flex items-center gap-3 group">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white shadow-sm shadow-blue-600/30 shrink-0">
              <Smartphone className="w-4 h-4" />
            </div>
            {!sidebarCollapsed && (
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <h1 className="text-sm font-bold tracking-tight leading-none truncate">
                    StreetMobile<span className="text-blue-500">.lk</span>
                  </h1>
                  <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" title="Store Operational" />
                </div>
                <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider block mt-0.5">
                  POS & Operations
                </span>
              </div>
            )}
          </Link>

          {/* Mobile Close Button */}
          <button
            type="button"
            onClick={() => setMobileSidebarOpen(false)}
            className="p-1 rounded-md text-slate-400 hover:text-white lg:hidden"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 2. Scrollable Grouped Navigation */}
        <nav
          data-admin-nav="true"
          className="flex-1 min-h-0 overflow-y-auto px-2.5 py-3 space-y-4 custom-scrollbar"
        >
          {SIDEBAR_GROUPS.map((group) => (
            <div key={group.group} className="space-y-1">
              {!sidebarCollapsed && (
                <div className="px-2.5 py-1 text-[10px] font-bold text-slate-400 tracking-wider uppercase">
                  {group.group}
                </div>
              )}

              {group.items.map((item) => {
                const isActive = activeTabParam === item.id;
                const Icon = item.icon;

                return (
                  <Link
                    key={item.id}
                    href={item.href}
                    onClick={() => setMobileSidebarOpen(false)}
                    title={sidebarCollapsed ? item.label : undefined}
                    className={`relative w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-xs font-medium transition-all ${
                      sidebarCollapsed ? "justify-center" : ""
                    } ${
                      isActive
                        ? isLight
                          ? "bg-blue-50 text-blue-700 font-semibold shadow-xs"
                          : "bg-blue-600/15 text-blue-400 font-semibold"
                        : isLight
                        ? "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                        : "text-slate-300 hover:text-white hover:bg-white/5"
                    }`}
                  >
                    {/* Left Active Indicator Bar */}
                    {isActive && (
                      <span className="absolute left-0 top-1.5 bottom-1.5 w-1 rounded-r bg-blue-600" />
                    )}

                    <Icon
                      className={`w-4 h-4 shrink-0 transition-colors ${
                        isActive
                          ? "text-blue-500"
                          : isLight
                          ? "text-slate-500"
                          : "text-slate-400"
                      }`}
                    />

                    {!sidebarCollapsed && <span className="truncate">{item.label}</span>}
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>

        {/* 3. Support Hotline & Sign Out Pinned at Bottom */}
        <div
          className={`p-2.5 border-t space-y-1 shrink-0 ${
            isLight ? "border-[#E2E8F0] bg-slate-50/50" : "border-white/10 bg-[#0F172A]"
          }`}
        >
          {!sidebarCollapsed ? (
            <>
              {/* WhatsApp Support Row */}
              <a
                href="https://wa.me/94774141118"
                target="_blank"
                rel="noopener noreferrer"
                className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs transition-colors ${
                  isLight ? "text-slate-600 hover:bg-slate-200/50" : "text-slate-400 hover:bg-white/5"
                }`}
              >
                <span className="flex items-center gap-2 font-medium">
                  <HelpCircle className="w-3.5 h-3.5 text-blue-500" /> WhatsApp Hotline
                </span>
                <ExternalLink className="w-3 h-3 opacity-60" />
              </a>

              {/* Sign Out Button */}
              <button
                type="button"
                onClick={handleLogout}
                className="w-full flex items-center gap-2 px-2.5 py-2 text-xs font-semibold text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Sign Out</span>
              </button>
            </>
          ) : (
            <div className="flex flex-col items-center gap-2 py-1">
              <button
                type="button"
                onClick={handleLogout}
                title="Sign Out"
                className="p-2 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </aside>

      {/* ── Main Content Shell ── */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Header Bar (64px) */}
        <header
          data-admin-header="true"
          className={`h-16 border-b px-4 sm:px-8 flex items-center justify-between gap-4 shrink-0 transition-colors duration-150 ${
            isLight
              ? "bg-[#FFFFFF] border-[#E2E8F0]"
              : "bg-[#0F172A] border-white/10"
          }`}
        >
          {/* Left: Mobile Toggle, Desktop Collapse & Breadcrumbs */}
          <div className="flex items-center gap-3 min-w-0">
            {/* Mobile Hamburger */}
            <button
              type="button"
              onClick={() => setMobileSidebarOpen(true)}
              className={`p-2 rounded-lg lg:hidden ${
                isLight ? "text-slate-600 hover:bg-slate-100" : "text-slate-300 hover:bg-white/5"
              }`}
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Desktop Rail Collapse Toggle */}
            <button
              type="button"
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              title={sidebarCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
              className={`hidden lg:flex p-1.5 rounded-lg transition-colors ${
                isLight ? "text-slate-500 hover:bg-slate-100" : "text-slate-400 hover:bg-white/5"
              }`}
            >
              {sidebarCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
            </button>

            {/* Breadcrumb Context */}
            <div className="hidden sm:flex items-center gap-2 text-xs font-medium truncate">
              <span className={isLight ? "text-slate-400" : "text-slate-500"}>Admin</span>
              <span className={isLight ? "text-slate-300" : "text-slate-700"}>/</span>
              <span className={isLight ? "text-slate-500" : "text-slate-400"}>{currentTabMeta.group}</span>
              <span className={isLight ? "text-slate-300" : "text-slate-700"}>/</span>
              <span className={`font-semibold ${isLight ? "text-slate-900" : "text-white"}`}>
                {currentTabMeta.label}
              </span>
            </div>
          </div>

          {/* Center: Omnibar Search Trigger */}
          <div className="flex-1 max-w-md mx-2 sm:mx-4">
            <button
              type="button"
              onClick={() => setIsCommandPaletteOpen(true)}
              className={`w-full flex items-center justify-between px-3.5 py-1.5 rounded-xl text-xs transition-all border ${
                isLight
                  ? "bg-slate-50 border-slate-200 text-slate-500 hover:bg-slate-100 hover:border-slate-300"
                  : "bg-white/5 border-white/10 text-slate-400 hover:bg-white/10 hover:border-white/20"
              }`}
            >
              <span className="flex items-center gap-2 truncate">
                <Search className="w-3.5 h-3.5 shrink-0" />
                <span className="truncate">Search orders, catalog, actions...</span>
              </span>
              <kbd className="hidden sm:inline-block text-[10px] font-mono px-1.5 py-0.5 rounded bg-black/10 dark:bg-white/10 text-slate-400 border border-black/5 dark:border-white/5 shrink-0">
                ⌘ K
              </kbd>
            </button>
          </div>

          {/* Right: Theme Toggle, Notifications, Profile, Primary Add Product */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {/* Theme Toggle Button */}
            <button
              type="button"
              onClick={toggleTheme}
              title={isLight ? "Switch to Dark Mode" : "Switch to Light Mode"}
              className={`p-2 rounded-xl border transition-colors ${
                isLight
                  ? "bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100"
                  : "bg-white/5 border-white/10 text-slate-300 hover:bg-white/10"
              }`}
            >
              {isLight ? <Moon className="w-4 h-4 text-slate-600" /> : <Sun className="w-4 h-4 text-amber-400" />}
            </button>

            {/* Notification Bell */}
            <button
              type="button"
              onClick={() => router.push("/admin/dashboard?tab=orders")}
              title="Recent Orders"
              className={`relative p-2 rounded-xl border transition-colors ${
                isLight
                  ? "bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100"
                  : "bg-white/5 border-white/10 text-slate-300 hover:bg-white/10"
              }`}
            >
              <Bell className="w-4 h-4" />
              {hasUnreadAlert && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
              )}
            </button>

            {/* Primary Action Button: "+ Add Product" */}
            <button
              type="button"
              onClick={() => setIsAddProductOpen(true)}
              className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-sm transition-all flex items-center gap-1.5 active:scale-95"
            >
              <Plus className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Add Product</span>
            </button>
          </div>
        </header>

        {/* Dynamic Tab Content Area */}
        <main
          className={`flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 transition-colors duration-150 ${
            isLight ? "bg-[#F8FAFC]" : "bg-[#090D14]"
          }`}
        >
          {children}
        </main>
      </div>

      {/* ── Global Overlay Layer ── */}

      {/* Global Command Palette Omnibar */}
      <CommandPalette
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
        onOpenAddProduct={() => setIsAddProductOpen(true)}
      />

      {/* Global Product Add Modal triggered from Top Bar */}
      <ProductModal
        isOpen={isAddProductOpen}
        onClose={() => setIsAddProductOpen(false)}
        onSave={() => {
          setIsAddProductOpen(false);
          window.location.reload();
        }}
        categories={[]}
      />

      {/* ── Global Notification Layer: Live Order Toast ── */}
      {liveAlert && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#1E293B] border border-white/15 rounded-2xl p-4 shadow-2xl max-w-sm flex items-start gap-3.5 animate-in fade-in slide-in-from-bottom-4">
          <div className="w-9 h-9 rounded-xl bg-blue-600/20 text-blue-400 flex items-center justify-center shrink-0">
            <ShoppingBag className="w-4 h-4 animate-bounce" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2">
              <h4 className="text-white font-bold text-xs">New Order Placed!</h4>
              <button
                onClick={() => setLiveAlert(null)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
            <p className="text-[11px] text-slate-300 mt-0.5 truncate">
              {liveAlert.customerName || "Customer"} • {formatPrice(liveAlert.finalTotal || liveAlert.totalPrice || 0)}
            </p>
            <div className="flex items-center gap-2 mt-2.5">
              <Link
                href="/admin/dashboard?tab=orders"
                onClick={() => setLiveAlert(null)}
                className="px-2.5 py-1 bg-blue-600 text-white font-semibold text-[11px] rounded-lg hover:bg-blue-700 transition-colors"
              >
                View Order
              </Link>
              <button
                onClick={() => setLiveAlert(null)}
                className="px-2.5 py-1 bg-white/10 text-slate-300 hover:text-white rounded-lg text-[11px] transition-colors"
              >
                Dismiss
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#090D14] flex items-center justify-center text-white text-sm font-semibold">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full border-2 border-blue-500 border-t-transparent animate-spin" />
            Loading Admin Workspace...
          </div>
        </div>
      }
    >
      <DashboardLayoutContent>{children}</DashboardLayoutContent>
    </Suspense>
  );
}
