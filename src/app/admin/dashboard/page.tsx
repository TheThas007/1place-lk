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
import { formatPrice } from "@/lib/utils";
import { db } from "@/lib/firebase";
import { collection, getDocs, deleteDoc, doc, addDoc, updateDoc } from "firebase/firestore";
import { Product, Category, Review, GalleryImage, HeroSlide } from "@/lib/types";

import ProductModal from "@/components/admin/ProductModal";
import GalleryModal from "@/components/admin/GalleryModal";
import CategoryModal from "@/components/admin/CategoryModal";
import HeroModal from "@/components/admin/HeroModal";

type Tab = "overview" | "products" | "categories" | "reviews" | "gallery" | "hero";

export default function AdminDashboard() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<Tab>("overview");
  const [isAuthed, setIsAuthed] = useState(false);

  const [productsList, setProductsList] = useState<Product[]>([]);
  const [categoriesList, setCategoriesList] = useState<Category[]>([]);
  const [reviewsList, setReviewsList] = useState<Review[]>([]);
  const [galleryList, setGalleryList] = useState<GalleryImage[]>([]);
  const [heroList, setHeroList] = useState<HeroSlide[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  // Modal State
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  const [isGalleryModalOpen, setIsGalleryModalOpen] = useState(false);
  const [editingGalleryImage, setEditingGalleryImage] = useState<GalleryImage | null>(null);

  const [isHeroModalOpen, setIsHeroModalOpen] = useState(false);
  const [editingHeroSlide, setEditingHeroSlide] = useState<HeroSlide | null>(null);

  useEffect(() => {
    const auth = sessionStorage.getItem("admin_auth");
    if (!auth) {
      router.push("/admin/login");
    } else {
      setIsAuthed(true);
      fetchData();
    }
  }, [router]);

  const fetchData = async () => {
    try {
      const [pSnap, cSnap, rSnap, gSnap, hSnap] = await Promise.all([
        getDocs(collection(db, "products")),
        getDocs(collection(db, "categories")),
        getDocs(collection(db, "reviews")),
        getDocs(collection(db, "gallery")),
        getDocs(collection(db, "hero_slides")),
      ]);
      setProductsList(pSnap.docs.map(d => ({ ...d.data(), id: d.id } as Product)));
      setCategoriesList(cSnap.docs.map(d => ({ ...d.data(), id: d.id } as Category)));
      setReviewsList(rSnap.docs.map(d => ({ ...d.data(), id: d.id } as Review)));
      setGalleryList(gSnap.docs.map(d => ({ ...d.data(), id: d.id } as GalleryImage)));
      setHeroList(hSnap.docs.map(d => ({ ...d.data(), id: d.id } as HeroSlide)).sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0)));
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingData(false);
    }
  };

  const handleDeleteProduct = async (id: string) => {
    if (confirm("Are you sure you want to delete this product?")) {
      await deleteDoc(doc(db, "products", id));
      setProductsList(productsList.filter(p => p.id !== id));
    }
  };

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product);
    setIsProductModalOpen(true);
  };

  const handleAddProduct = () => {
    setEditingProduct(null);
    setIsProductModalOpen(true);
  };

  const handleDeleteCategory = async (id: string) => {
    if (confirm("Are you sure you want to delete this category?")) {
      await deleteDoc(doc(db, "categories", id));
      setCategoriesList(categoriesList.filter(c => c.id !== id));
    }
  };

  const handleEditCategory = (category: Category) => {
    setEditingCategory(category);
    setIsCategoryModalOpen(true);
  };

  const handleAddCategory = () => {
    setEditingCategory(null);
    setIsCategoryModalOpen(true);
  };

  const handleDeleteGalleryImage = async (id: string) => {
    if (confirm("Are you sure you want to delete this gallery image?")) {
      await deleteDoc(doc(db, "gallery", id));
      setGalleryList(galleryList.filter(g => g.id !== id));
    }
  };

  const handleDeleteReview = async (id: string) => {
    if (confirm("Are you sure you want to delete this review?")) {
      await deleteDoc(doc(db, "reviews", id));
      setReviewsList(reviewsList.filter(r => r.id !== id));
    }
  };

  const handleEditGalleryImage = (image: GalleryImage) => {
    setEditingGalleryImage(image);
    setIsGalleryModalOpen(true);
  };

  const handleAddGalleryImage = () => {
    setEditingGalleryImage(null);
    setIsGalleryModalOpen(true);
  };

  const handleAddHeroSlide = () => {
    setEditingHeroSlide(null);
    setIsHeroModalOpen(true);
  };

  const handleEditHeroSlide = (slide: HeroSlide) => {
    setEditingHeroSlide(slide);
    setIsHeroModalOpen(true);
  };

  const handleSaveHeroSlide = async (slideData: Partial<HeroSlide>) => {
    if (editingHeroSlide?.id) {
      await updateDoc(doc(db, "hero_slides", editingHeroSlide.id), slideData);
    } else {
      await addDoc(collection(db, "hero_slides"), slideData);
    }
    await fetchData();
  };

  const handleDeleteHeroSlide = async (id: string) => {
    if (confirm("Are you sure you want to delete this hero slide?")) {
      await deleteDoc(doc(db, "hero_slides", id));
      await fetchData();
    }
  };

  const handleInitDefaultHeroSlides = async () => {
    if (!confirm("Load the 4 default Street Mobile 4K studio hero wallpapers into your database?")) return;
    const defaults = [
      { image_url: "/hero-slide-1.png", alt: "Flagship Phones Showcase", sort_order: 1, active: true },
      { image_url: "/hero-slide-2.png", alt: "Luxury Showroom Interior", sort_order: 2, active: true },
      { image_url: "/hero-slide-3.png", alt: "Titanium Camera Lens Detail", sort_order: 3, active: true },
      { image_url: "/hero-slide-4.png", alt: "Minimalist Tech Ecosystem", sort_order: 4, active: true },
    ];
    for (const item of defaults) {
      await addDoc(collection(db, "hero_slides"), item);
    }
    await fetchData();
  };

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
    { id: "hero" as Tab, label: "Hero Banners", icon: ImageIcon },
  ];

  const stats = [
    {
      label: "Total Products",
      value: productsList.length.toString(),
      icon: Package,
      change: "+3 this month",
      color: "bg-blue-500/10 text-blue-400",
    },
    {
      label: "Categories",
      value: categoriesList.length.toString(),
      icon: FolderOpen,
      change: "10 active",
      color: "bg-emerald-500/10 text-emerald-400",
    },
    {
      label: "Reviews",
      value: reviewsList.length.toString(),
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

  if (loadingData) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-white/20 border-t-white rounded-full animate-spin" />
      </div>
    );
  }

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
            <OverviewTab stats={stats} products={productsList} reviews={reviewsList} />
          )}
          {activeTab === "products" && (
            <ProductsTab 
              products={productsList} 
              onDelete={handleDeleteProduct} 
              onEdit={handleEditProduct}
              onAdd={handleAddProduct}
            />
          )}
          {activeTab === "categories" && (
            <CategoriesTab 
              categories={categoriesList} 
              onAdd={handleAddCategory}
              onEdit={handleEditCategory}
              onDelete={handleDeleteCategory}
            />
          )}
          {activeTab === "reviews" && <ReviewsTab reviews={reviewsList} onDelete={handleDeleteReview} />}
          {activeTab === "gallery" && (
            <GalleryTab 
              images={galleryList} 
              onAdd={handleAddGalleryImage} 
              onEdit={handleEditGalleryImage} 
              onDelete={handleDeleteGalleryImage} 
            />
          )}
          {activeTab === "hero" && (
            <HeroTab
              slides={heroList}
              onAdd={handleAddHeroSlide}
              onEdit={handleEditHeroSlide}
              onDelete={handleDeleteHeroSlide}
              onInitDefaults={handleInitDefaultHeroSlides}
            />
          )}
        </div>
      </main>

      {/* Modals */}
      <ProductModal
        isOpen={isProductModalOpen}
        onClose={() => setIsProductModalOpen(false)}
        onSave={fetchData}
        categories={categoriesList}
        initialData={editingProduct}
      />
      <GalleryModal
        isOpen={isGalleryModalOpen}
        onClose={() => setIsGalleryModalOpen(false)}
        onSave={fetchData}
        initialData={editingGalleryImage}
      />
      <HeroModal
        isOpen={isHeroModalOpen}
        onClose={() => setIsHeroModalOpen(false)}
        onSave={handleSaveHeroSlide}
        slide={editingHeroSlide}
      />
      <CategoryModal
        isOpen={isCategoryModalOpen}
        onClose={() => setIsCategoryModalOpen(false)}
        onSave={fetchData}
        initialData={editingCategory}
      />
    </div>
  );
}

