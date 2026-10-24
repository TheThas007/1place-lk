"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  CheckCircle2,
  Package,
  MapPin,
  Truck,
  ArrowRight,
  ShoppingBag,
  Store,
  Calendar,
  CreditCard,
  ShieldCheck,
  Loader2,
  AlertCircle,
  MessageCircle,
  Phone,
  RefreshCw,
} from "lucide-react";
import { formatPrice } from "@/lib/utils";
import { useCart } from "@/lib/cart-context";
import { db } from "@/lib/firebase";
import { BUSINESS_INFO } from "@/lib/business-info";
import { doc, getDoc, onSnapshot } from "firebase/firestore";
import CheckoutProgress from "@/components/checkout/CheckoutProgress";

function PaymentSuccessContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const orderId = searchParams.get("order_id") || searchParams.get("id");
  const { clearCart } = useCart();

  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [pollCount, setPollCount] = useState(0);

  // Automatically clear cart on successful return from gateway
  useEffect(() => {
    try {
      clearCart();
    } catch {}
  }, [clearCart]);

  // Real-time listener on the Firestore order document to detect IPN webhook confirmation
  useEffect(() => {
    if (!orderId) {
      setLoading(false);
      return;
    }

    const orderRef = doc(db, "orders", orderId);

    // Set up real-time listener
    const unsubscribe = onSnapshot(
      orderRef,
      (docSnap) => {
        if (docSnap.exists()) {
          setOrder({ id: docSnap.id, ...docSnap.data() });
        }
        setLoading(false);
      },
      (err) => {
        console.error("Error listening to order status:", err);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [orderId]);

  // Polling fallback to trigger re-reads in case of connection lag
  useEffect(() => {
    const rawStatus = (order?.paymentStatus || "").toLowerCase();
    const isPaid = rawStatus === "paid" || order?.payhereStatusCode === "2";
    const isFailed = rawStatus === "failed" || order?.payhereStatusCode === "-2";
    const isCancelled = rawStatus === "cancelled" || order?.payhereStatusCode === "-1";

    if (order && !isPaid && !isFailed && !isCancelled && pollCount < 6) {
      const timer = setTimeout(() => {
        setPollCount((prev) => prev + 1);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [order, pollCount]);

  const rawStatus = (order?.paymentStatus || "").toLowerCase();
  const isPaymentPaid = rawStatus === "paid" || order?.payhereStatusCode === "2";
  const isPaymentFailed = rawStatus === "failed" || order?.payhereStatusCode === "-2";
  const isPaymentCancelled = rawStatus === "cancelled" || order?.payhereStatusCode === "-1";
  const isStillVerifying = !isPaymentPaid && !isPaymentFailed && !isPaymentCancelled && pollCount < 6;

  return (
    <div className="bg-[#FAFAFA] min-h-screen pt-[80px] sm:pt-[92px] pb-24 text-neutral-950 font-sans">
      <CheckoutProgress currentStep="confirmation" />

      <div className="max-w-3xl w-full mx-auto px-4 sm:px-6 pt-8 sm:pt-10">
        <div className="bg-white border border-neutral-200/90 rounded-[28px] p-6 sm:p-10 text-center shadow-xs space-y-7">

          {/* STATE 1: LOADING / VERIFYING */}
          {loading || isStillVerifying ? (
            <div className="py-12 space-y-4">
              <Loader2 className="w-12 h-12 animate-spin text-black mx-auto" />
              <h2 className="text-xl font-bold text-neutral-900">Verifying Payment with PayHere...</h2>
              <p className="text-xs text-neutral-500 max-w-sm mx-auto">
                Securely communicating with the payment gateway to confirm bank authorization.
              </p>
            </div>
          ) : isPaymentFailed || isPaymentCancelled || !isPaymentPaid ? (
            /* STATE 2: FAILED, CANCELLED, OR UNCOMPLETED OTP */
            <div className="space-y-6">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-red-50 text-red-600 flex items-center justify-center mx-auto border border-red-200">
                <AlertCircle className="w-10 h-10 sm:w-12 sm:h-12" />
              </div>
              <div>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-100 text-red-800 text-xs font-bold uppercase tracking-wider mb-2">
                  {isPaymentCancelled ? "Payment Cancelled" : "Payment Incomplete / Unverified"}
                </span>
                <h1 className="text-2xl sm:text-3xl font-black text-neutral-950 tracking-tight">
                  {isPaymentCancelled ? "Payment was Cancelled" : "Bank Authorization Not Completed"}
                </h1>
                <p className="text-xs sm:text-sm text-neutral-500 max-w-md mx-auto mt-2 leading-relaxed">
                  {isPaymentCancelled
                    ? "You closed or cancelled the transaction before completing payment."
                    : "The 6-digit SMS OTP was not entered or payment authorization was not finalized by the bank. No money has been charged to your card."}
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <Link
                  href={`/checkout`}
                  className="flex-1 min-h-[48px] px-6 rounded-full font-bold text-xs sm:text-sm bg-black text-white hover:bg-neutral-800 transition-all flex items-center justify-center gap-2"
                >
                  <RefreshCw className="w-4 h-4" />
                  <span>Try Payment Again</span>
                </Link>
                <a
                  href={`https://wa.me/${BUSINESS_INFO.whatsappNumber.replace(/[^0-9]/g, "")}?text=${encodeURIComponent("Hello " + BUSINESS_INFO.brandName + ", I need assistance with my online payment.")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 min-h-[48px] px-6 rounded-full font-bold text-xs sm:text-sm bg-emerald-600 text-white hover:bg-emerald-700 transition-all flex items-center justify-center gap-2"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>WhatsApp Support</span>
                </a>
              </div>
            </div>
          ) : (
            /* STATE 3: PAYMENT FULLY CONFIRMED */
            <>
              {/* Success Badge Icon */}
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto shadow-2xs border border-emerald-200/60">
                <CheckCircle2 className="w-10 h-10 sm:w-12 sm:h-12 stroke-[2.5]" />
              </div>

              <div>
                <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-emerald-100/80 text-emerald-900 text-xs font-bold uppercase tracking-wider mb-2">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
                  {isPaymentPaid ? "Payment Verified & Confirmed" : "Order Placed (Awaiting Gateway Sync)"}
                </div>
                <h1 className="text-2xl sm:text-4xl font-black text-neutral-950 tracking-tight">
                  Thank You for Your Order!
                </h1>
                <p className="text-xs sm:text-sm text-neutral-500 max-w-md mx-auto mt-2">
                  {isPaymentPaid
                    ? "Your payment was processed securely via PayHere. Our team is now preparing your items for dispatch."
                    : "We have received your order request. Payment confirmation is syncing securely with PayHere."}
                </p>
              </div>

              {orderId && (
                <div className="flex flex-wrap items-center justify-center gap-2">
                  <div className="inline-flex items-center gap-2 bg-neutral-50 border border-neutral-200 px-4 py-2 rounded-xl text-xs font-mono font-bold text-neutral-900">
                    <span>Order No:</span>
                    <span className="text-black font-extrabold">#{orderId.slice(0, 10).toUpperCase()}</span>
                  </div>
                  {order?.payherePaymentId && (
                    <div className="inline-flex items-center gap-2 bg-blue-50 border border-blue-200 text-blue-900 px-4 py-2 rounded-xl text-xs font-mono font-bold">
                      <span>PayHere ID:</span>
                      <span>{order.payherePaymentId}</span>
                    </div>
                  )}
                </div>
              )}

              {order && (
                <div className="text-left bg-[#FAFAFA] border border-neutral-200/80 rounded-2xl p-5 sm:p-6 space-y-5 text-xs sm:text-sm">
                  {/* Order Details Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pb-4 border-b border-neutral-200/80">
                    <div>
                      <span className="text-neutral-500 font-semibold block text-[11px] uppercase tracking-wider">
                        Payment Status
                      </span>
                      <span className="font-extrabold text-neutral-900 flex items-center gap-1.5 mt-1">
                        <CreditCard className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                        <span className={isPaymentPaid ? "text-emerald-700" : "text-neutral-800"}>
                          {isPaymentPaid ? "Paid (PayHere)" : order.paymentStatus || "Processing"}
                        </span>
                      </span>
                    </div>

                    <div>
                      <span className="text-neutral-500 font-semibold block text-[11px] uppercase tracking-wider">
                        Fulfillment
                      </span>
                      <span className="font-extrabold text-neutral-900 flex items-center gap-1.5 mt-1">
                        {order.deliveryOption === "pickup" ? (
                          <>
                            <Store className="w-3.5 h-3.5 text-emerald-600" />
                            Store Pickup
                          </>
                        ) : (
                          <>
                            <Truck className="w-3.5 h-3.5 text-neutral-900" />
                            Courier Delivery
                          </>
                        )}
                      </span>
                    </div>

                    <div className="col-span-2 sm:col-span-1">
                      <span className="text-neutral-500 font-semibold block text-[11px] uppercase tracking-wider">
                        Delivery Time
                      </span>
                      <span className="font-extrabold text-neutral-900 flex items-center gap-1.5 mt-1">
                        <Calendar className="w-3.5 h-3.5 text-neutral-700" />
                        {order.deliveryOption === "pickup" ? "Ready for Pickup" : "1–3 Business Days"}
                      </span>
                    </div>
                  </div>

                  {/* Customer and Delivery Info */}
                  {order.deliveryAddress && (
                    <div className="pb-4 border-b border-neutral-200/80">
                      <span className="font-bold text-neutral-900 mb-1 flex items-center gap-1.5 text-xs">
                        <MapPin className="w-4 h-4 text-neutral-900" />
                        {order.deliveryOption === "pickup" ? "Pickup Location" : "Delivery Address"}
                      </span>
                      <p className="text-neutral-600 text-xs leading-relaxed mt-1">
                        <strong>{order.customerName || order.deliveryAddress.firstName}</strong> ({order.phone || order.deliveryAddress.phone})<br />
                        {order.deliveryAddress.address}, {order.deliveryAddress.city}, {order.deliveryAddress.district}
                      </p>
                    </div>
                  )}

                  {/* Items List */}
                  {order.items && order.items.length > 0 && (
                    <div className="space-y-3 pb-4 border-b border-neutral-200/80">
                      <span className="font-bold text-neutral-900 text-xs block">Purchased Items</span>
                      <div className="space-y-2">
                        {order.items.map((it: any, idx: number) => (
                          <div key={idx} className="flex items-center justify-between gap-3 text-xs">
                            <div className="flex items-center gap-2.5 min-w-0">
                              {it.image && (
                                <img
                                  src={it.image}
                                  alt={it.name}
                                  className="w-9 h-9 object-contain rounded-md bg-white border border-neutral-200 p-0.5 shrink-0"
                                />
                              )}
                              <span className="font-medium text-neutral-900 truncate">
                                {it.name} {it.storage ? `(${it.storage})` : ""} × {it.quantity}
                              </span>
                            </div>
                            <span className="font-bold text-neutral-900 shrink-0">
                              {formatPrice(it.price * it.quantity)}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Total Paid Amount */}
                  <div className="flex justify-between items-baseline pt-1">
                    <span className="font-bold text-neutral-700 text-sm">Total Paid (LKR)</span>
                    <span className="font-black text-black text-xl sm:text-2xl">
                      {formatPrice(order.paidAmount || order.finalTotal || order.totalPrice || 0)}
                    </span>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <Link
                  href="/orders"
                  className="flex-1 min-h-[50px] px-6 rounded-full font-bold text-xs sm:text-sm bg-black text-white hover:bg-neutral-800 transition-all flex items-center justify-center gap-2 shadow-md active:scale-95"
                >
                  <Package className="w-4 h-4" />
                  <span>View All Orders</span>
                </Link>
                <Link
                  href="/products"
                  className="flex-1 min-h-[50px] px-6 rounded-full font-bold text-xs sm:text-sm bg-white border border-neutral-300 text-neutral-900 hover:bg-neutral-50 transition-all flex items-center justify-center gap-2 active:scale-95"
                >
                  <ShoppingBag className="w-4 h-4" />
                  <span>Continue Shopping</span>
                </Link>
              </div>

              {/* Support info */}
              <div className="pt-4 border-t border-neutral-100 flex items-center justify-center gap-6 text-xs text-neutral-500">
                <span className="flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-neutral-700" />
                  {BUSINESS_INFO.phoneHotline}
                </span>
                <span className="flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  PayHere Protected
                </span>
              </div>
            </>
          )}

        </div>
      </div>
    </div>
  );
}

export default function PaymentSuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-white pt-[120px] text-center text-sm font-bold flex flex-col items-center justify-center gap-3">
          <Loader2 className="w-6 h-6 animate-spin" />
          <span>Verifying PayHere payment confirmation...</span>
        </div>
      }
    >
      <PaymentSuccessContent />
    </Suspense>
  );
}
