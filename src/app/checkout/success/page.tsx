"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { CheckCircle2, Package, MapPin, Truck, ArrowRight, ShoppingBag } from "lucide-react";
import { formatPrice } from "@/lib/utils";
import { db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";

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
    <div className="bg-white min-h-screen pt-[100px] pb-24 text-black flex items-center justify-center">
      <div className="max-w-2xl w-full mx-auto px-4 lg:px-6">
        <div className="bg-[#FAFAFA] border border-[#EAEAEA] rounded-3xl p-6 sm:p-10 text-center space-y-6">
          
          {/* Success Icon */}
          <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-xs">
            <CheckCircle2 className="w-10 h-10" />
          </div>

          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-black tracking-tight mb-2">
              Order Placed Successfully!
            </h1>
            <p className="text-xs sm:text-sm text-gray-500 max-w-md mx-auto">
              Thank you for shopping with STREET MOBILE. Your order details are confirmed below.
            </p>
          </div>

          {orderId && (
            <div className="inline-block bg-white border border-[#EAEAEA] px-4 py-2 rounded-xl text-xs font-mono font-bold text-black">
              Order ID: #{orderId.slice(0, 10).toUpperCase()}
            </div>
          )}

          {order && (
            <div className="text-left bg-white border border-[#EAEAEA] rounded-2xl p-5 space-y-4 text-xs sm:text-sm">
              <div className="flex justify-between items-center pb-3 border-b border-[#EAEAEA]">
                <span className="text-gray-500 font-medium">Status</span>
                <span className="font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-md">
                  {order.paymentStatus || "Processing"}
                </span>
              </div>

              <div className="flex justify-between items-center pb-3 border-b border-[#EAEAEA]">
                <span className="text-gray-500 font-medium">Total Amount Paid / Due</span>
                <span className="font-black text-black text-base">{formatPrice(order.finalTotal)}</span>
              </div>

              {order.deliveryAddress && (
                <div className="pt-1">
                  <p className="font-bold text-black mb-1 flex items-center gap-1.5">
                    <MapPin className="w-4 h-4 text-black" /> Delivery Address
                  </p>
                  <p className="text-gray-600 text-xs leading-relaxed">
                    {order.deliveryAddress.firstName} {order.deliveryAddress.lastName} ({order.deliveryAddress.phone})<br />
                    {order.deliveryAddress.address}, {order.deliveryAddress.city}, {order.deliveryAddress.district}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <Link
              href="/orders"
              className="flex-1 py-3.5 px-6 rounded-full font-bold text-xs sm:text-sm bg-black text-white hover:bg-gray-800 transition-all flex items-center justify-center gap-2 shadow-md"
            >
              <Package className="w-4 h-4" />
              Track My Order
            </Link>
            <Link
              href="/products"
              className="flex-1 py-3.5 px-6 rounded-full font-bold text-xs sm:text-sm bg-white border-2 border-black text-black hover:bg-gray-50 transition-all flex items-center justify-center gap-2"
            >
              <ShoppingBag className="w-4 h-4" />
              Continue Shopping
            </Link>
          </div>

        </div>
      </div>
    </div>
  );
}

export default function OrderSuccessPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-white pt-[120px] text-center text-sm font-bold">Loading confirmation...</div>}>
      <SuccessContent />
    </Suspense>
  );
}
