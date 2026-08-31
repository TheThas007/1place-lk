"use client";

import { useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { useCart, CartItem } from "@/lib/cart-context";
import { setPendingPurchaseIntent, sanitizeReturnUrl } from "@/lib/auth-intent";
import { setSelectedCheckoutItems } from "@/lib/checkout-store";
import { Product } from "@/lib/types";

export interface PurchaseGuardActionOptions {
  action: "add-to-cart" | "buy-now";
  product: Product | { id: string; name: string; price: number; [key: string]: any };
  color?: string;
  storage?: string;
  ram?: string;
  variantId?: string;
  quantity?: number;
  maxStock?: number;
  image?: string;
  warrantyTitle?: string;
  warrantyPrice?: number;
  returnUrl?: string;
  onSuccess?: () => void;
}

export function usePurchaseGuard() {
  const { user, loading } = useAuth();
  const { addToCart } = useCart();
  const router = useRouter();

  const handleAuthenticatedPurchase = useCallback(
    (options: PurchaseGuardActionOptions) => {
      const currentPath =
        typeof window !== "undefined"
          ? window.location.pathname + window.location.search
          : "/products";
      const returnUrl = sanitizeReturnUrl(options.returnUrl || currentPath, "/products");

      // 1. Guest Check: If not logged in, save pending intent and redirect to login
      if (!user) {
        setPendingPurchaseIntent({
          action: options.action,
          productId: options.product.id,
          variantId: options.variantId,
          color: options.color || options.product.colors?.[0],
          storage: options.storage || options.product.storage_options?.[0],
          ram: options.ram,
          quantity: options.quantity || 1,
          returnUrl,
        });

        const safeRedirectParam = encodeURIComponent(returnUrl);
        router.push(`/login?redirect=${safeRedirectParam}&intent=${options.action}`);
        return false;
      }

      // 2. Authenticated User: Execute action immediately
      const item: CartItem = {
        productId: options.product.id,
        name: options.product.name,
        price: options.product.price,
        image: options.image || options.product.images?.[0] || "/placeholder-phone.webp",
        quantity: options.quantity || 1,
        maxStock: options.maxStock,
        color: options.color || options.product.colors?.[0],
        storage: options.storage || options.product.storage_options?.[0],
        ram: options.ram,
        variantId: options.variantId,
        warrantyTitle: options.warrantyTitle,
        warrantyPrice: options.warrantyPrice,
        allow_cod: options.product.allow_cod !== false,
        allow_card: options.product.allow_card !== false,
        allow_whatsapp: options.product.allow_whatsapp !== false,
      };

      if (options.action === "buy-now") {
        setSelectedCheckoutItems([item]);
        router.push("/checkout");
      } else {
        addToCart(item);
        if (options.onSuccess) {
          options.onSuccess();
        }
      }

      return true;
    },
    [user, addToCart, router]
  );

  return {
    user,
    loading,
    isAuthenticated: Boolean(user),
    handleAuthenticatedPurchase,
  };
}
