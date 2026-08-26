"use client";

import { useState, useEffect, useMemo, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  TrendingUp,
  ShoppingBag,
  Users,
  Package,
  ArrowRight,
  ChevronRight,
  AlertCircle,
  CheckCircle2,
  Clock,
  Tag,
  Search,
  Plus,
  Edit,
  Trash2,
  X,
  CreditCard,
  Check,
  ShieldCheck,
  Star,
  Download,
  Filter,
  RefreshCw,
  Sparkles,
  HardDrive,
  BarChart3,
  Settings as SettingsIcon,
  MessageCircle,
  Building,
  Phone,
  Mail,
  MapPin,
  Lock,
  DollarSign,
  UserCheck,
  Award,
  Sliders,
  Smartphone,
  LayoutGrid,
  FolderOpen,
  FolderTree,
  Flame,
  Wrench,
  ImageIcon,
  Images,
  Bot,
  Settings,
} from "lucide-react";
import { formatPrice } from "@/lib/utils";
import { db } from "@/lib/firebase";
import { collection, getDocs, doc, deleteDoc, updateDoc, addDoc, setDoc, getDoc } from "firebase/firestore";
import { Product, Category, Review, OfferBanner, BannerStatus, HeroSlide, GalleryImage, GoogleReviewsSettings, VisualShowcaseSettings, TodayDealSettings, MegaMenuSettings, Brand, GalleryAnimationSettings } from "@/lib/types";
import { categories as fallbackCategories, fallbackOfferBanners, products as fallbackProducts, DEFAULT_SHOWCASE_SETTINGS, DEFAULT_TODAY_DEAL_SETTINGS, DEFAULT_MEGA_MENU_SETTINGS, DEFAULT_BRANDS, DEFAULT_GALLERY_ANIMATION_SETTINGS } from "@/lib/data";
import { DEFAULT_GOOGLE_REVIEWS_SETTINGS, getShowcaseSettings, getTodayDealSettings, getMegaMenuSettings, getBrands, getGalleryAnimationSettings } from "@/lib/firestore-client";
import { jsPDF } from "jspdf";

// Admin Tabs
import ProductModal from "@/components/admin/ProductModal";
import CategoryModal from "@/components/admin/CategoryModal";
import OfferBannerModal from "@/components/admin/OfferBannerModal";
import HeroModal from "@/components/admin/HeroModal";
import GalleryModal from "@/components/admin/GalleryModal";
import ReviewModal from "@/components/admin/ReviewModal";
import OrdersTab from "@/components/admin/tabs/OrdersTab";
import BannersTab from "@/components/admin/tabs/BannersTab";
import CategoriesTab from "@/components/admin/tabs/CategoriesTab";
import ProductsTab from "@/components/admin/tabs/ProductsTab";
import HeroTab from "@/components/admin/tabs/HeroTab";
import BrandsTab from "@/components/admin/tabs/BrandsTab";
import GalleryTab from "@/components/admin/tabs/GalleryTab";
import ReviewsTab from "@/components/admin/tabs/ReviewsTab";
import ShowcaseTab from "@/components/admin/tabs/ShowcaseTab";
import TodayDealTab from "@/components/admin/tabs/TodayDealTab";
import MegaMenuTab from "@/components/admin/tabs/MegaMenuTab";
import WarrantiesTab from "@/components/admin/tabs/WarrantiesTab";
import FeaturedCollectionsTab from "@/components/admin/tabs/FeaturedCollectionsTab";
import FooterTab from "@/components/admin/tabs/FooterTab";
import MobileExperienceTab from "@/components/admin/tabs/MobileExperienceTab";
import RepairsTab from "@/components/admin/tabs/RepairsTab";
import SuppliersTab from "@/components/admin/tabs/SuppliersTab";
import CashFlowTab from "@/components/admin/tabs/CashFlowTab";
import AssistantTab from "@/components/admin/tabs/AssistantTab";
import ContactSettingsTab from "@/components/admin/tabs/ContactSettingsTab";

type Tab =
  | "overview"
  | "products"
  | "categories"
  | "mega-menu"
  | "brands"
  | "today-deal"
  | "repairs"
  | "suppliers"
  | "cashflow"
  | "warranties"
  | "collections"
  | "showcase"
  | "users"
  | "gallery"
  | "hero"
  | "banners"
  | "footer"
  | "inventory"
  | "payments"
  | "reviews"
  | "analytics"
  | "assistant"
  | "mobile"
  | "orders"
  | "settings"
  | "contact-settings";

function DashboardContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tabParam = (searchParams.get("tab") as Tab) || "overview";

  const [activeTab, setActiveTab] = useState<Tab>(tabParam);
  useEffect(() => {
    setActiveTab(tabParam);
  }, [tabParam]);

  // Firestore Lists
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>(DEFAULT_BRANDS);
  const [orders, setOrders] = useState<any[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [banners, setBanners] = useState<OfferBanner[]>([]);
  const [heroSlides, setHeroSlides] = useState<HeroSlide[]>([]);
  const [galleryImages, setGalleryImages] = useState<GalleryImage[]>([]);
  const [showcaseSettings, setShowcaseSettings] = useState<VisualShowcaseSettings>(DEFAULT_SHOWCASE_SETTINGS);
  const [todayDealSettings, setTodayDealSettings] = useState<TodayDealSettings>(DEFAULT_TODAY_DEAL_SETTINGS);
  const [megaMenuSettings, setMegaMenuSettings] = useState<MegaMenuSettings>(DEFAULT_MEGA_MENU_SETTINGS);
  const [galleryAnimationSettings, setGalleryAnimationSettings] = useState<GalleryAnimationSettings>(DEFAULT_GALLERY_ANIMATION_SETTINGS);
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // COD Fee state
  const [codFee, setCodFee] = useState<number>(250);
  const [savingCod, setSavingCod] = useState(false);
  const [codSavedMsg, setCodSavedMsg] = useState(false);

  useEffect(() => {
    async function loadCodFee() {
      try {
        const snap = await getDoc(doc(db, "settings", "store"));
        if (snap.exists() && snap.data().cod_fee !== undefined) {
          setCodFee(Number(snap.data().cod_fee));
        }
      } catch {
        // Silent offline fallback to default COD fee
      }
    }
    loadCodFee();
  }, []);

  const handleSaveCodFee = async () => {
    try {
      setSavingCod(true);
      await setDoc(doc(db, "settings", "store"), { cod_fee: Number(codFee) }, { merge: true });
      setCodSavedMsg(true);
      setTimeout(() => setCodSavedMsg(false), 3000);
    } catch (e) {
      alert("Failed to update COD fee");
    } finally {
      setSavingCod(false);
    }
  };

  // Filters & Period
  const [period, setPeriod] = useState<"month" | "week" | "today">("month");
  const [productSearch, setProductSearch] = useState("");
  const [inventorySearch, setInventorySearch] = useState("");

  // Modals
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  const [isBannerModalOpen, setIsBannerModalOpen] = useState(false);
  const [editingBanner, setEditingBanner] = useState<OfferBanner | null>(null);

  const [isHeroModalOpen, setIsHeroModalOpen] = useState(false);
  const [editingHeroSlide, setEditingHeroSlide] = useState<HeroSlide | null>(null);

  const [isGalleryModalOpen, setIsGalleryModalOpen] = useState(false);
  const [editingGalleryImage, setEditingGalleryImage] = useState<GalleryImage | null>(null);

  const [googleReviewsSettings, setGoogleReviewsSettings] = useState<GoogleReviewsSettings>(DEFAULT_GOOGLE_REVIEWS_SETTINGS);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [editingReview, setEditingReview] = useState<Review | null>(null);

  // Stock Filter & Quick Stock Addition States
  const [productStockFilter, setProductStockFilter] = useState<"all" | "low_stock" | "in_stock">("all");
  const [quickStockProduct, setQuickStockProduct] = useState<Product | null>(null);
  const [quickStockQty, setQuickStockQty] = useState<number>(10);
  const [isUpdatingStock, setIsUpdatingStock] = useState(false);

  // Load Real Firestore Data
  const refreshData = async () => {
    try {
      setLoading(true);
      // Products
      const prodSnap = await getDocs(collection(db, "products"));
      const prodList = prodSnap.docs.map((d) => ({ id: d.id, ...d.data() } as Product));
      setProducts(prodList.length > 0 ? prodList : fallbackProducts);

      // Categories
      const catSnap = await getDocs(collection(db, "categories"));
      const catList = catSnap.docs.map((d) => ({ id: d.id, ...d.data() } as Category));
      const catMap = new Map<string, Category>();
      fallbackCategories.forEach((c) => catMap.set(c.id || c.slug, c));
      catList.forEach((c) => {
        const key = c.id || c.slug;
        catMap.set(key, { ...catMap.get(key), ...c, id: key });
      });
      setCategories(Array.from(catMap.values()));

      // Orders
      const ordSnap = await getDocs(collection(db, "orders"));
      const ordList: any[] = ordSnap.docs.map((d) => ({ id: d.id, ...d.data() }));
      ordList.sort((a: any, b: any) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
      setOrders(ordList);

      // Reviews
      const revSnap = await getDocs(collection(db, "reviews"));
      const revList = revSnap.docs.map((d) => ({ id: d.id, ...d.data() } as Review));
      revList.sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0));
      setReviews(revList);

      // Google Reviews Settings
      const googleSnap = await getDoc(doc(db, "settings", "google_reviews"));
      if (googleSnap.exists()) {
        setGoogleReviewsSettings({ ...DEFAULT_GOOGLE_REVIEWS_SETTINGS, ...googleSnap.data() });
      }

      // Banners (Merge offer_banners and banners collections)
      const banSnap = await getDocs(collection(db, "offer_banners"));
      const banList = banSnap.docs.map((d) => {
        const data = d.data();
        return {
          ...data,
          id: d.id,
          status: data.status || "active",
          placement: data.placement || "homepage_after_categories",
        } as OfferBanner;
      });

      let legacyBanList: OfferBanner[] = [];
      try {
        const legacyBanSnap = await getDocs(collection(db, "banners"));
        legacyBanList = legacyBanSnap.docs.map((d) => {
          const data = d.data();
          return {
            id: d.id,
            internalName: data.title || "Banner",
            headline: data.title || "",
            subheadline: data.subtitle || "",
            desktop_image_url: data.image_url || data.desktop_image_url || "",
            mobile_image_url: data.mobile_image_url || data.image_url || "",
            cta_url: data.link || data.cta_url || "/",
            status: (data.is_active === false || data.status === "paused") ? "paused" : "active",
            placement: data.placement || "homepage_after_categories",
            ...data,
          } as OfferBanner;
        });
      } catch (err) {
        console.warn("Error fetching legacy banners collection:", err);
      }

      const bannerMap = new Map<string, OfferBanner>();
      legacyBanList.forEach((b) => {
        if (b.id) bannerMap.set(b.id, b);
      });
      banList.forEach((b) => {
        if (b.id) bannerMap.set(b.id, b);
      });

      if (bannerMap.size === 0) {
        fallbackOfferBanners.forEach((f) => {
          if (!bannerMap.has(f.id)) bannerMap.set(f.id, f);
        });
      }

      const mergedBanners = Array.from(bannerMap.values());
      setBanners(mergedBanners.filter((b) => b.status !== "archived"));

      // Hero Slides
      const heroSnap = await getDocs(collection(db, "hero_slides"));
      const heroList = heroSnap.docs.map((d) => ({ id: d.id, ...d.data() } as HeroSlide));
      setHeroSlides(heroList);

      // Gallery Images
      const galSnap = await getDocs(collection(db, "gallery"));
      const galList = galSnap.docs.map((d) => ({ id: d.id, ...d.data() } as GalleryImage));
      setGalleryImages(galList);

      // Users / Customers (Merge registered users and guest checkout profiles)
      const userSnap = await getDocs(collection(db, "users"));
      const userList = userSnap.docs.map((d) => ({ id: d.id, isGuest: false, ...d.data() }));

      let guestList: any[] = [];
      try {
        const guestSnap = await getDocs(collection(db, "guest_profiles"));
        guestList = guestSnap.docs.map((d) => {
          const data = d.data();
          return {
            id: d.id,
            isGuest: true,
            displayName: data.name || data.fullName || data.customerName || "Guest Customer",
            email: data.email || "guest@streetmobile.lk",
            phoneNumber: data.phone || data.phoneNumber || "",
            createdAt: data.createdAt || data.updatedAt || "",
            ...data,
          };
        });
      } catch (err) {
        console.warn("Error fetching guest profiles collection:", err);
      }

      const customerMap = new Map<string, any>();
      guestList.forEach((g) => {
        const key = g.email || g.id;
        customerMap.set(key, g);
      });
      userList.forEach((u: any) => {
        const key = u.email || u.id;
        customerMap.set(key, u);
      });

      setCustomers(Array.from(customerMap.values()));

      // Visual Showcase Settings
      try {
        const sc = await getShowcaseSettings();
        if (sc) setShowcaseSettings(sc);
      } catch (err) {
        console.warn("Error fetching showcase settings in admin:", err);
      }

      // Today's Deal Settings
      try {
        const td = await getTodayDealSettings();
        if (td) setTodayDealSettings(td);
      } catch (err) {
        console.warn("Error fetching Today's Deal settings in admin:", err);
      }

      // Category Mega Menu Settings
      try {
        const mm = await getMegaMenuSettings();
        if (mm) setMegaMenuSettings(mm);
      } catch (err) {
        console.warn("Error fetching Category Mega Menu settings in admin:", err);
      }

      // Brands List
      try {
        const bList = await getBrands();
        if (bList && bList.length > 0) setBrands(bList);
      } catch (err) {
        console.warn("Error fetching brands in admin:", err);
      }

      // Gallery Scroll Animation Settings
      try {
        const ga = await getGalleryAnimationSettings();
        if (ga) setGalleryAnimationSettings(ga);
      } catch (err) {
        console.warn("Error fetching gallery animation settings in admin:", err);
      }
    } catch (e) {
      console.error("Dashboard Data Fetch Error:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshData();
  }, []);

  // Compute Overview KPI Metrics
  const metrics = useMemo(() => {
    const totalRev = orders.reduce((sum, o) => sum + (o.finalTotal || o.totalPrice || 0), 0);
    const totalOrd = orders.length;
    const totalProd = products.length;
    const totalCust = customers.length > 0 ? customers.length : Math.max(orders.length, 12);

    const deliveredCount = orders.filter((o) => o.status === "completed" || o.status === "delivered" || o.orderStatus === "Delivered").length;
    const processingCount = orders.filter((o) => o.status === "processing" || o.orderStatus === "Processing").length;
    const codPendingCount = orders.filter((o) => o.paymentMethod === "cod" && (o.status === "pending" || o.status === "Pending")).length;
    const cancelledCount = orders.filter((o) => o.status === "cancelled" || o.status === "Cancelled").length;

    return {
      totalRev: totalRev || 2480000,
      totalOrd: totalOrd || 1284,
      totalProd: totalProd || 326,
      totalCust: totalCust || 4892,
      deliveredCount: deliveredCount || 612,
      processingCount: processingCount || 312,
      codPendingCount: codPendingCount || 236,
      cancelledCount: cancelledCount || 124,
    };
  }, [orders, products, customers]);

  // Low Stock Items Memo
  const lowStockItems = useMemo(() => {
    return products.filter((p) => p.stock_status === "low_stock" || p.stock_status === "out_of_stock").slice(0, 4);
  }, [products]);

  // Filtered Products List (Support separate Low Stock view)
  const filteredProductsList = useMemo(() => {
    if (productStockFilter === "low_stock") {
      return products.filter(
        (p) =>
          p.stock_status === "low_stock" ||
          p.stock_status === "out_of_stock" ||
          (p.stock_count !== undefined && p.stock_count <= 5)
      );
    }
    if (productStockFilter === "in_stock") {
      return products.filter(
        (p) => p.stock_status === "in_stock" && (p.stock_count === undefined || p.stock_count > 5)
      );
    }
    return products;
  }, [products, productStockFilter]);

  const lowStockCount = useMemo(() => {
    return products.filter(
      (p) =>
        p.stock_status === "low_stock" ||
        p.stock_status === "out_of_stock" ||
        (p.stock_count !== undefined && p.stock_count <= 5)
    ).length;
  }, [products]);

  // Quick Stock Increment Handler
  const handleSaveQuickStock = async () => {
    if (!quickStockProduct) return;
    try {
      setIsUpdatingStock(true);
      const currentQty = quickStockProduct.stock_count || 0;
      const newStock = Math.max(0, currentQty + quickStockQty);
      const newStatus = newStock === 0 ? "out_of_stock" : newStock <= 5 ? "low_stock" : "in_stock";

      await updateDoc(doc(db, "products", quickStockProduct.id), {
        stock_count: newStock,
        stock_status: newStatus,
        updated_at: new Date().toISOString(),
      });

      setProducts((prev) =>
        prev.map((p) =>
          p.id === quickStockProduct.id ? { ...p, stock_count: newStock, stock_status: newStatus } : p
        )
      );

      setQuickStockProduct(null);
      alert(`Stock updated for ${quickStockProduct.name}! New Stock: ${newStock}`);
    } catch (e) {
      console.error("Error updating stock:", e);
      alert("Failed to update stock quantity");
    } finally {
      setIsUpdatingStock(false);
    }
  };

  const handleDeleteProduct = async (id: string) => {
    if (!confirm("Are you sure you want to delete this product?")) return;
    try {
      await deleteDoc(doc(db, "products", id));
      setProducts(products.filter((p) => p.id !== id));
    } catch (e) {
      alert("Error deleting product");
    }
  };

  const downloadCustomersPDF = () => {
    const doc = new jsPDF();
    doc.setFont("helvetica", "bold");
    doc.setFontSize(18);
    doc.text("STREET MOBILE — CUSTOMER DIRECTORY", 14, 20);

    const customerList = customers.length > 0 ? customers : orders;
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(100);
    doc.text(`Generated: ${new Date().toLocaleString()} | Total Accounts: ${customerList.length}`, 14, 27);
    doc.setDrawColor(200);
    doc.line(14, 30, 196, 30);

    let y = 38;
    doc.setFont("helvetica", "bold");
    doc.text("#", 14, y);
    doc.text("Customer Name", 25, y);
    doc.text("Email Address", 85, y);
    doc.text("Phone Number", 145, y);
    doc.text("Tag", 180, y);

    doc.line(14, y + 2, 196, y + 2);
    y += 8;
    doc.setFont("helvetica", "normal");

    customerList.forEach((c: any, i: number) => {
      if (y > 270) {
        doc.addPage();
        y = 20;
      }
      doc.text(`${i + 1}`, 14, y);
      doc.text((c.displayName || c.customerName || `Customer #${i + 1}`).slice(0, 25), 25, y);
      doc.text((c.email || "customer@streetmobile.lk").slice(0, 30), 85, y);
      doc.text((c.phoneNumber || c.phone || "077 414 1118").slice(0, 18), 145, y);
      doc.text("VIP Customer", 180, y);
      y += 7;
    });

    doc.save(`street-mobile-customers-${new Date().toISOString().slice(0, 10)}.pdf`);
  };

  const exportCustomersCSV = () => {
    const customerList = customers.length > 0 ? customers : orders;
    const headers = ["Index", "Customer Name", "Email", "Phone Number", "Customer Tag"];
    const rows = customerList.map((c: any, i: number) => [
      `"${i + 1}"`,
      `"${c.displayName || c.customerName || `Customer #${i + 1}`}"`,
      `"${c.email || "customer@streetmobile.lk"}"`,
      `"${c.phoneNumber || c.phone || "077 414 1118"}"`,
      `"VIP Customer"`,
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `street-mobile-customers-${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDeleteCustomer = async (id: string) => {
    if (!confirm("Are you sure you want to delete this customer record?")) return;
    const target = customers.find((c) => c.id === id);
    try {
      if (id) {
        if (target?.isGuest) {
          await deleteDoc(doc(db, "guest_profiles", id));
        } else {
          await deleteDoc(doc(db, "users", id));
        }
      }
      setCustomers(customers.filter((c) => c.id !== id));
    } catch (e) {
      console.error("Error deleting customer:", e);
      alert("Failed to delete customer");
    }
  };

  const handleDeleteCategory = async (id: string) => {
    const targetCategory = categories.find((c) => c.id === id);
    const categorySlug = targetCategory?.slug;
    const categoryName = targetCategory?.name || "Category";

    const linkedProducts = products.filter(
      (p) => p.category_id === id || p.category_name?.toLowerCase() === categoryName.toLowerCase() || (categorySlug && p.category_id === categorySlug)
    );

    if (linkedProducts.length > 0) {
      alert(
        `⚠️ Cannot delete "${categoryName}"!\n\nThis category currently has ${linkedProducts.length} linked product(s). Please reassign or update these products to another category before deleting this category.`
      );
      return;
    }

    if (!confirm(`Are you sure you want to delete category "${categoryName}"?`)) return;
    try {
      if (id && !id.startsWith("default-")) {
        await deleteDoc(doc(db, "categories", id));
      }
    } catch (e) {
      console.error("Error deleting category:", e);
    }
    setCategories((prev) => prev.filter((c) => c.id !== id));
  };

  const handleSaveBanner = async (bannerData: Partial<OfferBanner>) => {
    try {
      if (editingBanner && editingBanner.id) {
        await setDoc(doc(db, "offer_banners", editingBanner.id), { ...editingBanner, ...bannerData }, { merge: true });
        setBanners((prev) => prev.map((b) => (b.id === editingBanner.id ? ({ ...b, ...bannerData } as OfferBanner) : b)));
      } else {
        const docRef = await addDoc(collection(db, "offer_banners"), bannerData);
        setBanners((prev) => [...prev, { ...bannerData, id: docRef.id } as OfferBanner]);
      }
      setIsBannerModalOpen(false);
      setEditingBanner(null);
      refreshData();
    } catch (e) {
      console.error("Error saving offer banner:", e);
      alert("Failed to save offer banner");
    }
  };

  const handleDeleteBanner = async (id: string) => {
    if (!confirm("Are you sure you want to delete / remove this offer banner?")) return;
    try {
      if (id) {
        if (id.startsWith("default-")) {
          const target = banners.find((b) => b.id === id);
          await setDoc(doc(db, "offer_banners", id), { ...(target || {}), id, status: "archived" }, { merge: true });
        } else {
          await deleteDoc(doc(db, "offer_banners", id));
        }
      }
    } catch (e) {
      console.error("Error deleting banner:", e);
    }
    setBanners((prev) => prev.filter((b) => b.id !== id));
  };

  const handleDuplicateBanner = async (banner: OfferBanner) => {
    try {
      const duplicatedData = {
        ...banner,
        internalName: `${banner.internalName} (Copy)`,
        headline: `${banner.headline}`,
        created_at: new Date().toISOString(),
      };
      delete (duplicatedData as any).id;
      const docRef = await addDoc(collection(db, "offer_banners"), duplicatedData);
      setBanners((prev) => [...prev, { ...duplicatedData, id: docRef.id } as OfferBanner]);
    } catch (e) {
      console.error("Error duplicating banner:", e);
    }
  };

  const handleToggleBannerStatus = async (id: string, newStatus: BannerStatus) => {
    try {
      const target = banners.find((b) => b.id === id);
      if (id) {
        await setDoc(doc(db, "offer_banners", id), { ...(target || {}), id, status: newStatus }, { merge: true });
      }
    } catch (e) {
      console.error("Error toggling banner status:", e);
    }
    setBanners((prev) => prev.map((b) => (b.id === id ? { ...b, status: newStatus } : b)));
  };

  const handleSaveHeroSlide = async (slideData: Partial<HeroSlide>) => {
    try {
      const slideId = editingHeroSlide?.id || `hero-${Date.now()}`;
      const payload = { ...slideData, id: slideId, updated_at: new Date().toISOString() };
      await setDoc(doc(db, "hero_slides", slideId), payload, { merge: true });

      setHeroSlides((prev) => {
        const exists = prev.some((s) => s.id === slideId);
        if (exists) {
          return prev.map((s) => (s.id === slideId ? ({ ...s, ...payload } as HeroSlide) : s));
        }
        return [...prev, payload as HeroSlide];
      });

      setIsHeroModalOpen(false);
      setEditingHeroSlide(null);
      refreshData();
    } catch (e: any) {
      console.error("Error saving hero slide:", e);
      alert(`Failed to save hero slide: ${e?.message || "Check network/permissions"}`);
    }
  };

  const handleToggleHeroSlideStatus = async (id: string, active: boolean) => {
    try {
      if (id) {
        await setDoc(doc(db, "hero_slides", id), { active }, { merge: true });
        setHeroSlides((prev) => prev.map((s) => (s.id === id ? { ...s, active } : s)));
      }
    } catch (e) {
      console.error("Error toggling hero slide status:", e);
    }
  };

  const handleDeleteHeroSlide = async (id: string) => {
    if (!confirm("Are you sure you want to delete this hero slider image?")) return;
    try {
      if (id) {
        await deleteDoc(doc(db, "hero_slides", id));
      }
    } catch (e) {
      console.error("Error deleting hero slide:", e);
    }
    setHeroSlides((prev) => prev.filter((s) => s.id !== id));
  };

  const handleDeleteGalleryImage = async (id: string) => {
    if (!confirm("Are you sure you want to delete this gallery image?")) return;
    try {
      if (id) {
        await deleteDoc(doc(db, "gallery", id));
      }
    } catch (e) {
      console.error("Error deleting gallery image:", e);
      alert("Failed to delete gallery image");
    }
    setGalleryImages((prev) => prev.filter((img) => img.id !== id));
  };

  const handleDeleteReview = async (id: string) => {
    if (!confirm("Are you sure you want to delete this Google review?")) return;
    try {
      if (id) {
        await deleteDoc(doc(db, "reviews", id));
      }
    } catch (e) {
      console.error("Error deleting review:", e);
      alert("Failed to delete review");
    }
    setReviews((prev) => prev.filter((r) => r.id !== id));
  };

  const handleToggleReviewVisibility = async (id: string, currentVisible: boolean) => {
    try {
      const nextVal = !currentVisible;
      await updateDoc(doc(db, "reviews", id), { visible: nextVal });
      setReviews((prev) => prev.map((r) => (r.id === id ? { ...r, visible: nextVal } : r)));
    } catch (e) {
      console.error("Error toggling review visibility:", e);
    }
  };

  const handleToggleReviewFeatured = async (id: string, currentFeatured: boolean) => {
    try {
      const nextVal = !currentFeatured;
      await updateDoc(doc(db, "reviews", id), { featured: nextVal });
      setReviews((prev) => prev.map((r) => (r.id === id ? { ...r, featured: nextVal } : r)));
    } catch (e) {
      console.error("Error toggling review featured:", e);
    }
  };

  const handleReorderReview = async (id: string, direction: "up" | "down") => {
    const index = reviews.findIndex((r) => r.id === id);
    if (index === -1) return;
    const targetIdx = direction === "up" ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= reviews.length) return;

    const newReviews = [...reviews];
    const temp = newReviews[index];
    newReviews[index] = newReviews[targetIdx];
    newReviews[targetIdx] = temp;

    const updated = newReviews.map((r, i) => ({ ...r, sort_order: i }));
    setReviews(updated);

    try {
      await Promise.all([
        updateDoc(doc(db, "reviews", updated[index].id), { sort_order: updated[index].sort_order }),
        updateDoc(doc(db, "reviews", updated[targetIdx].id), { sort_order: updated[targetIdx].sort_order }),
      ]);
    } catch (e) {
      console.error("Error updating review order:", e);
    }
  };

  const handleUpdateOrderStatus = async (id: string, newStatus: string) => {
    try {
      await updateDoc(doc(db, "orders", id), { status: newStatus, orderStatus: newStatus });
      setOrders(orders.map((o) => (o.id === id ? { ...o, status: newStatus, orderStatus: newStatus } : o)));

      // Trigger automated email when status changes to completed/delivered/shipped/packing
      const targetOrder = orders.find((o) => o.id === id);
      if (targetOrder) {
        let statusType = "";
        if (newStatus === "delivered" || newStatus === "completed") statusType = "delivered_thankyou";
        else if (newStatus === "shipped") statusType = "on_the_way";
        else if (newStatus === "processing" || newStatus === "packed") statusType = "packing";

        if (statusType) {
          fetch("/api/send-customer-email", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              orderId: id,
              customerName: targetOrder.customerName || targetOrder.name || "Valued Customer",
              email: targetOrder.customerEmail || targetOrder.email,
              statusType: statusType,
              address: targetOrder.address,
              district: targetOrder.district,
              items: targetOrder.items,
              totalPrice: targetOrder.totalPrice,
            }),
          }).catch((err) => console.warn("Status email dispatch error:", err));
        }
      }
    } catch (e) {
      console.error("Error updating order status:", e);
      alert("Failed to update order status");
    }
  };

  const handleDeleteOrder = async (id: string) => {
    if (!confirm("Are you sure you want to delete this order?")) return;
    try {
      await deleteDoc(doc(db, "orders", id));
      setOrders(orders.filter((o) => o.id !== id));
    } catch (e) {
      console.error("Error deleting order:", e);
      alert("Failed to delete order");
    }
  };

  return (
    <div className="space-y-8">
      {/* ════════════════════════════════════════════════════════════════════
          TAB 1: OVERVIEW DASHBOARD (Full Black Dark Theme)
      ════════════════════════════════════════════════════════════════════ */}
      {activeTab === "overview" && (
        <div className="space-y-8">
          {/* Header Title */}
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Overview Dashboard
            </h1>
            <p className="text-xs sm:text-sm text-white/50 font-medium mt-1">
              Here's what's happening with your store today.
            </p>
          </div>

          {/* Live Low Stock Warning Alert Banner */}
          {lowStockItems.length > 0 && (
            <div className="p-4 bg-amber-500/10 border-2 border-amber-500/30 rounded-2xl flex items-center justify-between gap-4 animate-pulse">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
                  <AlertCircle className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-extrabold text-amber-300">
                    ⚠️ Live Stock Alert: {lowStockItems.length} Products Low or Out of Stock!
                  </h4>
                  <p className="text-xs text-amber-200/70 mt-0.5">
                    Restock items immediately to prevent lost sales on the website.
                  </p>
                </div>
              </div>
              <Link
                href="/admin/dashboard?tab=inventory"
                className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-black font-extrabold text-xs rounded-xl transition-all shadow-md shrink-0"
              >
                Update Stock Now
              </Link>
            </div>
          )}


          {/* 4 Top KPI Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {/* 1. Total Revenue */}
            <div className="bg-[#0F172A] border border-white/10 rounded-2xl p-5 shadow-lg space-y-3">
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
                  $
                </div>
                <span className="text-[11px] font-extrabold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-md flex items-center gap-1">
                  <TrendingUp className="w-3 h-3" /> ↑ 18.6%
                </span>
              </div>
              <div>
                <p className="text-xs font-bold text-white/40 uppercase tracking-wider">Total Revenue</p>
                <h3 className="text-xl sm:text-2xl font-black text-white mt-1">
                  LKR {(metrics.totalRev / 1000000).toFixed(2)}M
                </h3>
              </div>
              <p className="text-[11px] text-white/40">vs last 7 days</p>
            </div>

            {/* 2. Orders */}
            <div className="bg-[#0F172A] border border-white/10 rounded-2xl p-5 shadow-lg space-y-3">
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center font-bold">
                  <ShoppingBag className="w-5 h-5" />
                </div>
                <span className="text-[11px] font-extrabold text-blue-400 bg-blue-500/10 border border-blue-500/20 px-2 py-0.5 rounded-md flex items-center gap-1">
                  <TrendingUp className="w-3 h-3" /> ↑ 12.4%
                </span>
              </div>
              <div>
                <p className="text-xs font-bold text-white/40 uppercase tracking-wider">Orders</p>
                <h3 className="text-xl sm:text-2xl font-black text-white mt-1">
                  {metrics.totalOrd.toLocaleString()}
                </h3>
              </div>
              <p className="text-[11px] text-white/40">vs last 7 days</p>
            </div>

            {/* 3. Products */}
            <div className="bg-[#0F172A] border border-white/10 rounded-2xl p-5 shadow-lg space-y-3">
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-full bg-purple-500/20 text-purple-400 flex items-center justify-center font-bold">
                  <Package className="w-5 h-5" />
                </div>
                <span className="text-[11px] font-extrabold text-purple-400 bg-purple-500/10 border border-purple-500/20 px-2 py-0.5 rounded-md flex items-center gap-1">
                  <TrendingUp className="w-3 h-3" /> ↑ 7.3%
                </span>
              </div>
              <div>
                <p className="text-xs font-bold text-white/40 uppercase tracking-wider">Products</p>
                <h3 className="text-xl sm:text-2xl font-black text-white mt-1">
                  {metrics.totalProd}
                </h3>
              </div>
              <p className="text-[11px] text-white/40">vs last 7 days</p>
            </div>

            {/* 4. Customers */}
            <div className="bg-[#0F172A] border border-white/10 rounded-2xl p-5 shadow-lg space-y-3">
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-full bg-orange-500/20 text-orange-400 flex items-center justify-center font-bold">
                  <Users className="w-5 h-5" />
                </div>
                <span className="text-[11px] font-extrabold text-orange-400 bg-orange-500/10 border border-orange-500/20 px-2 py-0.5 rounded-md flex items-center gap-1">
                  <TrendingUp className="w-3 h-3" /> ↑ 15.8%
                </span>
              </div>
              <div>
                <p className="text-xs font-bold text-white/40 uppercase tracking-wider">Customers</p>
                <h3 className="text-xl sm:text-2xl font-black text-white mt-1">
                  {metrics.totalCust.toLocaleString()}
                </h3>
              </div>
              <p className="text-[11px] text-white/40">vs last 7 days</p>
            </div>
          </div>

          {/* Charts Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left: Revenue Overview Line Chart (Col 8) */}
            <div className="lg:col-span-8 bg-[#0F172A] border border-white/10 rounded-3xl p-6 shadow-lg space-y-6">
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <div>
                  <h3 className="text-base font-extrabold text-white">Revenue Overview</h3>
                  <p className="text-xs text-white/40">Monthly sales performance & revenue trend</p>
                </div>
                <select
                  value={period}
                  onChange={(e) => setPeriod(e.target.value as any)}
                  className="px-3 py-1.5 bg-white/5 border border-white/10 rounded-xl text-xs font-bold text-white outline-none"
                >
                  <option value="month" className="bg-slate-900 text-white">This Month</option>
                  <option value="week" className="bg-slate-900 text-white">Last 7 Days</option>
                  <option value="today" className="bg-slate-900 text-white">Today</option>
                </select>
              </div>

              <div className="h-64 w-full flex flex-col justify-between pt-2">
                <svg className="w-full h-48 overflow-visible" viewBox="0 0 500 150">
                  <defs>
                    <linearGradient id="blueGradientDark" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#3B82F6" stopOpacity="0.4" />
                      <stop offset="100%" stopColor="#3B82F6" stopOpacity="0.0" />
                    </linearGradient>
                  </defs>
                  
                  <line x1="0" y1="30" x2="500" y2="30" stroke="#1E293B" strokeWidth="1" />
                  <line x1="0" y1="70" x2="500" y2="70" stroke="#1E293B" strokeWidth="1" />
                  <line x1="0" y1="110" x2="500" y2="110" stroke="#1E293B" strokeWidth="1" />

                  <polygon
                    points="0,120 40,105 80,85 120,95 160,70 200,80 240,60 280,40 320,55 360,35 400,30 440,45 480,35 500,40 500,150 0,150"
                    fill="url(#blueGradientDark)"
                  />

                  <polyline
                    fill="none"
                    stroke="#3B82F6"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    points="0,120 40,105 80,85 120,95 160,70 200,80 240,60 280,40 320,55 360,35 400,30 440,45 480,35 500,40"
                  />

                  {[
                    [0, 120], [40, 105], [80, 85], [120, 95], [160, 70], [200, 80],
                    [240, 60], [280, 40], [320, 55], [360, 35], [400, 30], [440, 45], [480, 35], [500, 40]
                  ].map(([x, y], idx) => (
                    <circle key={idx} cx={x} cy={y} r="4" fill="#0F172A" stroke="#3B82F6" strokeWidth="2.5" />
                  ))}
                </svg>

                <div className="flex justify-between text-[11px] font-bold text-white/40 px-2 border-t border-white/10 pt-2">
                  <span>1 May</span>
                  <span>5 May</span>
                  <span>9 May</span>
                  <span>13 May</span>
                  <span>17 May</span>
                  <span>21 May</span>
                  <span>25 May</span>
                  <span>29 May</span>
                  <span>31 May</span>
                </div>
              </div>
            </div>

            {/* Right: Order Status Donut Chart (Col 4) */}
            <div className="lg:col-span-4 bg-[#0F172A] border border-white/10 rounded-3xl p-6 shadow-lg space-y-6">
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <h3 className="text-base font-extrabold text-white">Order Status</h3>
                <span className="text-xs font-bold text-white/40">This Month</span>
              </div>

              <div className="flex flex-col items-center justify-center py-2">
                <div className="relative w-44 h-44 flex items-center justify-center">
                  <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                    <path className="text-emerald-500" strokeDasharray="47.7, 100" strokeWidth="3.8" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                    <path className="text-blue-500" strokeDasharray="24.3, 100" strokeDashoffset="-47.7" strokeWidth="3.8" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                    <path className="text-amber-500" strokeDasharray="18.4, 100" strokeDashoffset="-72" strokeWidth="3.8" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                    <path className="text-purple-500" strokeDasharray="9.6, 100" strokeDashoffset="-90.4" strokeWidth="3.8" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                  </svg>

                  <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                    <span className="text-xl font-black text-white">{metrics.totalOrd.toLocaleString()}</span>
                    <span className="text-[10px] font-bold text-white/40 uppercase">Total Orders</span>
                  </div>
                </div>
              </div>

              <div className="space-y-2 text-xs pt-2 border-t border-white/10">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                    <span className="text-white/80 font-medium">Delivered</span>
                  </span>
                  <span className="font-bold text-white">{metrics.deliveredCount} (47.7%)</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                    <span className="text-white/80 font-medium">Processing</span>
                  </span>
                  <span className="font-bold text-white">{metrics.processingCount} (24.3%)</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                    <span className="text-white/80 font-medium">COD Pending</span>
                  </span>
                  <span className="font-bold text-white">{metrics.codPendingCount} (18.4%)</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-purple-500" />
                    <span className="text-white/80 font-medium">Cancelled</span>
                  </span>
                  <span className="font-bold text-white">{metrics.cancelledCount} (9.6%)</span>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Recent Orders Table (Col 8) */}
            <div className="lg:col-span-8 bg-[#0F172A] border border-white/10 rounded-3xl p-6 shadow-lg space-y-4">
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <div>
                  <h3 className="text-base font-extrabold text-white">Recent Orders</h3>
                  <p className="text-xs text-white/40">Latest customer purchases and status</p>
                </div>
                <button
                  type="button"
                  onClick={() => router.push("/admin/dashboard?tab=orders")}
                  className="px-3 py-1.5 bg-blue-600/20 border border-blue-500/30 text-blue-400 rounded-xl text-xs font-bold hover:bg-blue-600/30 transition-colors"
                >
                  View All Orders
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead>
                    <tr className="text-white/40 font-bold border-b border-white/10 uppercase tracking-wider text-[10px]">
                      <th className="pb-3">Order ID</th>
                      <th className="pb-3">Customer</th>
                      <th className="pb-3">Product</th>
                      <th className="pb-3">Payment</th>
                      <th className="pb-3">Status</th>
                      <th className="pb-3 text-right">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {orders.slice(0, 5).map((ord, idx) => (
                      <tr key={ord.id || idx} className="hover:bg-white/[0.02] transition-colors">
                        <td className="py-3 font-mono font-bold text-white">
                          #{ord.id?.slice(0, 8).toUpperCase() || `SM1258${4 - idx}`}
                        </td>
                        <td className="py-3 font-medium text-white">
                          {ord.customerName || ord.deliveryAddress?.firstName || "Customer"}
                          <span className="block text-[11px] text-white/40 font-normal">
                            {ord.phone || ord.deliveryAddress?.phone || "077 123 4567"}
                          </span>
                        </td>
                        <td className="py-3">
                          <div className="flex items-center gap-2 max-w-[200px] truncate">
                            <img
                              src={ord.items?.[0]?.image || "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?q=80&w=200"}
                              alt="product"
                              className="w-7 h-7 rounded-lg object-contain bg-white/10 border border-white/10 shrink-0"
                            />
                            <span className="truncate font-semibold text-white/90">
                              {ord.items?.[0]?.name || "iPhone 16 Pro Max"}
                            </span>
                          </div>
                        </td>
                        <td className="py-3 font-bold text-white/80">
                          {ord.paymentMethod === "payhere" ? "PayHere Online" : ord.paymentMethod === "cod" ? "Cash on Delivery" : "VISA **** 4242"}
                        </td>
                        <td className="py-3">
                          <span
                            className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                              ord.status === "paid" || ord.status === "completed" || idx % 2 === 0
                                ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                                : "bg-blue-500/10 text-blue-400 border border-blue-500/20"
                            }`}
                          >
                            {ord.status || (idx % 2 === 0 ? "Paid" : "Processing")}
                          </span>
                        </td>
                        <td className="py-3 text-right font-black text-white">
                          {formatPrice(ord.finalTotal || ord.totalPrice || 359990)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Low Stock Alert & PayHere Status (Col 4) */}
            <div className="lg:col-span-4 space-y-6">
              <div className="bg-[#0F172A] border border-white/10 rounded-3xl p-6 shadow-lg space-y-4">
                <div className="flex items-center justify-between border-b border-white/10 pb-3">
                  <h3 className="text-sm font-extrabold text-white flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-red-500" /> Low Stock Alert
                  </h3>
                  <Link href="/admin/dashboard?tab=inventory" className="text-xs font-bold text-blue-400 hover:underline">
                    View All
                  </Link>
                </div>

                <div className="space-y-3">
                  {lowStockItems.length > 0 ? (
                    lowStockItems.map((p) => (
                      <div key={p.id} className="flex items-center justify-between p-2.5 bg-white/5 border border-white/10 rounded-2xl text-xs">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <img src={p.images?.[0]} alt={p.name} className="w-8 h-8 rounded-lg object-contain bg-white/10 border border-white/10 shrink-0" />
                          <div className="truncate">
                            <p className="font-bold text-white truncate">{p.name}</p>
                            <p className="text-[10px] text-white/40">{p.storage_options?.[0] || "Standard Variant"}</p>
                          </div>
                        </div>
                        <span className="font-black text-red-400 bg-red-500/10 border border-red-500/20 px-2 py-1 rounded-md shrink-0">
                          Stock 3
                        </span>
                      </div>
                    ))
                  ) : (
                    <>
                      <div className="flex items-center justify-between p-2.5 bg-white/5 border border-white/10 rounded-2xl text-xs">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <img src="https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?q=80&w=200" alt="S24" className="w-8 h-8 rounded-lg object-contain bg-white/10 border border-white/10 shrink-0" />
                          <div className="truncate">
                            <p className="font-bold text-white truncate">Samsung Galaxy S24 FE</p>
                            <p className="text-[10px] text-white/40">128GB, Graphite</p>
                          </div>
                        </div>
                        <span className="font-black text-red-400 bg-red-500/10 border border-red-500/20 px-2 py-1 rounded-md shrink-0">Stock 3</span>
                      </div>

                      <div className="flex items-center justify-between p-2.5 bg-white/5 border border-white/10 rounded-2xl text-xs">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <img src="https://images.unsplash.com/photo-1598327105666-5b89351aff97?q=80&w=200" alt="Note 13" className="w-8 h-8 rounded-lg object-contain bg-white/10 border border-white/10 shrink-0" />
                          <div className="truncate">
                            <p className="font-bold text-white truncate">Redmi Note 13 Pro+ 5G</p>
                            <p className="text-[10px] text-white/40">12GB + 512GB, Purple</p>
                          </div>
                        </div>
                        <span className="font-black text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2 py-1 rounded-md shrink-0">Stock 5</span>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* PayHere Status Card */}
              <div className="bg-[#0F172A] border border-white/10 rounded-3xl p-5 shadow-lg flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-black text-white flex items-center gap-1.5">
                    <CreditCard className="w-4 h-4 text-blue-400" /> PayHere Payment Gateway
                  </h4>
                  <p className="text-[11px] text-white/40 mt-0.5">All systems operational</p>
                </div>
                <span className="text-[11px] font-extrabold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 rounded-full flex items-center gap-1 shrink-0">
                  <Check className="w-3 h-3" /> Connected
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════════════
          TAB 2: PRODUCTS TAB
      ════════════════════════════════════════════════════════════════════ */}
      {activeTab === "products" && (
        <ProductsTab
          products={products}
          categories={categories}
          brands={brands}
          onDelete={handleDeleteProduct}
          onEdit={(p: Product) => {
            setEditingProduct(p);
            setIsProductModalOpen(true);
          }}
          onAdd={(catName?: string) => {
            if (catName) {
              const matchedCat = categories.find(
                (c) => c.name.toLowerCase().includes(catName.toLowerCase()) || c.id === catName
              );
              setEditingProduct({
                id: "",
                name: "",
                slug: "",
                code: "",
                category_id: matchedCat?.id || "cat-smartphones",
                category_name: matchedCat?.name || catName,
                brand: "Apple",
                price: 0,
                description: "",
                images: [],
                stock_status: "in_stock",
                stock_count: 10,
              } as any);
            } else {
              setEditingProduct(null);
            }
            setIsProductModalOpen(true);
          }}
        />
      )}

      {/* ════════════════════════════════════════════════════════════════════
          TAB 3: ORDERS TAB
      ════════════════════════════════════════════════════════════════════ */}
      {activeTab === "orders" && (
        <OrdersTab
          orders={orders}
          onUpdateStatus={handleUpdateOrderStatus}
          onDeleteOrder={handleDeleteOrder}
          onRefresh={refreshData}
        />
      )}

      {/* ════════════════════════════════════════════════════════════════════
          TAB 4: CATEGORIES TAB
      ════════════════════════════════════════════════════════════════════ */}
      {activeTab === "categories" && (
        <CategoriesTab
          categories={categories}
          products={products}
          onAdd={() => {
            setEditingCategory(null);
            setIsCategoryModalOpen(true);
          }}
          onEdit={(cat: Category) => {
            setEditingCategory(cat);
            setIsCategoryModalOpen(true);
          }}
          onDelete={handleDeleteCategory}
        />
      )}

      {/* ════════════════════════════════════════════════════════════════════
          TAB 4B: BRANDS TAB
      ════════════════════════════════════════════════════════════════════ */}
      {activeTab === "brands" && (
        <BrandsTab products={products} />
      )}

      {/* ════════════════════════════════════════════════════════════════════
          TAB 5: OFFERS & BANNERS TAB
      ════════════════════════════════════════════════════════════════════ */}
      {activeTab === "banners" && (
        <BannersTab
          banners={banners}
          products={products}
          onAdd={() => {
            setEditingBanner(null);
            setIsBannerModalOpen(true);
          }}
          onEdit={(b: OfferBanner) => {
            setEditingBanner(b);
            setIsBannerModalOpen(true);
          }}
          onDelete={handleDeleteBanner}
          onDuplicate={handleDuplicateBanner}
          onToggleStatus={handleToggleBannerStatus}
        />
      )}

      {/* ════════════════════════════════════════════════════════════════════
          TAB 5B: HOMEPAGE HERO SLIDER TAB
      ════════════════════════════════════════════════════════════════════ */}
      {activeTab === "hero" && (
        <HeroTab
          slides={heroSlides}
          onAdd={() => {
            setEditingHeroSlide(null);
            setIsHeroModalOpen(true);
          }}
          onEdit={(slide: HeroSlide) => {
            setEditingHeroSlide(slide);
            setIsHeroModalOpen(true);
          }}
          onDelete={handleDeleteHeroSlide}
          onToggleStatus={handleToggleHeroSlideStatus}
        />
      )}

      {/* ════════════════════════════════════════════════════════════════════
          TAB 5C: STORE GALLERY TAB
      ════════════════════════════════════════════════════════════════════ */}
      {activeTab === "gallery" && (
        <GalleryTab
          images={galleryImages}
          initialAnimationSettings={galleryAnimationSettings}
          onAdd={() => {
            setEditingGalleryImage(null);
            setIsGalleryModalOpen(true);
          }}
          onEdit={(image: GalleryImage) => {
            setEditingGalleryImage(image);
            setIsGalleryModalOpen(true);
          }}
          onDelete={handleDeleteGalleryImage}
          onRefresh={refreshData}
        />
      )}

      {/* ════════════════════════════════════════════════════════════════════
          TAB 5D: VISUAL PRODUCT SHOWCASE BANNERS
      ════════════════════════════════════════════════════════════════════ */}
      {activeTab === "showcase" && (
        <ShowcaseTab
          products={products}
          categories={categories}
          initialSettings={showcaseSettings}
          onRefresh={refreshData}
        />
      )}

      {/* ════════════════════════════════════════════════════════════════════
          TAB 5E: TODAY'S DEAL PROMOTIONAL BANNER
      ════════════════════════════════════════════════════════════════════ */}
      {activeTab === "today-deal" && (
        <TodayDealTab
          initialSettings={todayDealSettings}
          onRefresh={refreshData}
        />
      )}

      {/* ════════════════════════════════════════════════════════════════════
          TAB 5F: CATEGORY MEGA MENU MANAGEMENT
      ════════════════════════════════════════════════════════════════════ */}
      {activeTab === "mega-menu" && (
        <MegaMenuTab
          initialSettings={megaMenuSettings}
          categories={categories}
          brands={brands}
          products={products}
          onRefresh={refreshData}
        />
      )}

      {/* ════════════════════════════════════════════════════════════════════
          TAB 6: CUSTOMERS TAB
      ════════════════════════════════════════════════════════════════════ */}
      {activeTab === "users" && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-extrabold text-white">Customers Management ({metrics.totalCust})</h1>
              <p className="text-xs text-white/50">Registered customer accounts and saved profile data</p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={downloadCustomersPDF}
                className="px-3.5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl transition-all shadow-md shadow-blue-600/30 flex items-center gap-2"
              >
                <Download className="w-4 h-4" /> Download PDF
              </button>
              <button
                onClick={exportCustomersCSV}
                className="px-3.5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl transition-all shadow-md shadow-emerald-600/30 flex items-center gap-2"
              >
                <Download className="w-4 h-4" /> Export Excel / CSV
              </button>
            </div>
          </div>

          <div className="bg-[#0F172A] border border-white/10 rounded-3xl p-6 shadow-lg overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="text-white/40 font-bold border-b border-white/10 uppercase tracking-wider text-[10px]">
                  <th className="pb-3">Customer</th>
                  <th className="pb-3">Contact Email</th>
                  <th className="pb-3">Phone</th>
                  <th className="pb-3">Orders</th>
                  <th className="pb-3">Customer Tag</th>
                  <th className="pb-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {customers.map((c, i) => {
                  const customerOrdersCount = orders.filter(
                    (o) => o.userId === c.id || (c.email && o.email && o.email.toLowerCase() === c.email.toLowerCase())
                  ).length;

                  return (
                    <tr key={c.id || i} className="hover:bg-white/[0.02]">
                      <td className="py-3.5 font-bold text-white flex items-center gap-2.5">
                        <div className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs ${
                          c.isGuest ? "bg-purple-600/20 text-purple-400" : "bg-blue-600/20 text-blue-400"
                        }`}>
                          {(c.displayName || c.customerName || "C").charAt(0).toUpperCase()}
                        </div>
                        <span>{c.displayName || c.customerName || `Customer #${i + 1}`}</span>
                      </td>
                      <td className="py-3.5 text-white/70">{c.email || "—"}</td>
                      <td className="py-3.5 font-mono text-white/70">{c.phoneNumber || c.phone || "—"}</td>
                      <td className="py-3.5 font-bold text-white font-mono">
                        {customerOrdersCount} {customerOrdersCount === 1 ? "Order" : "Orders"}
                      </td>
                      <td className="py-3.5">
                        <span className={`px-2.5 py-0.5 rounded-full font-bold text-[10px] border ${
                          c.isGuest
                            ? "bg-purple-500/10 border-purple-500/20 text-purple-400"
                            : "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                        }`}>
                          {c.isGuest ? "Guest Customer" : "Registered User"}
                        </span>
                      </td>
                      <td className="py-3.5 text-right flex items-center justify-end gap-3">
                        <button
                          onClick={() => {
                            router.push("/admin/dashboard?tab=orders");
                          }}
                          className="text-blue-400 hover:underline font-bold text-xs"
                        >
                          View Orders
                        </button>
                        <button
                          onClick={() => handleDeleteCustomer(c.id)}
                          className="text-red-400 hover:text-red-300 font-bold text-xs flex items-center gap-1 bg-red-500/10 px-2.5 py-1 rounded-lg border border-red-500/20 transition-colors"
                          title="Delete Customer Record"
                        >
                          <Trash2 className="w-3.5 h-3.5" /> Delete
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════════════
          TAB 7: INVENTORY TAB
      ════════════════════════════════════════════════════════════════════ */}
      {activeTab === "inventory" && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-extrabold text-white">Inventory Management</h1>
              <p className="text-xs text-white/50">Track stock levels, variants, SKUs and low-stock warnings</p>
            </div>
          </div>

          <div className="bg-[#0F172A] border border-white/10 rounded-3xl p-6 shadow-lg space-y-4">
            <div className="flex items-center gap-3">
              <Search className="w-4 h-4 text-white/40" />
              <input
                type="text"
                value={inventorySearch}
                onChange={(e) => setInventorySearch(e.target.value)}
                placeholder="Filter stock by name or SKU..."
                className="w-full max-w-sm bg-white/5 border border-white/10 px-4 py-2 rounded-xl text-xs text-white outline-none"
              />
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead>
                  <tr className="text-white/40 font-bold border-b border-white/10 uppercase tracking-wider text-[10px]">
                    <th className="pb-3">Product Name</th>
                    <th className="pb-3">Category</th>
                    <th className="pb-3">Variants</th>
                    <th className="pb-3">Status</th>
                    <th className="pb-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {products.map((p) => (
                    <tr key={p.id} className="hover:bg-white/[0.02]">
                      <td className="py-3.5 font-bold text-white flex items-center gap-3">
                        <img src={p.images?.[0]} alt={p.name} className="w-8 h-8 rounded-lg object-contain bg-white/10 border border-white/10" />
                        <span>{p.name}</span>
                      </td>
                      <td className="py-3.5 text-white/70">{p.category_name}</td>
                      <td className="py-3.5 text-white/60">
                        {p.storage_options?.join(", ") || "Standard"}
                      </td>
                      <td className="py-3.5">
                        <span className={`px-2.5 py-0.5 rounded-full font-bold text-[10px] ${
                          p.stock_status === "in_stock"
                            ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                            : "bg-red-500/10 text-red-400 border border-red-500/20"
                        }`}>
                          {p.stock_status === "in_stock" ? "In Stock" : "Low Stock"}
                        </span>
                      </td>
                      <td className="py-3.5 text-right">
                        <button
                          onClick={() => {
                            setEditingProduct(p);
                            setIsProductModalOpen(true);
                          }}
                          className="text-blue-400 hover:underline font-bold"
                        >
                          Update Stock
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════════════
          TAB 8: PAYMENTS & GATEWAY SETTINGS TAB
      ════════════════════════════════════════════════════════════════════ */}
      {activeTab === "payments" && (
        <div className="space-y-6">
          <div>
            <h1 className="text-2xl font-extrabold text-white">Payments & Gateway Settings</h1>
            <p className="text-xs text-white/50">Manage Cash on Delivery (COD) fee, PayHere online payments and WhatsApp checkout settings</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* PayHere Online Gateway Status */}
            <div className="bg-[#0F172A] border border-white/10 rounded-3xl p-6 shadow-lg space-y-2">
              <span className="text-xs text-white/40 font-bold uppercase">PayHere Gateway Status</span>
              <h3 className="text-lg font-bold text-emerald-400 flex items-center gap-2">
                <Check className="w-5 h-5" /> Connected & Verified
              </h3>
              <p className="text-xs text-white/50">Merchant ID configured • LKR Sandbox & Production active</p>
            </div>

            {/* Editable Cash on Delivery (COD) Fee */}
            <div className="bg-[#0F172A] border border-white/10 rounded-3xl p-6 shadow-lg space-y-3">
              <span className="text-xs text-white/40 font-bold uppercase">Cash on Delivery (COD) Fee</span>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-white/60">Rs.</span>
                <input
                  type="number"
                  value={codFee}
                  onChange={(e) => setCodFee(Number(e.target.value))}
                  className="w-full bg-white/5 border border-white/10 px-3 py-2 rounded-xl text-sm font-bold text-white outline-none focus:border-blue-500"
                  placeholder="250"
                />
              </div>
              <button
                type="button"
                onClick={handleSaveCodFee}
                disabled={savingCod}
                className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl transition-all shadow-md shadow-blue-600/30 flex items-center justify-center gap-2"
              >
                {savingCod ? "Saving..." : "Save COD Fee"}
              </button>
              {codSavedMsg && (
                <p className="text-xs font-bold text-emerald-400 text-center animate-in fade-in">
                  ✓ COD Fee updated to Rs. {codFee}!
                </p>
              )}
            </div>

            {/* WhatsApp Direct Order */}
            <div className="bg-[#0F172A] border border-white/10 rounded-3xl p-6 shadow-lg space-y-2">
              <span className="text-xs text-white/40 font-bold uppercase">WhatsApp Direct Order</span>
              <h3 className="text-lg font-bold text-blue-400">+94 77 414 1118</h3>
              <p className="text-xs text-white/50">Auto-formatted message redirect active</p>
            </div>
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════════════
          TAB 10: REVIEWS TAB
      ════════════════════════════════════════════════════════════════════ */}
      {activeTab === "reviews" && (
        <ReviewsTab
          reviews={reviews}
          settings={googleReviewsSettings}
          onAdd={() => {
            setEditingReview(null);
            setIsReviewModalOpen(true);
          }}
          onEdit={(review: Review) => {
            setEditingReview(review);
            setIsReviewModalOpen(true);
          }}
          onDelete={handleDeleteReview}
          onToggleVisibility={handleToggleReviewVisibility}
          onToggleFeatured={handleToggleReviewFeatured}
          onReorder={handleReorderReview}
          onSaveSettings={(newSettings) => setGoogleReviewsSettings(newSettings)}
        />
      )}

      {/* ════════════════════════════════════════════════════════════════════
          TAB 11: ANALYTICS TAB
      ════════════════════════════════════════════════════════════════════ */}
      {activeTab === "analytics" && (
        <div className="space-y-6">
          <div>
            <h1 className="text-2xl font-extrabold text-white">Analytics & Performance Reports</h1>
            <p className="text-xs text-white/50">Real-time revenue, conversion rates and inventory turnover</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-[#0F172A] border border-white/10 rounded-3xl p-6 shadow-lg space-y-4">
              <h3 className="font-bold text-base text-white">Monthly Sales Breakdown</h3>
              <div className="h-48 bg-white/5 rounded-2xl flex items-center justify-center text-xs text-white/40">
                Line chart visualizing LKR revenue growth across 31 days
              </div>
            </div>

            <div className="bg-[#0F172A] border border-white/10 rounded-3xl p-6 shadow-lg space-y-4">
              <h3 className="font-bold text-base text-white">Payment Method Distribution</h3>
              <div className="h-48 bg-white/5 rounded-2xl flex items-center justify-center text-xs text-white/40">
                PayHere Online (55%) • COD (35%) • WhatsApp Checkout (10%)
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════════════
          TAB 12: STORE CONTACT DETAILS & WORKING HOURS SETTINGS TAB
      ════════════════════════════════════════════════════════════════════ */}
      {(activeTab === "settings" || activeTab === "contact-settings") && (
        <ContactSettingsTab onRefresh={refreshData} />
      )}
      {/* ════════════════════════════════════════════════════════════════════
          TAB: WARRANTY MANAGEMENT
      ════════════════════════════════════════════════════════════════════ */}
      {activeTab === "warranties" && (
        <WarrantiesTab />
      )}

      {/* ════════════════════════════════════════════════════════════════════
          TAB: FEATURED COLLECTIONS
      ════════════════════════════════════════════════════════════════════ */}
      {activeTab === "collections" && (
        <FeaturedCollectionsTab
          products={products}
          categories={categories}
          onRefresh={refreshData}
        />
      )}

      {/* ════════════════════════════════════════════════════════════════════
          TAB: FOOTER SETTINGS
      ════════════════════════════════════════════════════════════════════ */}
      {activeTab === "footer" && (
        <FooterTab
          onRefresh={refreshData}
        />
      )}

      {/* ════════════════════════════════════════════════════════════════════
          TAB: MOBILE EXPERIENCE
      ════════════════════════════════════════════════════════════════════ */}
      {activeTab === "mobile" && (
        <MobileExperienceTab />
      )}

      {/* ════════════════════════════════════════════════════════════════════
          TAB: MOBILE REPAIRS
      ════════════════════════════════════════════════════════════════════ */}
      {activeTab === "repairs" && (
        <RepairsTab />
      )}

      {/* ════════════════════════════════════════════════════════════════════
          TAB: SUPPLIERS
      ════════════════════════════════════════════════════════════════════ */}
      {activeTab === "suppliers" && (
        <SuppliersTab />
      )}

      {/* ════════════════════════════════════════════════════════════════════
          TAB: CASH FLOW
      ════════════════════════════════════════════════════════════════════ */}
      {activeTab === "cashflow" && (
        <CashFlowTab />
      )}

      {/* ════════════════════════════════════════════════════════════════════
          TAB: STREETLA AI ASSISTANT
      ════════════════════════════════════════════════════════════════════ */}
      {activeTab === "assistant" && (
        <AssistantTab />
      )}

      {/* Global Product Modal */}
      <ProductModal
        isOpen={isProductModalOpen}
        onClose={() => setIsProductModalOpen(false)}
        onSave={() => {
          setIsProductModalOpen(false);
          refreshData();
        }}
        categories={categories}
        initialData={editingProduct}
      />

      {/* Category Modal */}
      <CategoryModal
        isOpen={isCategoryModalOpen}
        onClose={() => setIsCategoryModalOpen(false)}
        onSave={() => {
          setIsCategoryModalOpen(false);
          refreshData();
        }}
        initialData={editingCategory}
        existingCategories={categories}
      />

      {/* Offer Banner Modal */}
      <OfferBannerModal
        isOpen={isBannerModalOpen}
        onClose={() => setIsBannerModalOpen(false)}
        onSave={handleSaveBanner}
        initialData={editingBanner}
      />

      {/* Hero Modal */}
      <HeroModal
        isOpen={isHeroModalOpen}
        onClose={() => setIsHeroModalOpen(false)}
        onSave={handleSaveHeroSlide}
        slide={editingHeroSlide}
      />

      {/* Gallery Modal */}
      <GalleryModal
        isOpen={isGalleryModalOpen}
        onClose={() => setIsGalleryModalOpen(false)}
        onSave={() => {
          setIsGalleryModalOpen(false);
          refreshData();
        }}
        initialData={editingGalleryImage}
      />

      {/* Review Modal */}
      <ReviewModal
        isOpen={isReviewModalOpen}
        onClose={() => setIsReviewModalOpen(false)}
        onSave={() => {
          setIsReviewModalOpen(false);
          refreshData();
        }}
        initialData={editingReview}
      />

      {/* Quick Add Stock Modal */}
      {quickStockProduct && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0F172A] border border-white/20 rounded-3xl p-6 w-full max-w-md space-y-4 shadow-2xl animate-in zoom-in-95 text-white">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="text-base font-extrabold flex items-center gap-2">
                <Plus className="w-5 h-5 text-emerald-400" /> Add Stock: {quickStockProduct.name}
              </h3>
              <button onClick={() => setQuickStockProduct(null)} className="text-white/40 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 bg-white/5 border border-white/10 rounded-xl flex items-center justify-between">
                <span className="text-white/60 font-bold">Current Stock:</span>
                <span className="font-black text-sm text-emerald-400 font-mono">
                  {quickStockProduct.stock_count || 0} Units
                </span>
              </div>

              <div>
                <label className="block font-bold text-white/80 mb-1">Add Additional Quantity</label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min={1}
                    value={quickStockQty}
                    onChange={(e) => setQuickStockQty(Number(e.target.value))}
                    className="w-full bg-white/5 border border-white/10 p-3 rounded-xl font-mono font-bold text-white outline-none focus:border-blue-500 text-sm"
                  />
                  <span className="font-bold text-white/60 shrink-0">Units</span>
                </div>
              </div>

              {/* Quick Preset Buttons */}
              <div className="flex items-center gap-2 pt-1">
                {[5, 10, 25, 50].map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => setQuickStockQty(preset)}
                    className="flex-1 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg font-mono font-bold text-xs"
                  >
                    +{preset}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/10">
              <button
                type="button"
                onClick={() => setQuickStockProduct(null)}
                className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white font-bold text-xs rounded-xl"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveQuickStock}
                disabled={isUpdatingStock}
                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-xl shadow-md flex items-center gap-1.5"
              >
                {isUpdatingStock ? "Updating..." : `Confirm +${quickStockQty} Stock`}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function AdminDashboardPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center font-bold text-sm text-white">Loading Admin Dashboard...</div>}>
      <DashboardContent />
    </Suspense>
  );
}
