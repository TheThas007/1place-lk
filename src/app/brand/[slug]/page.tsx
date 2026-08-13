import { notFound } from "next/navigation";
import Link from "next/link";
import { getProducts, getBrands, getCategories } from "@/lib/firestore-client";
import ProductCard from "@/components/products/ProductCard";

export const dynamic = "force-dynamic";

interface BrandPageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ category?: string }>;
}

export async function generateMetadata({ params }: BrandPageProps) {
  const { slug } = await params;
  const brands = await getBrands();
  const brand = brands.find((b) => b.slug.toLowerCase() === slug.toLowerCase());

  const brandName = brand?.name || slug.toUpperCase();

  return {
    title: `${brandName} Products & Accessories in Sri Lanka | StreetMobile.lk`,
    description: brand?.description || `Shop 100% genuine ${brandName} products, smartphones, and accessories at Street Mobile Vavuniya with islandwide delivery.`,
  };
}

export default async function BrandPage({ params, searchParams }: BrandPageProps) {
  const { slug } = await params;
  const { category: selectedCategorySlug } = await searchParams;

  const [brands, products, categories] = await Promise.all([
    getBrands(),
    getProducts(),
    getCategories(),
  ]);

  const brand = brands.find((b) => b.slug.toLowerCase() === slug.toLowerCase());
  const brandName = brand?.name || slug.split("-").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");

  // All products belonging to this manufacturer across all categories
  const brandProducts = products.filter((p) => {
    const bSlug = (p.brand_slug || p.brandSlug || p.brand || "").toLowerCase().replace(/[^a-z0-9]+/g, "-");
    const bName = (p.brand_name || p.brandName || p.brand || "").toLowerCase();
    const target = brandName.toLowerCase();

    return (
      bSlug === slug.toLowerCase() ||
      bName === target ||
      p.name.toLowerCase().includes(target)
    );
  });

  if (brandProducts.length === 0 && !brand) {
    notFound();
  }

  // Unique categories in which this brand has products
  const availableCategorySlugs = Array.from(
    new Set(
      brandProducts
        .map((p) => p.category_slug || p.categorySlug || p.category_id || p.category_name)
        .filter(Boolean)
    )
  );

  const availableCategories = availableCategorySlugs.map((cSlug) => {
    const matched = categories.find((c) => c.slug === cSlug || c.id === cSlug);
    return {
      slug: cSlug!,
      name: matched?.name || cSlug!.replace(/-/g, " "),
    };
  });

  // Filtered products by category pill
  const finalProducts = brandProducts.filter((p) => {
    if (!selectedCategorySlug || selectedCategorySlug === "all") return true;
    const cSlug = (p.category_slug || p.categorySlug || p.category_id || p.category_name || "").toLowerCase().replace(/[^a-z0-9]+/g, "-");
    return cSlug === selectedCategorySlug.toLowerCase();
  });

  return (
    <div className="min-h-screen bg-white text-[#090909] pt-24 pb-16">
      <div className="max-w-7xl mx-auto px-4 lg:px-6">
        
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-xs font-semibold text-neutral-500 mb-6">
          <Link href="/" className="hover:text-black">Home</Link>
          <span>/</span>
          <span className="text-neutral-400">Brands</span>
          <span>/</span>
          <span className="text-black font-bold">{brandName}</span>
        </nav>

        {/* Brand Header Banner */}
        <div className="bg-[#090909] text-white border border-neutral-800 rounded-3xl p-6 sm:p-10 mb-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-xl">
          <div className="flex items-center gap-5">
            {brand?.logo_url ? (
              <img
                src={brand.logo_url}
                alt={`${brandName} logo`}
                className="w-16 h-16 sm:w-20 sm:h-20 object-contain bg-white p-3 rounded-2xl shrink-0"
              />
            ) : (
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-white/10 text-white font-black text-2xl flex items-center justify-center shrink-0 border border-white/20">
                {brandName.slice(0, 2).toUpperCase()}
              </div>
            )}
            <div>
              <span className="inline-block px-3 py-1 rounded-full bg-blue-600 text-white text-[10px] font-black uppercase tracking-wider mb-2">
                Official Manufacturer
              </span>
              <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white">
                {brandName}
              </h1>
              <p className="text-xs sm:text-sm text-neutral-400 mt-1 max-w-xl">
                {brand?.description || `Explore original ${brandName} products with 100% genuine warranty at StreetMobile.lk.`}
              </p>
            </div>
          </div>

          <div className="px-5 py-3 rounded-2xl bg-white/10 border border-white/15 text-xs font-bold text-white font-mono shrink-0">
            {finalProducts.length} Products Found
          </div>
        </div>

        {/* Category Pill Filters for Brand */}
        {availableCategories.length > 0 && (
          <div className="mb-8 space-y-2">
            <h3 className="text-xs font-black text-neutral-400 uppercase tracking-wider">
              Browse {brandName} by Product Category:
            </h3>
            <div className="flex items-center gap-2 overflow-x-auto pb-2 custom-scrollbar">
              <Link
                href={`/brand/${slug}`}
                className={`px-4 py-2 rounded-full text-xs font-bold transition-all shrink-0 ${
                  !selectedCategorySlug || selectedCategorySlug === "all"
                    ? "bg-black text-white shadow-xs"
                    : "bg-neutral-100 border border-neutral-200 text-neutral-700 hover:bg-neutral-200"
                }`}
              >
                All Categories
              </Link>
              {availableCategories.map((c) => {
                const isSelected = selectedCategorySlug === c.slug;
                return (
                  <Link
                    key={c.slug}
                    href={`/brand/${slug}?category=${c.slug}`}
                    className={`px-4 py-2 rounded-full text-xs font-bold transition-all shrink-0 capitalize ${
                      isSelected
                        ? "bg-black text-white shadow-xs"
                        : "bg-neutral-100 border border-neutral-200 text-neutral-700 hover:bg-neutral-200"
                    }`}
                  >
                    {c.name}
                  </Link>
                );
              })}
            </div>
          </div>
        )}

        {/* Product Grid */}
        {finalProducts.length === 0 ? (
          <div className="p-12 text-center bg-neutral-50 border border-dashed border-neutral-200 rounded-3xl space-y-3">
            <p className="text-base font-bold text-neutral-800">No products found for {brandName}.</p>
            <p className="text-xs text-neutral-500">Try selecting a different category or search all products.</p>
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
