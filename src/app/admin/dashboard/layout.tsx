"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  LayoutDashboard,
  Package,
  FolderOpen,
  ShoppingBag,
  Users,
  HardDrive,
  ImageIcon,
  Sparkles,
  ShieldCheck,
  CreditCard,
  Star,
  BarChart3,
  Settings,
  LogOut,
  Bell,
  Search,
  Plus,
  HelpCircle,
  ChevronDown,
  Menu,
  X,
  Smartphone,
  Images,
  Tag,
  LayoutGrid,
  Globe,
} from "lucide-react";
import { formatPrice } from "@/lib/utils";
import { db } from "@/lib/firebase";
import { collection, getDocs } from "firebase/firestore";
import ProductModal from "@/components/admin/ProductModal";

const SIDEBAR_ITEMS = [
  { id: "overview", label: "Overview", icon: LayoutDashboard, href: "/admin/dashboard" },
  { id: "products", label: "Products", icon: Package, href: "/admin/dashboard?tab=products" },
  { id: "categories", label: "Shop by Category", icon: FolderOpen, href: "/admin/dashboard?tab=categories" },
  { id: "brands", label: "Shop by Brand", icon: Tag, href: "/admin/dashboard?tab=brands" },
  { id: "warranties", label: "Warranty Management", icon: ShieldCheck, href: "/admin/dashboard?tab=warranties" },
  { id: "collections", label: "Featured Collections", icon: LayoutGrid, href: "/admin/dashboard?tab=collections" },
  { id: "showcase", label: "Visual Showcase", icon: Sparkles, href: "/admin/dashboard?tab=showcase" },
  { id: "orders", label: "Orders", icon: ShoppingBag, href: "/admin/dashboard?tab=orders" },
  { id: "users", label: "Customers", icon: Users, href: "/admin/dashboard?tab=users" },
  { id: "gallery", label: "Store Gallery", icon: Images, href: "/admin/dashboard?tab=gallery" },
  { id: "hero", label: "Hero Slider", icon: Sparkles, href: "/admin/dashboard?tab=hero" },
  { id: "banners", label: "Offers & Banners", icon: ImageIcon, href: "/admin/dashboard?tab=banners" },
  { id: "footer", label: "Footer Settings", icon: Globe, href: "/admin/dashboard?tab=footer" },
  { id: "inventory", label: "Inventory", icon: HardDrive, href: "/admin/dashboard?tab=inventory" },
  { id: "payments", label: "Payments", icon: CreditCard, href: "/admin/dashboard?tab=payments" },
  { id: "reviews", label: "Reviews", icon: Star, href: "/admin/dashboard?tab=reviews" },
  { id: "analytics", label: "Analytics", icon: BarChart3, href: "/admin/dashboard?tab=analytics" },
  { id: "assistant", label: "Streetla Assistant", icon: Sparkles, href: "/admin/dashboard?tab=assistant" },
  { id: "settings", label: "Settings", icon: Settings, href: "/admin/dashboard?tab=settings" },
];


import { Suspense } from "react";

