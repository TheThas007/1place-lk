"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Heart, Trash2, ShoppingBag, ArrowLeft, Package } from "lucide-react";
import { useWishlist } from "@/lib/wishlist-context";
import { getProducts } from "@/lib/firestore-client";
import { Product } from "@/lib/types";
import { formatPrice } from "@/lib/utils";
import AddToBagButton from "@/components/cart/AddToBagButton";

export default function WishlistPage() {
  const { wishlist, toggleWishlist, clearWishlist } = useWishlist();
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getProducts().then((res) => {
      setAllProducts(res);
      setLoading(false);
    });
  }, []);

  const savedProducts = allProducts.filter((p) => wishlist.includes(p.id));

  return (
    <div className="bg-white min-h-screen pt-24 pb-20">
      <div className="max-w-7xl mx-auto px-4 lg:px-6">
        {/* Page Header */}
        <div className="flex items-center justify-between border-b border-gray-100 pb-6 mb-8">
          <div>
            <Link
              href="/products"
              className="inline-flex items-center gap-1.5 text-xs text-gray-400 hover:text-black mb-2 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Back to Products
            </Link>
            <h1 className="text-3xl sm:text-4xl font-black text-gray-900 flex items-center gap-2">
              <Heart className="w-7 h-7 text-red-500 fill-red-500" /> My Wishlist
            </h1>
            <p className="text-sm text-gray-400 mt-1">
              {savedProducts.length} {savedProducts.length === 1 ? "item" : "items"} saved for later
            </p>
          </div>

          {savedProducts.length > 0 && (
            <button
              onClick={clearWishlist}
              className="text-xs font-semibold text-red-500 hover:text-red-600 hover:underline transition-all"
            >
              Clear All
            </button>
          )}
        </div>

        {/* Wishlist Grid or Empty State */}
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="aspect-square bg-gray-100 rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : savedProducts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 bg-gray-50 rounded-3xl border border-gray-100 text-center">
            <div className="w-16 h-16 rounded-full bg-red-50 text-red-500 flex items-center justify-center mb-4">
              <Heart className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Your wishlist is empty</h3>
            <p className="text-sm text-gray-400 max-w-sm mb-6">
              Explore our collection and save your favorite smartphones, laptops, and accessories.
            </p>
            <Link
              href="/products"
              className="px-6 py-3 bg-black text-white rounded-xl font-bold text-sm hover:bg-gray-800 transition-all shadow-md"
            >
              Browse Products
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 lg:gap-6">
            {savedProducts.map((product) => (
              <div
                key={product.id}
                className="group relative bg-white border border-gray-100 rounded-2xl overflow-hidden hover:shadow-xl transition-all duration-300 flex flex-col justify-between"
              >
                {/* Remove button */}
                <button
                  onClick={() => toggleWishlist(product.id)}
                  className="absolute top-3 right-3 z-10 p-2 rounded-full bg-white/80 backdrop-blur-md text-red-500 hover:bg-red-500 hover:text-white transition-all shadow"
                  title="Remove from wishlist"
                >
                  <Trash2 className="w-4 h-4" />
                </button>

                {/* Product Image & Info */}
                <Link href={`/products/${product.slug}`} className="block">
                  <div className="aspect-square bg-gray-50 p-4 flex items-center justify-center overflow-hidden">
                    <img
                      src={product.images[0]}
                      alt={product.name}
                      className="w-full h-full object-contain mix-blend-multiply group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                  <div className="p-4">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1">
                      {product.category_name}
                    </span>
                    <h3 className="font-semibold text-sm line-clamp-2 text-gray-900 group-hover:text-blue-600 transition-colors">
                      {product.name}
                    </h3>
                    <div className="mt-2 font-black text-base text-gray-900">
                      {formatPrice(product.price)}
                    </div>
                  </div>
                </Link>

                {/* Add to Bag Button */}
                <div className="p-4 pt-0">
                  <AddToBagButton product={product} size="sm" className="w-full" />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
