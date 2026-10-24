"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
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
  Banknote,
  ShieldCheck,
} from "lucide-react";
import { formatPrice } from "@/lib/utils";
import { db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import { BUSINESS_INFO } from "@/lib/business-info";
import CheckoutProgress from "@/components/checkout/CheckoutProgress";

function SuccessContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("id");
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchOrder() {
      if (!orderId) {
        setLoading(false);
        return;
      }
      try {
        const snap = await getDoc(doc(db, "orders", orderId));
        if (snap.exists()) {
          setOrder({ id: snap.id, ...snap.data() });
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    fetchOrder();
  }, [orderId]);

  return (
    <div className="bg-[#FAFAFA] min-h-screen pt-[80px] sm:pt-[92px] pb-24 text-neutral-950 font-sans">
      {/* Step 3: Confirmation Progress */}
      <CheckoutProgress currentStep="confirmation" />

      <div className="max-w-3xl w-full mx-auto px-4 sm:px-6 pt-8 sm:pt-10">
        <div className="bg-white border border-neutral-200/90 rounded-[28px] p-6 sm:p-10 text-center shadow-xs space-y-7">
          
          {/* Success Icon */}
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto shadow-2xs border border-emerald-200/60">
            <CheckCircle2 className="w-10 h-10 sm:w-12 sm:h-12 stroke-[2.5]" />
          </div>

          <div>
            <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-emerald-100/70 text-emerald-800 text-xs font-bold uppercase tracking-wider mb-2">
              <ShieldCheck className="w-3.5 h-3.5" />
              Order Confirmed
            </div>
            <h1 className="text-2xl sm:text-4xl font-black text-neutral-950 tracking-tight">
              Thank You for Your Order!
            </h1>
            <p className="text-xs sm:text-sm text-neutral-500 max-w-md mx-auto mt-2">
              We&apos;ve received your order and our team at {BUSINESS_INFO.brandName} is preparing it for dispatch.
            </p>
          </div>

          {orderId && (
            <div className="inline-flex items-center gap-2 bg-neutral-50 border border-neutral-200 px-4 py-2 rounded-xl text-xs font-mono font-bold text-neutral-900">
              <span>Order Number:</span>
              <span className="text-black font-extrabold">#{orderId.slice(0, 10).toUpperCase()}</span>
            </div>
          )}

          {order && (
            <div className="text-left bg-[#FAFAFA] border border-neutral-200/80 rounded-2xl p-5 sm:p-6 space-y-5 text-xs sm:text-sm">
              {/* Order Meta Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pb-4 border-b border-neutral-200/80">
                <div>
                  <span className="text-neutral-500 font-semibold block text-[11px] uppercase tracking-wider">
                    Payment Status
                  </span>
                  <span className="font-extrabold text-neutral-900 flex items-center gap-1 mt-1">
                    {order.paymentMethod?.includes("Card") ? (
                      <CreditCard className="w-3.5 h-3.5 text-blue-600" />
                    ) : (
                      <Banknote className="w-3.5 h-3.5 text-amber-600" />
                    )}
                    {order.paymentStatus || "Processing"}
                  </span>
                </div>

                <div>
                  <span className="text-neutral-500 font-semibold block text-[11px] uppercase tracking-wider">
                    Fulfillment Method
                  </span>
                  <span className="font-extrabold text-neutral-900 flex items-center gap-1 mt-1">
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
                    Estimated Time
                  </span>
                  <span className="font-extrabold text-neutral-900 flex items-center gap-1 mt-1">
                    <Calendar className="w-3.5 h-3.5 text-neutral-700" />
                    {order.deliveryOption === "pickup" ? "Ready Today" : "1–3 Business Days"}
                  </span>
                </div>
              </div>

              {/* Delivery / Pickup Address */}
              {order.deliveryAddress && (
                <div className="pb-4 border-b border-neutral-200/80">
                  <span className="font-bold text-neutral-900 mb-1 flex items-center gap-1.5 text-xs">
                    <MapPin className="w-4 h-4 text-neutral-900" />
                    {order.deliveryOption === "pickup" ? "Pickup Location" : "Delivery Address"}
                  </span>
                  <p className="text-neutral-600 text-xs leading-relaxed mt-1">
                    <strong>{order.customerName}</strong> ({order.phone})<br />
                    {order.deliveryAddress.address}, {order.deliveryAddress.city}, {order.deliveryAddress.district}
                  </p>
                </div>
              )}

              {/* Items Summary */}
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

              {/* Fee Breakdown if present */}
              {((order.cardFee || order.payhereFee) && Number(order.cardFee || order.payhereFee) > 0) && (
                <div className="flex justify-between text-xs text-neutral-500 pt-1">
                  <span>PayHere Fee (2%)</span>
                  <span className="font-semibold text-neutral-800">
                    +{formatPrice(order.cardFee || order.payhereFee)}
                  </span>
                </div>
              )}

              {/* Total Summary */}
              <div className="flex justify-between items-baseline pt-1">
                <span className="font-bold text-neutral-700 text-sm">Total Paid / Due</span>
                <span className="font-black text-black text-xl sm:text-2xl">
                  {formatPrice(order.finalTotal || order.totalPrice || 0)}
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
              <span>Track My Order</span>
            </Link>
            <Link
              href="/products"
              className="flex-1 min-h-[50px] px-6 rounded-full font-bold text-xs sm:text-sm bg-white border border-neutral-300 text-neutral-900 hover:bg-neutral-50 transition-all flex items-center justify-center gap-2 active:scale-95"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>Continue Shopping</span>
            </Link>
          </div>

        </div>
      </div>
    </div>
  );
}

export default function OrderSuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-white pt-[120px] text-center text-sm font-bold">
          Loading order confirmation...
        </div>
      }
    >
      <SuccessContent />
    </Suspense>
  );
}
