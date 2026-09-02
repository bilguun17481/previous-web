"use client";
/* Admin data access. `supabaseRepo` talks to the database; `demoRepo` keeps sample data in
   localStorage so the admin can be explored before a Supabase project exists. */
import { products as localProducts, categories as localCategories } from "@/data/catalog";
import { supabaseConfigured } from "@/lib/supabase/env";
import { supabaseBrowser } from "@/lib/supabase/client";
import { defaultHome } from "@/lib/defaultHome";
import type { Customer, Discount, MediaItem, Order, Page, PaymentMethod, ShippingMethod, ShopProduct, Text } from "@/lib/types";

export interface Profile { id: string; email: string | null; full_name: string | null; role: "owner" | "admin" | "staff"; created_at: string }
export interface CategoryRow { slug: string; label: Text; blurb: Text; image_url: string | null; video_url: string | null; sort: number }
export interface SalesDay { day: string; orders: number; revenue: number }

export interface Repo {
  mode: "supabase" | "demo";
  orders: { list(): Promise<Order[]>; get(id: string): Promise<Order | null>; update(id: string, patch: Partial<Order>): Promise<void> };
  products: { list(): Promise<ShopProduct[]>; get(id: string): Promise<ShopProduct | null>; save(p: Partial<ShopProduct> & { slug: string }): Promise<string>; remove(id: string): Promise<void> };
  categories: { list(): Promise<CategoryRow[]>; save(c: CategoryRow): Promise<void> };
  customers: { list(): Promise<Customer[]> };
  discounts: { list(): Promise<Discount[]>; save(d: Partial<Discount>): Promise<void>; remove(id: string): Promise<void> };
  pages: { list(): Promise<Page[]>; get(slug: string): Promise<Page | null>; save(p: Page): Promise<void>; remove(slug: string): Promise<void> };
  media: { list(): Promise<MediaItem[]>; upload(file: File, onProgress?: (pct: number) => void): Promise<MediaItem>; remove(item: MediaItem): Promise<void> };
  settings: { get<T>(key: string): Promise<T | null>; set(key: string, value: unknown): Promise<void> };
  shipping: { list(): Promise<ShippingMethod[]>; save(m: ShippingMethod): Promise<void>; remove(id: string): Promise<void> };
  payments: { list(): Promise<PaymentMethod[]>; save(m: PaymentMethod): Promise<void> };
  team: { list(): Promise<Profile[]> };
  salesByDay(days: number): Promise<SalesDay[]>;
}

/* ───────────── Supabase ───────────── */
const rowToProduct = (r: Record<string, unknown>): ShopProduct => ({
  id: r.id as string, slug: r.slug as string, brand: r.brand as string, category: r.category as ShopProduct["category"], name: r.name as string,
  price: Number(r.price), oldPrice: r.old_price == null ? undefined : Number(r.old_price), homologation: r.homologation as ShopProduct["homologation"], art: "gear",
  tags: (r.tags as ShopProduct["tags"]) ?? [], cc: (r.cc as number) ?? undefined, power: (r.power as string) ?? undefined, drive: (r.drive as string) ?? undefined,
  short: (r.short as Text) ?? { cs: "", en: "" }, specs: (r.specs as ShopProduct["specs"]) ?? [], colors: (r.colors as string[]) ?? [],
  status: r.status as ShopProduct["status"], stock: r.stock as number, sku: r.sku as string | null, images: (r.images as ShopProduct["images"]) ?? [],
  videos: (r.videos as ShopProduct["videos"]) ?? [], description: (r.description as Text) ?? { cs: "", en: "" }, featured: Boolean(r.featured),
});
const productToRow = (p: Partial<ShopProduct>) => ({
  slug: p.slug, brand: p.brand, category: p.category, name: p.name, price: p.price ?? 0, old_price: p.oldPrice ?? null, homologation: p.homologation ?? "—",
  cc: p.cc ?? null, power: p.power ?? null, drive: p.drive ?? null, short: p.short ?? {}, description: p.description ?? {}, specs: p.specs ?? [], colors: p.colors ?? [],
  tags: p.tags ?? [], status: p.status ?? "draft", stock: p.stock ?? 0, sku: p.sku ?? null, images: p.images ?? [], videos: p.videos ?? [], featured: p.featured ?? false,
});

