import { notFound } from "next/navigation";
import Link from "next/link";
import { formatPrice } from "@/lib/utils";
import { getCategories, getCategoryBySlug, getProducts } from "@/lib/firestore-client";

export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";

export async function generateStaticParams() {
  const categories = await getCategories();
  return categories.map((category) => ({
    slug: category.slug,
  }));
}

export default async function CategoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const category = await getCategoryBySlug(slug);
  
  if (!category) {
    notFound();
  }

  const allProducts = await getProducts();
  const categoryProducts = allProducts.filter((p) => p.category_id === category.id);

  return (
    <div className="bg-background min-h-screen">
      {/* Category Header */}
      <div className="border-b border-border bg-card">
        <div className="max-w-7xl mx-auto px-4 lg:px-6 py-12 flex flex-col items-center text-center">
          <div className="w-20 h-20 rounded-3xl bg-foreground/5 flex items-center justify-center mb-6">
            {category.icon.startsWith("http") ? (
              <img src={category.icon} alt={category.name} className="w-12 h-12 object-contain" />
            ) : (
              <span className="text-4xl">{category.icon}</span>
            )}
          </div>
          <h1 className="text-4xl font-bold tracking-tight mb-4">{category.name}</h1>
          <p className="text-muted-foreground max-w-2xl">
            Explore our collection of authentic {category.name} products. 
            From the latest releases to essential accessories, find everything you need.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 lg:px-6 py-12">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold">Products ({categoryProducts.length})</h2>
          <Link href="/products" className="text-sm font-medium text-muted-foreground hover:text-foreground">
            View all products →
          </Link>
        </div>

        {categoryProducts.length === 0 ? (
          <div className="text-center py-20 bg-card rounded-3xl border border-border/50">
            <h3 className="text-xl font-semibold mb-2">No products available</h3>
            <p className="text-muted-foreground">We are currently updating our inventory for {category.name}.</p>
            <Link 
              href="/products"
              className="inline-block mt-6 px-6 py-2 bg-foreground text-background rounded-xl font-medium"
            >
              Browse all products
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 lg:gap-6">
            {categoryProducts.map((product) => (
              <Link 
                href={`/products/${product.slug}`} 
                key={product.id}
                className="group block bg-card rounded-2xl overflow-hidden border border-border/50 hover:shadow-xl hover:border-border transition-all duration-300 flex flex-col"
              >
                <div className="relative aspect-square bg-white p-4 flex items-center justify-center">
                  {product.old_price && (
                    <div className="absolute top-3 left-3 bg-foreground text-background text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wider z-10">
                      Sale
                    </div>
                  )}
                  <div className="relative w-full h-full overflow-hidden rounded-xl bg-foreground/5">
                    <img 
                      src={product.images[0]} 
                      alt={product.name}
                      className="absolute inset-0 w-full h-full object-contain mix-blend-multiply group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                </div>
                
                <div className="p-4 flex flex-col flex-1 justify-between">
                  <div>
                    <div className="text-xs text-muted-foreground mb-1">{product.category_name}</div>
                    <h3 className="font-semibold text-sm lg:text-base line-clamp-2 mb-2 group-hover:text-muted-foreground transition-colors h-10 lg:h-12">
                      {product.name}
                    </h3>
                  </div>
                  <div className="flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-2 mt-auto">
                    <span className="font-bold text-sm lg:text-base">{formatPrice(product.price)}</span>
                    {product.old_price && (
                      <span className="text-xs text-muted-foreground line-through">
                        {formatPrice(product.old_price)}
                      </span>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
