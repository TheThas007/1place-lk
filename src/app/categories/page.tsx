import Image from "next/image";
import Link from "next/link";
import { categories } from "@/lib/data";

export default function CategoriesPage() {
  return (
    <div className="bg-background min-h-screen">
      <div className="border-b border-border bg-card">
        <div className="max-w-7xl mx-auto px-4 lg:px-6 py-8">
          <h1 className="text-3xl font-bold tracking-tight mb-2">Shop by Category</h1>
          <p className="text-muted-foreground">Browse our extensive collection by category.</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 lg:px-6 py-12">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 lg:gap-6">
          {categories.map((category) => (
            <Link
              key={category.id}
              href={`/categories/${category.slug}`}
              className="group relative aspect-[4/3] rounded-3xl overflow-hidden bg-foreground/5 border border-border/50 hover:border-foreground/20 hover:shadow-xl transition-all duration-300"
            >
              <Image 
                src={category.image_url} 
                alt={category.name}
                fill
                className="object-cover opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-all duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-6">
                <div className="flex items-center gap-3">
                  {category.icon.startsWith("http") ? (
                    <img src={category.icon} alt={category.name} className="w-8 h-8 filter invert" />
                  ) : (
                    <span className="text-3xl">{category.icon}</span>
                  )}
                  <h3 className="text-white font-semibold text-lg lg:text-xl">{category.name}</h3>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
