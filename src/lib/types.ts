// ── Delivery Zone ────────────────────────────────────
export interface DeliveryZone {
  id: string;
  name: string;            // e.g. "Vavuniya", "Colombo"
  deliveryFee: number;
  minimumOrderAmount: number;
  estimatedDeliveryTime: string; // e.g. "1-2 business days"
  codEnabled: boolean;
  expressDeliveryEnabled: boolean;
  isActive: boolean;
}

// ── Product Order / Payment / Delivery Settings ───────
export interface ProductOrderSettings {
  // ─ Cash on Delivery ─
  codEnabled: boolean;
  codFee: number;
  codMinimumAmount: number | null;
  codMaximumAmount: number | null;
  codAvailableAreas: string[];       // district names
  codInstructions: string;
  codConfirmationRequired: boolean;

  // ─ Card Payment ─
  cardEnabled: boolean;
  cardMethods: string[];             // ["visa","mastercard","amex","bank","gateway"]
  paymentGatewayName: string;
  cardInstructions: string;
  cardProcessingFee: number;
  paymentRedirectUrl: string;
  cardConfirmationRequired: boolean;

  // ─ WhatsApp Order ─
  whatsappEnabled: boolean;
  whatsappNumber: string;
  whatsappTemplate: string;
  includeProductName: boolean;
  includeProductPrice: boolean;
  includeProductSku: boolean;
  includeVariation: boolean;
  includeQuantity: boolean;
  includeCustomerDetails: boolean;
  includeDeliveryAddress: boolean;
  includeProductUrl: boolean;

  // ─ Delivery ─
  deliveryType: "delivery" | "pickup" | "delivery_and_pickup" | "no_delivery" | "digital";
  freeDeliveryEnabled: boolean;
  flatDeliveryFee: number;
  estimatedDeliveryMinDays: number;
  estimatedDeliveryMaxDays: number;
  sameDayDeliveryEnabled: boolean;
  sameDayDeliveryFee: number;
  expressDeliveryEnabled: boolean;
  expressDeliveryFee: number;
  deliveryInstructions: string;
  restrictedDeliveryAreas: string[];

  // ─ Delivery Zones ─
  deliveryZones: DeliveryZone[];

  // ─ Store Pickup ─
  pickupEnabled: boolean;
  pickupLocationName: string;
  pickupAddress: string;
  pickupMapUrl: string;
  pickupAvailableDays: string[];
  pickupStartTime: string;
  pickupEndTime: string;
  pickupInstructions: string;
  pickupContactNumber: string;
  pickupPreparationTime: string;
}

export const DEFAULT_ORDER_SETTINGS: ProductOrderSettings = {
  codEnabled: true,
  codFee: 0,
  codMinimumAmount: null,
  codMaximumAmount: null,
  codAvailableAreas: [],
  codInstructions: "",
  codConfirmationRequired: false,

  cardEnabled: true,
  cardMethods: ["visa", "mastercard"],
  paymentGatewayName: "",
  cardInstructions: "",
  cardProcessingFee: 0,
  paymentRedirectUrl: "",
  cardConfirmationRequired: false,

  whatsappEnabled: true,
  whatsappNumber: "+94754541118",
  whatsappTemplate: "Hello, I would like to order this product.\n\nProduct: {{productName}}\nPrice: {{productPrice}}\nVariation: {{variation}}\nQuantity: {{quantity}}\nProduct Link: {{productUrl}}",
  includeProductName: true,
  includeProductPrice: true,
  includeProductSku: false,
  includeVariation: true,
  includeQuantity: true,
  includeCustomerDetails: false,
  includeDeliveryAddress: false,
  includeProductUrl: true,

  deliveryType: "delivery",
  freeDeliveryEnabled: true,
  flatDeliveryFee: 0,
  estimatedDeliveryMinDays: 3,
  estimatedDeliveryMaxDays: 7,
  sameDayDeliveryEnabled: false,
  sameDayDeliveryFee: 0,
  expressDeliveryEnabled: false,
  expressDeliveryFee: 0,
  deliveryInstructions: "",
  restrictedDeliveryAreas: [],

  deliveryZones: [],

  pickupEnabled: false,
  pickupLocationName: "STREET MOBILE",
  pickupAddress: "163, Kandaswamy Kovil Road, Vavuniya Town",
  pickupMapUrl: "",
  pickupAvailableDays: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
  pickupStartTime: "09:00",
  pickupEndTime: "18:00",
  pickupInstructions: "",
  pickupContactNumber: "+94754541118",
  pickupPreparationTime: "30 minutes",
};

