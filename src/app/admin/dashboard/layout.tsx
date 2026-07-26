"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import {
  LayoutDashboard,
  Package,
  FolderOpen,
  Star,
  Image as ImageIcon,
  Settings,
  LogOut,
  Eye,
  Bell,
  Wrench,
  Truck,
  DollarSign,
  Sparkles
} from "lucide-react";
import { formatPrice } from "@/lib/utils";
import { db } from "@/lib/firebase";
import { collection, onSnapshot, query, orderBy } from "firebase/firestore";

const SIDEBAR_ITEMS = [
  { id: "overview", label: "Overview", icon: LayoutDashboard, href: "/admin/dashboard" },
  { id: "products", label: "Products", icon: Package, href: "/admin/dashboard/products" },
  { id: "categories", label: "Categories", icon: FolderOpen, href: "/admin/dashboard/categories" },
  { id: "orders", label: "Orders", icon: Package, href: "/admin/dashboard/orders" },
  
  // Phase 1 New Modules
  { id: "repairs", label: "Repair Center", icon: Wrench, href: "/admin/dashboard/repairs" },
  { id: "suppliers", label: "Suppliers", icon: Truck, href: "/admin/dashboard/suppliers" },
  { id: "cashflow", label: "Cash Flow", icon: DollarSign, href: "/admin/dashboard/cashflow" },

  // Marketing & Media
  { id: "banners", label: "Offer Banners", icon: Sparkles, href: "/admin/dashboard/banners" },
  { id: "gallery", label: "Gallery", icon: ImageIcon, href: "/admin/dashboard/gallery" },
  { id: "reviews", label: "Reviews", icon: Star, href: "/admin/dashboard/reviews" },
  { id: "hero", label: "Hero Slides", icon: ImageIcon, href: "/admin/dashboard/hero" },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [isAuthed, setIsAuthed] = useState(false);
  
  // Live order alert state
  const [liveAlert, setLiveAlert] = useState<any | null>(null);
  const isFirstLoad = useRef(true);

  useEffect(() => {
    const auth = sessionStorage.getItem("admin_auth");
    if (!auth) {
      router.push("/admin/login");
    } else {
      setIsAuthed(true);
    }
  }, [router]);

  useEffect(() => {
    if (!isAuthed) return;
    const q = query(collection(db, "orders"), orderBy("createdAt", "desc"));
    const unsub = onSnapshot(
      q,
      (snapshot) => {
        if (isFirstLoad.current) {
          isFirstLoad.current = false;
          return;
        }
        snapshot.docChanges().forEach((change) => {
          if (change.type === "added") {
            const newOrder = { ...change.doc.data(), id: change.doc.id } as any;
            setLiveAlert(newOrder);
            try {
              const audio = new Audio("https://assets.mixkit.co/active_storage/sfx/2869/2869-200.wav");
              const promise = audio.play();
              if (promise !== undefined) {
                promise.catch(() => {});
              }
            } catch (e) {}
          }
        });
      },
      (error) => {
        console.warn("Orders listener permission/network warning:", error);
      }
    );
    return () => unsub();
  }, [isAuthed]);

  const handleLogout = () => {
    sessionStorage.removeItem("admin_auth");
    router.push("/admin/login");
  };

  if (!isAuthed) return <div className="min-h-screen bg-black flex items-center justify-center text-white">Loading...</div>;

  return (
    <div className="flex h-screen bg-black overflow-hidden font-sans text-white">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-950/50 border-r border-white/5 flex flex-col backdrop-blur-xl">
        <div className="p-6">
          <Link href="/admin/dashboard" className="flex items-center gap-3 group">
            <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center group-hover:scale-105 transition-transform">
              <span className="text-black font-black text-xl tracking-tighter">SM</span>
            </div>
            <div>
              <h1 className="text-white font-bold tracking-tight">STREET MOBILE</h1>
              <p className="text-[10px] text-white/40 uppercase tracking-widest font-semibold mt-0.5">Enterprise ERP</p>
            </div>
          </Link>
        </div>

        <nav className="flex-1 overflow-y-auto px-4 py-4 space-y-1 custom-scrollbar">
          {SIDEBAR_ITEMS.map((item) => {
            const isActive = pathname === item.href || (item.href !== "/admin/dashboard" && pathname.startsWith(item.href));
            return (
              <Link
                key={item.id}
                href={item.href}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? "bg-white text-black shadow-lg"
                    : "text-white/50 hover:text-white/80 hover:bg-white/5"
                }`}
              >
                <item.icon className="w-4 h-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-white/5 space-y-1">
          <Link 
            href="/admin/dashboard/settings"
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
              pathname === "/admin/dashboard/settings"
                ? "bg-white text-black shadow-lg"
                : "text-white/50 hover:text-white/80 hover:bg-white/5"
            }`}
          >
            <Settings className="w-4 h-4" />
            Settings
          </Link>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-red-400/70 hover:text-red-400 hover:bg-red-500/5 transition-all"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        {/* Top Bar */}
        <div className="sticky top-0 z-10 bg-slate-950/80 backdrop-blur-xl border-b border-white/5 px-8 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-white capitalize">
              {pathname.split("/").pop() || "Overview"}
            </h2>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/"
              target="_blank"
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white/60 text-sm hover:text-white hover:bg-white/10 transition-all"
            >
              <Eye className="w-4 h-4" />
              View Site
            </Link>
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold">
              A
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-8">
          {children}
        </div>
      </main>

      {/* Live Order Toast */}
      {liveAlert && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 border-2 border-emerald-500/80 rounded-2xl p-5 shadow-[0_10px_40px_rgba(16,185,129,0.15)] max-w-sm flex items-start gap-4 animate-in fade-in slide-in-from-bottom-5">
          <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
            <Bell className="w-5 h-5 animate-bounce" />
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="text-white font-bold text-sm">New Order Received!</h4>
            <p className="text-xs text-white/60 mt-1 truncate">
              By {liveAlert.customerName || "Guest"} • {formatPrice(liveAlert.totalPrice || 0)}
            </p>
            <div className="flex items-center gap-2 mt-3">
              <Link
                href="/admin/dashboard/orders"
                onClick={() => setLiveAlert(null)}
                className="px-3 py-1.5 bg-white text-black font-semibold text-xs rounded-lg hover:bg-neutral-200 transition-colors"
              >
                View Order
              </Link>
              <button
                onClick={() => setLiveAlert(null)}
                className="px-3 py-1.5 bg-white/5 border border-white/10 text-white/60 hover:text-white rounded-lg text-xs transition-colors"
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
