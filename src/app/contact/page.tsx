import { Metadata } from "next";
import { getSiteSettings } from "@/lib/firestore-client";
import { siteSettings as defaultSettings } from "@/lib/data";
import ContactClient from "@/components/contact/ContactClient";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Contact Us & Store Location in Vavuniya | Street Mobile Sri Lanka",
  description:
    "Visit Street Mobile flagship store at 163, Kandaswamy Kovil Road, Rambaikulam, Vavuniya. Call +94 77 414 1118 or WhatsApp for genuine smartphone prices, orders, and warranty repairs in Sri Lanka.",
  alternates: {
    canonical: "https://www.streetmobile.lk/contact",
  },
  openGraph: {
    title: "Contact Us & Store Location | Street Mobile Vavuniya",
    description:
      "Visit Street Mobile in Vavuniya or contact our customer support team for phone inquiries, orders, and warranty repairs.",
    url: "https://www.streetmobile.lk/contact",
    type: "website",
    siteName: "Street Mobile",
    locale: "en_LK",
    images: [{ url: "https://www.streetmobile.lk/logo.png", alt: "Street Mobile Sri Lanka Store Contact" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Contact Street Mobile Store Vavuniya",
    description: "Official store location, customer hotline, WhatsApp contact, and opening hours for Street Mobile Sri Lanka.",
  },
};

export default async function ContactPage() {
  const settings = (await getSiteSettings().catch(() => defaultSettings)) || defaultSettings;

  const localBusinessJsonLd = {
    "@context": "https://schema.org",
    "@type": "MobilePhoneStore",
    "@id": "https://www.streetmobile.lk/#localbusiness",
    "name": settings.store_name || "Street Mobile",
    "image": "https://www.streetmobile.lk/logo.png",
    "url": "https://www.streetmobile.lk/contact",
    "telephone": settings.phone || "+94774141118",
    "email": settings.email || "streetmobilevavuniya@gmail.com",
    "priceRange": "LKR",
    "address": {
      "@type": "PostalAddress",
      "streetAddress": settings.address || "163, Kandaswamy Kovil Road, Rambaikulam",
      "addressLocality": "Vavuniya Town",
      "addressRegion": "Northern Province",
      "postalCode": "43000",
      "addressCountry": "LK",
    },
    "geo": {
      "@type": "GeoCoordinates",
      "latitude": 8.7514,
      "longitude": 80.4971,
    },
    "openingHoursSpecification": [
      {
        "@type": "OpeningHoursSpecification",
        "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
        "opens": "09:00",
        "closes": "21:00",
      },
      {
        "@type": "OpeningHoursSpecification",
        "dayOfWeek": "Sunday",
        "opens": "10:00",
        "closes": "18:00",
      },
    ],
    "hasMap": settings.google_maps_link || "https://maps.app.goo.gl/dvxBpsvxR86bGqar9",
  };

  const breadcrumbsJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "Home",
        "item": "https://www.streetmobile.lk",
      },
      {
        "@type": "ListItem",
        "position": 2,
        "name": "Contact Us",
        "item": "https://www.streetmobile.lk/contact",
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbsJsonLd) }}
      />
      <ContactClient initialSettings={settings} />
    </>
  );
}
