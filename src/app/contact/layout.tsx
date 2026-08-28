import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact Us & Store Location in Vavuniya | Street Mobile",
  description: "Visit Street Mobile at 163, Kandaswamy Kovil Road, Rambaikulam, Vavuniya. Contact us via phone (+94 24 222 8118) or WhatsApp for mobile inquiries, orders, and support.",
  alternates: {
    canonical: "https://www.streetmobile.lk/contact",
  },
  openGraph: {
    title: "Contact Street Mobile Vavuniya | Mobile Shop in Sri Lanka",
    description: "Visit our physical store in Vavuniya or contact our customer support for inquiries, orders, and repair services.",
    url: "https://www.streetmobile.lk/contact",
    type: "website",
    siteName: "Street Mobile",
  },
};

export default function ContactLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
