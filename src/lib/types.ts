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

export interface Service {
  icon: string;
  title: string;
  description: string;
}

export interface StoreFeature {
  icon: string;
  label: string;
}
