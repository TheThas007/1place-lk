import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import MobileNav from "@/components/layout/mobile-nav";
import WhatsAppFab from "@/components/layout/whatsapp-fab";
import { AuthProvider } from "@/lib/auth-context";
import { CartProvider } from "@/lib/cart-context";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://www.streetmobile.lk"),
  title: {
    default: "STREET MOBILE - Premium Mobile Store in Vavuniya",
    template: "%s | STREET MOBILE",
  },
  description: "Your Trusted Mobile Store in Vavuniya. Latest Smartphones, Accessories & Professional Repair Services. Find Apple, Samsung, Xiaomi, and premium accessories.",
  keywords: ["street mobile.lk", "streetmobile.lk", "street mobile lk", "street mobile sri lanka", "Mobile shop in Vavuniya", "STREET MOBILE", "Buy phones Vavuniya", "Mobile repair Sri Lanka", "Apple products Sri Lanka", "Samsung Vavuniya", "Mobile accessories"],
  openGraph: {
    title: "STREET MOBILE - Premium Mobile Store in Vavuniya",
    description: "Your Trusted Mobile Store in Vavuniya. Latest Smartphones, Accessories & Professional Repair Services.",
    url: "https://www.streetmobile.lk",
    siteName: "STREET MOBILE",
    locale: "en_LK",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "STREET MOBILE - Premium Mobile Store in Vavuniya",
    description: "Your Trusted Mobile Store in Vavuniya. Latest Smartphones, Accessories & Professional Repair Services.",
  },
  verification: {
    google: "pRdm46lnUWo4UNNzDSKw-S-3p3LwidWihXA67FOGq6U",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">
        <AuthProvider>
          <CartProvider>
            <Header />
            <main className="flex-1 pt-[100px] lg:pt-[110px]">
              {children}
            </main>
            <Footer />
            <MobileNav />
            <WhatsAppFab />
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
