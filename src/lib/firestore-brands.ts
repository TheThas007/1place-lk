import { db } from "./firebase";
import { collection, getDocs, doc, setDoc, deleteDoc, query, orderBy } from "firebase/firestore";
import { Brand } from "./types";
import { DEFAULT_BRANDS } from "./data";

export async function getBrandsFromDb(): Promise<Brand[]> {
  try {
    const q = query(collection(db, "brands"), orderBy("sort_order", "asc"));
    const snapshot = await getDocs(q);
    const docs = snapshot.docs.map(d => ({ ...d.data(), id: d.id } as Brand));
    if (docs.length > 0) return docs;
  } catch (err) {
    console.warn("Error fetching brands from Firestore, using defaults:", err);
  }
  return DEFAULT_BRANDS;
}

export async function saveBrandToDb(brand: Partial<Brand>): Promise<void> {
  const id = brand.id || `brand-${(brand.name || "brand").toLowerCase().replace(/[^a-z0-9]+/g, "-")}`;
  const docRef = doc(db, "brands", id);
  await setDoc(docRef, {
    ...brand,
    id,
    slug: brand.slug || (brand.name || "").toLowerCase().replace(/[^a-z0-9]+/g, "-"),
    updated_at: new Date().toISOString(),
  }, { merge: true });
}

export async function deleteBrandFromDb(id: string): Promise<void> {
  await deleteDoc(doc(db, "brands", id));
}
