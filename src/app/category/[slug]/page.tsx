import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { getProducts, getCategories, getBrands } from "@/lib/firestore-client";
import ProductCard from "@/components/products/ProductCard";
import { siteSettings } from "@/lib/data";

export const dynamic = "force-dynamic";

interface CategoryPageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ brand?: string }>;
}

const KNOWN_BRANDS = [
  "apple", "samsung", "redmi", "xiaomi", "honor", "oppo", "vivo",
  "realme", "google", "jbl", "lenyes", "ugreen", "anker", "baseus", "oraimo"
];

function normalizeCategorySlug(text: string | undefined | null): string {
  if (!text) return "";
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/&+/g, "and")
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export async function generateMetadata({ params }: CategoryPageProps) {
  const { slug } = await params;
  const categories = await getCategories();
  const target = normalizeCategorySlug(slug);
  const cat = categories.find((c) => {
    const s = normalizeCategorySlug(c.slug || c.id || c.name);
    return s === target || (c.slug && c.slug.toLowerCase() === slug.toLowerCase()) || (c.id && c.id.toLowerCase() === slug.toLowerCase());
  });

  const categoryName = cat?.name || slug.replace(/-/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());
  const title = `${categoryName} in Sri Lanka | 1PLACE.LK`;
  const description = cat?.description || `Shop genuine ${categoryName} in Sri Lanka at 1PLACE.LK. Best prices, official warranty, cash on delivery & express islandwide delivery.`;
  const canonicalUrl = `https://www.1place.lk/category/${target}`;

  return {
    title,
    description,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title,
      description,
      url: canonicalUrl,
      type: "website",
      siteName: "1PLACE.LK",
      locale: "en_LK",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}

export default async function CategoryPage({ params, searchParams }: CategoryPageProps) {
  const { slug } = await params;
  const { brand: selectedBrandSlug } = await searchParams;

  // Safe redirect if a user/link hits legacy brand route e.g. /category/samsung -> /brand/samsung
  if (KNOWN_BRANDS.includes(slug.toLowerCase())) {
    redirect(`/brand/${slug.toLowerCase()}`);
  }

  const [categories, products, brands] = await Promise.all([
    getCategories(),
    getProducts(),
    getBrands(),
  ]);

  const targetSlug = normalizeCategorySlug(slug);
  const cat = categories.find((c) => {
    const s = normalizeCategorySlug(c.slug || c.id || c.name);
    return s === targetSlug || (c.slug && c.slug.toLowerCase() === slug.toLowerCase()) || (c.id && c.id.toLowerCase() === slug.toLowerCase());
  });

  if (!cat) {
    // If not found in categories, search products by category matching
    const matchingProducts = products.filter(
      (p) =>
        normalizeCategorySlug(p.category_slug || p.categorySlug || p.category_id || p.category_name || "") === targetSlug
    );
    if (matchingProducts.length === 0) {
      notFound();
    }
  }

  const categoryName = cat?.name || slug.replace(/-/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());

  // Products belonging to this category
  const categoryProducts = products.filter((p) => {
    const cSlug = normalizeCategorySlug(p.category_slug || p.categorySlug || p.category_id || p.category_name || "");
    const cName = (p.category_name || p.categoryName || "").toLowerCase();
    const targetName = categoryName.toLowerCase();
    return cSlug === targetSlug || cName.includes(targetName) || targetName.includes(cName);
  });

  // Unique brands available for products in this category
  const categoryBrandNames = Array.from(
    new Set(categoryProducts.map((p) => p.brand_name || p.brandName || p.brand).filter(Boolean))
  );

  // Filtered by selected brand pill
  const finalProducts = categoryProducts.filter((p) => {
    if (!selectedBrandSlug || selectedBrandSlug === "all") return true;
    const bName = (p.brand_name || p.brandName || p.brand || "").toLowerCase().replace(/[^a-z0-9]+/g, "-");
    return bName === selectedBrandSlug.toLowerCase();
  });

  const collectionJsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "@id": `https://www.1place.lk/category/${slug}#collection`,
    "name": `${categoryName} in Sri Lanka`,
    "description": `Browse genuine ${categoryName} available at 1PLACE.LK Sri Lanka.`,
    "url": `https://www.1place.lk/category/${slug}`,
    "mainEntity": {
      "@type": "ItemList",
      "itemListElement": finalProducts.slice(0, 24).map((p, idx) => ({
        "@type": "ListItem",
        "position": idx + 1,
        "url": `https://www.1place.lk/products/${p.slug}`,
        "name": p.name,
      })),
    },
  };

  const breadcrumbsJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "Home",
        "item": "https://www.1place.lk"
      },
      {
        "@type": "ListItem",
        "position": 2,
        "name": "Categories",
        "item": "https://www.1place.lk/categories"
      },
      {
        "@type": "ListItem",
        "position": 3,
        "name": categoryName,
        "item": `https://www.1place.lk/category/${slug}`
      }
    ]
  };

  return (
    <div className="min-h-screen bg-white text-[#090909] pt-24 pb-16">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbsJsonLd) }}
      />
      <div className="max-w-7xl mx-auto px-4 lg:px-6">
        
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-xs font-semibold text-neutral-500 mb-6">
          <Link href="/" className="hover:text-black">Home</Link>
          <span>/</span>
          <Link href="/products" className="hover:text-black">Categories</Link>
          <span>/</span>
          <span className="text-black font-bold capitalize">{categoryName}</span>
        </nav>

        {/* Header Banner */}
        <div className="bg-[#F8F8F9] border border-neutral-200/80 rounded-3xl p-6 sm:p-10 mb-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div>
            <span className="inline-block px-3 py-1 rounded-full bg-black text-white text-[10px] font-black uppercase tracking-wider mb-3">
              Product Category
            </span>
            <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-[#090909] capitalize">
              {categoryName}
            </h1>
            <p className="text-sm text-neutral-500 mt-2 max-w-xl font-medium">
              {cat?.description || `Explore 100% genuine ${categoryName} from official global brands with Islandwide delivery.`}
            </p>
          </div>

          <div className="px-5 py-3 rounded-2xl bg-white border border-neutral-200 shadow-2xs font-mono text-xs font-bold text-neutral-700">
            {finalProducts.length} Products Available
          </div>
        </div>

        {/* Secondary Brand Pill Filter Bar */}
        {categoryBrandNames.length > 0 && (
          <div className="mb-8 space-y-2">
            <h3 className="text-xs font-black text-neutral-400 uppercase tracking-wider">
              Filter by Brand:
            </h3>
            <div className="flex items-center gap-2 overflow-x-auto pb-2 custom-scrollbar">
              <Link
                href={`/category/${slug}`}
                className={`px-4 py-2 rounded-full text-xs font-bold transition-all shrink-0 ${
                  !selectedBrandSlug || selectedBrandSlug === "all"
                    ? "bg-black text-white shadow-xs"
                    : "bg-neutral-100 border border-neutral-200 text-neutral-700 hover:bg-neutral-200"
                }`}
              >
                All Brands
              </Link>
              {categoryBrandNames.map((bName) => {
                const bSlug = bName!.toLowerCase().replace(/[^a-z0-9]+/g, "-");
                const isSelected = selectedBrandSlug === bSlug;
                return (
                  <Link
                    key={bName}
                    href={`/category/${slug}?brand=${bSlug}`}
                    className={`px-4 py-2 rounded-full text-xs font-bold transition-all shrink-0 ${
                      isSelected
                        ? "bg-black text-white shadow-xs"
                        : "bg-neutral-100 border border-neutral-200 text-neutral-700 hover:bg-neutral-200"
                    }`}
                  >
                    {bName}
                  </Link>
                );
              })}
            </div>
          </div>
        )}

        {/* Product Grid */}
        {finalProducts.length === 0 ? (
          <div className="p-12 text-center bg-neutral-50 border border-dashed border-neutral-200 rounded-3xl space-y-3">
            <p className="text-base font-bold text-neutral-800">No products found in {categoryName}.</p>
            <p className="text-xs text-neutral-500">Try selecting a different brand filter or browse all products.</p>
            <Link
              href="/products"
              className="inline-block mt-3 px-5 py-2.5 rounded-full bg-black text-white text-xs font-bold hover:bg-neutral-800 transition-colors"
            >
              Browse All Products
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 sm:gap-6">
            {finalProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}

      </div>
    </div>
  );
}
