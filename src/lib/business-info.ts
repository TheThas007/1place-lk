/**
 * Centralized Business Information Source of Truth for StreetMobile.lk
 * Authoritative values grounded in Firestore production settings (settings/site and settings/store)
 */

export const BUSINESS_INFO = {
  name: "Street Mobile",
  legalName: "STREET MOBILE (Pvt) Ltd",
  brandName: "STREET MOBILE",
  tagline: "We are near you!",
  description:
    "Your Trusted Mobile Store in Vavuniya, Sri Lanka. 100% Genuine Smartphones, Apple, Samsung, Xiaomi & Premium Accessories.",
  
  // Authoritative Phone Numbers:
  // - Primary Landline: 024 222 8118
  // - Secondary / Mobile / WhatsApp: 077 414 1118 (+94 77 414 1118)
  // - Customer Hotline / Backup: 075 454 1118 (+94 75 454 1118)
  phonePrimary: "024 222 8118",
  phonePrimaryIntl: "+94242228118",
  phoneMobile: "077 414 1118",
  phoneMobileIntl: "+94774141118",
  phoneHotline: "075 454 1118",
  phoneHotlineIntl: "+94754541118",
  whatsappNumber: "94774141118",
  whatsappDisplay: "+94 77 414 1118",

  // Email
  email: "streetmobilevavuniya@gmail.com",

  // Physical Location
  address: "163, Kandaswamy Kovil Road, Rambaikulam, Vavuniya Town, Sri Lanka",
  addressLocality: "Vavuniya Town",
  addressRegion: "Northern Province",
  postalCode: "43000",
  addressCountry: "LK",
  geo: {
    latitude: 8.7514,
    longitude: 80.4971,
  },

  // Authoritative Business Hours (from Firestore settings/site):
  // Mon - Sat: 9:00 AM - 9:00 PM
  // Sunday: 10:00 AM - 7:00 PM
  hours: {
    weekdays: "9:00 AM - 9:00 PM",
    saturday: "9:00 AM - 9:00 PM",
    sunday: "10:00 AM - 7:00 PM",
    opensWeekdays: "09:00",
    closesWeekdays: "21:00",
    opensSunday: "10:00",
    closesSunday: "19:00",
    displaySummary: "Mon - Sat: 9:00 AM - 9:00 PM | Sun: 10:00 AM - 7:00 PM",
  },

  // Social Links
  social: {
    facebook: "https://www.facebook.com/share/1CwkxMjUkr/?mibextid=wwXIfr",
    instagram: "https://www.instagram.com/streetmobile.lk?utm_source=qr",
    tiktok: "https://www.tiktok.com/@streetmobile.lk?_r=1&_t=ZS-97ViT22ZBK9",
  },

  // Google Maps
  maps: {
    link: "https://www.google.com/maps/place//@8.7505237,80.5028315,17z/data=!3m1!4b1!4m3!3m2!1s0x3afc159b991b1da5:0xa03e8d7360fe634a!12e1?entry=ttu&g_ep=EgoyMDI2MDgxNy4wIKXMDSoASAFQAw%3D%3D",
    embed: "https://maps.google.com/maps?q=STREET+MoBILE+Vavuniya&t=&z=16&ie=UTF8&iwloc=&output=embed",
  },
} as const;

export type BusinessInfo = typeof BUSINESS_INFO;
