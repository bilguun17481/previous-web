import { NextResponse } from "next/server";
import { publicEnv } from "@/lib/env";

/** Public diagnostics: which settings are present and whether Supabase answers. Never returns key values. */
export async function GET(req: Request) {
  const productSlug = new URL(req.url).searchParams.get("product");
  const url = publicEnv("NEXT_PUBLIC_SUPABASE_URL");
  const anon = publicEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY");
  const service = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";
  const stripeKey = (k?: string) => { const v = (k ?? "").trim(); return !v ? "missing" : /^sk_test_|^rk_test_/.test(v) ? "test" : /^sk_live_|^rk_live_/.test(v) ? "live" : v.startsWith("pk_") ? "wrong: that is the publishable key, the secret key starts with sk_" : "unrecognised"; };
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
    const site = (publicEnv("NEXT_PUBLIC_SITE_URL") || new URL(req.url).origin).replace(/\/$/, "");
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
  // ?page=<slug>: check every picture and video a builder page points at.
  const pageSlug = new URL(req.url).searchParams.get("page");
  let page: unknown = undefined;
  if (pageSlug && url && anon) {
    const r = await fetch(`${url.replace(/\/$/, "")}/rest/v1/pages?select=slug,status,sections&slug=eq.${encodeURIComponent(pageSlug)}`, { headers: { apikey: anon, Authorization: `Bearer ${anon}` }, cache: "no-store" });
    const rows = (await r.json()) as { slug: string; status: string; sections: Record<string, unknown>[] }[];
    if (!rows[0]) page = "not found (or not published)";
    else {
      const media: Record<string, unknown>[] = [];
      for (const sec of rows[0].sections) {
        for (const key of ["media", "video"]) {
          const m = sec[key] as { kind?: string; url?: string } | undefined;
          if (!m?.url) { if (m) media.push({ section: sec.id, type: sec.type, field: key, url: "(empty)" }); continue; }
          const head = await fetch(m.url, { method: "HEAD", cache: "no-store", signal: AbortSignal.timeout(8000) }).catch((e: Error) => ({ status: 0, headers: new Headers(), error: e.message }));
          media.push({ section: sec.id, type: sec.type, field: key, kind: m.kind, url: m.url, status: head.status, contentType: head.headers.get("content-type"), ...("error" in head ? { error: head.error } : {}), problem: head.status !== 200 ? "file does not answer: re-pick the picture in the page editor" : !/^image\/(jpeg|png|webp|gif|avif|svg)/.test(head.headers.get("content-type") ?? "") && m.kind === "image" ? "not a browser-displayable image type (HEIC/TIFF?): convert to JPEG and upload again" : "ok" });
        }
      }
      page = { slug: rows[0].slug, status: rows[0].status, sections: rows[0].sections.length, media };
    }
  }
  // What the browser receives: the root layout injects window.__ENV__ into every page from the runtime environment.
  let browser: Record<string, unknown> = {};
  try {
    const site = (publicEnv("NEXT_PUBLIC_SITE_URL") || new URL(req.url).origin).replace(/\/$/, "");
    const r = await fetch(`${site}/`, { cache: "no-store", headers: { "user-agent": "health-check" }, signal: AbortSignal.timeout(8000) });
    const m = (await r.text()).match(/window\.__ENV__=(\{.*?\})<\/script>/);
    const env = m ? (JSON.parse(m[1]) as { url?: string; anonKey?: string; siteUrl?: string }) : null;
    if (!env) { browser = { status: r.status, problem: "window.__ENV__ not found in the page HTML" }; problems.push("The page does not carry the runtime settings for the browser"); }
    else {
      const bUrl = (env.url ?? "").trim();
      browser = { url: bUrl ? bUrl.replace(/[a-z0-9]/gi, (c, i) => (i < 12 ? c : "•")) : "missing", anonKey: shape(env.anonKey ?? ""), siteUrl: env.siteUrl || "missing", matchesServer: bUrl === url.trim() && (env.anonKey ?? "").trim() === anon.trim() };
      if (bUrl && !/^https:\/\/[a-z0-9-]+\.supabase\.co\/?$/.test(bUrl)) problems.push("The Supabase URL handed to the browser is malformed: fix NEXT_PUBLIC_SUPABASE_URL in the runtime variables and redeploy");
    }
  } catch (e) { browser = { error: (e as Error).message }; }
  return NextResponse.json({
    ok: problems.length === 0,
    ...(product !== undefined ? { product } : {}),
    ...(page !== undefined ? { page } : {}),
    problems,
    env: { url: url ? url.replace(/[a-z0-9]/gi, (c, i) => (i < 12 ? c : "•")) : "missing", anonKey: shape(anon), serviceKey: shape(service), siteUrl: publicEnv("NEXT_PUBLIC_SITE_URL") || "missing" },
    stripe: { secretKey: stripeKey(process.env.STRIPE_SECRET_KEY), webhookSecret: (process.env.STRIPE_WEBHOOK_SECRET ?? "").trim().startsWith("whsec_") ? "set" : (process.env.STRIPE_WEBHOOK_SECRET ?? "").trim() ? "unrecognised" : "missing", webhookUrl: `${(publicEnv("NEXT_PUBLIC_SITE_URL") || new URL(req.url).origin).replace(/\/$/, "")}/api/webhooks/stripe/` },
    browser,
    supabase: { auth, database: db },
  });
}
