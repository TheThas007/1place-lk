import CartClient from "./cart-client";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Shopping Bag | 1PLACE.LK",
  description: "Review your selected products in your 1PLACE.LK shopping bag.",
};

export default function CartPage() {
  return <CartClient />;
}
