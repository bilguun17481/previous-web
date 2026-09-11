import { categories as localCategories, products as localProducts, type Category, type Product } from "@/data/catalog";
import { supabaseConfigured } from "@/lib/supabase/env";
import { supabasePublic } from "@/lib/supabase/public";
import type { Page, PaymentMethod, ShippingMethod, ShopProduct, Text } from "@/lib/types";

/* Read side of the storefront. With Supabase configured it reads the database;
   otherwise (local dev, GitHub Pages export) it serves the bundled catalog. */

const rowToProduct = (r: Record<string, unknown>): ShopProduct => ({
  id: r.id as string,
  slug: r.slug as string, brand: r.brand as string, category: r.category as Category, name: r.name as string,
  price: Number(r.price), oldPrice: r.old_price == null ? undefined : Number(r.old_price),
  homologation: r.homologation as Product["homologation"], art: "gear",
  tags: (r.tags as Product["tags"]) ?? [], cc: (r.cc as number) ?? undefined, power: (r.power as string) ?? undefined, drive: (r.drive as string) ?? undefined,
  short: (r.short as Text) ?? { cs: "", en: "" }, specs: (r.specs as Product["specs"]) ?? [], colors: (r.colors as string[]) ?? [],
  status: r.status as ShopProduct["status"], stock: r.stock as number, sku: r.sku as string | null,
  images: (r.images as ShopProduct["images"]) ?? [], videos: (r.videos as ShopProduct["videos"]) ?? [],
  description: (r.description as Text) ?? undefined, featured: r.featured as boolean,
});

export async function getProducts(opts: { category?: Category; featured?: boolean; slugs?: string[] } = {}): Promise<ShopProduct[]> {
  if (!supabaseConfigured) {
    let list: ShopProduct[] = localProducts;
    if (opts.category) list = list.filter((p) => p.category === opts.category);
    if (opts.slugs) list = opts.slugs.map((s) => list.find((p) => p.slug === s)).filter(Boolean) as ShopProduct[];
    return list;
  }
  try {
    let q = supabasePublic().from("products").select("*").eq("status", "active").order("sort");
    if (opts.category) q = q.eq("category", opts.category);
    if (opts.featured) q = q.eq("featured", true);
    if (opts.slugs) q = q.in("slug", opts.slugs);
    const { data, error } = await q;
    if (error) throw error;
    return (data ?? []).map(rowToProduct);
  } catch (e) { console.error("getProducts", e); return []; }
}

export async function getProduct(slug: string): Promise<ShopProduct | undefined> {
  if (!supabaseConfigured) return localProducts.find((p) => p.slug === slug);
  try {
    const { data } = await supabasePublic().from("products").select("*").eq("slug", slug).maybeSingle();
    return data ? rowToProduct(data) : undefined;
  } catch (e) { console.error("getProduct", e); return undefined; }
}

export async function getCategories() {
  if (!supabaseConfigured) return localCategories.map((c) => ({ slug: c.slug, label: c.label, blurb: c.blurb, image_url: null as string | null, video_url: null as string | null }));
  const { data } = await supabasePublic().from("categories").select("*").order("sort").then((r) => r, () => ({ data: null }));
  if (!data?.length) return localCategories.map((c) => ({ slug: c.slug, label: c.label, blurb: c.blurb, image_url: null as string | null, video_url: null as string | null }));
  return (data ?? []) as { slug: Category; label: Text; blurb: Text; image_url: string | null; video_url: string | null }[];
}

export async function getPage(slug: string): Promise<Page | null> {
  if (!supabaseConfigured) return null;
  const { data } = await supabasePublic().from("pages").select("*").eq("slug", slug).eq("status", "published").maybeSingle().then((r) => r, () => ({ data: null }));
  return (data as Page | null) ?? null;
}

/** Same as getPage but as the signed-in viewer, so staff can preview drafts. */
export async function getPageAsViewer(slug: string): Promise<Page | null> {
  if (!supabaseConfigured) return null;
  const { supabaseServer } = await import("@/lib/supabase/server");
  const sb = await supabaseServer();
  const { data } = await sb.from("pages").select("*").eq("slug", slug).maybeSingle();
  return (data as Page | null) ?? null;
}

export async function getSetting<T = Record<string, unknown>>(key: string): Promise<T | null> {
  if (!supabaseConfigured) return null;
  const { data } = await supabasePublic().from("settings").select("value").eq("key", key).maybeSingle().then((r) => r, () => ({ data: null }));
  return (data?.value as T) ?? null;
}

export async function getShippingMethods(): Promise<ShippingMethod[]> {
  if (!supabaseConfigured) {
    return [
      { id: "pickup", carrier: "dealer", name: { cs: "Osobní odběr, Golčův Jeníkov", en: "Pick up in Golčův Jeníkov" }, description: { cs: "", en: "" }, price: 0, free_over: null, enabled: true, needs_pickup_point: false, vehicles: true, sort: 0 },
      { id: "packeta_point", carrier: "packeta", name: { cs: "Zásilkovna – výdejní místo", en: "Packeta pickup point" }, description: { cs: "", en: "" }, price: 89, free_over: 3000, enabled: true, needs_pickup_point: true, vehicles: false, sort: 1 },
    ];
  }
  const { data } = await supabasePublic().from("shipping_methods").select("*").eq("enabled", true).order("sort");
  return (data ?? []) as ShippingMethod[];
}

export async function getPaymentMethods(): Promise<PaymentMethod[]> {
  if (!supabaseConfigured) {
    return [
      { id: "bank_transfer", name: { cs: "Bankovní převod", en: "Bank transfer" }, enabled: true, test_mode: true, config: {}, sort: 0 },
      { id: "cash", name: { cs: "Hotově při odběru", en: "Cash on collection" }, enabled: true, test_mode: true, config: {}, sort: 1 },
    ];
  }
  const { data } = await supabasePublic().from("payment_methods").select("*").eq("enabled", true).order("sort");
  return (data ?? []) as PaymentMethod[];
}
