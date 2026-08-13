export interface Product {
  id: string;
  name: string;
  slug: string;
  category_id: string;
  category_name?: string;
  price: number;
  old_price: number | null;
  sale_price?: number | null;
  description: string;
  specifications: Record<string, string>;
  warranty: string;
  brand_warranty?: string;
  stock_status: "in_stock" | "low_stock" | "out_of_stock";
  stock_count?: number;
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
  video_url?: string;
  delivery_info?: string;
  compatibility_tags?: string[];
  compatible_brands?: string[];
  compatible_models?: string[];
  related_categories?: string[];
  related_products?: string[];
  recommendation_mode?: "auto" | "manual" | "pinned";
  color_variants?: ProductColor[];
  variant_combos?: ProductVariantCombo[];
  warranty_options?: WarrantyOption[];
  productType?: "phone" | "accessory";
  hasColorVariants?: boolean;
  hasStorageVariants?: boolean;
  is_new_arrival?: boolean;
  category_slug?: string;
  categoryId?: string;
  categoryName?: string;
  categorySlug?: string;
  brand_id?: string;
  brand_name?: string;
  brand_slug?: string;
  brandId?: string;
  brandName?: string;
  brandSlug?: string;
  subcategory_id?: string;
  subcategory_name?: string;
  subcategory_slug?: string;
  subcategoryId?: string;
  subcategoryName?: string;
  subcategorySlug?: string;
  installment_price?: string;
  brand?: string;
  tags?: string[];
  status?: "active" | "draft" | "inactive";
  show_on_homepage?: boolean;
  meta_title?: string;
  metaTitle?: string;
  meta_description?: string;
  metaDescription?: string;
}

export interface Brand {
  id: string;
  name: string;
  slug: string;
  logo_url?: string;
  description?: string;
  sort_order?: number;
  status?: "active" | "inactive";
  show_on_homepage?: boolean;
  product_count?: number;
}

export interface ProductColor {
  id: string;
  name: string;
  hex: string;
  sort_order?: number;
  is_default?: boolean;
  active?: boolean;
  cover_image?: string;
  images: string[];
  video_url?: string;
  alt_text?: string;
}

export interface ProductVariantCombo {
  id: string;
  color_id?: string;
  color_name?: string;
  color_hex?: string;
  ram?: string;
  storage?: string;
  sim_type?: string;
  sku: string;
  barcode?: string;
  price: number;
  old_price?: number | null;
  cost_price?: number;
  stock_quantity: number;
  reserved_stock: number;
  available_stock: number;
  low_stock_threshold?: number;
  weight?: number;
  status: "active" | "inactive";
  image_ref?: string;
  warranty?: string;
}

export interface WarrantyOption {
  id: string;
  title: string;
  type: "No Warranty" | "Shop Warranty" | "Manufacturer Warranty" | "Extended Warranty" | "Lifetime Warranty" | "Unlimited Warranty";
  duration_value: number | string;
  duration_unit: "months" | "years" | "lifetime" | "unlimited";
  additional_price: number;
  coverage_details: string;
  exclusions?: string;
  claim_instructions?: string;
  status: "active" | "inactive";
  is_default?: boolean;
  sort_order?: number;
}

export interface InventoryLog {
  id: string;
  variant_id: string;
  variant_name: string;
  previous_quantity: number;
  changed_quantity: number;
  new_quantity: number;
  reason: "add_stock" | "damaged" | "correct_count" | "customer_return" | "supplier_restock" | "order_fulfillment";
  admin_id?: string;
  timestamp: string;
  note?: string;
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
  group?: "phones" | "product_categories" | "accessories" | "other";
  status?: "active" | "inactive";
  show_in_selector?: boolean;
  show_on_homepage?: boolean;
  parent_id?: string;
}

export interface Review {
  id: string;
  author_name: string;
  author_photo?: string;
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
  desktop_image_url?: string;
  mobile_image_url?: string;
  alt: string;
  sort_order: number;
  active: boolean;
  campaign_label?: string;
  heading?: string;
  description?: string;
  promo_text?: string;
  primary_button_text?: string;
  primary_button_url?: string;
  show_secondary_button?: boolean;
  secondary_button_text?: string;
  secondary_button_url?: string;
  start_date?: string;
  expiry_date?: string;

  heading_line_1?: string;
  heading_line_2?: string;
  show_heading_line_1?: boolean;
  show_heading_line_2?: boolean;
  heading_line_1_color?: string;
  headingLine1Color?: string;
  heading_line_2_color?: string;
  headingLine2Color?: string;
  heading_line_1_size?: string;
  heading_line_2_size?: string;
  heading_line_1_weight?: string;
  heading_line_2_weight?: string;
  heading_line_1_casing?: "as_typed" | "uppercase" | "title_case";
  heading_line_2_casing?: "as_typed" | "uppercase" | "title_case";
  show_badge?: boolean;
  show_description?: boolean;
  show_primary_button?: boolean;

  // Custom Styling & Overlay Controls
  badge_text_color?: string;
  badge_bg_color?: string;
  heading_color?: string;
  description_color?: string;
  button_text_color?: string;
  button_bg_color?: string;
  secondary_button_text_color?: string;
  secondary_button_bg_color?: string;
  secondary_button_border_color?: string;
  overlay_color?: string;
  overlay_opacity?: number; // 0 to 100
  desktop_image_position?: string;
  mobile_image_position?: string;
  text_align?: "left" | "center" | "right";
  content_horizontal_position?: "left" | "center" | "right";
  content_vertical_position?: "top" | "center" | "bottom";
  content_max_width?: "500px" | "520px" | "570px" | "620px" | "680px" | "700px" | "720px" | "760px" | "820px" | "full";
  desktop_heading_size?: string;
  tablet_heading_size?: string;
  mobile_heading_size?: string;
  font_family?: string;
  font_weight?: string;
  line_height?: string;
  letter_spacing?: string;
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
  
  contentMode?: "image_only" | "overlay" | "split";
  imageFit?: "cover" | "contain";
  imagePosition?: "center" | "top" | "bottom" | "left" | "right";
  entireBannerClickable?: boolean;
  enableCta?: boolean;
  cornerRadius?: number;
  bannerHeightDesktop?: number;
  sectionSpacing?: number;

  additionalImages?: string[];
  textAnimationMode?: "pulse" | "marquee" | "glow" | "bounce" | "fade" | "none";
  showAnnouncementTicker?: boolean;
  announcementText?: string;

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
