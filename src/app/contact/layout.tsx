import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact Us & Colombo Flagship Store | 1PLACE.LK",
  description: "Visit 1PLACE.LK at 42, Galle Road, Colombo 03, Sri Lanka. Contact us via phone (+94 11 234 5678) or WhatsApp for inquiries, premium orders, and certified support.",
  alternates: {
    canonical: "https://www.1place.lk/contact",
  },
  openGraph: {
    title: "Contact 1PLACE.LK Colombo Flagship | Premium E-Commerce Platform",
    description: "Visit our flagship showroom in Colombo or contact our customer support for inquiries, orders, and nationwide delivery support.",
    url: "https://www.1place.lk/contact",
    type: "website",
    siteName: "1PLACE.LK",
  },
};

export default function ContactLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
