import type { Metadata } from "next";
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

import AnnouncementBar from "@/components/ui/AnnouncementBar";
import CampaignPopup from "@/components/ui/CampaignPopup";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@100..900&family=Outfit:wght@400;500;600;700;800;900&family=Playfair+Display:ital,wght@0,400..900;1,400..900&display=swap" rel="stylesheet" />
      </head>
      <body className="min-h-full flex flex-col font-sans">
        <AuthProvider>
          <CartProvider>
            <WishlistProvider>
              <ToastProvider>
                <AnnouncementBar />
                <Header />
                <main className="flex-1 pt-[100px] lg:pt-[110px] pb-16 lg:pb-0">
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
