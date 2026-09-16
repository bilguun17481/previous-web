import { categories as localCategories, products as localProducts, type Product } from "@/data/catalog";
import { supabaseConfigured } from "@/lib/supabase/env";
import { supabasePublic } from "@/lib/supabase/public";
import { cache } from "react";
import type { ChangesetItem, Page, PaymentMethod, ShippingMethod, ShopProduct, Text } from "@/lib/types";

/* Read side of the storefront. With Supabase configured it reads the database;
   otherwise (local dev, GitHub Pages export) it serves the bundled catalog. */

const rowToProduct = (r: Record<string, unknown>): ShopProduct => ({
  id: r.id as string,
  slug: r.slug as string, brand: r.brand as string, category: r.category as string, name: r.name as string,
  price: Number(r.price), oldPrice: r.old_price == null ? undefined : Number(r.old_price),
  homologation: r.homologation as Product["homologation"], art: "gear",
  tags: (r.tags as Product["tags"]) ?? [], cc: (r.cc as number) ?? undefined, power: (r.power as string) ?? undefined, drive: (r.drive as string) ?? undefined,
  short: (r.short as Text) ?? { cs: "", en: "" }, specs: (r.specs as Product["specs"]) ?? [], colors: (r.colors as string[]) ?? [],
  status: r.status as ShopProduct["status"], stock: r.stock as number, sku: r.sku as string | null,
  images: (r.images as ShopProduct["images"]) ?? [], videos: (r.videos as ShopProduct["videos"]) ?? [],
  description: (r.description as Text) ?? undefined, featured: r.featured as boolean,
});

/* ───── Sandbox preview ─────
   A signed-in staff member who activated a sandbox in the admin carries an `md-sandbox` cookie.
   Their storefront requests then show the live data with the sandbox's staged changes applied.
   Anonymous visitors never see it: the items are read as the viewer and RLS limits them to staff. */
const sandboxItems = cache(async (): Promise<{ id: string; items: ChangesetItem[] } | null> => {
  if (!supabaseConfigured) return null;
  try {
    const { cookies } = await import("next/headers");
    const id = (await cookies()).get("md-sandbox")?.value;
    if (!id || !/^[0-9a-f-]{36}$/i.test(id)) return null;
    const { supabaseServer } = await import("@/lib/supabase/server");
    const sb = await supabaseServer();
    const { data: { user } } = await sb.auth.getUser();
    if (!user) return null;
    const { data } = await sb.from("changeset_items").select("*").eq("changeset_id", id);
    return { id, items: (data as ChangesetItem[]) ?? [] };
  } catch { return null; }
});
/** Name of the sandbox being previewed, for the storefront banner. Null when not previewing. */
export const sandboxPreview = cache(async (): Promise<{ id: string; name: string } | null> => {
  const sx = await sandboxItems(); if (!sx) return null;
  try {
    const { supabaseServer } = await import("@/lib/supabase/server");
    const sb = await supabaseServer();
    const { data } = await sb.from("changesets").select("name,status").eq("id", sx.id).maybeSingle();
    return data && data.status === "open" ? { id: sx.id, name: data.name as string } : null;
  } catch { return null; }
});
/* ───── Self-healing media addresses ─────
   When a file is moved between folders in the media library its row keeps the same id but gets a new URL.
   Product photos are relinked on the spot, but a page banner or category tile built earlier may still
   carry the old address. Before rendering, any storage URL that no longer exists in the media table is
   looked up by file name and swapped for the current one; when a service key is available the corrected
   record is written back so the fix is permanent. */
