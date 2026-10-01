"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  XCircle,
  RefreshCw,
  ShoppingBag,
  ArrowRight,
  MessageCircle,
  Phone,
  Truck,
  ShieldAlert,
} from "lucide-react";
import { BUSINESS_INFO } from "@/lib/business-info";

function PaymentCancelContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("order_id") || searchParams.get("id");

  return (
    <div className="bg-[#FAFAFA] min-h-screen pt-[100px] sm:pt-[110px] pb-24 text-neutral-950 font-sans flex items-center justify-center">
      <div className="max-w-lg w-full mx-auto px-4 sm:px-6">
        <div className="bg-white border border-neutral-200/90 rounded-[28px] p-6 sm:p-9 text-center shadow-sm space-y-6">
          
          {/* Cancel Icon */}
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center mx-auto border border-amber-200">
            <XCircle className="w-10 h-10 sm:w-12 sm:h-12" />
          </div>

          <div>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100/80 text-amber-900 text-xs font-bold uppercase tracking-wider mb-2">
              <ShieldAlert className="w-3.5 h-3.5 text-amber-700" />
              Payment Incomplete
            </span>
            <h1 className="text-2xl sm:text-3xl font-black text-neutral-950 tracking-tight">
              Payment was Cancelled
            </h1>
            <p className="text-xs sm:text-sm text-neutral-500 max-w-sm mx-auto mt-2 leading-relaxed">
              Your PayHere transaction was not finalized. No money has been deducted from your card.
            </p>
          </div>

          {orderId && (
            <div className="inline-flex items-center gap-2 bg-neutral-50 border border-neutral-200 px-4 py-2 rounded-xl text-xs font-mono font-bold text-neutral-700">
              <span>Reference:</span>
              <span className="text-black font-extrabold">#{orderId.slice(0, 10).toUpperCase()}</span>
            </div>
          )}

          {/* Help box */}
          <div className="text-left bg-neutral-50 border border-neutral-200/70 rounded-2xl p-4 sm:p-5 space-y-3 text-xs">
            <h4 className="font-bold text-neutral-900 flex items-center gap-2">
              <Truck className="w-4 h-4 text-neutral-800" />
              What would you like to do next?
            </h4>
            <ul className="text-neutral-600 space-y-2 list-disc list-inside">
              <li>
                <strong>Retry online payment:</strong> You can try again with Visa, MasterCard, or Amex.
              </li>
              <li>
                <strong>Pay with Cash on Delivery (COD):</strong> Receive your order at your doorstep and pay cash when it arrives.
              </li>
              <li>
                <strong>Contact our support team:</strong> We can assist you with your order directly over WhatsApp or Phone.
              </li>
            </ul>
          </div>

          {/* Actions */}
          <div className="space-y-3 pt-2">
            <Link
              href="/checkout"
              className="w-full min-h-[50px] px-6 rounded-full font-bold text-sm bg-black text-white hover:bg-neutral-800 transition-all flex items-center justify-center gap-2 shadow-md active:scale-95"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Return to Checkout &amp; Retry</span>
            </Link>

            <a
              href={`https://wa.me/${BUSINESS_INFO.whatsappNumber}?text=${encodeURIComponent("Hello Street Mobile, my payment was cancelled and I need assistance")}`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full min-h-[50px] px-6 rounded-full font-bold text-sm bg-emerald-600 text-white hover:bg-emerald-700 transition-all flex items-center justify-center gap-2 shadow-sm active:scale-95"
            >
              <MessageCircle className="w-4 h-4" />
              <span>Assistance via WhatsApp</span>
            </a>

            <Link
              href="/products"
              className="w-full min-h-[44px] px-6 rounded-full font-bold text-xs sm:text-sm bg-transparent text-neutral-600 hover:text-black transition-all flex items-center justify-center gap-1.5"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>Back to Store</span>
            </Link>
          </div>

          <div className="pt-2 border-t border-neutral-100 text-[11px] text-neutral-400 flex items-center justify-center gap-2">
            <Phone className="w-3.5 h-3.5" />
            <span>Store helpline: {BUSINESS_INFO.phonePrimary} / {BUSINESS_INFO.phoneMobile}</span>
          </div>

        </div>
      </div>
    </div>
  );
}

export default function PaymentCancelPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-white pt-[120px] text-center text-sm font-bold">
          Loading...
        </div>
      }
    >
      <PaymentCancelContent />
    </Suspense>
  );
}
