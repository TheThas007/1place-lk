"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ShieldCheck,
  Award,
  Truck,
  ChevronRight,
  ChevronDown,
  Check,
  ShoppingBag,
  Star,
  Minus,
  Plus,
  ArrowRight,
  Banknote,
} from "lucide-react";
import { formatPrice, isPhoneProduct } from "@/lib/utils";
import ProductGallery from "./product-gallery";
import CompleteYourSetup from "@/components/products/CompleteYourSetup";
import { useCart } from "@/lib/cart-context";
import { useAuth } from "@/lib/auth-context";
import { getColorCSS, isLightColor } from "@/lib/color-utils";
import { Product, ProductColor, ProductVariantCombo, WarrantyOption } from "@/lib/types";

export default function ProductDetailClient({
  product,
  allProducts = [],
}: {
  product: Product;
  allProducts?: Product[];
}) {
  const router = useRouter();
  const { addToCart } = useCart();
  const { user } = useAuth();

  // 1. Color Variants
  const colorVariants: ProductColor[] = useMemo(() => {
    if (product.color_variants && product.color_variants.length > 0) {
      return product.color_variants;
    }
    if (product.colors && product.colors.length > 0) {
      return product.colors.map((c, i) => ({
        id: `c-${i}`,
        name: c,
        hex: getColorCSS(c),
        images: product.images || [],
      }));
    }
    return [
      {
        id: "c-default",
        name: "Standard",
        hex: "#000000",
        images: product.images || [],
      },
    ];
  }, [product]);

  const [selectedColorObj, setSelectedColorObj] = useState<ProductColor>(
    colorVariants[0] || { id: "c-0", name: "Standard", hex: "#000000", images: product.images || [] }
  );

  // Gallery Images dynamically update based on selected color
  const activeImages = useMemo(() => {
    if (selectedColorObj && selectedColorObj.images && selectedColorObj.images.length > 0) {
      return selectedColorObj.images;
    }
    return product.images && product.images.length > 0
      ? product.images
      : ["https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?q=80&w=800&auto=format&fit=crop"];
  }, [selectedColorObj, product.images]);

  // 2. Combination Variants (RAM & Storage)
  const variantCombos: ProductVariantCombo[] = useMemo(() => {
    if (product.variant_combos && product.variant_combos.length > 0) {
      return product.variant_combos;
    }
    if (product.storage_options && product.storage_options.length > 0) {
      return product.storage_options.map((st, i) => ({
        id: `v-${i}`,
        storage: st,
        sku: product.code || `${product.slug}-${st.toLowerCase()}`,
        price: (product.storage_prices && product.storage_prices[st]) || product.price,
        old_price: product.old_price,
        stock_quantity: product.stock_status === "out_of_stock" ? 0 : 10,
        reserved_stock: 0,
        available_stock: product.stock_status === "out_of_stock" ? 0 : 10,
        status: "active" as const,
      }));
    }
    return [
      {
        id: "v-default",
        sku: product.code || product.slug,
        price: product.price,
        old_price: product.old_price,
        stock_quantity: product.stock_status === "out_of_stock" ? 0 : 10,
        reserved_stock: 0,
        available_stock: product.stock_status === "out_of_stock" ? 0 : 10,
        status: "active" as const,
      },
    ];
  }, [product]);

  const [selectedCombo, setSelectedCombo] = useState<ProductVariantCombo | null>(
    variantCombos.find((v) => v.stock_quantity > 0 && v.status !== "inactive") || variantCombos[0] || null
  );

  // Quantity
  const [quantity, setQuantity] = useState<number>(1);
  const [activeTab, setActiveTab] = useState<"description" | "specifications" | "warranty">("description");
  const [added, setAdded] = useState(false);
  const [buyingNow, setBuyingNow] = useState(false);

  // 3. Warranty Options Selection
  const availableWarranties = useMemo(() => {
    if (product.warranty_options && product.warranty_options.length > 0) {
      return product.warranty_options.filter((w) => w.status !== "inactive");
    }
    return [];
  }, [product]);

  const [selectedWarranty, setSelectedWarranty] = useState<WarrantyOption | null>(
    availableWarranties.find((w) => w.is_default) || availableWarranties[0] || null
  );

  // Pricing & Stock Computations
  const warrantyPrice = selectedWarranty ? selectedWarranty.additional_price : 0;
  const currentVariantPrice = (selectedCombo ? selectedCombo.price : product.price) + warrantyPrice;
  const currentVariantOldPrice = selectedCombo?.old_price ?? product.old_price;

  const currentSku = selectedCombo?.sku || product.code || product.slug;
  const currentStock = selectedCombo ? selectedCombo.stock_quantity : (product.stock_status === "out_of_stock" ? 0 : 10);
  const isVariantOutOfStock = currentStock <= 0 || product.stock_status === "out_of_stock";

  const discountPercent = currentVariantOldPrice && currentVariantOldPrice > currentVariantPrice
    ? Math.round(((currentVariantOldPrice - currentVariantPrice) / currentVariantOldPrice) * 100)
    : 0;

  const handleQuantityChange = (delta: number) => {
    setQuantity((prev) => Math.max(1, prev + delta));
  };

  const handleAddToCart = () => {
    if (isVariantOutOfStock) return;

    addToCart({
      productId: product.id,
      name: product.name,
      price: currentVariantPrice,
      image: activeImages[0] || product.images?.[0] || "",
      quantity: quantity,
      color: selectedColorObj?.name,
      ram: selectedCombo?.ram,
      storage: selectedCombo?.storage,
      variantId: selectedCombo?.id,
      warrantyTitle: selectedWarranty?.title || product.warranty,
      warrantyPrice: selectedWarranty?.additional_price || 0,
    });

    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  const handleBuyNow = () => {
    if (isVariantOutOfStock) return;
    setBuyingNow(true);

    addToCart({
      productId: product.id,
      name: product.name,
      price: currentVariantPrice,
      image: activeImages[0] || product.images?.[0] || "",
      quantity: quantity,
      color: selectedColorObj?.name,
      ram: selectedCombo?.ram,
      storage: selectedCombo?.storage,
      variantId: selectedCombo?.id,
      warrantyTitle: selectedWarranty?.title || product.warranty,
      warrantyPrice: selectedWarranty?.additional_price || 0,
    });

    router.push("/checkout");
  };

  return (
    <div className="bg-white min-h-screen text-black pb-24">
      {/* ── 1. Top Breadcrumbs ── */}
      <div className="border-b border-[#EAEAEA] bg-white">
        <div className="max-w-7xl mx-auto px-4 lg:px-6 py-3.5">
          <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-500 font-medium overflow-x-auto no-scrollbar">
            <Link href="/" className="hover:text-black transition-colors shrink-0">
              Home
            </Link>
            <ChevronRight className="w-3.5 h-3.5 text-gray-400 shrink-0" />
            <Link
              href={`/products?category=${product.category_id}`}
              className="hover:text-black transition-colors shrink-0"
            >
              {product.category_name || "Products"}
            </Link>
            <ChevronRight className="w-3.5 h-3.5 text-gray-400 shrink-0" />
            <span className="text-black font-semibold truncate">{product.name}</span>
          </div>
        </div>
      </div>

      {/* ── 2. Main Product Section ── */}
      <div className="max-w-7xl mx-auto px-4 lg:px-6 pt-8 sm:pt-12">
        <div className="grid lg:grid-cols-12 gap-10 lg:gap-14 items-start">
          
          {/* Left Column: Image Gallery (Updates dynamically per color) */}
          <div className="lg:col-span-6">
            <ProductGallery
              key={selectedColorObj.id}
              images={activeImages}
              name={product.name}
              discount={discountPercent}
              video_url={product.video_url}
            />
          </div>

          {/* Right Column: Complete Information & Variant Controls */}
          <div className="lg:col-span-6 flex flex-col justify-between">
            <div>
              {/* Category & SKU */}
              <div className="flex items-center justify-between gap-4 mb-3">
                <span className="inline-block px-3 py-1 rounded-full bg-gray-100 text-[11px] font-bold text-gray-700 uppercase tracking-widest">
                  {product.category_name || "Smartphones"}
                </span>
                <span className="text-xs font-mono text-gray-400">
                  SKU: {currentSku}
                </span>
              </div>

              {/* Title */}
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-black tracking-tight mb-3 leading-snug">
                {product.name}
              </h1>

              {/* Rating & Stock Status */}
              <div className="flex items-center flex-wrap gap-4 mb-5 pb-5 border-b border-[#EAEAEA]">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-black">
                  <div className="flex items-center gap-0.5 text-amber-500">
                    <Star className="w-4 h-4 fill-amber-400" />
                    <Star className="w-4 h-4 fill-amber-400" />
                    <Star className="w-4 h-4 fill-amber-400" />
                    <Star className="w-4 h-4 fill-amber-400" />
                    <Star className="w-4 h-4 fill-amber-400" />
                  </div>
                  <span className="font-bold">4.9</span>
                  <span className="text-gray-400 font-normal">(24 verified reviews)</span>
                </div>

                <div className="flex items-center gap-2 text-xs font-semibold">
                  <span
                    className={`w-2.5 h-2.5 rounded-full ${
                      isVariantOutOfStock
                        ? "bg-red-500"
                        : currentStock <= 5
                        ? "bg-amber-500 animate-pulse"
                        : "bg-emerald-500"
                    }`}
                  />
                  <span>
                    {isVariantOutOfStock
                      ? "Out of Stock"
                      : currentStock <= 5
                      ? `Low Stock — Only ${currentStock} Left`
                      : "In Stock & Ready to Ship"}
                  </span>
                </div>
              </div>

              {/* Price Display */}
              <div className="flex items-baseline flex-wrap gap-3 mb-6">
                <span className="text-3xl sm:text-4xl font-black text-black tracking-tight">
                  {formatPrice(currentVariantPrice)}
                </span>
                {currentVariantOldPrice && currentVariantOldPrice > currentVariantPrice && (
                  <span className="text-lg text-gray-400 line-through font-medium">
                    {formatPrice(currentVariantOldPrice)}
                  </span>
                )}
                {discountPercent > 0 && (
                  <span className="text-xs font-black text-red-600 bg-red-50 border border-red-200 px-2.5 py-1 rounded-md animate-pulse">
                    SAVE {discountPercent}%
                  </span>
                )}
              </div>

              {/* Short Description */}
              {product.description && (
                <p className="text-xs sm:text-sm text-gray-600 leading-relaxed mb-6 line-clamp-3">
                  {product.description}
                </p>
              )}

              {/* ── 🛡️ Bold Warranty Badges (Clean Text with Icons) ── */}
              {(availableWarranties.length > 0 || product.warranty || product.brand_warranty) && (
                <div className="space-y-2 mb-6">
                  {availableWarranties.length > 0 ? (
                    availableWarranties.map((w) => (
                      <div
                        key={w.id}
                        className="flex items-center gap-3 text-xs sm:text-sm font-bold text-black bg-[#FAFAFA] border border-[#EAEAEA] px-4 py-3 rounded-2xl"
                      >
                        <ShieldCheck className="w-5 h-5 text-black shrink-0" />
                        <div>
                          <span>Warranty: <strong className="font-extrabold text-black">{w.title}</strong></span>
                          {w.coverage_details && (
                            <span className="block text-[11px] text-gray-500 font-normal mt-0.5">{w.coverage_details}</span>
                          )}
                        </div>
                      </div>
                    ))
                  ) : (
                    <>
                      {product.warranty && (
                        <div className="flex items-center gap-2.5 text-xs sm:text-sm font-bold text-black bg-[#FAFAFA] border border-[#EAEAEA] px-4 py-3 rounded-2xl">
                          <ShieldCheck className="w-5 h-5 text-black shrink-0" />
                          <span>Warranty: <strong className="font-extrabold text-black">{product.warranty}</strong></span>
                        </div>
                      )}

                      {product.brand_warranty && (
                        <div className="flex items-center gap-2.5 text-xs sm:text-sm font-bold text-black bg-[#FAFAFA] border border-[#EAEAEA] px-4 py-3 rounded-2xl">
                          <Award className="w-5 h-5 text-black shrink-0" />
                          <span>Brand Warranty: <strong className="font-extrabold text-black">{product.brand_warranty}</strong></span>
                        </div>
                      )}
                    </>
                  )}
                </div>
              )}

              {/* ── 1. COLOUR SELECTOR ── */}
              {colorVariants.length > 0 && (
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-2.5">
                    <label className="text-xs font-bold text-black uppercase tracking-wider">
                      Colour: <span className="font-medium text-gray-600">{selectedColorObj.name}</span>
                    </label>
                  </div>
                  <div className="flex flex-wrap gap-3">
                    {colorVariants.map((c) => {
                      const isSelected = selectedColorObj.id === c.id;
                      const hexColor = c.hex || getColorCSS(c.name);
                      const light = isLightColor(hexColor);
                      return (
                        <button
                          key={c.id}
                          type="button"
                          onClick={() => setSelectedColorObj(c)}
                          title={c.name}
                          className={`w-8 h-8 rounded-full relative flex items-center justify-center transition-all ${
                            isSelected
                              ? "ring-2 ring-black ring-offset-2 scale-110 shadow-sm"
                              : "border border-gray-300 hover:scale-105"
                          }`}
                          style={{ backgroundColor: hexColor }}
                        >
                          {isSelected && (
                            <Check className={`w-3.5 h-3.5 ${light ? "text-black" : "text-white"}`} />
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* ── 2. MEMORY / STORAGE & SIM VARIANT SELECTOR (MOBILE PHONES ONLY) ── */}
              {isPhoneProduct(product) && variantCombos.length > 0 && (variantCombos.length > 1 || variantCombos.some((v) => Boolean(v.ram || v.storage)) || (product.storage_options && product.storage_options.length > 0)) && (
                <div className="mb-6">
                  <label className="block text-xs font-bold text-black uppercase tracking-wider mb-2.5">
                    Select Memory / Storage Variant:
                  </label>
                  <div className="relative">
                    <select
                      value={selectedCombo?.id || ""}
                      onChange={(e) => {
                        const targetCombo = variantCombos.find((c) => c.id === e.target.value);
                        if (targetCombo) setSelectedCombo(targetCombo);
                      }}
                      className="w-full px-4 py-3.5 bg-[#FAFAFA] border border-[#EAEAEA] rounded-2xl text-xs sm:text-sm font-bold text-black appearance-none outline-none focus:border-black transition-all cursor-pointer pr-10 shadow-xs"
                    >
                      {variantCombos.map((combo) => {
                        const isComboOutOfStock = combo.stock_quantity <= 0 || combo.status === "inactive";
                        const simLabel = combo.sim_type ? ` • ${combo.sim_type}` : "";
                        const label = combo.ram
                          ? `${combo.ram} + ${combo.storage || ""}${simLabel}`
                          : `${combo.storage || ""}${simLabel}`.trim() || `${formatPrice(combo.price)}`;

                        return (
                          <option
                            key={combo.id}
                            value={combo.id}
                            disabled={isComboOutOfStock}
                            className={isComboOutOfStock ? "text-gray-400" : "text-black"}
                          >
                            {label} — {formatPrice(combo.price)} {isComboOutOfStock ? "(Out of Stock)" : ""}
                          </option>
                        );
                      })}
                    </select>

                    {/* Chevron Down Arrow Icon */}
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-black">
                      <ChevronDown className="w-5 h-5" />
                    </div>
                  </div>
                </div>
              )}

              {/* Quantity Selector */}
              <div className="mb-8">
                <label className="block text-xs font-bold text-black uppercase tracking-wider mb-2.5">
                  Quantity
                </label>
                <div className="inline-flex items-center border border-[#EAEAEA] rounded-full p-1 bg-white">
                  <button
                    type="button"
                    onClick={() => handleQuantityChange(-1)}
                    disabled={quantity <= 1 || isVariantOutOfStock}
                    className="w-8 h-8 rounded-full flex items-center justify-center text-gray-600 hover:text-black hover:bg-gray-100 transition-colors disabled:opacity-30"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="w-12 text-center text-xs font-bold text-black">{quantity}</span>
                  <button
                    type="button"
                    onClick={() => handleQuantityChange(1)}
                    disabled={isVariantOutOfStock}
                    className="w-8 h-8 rounded-full flex items-center justify-center text-gray-600 hover:text-black hover:bg-gray-100 transition-colors disabled:opacity-30"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* ── Primary Action Buttons (Side by Side Desktop, Stacked Mobile) ── */}
              <div className="flex flex-col sm:flex-row gap-3 mb-8">
                {/* 1. Add to Bag (White with Black Border) */}
                <button
                  type="button"
                  disabled={isVariantOutOfStock}
                  onClick={handleAddToCart}
                  className={`flex-1 py-4 px-6 rounded-full font-bold text-xs sm:text-sm border-2 border-black flex items-center justify-center gap-2 transition-all active:scale-[0.98] ${
                    isVariantOutOfStock
                      ? "bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed"
                      : added
                      ? "bg-emerald-600 border-emerald-600 text-white"
                      : "bg-white text-black hover:bg-gray-50"
                  }`}
                >
                  {added ? (
                    <>
                      <Check className="w-4 h-4" />
                      <span>Added to Bag!</span>
                    </>
                  ) : (
                    <>
                      <ShoppingBag className="w-4 h-4" />
                      <span>Add to Bag</span>
                    </>
                  )}
                </button>

                {/* 2. Buy Now (Black Filled) */}
                <button
                  type="button"
                  disabled={isVariantOutOfStock || buyingNow}
                  onClick={handleBuyNow}
                  className={`flex-1 py-4 px-6 rounded-full font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all active:scale-[0.98] ${
                    isVariantOutOfStock
                      ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                      : "bg-black text-white hover:bg-gray-800 shadow-md"
                  }`}
                >
                  {buyingNow ? (
                    <span>Proceeding...</span>
                  ) : (
                    <>
                      <span>Buy Now</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>

              {/* ── Trust Badges ── */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 bg-[#FAFAFA] border border-[#EAEAEA] rounded-2xl text-xs text-gray-700">
                <div className="flex items-center gap-2.5">
                  <ShieldCheck className="w-4 h-4 text-black shrink-0" />
                  <span className="font-bold">{product.warranty || "Genuine Warranty"}</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <Banknote className="w-4 h-4 text-black shrink-0" />
                  <span>Cash on Delivery</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <Truck className="w-4 h-4 text-black shrink-0" />
                  <span>{product.delivery_info || "Express Delivery Sri Lanka"}</span>
                </div>
              </div>

            </div>
          </div>

        </div>

        {/* ── 3. Content Tabs Below ── */}
        <div className="mt-16 sm:mt-20 border-t border-[#EAEAEA] pt-10">
          <div className="flex items-center gap-6 border-b border-[#EAEAEA] overflow-x-auto no-scrollbar mb-8">
            <button
              onClick={() => setActiveTab("description")}
              className={`pb-4 text-xs sm:text-sm font-bold transition-all relative shrink-0 ${
                activeTab === "description" ? "text-black" : "text-gray-400 hover:text-black"
              }`}
            >
              Description
              {activeTab === "description" && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-black" />
              )}
            </button>

            <button
              onClick={() => setActiveTab("specifications")}
              className={`pb-4 text-xs sm:text-sm font-bold transition-all relative shrink-0 ${
                activeTab === "specifications" ? "text-black" : "text-gray-400 hover:text-black"
              }`}
            >
              Specifications
              {activeTab === "specifications" && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-black" />
              )}
            </button>

            <button
              onClick={() => setActiveTab("warranty")}
              className={`pb-4 text-xs sm:text-sm font-bold transition-all relative shrink-0 ${
                activeTab === "warranty" ? "text-black" : "text-gray-400 hover:text-black"
              }`}
            >
              Warranty & Delivery
              {activeTab === "warranty" && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-black" />
              )}
            </button>
          </div>

          <div className="max-w-4xl">
            {activeTab === "description" && (
              <div className="prose prose-sm max-w-none text-gray-700 leading-relaxed space-y-4">
                <p>{product.description}</p>
              </div>
            )}

            {activeTab === "specifications" && (
              <div className="border border-[#EAEAEA] rounded-2xl overflow-hidden">
                <table className="w-full text-xs sm:text-sm text-left">
                  <tbody>
                    {product.specifications && Object.keys(product.specifications).length > 0 ? (
                      Object.entries(product.specifications).map(([key, val], idx) => (
                        <tr
                          key={key}
                          className={idx % 2 === 0 ? "bg-[#FAFAFA]" : "bg-white"}
                        >
                          <td className="px-5 py-3.5 font-bold text-black border-r border-[#EAEAEA] w-1/3">
                            {key}
                          </td>
                          <td className="px-5 py-3.5 text-gray-700">{val}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td className="px-5 py-4 text-gray-400">
                          General product specifications included with manufacturer packaging.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}

            {activeTab === "warranty" && (
              <div className="space-y-4 text-xs sm:text-sm text-gray-700 leading-relaxed bg-[#FAFAFA] border border-[#EAEAEA] rounded-2xl p-6">
                <div className="flex items-start gap-3">
                  <ShieldCheck className="w-5 h-5 text-black shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-bold text-black mb-1">Warranty Details</h4>
                    <p>{product.warranty || "1 Year Company Warranty against manufacturer defects."}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 pt-3 border-t border-[#EAEAEA]">
                  <Truck className="w-5 h-5 text-black shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-bold text-black mb-1">Delivery Information</h4>
                    <p>{product.delivery_info || "Express island-wide delivery in Sri Lanka within 1-3 business days. Cash on delivery available."}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ── 4. Intelligent Recommendations ("Complete Your Setup") ── */}
        <CompleteYourSetup currentProduct={product} allProducts={allProducts} />
      </div>
    </div>
  );
}
