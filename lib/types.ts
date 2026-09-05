export const DOCUMENT_TYPES = ["FAC", "DEV", "BDL", "BDC"] as const;
export type DocumentType = (typeof DOCUMENT_TYPES)[number];

// Database row shapes — mirror the *actual* Supabase schema (see `sql/`).
// NOTE: The original Flutter spec §3 lists `products.image_url` and
// `products.unit_price`, but the real DB columns are `photo_url` and `price`
// (created in gcoop_full.sql, never renamed). Per "use the DB as-is", the web
// app reads/writes the real column names. Spec §7 rationale applies.

export type Role = "admin" | "admin_cooperative";

export interface Profile {
  id: string;
  email: string | null;
  full_name: string | null;
  role: Role | null;
  cooperative_id: string | null;
  must_change_password: boolean;
  created_at: string;
}

export interface Cooperative {
  id: string;
  name: string;
  name_ar: string | null;
  name_fr: string | null;
  address: string | null;
  phone: string | null;
  email: string | null;
  ice: string | null;
  rlc: string | null;
  if_number: string | null;
  secteur: string | null;
  logo_url: string | null;
  created_at: string;
}

export interface Client {
  id: string;
  cooperative_id: string;
  name: string;
  phone: string;
  ice: string | null;
  address: string | null;
  created_at: string;
}

export interface Supplier {
  id: string;
  cooperative_id: string;
  name: string;
  phone: string | null;
  email: string | null;
  address: string | null;
  created_at: string;
}

export interface Product {
  id: string;
  cooperative_id: string;
  name: string;
  photo_url: string | null;
  category: string | null;
  price: number;
  stock: number;
  min_stock: number;
  is_bio: boolean;
  deleted_at: string | null;
  created_at: string;
}

export interface ProductItem extends Omit<Product, "photo_url" | "price"> {
  photo_url?: string | null;
  price: number | string;
}

export type DocumentStatus = "draft" | "validated";

export interface DocumentRow {
  id: string;
  cooperative_id: string;
  type: DocumentType;
  number: string;
  name: string | null;
  client_id: string | null;
  supplier_id: string | null;
  discount: number;
  tva_rate: number;
  tva_amount: number;
  delivery_fees: number;
  delivery_location: string | null;
  delivery_delay: string | null;
  payment_method: string | null;
  date: string;
  status: DocumentStatus;
  is_paid: boolean;
  notes: string | null;
  additional_info: string | null;
  total: number;
  deleted_at: string | null;
  created_at: string;
}

export interface DocumentItem {
  id: string;
  document_id: string;
  product_id: string | null;
  product_ref: string | null;
  description: string | null;
  quantity: number;
  unit: string | null;
  unit_price: number;
}

export interface Expense {
  id: string;
  cooperative_id: string;
  category: string;
  amount: number;
  date: string;
  note: string | null;
  created_at: string;
}

export type IncomeSource = "manual" | "invoice";

export interface Income {
  id: string;
  cooperative_id: string;
  category: string;
  amount: number;
  date: string;
  note: string | null;
  source: IncomeSource;
  document_id: string | null;
  created_at: string;
}

export interface Activity {
  id: string;
  cooperative_id: string;
  name: string;
  date: string;
  location: string;
  notes: string | null;
  image_url: string | null;
  created_by: string;
  created_at: string;
}

export interface DocumentWithClient extends DocumentRow {
  clients: { name: string } | null;
}

export interface DocumentWithItems extends DocumentRow {
  client: Client | null;
  document_items: DocumentItem[];
}

// ---------------------------------------------------------------------------
// Site vitrine "Taawonyati" — contenu dynamique piloté depuis l'admin.
// (tables créées dans sql/20_landing_site.sql)
// ---------------------------------------------------------------------------

export type LandingMediaKey = "hero_dashboard";

export interface LandingMedia {
  id: string;
  key: LandingMediaKey | string;
  image_url: string;
  updated_at: string;
}

export interface LandingHeroText {
  id: string;
  title: string;
  highlighted_word: string;
  subtitle: string;
  updated_at: string;
}

export interface LandingFeature {
  id: string;
  icon: string;
  title: string;
  description: string;
  sort_order: number;
}

export type PricingPlanType = "monthly" | "annual";

export interface PricingPlan {
  id: string;
  plan_type: PricingPlanType;
  price: number;
  currency: string;
  badge: string | null;
  features: string[];
  whatsapp_message: string | null;
  is_featured: boolean;
  updated_at: string;
}

export type SocialPlatform = "whatsapp" | "facebook" | "twitter" | "email";

export interface SocialLink {
  id: string;
  platform: SocialPlatform;
  url: string;
}

export interface SiteSetting {
  id: string;
  key: string;
  value: string;
}

export interface ContactMessage {
  id: string;
  name: string | null;
  email: string;
  message: string | null;
  created_at: string;
  is_read: boolean;
}

export interface LandingScreenshot {
  id: string;
  category: "app" | "web";
  image_url: string;
  sort_order: number;
  created_at: string;
}

export const MOCKUP_SLOTS = [
  "hero_dashboard",
  "access_web_dashboard",
  "access_mobile_home",
  "access_mobile_documents",
  "access_mobile_produits",
  "access_mobile_finances",
  "access_mobile_plus",
] as const;

export type MockupSlotKey = (typeof MOCKUP_SLOTS)[number];

export interface DesignerCard {
  id: string;
  name: string;
  role: string;
  bio: string;
  avatar_url: string | null;
  whatsapp_link: string | null;
  email: string | null;
  portfolio_link: string | null;
  social_instagram: string | null;
  social_facebook: string | null;
  social_twitter: string | null;
  social_dribbble: string | null;
  updated_at: string;
}