const STORAGE = "/storage/v1/object/public/media/";
const healUrls = cache(async (urls: string[]): Promise<Map<string, string>> => {
  const out = new Map<string, string>();
  const mine = Array.from(new Set(urls.filter((u) => u && u.includes(STORAGE))));
  if (!mine.length || !supabaseConfigured) return out;
  try {
    const sb = supabasePublic();
    const { data: present } = await sb.from("media").select("url").in("url", mine);
    const have = new Set((present ?? []).map((r) => r.url as string));
    for (const u of mine) {
      if (have.has(u)) continue;
      const file = decodeURIComponent(u.split("/").pop() ?? "");
      if (!file) continue;
      const { data } = await sb.from("media").select("url,path").ilike("path", `%${file.replace(/[%_]/g, (c) => "\\" + c)}`).limit(5);
      const row = (data ?? []).find((r) => (r.path as string).endsWith("/" + file) || r.path === file);
      if (row?.url && row.url !== u) out.set(u, row.url as string);
    }
  } catch (e) { console.error("healUrls", e); }
  return out;
});
const persist = async (table: string, key: string, id: string, patch: Record<string, unknown>) => {
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) return;
  try { const { supabaseAdmin } = await import("@/lib/supabase/admin"); await supabaseAdmin().from(table).update(patch).eq(key, id); } catch (e) { console.error("persist", table, e); }
};
async function healPage(page: Page | null): Promise<Page | null> {
  if (!page?.sections?.length) return page;
  const urls: string[] = [];
  for (const s of page.sections as unknown as Record<string, unknown>[]) for (const k of ["media", "video"]) { const m = s[k] as { url?: string; poster?: string } | undefined; if (m?.url) urls.push(m.url); if (m?.poster) urls.push(m.poster); }
  const map = await healUrls(urls);
  if (!map.size) return page;
  const sections = (page.sections as unknown as Record<string, unknown>[]).map((s) => {
    const n = JSON.parse(JSON.stringify(s)) as Record<string, unknown>;
    for (const k of ["media", "video"]) { const m = n[k] as { url?: string; poster?: string } | undefined; if (m?.url && map.has(m.url)) m.url = map.get(m.url)!; if (m?.poster && map.has(m.poster)) m.poster = map.get(m.poster)!; }
    return n;
  }) as unknown as Page["sections"];
  await persist("pages", "slug", page.slug, { sections });
  return { ...page, sections };
}
async function healProducts(list: ShopProduct[], write: boolean): Promise<ShopProduct[]> {
  const urls: string[] = [];
  for (const p of list) { for (const i of p.images ?? []) urls.push(i.url); for (const c of p.colors ?? []) if (typeof c !== "string" && c.image) urls.push(c.image); }
  const map = await healUrls(urls);
  if (!map.size) return list;
  return Promise.all(list.map(async (p) => {
    const images = p.images?.map((i) => ({ ...i, url: map.get(i.url) ?? i.url }));
    const colors = p.colors?.map((c) => (typeof c === "string" ? c : { ...c, image: c.image ? map.get(c.image) ?? c.image : c.image }));
    const changed = JSON.stringify(images) !== JSON.stringify(p.images) || JSON.stringify(colors) !== JSON.stringify(p.colors);
    if (changed && write && p.id) await persist("products", "id", p.id, { images, colors });
    return changed ? ({ ...p, images, colors } as ShopProduct) : p;
  }));
}

const overlayProducts = async (list: ShopProduct[]) => {
  const sx = await sandboxItems(); if (!sx?.items.length) return list;
  const m = new Map(sx.items.filter((i) => i.entity === "product").map((i) => [i.entity_id, i.patch]));
  return list.map((p) => (p.id && m.has(p.id) ? ({ ...p, ...m.get(p.id) } as ShopProduct) : p));
};
const overlayPage = async (slug: string, page: Page | null) => {
  const sx = await sandboxItems(); if (!sx) return page;
  const it = sx.items.find((i) => i.entity === "page" && i.entity_id === slug);
  return it ? (it.patch as unknown as Page) : page;
};

export async function getProducts(opts: { category?: string; featured?: boolean; slugs?: string[] } = {}): Promise<ShopProduct[]> {
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
    return overlayProducts(await healProducts((data ?? []).map(rowToProduct), false));
  } catch (e) { console.error("getProducts", e); return []; }
}

export async function getProduct(slug: string): Promise<ShopProduct | undefined> {
  if (!supabaseConfigured) return localProducts.find((p) => p.slug === slug);
  try {
    const { data, error } = await supabasePublic().from("products").select("*").eq("slug", slug).maybeSingle();
    if (error) throw error;
    return data ? (await overlayProducts(await healProducts([rowToProduct(data)], true)))[0] : undefined;
  } catch (e) { console.error("getProduct", e); return localProducts.find((p) => p.slug === slug); }
}

