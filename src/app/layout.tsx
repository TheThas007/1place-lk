import type { Metadata } from "next";
import { Inter, Outfit, Manrope } from "next/font/google";
import "./globals.css";

import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import MobileNav from "@/components/layout/mobile-nav";
import WhatsAppFab from "@/components/layout/whatsapp-fab";
import { AuthProvider } from "@/lib/auth-context";
import { CartProvider } from "@/lib/cart-context";
import { ToastProvider } from "@/components/ui/ToastProvider";
import SearchOverlay from "@/components/ui/SearchOverlay";
import { WishlistProvider } from "@/lib/wishlist-context";
import AnnouncementBar from "@/components/ui/AnnouncementBar";
import CampaignPopup from "@/components/ui/CampaignPopup";
import Script from "next/script";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
  display: "swap",
});

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-manrope",
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
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
    <html
      lang="en"
      className={`h-full antialiased ${inter.variable} ${outfit.variable} ${manrope.variable}`}
    >
      <head>
        <Script src="https://www.payhere.lk/lib/payhere.js" strategy="lazyOnload" />
      </head>
      <body className="min-h-full flex flex-col font-sans bg-black text-white">
        <AuthProvider>
          <CartProvider>
            <WishlistProvider>
              <ToastProvider>
                {/* Screen reader live region for cart announcements */}
                <div id="cart-live-announce" className="sr-only" aria-live="polite" aria-atomic="true" />
                <AnnouncementBar />
                <Header />
                <main className="flex-1 pb-16 lg:pb-0" style={{ paddingTop: "var(--navbar-height)", marginTop: 0 }}>
                  {children}
                </main>
                <Footer />
                <MobileNav />
                <WhatsAppFab />
                <SearchOverlay />
                <CampaignPopup />
              </ToastProvider>
            </WishlistProvider>
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