function supabaseRepo(): Repo {
  const sb = supabaseBrowser();
  const fail = (e: { message: string } | null) => { if (e) throw new Error(e.message); };
  return {
    mode: "supabase",
    orders: {
      async list() { const { data, error } = await sb.from("orders").select("*").order("created_at", { ascending: false }).limit(500); fail(error); return (data ?? []) as Order[]; },
      async get(id) { const { data } = await sb.from("orders").select("*").eq("id", id).maybeSingle(); return (data as Order) ?? null; },
      async update(id, patch) { const { error } = await sb.from("orders").update(patch).eq("id", id); fail(error); },
    },
    products: {
      async list() { const { data, error } = await sb.from("products").select("*").order("sort"); fail(error); return (data ?? []).map(rowToProduct); },
      async get(id) { const { data } = await sb.from("products").select("*").eq("id", id).maybeSingle(); return data ? rowToProduct(data) : null; },
      async save(p) {
        if (p.id) { const { error } = await sb.from("products").update(productToRow(p)).eq("id", p.id); fail(error); return p.id; }
        const { data, error } = await sb.from("products").insert(productToRow(p)).select("id").single(); fail(error); return data!.id as string;
      },
      async remove(id) { const { error } = await sb.from("products").delete().eq("id", id); fail(error); },
    },
    categories: {
      async list() { const { data } = await sb.from("categories").select("*").order("sort"); return (data ?? []) as CategoryRow[]; },
      async save(c) { const { error } = await sb.from("categories").upsert(c); fail(error); },
    },
    customers: { async list() { const { data } = await sb.from("customers").select("*").order("created_at", { ascending: false }); return (data ?? []) as Customer[]; } },
    discounts: {
      async list() { const { data } = await sb.from("discounts").select("*").order("created_at", { ascending: false }); return (data ?? []) as Discount[]; },
      async save(d) { const { error } = await sb.from("discounts").upsert(d); fail(error); },
      async remove(id) { const { error } = await sb.from("discounts").delete().eq("id", id); fail(error); },
    },
    pages: {
      async list() { const { data } = await sb.from("pages").select("*").order("slug"); return (data ?? []) as Page[]; },
      async get(slug) { const { data } = await sb.from("pages").select("*").eq("slug", slug).maybeSingle(); return (data as Page) ?? null; },
      async save(p) { const { error } = await sb.from("pages").upsert({ slug: p.slug, title: p.title, sections: p.sections, status: p.status, seo: p.seo }); fail(error); },
      async remove(slug) { const { error } = await sb.from("pages").delete().eq("slug", slug); fail(error); },
    },
    media: {
      async list() { const { data } = await sb.from("media").select("*").order("created_at", { ascending: false }); return (data ?? []) as MediaItem[]; },
      async upload(file, onProgress) {
        const kind = file.type.startsWith("video/") ? "video" : file.type.startsWith("image/") ? "image" : "file";
        const safe = file.name.normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-zA-Z0-9._-]+/g, "-").toLowerCase();
        const path = `${kind}s/${Date.now()}-${safe}`;
        onProgress?.(10);
        const { error } = await sb.storage.from("media").upload(path, file, { contentType: file.type, upsert: false });
        fail(error);
        onProgress?.(90);
        const url = sb.storage.from("media").getPublicUrl(path).data.publicUrl;
        const { data, error: e2 } = await sb.from("media").insert({ path, url, kind, mime: file.type, size: file.size, alt: {} }).select("*").single();
        fail(e2); onProgress?.(100);
        return data as MediaItem;
      },
      async remove(item) { await sb.storage.from("media").remove([item.path]); const { error } = await sb.from("media").delete().eq("id", item.id); fail(error); },
    },
    settings: {
      async get(key) { const { data } = await sb.from("settings").select("value").eq("key", key).maybeSingle(); return (data?.value as never) ?? null; },
      async set(key, value) { const { error } = await sb.from("settings").upsert({ key, value }); fail(error); },
    },
    shipping: {
      async list() { const { data } = await sb.from("shipping_methods").select("*").order("sort"); return (data ?? []) as ShippingMethod[]; },
      async save(m) { const { error } = await sb.from("shipping_methods").upsert(m); fail(error); },
      async remove(id) { const { error } = await sb.from("shipping_methods").delete().eq("id", id); fail(error); },
    },
    payments: {
      async list() { const { data } = await sb.from("payment_methods").select("*").order("sort"); return (data ?? []) as PaymentMethod[]; },
      async save(m) { const { error } = await sb.from("payment_methods").upsert(m); fail(error); },
    },
    team: { async list() { const { data } = await sb.from("profiles").select("*").order("created_at"); return (data ?? []) as Profile[]; } },
    async salesByDay(days) { const { data } = await sb.rpc("sales_by_day", { days }); return ((data ?? []) as SalesDay[]).map((d) => ({ ...d, revenue: Number(d.revenue), orders: Number(d.orders) })); },
  };
}

