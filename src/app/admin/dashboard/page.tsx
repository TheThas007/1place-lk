"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  LayoutDashboard,
  Package,
  FolderOpen,
  Star,
  Image as ImageIcon,
  Settings,
  LogOut,
  Plus,
  TrendingUp,
  ShoppingBag,
  Users,
  Eye,
  Edit,
  Trash2,
  ChevronRight,
} from "lucide-react";
import { products, categories, reviews } from "@/lib/data";
import { formatPrice } from "@/lib/utils";

type Tab = "overview" | "products" | "categories" | "reviews" | "gallery";

export default function AdminDashboard() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<Tab>("overview");
  const [isAuthed, setIsAuthed] = useState(false);

  useEffect(() => {
    const auth = sessionStorage.getItem("admin_auth");
    if (!auth) {
      router.push("/admin/login");
    } else {
      setIsAuthed(true);
    }
  }, [router]);

  const handleLogout = () => {
    sessionStorage.removeItem("admin_auth");
    router.push("/admin/login");
  };

  if (!isAuthed) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-white/20 border-t-white rounded-full animate-spin" />
      </div>
    );
  }

  const sidebarItems = [
    { id: "overview" as Tab, label: "Overview", icon: LayoutDashboard },
    { id: "products" as Tab, label: "Products", icon: Package },
    { id: "categories" as Tab, label: "Categories", icon: FolderOpen },
    { id: "reviews" as Tab, label: "Reviews", icon: Star },
    { id: "gallery" as Tab, label: "Gallery", icon: ImageIcon },
  ];

  const stats = [
    {
      label: "Total Products",
      value: products.length.toString(),
      icon: Package,
      change: "+3 this month",
      color: "bg-blue-500/10 text-blue-400",
    },
    {
      label: "Categories",
      value: categories.length.toString(),
      icon: FolderOpen,
      change: "10 active",
      color: "bg-emerald-500/10 text-emerald-400",
    },
    {
      label: "Reviews",
      value: reviews.length.toString(),
      icon: Star,
      change: "4.9 avg rating",
      color: "bg-amber-500/10 text-amber-400",
    },
    {
      label: "Total Views",
      value: "2.4K",
      icon: Eye,
      change: "+12% this week",
      color: "bg-purple-500/10 text-purple-400",
    },
  ];

  return (
    <div className="min-h-screen bg-slate-950 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900 border-r border-white/5 flex flex-col">
        {/* Brand */}
        <div className="p-6 border-b border-white/5">
          <h1 className="text-lg font-bold text-white tracking-tight">
            STREET MOBILE
          </h1>
          <p className="text-xs text-white/40 mt-0.5">Admin Dashboard</p>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-4 space-y-1">
          {sidebarItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                activeTab === item.id
                  ? "bg-white/10 text-white"
                  : "text-white/50 hover:text-white/80 hover:bg-white/5"
              }`}
            >
              <item.icon className="w-4 h-4" />
              {item.label}
            </button>
          ))}
        </nav>

        {/* Bottom */}
        <div className="p-4 border-t border-white/5 space-y-1">
          <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-white/50 hover:text-white/80 hover:bg-white/5 transition-all">
            <Settings className="w-4 h-4" />
            Settings
          </button>
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
              {activeTab}
            </h2>
            <p className="text-xs text-white/40 mt-0.5">
              Manage your store content
            </p>
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
          {activeTab === "overview" && (
            <OverviewTab stats={stats} />
          )}
          {activeTab === "products" && <ProductsTab />}
          {activeTab === "categories" && <CategoriesTab />}
          {activeTab === "reviews" && <ReviewsTab />}
          {activeTab === "gallery" && <GalleryTab />}
        </div>
      </main>
    </div>
  );
}

/* ─── Overview Tab ─── */
function OverviewTab({
  stats,
}: {
  stats: {
    label: string;
    value: string;
    icon: React.ElementType;
    change: string;
    color: string;
  }[];
}) {
  return (
    <div className="space-y-8">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="bg-white/[0.03] border border-white/5 rounded-2xl p-6 hover:bg-white/[0.05] transition-all"
          >
            <div className="flex items-center justify-between mb-4">
              <div
                className={`w-10 h-10 rounded-xl ${stat.color} flex items-center justify-center`}
              >
                <stat.icon className="w-5 h-5" />
              </div>
              <TrendingUp className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-2xl font-bold text-white">{stat.value}</div>
            <div className="text-xs text-white/40 mt-1">{stat.label}</div>
            <div className="text-xs text-emerald-400/80 mt-2">
              {stat.change}
            </div>
          </div>
        ))}
      </div>

      {/* Recent Products */}
      <div className="bg-white/[0.03] border border-white/5 rounded-2xl overflow-hidden">
        <div className="p-6 border-b border-white/5 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-white">Recent Products</h3>
          <span className="text-xs text-white/40">
            {products.length} total
          </span>
        </div>
        <div className="divide-y divide-white/5">
          {products.slice(0, 5).map((product) => (
            <div
              key={product.id}
              className="flex items-center gap-4 px-6 py-4 hover:bg-white/[0.02] transition-colors"
            >
              <div className="w-12 h-12 rounded-xl bg-white/5 overflow-hidden shrink-0">
                <img
                  src={product.images[0]}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-white truncate">
                  {product.name}
                </div>
                <div className="text-xs text-white/40">
                  {product.category_name}
                </div>
              </div>
              <div className="text-sm font-semibold text-white">
                {formatPrice(product.price)}
              </div>
              <span
                className={`text-[10px] font-medium px-2.5 py-1 rounded-full uppercase tracking-wider ${
                  product.stock_status === "in_stock"
                    ? "bg-emerald-500/10 text-emerald-400"
                    : product.stock_status === "low_stock"
                    ? "bg-amber-500/10 text-amber-400"
                    : "bg-red-500/10 text-red-400"
                }`}
              >
                {product.stock_status.replace("_", " ")}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Reviews */}
      <div className="bg-white/[0.03] border border-white/5 rounded-2xl overflow-hidden">
        <div className="p-6 border-b border-white/5 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-white">Recent Reviews</h3>
          <span className="text-xs text-white/40">
            {reviews.length} total
          </span>
        </div>
        <div className="divide-y divide-white/5">
          {reviews.slice(0, 3).map((review) => (
            <div
              key={review.id}
              className="px-6 py-4 hover:bg-white/[0.02] transition-colors"
            >
              <div className="flex items-center gap-3 mb-2">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500/30 to-purple-500/30 flex items-center justify-center text-white text-xs font-bold">
                  {review.author_name.charAt(0)}
                </div>
                <div>
                  <div className="text-sm font-medium text-white">
                    {review.author_name}
                  </div>
                  <div className="flex items-center gap-1">
                    {[...Array(review.rating)].map((_, i) => (
                      <Star
                        key={i}
                        className="w-3 h-3 fill-amber-400 text-amber-400"
                      />
                    ))}
                  </div>
                </div>
              </div>
              <p className="text-xs text-white/50 line-clamp-2">
                {review.text}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ─── Products Tab ─── */
function ProductsTab() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-white">All Products</h3>
          <p className="text-xs text-white/40 mt-0.5">
            {products.length} products in your store
          </p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2.5 bg-white text-slate-900 rounded-xl text-sm font-semibold hover:bg-white/90 transition-all active:scale-[0.98]">
          <Plus className="w-4 h-4" />
          Add Product
        </button>
      </div>

      <div className="bg-white/[0.03] border border-white/5 rounded-2xl overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-white/5">
              <th className="text-left text-xs font-medium text-white/40 uppercase tracking-wider px-6 py-4">
                Product
              </th>
              <th className="text-left text-xs font-medium text-white/40 uppercase tracking-wider px-6 py-4">
                Category
              </th>
              <th className="text-left text-xs font-medium text-white/40 uppercase tracking-wider px-6 py-4">
                Price
              </th>
              <th className="text-left text-xs font-medium text-white/40 uppercase tracking-wider px-6 py-4">
                Status
              </th>
              <th className="text-right text-xs font-medium text-white/40 uppercase tracking-wider px-6 py-4">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {products.map((product) => (
              <tr
                key={product.id}
                className="hover:bg-white/[0.02] transition-colors"
              >
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-white/5 overflow-hidden shrink-0">
                      <img
                        src={product.images[0]}
                        alt={product.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <span className="text-sm font-medium text-white truncate max-w-[200px]">
                      {product.name}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className="text-sm text-white/60">
                    {product.category_name}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span className="text-sm font-semibold text-white">
                    {formatPrice(product.price)}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span
                    className={`text-[10px] font-medium px-2.5 py-1 rounded-full uppercase tracking-wider ${
                      product.stock_status === "in_stock"
                        ? "bg-emerald-500/10 text-emerald-400"
                        : product.stock_status === "low_stock"
                        ? "bg-amber-500/10 text-amber-400"
                        : "bg-red-500/10 text-red-400"
                    }`}
                  >
                    {product.stock_status.replace("_", " ")}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center justify-end gap-2">
                    <button className="p-2 rounded-lg hover:bg-white/10 text-white/40 hover:text-white transition-all">
                      <Edit className="w-4 h-4" />
                    </button>
                    <button className="p-2 rounded-lg hover:bg-red-500/10 text-white/40 hover:text-red-400 transition-all">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ─── Categories Tab ─── */
function CategoriesTab() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-white">All Categories</h3>
          <p className="text-xs text-white/40 mt-0.5">
            {categories.length} categories
          </p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2.5 bg-white text-slate-900 rounded-xl text-sm font-semibold hover:bg-white/90 transition-all active:scale-[0.98]">
          <Plus className="w-4 h-4" />
          Add Category
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {categories.map((cat) => (
          <div
            key={cat.id}
            className="bg-white/[0.03] border border-white/5 rounded-2xl p-5 hover:bg-white/[0.05] transition-all group"
          >
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-xl bg-white/5 overflow-hidden shrink-0">
                <img
                  src={cat.image_url}
                  alt={cat.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-semibold text-white">
                  {cat.name}
                </div>
                <div className="text-xs text-white/40 mt-0.5">
                  /{cat.slug} · Order: {cat.sort_order}
                </div>
              </div>
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button className="p-2 rounded-lg hover:bg-white/10 text-white/40 hover:text-white transition-all">
                  <Edit className="w-4 h-4" />
                </button>
                <button className="p-2 rounded-lg hover:bg-red-500/10 text-white/40 hover:text-red-400 transition-all">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── Reviews Tab ─── */
function ReviewsTab() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-white">Customer Reviews</h3>
          <p className="text-xs text-white/40 mt-0.5">
            {reviews.length} reviews
          </p>
        </div>
      </div>

      <div className="space-y-4">
        {reviews.map((review) => (
          <div
            key={review.id}
            className="bg-white/[0.03] border border-white/5 rounded-2xl p-6 hover:bg-white/[0.05] transition-all"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500/30 to-purple-500/30 flex items-center justify-center text-white text-sm font-bold">
                  {review.author_name.charAt(0)}
                </div>
                <div>
                  <div className="text-sm font-semibold text-white">
                    {review.author_name}
                  </div>
                  <div className="flex items-center gap-2 mt-0.5">
                    <div className="flex items-center gap-0.5">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-3 h-3 ${
                            i < review.rating
                              ? "fill-amber-400 text-amber-400"
                              : "text-white/10"
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-xs text-white/30">
                      {review.review_date}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span
                  className={`text-[10px] font-medium px-2.5 py-1 rounded-full uppercase tracking-wider ${
                    review.visible
                      ? "bg-emerald-500/10 text-emerald-400"
                      : "bg-red-500/10 text-red-400"
                  }`}
                >
                  {review.visible ? "Visible" : "Hidden"}
                </span>
                <button className="p-2 rounded-lg hover:bg-red-500/10 text-white/40 hover:text-red-400 transition-all">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
            <p className="text-sm text-white/60 mt-3 leading-relaxed">
              &ldquo;{review.text}&rdquo;
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── Gallery Tab ─── */
function GalleryTab() {
  const galleryImages = [
    "https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?q=80&w=800&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1556656793-08538906a9f8?q=80&w=800&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?q=80&w=800&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1491933382434-500287f9b54b?q=80&w=800&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1574887428131-01b34e405a76?q=80&w=800&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1512499617640-c74ae3a79d37?q=80&w=800&auto=format&fit=crop",
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-white">Gallery Images</h3>
          <p className="text-xs text-white/40 mt-0.5">
            {galleryImages.length} images
          </p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2.5 bg-white text-slate-900 rounded-xl text-sm font-semibold hover:bg-white/90 transition-all active:scale-[0.98]">
          <Plus className="w-4 h-4" />
          Upload Image
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
        {galleryImages.map((src, idx) => (
          <div
            key={idx}
            className="group relative aspect-square rounded-2xl overflow-hidden bg-white/5 border border-white/5"
          >
            <img
              src={src}
              alt={`Gallery image ${idx + 1}`}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center">
              <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button className="p-2.5 rounded-xl bg-white/20 backdrop-blur-sm text-white hover:bg-white/30 transition-all">
                  <Eye className="w-4 h-4" />
                </button>
                <button className="p-2.5 rounded-xl bg-red-500/20 backdrop-blur-sm text-red-300 hover:bg-red-500/30 transition-all">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
