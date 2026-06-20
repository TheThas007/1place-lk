import Link from "next/link";
import { categories } from "@/lib/data";

export default function CategoriesSection() {
  return (
    <section className="py-20 bg-card/50">
      <div className="max-w-7xl mx-auto px-4 lg:px-6">
        <div className="text-center mb-12">
          <h2 className="text-3xl lg:text-4xl font-bold tracking-tight mb-4">Shop by Category</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Find exactly what you're looking for.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {categories.map((category) => (
            <Link
              key={category.id}
              href={`/categories/${category.slug}`}
              className="group flex flex-col items-center justify-center p-6 bg-background rounded-2xl border border-border/50 hover:border-foreground/20 hover:shadow-lg transition-all duration-300"
            >
              <div className="w-16 h-16 mb-4 bg-card rounded-full flex items-center justify-center text-3xl group-hover:scale-110 transition-transform duration-300">
                {category.icon.startsWith("http") ? (
                  <img src={category.icon} alt={category.name} className="w-8 h-8 opacity-80" />
                ) : (
                  category.icon
                )}
              </div>
              <h3 className="font-medium text-sm text-center">{category.name}</h3>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