export interface Product {
  id: string;
  name: string;
  slug: string;
  category_id: string;
  category_name?: string;
  price: number;
  old_price: number | null;
  description: string;
  specifications: Record<string, string>;
  warranty: string;
  stock_status: "in_stock" | "low_stock" | "out_of_stock";
  colors: string[];
  storage_options: string[];
  storage_prices?: Record<string, number>;
  images: string[];
  featured: boolean;
  code?: string;
  allow_cod?: boolean;
  allow_card?: boolean;
  allow_whatsapp?: boolean;
  orderSettings?: ProductOrderSettings;
  created_at: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  icon: string;
  image_url: string;
  sort_order: number;
  product_count?: number;
  description?: string;
  group?: "phones" | "accessories" | "other";
}

export interface Review {
  id: string;
  author_name: string;
  author_photo: string;
  rating: number;
  text: string;
  review_date: string;
  visible: boolean;
}

export interface GalleryImage {
  id: string;
  image_url: string;
  caption: string;
  category: "shop" | "repairs" | "customers";
  sort_order: number;
}

export interface Banner {
  id: string;
  image_url: string;
  title: string;
  subtitle: string;
  cta_text: string;
  cta_link: string;
  sort_order: number;
  active: boolean;
}

export interface HeroSlide {
  id: string;
  image_url: string;
  alt: string;
  sort_order: number;
  active: boolean;
}

export interface ProductBanner {
  id: string;
  tag: string;
  title: string;
  title_highlight: string;
  subtitle: string;
  description: string;
  cta_text: string;
  cta_link: string;
  gradient: string;
  accent_color: string;
  float_image: string;
  sort_order: number;
  active: boolean;
}

export interface Order {
  id: string;
  product_name: string;
  price: number;
  storage: string;
  color: string;
  customer_name: string;
  customer_phone: string;
  status: "pending" | "confirmed" | "completed" | "cancelled";
  created_at: string;
}

export interface SiteSettings {
  store_name: string;
  phone: string;
  whatsapp: string;
  address: string;
  email: string;
  google_maps_link: string;
  google_maps_embed: string;
  logo_url: string;
  facebook: string;
  instagram: string;
  tiktok: string;
  business_hours: {
    weekdays: string;
    saturday: string;
    sunday: string;
  };
}

export interface UiSettings {
  snowEffectEnabled?: boolean;
}

export interface Service {
  icon: string;
  title: string;
  description: string;
}

export interface StoreFeature {
  icon: string;
  label: string;
}

// ==========================================
// ERP MODULES (Phase 1)
// ==========================================

export type RepairStatus = 
  | "Pending" 
  | "Checking" 
  | "Waiting Parts" 
  | "Repairing" 
  | "Quality Check" 
  | "Ready" 
  | "Delivered" 
  | "Cancelled";

export interface RepairJob {
  id: string;
  jobId: string; // Auto-generated e.g. REP-1001
  customerName: string;
  phone: string;
  deviceImei: string;
  brand: string;
  model: string;
  problem: string;
  technician: string;
  cost: number;
  advance: number;
  balance: number;
  warranty: string;
  estimatedDelivery: string;
  notes: string;
  status: RepairStatus;
  createdAt: string;
  updatedAt: string;
}

export interface Supplier {
  id: string;
  companyName: string;
  contactPerson: string;
  phone: string;
  whatsapp: string;
  email: string;
  address: string;
  productsSupplied: string[];
  outstandingBalance: number;
  rating: number;
  createdAt: string;
}

export interface CashFlowTransaction {
  id: string;
  type: "income" | "expense";
  category: "Salary" | "Rent" | "Electricity" | "Transport" | "Marketing" | "Sales" | "Repairs" | "Other";
  amount: number;
  description: string;
  date: string;
  createdAt: string;
}
