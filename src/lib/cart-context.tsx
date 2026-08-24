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
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  itemCount: number;
  total: number;
}

const CartContext = createContext<CartContextType | null>(null);

const CART_KEY = "sm_guest_cart";

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
      const existing = prev.find(
        (i) =>
          i.productId === item.productId &&
          i.color === item.color &&
          i.storage === item.storage
      );
      if (existing) {
        return prev.map((i) =>
          i.productId === item.productId &&
          i.color === item.color &&
          i.storage === item.storage
            ? { ...i, quantity: i.quantity + item.quantity }
            : i
        );
      }
      return [...prev, item];
    });
  }, []);

  const removeFromCart = useCallback((productId: string) => {
    setCart((prev) => prev.filter((i) => i.productId !== productId));
  }, []);

  const updateQuantity = useCallback((productId: string, quantity: number) => {
    if (quantity <= 0) {
      setCart((prev) => prev.filter((i) => i.productId !== productId));
    } else {
      setCart((prev) =>
        prev.map((i) => (i.productId === productId ? { ...i, quantity } : i))
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
