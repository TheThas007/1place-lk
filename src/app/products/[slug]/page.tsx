import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { MessageCircle, ShieldCheck, Truck, ChevronRight } from "lucide-react";
import { products } from "@/lib/data";
import { formatPrice } from "@/lib/utils";

// Generate WhatsApp Order Message
function generateOrderMessage(product: any) {
  const text = `Hello STREET MOBILE,\n\nI would like to order:\n\n*Product Name:* ${product.name}\n*Price:* ${formatPrice(product.price)}\n\nPlease provide availability.`;
  return `https://wa.me/94774141118?text=${encodeURIComponent(text)}`;
}

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = products.find((p) => p.slug === slug);

  if (!product) {
    notFound();
  }

  const discount = product.old_price 
    ? Math.round(((product.old_price - product.price) / product.old_price) * 100) 
    : 0;

  return (
    <div className="bg-background min-h-screen pb-24">
      {/* Breadcrumbs */}
      <div className="border-b border-border bg-card">
        <div className="max-w-7xl mx-auto px-4 lg:px-6 py-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Link href="/" className="hover:text-foreground transition-colors">Home</Link>
            <ChevronRight className="w-4 h-4" />
            <Link href="/products" className="hover:text-foreground transition-colors">Products</Link>
            <ChevronRight className="w-4 h-4" />
            <span className="text-foreground font-medium truncate">{product.name}</span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 lg:px-6 py-8 lg:py-12">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16">
          
          {/* Image Gallery (Left Side) */}
          <div className="space-y-4">
            <div className="relative aspect-square rounded-3xl overflow-hidden bg-foreground/5 border border-border/50">
              <img 
                src={product.images[0]} 
                alt={product.name}
                className="absolute inset-0 w-full h-full object-cover"
              />
              {discount > 0 && (
                <div className="absolute top-6 left-6 bg-foreground text-background text-xs font-bold px-3 py-1.5 rounded-full uppercase tracking-wider shadow-lg z-10">
                  {discount}% OFF
                </div>
              )}
            </div>
            
            {/* Thumbnail Gallery (Mock) */}
            <div className="grid grid-cols-4 gap-4">
              {[product.images[0], product.images[0], product.images[0], product.images[0]].map((img, i) => (
                <div key={i} className={`relative aspect-square rounded-xl overflow-hidden border-2 cursor-pointer ${i === 0 ? 'border-foreground' : 'border-transparent hover:border-border'} bg-foreground/5`}>
                  <img src={img} alt="" className="absolute inset-0 w-full h-full object-cover" />
                </div>
              ))}
            </div>
          </div>

          {/* Product Details (Right Side) */}
          <div className="flex flex-col">
            <div className="mb-2">
              <span className="inline-block px-3 py-1 rounded-full bg-foreground/5 text-xs font-medium text-muted-foreground mb-4">
                {product.category_name}
              </span>
              <h1 className="text-3xl lg:text-4xl font-bold tracking-tight mb-4">{product.name}</h1>
            </div>

            {/* Price Area */}
            <div className="flex items-end gap-4 mb-6">
              <div className="text-4xl lg:text-5xl font-bold tracking-tight">
                {formatPrice(product.price)}
              </div>
              {product.old_price && (
                <div className="text-xl text-muted-foreground line-through mb-1">
                  {formatPrice(product.old_price)}
                </div>
              )}
            </div>

            {/* Status & Badges */}
            <div className="flex flex-wrap gap-4 mb-8 pb-8 border-b border-border">
              <div className="flex items-center gap-2 text-sm">
                <div className={`w-2.5 h-2.5 rounded-full ${product.stock_status === 'in_stock' ? 'bg-green-500' : 'bg-orange-500 animate-pulse'}`} />
                <span className="font-medium">
                  {product.stock_status === 'in_stock' ? 'In Stock' : 'Low Stock'}
                </span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <ShieldCheck className="w-4 h-4 text-foreground" />
                <span>{product.warranty}</span>
              </div>
            </div>

            {/* Options Selection */}
            {product.colors && product.colors.length > 0 && (
              <div className="mb-6">
                <h3 className="text-sm font-semibold mb-3">Color</h3>
                <div className="flex flex-wrap gap-3">
                  {product.colors.map((color, i) => (
                    <button key={color} className={`px-4 py-2 rounded-xl text-sm font-medium border ${i === 0 ? 'border-foreground bg-foreground/5' : 'border-border hover:border-foreground/30'} transition-all`}>
                      {color}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {product.storage_options && product.storage_options.length > 0 && (
              <div className="mb-8">
                <h3 className="text-sm font-semibold mb-3">Storage</h3>
                <div className="flex flex-wrap gap-3">
                  {product.storage_options.map((storage, i) => (
                    <button key={storage} className={`px-4 py-2 rounded-xl text-sm font-medium border ${i === 0 ? 'border-foreground bg-foreground/5' : 'border-border hover:border-foreground/30'} transition-all`}>
                      {storage}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* CTA Buttons */}
            <div className="mt-auto space-y-4 pt-8">
              <a 
                href={generateOrderMessage(product)}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex items-center justify-center gap-2 bg-[#25D366] text-white px-8 py-4 rounded-xl font-bold text-lg hover:bg-[#20bd5a] hover:shadow-lg hover:shadow-[#25D366]/20 transition-all active:scale-[0.98]"
              >
                <MessageCircle className="w-5 h-5" />
                Buy via WhatsApp
              </a>
              
              <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground bg-foreground/5 py-3 rounded-xl border border-foreground/10">
                <Truck className="w-4 h-4" />
                Island-wide Delivery Available
              </div>
            </div>
          </div>
        </div>

        {/* Product Details Tabs / Sections */}
        <div className="mt-16 lg:mt-24">
          <div className="grid lg:grid-cols-3 gap-12 lg:gap-16">
            
            <div className="lg:col-span-2">
              <h2 className="text-2xl font-bold tracking-tight mb-6">Product Overview</h2>
              <div className="prose prose-neutral max-w-none text-muted-foreground leading-relaxed mb-12">
                <p>{product.description}</p>
                {/* Additional placeholder text for premium feel */}
                <p className="mt-4">
                  Experience unparalleled performance and elegant design. Every device is thoroughly tested to ensure it meets our strict quality standards before making it to our shelves. At STREET MOBILE, we guarantee authenticity and provide dedicated after-sales support for your peace of mind.
                </p>
              </div>
            </div>

            <div>
              <div className="bg-card border border-border rounded-3xl p-6 lg:p-8">
                <h2 className="text-xl font-bold tracking-tight mb-6">Specifications</h2>
                <div className="space-y-4">
                  {Object.entries(product.specifications).map(([key, value]) => (
                    <div key={key} className="flex flex-col py-3 border-b border-border last:border-0">
                      <span className="text-sm text-muted-foreground mb-1">{key}</span>
                      <span className="font-medium text-sm">{value as React.ReactNode}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
