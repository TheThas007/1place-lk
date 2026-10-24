import CheckoutClient from "./checkout-client";
import Script from "next/script";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Checkout | 1PLACE.LK",
  description: "Complete your order securely at 1PLACE.LK.",
};

export default function CheckoutPage() {
  return (
    <>
      {/* Official PayHere JavaScript SDK */}
      <Script
        src="https://www.payhere.lk/lib/payhere.js"
        strategy="afterInteractive"
      />
      <CheckoutClient />
    </>
  );
}
