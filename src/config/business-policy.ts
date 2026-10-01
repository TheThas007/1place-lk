import { siteSettings } from "@/lib/data";
import { BUSINESS_INFO } from "@/lib/business-info";

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
  legalName: BUSINESS_INFO.legalName,
  tradingName: BUSINESS_INFO.name,
  address: siteSettings.address || BUSINESS_INFO.address,
  phone: siteSettings.phone || BUSINESS_INFO.phonePrimary,
  whatsapp: siteSettings.whatsapp || BUSINESS_INFO.whatsappNumber,
  email: siteSettings.email || BUSINESS_INFO.email,
  googleMapsLink: siteSettings.google_maps_link || BUSINESS_INFO.maps.link,
  registrationNumber: "To be confirmed by Street Mobile",
  businessHours: {
    weekdays: siteSettings.business_hours?.weekdays || BUSINESS_INFO.hours.weekdays,
    saturday: siteSettings.business_hours?.saturday || BUSINESS_INFO.hours.saturday,
    sunday: siteSettings.business_hours?.sunday || BUSINESS_INFO.hours.sunday,
  },
  lastUpdated: "August 9, 2026",
  constants: {
    RETURN_REQUEST_DAYS: "7 Days from delivery date (To be confirmed by Street Mobile)",
    REFUND_PROCESSING_DAYS: "3 - 7 Business Days (Subject to PayHere & issuing bank timelines)",
    CANCELLATION_CUTOFF: "Before dispatch / handover to delivery partner",
    RETURN_DELIVERY_FEE_POLICY: "Customer pays return delivery unless item delivered was defective or incorrect",
  },
};
