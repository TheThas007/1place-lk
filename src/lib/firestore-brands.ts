import { db } from "./firebase";
import { collection, getDocs, doc, setDoc, getDoc, deleteDoc, query, where } from "firebase/firestore";
import { Brand, Department, DepartmentBrandPageConfig, DepartmentBrandCategoryTab, Product } from "./types";
import { DEFAULT_BRANDS } from "./data";

// ── Initial Primary Departments ──
export const DEFAULT_DEPARTMENTS: Department[] = [
  { id: "dept-phones", name: "Phones", slug: "phones", enabled: true, order: 1, description: "Smartphones, feature phones, and mobile devices" },
  { id: "dept-laptops-tablets", name: "Laptop & Tab", slug: "laptops-tablets", enabled: true, order: 2, description: "Laptops, MacBooks, tablets, and iPads" },
  { id: "dept-accessories", name: "Accessories", slug: "accessories", enabled: true, order: 3, description: "Audio, chargers, cables, smart watches, power banks, and protection" },
];

// Helper to determine initial department assignments for default brands
export function getDefaultBrandDepartments(slug: string, productGroup?: string): string[] {
  const s = slug.toLowerCase();
  if (s === "apple") return ["phones", "laptops-tablets", "accessories"];
  if (s === "samsung") return ["phones", "laptops-tablets", "accessories"];
  if (s === "xiaomi" || s === "redmi") return ["phones", "accessories"];
  if (s === "google" || s === "google-pixel") return ["phones", "accessories"];
  if (s === "macbook" || s === "asus" || s === "msi" || s === "dell" || s === "lenovo") return ["laptops-tablets"];
  if (["jbl", "sharge", "marshall", "sony", "fitbit", "anker", "bose", "haylou", "soundcore", "ugreen", "baseus", "dji", "wiwu", "lenyes", "oraimo", "hoco", "joyroom"].includes(s)) {
    return ["accessories"];
  }
  if (productGroup === "laptops") return ["laptops-tablets"];
  if (productGroup === "accessories" || productGroup === "audio" || productGroup === "other") return ["accessories"];
  return ["phones"];
}

// ── 1. Departments Firestore API ──
export async function getDepartmentsFromDb(): Promise<Department[]> {
  const deptMap = new Map<string, Department>();
  DEFAULT_DEPARTMENTS.forEach((d) => deptMap.set(d.slug, d));

  try {
    const snap = await getDocs(collection(db, "departments"));
    snap.docs.forEach((d) => {
      const data = d.data() as Department;
      const slug = data.slug || d.id;
      deptMap.set(slug, { ...data, id: d.id, slug });
    });
  } catch (err) {
    console.warn("Error fetching departments from Firestore, using defaults:", err);
  }

  return Array.from(deptMap.values()).sort((a, b) => (a.order || 0) - (b.order || 0));
}

export async function saveDepartmentToDb(dept: Partial<Department>): Promise<void> {
  const slug = (dept.slug || dept.name || "department").toLowerCase().replace(/[^a-z0-9]+/g, "-");
  const id = dept.id || `dept-${slug}`;
  const docRef = doc(db, "departments", id);
  await setDoc(
    docRef,
    {
      ...dept,
      id,
      slug,
      enabled: dept.enabled !== false,
      order: dept.order || 1,
    },
    { merge: true }
  );
}

// ── 2. Brands Firestore API ──
export async function getBrandsFromDb(): Promise<Brand[]> {
  const brandMap = new Map<string, Brand>();

  // 1. Initialize with default brands with initial departments
  DEFAULT_BRANDS.forEach((b) => {
    const assigned_departments = getDefaultBrandDepartments(b.slug, b.product_group);
    brandMap.set(b.id, {
      ...b,
      assigned_departments,
      enabled: b.status !== "inactive",
    });
  });

  // 2. Overwrite / merge with custom brands saved in Firestore
  try {
    const snapshot = await getDocs(collection(db, "brands"));
    snapshot.docs.forEach((d) => {
      const data = d.data() as Brand;
      const id = d.id || `brand-${(data.name || "").toLowerCase().replace(/[^a-z0-9]+/g, "-")}`;
      const existing = brandMap.get(id) || brandMap.get(data.id);
      const slug = data.slug || (data.name || "").toLowerCase().replace(/[^a-z0-9]+/g, "-");
      const assigned_departments =
        data.assigned_departments && data.assigned_departments.length > 0
          ? data.assigned_departments
          : existing?.assigned_departments || getDefaultBrandDepartments(slug, data.product_group);

      brandMap.set(id, {
        ...existing,
        ...data,
        id,
        slug,
        assigned_departments,
        enabled: data.enabled !== false && data.status !== "inactive",
      });
    });
  } catch (err) {
    console.warn("Error fetching brands from Firestore, using defaults:", err);
  }

  const result = Array.from(brandMap.values());
  return result.sort((a, b) => (a.sort_order || a.order || 0) - (b.sort_order || b.order || 0));
}

