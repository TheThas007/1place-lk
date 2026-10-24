"use client";

/**
 * PayHere Sri Lanka Payment Gateway Client Integration for 1place.lk
 */

export interface PayHereSDK {
  startPayment: (paymentObject: Record<string, unknown>) => void;
  onCompleted?: (orderId: string) => void;
  onDismissed?: () => void;
  onError?: (error: unknown) => void;
}

declare global {
  interface Window {
    payhere?: PayHereSDK;
  }
}

export interface PayHerePaymentOptions {
  orderId: string;
  amount: number;
  currency?: string;
  customerFirstName: string;
  customerLastName?: string;
  email: string;
  phone: string;
  address?: string;
  city?: string;
  items?: string;
  onCompleted?: (orderId: string) => void;
  onDismissed?: () => void;
  onError?: (error: unknown) => void;
}

/**
 * Ensures the official PayHere JS SDK is loaded and available on window.
 */
export function loadPayHereScript(): Promise<PayHereSDK> {
  return new Promise((resolve, reject) => {
    if (typeof window === "undefined") {
      return reject(new Error("Cannot load PayHere SDK on server side."));
    }

    if (window.payhere) {
      return resolve(window.payhere);
    }

    const scriptId = "payhere-sdk-script";
    let script = document.getElementById(scriptId) as HTMLScriptElement | null;

    if (script) {
      script.addEventListener("load", () => {
        if (window.payhere) {
          resolve(window.payhere);
        } else {
          reject(new Error("PayHere SDK script loaded, but window.payhere is undefined."));
        }
      });
      script.addEventListener("error", (e) => reject(e));
      return;
    }

    script = document.createElement("script");
    script.id = scriptId;
    script.src = "https://www.payhere.lk/lib/payhere.js";
    script.async = true;
    script.onload = () => {
      if (window.payhere) {
        resolve(window.payhere);
      } else {
        reject(new Error("PayHere SDK loaded without global object."));
      }
    };
    script.onerror = () => {
      reject(new Error("Failed to load PayHere JavaScript SDK from https://www.payhere.lk/lib/payhere.js"));
    };

    document.body.appendChild(script);
  });
}

/**
 * Formats a Sri Lankan phone number for PayHere (cleans spaces, dashes, etc.)
 */
export function sanitizePhoneNumber(phone: string): string {
  const cleaned = phone.replace(/[\s\-()]/g, "");
  if (!cleaned) return "0771234567";
  return cleaned;
}

/**
 * Truncates and sanitizes item description for PayHere iframe URL compatibility
 */
export function sanitizeItemsDescription(items: string, maxLength = 200): string {
  if (!items || !items.trim()) return "1place.lk Purchase";
  const singleLine = items.replace(/[\r\n\t]+/g, " ").replace(/"/g, "'").trim();
  if (singleLine.length > maxLength) {
    return singleLine.slice(0, maxLength - 3) + "...";
  }
  return singleLine;
}

/**
 * Launches the PayHere secure payment modal
 */
export async function launchPayHerePayment(options: PayHerePaymentOptions): Promise<void> {
  const {
    orderId,
    amount,
    currency = "LKR",
    customerFirstName,
    customerLastName,
    email,
    phone,
    address,
    city,
    items,
    onCompleted,
    onDismissed,
    onError,
  } = options;

  // 1. Fetch server-generated secure MD5 hash and config
  const hashRes = await fetch("/api/payhere/hash", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      orderId,
      amount,
      currency,
    }),
  });

  if (!hashRes.ok) {
    const errData = (await hashRes.json().catch(() => ({}))) as { error?: string };
    throw new Error(errData.error || `Payment initialization failed with status ${hashRes.status}`);
  }

  const hashData = (await hashRes.json()) as {
    hash?: string;
    merchantId?: string;
    amount?: string;
    currency?: string;
    returnUrl?: string;
    cancelUrl?: string;
    notifyUrl?: string;
    sandbox?: boolean;
    error?: string;
  };

  if (!hashData.hash || !hashData.merchantId) {
    throw new Error(hashData.error || "Missing PayHere security hash from server.");
  }

  // 2. Load PayHere SDK script
  const payhere = await loadPayHereScript();

  // 3. Prepare sanitized customer details
  const cleanFirstName = customerFirstName?.trim() || "Valued";
  const cleanLastName = customerLastName?.trim() || "Customer";
  const cleanPhone = sanitizePhoneNumber(phone);
  const cleanAddress = address?.trim() || "Colombo, Sri Lanka";
  const cleanCity = city?.trim() || "Colombo";
  const cleanItems = sanitizeItemsDescription(items || `1place.lk Order #${orderId}`);

  // 4. Construct PayHere Payment Payload
  const payment: Record<string, unknown> = {
    sandbox: hashData.sandbox === true,
    merchant_id: hashData.merchantId,
    return_url: `${hashData.returnUrl}?order_id=${encodeURIComponent(orderId)}`,
    cancel_url: `${hashData.cancelUrl}?order_id=${encodeURIComponent(orderId)}`,
    notify_url: hashData.notifyUrl,
    order_id: orderId,
    items: cleanItems,
    amount: hashData.amount,
    currency: hashData.currency || "LKR",
    hash: hashData.hash,
    first_name: cleanFirstName,
    last_name: cleanLastName,
    email: email?.trim() || "customer@1place.lk",
    phone: cleanPhone,
    address: cleanAddress,
    city: cleanCity,
    country: "Sri Lanka",
  };

  // 5. Attach event callbacks
  payhere.onCompleted = function (completedOrderId: string) {
    console.log("[PayHere SDK] Payment completed for order:", completedOrderId);
    if (onCompleted) onCompleted(completedOrderId || orderId);
  };

  payhere.onDismissed = function () {
    console.log("[PayHere SDK] Payment dismissed by user.");
    if (onDismissed) onDismissed();
  };

  payhere.onError = function (error: unknown) {
    console.error("[PayHere SDK] Payment error:", error);
    if (onError) onError(error);
  };

  // 6. Launch Payment Modal
  payhere.startPayment(payment);
}
