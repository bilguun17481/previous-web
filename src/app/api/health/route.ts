import { NextResponse } from "next/server";

/** Public diagnostics: which settings are present and whether Supabase answers. Never returns key values. */
export async function GET(req: Request) {
  const productSlug = new URL(req.url).searchParams.get("product");
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";
  const service = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";
  const shape = (k: string) => (!k ? "missing" : k.startsWith("sb_publishable_") ? "publishable" : k.startsWith("sb_secret_") ? "secret" : k.startsWith("eyJ") ? "legacy-jwt" : "unrecognised");
  const problems: string[] = [];
  if (!url) problems.push("NEXT_PUBLIC_SUPABASE_URL is missing");
  else if (!/^https:\/\/[a-z0-9-]+\.supabase\.co\/?$/.test(url.trim())) problems.push(`NEXT_PUBLIC_SUPABASE_URL should look like https://xxxx.supabase.co, got "${url.replace(/[a-z0-9]/gi, (c, i) => (i < 12 ? c : "•"))}"`);
  if (url !== url.trim() || anon !== anon.trim() || service !== service.trim()) problems.push("A value has leading or trailing whitespace");
  if (!anon) problems.push("NEXT_PUBLIC_SUPABASE_ANON_KEY is missing");
  if (!service) problems.push("SUPABASE_SERVICE_ROLE_KEY is missing");

  let auth: string = "not tested";
  let db: string = "not tested";
  if (url && anon) {
    try {
      const r = await fetch(`${url.replace(/\/$/, "")}/auth/v1/health`, { headers: { apikey: anon }, signal: AbortSignal.timeout(8000) });
      auth = `${r.status} ${r.ok ? "ok" : await r.text().then((t) => t.slice(0, 120))}`;
      if (!r.ok) problems.push(`Supabase auth answered ${r.status}: check the URL and the publishable/anon key`);
    } catch (e) { auth = `unreachable: ${(e as Error).message}`; problems.push("Supabase URL is unreachable from the server: wrong URL or paused project"); }
    try {
      const r = await fetch(`${url.replace(/\/$/, "")}/rest/v1/products?select=slug&limit=1`, { headers: { apikey: anon, Authorization: `Bearer ${anon}` }, signal: AbortSignal.timeout(8000) });
      const body = await r.text();
      db = `${r.status} ${r.ok ? (body.includes("slug") ? "ok, products present" : "ok, but no products (run seed.sql)") : body.slice(0, 120)}`;
      if (r.status === 404 || /relation .* does not exist/.test(body)) problems.push("products table missing: run supabase/migrations/0001_init.sql");
    } catch (e) { db = `unreachable: ${(e as Error).message}`; }
  }
  let product: unknown = undefined;
  if (productSlug && url && anon) {
    const r = await fetch(`${url.replace(/\/$/, "")}/rest/v1/products?select=slug,status,images,updated_at&slug=eq.${encodeURIComponent(productSlug)}`, { headers: { apikey: anon, Authorization: `Bearer ${anon}` }, cache: "no-store" });
    const rows = (await r.json()) as { slug: string; status: string; images: { url: string }[]; updated_at: string }[];
    product = rows[0] ? { slug: rows[0].slug, status: rows[0].status, imageCount: rows[0].images?.length ?? 0, firstImage: rows[0].images?.[0]?.url ?? null, updated_at: rows[0].updated_at } : "not found";
    // Fetch the public product page as a visitor would and see whether the first photo is in the HTML.
    const site = (process.env.NEXT_PUBLIC_SITE_URL ?? new URL(req.url).origin).replace(/\/$/, "");
    const first = rows[0]?.images?.[0]?.url;
    if (first) {
      try {
        const pr = await fetch(`${site}/produkt/${productSlug}/`, { cache: "no-store", headers: { "user-agent": "health-check" } });
        const html = await pr.text();
        (product as Record<string, unknown>).page = { status: pr.status, cacheStatus: pr.headers.get("cache-status") ?? pr.headers.get("x-nextjs-cache") ?? pr.headers.get("netlify-cdn-cache-control") ?? null, age: pr.headers.get("age"), containsFirstImage: html.includes(first), containsAnyStorageImage: html.includes("/storage/v1/object/public/media/") };
        const img = await fetch(first, { method: "HEAD", cache: "no-store" }).catch(() => null);
        (product as Record<string, unknown>).firstImageReachable = img ? `${img.status} ${img.headers.get("content-type") ?? ""}` : "unreachable";
      } catch (e) { (product as Record<string, unknown>).page = `error: ${(e as Error).message}`; }
    }
  }
  return NextResponse.json({
    ok: problems.length === 0,
    ...(product !== undefined ? { product } : {}),
    problems,
    env: { url: url ? url.replace(/[a-z0-9]/gi, (c, i) => (i < 12 ? c : "•")) : "missing", anonKey: shape(anon), serviceKey: shape(service), siteUrl: process.env.NEXT_PUBLIC_SITE_URL ?? "missing" },
    supabase: { auth, database: db },
  });
}
