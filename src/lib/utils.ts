import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatPrice(price: number): string {
  return new Intl.NumberFormat("en-LK", {
    style: "currency",
    currency: "LKR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price);
}

export function generateWhatsAppUrl(message?: string): string {
  const phone = "94774141118";
  const text = message || "Hi! I'm interested in your products at Street Mobile.";
  return `https://wa.me/${phone}?text=${encodeURIComponent(text)}`;
}

