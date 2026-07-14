"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { MessageCircle, ShieldCheck, Truck, ChevronRight, ChevronDown, Check, ShoppingBag } from "lucide-react";
import { formatPrice } from "@/lib/utils";
import ProductGallery from "./product-gallery";
import { useCart } from "@/lib/cart-context";
import { useAuth } from "@/lib/auth-context";
import { getColorCSS, isLightColor } from "@/lib/color-utils";

// ── Types ──
interface Product {
  id: string;
  name: string;
  slug: string;
  category_name?: string;
  price: number;
  old_price: number | null;
  description: string;
  specifications: Record<string, string>;
  warranty: string;
  stock_status: "in_stock" | "low_stock" | "out_of_stock";
  colors: string[];
  storage_options: string[];
  storage_prices?: Record<string, number>;
  images: string[];
  featured: boolean;
  code?: string;
}

function generateOrderMessage(product: Product, storage: string, color: string, price: number) {
  const text = `Hello STREET MOBILE,\n\nI would like to order:\n\n*Product Name:* ${product.name}${storage ? `\n*Storage:* ${storage}` : ""}${color ? `\n*Color:* ${color}` : ""}\n*Price:* ${formatPrice(price)}\n\nPlease provide availability.`;
  return `https://wa.me/94774141118?text=${encodeURIComponent(text)}`;
}

