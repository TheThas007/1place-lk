import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPrice(price: number): string {
  return new Intl.NumberFormat("en-LK", {
    style: "currency",
    currency: "LKR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })
    .format(price)
    .replace("LKR", "Rs.");
}

export function generateWhatsAppUrl(product?: {
  name: string;
  price: number;
  storage?: string;
  color?: string;
}): string {
  const phone = "94774141118";
  let message = "";

  if (product) {
    message = `Hello STREET MOBILE,

I would like to order:

Product: ${product.name}
Price: Rs. ${product.price.toLocaleString()}${product.storage ? `\nStorage: ${product.storage}` : ""}${product.color ? `\nColor: ${product.color}` : ""}

Please provide availability.

Customer Name: 
Phone Number: `;
  } else {
    message = `Hello STREET MOBILE,

I would like to inquire about your products and services.

Customer Name: 
Phone Number: `;
  }

  return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w ]+/g, "")
    .replace(/ +/g, "-");
}
