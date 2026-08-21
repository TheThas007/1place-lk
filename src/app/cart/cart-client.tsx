"use client";

import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ShoppingBag,
  Trash2,
  Plus,
  Minus,
  ArrowRight,
  ChevronRight,
  ShieldCheck,
  Check,
  Heart,
} from "lucide-react";
import { useCart, CartItem } from "@/lib/cart-context";
import { useWishlist } from "@/lib/wishlist-context";
import { formatPrice } from "@/lib/utils";
import { setSelectedCheckoutItems } from "@/lib/checkout-store";

export default function CartClient() {
  const router = useRouter();
  const { cart, updateQuantity, removeFromCart } = useCart();
  const { wishlist, toggleWishlist } = useWishlist();

  // Selected item IDs (by unique key: productId + variantId)
  const getItemKey = (item: CartItem) => `${item.productId}_${item.variantId || ""}_${item.color || ""}_${item.storage || ""}`;

  const [selectedKeys, setSelectedKeys] = useState<string[]>([]);

  // Initialize selected keys when cart loads
  useEffect(() => {
    if (cart.length > 0 && selectedKeys.length === 0) {
      setSelectedKeys(cart.map((i) => getItemKey(i)));
    }
  }, [cart]);

  const isAllSelected = cart.length > 0 && selectedKeys.length === cart.length;

  const toggleSelectAll = () => {
    if (isAllSelected) {
      setSelectedKeys([]);
    } else {
      setSelectedKeys(cart.map((i) => getItemKey(i)));
    }
  };

  const toggleSelectItem = (key: string) => {
    if (selectedKeys.includes(key)) {
      setSelectedKeys(selectedKeys.filter((k) => k !== key));
    } else {
      setSelectedKeys([...selectedKeys, key]);
    }
  };

  // Selected items & total calculation
  const selectedItems = useMemo(() => {
    return cart.filter((item) => selectedKeys.includes(getItemKey(item)));
  }, [cart, selectedKeys]);

  const selectedSubtotal = useMemo(() => {
    return selectedItems.reduce((acc, item) => acc + item.price * item.quantity, 0);
  }, [selectedItems]);

  const handleProceedToCheckout = () => {
    if (selectedItems.length === 0) return;
    setSelectedCheckoutItems(selectedItems);
    router.push("/checkout");
  };

  return (
    <div className="bg-white min-h-screen pt-[88px] sm:pt-[96px] pb-24 text-black">
      {/* ── Breadcrumbs ── */}
      <div className="border-b border-[#EAEAEA] bg-white">
        <div className="max-w-7xl mx-auto px-4 lg:px-6 py-3.5">
          <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-500 font-medium">
            <Link href="/" className="hover:text-black transition-colors">
              Home
            </Link>
            <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
            <span className="text-black font-semibold">Shopping Bag</span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 lg:px-6 pt-8">
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight mb-8">
          Shopping Bag ({cart.length})
        </h1>

        {cart.length === 0 ? (
          <div className="text-center py-20 bg-[#FAFAFA] border border-[#EAEAEA] rounded-3xl max-w-xl mx-auto p-8">
            <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
              <ShoppingBag className="w-8 h-8 text-gray-400" />
            </div>
            <h2 className="text-xl font-bold mb-2">Your Shopping Bag is Empty</h2>
            <p className="text-sm text-gray-500 mb-6 max-w-md mx-auto">
              Explore our latest lineup of smartphones, laptops and genuine tech accessories.
            </p>
            <Link
              href="/products"
              className="inline-flex items-center gap-2 px-8 py-3.5 bg-black text-white font-bold rounded-full hover:bg-gray-800 transition-all shadow-md text-sm"
            >
              Continue Shopping
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        ) : (
          <div className="grid lg:grid-cols-12 gap-10 items-start">
            
            {/* ── Left Column: Items List ── */}
            <div className="lg:col-span-8 space-y-4">
              
              {/* Select All Row */}
              <div className="flex items-center justify-between p-4 bg-[#FAFAFA] border border-[#EAEAEA] rounded-2xl">
                <button
                  type="button"
                  onClick={toggleSelectAll}
                  className="flex items-center gap-3 text-xs sm:text-sm font-bold text-black"
                >
                  <div
                    className={`w-5 h-5 rounded-md border flex items-center justify-center transition-all ${
                      isAllSelected ? "bg-black border-black text-white" : "border-gray-300 bg-white"
                    }`}
                  >
                    {isAllSelected && <Check className="w-3.5 h-3.5" />}
                  </div>
                  <span>Select All ({cart.length} Items)</span>
                </button>

                <span className="text-xs text-gray-500 font-medium">
                  {selectedItems.length} selected
                </span>
              </div>

              {/* Product Cards */}
              <div className="space-y-4">
                {cart.map((item) => {
                  const key = getItemKey(item);
                  const isSelected = selectedKeys.includes(key);
                  const isWishlisted = wishlist.includes(item.productId);

                  return (
                    <div
                      key={key}
                      className={`p-4 sm:p-5 rounded-2xl border transition-all ${
                        isSelected
                          ? "border-black bg-white shadow-xs"
                          : "border-[#EAEAEA] bg-white opacity-80"
                      }`}
                    >
                      <div className="flex items-start gap-4">
                        {/* Checkbox */}
                        <button
                          type="button"
                          onClick={() => toggleSelectItem(key)}
                          className="mt-2 shrink-0"
                        >
                          <div
                            className={`w-5 h-5 rounded-md border flex items-center justify-center transition-all ${
                              isSelected ? "bg-black border-black text-white" : "border-gray-300 bg-white"
                            }`}
                          >
                            {isSelected && <Check className="w-3.5 h-3.5" />}
                          </div>
                        </button>

                        {/* Product Image */}
                        <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-xl bg-white border border-[#EAEAEA] p-2 shrink-0 flex items-center justify-center">
                          <img
                            src={item.image}
                            alt={item.name}
                            className="w-full h-full object-contain mix-blend-multiply"
                          />
                        </div>

                        {/* Details */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2 mb-1">
                            <h3 className="font-bold text-sm sm:text-base text-black truncate">
                              {item.name}
                            </h3>
                            <span className="font-black text-sm sm:text-base text-black shrink-0">
                              {formatPrice(item.price * item.quantity)}
                            </span>
                          </div>

                          {/* Variants & Warranty tags */}
                          <div className="flex flex-wrap gap-2 text-[11px] text-gray-500 mb-3 font-medium">
                            {item.color && (
                              <span className="bg-gray-100 px-2 py-0.5 rounded-md text-gray-700">
                                Colour: {item.color}
                              </span>
                            )}
                            {(item.ram || item.storage) && (
                              <span className="bg-gray-100 px-2 py-0.5 rounded-md text-gray-700">
                                Specs: {[item.ram, item.storage].filter(Boolean).join(" + ")}
                              </span>
                            )}
                            {item.warrantyTitle && (
                              <span className="bg-emerald-50 text-emerald-800 border border-emerald-100 px-2 py-0.5 rounded-md flex items-center gap-1">
                                <ShieldCheck className="w-3 h-3" />
                                {item.warrantyTitle}
                              </span>
                            )}
                          </div>

                          {/* Action Buttons & Quantity */}
                          <div className="flex items-center justify-between pt-2 border-t border-[#EAEAEA]">
                            <div className="flex items-center gap-3">
                              {/* Remove */}
                              <button
                                type="button"
                                onClick={() => removeFromCart(item.productId)}
                                className="text-xs text-gray-400 hover:text-red-600 transition-colors flex items-center gap-1"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                                Remove
                              </button>

                              {/* Wishlist */}
                              <button
                                type="button"
                                onClick={() => toggleWishlist(item.productId)}
                                className={`text-xs flex items-center gap-1 transition-colors ${
                                  isWishlisted ? "text-red-500 font-semibold" : "text-gray-400 hover:text-black"
                                }`}
                              >
                                <Heart className={`w-3.5 h-3.5 ${isWishlisted ? "fill-red-500" : ""}`} />
                                {isWishlisted ? "Saved" : "Save for Later"}
                              </button>
                            </div>

                            {/* Quantity Controls */}
                            <div className="inline-flex items-center border border-[#EAEAEA] rounded-full p-0.5 bg-white">
                              <button
                                type="button"
                                onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                                className="w-6 h-6 rounded-full flex items-center justify-center text-gray-600 hover:text-black hover:bg-gray-100 transition-colors"
                              >
                                <Minus className="w-3 h-3" />
                              </button>
                              <span className="w-8 text-center text-xs font-bold text-black">
                                {item.quantity}
                              </span>
                              <button
                                type="button"
                                onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                                className="w-6 h-6 rounded-full flex items-center justify-center text-gray-600 hover:text-black hover:bg-gray-100 transition-colors"
                              >
                                <Plus className="w-3 h-3" />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* ── Right Column: Order Summary ── */}
            <div className="lg:col-span-4 sticky top-28">
              <div className="p-6 bg-[#FAFAFA] border border-[#EAEAEA] rounded-3xl space-y-5">
                <h2 className="text-lg font-bold text-black pb-3 border-b border-[#EAEAEA]">
                  Order Summary
                </h2>

                <div className="space-y-3 text-xs sm:text-sm text-gray-600">
                  <div className="flex justify-between">
                    <span>Selected Items ({selectedItems.length})</span>
                    <span className="font-bold text-black">{formatPrice(selectedSubtotal)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Delivery Charges</span>
                    <span className="text-emerald-600 font-semibold">Calculated at Checkout</span>
                  </div>
                </div>

                <div className="pt-4 border-t border-[#EAEAEA] flex items-baseline justify-between">
                  <span className="font-bold text-black text-sm sm:text-base">Subtotal</span>
                  <span className="font-black text-xl sm:text-2xl text-black">
                    {formatPrice(selectedSubtotal)}
                  </span>
                </div>

                {/* Primary CTA */}
                <button
                  type="button"
                  disabled={selectedItems.length === 0}
                  onClick={handleProceedToCheckout}
                  className={`w-full py-4 px-6 rounded-full font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all shadow-md active:scale-[0.98] ${
                    selectedItems.length === 0
                      ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                      : "bg-black text-white hover:bg-gray-800"
                  }`}
                >
                  <span>Proceed to Buy ({selectedItems.length} Items)</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <p className="text-[11px] text-gray-400 text-center">
                  🔒 Safe & Secure Checkout with Street Mobile
                </p>
              </div>
            </div>

          </div>
        )}
      </div>

      {/* ── Mobile Sticky Bottom Checkout Bar (Screens < 1024px) ── */}
      {cart.length > 0 && (
        <div className="lg:hidden fixed bottom-14 sm:bottom-16 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-neutral-200 px-4 py-3 shadow-lg flex items-center justify-between gap-3 safe-bottom">
          <div className="flex flex-col min-w-0">
            <span className="text-[10px] text-neutral-500 font-semibold uppercase">
              Total ({selectedItems.length} items)
            </span>
            <span className="text-base font-black text-black leading-tight truncate">
              {formatPrice(selectedSubtotal)}
            </span>
          </div>

          <button
            type="button"
            disabled={selectedItems.length === 0}
            onClick={handleProceedToCheckout}
            className="px-6 py-3 rounded-full bg-black text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 shadow-md disabled:opacity-50 active:scale-95 transition-all shrink-0 cursor-pointer"
          >
            <span>Proceed to Buy</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </div>
  );
}
