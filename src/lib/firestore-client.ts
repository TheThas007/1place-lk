import { db } from "./firebase";
import { collection, getDocs, doc, getDoc, query, where, limit } from "firebase/firestore";
import { Product, Category, Review, Banner, GalleryImage, HeroSlide, ProductBanner, UiSettings, OfferBanner, Brand, TickerSettings, GoogleReviewsSettings } from "./types";
import { products as fallbackProducts, categories as fallbackCategories, reviews as fallbackReviews, fallbackOfferBanners, siteSettings, DEFAULT_BRANDS } from "./data";
import { cache } from "react";

export const getProductBanners = cache(async (): Promise<ProductBanner[]> => {
  try {
    const q = query(collection(db, "product_banners"));
    const snapshot = await getDocs(q);
    const banners = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as ProductBanner));
    return banners.filter(b => b.active !== false).sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0));
  } catch (e) {
    console.warn("Offline/Error fetching product banners:", e);
    return [];
  }
});

export const getProducts = cache(async (): Promise<Product[]> => {
  try {
    const q = query(collection(db, "products"));
    const snapshot = await getDocs(q);
    const docs = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as Product));
    if (docs.length > 0) return docs;
  } catch (e) {
    console.warn("Offline/Error fetching products, returning fallbacks:", e);
  }
  return fallbackProducts;
});

import { KNOWN_BRAND_NAMES } from "./migration-audit";

export const getCategories = cache(async (): Promise<Category[]> => {
  const catMap = new Map<string, Category>();

  // Initialize with fallback categories
  fallbackCategories.forEach((c) => {
    catMap.set(c.id || c.slug, c);
  });

  try {
    const q = query(collection(db, "categories"));
    const snapshot = await getDocs(q);
    snapshot.docs.forEach((d) => {
      const data = d.data() as Category;
      const id = d.id;
      const key = id || data.slug || data.name;
      const existing = catMap.get(key) || catMap.get(id);
      catMap.set(key, { ...existing, ...data, id });
    });
  } catch (e) {
    console.warn("Offline/Error fetching categories:", e);
  }

  const docs = Array.from(catMap.values());
  const cleanDocs = docs.filter((c) => {
    const cName = (c.name || "").toLowerCase();
    const cSlug = (c.slug || "").toLowerCase();
    return !KNOWN_BRAND_NAMES.some((b) => b.toLowerCase() === cName || b.toLowerCase() === cSlug);
  });

  return cleanDocs.sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0));
});

export const getBrands = cache(async (): Promise<Brand[]> => {
  const brandMap = new Map<string, Brand>();

  // Initialize with default brands
  DEFAULT_BRANDS.forEach((b) => {
    brandMap.set(b.id, b);
  });

  try {
    const q = query(collection(db, "brands"));
    const snapshot = await getDocs(q);
    snapshot.docs.forEach((d) => {
      const data = d.data() as Brand;
      const id = d.id;
      const existing = brandMap.get(id) || brandMap.get(data.id);
      brandMap.set(id, { ...existing, ...data, id });
    });
  } catch (e) {
    console.warn("Offline/Error fetching brands:", e);
  }

  const result = Array.from(brandMap.values());
  return result.sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0));
});

export const DEFAULT_GOOGLE_REVIEWS_SETTINGS: GoogleReviewsSettings = {
  overall_rating: 4.9,
  total_reviews_count: 250,
  write_review_url: "https://www.google.com/maps/place/Street+Mobile+Vavuniya/@8.7514,80.4971,17z/",
  view_all_reviews_url: "https://www.google.com/maps/place/Street+Mobile+Vavuniya/@8.7514,80.4971,17z/",
};

export const getGoogleReviewsSettings = cache(async (): Promise<GoogleReviewsSettings> => {
  try {
    const docRef = doc(db, "settings", "google_reviews");
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return { ...DEFAULT_GOOGLE_REVIEWS_SETTINGS, ...docSnap.data() } as GoogleReviewsSettings;
    }
  } catch (e) {
    console.warn("Offline/Error fetching google reviews settings:", e);
  }
  return DEFAULT_GOOGLE_REVIEWS_SETTINGS;
});

export const getReviews = cache(async (): Promise<Review[]> => {
  try {
    const q = query(collection(db, "reviews"));
    const snapshot = await getDocs(q);
    const docs = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as Review));
    if (docs.length > 0) {
      return docs.sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0));
    }
  } catch (e) {
    console.warn("Offline/Error fetching reviews, returning fallbacks:", e);
  }
  return fallbackReviews;
});

