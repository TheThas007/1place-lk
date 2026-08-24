import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { CartItem } from "@/lib/cart-context";
import { setSelectedCheckoutItems } from "@/lib/checkout-store";

export interface PendingPurchaseIntent {
  action: "add-to-cart" | "buy-now";
  productId: string;
  variantId?: string;
  color?: string;
  storage?: string;
  ram?: string;
  quantity: number;
  returnUrl?: string;
  timestamp: number;
}

const INTENT_KEY = "sm_pending_purchase_intent";
const INTENT_MAX_AGE_MS = 30 * 60 * 1000; // 30 minutes

/**
 * Sanitizes return URLs to strictly prevent open redirect vulnerabilities.
 * Only internal relative paths starting with a single '/' are permitted.
 */
export function sanitizeReturnUrl(url?: string | null, fallback = "/"): string {
  if (!url || typeof url !== "string") return fallback;
  const trimmed = url.trim();

  // Block external URLs and protocol-relative URLs
  if (
    trimmed.startsWith("http://") ||
    trimmed.startsWith("https://") ||
    trimmed.startsWith("//") ||
    trimmed.startsWith("javascript:") ||
    trimmed.startsWith("data:") ||
    !trimmed.startsWith("/")
  ) {
    return fallback;
  }

  return trimmed;
}

/**
 * Stores a pending purchase/cart intent before redirecting the guest to login.
 */
export function setPendingPurchaseIntent(intent: Omit<PendingPurchaseIntent, "timestamp">): void {
  if (typeof window === "undefined") return;
  try {
    const payload: PendingPurchaseIntent = {
      ...intent,
      returnUrl: sanitizeReturnUrl(intent.returnUrl, "/"),
      timestamp: Date.now(),
    };
    sessionStorage.setItem(INTENT_KEY, JSON.stringify(payload));
  } catch (e) {
    console.warn("Could not save pending purchase intent:", e);
  }
}

/**
 * Retrieves the pending purchase intent if it exists and has not expired.
 */
export function getPendingPurchaseIntent(): PendingPurchaseIntent | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(INTENT_KEY);
    if (!raw) return null;
    const parsed: PendingPurchaseIntent = JSON.parse(raw);

    if (!parsed || !parsed.productId || !parsed.action) {
      clearPendingPurchaseIntent();
      return null;
    }

    // Check expiry
    if (Date.now() - parsed.timestamp > INTENT_MAX_AGE_MS) {
      clearPendingPurchaseIntent();
      return null;
    }

    return {
      ...parsed,
      returnUrl: sanitizeReturnUrl(parsed.returnUrl, "/"),
    };
  } catch {
    clearPendingPurchaseIntent();
    return null;
  }
}

/**
 * Clears the pending purchase intent to prevent duplicate replays.
 */
export function clearPendingPurchaseIntent(): void {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.removeItem(INTENT_KEY);
  } catch {}
}

/**
 * Validates product & variant data from Firestore and safely resumes the intended action.
 */
export async function executePendingPurchaseIntent(
  intent: PendingPurchaseIntent,
  addToCart: (item: CartItem) => void,
  router: { push: (url: string) => void }
): Promise<{ success: boolean; message?: string }> {
  clearPendingPurchaseIntent();

  try {
    // 1. Revalidate product from Firestore
    const prodRef = doc(db, "products", intent.productId);
    const prodSnap = await getDoc(prodRef);

    if (!prodSnap.exists()) {
      return { success: false, message: "The requested product is no longer available." };
    }

    const product = { id: prodSnap.id, ...prodSnap.data() } as any;

    if (product.status === "inactive" || product.status === "draft") {
      return { success: false, message: "This product is currently unavailable." };
    }

    // Check out of stock status
    const isOutOfStock =
      product.stock_status === "out_of_stock" ||
      (typeof product.stock_count === "number" && product.stock_count <= 0);

    if (isOutOfStock) {
      return { success: false, message: "This product is currently out of stock." };
    }

    // 2. Validate variant price & combo
    let resolvedPrice = product.price || 0;
    let resolvedImage = product.images?.[0] || "/placeholder-phone.webp";

    // Match variant combo if specified
    if (product.variant_combos && product.variant_combos.length > 0) {
      const matchedCombo = product.variant_combos.find((combo: any) => {
        const colorMatch = !intent.color || combo.color_name?.toLowerCase() === intent.color.toLowerCase();
        const storageMatch = !intent.storage || combo.storage === intent.storage;
        return colorMatch && storageMatch;
      });

      if (matchedCombo) {
        if (matchedCombo.price && Number(matchedCombo.price) > 0) {
          resolvedPrice = Number(matchedCombo.price);
        }
        if (matchedCombo.image_ref) {
          resolvedImage = matchedCombo.image_ref;
        }
      }
    } else if (intent.storage && product.storage_prices && product.storage_prices[intent.storage]) {
      resolvedPrice = Number(product.storage_prices[intent.storage]);
    }

    // Match color variant image if present
    if (product.color_variants && intent.color) {
      const matchedColor = product.color_variants.find(
        (c: any) => c.name?.toLowerCase() === intent.color?.toLowerCase()
      );
      if (matchedColor && matchedColor.images?.[0]) {
        resolvedImage = matchedColor.images[0];
      }
    }

    const cartItem: CartItem = {
      productId: product.id,
      name: product.name,
      price: resolvedPrice,
      image: resolvedImage,
      quantity: Math.max(1, intent.quantity || 1),
      color: intent.color || product.colors?.[0],
      storage: intent.storage || product.storage_options?.[0],
      ram: intent.ram,
      variantId: intent.variantId,
      allow_cod: product.allow_cod !== false,
      allow_card: product.allow_card !== false,
      allow_whatsapp: product.allow_whatsapp !== false,
    };

    if (intent.action === "buy-now") {
      setSelectedCheckoutItems([cartItem]);
      router.push("/checkout");
      return { success: true };
    } else {
      addToCart(cartItem);
      const safeReturn = sanitizeReturnUrl(intent.returnUrl, "/products");
      router.push(safeReturn);
      return { success: true };
    }
  } catch (err: any) {
    console.error("Error executing pending purchase intent:", err);
    return { success: false, message: "Could not resume your previous action." };
  }
}
