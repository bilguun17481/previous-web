#!/usr/bin/env node
/**
 * Crawl motodvorak.cz, download each product page's main image into
 * public/products/<catalog-slug>.<ext>, and write src/data/images.json
 * (catalog slug -> public path). Matching is by normalised product name;
 * add manual pairs to OVERRIDES when a page title differs from the catalog.
 *
 *   node scripts/fetch-images.mjs            # crawl + download + write manifest
 *   node scripts/fetch-images.mjs --dry-run  # only print the match report
 *
 * Needs Node 18+ and network access to motodvorak.cz and its image CDN.
 */
import { mkdir, writeFile } from "node:fs/promises";
import { createRequire } from "node:module";
import path from "node:path";

const ROOT = "https://www.motodvorak.cz";
const OUT_DIR = "public/products";
const MANIFEST = "src/data/images.json";
const DRY = process.argv.includes("--dry-run");

/** Catalog slug -> exact motodvorak.cz path, when name matching is not enough. */
const OVERRIDES = {
  "kentoya-raptor-125-4t": "/raptor-125-4t/",
  "kentoya-v-cross-125-4t": "/v-cross-125-4t/",
  "cfmoto-700-mt-adventure": "/700-mt-adventure/",
  "cfmoto-300cl-x": "/300cl-x/",
};

const require = createRequire(import.meta.url);
const catalog = await loadCatalog();

const UA = { "user-agent": "Mozilla/5.0 (compatible; motodvorak-mockup-fetch/1.0)" };
const html = async (url) => {
  const r = await fetch(url, { headers: UA });
  if (!r.ok) throw new Error(`${r.status} ${url}`);
  return r.text();
};

// 1. Crawl internal pages (breadth-first, same host, no query strings).
const seen = new Set([ROOT + "/"]);
const queue = [ROOT + "/"];
const pages = [];
while (queue.length) {
  const url = queue.shift();
  let body;
  try { body = await html(url); } catch (e) { console.warn("skip", url, e.message); continue; }
  pages.push({ url, body });
  for (const m of body.matchAll(/href="(\/[^"#?]*\/)"/g)) {
    const next = ROOT + m[1];
    if (!seen.has(next)) { seen.add(next); queue.push(next); }
  }
  for (const m of body.matchAll(new RegExp(`href="(${ROOT}/[^"#?]*/)"`, "g"))) {
    if (!seen.has(m[1])) { seen.add(m[1]); queue.push(m[1]); }
  }
}
console.log(`crawled ${pages.length} pages`);

// 2. For each page: title + best image candidate.
const candidates = pages.map(({ url, body }) => {
  const title = (body.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i)?.[1] ?? body.match(/<title>([^<]*)<\/title>/i)?.[1] ?? "")
    .replace(/<[^>]+>/g, "").replace(/\s*::.*$/, "").trim();
  const og = body.match(/property="og:image"\s+content="([^"]+)"/i)?.[1];
  const imgs = [...body.matchAll(/<img[^>]+src="([^"]+)"/gi)].map((m) => m[1])
    .filter((s) => /\.(png|jpe?g|webp)(\?|$)/i.test(s) && !/logo|icon|flag|banner|bg_|pattern/i.test(s));
  const image = og ?? imgs[0];
  return { url, title, image: image ? new URL(image, url).href : undefined };
}).filter((c) => c.title && c.image);

// 3. Match catalog products to pages.
const norm = (s) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
const tokens = (s) => new Set(norm(s).split(" ").filter(Boolean));
const score = (a, b) => { const ta = tokens(a), tb = tokens(b); let n = 0; for (const t of ta) if (tb.has(t)) n++; return n / Math.max(ta.size, 1); };

const manifest = {};
const report = [];
for (const p of catalog) {
  let page = OVERRIDES[p.slug] ? candidates.find((c) => c.url === ROOT + OVERRIDES[p.slug]) : undefined;
  if (!page) {
    const ranked = candidates.map((c) => ({ c, s: Math.max(score(p.name, c.title), score(`${p.brand} ${p.name}`, c.title)) }))
      .sort((x, y) => y.s - x.s);
    if (ranked[0] && ranked[0].s >= 0.6) page = ranked[0].c;
  }
  if (!page) { report.push(`  ✗ ${p.slug}  (no page matched "${p.name}")`); continue; }
  const ext = (page.image.match(/\.(png|jpe?g|webp)/i)?.[1] ?? "jpg").toLowerCase().replace("jpeg", "jpg");
  const file = `${p.slug}.${ext}`;
  report.push(`  ✓ ${p.slug}  ←  ${page.url}  (${page.title})`);
  manifest[p.slug] = `/products/${file}`;
  if (!DRY) {
    const r = await fetch(page.image, { headers: UA });
    if (!r.ok) { report.push(`    ! image ${r.status} ${page.image}`); delete manifest[p.slug]; continue; }
    await mkdir(OUT_DIR, { recursive: true });
    await writeFile(path.join(OUT_DIR, file), Buffer.from(await r.arrayBuffer()));
  }
}
console.log(report.join("\n"));
console.log(`\nmatched ${Object.keys(manifest).length} / ${catalog.length}`);
if (!DRY) {
  await writeFile(MANIFEST, JSON.stringify(manifest, null, 2) + "\n");
  console.log(`wrote ${MANIFEST}`);
}

async function loadCatalog() {
  // Read the TS source without a compiler: pull slug / brand / name triples.
  const { readFile } = await import("node:fs/promises");
  const src = await readFile("src/data/catalog.ts", "utf8");
  return [...src.matchAll(/slug:\s*"([^"]+)",\s*brand:\s*"([^"]+)",\s*category:\s*"[^"]+",\s*name:\s*"([^"]+)"/g)]
    .map((m) => ({ slug: m[1], brand: m[2], name: m[3] }));
}
