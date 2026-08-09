"use client";

import { CartItem } from "@/lib/cart-context";

const CHECKOUT_ITEMS_KEY = "sm_selected_checkout_items";

export function setSelectedCheckoutItems(items: CartItem[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(CHECKOUT_ITEMS_KEY, JSON.stringify(items));
}

export function getSelectedCheckoutItems(): CartItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(CHECKOUT_ITEMS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}
