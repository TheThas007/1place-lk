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
  created_at: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  icon: string;
  image_url: string;
  sort_order: number;
  description?: string;
  product_count?: number;
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

export type BannerStatus = "draft" | "scheduled" | "active" | "paused" | "expired" | "archived";
export type BannerPlacement = 
  | "homepage_hero"
  | "homepage_below_header"
  | "homepage_after_categories"
  | "homepage_above_bestsellers"
  | "homepage_above_new_arrivals"
  | "homepage_before_testimonials"
  | "shop_top"
  | "category_top"
  | "product_page"
  | "cart_page"
  | "checkout_notice"
  | "announcement_bar"
  | "popup_campaign";

export interface OfferBanner {
  id: string;
  internalName: string;
  headline: string;
  highlightText?: string;
  description?: string;
  promoLabel?: string;
  badgeText?: string;
  couponCode?: string;
  termsText?: string;
  
  primaryCtaText?: string;
  primaryCtaUrl?: string;
  secondaryCtaText?: string;
  secondaryCtaUrl?: string;
  linkType?: "internal" | "product" | "category" | "brand" | "offer" | "custom" | "whatsapp";
  openInNewTab?: boolean;
  
  desktopImage?: string;
  tabletImage?: string;
  mobileImage?: string;
  videoUrl?: string;
  posterImage?: string;
  altText?: string;
  overlayOpacity?: number;
  
  textAlign?: "left" | "center" | "right";
  contentPosition?: "top_left" | "center_left" | "bottom_left" | "center" | "top_right" | "center_right" | "bottom_right";
  textColor?: string;
  stylePreset?: "premium_dark" | "clean_light" | "product_focus" | "flash_sale" | "festival_offer" | "minimal_promo" | "new_arrival";
  backgroundColor?: string;
  overlayColor?: string;
  
  placement: BannerPlacement;
  sort_order?: number;
  status: BannerStatus;
  
  startAt?: string;
  endAt?: string;
  publishImmediately?: boolean;
  noExpiry?: boolean;
  
  targetDevice?: "all" | "desktop" | "mobile" | "tablet";
  targetAudience?: "all" | "logged_in" | "guest";
  
  countdownEnabled?: boolean;
  countdownEndAt?: string;
  countdownLabel?: string;
  countdownExpiredMsg?: string;
  
  created_at?: string;
  updated_at?: string;
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
