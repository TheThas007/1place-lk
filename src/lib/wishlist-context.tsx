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

const WISHLIST_KEY = "oneplace_guest_wishlist";

export function WishlistProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [wishlist, setWishlist] = useState<string[]>([]);
  const isInitialized = useRef(false);

  // Load wishlist on mount or user change
  useEffect(() => {
    isInitialized.current = false;
    const loadWishlist = async () => {
      let localItems: string[] = [];
      try {
        const stored = localStorage.getItem(WISHLIST_KEY);
        if (stored) {
          localItems = JSON.parse(stored);
        }
      } catch (e) {
        console.warn("Could not read local wishlist:", e);
      }

      if (user) {
        try {
          const ref = doc(db, "wishlists", user.uid);
          const snap = await getDoc(ref);
          let remoteItems: string[] = [];
          if (snap.exists() && Array.isArray(snap.data().items)) {
            remoteItems = snap.data().items;
          }

          if (localItems.length > 0) {
            const combined = Array.from(new Set([...remoteItems, ...localItems]));
            setWishlist(combined);
            await setDoc(ref, { items: combined, updatedAt: new Date().toISOString() }, { merge: true });
            localStorage.removeItem(WISHLIST_KEY);
          } else {
            setWishlist(remoteItems);
          }
        } catch (e) {
          console.warn("Error loading remote wishlist:", e);
          setWishlist(localItems);
        }
      } else {
        setWishlist(localItems);
      }
      isInitialized.current = true;
    };

    loadWishlist();
  }, [user?.uid]);

  // Persist changes
  useEffect(() => {
    if (!isInitialized.current) return;

    if (user) {
      const ref = doc(db, "wishlists", user.uid);
      setDoc(ref, { items: wishlist, updatedAt: new Date().toISOString() }, { merge: true }).catch(() => {});
    } else {
      try {
        localStorage.setItem(WISHLIST_KEY, JSON.stringify(wishlist));
      } catch {}
    }
  }, [wishlist, user]);

  const toggleWishlist = useCallback((productId: string) => {
    if (!productId) return;
    setWishlist((prev) => {
      if (prev.includes(productId)) {
        return prev.filter((id) => id !== productId);
      } else {
        return [...prev, productId];
      }
    });
  }, []);

  const isInWishlist = useCallback(
    (productId: string) => {
      if (!productId) return false;
      return wishlist.includes(productId);
    },
    [wishlist]
  );

  const clearWishlist = useCallback(() => {
    setWishlist([]);
    try {
      localStorage.removeItem(WISHLIST_KEY);
    } catch {}
  }, []);

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
  return ctx || defaultWishlistContext;
}
