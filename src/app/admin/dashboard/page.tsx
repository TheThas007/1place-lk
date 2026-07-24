"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";
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
  Search,
  TrendingUp,
  ShoppingBag,
  Users,
  Eye,
  Edit,
  Trash2,
  ChevronRight,
  Download,
  AlertCircle,
  TrendingDown,
  Activity,
  Bell,
  Heart,
  Truck
} from "lucide-react";
import { formatPrice } from "@/lib/utils";
import { db } from "@/lib/firebase";
import { collection, getDocs, deleteDoc, doc, addDoc, updateDoc, setDoc, onSnapshot, query, orderBy, getDoc } from "firebase/firestore";
import { Product, Category, Review, GalleryImage, HeroSlide } from "@/lib/types";
import { jsPDF } from "jspdf";

import ProductModal from "@/components/admin/ProductModal";
import GalleryModal from "@/components/admin/GalleryModal";
import CategoryModal from "@/components/admin/CategoryModal";
import HeroModal from "@/components/admin/HeroModal";

type Tab = "overview" | "products" | "categories" | "reviews" | "gallery" | "hero" | "users" | "orders" | "settings";

function AdminDashboardContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tabParam = searchParams.get("tab") as Tab | null;
  const [activeTab, setActiveTab] = useState<Tab>("overview");
  const [isAuthed, setIsAuthed] = useState(false);

  useEffect(() => {
    if (tabParam && ["overview", "products", "categories", "reviews", "gallery", "hero", "users", "orders", "settings"].includes(tabParam)) {
      setActiveTab(tabParam);
    }
  }, [tabParam]);

  const [productsList, setProductsList] = useState<Product[]>([]);
  const [categoriesList, setCategoriesList] = useState<Category[]>([]);
  const [reviewsList, setReviewsList] = useState<Review[]>([]);
  const [galleryList, setGalleryList] = useState<GalleryImage[]>([]);
  const [heroList, setHeroList] = useState<HeroSlide[]>([]);
  const [usersList, setUsersList] = useState<any[]>([]);
  const [ordersList, setOrdersList] = useState<any[]>([]);
  const [uiSettings, setUiSettings] = useState<any>({});
  const [loadingData, setLoadingData] = useState(true);

  // Live order alert state
  const [liveAlert, setLiveAlert] = useState<any | null>(null);
  const isFirstLoad = useRef(true);

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

  // Real-time order listener for live alerts
  useEffect(() => {
    if (!isAuthed) return;

    const q = query(collection(db, "orders"), orderBy("createdAt", "desc"));
    const unsub = onSnapshot(q, (snapshot) => {
      const orders = snapshot.docs.map(d => ({ ...d.data(), id: d.id }));
      setOrdersList(orders);

      // Check if there's a new order added
      if (isFirstLoad.current) {
        isFirstLoad.current = false;
        return;
      }

      snapshot.docChanges().forEach((change) => {
        if (change.type === "added") {
          const newOrder = { ...change.doc.data(), id: change.doc.id } as any;
          // Trigger browser notification and state popup
          setLiveAlert(newOrder);
          
          // Play notification sound
          try {
            const audio = new Audio("https://assets.mixkit.co/active_storage/sfx/2869/2869-200.wav");
            const promise = audio.play();
            if (promise !== undefined) {
              promise.catch(() => {});
            }
          } catch (e) {
            console.log("Audio alert skipped:", e);
          }
        }
      });
    });

    return () => unsub();
  }, [isAuthed]);

  const fetchData = async () => {
    try {
      const [pSnap, cSnap, rSnap, gSnap, hSnap, uSnap, oSnap] = await Promise.all([
        getDocs(collection(db, "products")),
        getDocs(collection(db, "categories")),
        getDocs(collection(db, "reviews")),
        getDocs(collection(db, "gallery")),
        getDocs(collection(db, "hero_slides")),
        getDocs(collection(db, "users")),
        getDocs(collection(db, "orders")),
      ]);
      setProductsList(pSnap.docs.map(d => ({ ...d.data(), id: d.id } as Product)));
      setCategoriesList(cSnap.docs.map(d => ({ ...d.data(), id: d.id } as Category)));
      setReviewsList(rSnap.docs.map(d => ({ ...d.data(), id: d.id } as Review)));
      setGalleryList(gSnap.docs.map(d => ({ ...d.data(), id: d.id } as GalleryImage)));
      setHeroList(hSnap.docs.map(d => ({ ...d.data(), id: d.id } as HeroSlide)).sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0)));
      setUsersList(uSnap.docs.map(d => ({ ...d.data(), id: d.id })));
      setOrdersList(oSnap.docs.map(d => ({ ...d.data(), id: d.id })).sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
      
      const uiSnap = await getDoc(doc(db, "settings", "ui"));
      if (uiSnap.exists()) {
        setUiSettings(uiSnap.data());
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingData(false);
    }
  };

  const handleUpdateUiSettings = async (newSettings: any) => {
    try {
      await setDoc(doc(db, "settings", "ui"), newSettings, { merge: true });
      setUiSettings(newSettings);
      alert("Settings updated successfully!");
    } catch (error) {
      console.error("Error updating settings:", error);
      alert("Failed to update settings.");
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

  const handleUpdateOrderStatus = async (id: string, status: string) => {
    try {
      await updateDoc(doc(db, "orders", id), { status });
      setOrdersList(ordersList.map(o => o.id === id ? { ...o, status } : o));
    } catch (e) {
      console.error(e);
      alert("Failed to update order status");
    }
  };

  const handleDeleteOrder = async (id: string) => {
    if (confirm("Are you sure you want to delete this order?")) {
      try {
        await deleteDoc(doc(db, "orders", id));
        setOrdersList(ordersList.filter(o => o.id !== id));
      } catch (e) {
        console.error(e);
        alert("Failed to delete order");
      }
    }
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
    { id: "orders" as Tab, label: "Orders", icon: ShoppingBag },
    { id: "users" as Tab, label: "Users", icon: Users },
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
      label: "Orders",
      value: ordersList.length.toString(),
      icon: ShoppingBag,
      change: `${ordersList.filter(o => o.status === "pending").length} pending`,
      color: "bg-emerald-500/10 text-emerald-400",
    },
    {
      label: "Registered Users",
      value: usersList.length.toString(),
      icon: Users,
      change: "Active users",
      color: "bg-amber-500/10 text-amber-400",
    },
    {
      label: "Web Views",
      value: "2,845",
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
    <div className="flex flex-col h-full w-full">
      {/* ─── Removed Sidebar & Topbar (now in layout.tsx) ─── */}
      <div className="pb-8">
        {/* Legacy Tab Navigation for those not yet moved to separate routes */}
        <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-2 custom-scrollbar">
          {["overview", "products", "categories", "reviews", "gallery", "hero", "users", "orders", "settings"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab as Tab)}
              className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                activeTab === tab ? "bg-white text-black" : "bg-white/5 text-white/60 hover:text-white hover:bg-white/10"
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>
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
          {activeTab === "users" && (
            <UsersTab users={usersList} />
          )}
          {activeTab === "orders" && (
            <OrdersTab 
              orders={ordersList} 
              onUpdateStatus={handleUpdateOrderStatus} 
              onDeleteOrder={handleDeleteOrder} 
            />
          )}
          {activeTab === "settings" && (
            <SettingsTab 
              settings={uiSettings}
              onSave={handleUpdateUiSettings}
            />
          )}
        </div>



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
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="bg-slate-900/50 border border-white/5 rounded-2xl p-6 hover:bg-slate-900 transition-all hover:border-white/10"
          >
            <div className="flex items-center justify-between mb-4">
              <div
                className={`w-10 h-10 rounded-xl ${stat.color} flex items-center justify-center`}
              >
                <stat.icon className="w-5 h-5" />
              </div>
              <TrendingUp className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-3xl font-extrabold text-white tracking-tight">{stat.value}</div>
            <div className="text-xs text-white/50 mt-1 font-semibold">{stat.label}</div>
            <div className="text-xs text-emerald-400 mt-2 font-medium flex items-center gap-1">
              <span>{stat.change}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Upgraded Web Analytics Panel with Wave Chart */}
      <div className="bg-slate-900/50 border border-white/5 rounded-2xl p-6 hover:border-white/10 transition-all">
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-6">
          <div>
            <h3 className="text-white font-bold text-base flex items-center gap-2">
              <Activity className="w-4 h-4 text-purple-400" />
              Live Traffic & Web Views Monitor
            </h3>
            <p className="text-xs text-white/40 mt-1">Real-time daily page views and visitor engagement analytics</p>
          </div>
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1.5 px-2.5 py-1 bg-purple-500/10 border border-purple-500/20 text-purple-400 text-xs font-semibold rounded-lg">
              <span className="w-2 h-2 bg-purple-400 rounded-full animate-ping" />
              18 Active Now
            </span>
          </div>
        </div>

        {/* CSS/SVG Wave Line Chart */}
        <div className="relative w-full h-36 bg-slate-950/40 border border-white/5 rounded-xl overflow-hidden p-2 flex flex-col justify-end">
          <svg className="absolute inset-x-0 bottom-0 w-full h-24 text-purple-500/10" preserveAspectRatio="none" viewBox="0 0 100 100">
            <path
              d="M0 80 Q 15 50, 30 70 T 60 40 T 90 20 T 100 0 L 100 100 L 0 100 Z"
              fill="currentColor"
            />
            <path
              d="M0 80 Q 15 50, 30 70 T 60 40 T 90 20 T 100 0"
              fill="none"
              stroke="#a855f7"
              strokeWidth="2"
            />
          </svg>
          {/* Chart Grid Lines */}
          <div className="absolute inset-0 flex flex-col justify-between p-4 pointer-events-none text-[9px] text-white/20 font-mono">
            <div>3,000 views</div>
            <div>2,000 views</div>
            <div>1,000 views</div>
          </div>
          {/* Chart axis dates */}
          <div className="flex justify-between items-center px-4 py-1 text-[9px] text-white/40 font-mono relative z-10 bg-slate-950/60 border-t border-white/5">
            <span>Mon</span>
            <span>Tue</span>
            <span>Wed</span>
            <span>Thu</span>
            <span>Fri</span>
            <span>Sat</span>
            <span>Sun (Today)</span>
          </div>
        </div>
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
  const [searchQuery, setSearchQuery] = useState("");

  const filteredProducts = products.filter(p => {
    const query = searchQuery.toLowerCase();
    return (
      p.name.toLowerCase().includes(query) ||
      (p.code && p.code.toLowerCase().includes(query)) ||
      (p.category_name && p.category_name.toLowerCase().includes(query))
    );
  });

  // Group filtered products by category_name
  const grouped = filteredProducts.reduce<Record<string, Product[]>>((acc, product) => {
    const cat = product.category_name || "Uncategorized";
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(product);
    return acc;
  }, {});

  const sortedCategories = Object.keys(grouped).sort();

  // Track which sections are open (all open by default)
  const [openSections, setOpenSections] = useState<Record<string, boolean>>(
    () => Object.fromEntries(sortedCategories.map(c => [c, true]))
  );

  const toggleSection = (cat: string) =>
    setOpenSections(prev => ({ ...prev, [cat]: !prev[cat] }));

  const categoryColors: Record<string, string> = {
    iPhone: "bg-blue-500/15 text-blue-400 border-blue-500/20",
    Samsung: "bg-cyan-500/15 text-cyan-400 border-cyan-500/20",
    Xiaomi: "bg-orange-500/15 text-orange-400 border-orange-500/20",
    Redmi: "bg-orange-500/15 text-orange-400 border-orange-500/20",
    Oppo: "bg-green-500/15 text-green-400 border-green-500/20",
    Vivo: "bg-violet-500/15 text-violet-400 border-violet-500/20",
    Realme: "bg-yellow-500/15 text-yellow-400 border-yellow-500/20",
    Google: "bg-red-500/15 text-red-400 border-red-500/20",
    Honor: "bg-pink-500/15 text-pink-400 border-pink-500/20",
    OnePlus: "bg-red-500/15 text-red-400 border-red-500/20",
    Tablets: "bg-indigo-500/15 text-indigo-400 border-indigo-500/20",
    Accessories: "bg-amber-500/15 text-amber-400 border-amber-500/20",
    Anker: "bg-teal-500/15 text-teal-400 border-teal-500/20",
    JBL: "bg-orange-500/15 text-orange-400 border-orange-500/20",
    DJI: "bg-slate-500/15 text-slate-300 border-slate-500/20",
    CMF: "bg-white/10 text-white/60 border-white/10",
  };

  const getColor = (cat: string) =>
    categoryColors[cat] || "bg-purple-500/15 text-purple-400 border-purple-500/20";

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-semibold text-white">All Products</h3>
          <p className="text-xs text-white/40 mt-0.5">
            {filteredProducts.length} products · {sortedCategories.length} brands / categories
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
            <input
              type="text"
              placeholder="Search by name, code..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full sm:w-64 pl-9 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder-white/30 focus:outline-none focus:border-white/20 focus:ring-1 focus:ring-white/20 transition-all"
            />
          </div>
          <button
            onClick={onAdd}
            className="flex items-center gap-2 px-4 py-2.5 bg-white text-slate-900 rounded-xl text-sm font-semibold hover:bg-white/90 transition-all active:scale-[0.98] shrink-0"
          >
            <Plus className="w-4 h-4" />
            Add Product
          </button>
        </div>
      </div>

      {/* Grouped sections */}
      {sortedCategories.map((cat) => {
        const catProducts = grouped[cat];
        const isOpen = openSections[cat] ?? true;
        const colorClass = getColor(cat);

        return (
          <div
            key={cat}
            className="bg-white/[0.03] border border-white/5 rounded-2xl overflow-hidden"
          >
            {/* Section header */}
            <button
              onClick={() => toggleSection(cat)}
              className="w-full flex items-center justify-between px-5 py-4 hover:bg-white/[0.03] transition-colors"
            >
              <div className="flex items-center gap-3">
                <span className={`text-xs font-bold px-3 py-1 rounded-full border ${colorClass}`}>
                  {cat}
                </span>
                <span className="text-xs text-white/30 font-medium">
                  {catProducts.length} product{catProducts.length !== 1 ? "s" : ""}
                </span>
              </div>
              <ChevronRight
                className={`w-4 h-4 text-white/30 transition-transform duration-200 ${isOpen ? "rotate-90" : ""}`}
              />
            </button>

            {/* Collapsible product table */}
            {isOpen && (
              <div className="border-t border-white/5">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-white/5 bg-white/[0.015]">
                      <th className="text-left text-[10px] font-semibold text-white/30 uppercase tracking-widest px-5 py-3">Product</th>
                      <th className="text-left text-[10px] font-semibold text-white/30 uppercase tracking-widest px-5 py-3">Price</th>
                      <th className="text-left text-[10px] font-semibold text-white/30 uppercase tracking-widest px-5 py-3">Status</th>
                      <th className="text-right text-[10px] font-semibold text-white/30 uppercase tracking-widest px-5 py-3">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/[0.04]">
                    {catProducts.map((product) => (
                      <tr
                        key={product.id}
                        className="hover:bg-white/[0.025] transition-colors group"
                      >
                        {/* Product name + image */}
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-lg bg-white/5 overflow-hidden shrink-0 border border-white/5">
                              <img
                                src={product.images[0]}
                                alt={product.name}
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <span className="text-sm font-medium text-white/85 truncate max-w-[220px] group-hover:text-white transition-colors">
                              {product.name}
                            </span>
                          </div>
                        </td>
                        {/* Price */}
                        <td className="px-5 py-3.5">
                          <div className="flex flex-col gap-0.5">
                            <span className="text-sm font-bold text-white">{formatPrice(product.price)}</span>
                            {product.old_price && (
                              <span className="text-[10px] text-white/30 line-through">{formatPrice(product.old_price)}</span>
                            )}
                          </div>
                        </td>
                        {/* Stock status */}
                        <td className="px-5 py-3.5">
                          <span
                            className={`text-[10px] font-semibold px-2.5 py-1 rounded-full uppercase tracking-wider ${
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
                        {/* Actions */}
                        <td className="px-5 py-3.5">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => onEdit(product)}
                              className="p-2 rounded-lg hover:bg-white/10 text-white/30 hover:text-white transition-all"
                              title="Edit"
                            >
                              <Edit className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => onDelete(product.id)}
                              className="p-2 rounded-lg hover:bg-red-500/10 text-white/30 hover:text-red-400 transition-all"
                              title="Delete"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        );
      })}

      {products.length === 0 && (
        <div className="border border-dashed border-white/10 rounded-2xl p-16 text-center text-white/20 text-sm">
          No products found. Click &ldquo;Add Product&rdquo; to get started.
        </div>
      )}
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
                  {cat.icon && (cat.icon.startsWith("http") || cat.icon.startsWith("data:")) ? (
                    <img src={cat.icon} className="w-5 h-5 object-contain rounded bg-white p-0.5" />
                  ) : (
                    <span>{cat.icon || "📱"}</span>
                  )}
                  {cat.name}
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

/* ─── Users Tab ─── */
function UsersTab({ users }: { users: any[] }) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-white">Registered Users</h3>
        <p className="text-xs text-white/40 mt-0.5">
          {users.length} users registered on your platform
        </p>
      </div>

      <div className="bg-slate-900/50 border border-white/5 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/5 text-xs text-white/40 uppercase tracking-widest bg-white/[0.02]">
                <th className="px-6 py-4 font-semibold">User ID</th>
                <th className="px-6 py-4 font-semibold">Name</th>
                <th className="px-6 py-4 font-semibold">Email</th>
                <th className="px-6 py-4 font-semibold">Joined Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-sm text-white/80">
              {users.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-10 text-center text-white/30">
                    No registered users found in database.
                  </td>
                </tr>
              ) : (
                users.map((u) => (
                  <tr key={u.id} className="hover:bg-white/[0.01] transition-colors">
                    <td className="px-6 py-4 font-mono text-xs text-white/40">{u.id}</td>
                    <td className="px-6 py-4 font-semibold">{u.displayName || "Google User"}</td>
                    <td className="px-6 py-4 text-white/60">{u.email}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

/* ─── Orders Tab ─── */
function OrdersTab({ 
  orders, 
  onUpdateStatus, 
  onDeleteOrder 
}: { 
  orders: any[], 
  onUpdateStatus: (id: string, status: string) => void,
  onDeleteOrder: (id: string) => void
}) {
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);
  const [sendingEmail, setSendingEmail] = useState<string | null>(null);

  const handleSendCustomerEmail = async (order: any, statusType: "packing" | "on_the_way" | "delivered_thankyou") => {
    setSendingEmail(order.id);
    try {
      const res = await fetch("/api/send-customer-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId: order.id,
          customerName: order.customerName,
          email: order.email || "streetmobilevavuniya@gmail.com",
          statusType: statusType,
          address: order.address,
          district: order.district,
          items: order.items,
          totalPrice: order.totalPrice
        })
      });
      const data = await res.json();
      if (data.success) {
        const msgMap = {
          packing: "📦 'Your Parcel is Packing' email sent to customer!",
          on_the_way: "🚚 'Your Order is On The Way' email sent to customer!",
          delivered_thankyou: "❤️ Heartfelt Thank You & Welcome message sent to customer!"
        };
        alert(msgMap[statusType]);
      } else {
        alert("Failed to send email: " + (data.error || "Unknown error"));
      }
    } catch (e: any) {
      console.error(e);
      alert("Error sending email.");
    } finally {
      setSendingEmail(null);
    }
  };

  const downloadPDF = (order: any) => {
    const doc = new jsPDF();
    
    // Header
    doc.setFont("helvetica", "bold");
    doc.setFontSize(22);
    doc.text("STREET MOBILE", 20, 25);
    
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(100);
    doc.text("Premium Mobile Store in Vavuniya", 20, 31);
    doc.text("Email: streetmobilevavuniya@gmail.com", 20, 36);
    doc.text("Tel: +94 77 414 1118", 20, 41);
    
    // Divider line
    doc.setDrawColor(200);
    doc.line(20, 46, 190, 46);
    
    // Invoice details
    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.setTextColor(0);
    doc.text("INVOICE / ORDER SUMMARY", 20, 56);
    
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(80);
    doc.text(`Order ID: ${order.id}`, 20, 64);
    doc.text(`Date: ${new Date(order.createdAt).toLocaleString()}`, 20, 69);
    doc.text(`Payment Method: ${order.paymentMethod}`, 20, 74);
    doc.text(`Payment Status: ${order.status.toUpperCase()}`, 20, 79);
    
    // Customer Details
    doc.setFont("helvetica", "bold");
    doc.text("Delivery Details:", 120, 64);
    doc.setFont("helvetica", "normal");
    doc.text(`Name: ${order.customerName || "N/A"}`, 120, 69);
    doc.text(`Phone: ${order.primaryPhone || "N/A"}`, 120, 74);
    doc.text(`District: ${order.district || "N/A"}`, 120, 79);
    doc.text(`Address: ${order.address || "N/A"}`, 120, 84);
    
    // Divider line
    doc.line(20, 90, 190, 90);
    
    // Table Header
    doc.setFont("helvetica", "bold");
    doc.text("Item Description", 20, 98);
    doc.text("Qty", 120, 98);
    doc.text("Unit Price", 140, 98);
    doc.text("Total", 170, 98);
    
    doc.line(20, 102, 190, 102);
    doc.setFont("helvetica", "normal");
    
    let y = 110;
    (order.items || []).forEach((item: any) => {
      // Name
      doc.text(`${item.name} ${item.storage ? `(${item.storage})` : ""} ${item.color ? `- ${item.color}` : ""}`, 20, y);
      doc.text(`${item.quantity}`, 122, y);
      doc.text(`Rs. ${item.price.toLocaleString()}`, 140, y);
      doc.text(`Rs. ${(item.price * item.quantity).toLocaleString()}`, 170, y);
      y += 8;
    });
    
    // Divider line
    doc.line(20, y + 2, 190, y + 2);
    
    // Total
    doc.setFont("helvetica", "bold");
    doc.text("Total Amount:", 138, y + 10);
    doc.text(`Rs. ${order.totalPrice.toLocaleString()}`, 170, y + 10);
    
    // Footer
    doc.setFont("helvetica", "italic");
    doc.setFontSize(9);
    doc.setTextColor(120);
    doc.text("Thank you for shopping with STREET MOBILE!", 105, y + 25, { align: "center" });
    
    doc.save(`street-mobile-order-${order.id.slice(-6)}.pdf`);
  };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
      {/* Left: Orders List */}
      <div className="xl:col-span-2 space-y-6">
        <div>
          <h3 className="text-lg font-semibold text-white">All Orders</h3>
          <p className="text-xs text-white/40 mt-0.5">
            {orders.length} orders received from customers
          </p>
        </div>

        <div className="bg-slate-900/50 border border-white/5 rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/5 text-xs text-white/40 uppercase tracking-widest bg-white/[0.02]">
                  <th className="px-6 py-4 font-semibold">Order ID</th>
                  <th className="px-6 py-4 font-semibold">Customer</th>
                  <th className="px-6 py-4 font-semibold">Method</th>
                  <th className="px-6 py-4 font-semibold">Total</th>
                  <th className="px-6 py-4 font-semibold">Status</th>
                  <th className="px-6 py-4 font-semibold">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-sm text-white/85">
                {orders.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-10 text-center text-white/30">
                      No orders found.
                    </td>
                  </tr>
                ) : (
                  orders.map((order) => (
                    <tr 
                      key={order.id} 
                      onClick={() => setSelectedOrder(order)}
                      className={`cursor-pointer hover:bg-white/[0.02] transition-colors ${selectedOrder?.id === order.id ? "bg-white/[0.03]" : ""}`}
                    >
                      <td className="px-6 py-4 font-mono text-xs text-white/40">#{order.id.slice(-6)}</td>
                      <td className="px-6 py-4 font-semibold">{order.customerName}</td>
                      <td className="px-6 py-4">
                        <span className="px-2 py-0.5 rounded-lg text-xs bg-white/5 border border-white/10 text-white/60">
                          {order.paymentMethod}
                        </span>
                      </td>
                      <td className="px-6 py-4 font-bold">{formatPrice(order.totalPrice)}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                          order.status === "paid" ? "bg-emerald-500/10 text-emerald-400" : 
                          order.status === "processing" ? "bg-blue-500/10 text-blue-400" :
                          order.status === "completed" ? "bg-green-500/10 text-green-400" :
                          "bg-amber-500/10 text-amber-400"
                        }`}>
                          {order.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            downloadPDF(order);
                          }}
                          className="p-2 rounded-lg bg-white/5 hover:bg-white/15 text-white/70 hover:text-white transition-all"
                          title="Download PDF Invoice"
                        >
                          <Download className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Right: Selected Order Detail Card */}
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-semibold text-white">Order Details</h3>
          <p className="text-xs text-white/40 mt-0.5">
            {selectedOrder ? `Managing Order #${selectedOrder.id.slice(-6)}` : "Select an order to view"}
          </p>
        </div>

        {selectedOrder ? (
          <div className="bg-slate-900 border border-white/10 rounded-2xl p-6 space-y-6">
            <div className="flex justify-between items-start border-b border-white/5 pb-4">
              <div>
                <p className="text-xs text-white/40">Order Reference</p>
                <p className="font-mono text-sm font-semibold text-white mt-1">#{selectedOrder.id}</p>
              </div>
              <button
                onClick={() => downloadPDF(selectedOrder)}
                className="flex items-center gap-2 px-3 py-1.5 bg-white text-black text-xs font-bold rounded-lg hover:bg-neutral-200 transition-all"
              >
                <Download className="w-3.5 h-3.5" />
                Download PDF
              </button>
            </div>

            <div className="space-y-4 text-sm">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-white/40">Customer Name</p>
                  <p className="font-semibold text-white mt-0.5">{selectedOrder.customerName}</p>
                </div>
                <div>
                  <p className="text-xs text-white/40">Contact Phone</p>
                  <p className="font-semibold text-white mt-0.5">{selectedOrder.primaryPhone || "N/A"}</p>
                </div>
              </div>

              <div>
                <p className="text-xs text-white/40 font-semibold">Delivery Address</p>
                <p className="text-white/80 mt-1 whitespace-pre-wrap">
                  {selectedOrder.address || "N/A"}
                  {selectedOrder.district && `\nDistrict: ${selectedOrder.district}`}
                  {selectedOrder.postalCode && `\nPostal Code: ${selectedOrder.postalCode}`}
                </p>
              </div>

              {selectedOrder.secondaryPhone && (
                <div>
                  <p className="text-xs text-white/40">Alternative Phone</p>
                  <p className="font-semibold text-white mt-0.5">{selectedOrder.secondaryPhone}</p>
                </div>
              )}
            </div>

            {/* Items Ordered List */}
            <div className="border-t border-white/5 pt-4 space-y-3">
              <p className="text-xs text-white/40 font-semibold uppercase tracking-wider">Items Summary</p>
              <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                {(selectedOrder.items || []).map((item: any, idx: number) => (
                  <div key={idx} className="flex justify-between items-center bg-white/[0.02] border border-white/5 p-3 rounded-xl text-xs">
                    <div>
                      <p className="font-bold text-white leading-snug">{item.name}</p>
                      <p className="text-white/40 mt-0.5">
                        {[item.storage, item.color].filter(Boolean).join(" · ")} x {item.quantity}
                      </p>
                    </div>
                    <span className="font-extrabold text-white">{formatPrice(item.price * item.quantity)}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Customer Email Notification Actions */}
            <div className="border-t border-white/10 pt-4 space-y-2.5">
              <p className="text-xs text-white/50 font-semibold uppercase tracking-wider">Send Email Notification to Customer</p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <button
                  onClick={() => handleSendCustomerEmail(selectedOrder, "packing")}
                  disabled={sendingEmail === selectedOrder.id}
                  className="flex items-center justify-center gap-1.5 px-3 py-2 bg-blue-500/15 hover:bg-blue-500/25 border border-blue-500/30 text-blue-300 rounded-xl text-[11px] font-bold transition-all active:scale-[0.98] disabled:opacity-50"
                >
                  <Package className="w-3.5 h-3.5" />
                  <span>1. Your Parcel Packing</span>
                </button>

                <button
                  onClick={() => handleSendCustomerEmail(selectedOrder, "on_the_way")}
                  disabled={sendingEmail === selectedOrder.id}
                  className="flex items-center justify-center gap-1.5 px-3 py-2 bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 text-amber-300 rounded-xl text-[11px] font-bold transition-all active:scale-[0.98] disabled:opacity-50"
                >
                  <Truck className="w-3.5 h-3.5" />
                  <span>2. Order On The Way</span>
                </button>

                <button
                  onClick={() => handleSendCustomerEmail(selectedOrder, "delivered_thankyou")}
                  disabled={sendingEmail === selectedOrder.id}
                  className="flex items-center justify-center gap-1.5 px-3 py-2 bg-rose-500/15 hover:bg-rose-500/25 border border-rose-500/30 text-rose-300 rounded-xl text-[11px] font-bold transition-all active:scale-[0.98] disabled:opacity-50"
                >
                  <Heart className="w-3.5 h-3.5 text-rose-400" />
                  <span>3. Thank You Message</span>
                </button>
              </div>
            </div>

            {/* Order Total & Status controls */}
            <div className="border-t border-white/5 pt-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <p className="text-xs text-white/40">Total Price</p>
                <p className="text-lg font-black text-white mt-0.5">{formatPrice(selectedOrder.totalPrice)}</p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <span className={`px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider ${
                  selectedOrder.status === "paid" ? "bg-emerald-500/10 text-emerald-400" : 
                  selectedOrder.status === "processing" ? "bg-blue-500/10 text-blue-400" :
                  selectedOrder.status === "completed" ? "bg-green-500/10 text-green-400" :
                  "bg-amber-500/10 text-amber-400"
                }`}>
                  {selectedOrder.status}
                </span>

                {selectedOrder.status !== "processing" && selectedOrder.status !== "completed" && (
                  <button 
                    onClick={() => {
                      onUpdateStatus(selectedOrder.id, "processing");
                      setSelectedOrder({ ...selectedOrder, status: "processing" });
                    }}
                    className="px-3 py-1.5 bg-blue-500 hover:bg-blue-600 text-white text-xs font-bold rounded-lg transition-colors"
                  >
                    Process
                  </button>
                )}
                {selectedOrder.status === "processing" && (
                  <button 
                    onClick={() => {
                      onUpdateStatus(selectedOrder.id, "completed");
                      setSelectedOrder({ ...selectedOrder, status: "completed" });
                    }}
                    className="px-3 py-1.5 bg-green-500 hover:bg-green-600 text-white text-xs font-bold rounded-lg transition-colors"
                  >
                    Complete
                  </button>
                )}
                <button 
                  onClick={() => {
                    onDeleteOrder(selectedOrder.id);
                    setSelectedOrder(null);
                  }}
                  className="px-3 py-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-500 text-xs font-bold rounded-lg transition-colors"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="border border-dashed border-white/10 rounded-2xl p-12 text-center text-white/20 text-sm">
            Please select an order from the list on the left to see details.
          </div>
        )}
      </div>
    </div>
  );
}

/* ─── Settings Tab ─── */
function SettingsTab({
  settings,
  onSave,
}: {
  settings: any;
  onSave: (newSettings: any) => void;
}) {
  const [localSettings, setLocalSettings] = useState<any>(settings || {});
  
  // Make sure it updates if the parent state loads after mount
  useEffect(() => {
    if (settings) {
      setLocalSettings(settings);
    }
  }, [settings]);

  return (
    <div className="bg-slate-900/50 border border-white/5 rounded-2xl p-6">
      <h3 className="text-white font-bold text-lg mb-6 flex items-center gap-2">
        <Settings className="w-5 h-5 text-blue-400" />
        UI & Store Options
      </h3>
      
      <div className="space-y-6 max-w-xl">
        <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/10">
          <div>
            <h4 className="text-white font-medium text-sm">Inside Street Mobile Snow Effect</h4>
            <p className="text-xs text-white/50 mt-1">Enable a realistic 50k+ particle snow effect on the gallery section background.</p>
          </div>
          
          <label className="relative inline-flex items-center cursor-pointer">
            <input 
              type="checkbox" 
              className="sr-only peer" 
              checked={localSettings.snowEffectEnabled || false}
              onChange={(e) => setLocalSettings({...localSettings, snowEffectEnabled: e.target.checked})}
            />
            <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-500"></div>
          </label>
        </div>

        {/* Delivery Charge Settings */}
        <div className="p-4 bg-white/5 rounded-xl border border-white/10 space-y-4">
          <div>
            <h4 className="text-white font-medium text-sm">Delivery Charge & Estimate Settings</h4>
            <p className="text-xs text-white/50 mt-0.5">Configure delivery charge and estimated delivery days for customers at checkout.</p>
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            <label className="flex items-center gap-2.5 p-3 bg-white/5 border border-white/10 rounded-xl cursor-pointer hover:bg-white/10 transition-all select-none">
              <input
                type="radio"
                name="deliveryType"
                checked={localSettings.isFreeDelivery !== false}
                onChange={() => setLocalSettings({...localSettings, isFreeDelivery: true, deliveryFee: 0})}
                className="text-blue-500"
              />
              <div>
                <span className="text-xs font-bold text-white block">Free Delivery</span>
                <span className="text-[10px] text-emerald-400 font-semibold">Rs. 0 (Free)</span>
              </div>
            </label>

            <label className="flex items-center gap-2.5 p-3 bg-white/5 border border-white/10 rounded-xl cursor-pointer hover:bg-white/10 transition-all select-none">
              <input
                type="radio"
                name="deliveryType"
                checked={localSettings.isFreeDelivery === false}
                onChange={() => setLocalSettings({...localSettings, isFreeDelivery: false})}
                className="text-blue-500"
              />
              <div>
                <span className="text-xs font-bold text-white block">Custom Charge</span>
                <span className="text-[10px] text-white/40">Fixed fee</span>
              </div>
            </label>
          </div>

          {localSettings.isFreeDelivery === false && (
            <div>
              <label className="text-xs text-white/60 font-semibold block mb-1">Custom Delivery Fee (LKR)</label>
              <input
                type="number"
                min={0}
                value={localSettings.deliveryFee || 350}
                onChange={(e) => setLocalSettings({...localSettings, deliveryFee: Number(e.target.value)})}
                placeholder="e.g. 350"
                className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm outline-none focus:border-blue-500"
              />
            </div>
          )}

          <div>
            <label className="text-xs text-white/60 font-semibold block mb-1">Estimated Delivery Days</label>
            <input
              type="text"
              value={localSettings.deliveryEstimate || "3 - 7 Business Days"}
              onChange={(e) => setLocalSettings({...localSettings, deliveryEstimate: e.target.value})}
              placeholder="e.g. 3 - 7 Business Days"
              className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm outline-none focus:border-blue-500"
            />
          </div>
        </div>

        <button
          onClick={() => onSave(localSettings)}
          className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-all shadow-[0_0_20px_rgba(37,99,235,0.2)] hover:shadow-[0_0_30px_rgba(37,99,235,0.4)]"
        >
          Save Settings
        </button>
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-black flex items-center justify-center text-white font-bold">Loading Dashboard...</div>}>
      <AdminDashboardContent />
    </Suspense>
  );
}