export const getBanners = cache(async (): Promise<Banner[]> => {
  try {
    const q = query(collection(db, "banners"));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as Banner));
  } catch (e) {
    console.warn("Offline/Error fetching banners:", e);
    return [];
  }
});

export const getOfferBanners = cache(async (placement?: string): Promise<OfferBanner[]> => {
  try {
    const q = query(collection(db, "offer_banners"));
    const snapshot = await getDocs(q);
    let docs = snapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        ...data,
        id: doc.id,
        status: data.status || "active",
        placement: data.placement || "homepage_after_categories",
        contentMode: data.contentMode || "image_only",
      } as OfferBanner;
    });

    if (docs.length === 0) {
      docs = fallbackOfferBanners;
    }
    const now = new Date();
    
    const activeBanners = docs.filter((b) => {
      const status = b.status || "active";
      if (status === "archived" || status === "draft" || status === "paused") return false;
      if (placement && b.placement !== placement) return false;
      
      // Schedule check
      if (b.startAt && new Date(b.startAt) > now) return false;
      if (!b.noExpiry && b.endAt && new Date(b.endAt) < now) return false;
      
      return true;
    }).sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0));

    if (activeBanners.length === 0 && placement) {
      return fallbackOfferBanners.filter((b) => b.placement === placement && b.status === "active");
    }

    return activeBanners;
  } catch (e) {
    console.warn("Offline/Error fetching offer banners, returning fallbacks:", e);
    return placement ? fallbackOfferBanners.filter((b) => b.placement === placement) : fallbackOfferBanners;
  }
});

export const getHeroSlides = cache(async (): Promise<HeroSlide[]> => {
  try {
    const q = query(collection(db, "hero_slides"));
    const snapshot = await getDocs(q);
    const slides = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as HeroSlide));
    return slides.sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0));
  } catch (e) {
    console.warn("Offline/Error fetching hero slides:", e);
    return [];
  }
});

export const getGalleryImages = cache(async (): Promise<any[]> => {
  try {
    const q = query(collection(db, "gallery"));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }));
  } catch (e) {
    console.warn("Offline/Error fetching gallery images:", e);
    return [];
  }
});

export const getProductBySlug = cache(async (slug: string): Promise<Product | null> => {
  try {
    const q = query(collection(db, "products"), where("slug", "==", slug), limit(1));
    const snapshot = await getDocs(q);
    if (!snapshot.empty) return snapshot.docs[0].data() as Product;
  } catch (e) {
    console.warn("Offline/Error fetching product by slug:", e);
  }
  return fallbackProducts.find(p => p.slug === slug) || null;
});

export const getCategoryBySlug = cache(async (slug: string): Promise<Category | null> => {
  try {
    const q = query(collection(db, "categories"), where("slug", "==", slug), limit(1));
    const snapshot = await getDocs(q);
    if (!snapshot.empty) return snapshot.docs[0].data() as Category;
  } catch (e) {
    console.warn("Offline/Error fetching category by slug:", e);
  }
  return fallbackCategories.find(c => c.slug === slug) || null;
});

export { siteSettings } from "./data";

export const getUiSettings = cache(async (): Promise<UiSettings> => {
  try {
    const docRef = doc(db, "settings", "ui");
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return docSnap.data() as UiSettings;
    }
  } catch {
    // Return empty fallback silently when offline or reconnecting
  }
  return {};
});

const DEFAULT_TICKER: TickerSettings = {
  enabled: true,
  messages: [
    { id: "t1", text: "Genuine Products with Warranty", icon: "ShieldCheck", active: true, sort_order: 0 },
    { id: "t2", text: "Islandwide Delivery Available", icon: "Truck", active: true, sort_order: 1 },
    { id: "t3", text: "Secure Online Payments", icon: "Lock", active: true, sort_order: 2 },
    { id: "t4", text: "Visit Street Mobile — Vavuniya", icon: "MapPin", active: true, sort_order: 3 },
    { id: "t5", text: "Latest Smartphones & Accessories", icon: "Smartphone", active: true, sort_order: 4 },
  ],
  text_color: "#FFFFFF",
  bg_color: "#000000",
  speed: "normal",
  direction: "rtl",
  pause_on_hover: true,
};

export const getTickerSettings = cache(async (): Promise<TickerSettings> => {
  try {
    const docRef = doc(db, "settings", "ticker");
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return { ...DEFAULT_TICKER, ...docSnap.data() } as TickerSettings;
    }
  } catch {
    // Silent fallback
  }
  return DEFAULT_TICKER;
});
