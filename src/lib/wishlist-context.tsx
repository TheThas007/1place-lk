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

interface WishlistContextType {
  wishlist: string[]; // Array of productIds
  toggleWishlist: (productId: string) => void;
  isInWishlist: (productId: string) => boolean;
  clearWishlist: () => void;
}

const WishlistContext = createContext<WishlistContextType | null>(null);

const WISHLIST_KEY = "sm_guest_wishlist";

export function WishlistProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [wishlist, setWishlist] = useState<string[]>([]);
  const loaded = useRef(false);

  // Load wishlist on user change
  useEffect(() => {
    loaded.current = false;
    const load = async () => {
      if (user) {
        try {
          const ref = doc(db, "carts", user.uid);
          const snap = await getDoc(ref);
          if (snap.exists()) {
            setWishlist(snap.data().wishlist || []);
          } else {
            // Merge guest wishlist into user wishlist on first sign in
            const guest = localStorage.getItem(WISHLIST_KEY);
            const guestItems: string[] = guest ? JSON.parse(guest) : [];
            setWishlist(guestItems);
            if (guestItems.length > 0) {
              await setDoc(ref, { wishlist: guestItems }, { merge: true });
              localStorage.removeItem(WISHLIST_KEY);
            }
          }
        } catch (e) {
          console.error("Error loading wishlist:", e);
          setWishlist([]);
        }
      } else {
        const guest = localStorage.getItem(WISHLIST_KEY);
        setWishlist(guest ? JSON.parse(guest) : []);
      }
      loaded.current = true;
    };
    load();
  }, [user?.uid]);

  // Persist wishlist whenever it changes — but only after initial load
  useEffect(() => {
    if (!loaded.current) return;
    if (user) {
      const ref = doc(db, "carts", user.uid);
      const cleanWishlist = JSON.parse(JSON.stringify(wishlist));
      setDoc(ref, { wishlist: cleanWishlist }, { merge: true }).catch(() => {});
    } else {
      localStorage.setItem(WISHLIST_KEY, JSON.stringify(wishlist));
    }
  }, [wishlist, user]);

  const toggleWishlist = useCallback((productId: string) => {
    setWishlist((prev) => {
      if (prev.includes(productId)) {
        return prev.filter((id) => id !== productId);
      } else {
        return [...prev, productId];
      }
    });
  }, []);

  const isInWishlist = useCallback((productId: string) => {
    return wishlist.includes(productId);
  }, [wishlist]);

  const clearWishlist = useCallback(() => setWishlist([]), []);

  return (
    <WishlistContext.Provider
      value={{ wishlist, toggleWishlist, isInWishlist, clearWishlist }}
    >
      {children}
    </WishlistContext.Provider>
  );
}

const defaultWishlistContext: WishlistContextType = {
  wishlist: [],
  toggleWishlist: () => {},
  isInWishlist: () => false,
  clearWishlist: () => {},
};

export function useWishlist() {
  const ctx = useContext(WishlistContext);
  if (!ctx) {
    return defaultWishlistContext;
  }
  return ctx;
}