export async function getCategories() {
  if (!supabaseConfigured) return localCategories.map((c) => ({ slug: c.slug, label: c.label, blurb: c.blurb, image_url: null as string | null, video_url: null as string | null }));
  const { data } = await supabasePublic().from("categories").select("*").order("sort").then((r) => r, () => ({ data: null }));
  if (!data?.length) return localCategories.map((c) => ({ slug: c.slug, label: c.label, blurb: c.blurb, image_url: null as string | null, video_url: null as string | null }));
  const rows = data as { slug: string; label: Text; blurb: Text; image_url: string | null; video_url: string | null }[];
  const map = await healUrls(rows.flatMap((c) => [c.image_url ?? "", c.video_url ?? ""]));
  if (!map.size) return rows;
  return Promise.all(rows.map(async (c) => {
    const image_url = c.image_url ? map.get(c.image_url) ?? c.image_url : c.image_url; const video_url = c.video_url ? map.get(c.video_url) ?? c.video_url : c.video_url;
    if (image_url !== c.image_url || video_url !== c.video_url) await persist("categories", "slug", c.slug, { image_url, video_url });
    return { ...c, image_url, video_url };
  }));
}

export async function getPage(slug: string): Promise<Page | null> {
  if (!supabaseConfigured) return null;
  const { data } = await supabasePublic().from("pages").select("*").eq("slug", slug).eq("status", "published").maybeSingle().then((r) => r, () => ({ data: null }));
  return healPage(await overlayPage(slug, (data as Page | null) ?? null));
}

/** Same as getPage but as the signed-in viewer, so staff can preview drafts. */
export async function getPageAsViewer(slug: string): Promise<Page | null> {
  if (!supabaseConfigured) return null;
  const { supabaseServer } = await import("@/lib/supabase/server");
  const sb = await supabaseServer();
  const { data } = await sb.from("pages").select("*").eq("slug", slug).maybeSingle();
  return healPage((data as Page | null) ?? null);
}

export async function getSetting<T = Record<string, unknown>>(key: string): Promise<T | null> {
  if (!supabaseConfigured) return null;
  const { data } = await supabasePublic().from("settings").select("value").eq("key", key).maybeSingle().then((r) => r, () => ({ data: null }));
  const sx = await sandboxItems();
  const it = sx?.items.find((i) => i.entity === "setting" && i.entity_id === key);
  if (it) return (it.patch as { value: T }).value;
  return (data?.value as T) ?? null;
}

export async function getShippingMethods(): Promise<ShippingMethod[]> {
  if (!supabaseConfigured) {
    return [
      { id: "pickup", carrier: "dealer", name: { cs: "Osobní odběr, Golčův Jeníkov", en: "Pick up in Golčův Jeníkov" }, description: { cs: "", en: "" }, price: 0, free_over: null, enabled: true, needs_pickup_point: false, vehicles: true, sort: 0 },
      { id: "packeta_point", carrier: "packeta", name: { cs: "Zásilkovna – výdejní místo", en: "Packeta pickup point" }, description: { cs: "", en: "" }, price: 89, free_over: 3000, enabled: true, needs_pickup_point: true, vehicles: false, sort: 1 },
      { id: "ppl_shop", carrier: "ppl", name: { cs: "PPL ParcelShop / ParcelBox", en: "PPL ParcelShop / ParcelBox" }, description: { cs: "", en: "" }, price: 79, free_over: 3000, enabled: true, needs_pickup_point: true, vehicles: false, sort: 2 },
      { id: "gls_shop", carrier: "gls", name: { cs: "GLS ParcelShop / GLS Box", en: "GLS ParcelShop / GLS Box" }, description: { cs: "", en: "" }, price: 75, free_over: 3000, enabled: true, needs_pickup_point: true, vehicles: false, sort: 3 },
      { id: "balikovna", carrier: "balikovna", name: { cs: "Balíkovna", en: "Balíkovna (Czech Post pickup)" }, description: { cs: "", en: "" }, price: 69, free_over: 3000, enabled: true, needs_pickup_point: true, vehicles: false, sort: 4 },
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