export async function saveBrandToDb(brand: Partial<Brand>): Promise<void> {
  const slug = (brand.slug || brand.name || "brand").toLowerCase().replace(/[^a-z0-9]+/g, "-");
  const id = brand.id || `brand-${slug}`;
  const docRef = doc(db, "brands", id);
  const assigned_departments =
    brand.assigned_departments && brand.assigned_departments.length > 0
      ? brand.assigned_departments
      : getDefaultBrandDepartments(slug, brand.product_group);

  await setDoc(
    docRef,
    {
      ...brand,
      id,
      slug,
      assigned_departments,
      enabled: brand.enabled !== false && brand.status !== "inactive",
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

// ── 3. Department Brand Page Configs ──
export function generateDefaultDepartmentPageConfig(
  departmentSlug: string,
  brand: Brand
): DepartmentBrandPageConfig {
  const brandName = brand.name || brand.slug.toUpperCase();
  const deptName =
    departmentSlug === "phones"
      ? "Phones"
      : departmentSlug === "laptops-tablets"
      ? "Laptop & Tab"
      : departmentSlug === "accessories"
      ? "Accessories"
      : "Collection";

  // Contextual default headlines
  let heading = `Explore Genuine ${brandName} ${deptName}`;
  let eyebrow = `OFFICIAL ${brandName.toUpperCase()} ${deptName.toUpperCase()}`;
  let description = `Browse 100% authentic ${brandName} products with official warranty, same-day delivery, and competitive prices at Street Mobile.`;
  let primaryCtaLabel = `Shop ${brandName} ${deptName}`;
  let defaultBannerUrl = "";

  if (departmentSlug === "phones" && brand.slug === "apple") {
    eyebrow = "IPHONE 16 SERIES & GENUINE APPLE PHONES";
    heading = "iPhone. Titanium. Built for Greatness.";
    description = "Discover the latest iPhone flagships with official Apple warranty and guaranteed best price in Sri Lanka.";
    primaryCtaLabel = "Explore All iPhones";
    defaultBannerUrl = "https://images.unsplash.com/photo-1695048133142-1a20484d2569?q=80&w=1600&auto=format&fit=crop";
  } else if (departmentSlug === "laptops-tablets" && brand.slug === "apple") {
    eyebrow = "MACBOOK & IPAD COLLECTION";
    heading = "MacBook & iPad. Supercharged by Apple Silicon.";
    description = "Unleash extreme performance with MacBook Air, MacBook Pro, and iPad Pro with genuine Apple care warranty.";
    primaryCtaLabel = "Explore Mac & iPad";
    defaultBannerUrl = "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?q=80&w=1600&auto=format&fit=crop";
  } else if (departmentSlug === "accessories" && brand.slug === "apple") {
    eyebrow = "GENUINE APPLE ACCESSORIES";
    heading = "AirPods, MagSafe & Original Adapters";
    description = "Enhance your Apple ecosystem with authentic fast adapters, MagSafe chargers, and AirPods.";
    primaryCtaLabel = "Shop Apple Accessories";
    defaultBannerUrl = "https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?q=80&w=1600&auto=format&fit=crop";
  } else if (departmentSlug === "phones" && brand.slug === "samsung") {
    eyebrow = "SAMSUNG GALAXY FLAGSHIPS";
    heading = "Galaxy AI. The Next Era of Mobile.";
    description = "Experience industry-leading cameras, Dynamic AMOLED displays, and S-Pen capabilities on Galaxy S25 Series.";
    primaryCtaLabel = "Shop Galaxy Phones";
    defaultBannerUrl = "https://images.unsplash.com/photo-1610945265064-3234eb261763?q=80&w=1600&auto=format&fit=crop";
  }

  // Category navigation tabs
  const categoryTabs: DepartmentBrandCategoryTab[] = [
    { id: "tab-all", enabled: true, label: "All Products", slug: "all", order: 1 },
  ];

  return {
    id: `${departmentSlug}_${brand.slug}`,
    brandId: brand.id,
    brandSlug: brand.slug,
    departmentId: `dept-${departmentSlug}`,
    departmentSlug,
    enabled: true,
    status: "published",
    useDefaultLogo: true,
    logoAlt: `${brandName} Logo`,
    logoWidth: 140,
    useDefaultBanner: false,
    desktopBannerUrl: defaultBannerUrl,
    tabletBannerUrl: defaultBannerUrl,
    mobileBannerUrl: defaultBannerUrl,
    bannerAlt: `${brandName} ${deptName} Promotional Banner`,
    desktopFocalPosition: "center",
    tabletFocalPosition: "center",
    mobileFocalPosition: "center",
    eyebrow,
    heading,
    description,
    primaryCtaEnabled: true,
    primaryCtaLabel,
    primaryCtaUrl: `/shop-by-brand/${departmentSlug}/${brand.slug}`,
    secondaryCtaEnabled: true,
    secondaryCtaLabel: "Contact Store",
    secondaryCtaUrl: "/contact",
    openInNewTab: false,
    horizontalPosition: "left",
    verticalPosition: "center",
    textAlignment: "left",
    mobileLayout: "overlay",
    headingColor: "#FFFFFF",
    descriptionColor: "#E5E5E5",
    eyebrowColor: "#ED0712",
    accentColor: "#ED0712",
    primaryCtaBackground: "#ED0712",
    primaryCtaTextColor: "#FFFFFF",
    secondaryCtaBackground: "rgba(255,255,255,0.15)",
    secondaryCtaTextColor: "#FFFFFF",
    contentBackgroundColor: "#090909",
    contentBackgroundOpacity: 85,
    imageOverlayColor: "#000000",
    imageOverlayOpacity: 35,
    desktopBannerHeight: 480,
    tabletBannerHeight: 400,
    mobileBannerHeight: 420,
    borderRadius: 16,
    categoryTabs,
    hideEmptyTabs: true,
    relatedSectionEnabled: true,
    relatedSectionHeading: "Related & Compatible Gear",
    relatedDisplayMode: "rail",
    noIndex: false,
  };
}

export async function getDepartmentBrandPageConfig(
  departmentSlug: string,
  brandSlug: string
): Promise<DepartmentBrandPageConfig | null> {
  const docId = `${departmentSlug.toLowerCase()}_${brandSlug.toLowerCase()}`;
  try {
    const docRef = doc(db, "department_brand_pages", docId);
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      return snap.data() as DepartmentBrandPageConfig;
    }
  } catch (err) {
    console.warn(`Error reading department_brand_pages doc ${docId}:`, err);
  }

  // Fallback to generated default
  const brands = await getBrandsFromDb();
  const brand = brands.find((b) => b.slug.toLowerCase() === brandSlug.toLowerCase());
  if (brand) {
    return generateDefaultDepartmentPageConfig(departmentSlug, brand);
  }
  return null;
}

export async function saveDepartmentBrandPageConfig(
  config: DepartmentBrandPageConfig
): Promise<void> {
  const docId = `${config.departmentSlug.toLowerCase()}_${config.brandSlug.toLowerCase()}`;
  const docRef = doc(db, "department_brand_pages", docId);
  await setDoc(
    docRef,
    {
      ...config,
      id: docId,
      updatedAt: new Date().toISOString(),
    },
    { merge: true }
  );
}

// ── 4. Brand Products & Audit Helpers ──
export interface BrandAuditItem {
  brand: Brand;
  assignedDepartments: string[];
  productCount: number;
  hasPhones: boolean;
  hasLaptops: boolean;
  hasAccessories: boolean;
  missingBannerDepartments: string[];
  status: "published" | "draft" | "incomplete";
}

export function auditBrand(
  brand: Brand,
  products: Product[],
  pageConfigs: Map<string, DepartmentBrandPageConfig>
): BrandAuditItem {
  const brandProducts = products.filter((p) => {
    const bSlug = (p.brand_slug || p.brandSlug || p.brand || "").toLowerCase().replace(/[^a-z0-9]+/g, "-");
    const bName = (p.brand_name || p.brandName || p.brand || "").toLowerCase();
    const target = brand.slug.toLowerCase();
    return bSlug === target || bName === target;
  });

  const assigned = brand.assigned_departments || getDefaultBrandDepartments(brand.slug, brand.product_group);
  const missingBanners: string[] = [];

  assigned.forEach((dSlug) => {
    const config = pageConfigs.get(`${dSlug}_${brand.slug}`);
    if (!config || (!config.desktopBannerUrl && !config.useDefaultBanner)) {
      missingBanners.push(dSlug);
    }
  });

  return {
    brand,
    assignedDepartments: assigned,
    productCount: brandProducts.length,
    hasPhones: assigned.includes("phones"),
    hasLaptops: assigned.includes("laptops-tablets"),
    hasAccessories: assigned.includes("accessories"),
    missingBannerDepartments: missingBanners,
    status: brand.status === "active" ? "published" : "draft",
  };
}
