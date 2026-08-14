import { db } from "./firebase";
import { collection, getDocs, doc, setDoc, deleteDoc } from "firebase/firestore";
import { Brand } from "./types";
import { DEFAULT_BRANDS } from "./data";

export async function getBrandsFromDb(): Promise<Brand[]> {
  const brandMap = new Map<string, Brand>();

  // 1. Initialize with default brands
  DEFAULT_BRANDS.forEach((b) => {
    brandMap.set(b.id, b);
  });

  // 2. Overwrite / merge with custom brands saved in Firestore
  try {
    const snapshot = await getDocs(collection(db, "brands"));
    snapshot.docs.forEach((d) => {
      const data = d.data() as Brand;
      const id = d.id || `brand-${(data.name || "").toLowerCase().replace(/[^a-z0-9]+/g, "-")}`;
      const existing = brandMap.get(id) || brandMap.get(data.id);
      brandMap.set(id, { ...existing, ...data, id });
    });
  } catch (err) {
    console.warn("Error fetching brands from Firestore, using defaults:", err);
  }

  const result = Array.from(brandMap.values());
  return result.sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0));
}

export async function saveBrandToDb(brand: Partial<Brand>): Promise<void> {
  const id = brand.id || `brand-${(brand.name || "brand").toLowerCase().replace(/[^a-z0-9]+/g, "-")}`;
  const docRef = doc(db, "brands", id);
  await setDoc(
    docRef,
    {
      ...brand,
      id,
      slug: brand.slug || (brand.name || "").toLowerCase().replace(/[^a-z0-9]+/g, "-"),
      updated_at: new Date().toISOString(),
    },
    { merge: true }
  );
}

export async function deleteBrandFromDb(id: string): Promise<void> {
  try {
    await deleteDoc(doc(db, "brands", id));
  } catch (e) {
    console.warn("Error deleting brand from Firestore:", e);
  }
}
