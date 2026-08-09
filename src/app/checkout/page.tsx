import CheckoutClient from "./checkout-client";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Checkout | STREET MOBILE",
  description: "Complete your order securely at STREET MOBILE.",
};

export default function CheckoutPage() {
  return <CheckoutClient />;
}
