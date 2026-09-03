import type { Product } from "@/data/catalog";

export type Text = { cs: string; en: string };
export type MediaRef = { kind: "image" | "video" | "youtube" | "vimeo"; url: string; alt?: string; poster?: string };

export interface ProductVideo { kind: "upload" | "youtube" | "vimeo"; url: string; title?: string }
export interface ProductImage { url: string; alt?: string }

/** Catalog product plus the fields only the database carries. */
export interface ShopProduct extends Product {
  id?: string;
  status?: "draft" | "active" | "archived";
  stock?: number;
  sku?: string | null;
  images?: ProductImage[];
  videos?: ProductVideo[];
  description?: Text;
  featured?: boolean;
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

/** Landing-page builder sections. */
export type Section =
  | { id: string; type: "hero"; media: MediaRef; eyebrow?: Text; title: Text; text?: Text; cta?: { label: Text; href: string }; productSlug?: string; align?: "left" | "center"; height?: "large" | "medium"; overlay?: number }
  | { id: string; type: "categories"; eyebrow?: Text; title?: Text; text?: Text; categories: string[] }
  | { id: string; type: "products"; eyebrow?: Text; title?: Text; source: "featured" | "category" | "manual"; category?: string; slugs?: string[]; limit?: number }
  | { id: string; type: "banner"; media: MediaRef; eyebrow?: Text; title: Text; text?: Text; cta?: { label: Text; href: string } }
  | { id: string; type: "video"; title?: Text; text?: Text; video: MediaRef }
  | { id: string; type: "brands"; eyebrow?: Text; title?: Text }
  | { id: string; type: "split"; media: MediaRef; eyebrow?: Text; title: Text; text?: Text; cta?: { label: Text; href: string }; mediaSide?: "left" | "right" }
  | { id: string; type: "richtext"; title?: Text; body: Text }
  | { id: string; type: "news"; title?: Text; limit?: number };

export interface Page { slug: string; title: Text; sections: Section[]; status: "draft" | "published"; seo: { title?: Text; description?: Text }; updated_at: string }

export interface StoreSettings {
  name: string; legal: string; address: string; phone: string; email: string; ico: string; dic: string;
  hours: Text; currency: string; locales: string[]; defaultLocale: string;
}