function DashboardLayoutContent({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const activeTabParam = searchParams.get("tab") || "overview";
  const [isAuthed, setIsAuthed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // Search & Modals
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddProductOpen, setIsAddProductOpen] = useState(false);

  // Live order alert state
  const [liveAlert, setLiveAlert] = useState<any | null>(null);
  const lastOrderId = useRef<string | null>(null);

  useEffect(() => {
    const auth = sessionStorage.getItem("admin_auth");
    if (!auth) {
      router.push("/admin/login");
    } else {
      setIsAuthed(true);
    }
  }, [router]);

  // Keyboard shortcut ⌘K for search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        const searchInput = document.getElementById("admin-global-search");
        if (searchInput) searchInput.focus();
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
            try {
              const audio = new Audio("https://assets.mixkit.co/active_storage/sfx/2869/2869-200.wav");
              audio.play().catch(() => { });
            } catch (e) { }
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
      const timer = setTimeout(() => setLiveAlert(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [liveAlert]);

  const handleLogout = () => {
    sessionStorage.removeItem("admin_auth");
    router.push("/admin/login");
  };

  if (!isAuthed) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center text-white font-sans">
        <div className="flex items-center gap-2 font-bold text-sm">
          <div className="w-4 h-4 rounded-full border-2 border-blue-500 border-t-transparent animate-spin" />
          Authenticating Admin Session...
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-[#090D14] overflow-hidden font-sans text-white">
      {/* ── Mobile Sidebar Drawer Backdrop ── */}
      {mobileSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/80 z-40 lg:hidden"
          onClick={() => setMobileSidebarOpen(false)}
        />
      )}

      {/* ── Left Navigation Sidebar (Dark Mode) ── */}
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-50 w-[260px] bg-[#0F172A] border-r border-white/10 flex flex-col transition-transform duration-300 ${mobileSidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
          }`}
      >
        {/* Brand Logo Header */}
        <div className="h-16 px-6 border-b border-white/10 flex items-center justify-between">
          <Link href="/admin/dashboard" className="flex items-center gap-3">
            <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-lg">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-base font-extrabold text-white tracking-tight leading-none">
                StreetMobile<span className="text-blue-500">.lk</span>
              </h1>
              <span className="text-[10px] text-white/40 font-bold uppercase tracking-widest">
                Admin Panel
              </span>
            </div>
          </Link>

          <button
            onClick={() => setMobileSidebarOpen(false)}
            className="p-1 rounded-lg text-white/40 hover:text-white lg:hidden"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Sidebar Nav Links */}
        <nav className="flex-1 overflow-y-auto px-4 py-4 space-y-1 custom-scrollbar">
          {SIDEBAR_ITEMS.map((item) => {
            const isActive = activeTabParam === item.id;

            return (
              <Link
                key={item.id}
                href={item.href}
                onClick={() => setMobileSidebarOpen(false)}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all ${isActive
                    ? "bg-blue-600 text-white font-bold shadow-md shadow-blue-600/30"
                    : "text-white/60 hover:text-white hover:bg-white/5"
                  }`}
              >
                <item.icon className={`w-4 h-4 ${isActive ? "text-white" : "text-white/40"}`} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Bottom Support Widget Card */}
        <div className="p-4 border-t border-white/10">
          <div className="p-4 bg-white/5 border border-white/10 rounded-2xl text-center space-y-3">
            <div className="w-8 h-8 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center mx-auto">
              <HelpCircle className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-bold text-white">Need Help?</p>
              <p className="text-[11px] text-white/40">Contact support team</p>
            </div>
            <button
              onClick={() => window.open("https://wa.me/94774141118", "_blank")}
              className="w-full py-2 px-3 bg-white/10 border border-white/10 text-white text-xs font-bold rounded-xl hover:bg-white/20 transition-colors"
            >
              Contact Support
            </button>
          </div>

          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 mt-2 text-xs font-bold text-red-400 hover:bg-red-500/10 rounded-xl transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* ── Main Content Area (Dark Theme) ── */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">

        {/* Top Header Bar */}
        <header className="h-16 bg-[#0F172A] border-b border-white/10 px-4 sm:px-8 flex items-center justify-between gap-4 shrink-0">
          <div className="flex items-center gap-3 flex-1 max-w-xl">
            <button
              onClick={() => setMobileSidebarOpen(true)}
              className="p-2 rounded-xl text-white/60 hover:text-white lg:hidden"
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Title / Search */}
            <h2 className="hidden sm:block text-base font-extrabold text-white shrink-0">
              StreetMobile Admin
            </h2>

            {/* Global Search Bar */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
              <input
                id="admin-global-search"
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search anything..."
                className="w-full pl-10 pr-12 py-2 bg-white/5 border border-white/10 rounded-xl text-xs text-white placeholder-white/30 focus:outline-none focus:border-blue-500 focus:bg-white/10 transition-all"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-mono text-white/40 bg-white/10 border border-white/10 px-1.5 py-0.5 rounded">
                ⌘ K
              </span>
            </div>
          </div>

          {/* Top Right Controls */}
          <div className="flex items-center gap-3 sm:gap-4 shrink-0">
            {/* Notification Bell with unread badge */}
            <button
              type="button"
              className="relative p-2.5 rounded-xl text-white/60 hover:text-white hover:bg-white/10 transition-colors"
            >
              <Bell className="w-5 h-5" />
              <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-red-600 text-white text-[10px] font-black rounded-full flex items-center justify-center border-2 border-[#0F172A]">
                5
              </span>
            </button>

            {/* Admin Profile Dropdown */}
            <div className="flex items-center gap-2.5 pl-2 border-l border-white/10">
              <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-xs shadow-md">
                TA
              </div>
              <div className="hidden sm:block text-left">
                <p className="text-xs font-extrabold text-white leading-none">Thas Admin</p>
                <p className="text-[10px] text-white/40 font-medium">Admin</p>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-white/40 hidden sm:block" />
            </div>

            {/* Primary Blue Action Button "+ Add Product" */}
            <button
              type="button"
              onClick={() => setIsAddProductOpen(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold hover:bg-blue-700 transition-all flex items-center gap-1.5 shadow-md shadow-blue-600/30 active:scale-[0.98]"
            >
              <Plus className="w-4 h-4" />
              <span>Add Product</span>
            </button>
          </div>
        </header>

        {/* Dynamic Content */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-8 bg-[#090D14] text-white">
          {children}
        </main>
      </div>

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

      {/* Live Order Toast */}
      {liveAlert && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#1E293B] border border-white/10 rounded-2xl p-5 shadow-2xl max-w-sm flex items-start gap-4 animate-in fade-in slide-in-from-bottom-5">
          <div className="w-10 h-10 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center shrink-0">
            <Bell className="w-5 h-5 animate-bounce" />
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="text-white font-bold text-sm">New Order Received!</h4>
            <p className="text-xs text-white/60 mt-1 truncate">
              By {liveAlert.customerName || "Guest"} • {formatPrice(liveAlert.finalTotal || liveAlert.totalPrice || 0)}
            </p>
            <div className="flex items-center gap-2 mt-3">
              <Link
                href="/admin/dashboard?tab=orders"
                onClick={() => setLiveAlert(null)}
                className="px-3 py-1.5 bg-blue-600 text-white font-bold text-xs rounded-xl hover:bg-blue-700 transition-colors"
              >
                View Order
              </Link>
              <button
                onClick={() => setLiveAlert(null)}
                className="px-3 py-1.5 bg-white/10 text-white/60 hover:text-white rounded-xl text-xs font-semibold transition-colors"
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
    <Suspense fallback={<div className="min-h-screen bg-[#090D14] flex items-center justify-center text-white text-sm font-bold">Loading Admin Panel...</div>}>
      <DashboardLayoutContent>{children}</DashboardLayoutContent>
    </Suspense>
  );
}
