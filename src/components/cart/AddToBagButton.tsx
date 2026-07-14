"use client";

import { useState } from "react";
import Link from "next/link";
import { ShoppingBag, Check } from "lucide-react";
import { Product } from "@/lib/types";
import { useCart } from "@/lib/cart-context";
import { useAuth } from "@/lib/auth-context";

interface AddToBagButtonProps {
  product: Product;
  className?: string;
  size?: "sm" | "md";
}

export default function AddToBagButton({ product, className = "", size = "md" }: AddToBagButtonProps) {
  const { addToCart } = useCart();
  const { user } = useAuth();
  const [added, setAdded] = useState(false);

  const handleAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!user) {
      // Trigger login modal opening globally
      window.dispatchEvent(new Event("open-auth-modal"));
      return;
    }

    addToCart({
      productId: product.id,
      name: product.name,
      price: product.price,
      image: product.images?.[0] ?? "",
      quantity: 1,
      storage: product.storage_options?.[0],
      color: product.colors?.[0],
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 1800);
  };

  const isSmall = size === "sm";

  return (
    <button
      onClick={handleAdd}
      className={`
        flex items-center justify-center gap-1.5 font-semibold transition-all duration-300 active:scale-[0.96]
        ${isSmall
          ? "px-3 py-2 text-xs rounded-xl"
          : "px-4 py-2.5 text-sm rounded-xl"
        }
        ${added
          ? "bg-emerald-500 text-white"
          : "bg-black text-white hover:bg-neutral-800 border border-white/10"
        }
        ${className}
      `}
    >
      {added ? (
        <>
          <Check className={isSmall ? "w-3 h-3" : "w-4 h-4"} />
          Added!
        </>
      ) : (
        <>
          <ShoppingBag className={isSmall ? "w-3 h-3" : "w-4 h-4"} />
          Add to Bag
        </>
      )}
    </button>
  );
}
