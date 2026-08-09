import { siteSettings } from "@/lib/data";

export interface BusinessPolicyConfig {
  legalName: string;
  tradingName: string;
  address: string;
  phone: string;
  whatsapp: string;
  email: string;
  googleMapsLink: string;
  registrationNumber: string;
  businessHours: {
    weekdays: string;
    saturday: string;
    sunday: string;
  };
  lastUpdated: string;
  constants: {
    RETURN_REQUEST_DAYS: string;
    REFUND_PROCESSING_DAYS: string;
    CANCELLATION_CUTOFF: string;
    RETURN_DELIVERY_FEE_POLICY: string;
  };
}

export const businessPolicyConfig: BusinessPolicyConfig = {
  legalName: "STREET MOBILE (Pvt) Ltd",
  tradingName: "Street Mobile",
  address: siteSettings.address || "163, Kandaswamy Kovil Road, Rambaikulam, Vavuniya Town, Sri Lanka",
  phone: siteSettings.phone || "024 222 8118 / 075 454 1118",
  whatsapp: siteSettings.whatsapp || "94774141118",
  email: siteSettings.email || "streetmobilevavuniya@gmail.com",
  googleMapsLink: siteSettings.google_maps_link || "https://maps.app.goo.gl/dvxBpsvxR86bGqar9",
  registrationNumber: "To be confirmed by Street Mobile",
  businessHours: {
    weekdays: siteSettings.business_hours?.weekdays || "9:00 AM - 8:00 PM",
    saturday: siteSettings.business_hours?.saturday || "9:00 AM - 8:00 PM",
    sunday: siteSettings.business_hours?.sunday || "10:00 AM - 6:00 PM",
  },
  lastUpdated: "August 9, 2026",
  constants: {
    RETURN_REQUEST_DAYS: "7 Days from delivery date (To be confirmed by Street Mobile)",
    REFUND_PROCESSING_DAYS: "3 - 7 Business Days (Subject to PayHere & issuing bank timelines)",
    CANCELLATION_CUTOFF: "Before dispatch / handover to delivery partner",
    RETURN_DELIVERY_FEE_POLICY: "Customer pays return delivery unless item delivered was defective or incorrect",
  },
};