function AddToBagDetailButton({ product, selectedStorage, selectedColor, displayPrice }: {
  product: Product;
  selectedStorage: string;
  selectedColor: string;
  displayPrice: number;
}) {
  const { addToCart } = useCart();
  const { user } = useAuth();
  const [added, setAdded] = useState(false);

  const handleAdd = () => {
    if (!user) {
      window.dispatchEvent(new Event("open-auth-modal"));
      return;
    }
    
    addToCart({
      productId: product.id,
      name: product.name,
      price: displayPrice,
      image: product.images?.[0] ?? "",
      quantity: 1,
      storage: selectedStorage || undefined,
      color: selectedColor || undefined,
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 1800);
  };

  return (
    <button
      onClick={handleAdd}
      className={`w-full flex items-center justify-center gap-2 px-8 py-4 rounded-xl font-bold text-lg transition-all active:scale-[0.98] ${
        added
          ? "bg-emerald-500 text-white"
          : "bg-foreground text-background hover:bg-foreground/90"
      }`}
    >
      {added ? (
        <>
          <Check className="w-5 h-5" />
          Added to Bag!
        </>
      ) : (
        <>
          <ShoppingBag className="w-5 h-5" />
          Add to Bag
        </>
      )}
    </button>
  );
}

export default function ProductDetailClient({ product }: { product: Product }) {
  const [selectedStorage, setSelectedStorage] = useState<string>(product.storage_options?.[0] || "");
  const [selectedColor, setSelectedColor] = useState<string>(product.colors?.[0] || "");
  const [storageOpen, setStorageOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const storagePrices = product.storage_prices || {};
  const hasStoragePrices =
    product.storage_options?.length > 0 &&
    Object.keys(storagePrices).some((k) => storagePrices[k] > 0);

  const displayPrice =
    hasStoragePrices && selectedStorage && storagePrices[selectedStorage] > 0
      ? storagePrices[selectedStorage]
      : product.price;

  const discount = product.old_price
    ? Math.round(((product.old_price - displayPrice) / product.old_price) * 100)
    : 0;

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setStorageOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

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

          {/* Image Gallery */}
          <ProductGallery images={product.images || []} name={product.name} discount={discount} />

          {/* Product Details */}
          <div className="flex flex-col">
            <div className="mb-2">
              <span className="inline-block px-3 py-1 rounded-full bg-foreground/5 text-xs font-medium text-muted-foreground mb-4">
                {product.category_name}
              </span>
              <h1 className="text-3xl lg:text-4xl font-bold tracking-tight mb-2">{product.name}</h1>
              {product.code && (
                <div className="text-xs font-mono text-muted-foreground bg-foreground/5 px-2 py-1 rounded w-fit mb-4">
                  Code: {product.code}
                </div>
              )}
            </div>

            {/* Price */}
            <div className="flex items-end gap-4 mb-1">
              <div className="text-4xl lg:text-5xl font-bold tracking-tight transition-all duration-300">
                {formatPrice(displayPrice)}
              </div>
              {product.old_price && (
                <div className="text-xl text-muted-foreground line-through mb-1">
                  {formatPrice(product.old_price)}
                </div>
              )}
            </div>
            {hasStoragePrices && selectedStorage ? (
              <p className="text-xs text-muted-foreground mb-5">
                Price for <span className="font-semibold text-foreground">{selectedStorage}</span>
              </p>
            ) : <div className="mb-5" />}

            {/* Status & Badges */}
            <div className="flex flex-wrap gap-4 mb-7 pb-7 border-b border-border">
              <div className="flex items-center gap-2 text-sm">
                <div className={`w-2.5 h-2.5 rounded-full ${product.stock_status === "in_stock" ? "bg-green-500" : "bg-orange-500 animate-pulse"}`} />
                <span className="font-medium">
                  {product.stock_status === "in_stock" ? "In Stock" : "Low Stock"}
                </span>
              </div>
              {product.warranty && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <ShieldCheck className="w-4 h-4 text-foreground" />
                  <span>{product.warranty}</span>
                </div>
              )}
            </div>

            {/* ── Color Swatches ── */}
            {product.colors && product.colors.length > 0 && (
              <div className="mb-6">
                <h3 className="text-sm font-semibold mb-3">
                  Color:{" "}
                  <span className="text-muted-foreground font-normal">{selectedColor}</span>
                </h3>
                <div className="flex flex-wrap gap-3">
                  {product.colors.map((color) => {
                    const css = getColorCSS(color);
                    const light = isLightColor(css);
                    const isSelected = selectedColor === color;
                    return (
                      <button
                        key={color}
                        onClick={() => setSelectedColor(color)}
                        title={color}
                        className="relative group flex flex-col items-center gap-1.5"
                      >
                        {/* Color circle */}
                        <span
                          className="w-9 h-9 rounded-full border-2 transition-all duration-200 flex items-center justify-center shadow-sm"
                          style={{
                            backgroundColor: css,
                            borderColor: isSelected ? (light ? "#374151" : css) : "transparent",
                            outline: isSelected ? `2px solid ${css}` : "2px solid transparent",
                            outlineOffset: "2px",
                            boxShadow: isSelected
                              ? `0 0 0 2px ${css}40`
                              : "0 1px 3px rgba(0,0,0,0.15)",
                          }}
                        >
                          {isSelected && (
                            <Check
                              className="w-4 h-4"
                              style={{ color: light ? "#111" : "#fff" }}
                              strokeWidth={3}
                            />
                          )}
                        </span>
                        {/* Label below */}
                        <span className={`text-[10px] font-medium transition-colors ${isSelected ? "text-foreground" : "text-muted-foreground"}`}>
                          {color}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* ── Storage Dropdown ── */}
            {product.storage_options && product.storage_options.length > 0 && (
              <div className="mb-8" ref={dropdownRef}>
                <h3 className="text-sm font-semibold mb-3">Storage</h3>

                {/* Trigger button */}
                <button
                  type="button"
                  onClick={() => setStorageOpen((o) => !o)}
                  className="w-full flex items-center justify-between px-4 py-3 rounded-xl border border-border bg-card hover:border-foreground/30 transition-all text-sm font-medium"
                >
                  <div className="flex items-center gap-3">
                    <span className="font-semibold text-foreground">{selectedStorage}</span>
                    {storagePrices[selectedStorage] > 0 && (
                      <>
                        <span className="text-muted-foreground">·</span>
                        <span className="text-foreground font-bold">
                          {formatPrice(storagePrices[selectedStorage])}
                        </span>
                      </>
                    )}
                  </div>
                  <ChevronDown
                    className={`w-4 h-4 text-muted-foreground transition-transform duration-200 ${storageOpen ? "rotate-180" : ""}`}
                  />
                </button>

                {/* Dropdown panel — scrollable */}
                <div
                  className="overflow-hidden transition-all duration-300 ease-in-out"
                  style={{ maxHeight: storageOpen ? "320px" : "0px", opacity: storageOpen ? 1 : 0 }}
                >
                  <div className="mt-2 rounded-xl border border-border bg-card shadow-lg overflow-y-auto max-h-72">
                    {product.storage_options.map((opt, idx) => {
                      const optPrice = storagePrices[opt];
                      const isActive = selectedStorage === opt;
                      return (
                        <button
                          key={opt}
                          type="button"
                          onClick={() => {
                            setSelectedStorage(opt);
                            setStorageOpen(false);
                          }}
                          className={`w-full flex items-center justify-between px-4 py-3.5 text-sm transition-colors
                            ${idx !== 0 ? "border-t border-border" : ""}
                            ${isActive
                              ? "bg-foreground/5 text-foreground"
                              : "hover:bg-foreground/[0.03] text-muted-foreground hover:text-foreground"
                            }`}
                        >
                          <div className="flex items-center gap-3">
                            {/* Active indicator */}
                            <span className={`w-2 h-2 rounded-full shrink-0 transition-all ${isActive ? "bg-foreground scale-100" : "bg-transparent scale-0"}`} />
                            <span className={`font-semibold ${isActive ? "text-foreground" : ""}`}>{opt}</span>
                          </div>
                          {optPrice && optPrice > 0 && (
                            <span className={`font-bold tabular-nums ${isActive ? "text-foreground" : "text-muted-foreground"}`}>
                              {formatPrice(optPrice)}
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* CTA Buttons */}
            <div className="mt-auto space-y-3 pt-4">
              <AddToBagDetailButton
                product={product}
                selectedStorage={selectedStorage}
                selectedColor={selectedColor}
                displayPrice={displayPrice}
              />
              <a
                href={generateOrderMessage(product, selectedStorage, selectedColor, displayPrice)}
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

        {/* Specifications */}
        <div className="mt-16 lg:mt-24">
          <div className="grid lg:grid-cols-3 gap-12 lg:gap-16">
            <div className="lg:col-span-2">
              <h2 className="text-2xl font-bold tracking-tight mb-6">Product Overview</h2>
              <div className="prose prose-neutral max-w-none text-muted-foreground leading-relaxed mb-12">
                <p>{product.description}</p>
                <p className="mt-4">
                  Experience unparalleled performance and elegant design. Every device is thoroughly
                  tested to ensure it meets our strict quality standards before making it to our
                  shelves. At STREET MOBILE, we guarantee authenticity and provide dedicated
                  after-sales support for your peace of mind.
                </p>
              </div>
            </div>

            {product.specifications && Object.keys(product.specifications).length > 0 && (
              <div>
                <div className="bg-card border border-border rounded-3xl p-6 lg:p-8">
                  <h2 className="text-xl font-bold tracking-tight mb-6">Specifications</h2>
                  <div className="space-y-4">
                    {Object.entries(product.specifications).map(([key, value]) => (
                      <div key={key} className="flex flex-col py-3 border-b border-border last:border-0">
                        <span className="text-sm text-muted-foreground mb-1">{key}</span>
                        <span className="font-medium text-sm">{value as string}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
