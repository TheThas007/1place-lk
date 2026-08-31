"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useRef,
  ReactNode,
  useCallback,
} from "react";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/lib/auth-context";

export interface CartItem {
  productId: string;
  name: string;
  price: number;
  image: string;
  quantity: number;
  maxStock?: number;
  color?: string;
  ram?: string;
  storage?: string;
  variantId?: string;
  warrantyId?: string;
  warrantyTitle?: string;
  warrantyPrice?: number;
  allow_cod?: boolean;
  allow_card?: boolean;
  allow_whatsapp?: boolean;
  sku?: string;
}

interface CartContextType {
  cart: CartItem[];
  addToCart: (item: CartItem) => void;
  removeFromCart: (productId: string, variantId?: string, color?: string, storage?: string) => void;
  updateQuantity: (productId: string, quantity: number, variantId?: string, color?: string, storage?: string) => void;
  clearCart: () => void;
  itemCount: number;
  total: number;
}

const CartContext = createContext<CartContextType | null>(null);

function isMatchingItem(a: CartItem, productId: string, variantId?: string, color?: string, storage?: string): boolean {
  if (a.productId !== productId) return false;
  if (variantId !== undefined && a.variantId !== variantId) return false;
  if (color !== undefined && a.color !== color) return false;
  if (storage !== undefined && a.storage !== storage) return false;
  return true;
}

export function CartProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [cart, setCart] = useState<CartItem[]>([]);
  const loaded = useRef(false);

  // Load cart on user change
  useEffect(() => {
    loaded.current = false;
    const load = async () => {
      if (user) {
        try {
          const ref = doc(db, "carts", user.uid);
          const snap = await getDoc(ref);
          if (snap.exists()) {
            setCart(snap.data().items || []);
          } else {
            setCart([]);
          }
        } catch {
          setCart([]);
        }
      } else {
        setCart([]);
      }
      loaded.current = true;
    };
    load();
  }, [user?.uid]);

  // Persist cart whenever it changes — only for authenticated user
  useEffect(() => {
    if (!loaded.current) return;
    if (user) {
      const ref = doc(db, "carts", user.uid);
      const cleanCart = JSON.parse(JSON.stringify(cart));
      setDoc(ref, { items: cleanCart }, { merge: true }).catch(() => {});
    }
  }, [cart, user]);

  const addToCart = useCallback((item: CartItem) => {
    setCart((prev) => {
      const existingIdx = prev.findIndex(
        (i) =>
          i.productId === item.productId &&
          (item.variantId ? i.variantId === item.variantId : true) &&
          (i.color || "") === (item.color || "") &&
          (i.storage || "") === (item.storage || "")
      );

      const maxLimit = typeof item.maxStock === "number" && item.maxStock > 0 ? item.maxStock : 99;

      if (existingIdx >= 0) {
        const updated = [...prev];
        const currentQty = updated[existingIdx].quantity;
        const newQty = Math.min(maxLimit, currentQty + item.quantity);
        updated[existingIdx] = {
          ...updated[existingIdx],
          ...item,
          quantity: newQty,
          maxStock: item.maxStock ?? updated[existingIdx].maxStock,
        };
        return updated;
      }

      const initialQty = Math.min(maxLimit, Math.max(1, item.quantity));
      return [...prev, { ...item, quantity: initialQty }];
    });
  }, []);

  const removeFromCart = useCallback((productId: string, variantId?: string, color?: string, storage?: string) => {
    setCart((prev) =>
      prev.filter((i) => !isMatchingItem(i, productId, variantId, color, storage))
    );
  }, []);

  const updateQuantity = useCallback((productId: string, quantity: number, variantId?: string, color?: string, storage?: string) => {
    if (quantity <= 0) {
      setCart((prev) => prev.filter((i) => !isMatchingItem(i, productId, variantId, color, storage)));
    } else {
      setCart((prev) =>
        prev.map((i) => {
          if (isMatchingItem(i, productId, variantId, color, storage)) {
            const maxLimit = typeof i.maxStock === "number" && i.maxStock > 0 ? i.maxStock : 99;
            const clamped = Math.min(maxLimit, Math.max(1, quantity));
            return { ...i, quantity: clamped };
          }
          return i;
        })
      );
    }
  }, []);

  const clearCart = useCallback(() => setCart([]), []);

  const itemCount = cart.reduce((s, i) => s + i.quantity, 0);
  const total = cart.reduce((s, i) => s + i.price * i.quantity, 0);

  return (
    <CartContext.Provider
      value={{ cart, addToCart, removeFromCart, updateQuantity, clearCart, itemCount, total }}
    >
      {children}
    </CartContext.Provider>
  );
}

const defaultCartContext: CartContextType = {
  cart: [],
  addToCart: () => {},
  removeFromCart: () => {},
  updateQuantity: () => {},
  clearCart: () => {},
  itemCount: 0,
  total: 0,
};

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) {
    return defaultCartContext;
  }
  return ctx;
}
