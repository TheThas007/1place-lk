"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
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
  storage?: string;
  allow_cod?: boolean;
  allow_card?: boolean;
  allow_whatsapp?: boolean;
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

  // Load cart on user change
  useEffect(() => {
    const load = async () => {
      if (user) {
        try {
          const ref = doc(db, "carts", user.uid);
          const snap = await getDoc(ref);
          if (snap.exists()) {
            setCart(snap.data().items || []);
          } else {
            // Merge guest cart into user cart on first sign in
            const guest = localStorage.getItem(CART_KEY);
            const guestItems: CartItem[] = guest ? JSON.parse(guest) : [];
            setCart(guestItems);
            if (guestItems.length > 0) {
              await setDoc(ref, { items: guestItems });
              localStorage.removeItem(CART_KEY);
            }
          }
        } catch {
          setCart([]);
        }
      } else {
        const guest = localStorage.getItem(CART_KEY);
        setCart(guest ? JSON.parse(guest) : []);
      }
    };
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.uid]);

  // Persist cart whenever it changes
  useEffect(() => {
    if (user) {
      const ref = doc(db, "carts", user.uid);
      setDoc(ref, { items: cart }).catch(() => {});
    } else {
      localStorage.setItem(CART_KEY, JSON.stringify(cart));
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

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside CartProvider");
  return ctx;
}