/* ─── Overview Tab ─── */
function OverviewTab({
  stats,
  products,
  reviews,
}: {
  stats: {
    label: string;
    value: string;
    icon: React.ElementType;
    change: string;
    color: string;
  }[];
  products: Product[];
  reviews: Review[];
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
function ProductsTab({ 
  products, 
  onDelete, 
  onEdit, 
  onAdd 
}: { 
  products: Product[], 
  onDelete: (id: string) => void,
  onEdit: (product: Product) => void,
  onAdd: () => void
}) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-white">All Products</h3>
          <p className="text-xs text-white/40 mt-0.5">
            {products.length} products in your store
          </p>
        </div>
        <button 
          onClick={onAdd}
          className="flex items-center gap-2 px-4 py-2.5 bg-white text-slate-900 rounded-xl text-sm font-semibold hover:bg-white/90 transition-all active:scale-[0.98]"
        >
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
                    <button 
                      onClick={() => onEdit(product)}
                      className="p-2 rounded-lg hover:bg-white/10 text-white/40 hover:text-white transition-all"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => onDelete(product.id)}
                      className="p-2 rounded-lg hover:bg-red-500/10 text-white/40 hover:text-red-400 transition-all"
                    >
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
function CategoriesTab({ 
  categories,
  onAdd,
  onEdit,
  onDelete
}: { 
  categories: Category[],
  onAdd: () => void,
  onEdit: (category: Category) => void,
  onDelete: (id: string) => void
}) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-white">All Categories</h3>
          <p className="text-xs text-white/40 mt-0.5">
            {categories.length} categories
          </p>
        </div>
        <button 
          onClick={onAdd}
          className="flex items-center gap-2 px-4 py-2.5 bg-white text-slate-900 rounded-xl text-sm font-semibold hover:bg-white/90 transition-all active:scale-[0.98]"
        >
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
                {cat.image_url ? (
                  <img
                    src={cat.image_url}
                    alt={cat.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-2xl">{cat.icon}</div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-semibold text-white flex items-center gap-2">
                  {cat.icon} {cat.name}
                </div>
                <div className="text-xs text-white/40 mt-0.5">
                  /{cat.slug} · Order: {cat.sort_order}
                </div>
              </div>
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button 
                  onClick={() => onEdit(cat)}
                  className="p-2 rounded-lg hover:bg-white/10 text-white/40 hover:text-white transition-all"
                >
                  <Edit className="w-4 h-4" />
                </button>
                <button 
                  onClick={() => onDelete(cat.id!)}
                  className="p-2 rounded-lg hover:bg-red-500/10 text-white/40 hover:text-red-400 transition-all"
                >
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
function ReviewsTab({ reviews, onDelete }: { reviews: Review[], onDelete: (id: string) => void }) {
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
                <button 
                  onClick={() => onDelete(review.id!)}
                  className="p-2 rounded-lg hover:bg-red-500/10 text-white/40 hover:text-red-400 transition-all"
                >
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
function GalleryTab({ 
  images, 
  onAdd, 
  onEdit, 
  onDelete 
}: { 
  images: GalleryImage[]; 
  onAdd: () => void; 
  onEdit: (image: GalleryImage) => void; 
  onDelete: (id: string) => void; 
}) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-white">Gallery Images</h3>
          <p className="text-xs text-white/40 mt-0.5">
            {images.length} images
          </p>
        </div>
        <button 
          onClick={onAdd}
          className="flex items-center gap-2 px-4 py-2.5 bg-white text-slate-900 rounded-xl text-sm font-semibold hover:bg-white/90 transition-all active:scale-[0.98]"
        >
          <Plus className="w-4 h-4" />
          Upload Image
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
        {images.map((img) => (
          <div
            key={img.id}
            className="group relative aspect-square rounded-2xl overflow-hidden bg-white/5 border border-white/5"
          >
            <img
              src={img.image_url}
              alt={img.caption || `Gallery image`}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/60 transition-colors flex items-center justify-center">
              <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button 
                  onClick={() => onEdit(img)}
                  className="p-2.5 rounded-xl bg-white/20 backdrop-blur-sm text-white hover:bg-white/30 transition-all"
                >
                  <Edit className="w-4 h-4" />
                </button>
                <button 
                  onClick={() => onDelete(img.id)}
                  className="p-2.5 rounded-xl bg-red-500/20 backdrop-blur-sm text-red-300 hover:bg-red-500/30 transition-all"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
            {img.category && (
              <div className="absolute top-2 right-2 px-2 py-1 bg-black/50 backdrop-blur-md rounded-lg text-[10px] font-medium text-white/90 uppercase tracking-wider">
                {img.category}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function HeroTab({
  slides,
  onAdd,
  onEdit,
  onDelete,
  onInitDefaults,
}: {
  slides: HeroSlide[];
  onAdd: () => void;
  onEdit: (slide: HeroSlide) => void;
  onDelete: (id: string) => void;
  onInitDefaults: () => void;
}) {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-semibold text-white">Homepage Hero Slideshow</h3>
          <p className="text-xs text-white/40 mt-0.5">
            Manage, reorder, or update your hero section background wallpapers ({slides.length} slides in database)
          </p>
        </div>
        <div className="flex items-center gap-3">
          {slides.length === 0 && (
            <button
              onClick={onInitDefaults}
              className="px-4 py-2.5 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-xl text-sm font-semibold hover:bg-emerald-500/30 transition-all active:scale-[0.98]"
            >
              + Load 4 Default Wallpapers to DB
            </button>
          )}
          <button
            onClick={onAdd}
            className="flex items-center gap-2 px-4 py-2.5 bg-white text-slate-900 rounded-xl text-sm font-semibold hover:bg-white/90 transition-all active:scale-[0.98]"
          >
            <Plus className="w-4 h-4" />
            Add Hero Slide
          </button>
        </div>
      </div>

      {slides.length === 0 ? (
        <div className="p-12 text-center rounded-2xl bg-white/5 border border-white/5 space-y-3">
          <p className="text-white/60 text-sm">
            No custom hero slides currently stored in database. The homepage is displaying the 4 default 4K wallpapers.
          </p>
          <button
            onClick={onInitDefaults}
            className="px-5 py-2.5 bg-white text-slate-900 rounded-xl text-sm font-semibold hover:bg-white/90 transition-all"
          >
            Click here to import default wallpapers into Database to start editing
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {slides.map((slide) => (
            <div
              key={slide.id}
              className={`group relative rounded-2xl overflow-hidden border transition-all ${
                slide.active !== false
                  ? "bg-white/5 border-white/10 hover:border-white/20"
                  : "bg-white/5 border-red-500/30 opacity-60"
              }`}
            >
              <div className="aspect-[16/9] w-full overflow-hidden bg-slate-900 relative">
                <img
                  src={slide.image_url}
                  alt={slide.alt || "Hero slide"}
                  className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = "/hero-slide-1.png";
                  }}
                />
                <div className="absolute top-3 left-3 flex items-center gap-2">
                  <span className="px-2.5 py-1 bg-black/70 backdrop-blur-md rounded-lg text-xs font-bold text-white">
                    Order #{slide.sort_order}
                  </span>
                  <span
                    className={`px-2.5 py-1 backdrop-blur-md rounded-lg text-xs font-semibold ${
                      slide.active !== false
                        ? "bg-emerald-500/80 text-white"
                        : "bg-red-500/80 text-white"
                    }`}
                  >
                    {slide.active !== false ? "Active" : "Inactive"}
                  </span>
                </div>
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/50 transition-colors flex items-center justify-center">
                  <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => onEdit(slide)}
                      className="p-2.5 rounded-xl bg-white/20 backdrop-blur-sm text-white hover:bg-white/30 transition-all"
                      title="Edit Slide"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onDelete(slide.id)}
                      className="p-2.5 rounded-xl bg-red-500/20 backdrop-blur-sm text-red-300 hover:bg-red-500/30 transition-all"
                      title="Delete Slide"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
              <div className="p-4 flex items-center justify-between">
                <p className="text-sm font-medium text-white truncate pr-2">
                  {slide.alt || "Street Mobile Hero Banner"}
                </p>
                <span className="text-xs text-white/40 flex-shrink-0">ID: {slide.id.slice(0, 6)}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