/* ───────────── Demo (localStorage) ───────────── */
const KEY = "md-admin-demo-v1";
type DemoState = { orders: Order[]; products: ShopProduct[]; categories: CategoryRow[]; customers: Customer[]; discounts: Discount[]; pages: Page[]; media: MediaItem[]; settings: Record<string, unknown>; shipping: ShippingMethod[]; payments: PaymentMethod[] };

function seedDemo(): DemoState {
  const now = Date.now();
  const iso = (d: number) => new Date(now - d).toISOString();
  const pick = (s: string) => localProducts.find((p) => p.slug === s)!;
  const mk = (n: number, daysAgo: number, items: [string, number][], status: Order["status"], pay: Order["payment_status"], provider: string, ship: string, carrier: string, name: string, email: string): Order => {
    const its = items.map(([s, q]) => ({ slug: s, name: pick(s).name, brand: pick(s).brand, price: pick(s).price, qty: q }));
    const subtotal = its.reduce((a, i) => a + i.price * i.qty, 0);
    const shipping = ship === "pickup" ? 0 : ship === "dealer_delivery" ? 2500 : 89;
    return { id: `demo-${n}`, number: 1000 + n, customer_email: email, customer_name: name, phone: "+420 777 000 00" + n, shipping_address: { street: "Hlavní 12", city: "Kutná Hora", zip: "284 01", country: "CZ" },
      items: its, subtotal, shipping_cost: shipping, discount_code: null, discount_amount: 0, total: subtotal + shipping, currency: "CZK", status, payment_provider: provider, payment_status: pay, payment_ref: null,
      shipping_method: ship, shipping_carrier: carrier, pickup_point: null, tracking_number: status === "fulfilled" ? "Z123456789" : null, label_url: null, notes: null,
      timeline: [{ at: iso(daysAgo * 864e5), text: "Objednávka vytvořena" }], locale: "cs", created_at: iso(daysAgo * 864e5), updated_at: iso(daysAgo * 864e5) };
  };
  const orders = [
    mk(1, 0, [["kentoya-v-cross-125-4t", 1], ["prilba-otevrena-s-plexi", 1]], "paid", "paid", "stripe", "pickup", "dealer", "Jana Novotná", "jana.novotna@example.cz"),
    mk(2, 1, [["navijak-3500-lb-synteticke-lano", 1]], "processing", "paid", "gopay", "packeta_point", "packeta", "Petr Svoboda", "petr.svoboda@example.cz"),
    mk(3, 2, [["cfmoto-gladiator-x520-g2", 1]], "pending", "unpaid", "bank_transfer", "dealer_delivery", "dealer", "Lesy Vysočina s.r.o.", "nakup@lesyvysocina.cz"),
    mk(4, 4, [["snehova-radlice-150-cm", 1], ["motorovy-olej-10w-40-4l", 2]], "fulfilled", "paid", "comgate", "ppl", "ppl", "Martin Dvořák", "martin.d@example.cz"),
    mk(5, 6, [["tumoto-xdv-300", 1]], "paid", "paid", "stripe", "pickup", "dealer", "Eva Králová", "eva.kralova@example.cz"),
    mk(6, 9, [["pneumatika-atv-25x8-12", 4]], "fulfilled", "paid", "paypal", "packeta_home", "packeta", "Tomáš Beneš", "tomas.benes@example.cz"),
    mk(7, 12, [["cfmoto-450-mt-r", 1]], "cancelled", "failed", "stripe", "pickup", "dealer", "Lukáš Horák", "lukas.horak@example.cz"),
    mk(8, 15, [["linhai-570-promax-4x4", 1], ["tazne-zarizeni-50-mm", 1]], "fulfilled", "paid", "bank_transfer", "dealer_delivery", "dealer", "Statek Hájek", "info@statekhajek.cz"),
    mk(9, 20, [["kentoya-phoenix-i-125-4t", 1]], "fulfilled", "paid", "gopay", "pickup", "dealer", "Karolína Marková", "k.markova@example.cz"),
    mk(10, 26, [["zadni-kufr-100-l", 1], ["plachta-na-skutr", 1]], "fulfilled", "paid", "comgate", "gls", "gls", "Ondřej Fiala", "ondrej.fiala@example.cz"),
  ];
  const customers: Customer[] = orders.map((o, i) => ({ id: `c${i}`, email: o.customer_email, name: o.customer_name, phone: o.phone, address: o.shipping_address, notes: null, marketing: i % 2 === 0, created_at: o.created_at }));
  return {
    orders,
    products: localProducts.map((p, i) => ({ ...p, id: `p${i}`, status: "active", stock: p.category === "prislusenstvi" ? 25 : 2, images: [], videos: [], description: { cs: "", en: "" }, featured: ["kentoya-v-cross-125-4t", "cfmoto-gladiator-x520-g2", "cfmoto-450-mt-r", "tgb-blade-600-ltx-max-eps-e5", "linhai-landforce-650l-eps", "cfmoto-gladiator-u6-ev", "tumoto-nexy-plus-125", "cfmoto-gladiator-x1000"].includes(p.slug) })),
    categories: localCategories.map((c, i) => ({ slug: c.slug, label: c.label, blurb: c.blurb, image_url: null, video_url: null, sort: i })),
    customers,
    discounts: [
      { id: "d1", code: "JARO10", type: "percent", value: 10, min_total: 1000, starts_at: null, ends_at: null, usage_limit: 100, used: 12, active: true },
      { id: "d2", code: "DOPRAVAZDARMA", type: "free_shipping", value: 0, min_total: 2000, starts_at: null, ends_at: null, usage_limit: null, used: 31, active: true },
    ],
    pages: [{ slug: "home", title: { cs: "Domů", en: "Home" }, sections: defaultHome, status: "published", seo: {}, updated_at: iso(0) }],
    media: [],
    settings: {
      store: { name: "Moto Dvořák", legal: "Dvořák a synové s.r.o.", address: "Nádraží 604, 582 82 Golčův Jeníkov", phone: "+420 603 235 182", email: "servis@elektrodvorak.cz", ico: "", dic: "", hours: { cs: "Pondělí až pátek 7:30 – 16:00", en: "Monday to Friday 7:30 – 16:00" }, currency: "CZK", locales: ["cs", "en"], defaultLocale: "cs" },
      theme: { accent: "#111111", signal: "#d0021b", font: "Inter" },
      announcement: { enabled: true, text: { cs: "Prodejna a servis Golčův Jeníkov · Po–Pá 7:30–16:00 · +420 603 235 182", en: "Showroom and service, Golčův Jeníkov · Mon–Fri 7:30–16:00 · +420 603 235 182" } },
      taxes: { vatRate: 21, pricesIncludeVat: true },
      notifications: { orderEmailTo: "servis@elektrodvorak.cz", customerConfirmation: true },
    },
    shipping: [
      { id: "pickup", carrier: "dealer", name: { cs: "Osobní odběr, Golčův Jeníkov", en: "Pick up in Golčův Jeníkov" }, description: { cs: "", en: "" }, price: 0, free_over: null, enabled: true, needs_pickup_point: false, vehicles: true, sort: 0 },
      { id: "dealer_delivery", carrier: "dealer", name: { cs: "Doprava vozidla na adresu", en: "Vehicle delivery" }, description: { cs: "", en: "" }, price: 2500, free_over: null, enabled: true, needs_pickup_point: false, vehicles: true, sort: 1 },
      { id: "packeta_point", carrier: "packeta", name: { cs: "Zásilkovna – výdejní místo", en: "Packeta pickup point" }, description: { cs: "", en: "" }, price: 89, free_over: 3000, enabled: true, needs_pickup_point: true, vehicles: false, sort: 2 },
      { id: "packeta_home", carrier: "packeta", name: { cs: "Zásilkovna – na adresu", en: "Packeta home" }, description: { cs: "", en: "" }, price: 129, free_over: 3000, enabled: true, needs_pickup_point: false, vehicles: false, sort: 3 },
      { id: "ppl", carrier: "ppl", name: { cs: "PPL", en: "PPL" }, description: { cs: "", en: "" }, price: 139, free_over: 5000, enabled: true, needs_pickup_point: false, vehicles: false, sort: 4 },
      { id: "dpd", carrier: "dpd", name: { cs: "DPD", en: "DPD" }, description: { cs: "", en: "" }, price: 139, free_over: 5000, enabled: false, needs_pickup_point: false, vehicles: false, sort: 5 },
      { id: "ceska_posta", carrier: "ceska_posta", name: { cs: "Česká pošta", en: "Czech Post" }, description: { cs: "", en: "" }, price: 119, free_over: 5000, enabled: true, needs_pickup_point: false, vehicles: false, sort: 6 },
      { id: "gls", carrier: "gls", name: { cs: "GLS", en: "GLS" }, description: { cs: "", en: "" }, price: 129, free_over: 5000, enabled: true, needs_pickup_point: false, vehicles: false, sort: 7 },
      { id: "fofr", carrier: "fofr", name: { cs: "FOFR – paleta", en: "FOFR pallet" }, description: { cs: "", en: "" }, price: 690, free_over: null, enabled: true, needs_pickup_point: false, vehicles: false, sort: 8 },
    ],
    payments: [
      { id: "stripe", name: { cs: "Platební karta (Stripe)", en: "Card (Stripe)" }, enabled: true, test_mode: true, config: {}, sort: 0 },
      { id: "gopay", name: { cs: "GoPay", en: "GoPay" }, enabled: true, test_mode: true, config: {}, sort: 1 },
      { id: "comgate", name: { cs: "Comgate", en: "Comgate" }, enabled: false, test_mode: true, config: {}, sort: 2 },
      { id: "paypal", name: { cs: "PayPal", en: "PayPal" }, enabled: true, test_mode: true, config: {}, sort: 3 },
      { id: "bank_transfer", name: { cs: "Bankovní převod", en: "Bank transfer" }, enabled: true, test_mode: false, config: {}, sort: 4 },
      { id: "cash", name: { cs: "Hotově při odběru", en: "Cash on collection" }, enabled: true, test_mode: false, config: {}, sort: 5 },
    ],
  };
}

