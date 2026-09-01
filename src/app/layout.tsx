import type { Metadata, Viewport } from "next";
import { Inter, Outfit, Manrope } from "next/font/google";
import "./globals.css";

import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import MobileNav from "@/components/layout/mobile-nav";
import StreetAssistant from "@/components/assistant/StreetAssistant";
import { AuthProvider } from "@/lib/auth-context";
import { CartProvider } from "@/lib/cart-context";
import { ToastProvider } from "@/components/ui/ToastProvider";
import SearchOverlay from "@/components/ui/SearchOverlay";
import { WishlistProvider } from "@/lib/wishlist-context";
import AnnouncementBar from "@/components/ui/AnnouncementBar";
import CampaignPopup from "@/components/ui/CampaignPopup";
import SmoothScrollProvider from "@/components/providers/SmoothScrollProvider";
import DisableNumberScroll from "@/components/providers/DisableNumberScroll";
import AppLoadingScreen from "@/components/ui/AppLoadingScreen";
import LaunchGate from "@/components/launch/LaunchGate";
import BrowseHistoryTracker from "@/components/navigation/BrowseHistoryTracker";
import Script from "next/script";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
  weight: ["300", "400", "500", "600", "700", "800", "900"],
  display: "swap",
});

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-manrope",
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: "#000000",
};

