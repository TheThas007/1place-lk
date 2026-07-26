import { db } from "./firebase";
import { collection, getDocs, doc, getDoc, query, where, limit } from "firebase/firestore";
import { Product, Category, Review, Banner, GalleryImage, HeroSlide, ProductBanner, UiSettings, OfferBanner } from "./types";
import { products as fallbackProducts, categories as fallbackCategories, reviews as fallbackReviews, siteSettings } from "./data";

export async function getProductBanners(): Promise<ProductBanner[]> {
  try {
    const q = query(collection(db, "product_banners"));
    const snapshot = await getDocs(q);
    const banners = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as ProductBanner));
    return banners.filter(b => b.active !== false).sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0));
  } catch (e) {
    console.warn("Offline/Error fetching product banners:", e);
    return [];
  }
}

export async function getProducts(): Promise<Product[]> {
  try {
    const q = query(collection(db, "products"));
    const snapshot = await getDocs(q);
    const docs = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as Product));
    if (docs.length > 0) return docs;
  } catch (e) {
    console.warn("Offline/Error fetching products, returning fallbacks:", e);
  }
  return fallbackProducts;
}

export async function getCategories(): Promise<Category[]> {
  try {
    const q = query(collection(db, "categories"));
    const snapshot = await getDocs(q);
    const docs = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as Category));
    if (docs.length > 0) return docs;
  } catch (e) {
    console.warn("Offline/Error fetching categories, returning fallbacks:", e);
  }
  return fallbackCategories;
}

export async function getReviews(): Promise<Review[]> {
  try {
    const q = query(collection(db, "reviews"));
    const snapshot = await getDocs(q);
    const docs = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as Review));
    if (docs.length > 0) return docs;
  } catch (e) {
    console.warn("Offline/Error fetching reviews, returning fallbacks:", e);
  }
  return fallbackReviews;
}

export async function getBanners(): Promise<Banner[]> {
  try {
    const q = query(collection(db, "banners"));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as Banner));
  } catch (e) {
    console.warn("Offline/Error fetching banners:", e);
    return [];
  }
}

export async function getOfferBanners(placement?: string): Promise<OfferBanner[]> {
  try {
    const q = query(collection(db, "offer_banners"));
    const snapshot = await getDocs(q);
    const docs = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as OfferBanner));
    const now = new Date();
    
    return docs.filter(b => {
      if (b.status === "archived" || b.status === "draft" || b.status === "paused") return false;
      if (placement && b.placement !== placement) return false;
      
      // Schedule check
      if (b.startAt && new Date(b.startAt) > now) return false;
      if (!b.noExpiry && b.endAt && new Date(b.endAt) < now) return false;
      
      return true;
    }).sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0));
  } catch (e) {
    console.warn("Offline/Error fetching offer banners:", e);
    return [];
  }
}

export async function getHeroSlides(): Promise<HeroSlide[]> {
  try {
    const q = query(collection(db, "hero_slides"));
    const snapshot = await getDocs(q);
    const slides = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as HeroSlide));
    return slides.sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0));
  } catch (e) {
    console.warn("Offline/Error fetching hero slides:", e);
    return [];
  }
}

export async function getGalleryImages(): Promise<any[]> {
  try {
    const q = query(collection(db, "gallery"));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }));
  } catch (e) {
    console.warn("Offline/Error fetching gallery images:", e);
    return [];
  }
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  try {
    const q = query(collection(db, "products"), where("slug", "==", slug), limit(1));
    const snapshot = await getDocs(q);
    if (!snapshot.empty) return snapshot.docs[0].data() as Product;
  } catch (e) {
    console.warn("Offline/Error fetching product by slug:", e);
  }
  return fallbackProducts.find(p => p.slug === slug) || null;
}

export async function getCategoryBySlug(slug: string): Promise<Category | null> {
  try {
    const q = query(collection(db, "categories"), where("slug", "==", slug), limit(1));
    const snapshot = await getDocs(q);
    if (!snapshot.empty) return snapshot.docs[0].data() as Category;
  } catch (e) {
    console.warn("Offline/Error fetching category by slug:", e);
  }
  return fallbackCategories.find(c => c.slug === slug) || null;
}

export { siteSettings } from "./data";

export async function getUiSettings(): Promise<UiSettings> {
  try {
    const docRef = doc(db, "settings", "ui");
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return docSnap.data() as UiSettings;
    }
  } catch (e) {
    console.warn("Offline/Error fetching UI settings:", e);
  }
  return {};
}