function demoRepo(): Repo {
  const load = (): DemoState => { try { const r = localStorage.getItem(KEY); if (r) return JSON.parse(r); } catch {} const s = seedDemo(); save(s); return s; };
  const save = (s: DemoState) => { try { localStorage.setItem(KEY, JSON.stringify(s)); } catch {} };
  const mut = async (fn: (s: DemoState) => void) => { const s = load(); fn(s); save(s); };
  const uid = () => Math.random().toString(36).slice(2, 10);
  return {
    mode: "demo",
    orders: {
      async list() { return load().orders; },
      async get(id) { return load().orders.find((o) => o.id === id) ?? null; },
      async update(id, patch) { await mut((s) => { const o = s.orders.find((x) => x.id === id); if (o) Object.assign(o, patch, { updated_at: new Date().toISOString() }); }); },
    },
    products: {
      async list() { return load().products; },
      async get(id) { return load().products.find((p) => p.id === id) ?? null; },
      async save(p) { let id = p.id ?? `p-${uid()}`; await mut((s) => { const i = s.products.findIndex((x) => x.id === p.id); if (i >= 0) s.products[i] = { ...s.products[i], ...p } as ShopProduct; else s.products.unshift({ art: "gear", specs: [], colors: [], short: { cs: "", en: "" }, price: 0, homologation: "—", brand: "", category: "prislusenstvi", name: "", ...p, id } as ShopProduct); }); return id; },
      async remove(id) { await mut((s) => { s.products = s.products.filter((p) => p.id !== id); }); },
    },
    categories: { async list() { return load().categories; }, async save(c) { await mut((s) => { const i = s.categories.findIndex((x) => x.slug === c.slug); if (i >= 0) s.categories[i] = c; else s.categories.push(c); }); } },
    customers: { async list() { return load().customers; } },
    discounts: {
      async list() { return load().discounts; },
      async save(d) { await mut((s) => { const i = s.discounts.findIndex((x) => x.id === d.id); if (i >= 0) s.discounts[i] = { ...s.discounts[i], ...d } as Discount; else s.discounts.unshift({ id: uid(), used: 0, active: true, min_total: null, starts_at: null, ends_at: null, usage_limit: null, value: 0, type: "percent", code: "", ...d } as Discount); }); },
      async remove(id) { await mut((s) => { s.discounts = s.discounts.filter((d) => d.id !== id); }); },
    },
    pages: {
      async list() { return load().pages; },
      async get(slug) { return load().pages.find((p) => p.slug === slug) ?? null; },
      async save(p) { await mut((s) => { const i = s.pages.findIndex((x) => x.slug === p.slug); const row = { ...p, updated_at: new Date().toISOString() }; if (i >= 0) s.pages[i] = row; else s.pages.push(row); }); },
      async remove(slug) { await mut((s) => { s.pages = s.pages.filter((p) => p.slug !== slug); }); },
    },
    media: {
      async list() { return load().media; },
      async upload(file, onProgress) {
        onProgress?.(30);
        const url = await new Promise<string>((res) => { const r = new FileReader(); r.onload = () => res(String(r.result)); r.readAsDataURL(file); });
        const item: MediaItem = { id: uid(), path: file.name, url: file.size < 1_500_000 ? url : URL.createObjectURL(file), kind: file.type.startsWith("video/") ? "video" : "image", mime: file.type, size: file.size, alt: { cs: "", en: "" }, created_at: new Date().toISOString() };
        await mut((s) => { s.media.unshift(item); }); onProgress?.(100); return item;
      },
      async remove(item) { await mut((s) => { s.media = s.media.filter((m) => m.id !== item.id); }); },
    },
    settings: { async get(key) { return (load().settings[key] as never) ?? null; }, async set(key, value) { await mut((s) => { s.settings[key] = value; }); } },
    shipping: { async list() { return load().shipping; }, async save(m) { await mut((s) => { const i = s.shipping.findIndex((x) => x.id === m.id); if (i >= 0) s.shipping[i] = m; else s.shipping.push(m); }); }, async remove(id) { await mut((s) => { s.shipping = s.shipping.filter((m) => m.id !== id); }); } },
    payments: { async list() { return load().payments; }, async save(m) { await mut((s) => { const i = s.payments.findIndex((x) => x.id === m.id); if (i >= 0) s.payments[i] = m; }); } },
    team: { async list() { return [{ id: "u1", email: "servis@elektrodvorak.cz", full_name: "Moto Dvořák", role: "owner", created_at: new Date().toISOString() }]; } },
    async salesByDay(days) {
      const orders = load().orders;
      return Array.from({ length: days }, (_, i) => {
        const d = new Date(); d.setHours(0, 0, 0, 0); d.setDate(d.getDate() - (days - 1 - i));
        const day = d.toISOString().slice(0, 10);
        const os = orders.filter((o) => o.created_at.slice(0, 10) === day && o.status !== "cancelled");
        return { day, orders: os.length, revenue: os.filter((o) => o.payment_status === "paid").reduce((s, o) => s + o.total, 0) };
      });
    },
  };
}

let cached: Repo | null = null;
export function repo(): Repo { if (!cached) cached = supabaseConfigured ? supabaseRepo() : demoRepo(); return cached; }
export function resetDemo() { try { localStorage.removeItem(KEY); } catch {} cached = null; }