export const metadata: Metadata = {
  metadataBase: new URL("https://www.streetmobile.lk"),
  title: {
    default: "Mobile Phones & Accessories in Sri Lanka | Street Mobile",
    template: "%s | Street Mobile",
  },
  description: "Your Trusted Mobile Store in Vavuniya, Sri Lanka. Buy 100% genuine Apple, Samsung, Xiaomi smartphones, chargers, power banks, earbuds, and premium accessories with official warranty and fast islandwide delivery.",
  keywords: [
    "mobile phones Sri Lanka",
    "mobile phone price Sri Lanka",
    "buy mobile phones Sri Lanka",
    "smartphones Sri Lanka",
    "mobile accessories Sri Lanka",
    "iPhone price Sri Lanka",
    "Samsung price Sri Lanka",
    "Xiaomi price Sri Lanka",
    "Google Pixel Sri Lanka",
    "phone accessories Sri Lanka",
    "chargers Sri Lanka",
    "power banks Sri Lanka",
    "wireless earbuds Sri Lanka",
    "mobile phone shop Vavuniya",
    "mobile shop Vavuniya",
    "phone shop Vavuniya",
    "iPhone shop Vavuniya",
    "Samsung phone shop Vavuniya",
    "mobile accessories Vavuniya",
    "street mobile",
    "streetmobile.lk",
  ],
  alternates: {
    canonical: "https://www.streetmobile.lk",
  },
  openGraph: {
    title: "Mobile Phones & Accessories in Sri Lanka | Street Mobile",
    description: "Your Trusted Mobile Store in Vavuniya, Sri Lanka. 100% Genuine Smartphones, Apple, Samsung, Xiaomi & Premium Accessories with islandwide delivery.",
    url: "https://www.streetmobile.lk",
    siteName: "Street Mobile",
    locale: "en_LK",
    type: "website",
    images: [
      {
        url: "https://www.streetmobile.lk/logo.png",
        width: 1200,
        height: 630,
        alt: "Street Mobile Vavuniya - Mobile Phones & Accessories in Sri Lanka",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Mobile Phones & Accessories in Sri Lanka | Street Mobile",
    description: "Your Trusted Mobile Store in Vavuniya, Sri Lanka. 100% Genuine Smartphones, Apple, Samsung, Xiaomi & Premium Accessories.",
    images: ["https://www.streetmobile.lk/logo.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    google: "YzSUb_wi1C3ZXkCndwwsgeKYZotb4zW6EvN_N-NnTOo",
  },
};

const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  "@id": "https://www.streetmobile.lk/#organization",
  "name": "Street Mobile",
  "legalName": "STREET MOBILE (Pvt) Ltd",
  "url": "https://www.streetmobile.lk",
  "logo": "https://www.streetmobile.lk/logo.png",
  "image": "https://www.streetmobile.lk/logo.png",
  "description": "Your Trusted Mobile Store in Vavuniya, Sri Lanka. Retailer of genuine smartphones, gadgets, and premium accessories.",
  "telephone": "+94242228118",
  "email": "streetmobilevavuniya@gmail.com",
  "address": {
    "@type": "PostalAddress",
    "streetAddress": "163, Kandaswamy Kovil Road, Rambaikulam",
    "addressLocality": "Vavuniya Town",
    "addressRegion": "Northern Province",
    "postalCode": "43000",
    "addressCountry": "LK"
  },
  "sameAs": [
    "https://instagram.com/streetmobile.lk",
    "https://facebook.com/streetmobile.lk",
    "https://tiktok.com/@streetmobile.lk"
  ]
};

const localBusinessJsonLd = {
  "@context": "https://schema.org",
  "@type": "MobilePhoneStore",
  "@id": "https://www.streetmobile.lk/#localbusiness",
  "name": "Street Mobile",
  "image": "https://www.streetmobile.lk/logo.png",
  "url": "https://www.streetmobile.lk",
  "telephone": "+94242228118",
  "priceRange": "LKR 1,000 - LKR 500,000",
  "address": {
    "@type": "PostalAddress",
    "streetAddress": "163, Kandaswamy Kovil Road, Rambaikulam",
    "addressLocality": "Vavuniya Town",
    "addressRegion": "Northern Province",
    "postalCode": "43000",
    "addressCountry": "LK"
  },
  "geo": {
    "@type": "GeoCoordinates",
    "latitude": 8.7514,
    "longitude": 80.4971
  },
  "openingHoursSpecification": [
    {
      "@type": "OpeningHoursSpecification",
      "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
      "opens": "09:00",
      "closes": "21:00"
    },
    {
      "@type": "OpeningHoursSpecification",
      "dayOfWeek": "Sunday",
      "opens": "10:00",
      "closes": "18:00"
    }
  ],
  "paymentAccepted": "Cash, Credit Card, Debit Card, Online Payment",
  "currenciesAccepted": "LKR",
  "hasMap": "https://maps.app.goo.gl/dvxBpsvxR86bGqar9"
};

const websiteJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  "@id": "https://www.streetmobile.lk/#website",
  "url": "https://www.streetmobile.lk",
  "name": "Street Mobile",
  "description": "Mobile Phones & Accessories in Sri Lanka",
  "publisher": {
    "@id": "https://www.streetmobile.lk/#organization"
  },
  "potentialAction": {
    "@type": "SearchAction",
    "target": {
      "@type": "EntryPoint",
      "urlTemplate": "https://www.streetmobile.lk/products?search={search_term_string}"
    },
    "query-input": "required name=search_term_string"
  }
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
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessJsonLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
        />
      </head>
      <body className="min-h-full flex flex-col font-sans bg-black text-white">
        <DisableNumberScroll />
        <Script src="https://www.payhere.lk/lib/payhere.js" strategy="afterInteractive" />
        <AuthProvider>
          <CartProvider>
            <WishlistProvider>
              <ToastProvider>
                <LaunchGate>
                  <AppLoadingScreen />
                  <SmoothScrollProvider>
                    {/* Screen reader live region for cart announcements */}
                    <div id="cart-live-announce" className="sr-only" aria-live="polite" aria-atomic="true" />
                    <AnnouncementBar />
                    <Header />
                    <main className="flex-1 pb-16 lg:pb-0" style={{ paddingTop: "var(--navbar-height)", marginTop: 0 }}>
                      {children}
                    </main>
                    <Footer />
                    <MobileNav />
                    <StreetAssistant />
                    <SearchOverlay />
                    <CampaignPopup />
                    <BrowseHistoryTracker />
                  </SmoothScrollProvider>
                </LaunchGate>
              </ToastProvider>
            </WishlistProvider>
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
