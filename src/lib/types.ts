import type { Product } from "@/data/catalog";

export type Text = { cs: string; en: string };
export type MediaRef = { kind: "image" | "video" | "youtube" | "vimeo"; url: string; alt?: string; poster?: string };

export interface ProductVideo { kind: "upload" | "youtube" | "vimeo"; url: string; title?: string }
export interface ProductImage { url: string; alt?: string }

/** Catalog product plus the fields only the database carries. */
export interface ShopProduct extends Omit<Product, "category"> {
  category: string;
  id?: string;
  status?: "draft" | "active" | "archived";
  stock?: number;
  sku?: string | null;
  images?: ProductImage[];
  videos?: ProductVideo[];
  description?: Text;
  featured?: boolean;
  /** True when the admin is looking at a version that lives in the active sandbox, not on the live site. */
  staged?: boolean;
}

export interface ShippingMethod {
  id: string; carrier: string; name: Text; description: Text; price: number; free_over: number | null;
  enabled: boolean; needs_pickup_point: boolean; vehicles: boolean; sort: number;
}
export interface PaymentMethod { id: string; name: Text; enabled: boolean; test_mode: boolean; config: Record<string, unknown>; sort: number }

export interface OrderItem { slug: string; name: string; brand?: string; price: number; qty: number; image?: string }
export interface Order {
  id: string; number: number; customer_email: string; customer_name: string | null; phone: string | null;
  shipping_address: Record<string, string> | null; items: OrderItem[]; subtotal: number; shipping_cost: number;
  discount_code: string | null; discount_amount: number; total: number; currency: string;
  status: "pending" | "paid" | "processing" | "fulfilled" | "cancelled" | "refunded";
  payment_provider: string | null; payment_status: "unpaid" | "pending" | "paid" | "failed" | "refunded"; payment_ref: string | null;
  shipping_method: string | null; shipping_carrier: string | null; pickup_point: Record<string, unknown> | null;
  tracking_number: string | null; label_url: string | null; notes: string | null;
  timeline: { at: string; text: string }[]; locale: string; created_at: string; updated_at: string;
}
export interface Discount { id: string; code: string; type: "percent" | "fixed" | "free_shipping"; value: number; min_total: number | null; starts_at: string | null; ends_at: string | null; usage_limit: number | null; used: number; active: boolean }
export interface Customer { id: string; email: string; name: string | null; phone: string | null; address: Record<string, string> | null; notes: string | null; marketing: boolean; created_at: string }
export interface MediaItem { id: string; path: string; url: string; kind: "image" | "video" | "file"; mime: string | null; size: number | null; alt: Text; created_at: string }

/* ───────── Landing-page builder ───────── */

/** Typography for one text element of a section. Every field is optional; unset fields keep the theme default. */
export interface TextStyle {
  font?: string;            // font family name from FONTS (e.g. "Oswald")
  size?: number;            // px on desktop; scales down fluidly on small screens
  sizeMobile?: number;      // px on phones (default: derived from size)
  weight?: number;          // 100–900
  color?: string;           // CSS colour
  tracking?: number;        // letter-spacing in em (e.g. -0.02)
  leading?: number;         // line-height multiplier (e.g. 1.1)
  upper?: boolean;          // uppercase
  italic?: boolean;
  align?: "left" | "center" | "right";
  shadow?: boolean;         // soft drop shadow, useful on photos
}
export type TextSlot = "eyebrow" | "title" | "text" | "cta";
export type CtaVariant = "white" | "outline-white" | "ink" | "ghost" | "link";
/** Where the text box sits over a hero/banner photo, in percent of the media. */
export interface Box { x: number; y: number; w: number; anchor?: "top" | "bottom" }

/** Fields every section shares. */
export interface SectionBase {
  id: string;
  hidden?: boolean;                              // kept in the page but not rendered
  styles?: Partial<Record<TextSlot, TextStyle>>; // per-element typography
  bg?: string;                                   // background colour (sections without media)
  color?: string;                                // base text colour
  padY?: number;                                 // vertical padding in px (sections without media)
  maxWidth?: number;                             // width of the text column in px
  box?: Box;                                     // overlay text position (hero, banner)
  ctaVariant?: CtaVariant;
  overlay?: number;                              // darkening 0–100 (hero, banner)
  overlayColor?: string;                         // colour of the darkening (default black)
  gap?: number;                                  // spacing between the text lines in px
}

export type Section = SectionBase & (
  | { type: "hero"; media: MediaRef; eyebrow?: Text; title: Text; text?: Text; cta?: { label: Text; href: string }; productSlug?: string; align?: "left" | "center" | "right"; height?: "large" | "medium" | "small" | "screen" }
  | { type: "categories"; eyebrow?: Text; title?: Text; text?: Text; categories: string[]; columns?: 2 | 3 | 4 }
  | { type: "products"; eyebrow?: Text; title?: Text; source: "featured" | "category" | "manual"; category?: string; slugs?: string[]; limit?: number; columns?: 2 | 3 | 4 }
  | { type: "banner"; media: MediaRef; eyebrow?: Text; title: Text; text?: Text; cta?: { label: Text; href: string }; align?: "left" | "center" | "right"; height?: "large" | "medium" | "small" }
  | { type: "video"; title?: Text; text?: Text; video: MediaRef }
  | { type: "brands"; eyebrow?: Text; title?: Text }
  | { type: "split"; media: MediaRef; eyebrow?: Text; title: Text; text?: Text; cta?: { label: Text; href: string }; mediaSide?: "left" | "right"; ratio?: "4/3" | "1/1" | "3/4" | "16/9" }
  | { type: "richtext"; title?: Text; body: Text; align?: "left" | "center" }
  | { type: "news"; title?: Text; limit?: number }
  | { type: "spacer"; height?: number }
);

export interface Page { slug: string; title: Text; sections: Section[]; status: "draft" | "published"; seo: { title?: Text; description?: Text }; updated_at: string }

/* ───────── Sandbox (staged change sets) ───────── */
export type ChangeEntity = "product" | "page" | "setting";
export interface ChangesetItem { id: string; changeset_id: string; entity: ChangeEntity; entity_id: string; label: string; patch: Record<string, unknown>; before: Record<string, unknown> | null; updated_at: string }
export interface Changeset { id: string; name: string; note: string | null; status: "open" | "published" | "discarded"; created_at: string; published_at: string | null; item_count?: number }

export interface StoreSettings {
  name: string; legal: string; address: string; phone: string; email: string; ico: string; dic: string;
  hours: Text; currency: string; locales: string[]; defaultLocale: string;
}
