import { db } from "./firebase";
import { collection, getDocs, doc, getDoc, query, where, orderBy, limit, addDoc, updateDoc, deleteDoc } from "firebase/firestore";
import { Product, Category, Review, Banner, SiteSettings, GalleryImage } from "./types";

export async function getProducts(): Promise<Product[]> {
  const q = query(collection(db, "products"));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as Product));
}

export async function getCategories(): Promise<Category[]> {
  const q = query(collection(db, "categories"));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as Category));
}

export async function getReviews(): Promise<Review[]> {
  const q = query(collection(db, "reviews"));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as Review));
}

export async function getBanners(): Promise<Banner[]> {
  const q = query(collection(db, "banners"));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as Banner));
}

export async function getGalleryImages(): Promise<any[]> {
  const q = query(collection(db, "gallery"));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }));
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  const q = query(collection(db, "products"), where("slug", "==", slug), limit(1));
  const snapshot = await getDocs(q);
  if (snapshot.empty) return null;
  return snapshot.docs[0].data() as Product;
}

export async function getCategoryBySlug(slug: string): Promise<Category | null> {
  const q = query(collection(db, "categories"), where("slug", "==", slug), limit(1));
  const snapshot = await getDocs(q);
  if (snapshot.empty) return null;
  return snapshot.docs[0].data() as Category;
}

// We haven't migrated siteSettings to Firestore yet, so we will still export the local one for now.
export { siteSettings } from "./data";
