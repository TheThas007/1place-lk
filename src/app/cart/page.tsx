import CartClient from "./cart-client";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Shopping Bag | STREET MOBILE",
  description: "Review your selected products in your STREET MOBILE shopping bag.",
};

export default function CartPage() {
  return <CartClient />;
}
