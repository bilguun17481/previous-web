import { NextResponse } from "next/server";

/** Public diagnostics: which settings are present and whether Supabase answers. Never returns key values. */
export async function GET() {
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
  return NextResponse.json({
    ok: problems.length === 0,
    problems,
    env: { url: url ? url.replace(/[a-z0-9]/gi, (c, i) => (i < 12 ? c : "•")) : "missing", anonKey: shape(anon), serviceKey: shape(service), siteUrl: process.env.NEXT_PUBLIC_SITE_URL ?? "missing" },
    supabase: { auth, database: db },
  });
}
