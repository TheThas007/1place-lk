import { db } from "./firebase";
import { collection, getDocs, doc, getDoc, query, where, limit } from "firebase/firestore";
import { Product, Category, Review, Banner, GalleryImage, HeroSlide, ProductBanner, UiSettings, OfferBanner, Brand } from "./types";
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
  try {
    const q = query(collection(db, "categories"));
    const snapshot = await getDocs(q);
    const docs = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as Category));
    if (docs.length > 0) {
      const cleanDocs = docs.filter(c => {
        const cName = (c.name || "").toLowerCase();
        const cSlug = (c.slug || "").toLowerCase();
        return !KNOWN_BRAND_NAMES.some(b => b.toLowerCase() === cName || b.toLowerCase() === cSlug);
      });
      if (cleanDocs.length > 0) return cleanDocs;
    }
  } catch (e) {
    console.warn("Offline/Error fetching categories, returning fallbacks:", e);
  }
  return fallbackCategories;
});

export const getBrands = cache(async (): Promise<Brand[]> => {
  try {
    const q = query(collection(db, "brands"));
    const snapshot = await getDocs(q);
    const docs = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as Brand));
    if (docs.length > 0) return docs.sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0));
  } catch (e) {
    console.warn("Offline/Error fetching brands, returning fallbacks:", e);
  }
  return DEFAULT_BRANDS;
});

export const getReviews = cache(async (): Promise<Review[]> => {
  try {
    const q = query(collection(db, "reviews"));
    const snapshot = await getDocs(q);
    const docs = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as Review));
    if (docs.length > 0) return docs;
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
