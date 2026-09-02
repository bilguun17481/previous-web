# Moto Dvořák · e-shop design mockup

Static design mockup of an e-commerce storefront for **Moto Dvořák** (Golčův Jeníkov; ATVs, UTVs, motorcycles, scooters, accessories, service), styled after the look and feel of SIGMA Imaging Nordic's site: photography-led full-bleed heroes and campaign banners with text overlays, a white header with spaced uppercase navigation, product cards on white with a buy button, hairline dividers, a light grey brand band, and a charcoal footer with newsletter and social links.

## Architecture

| Layer | What | Where |
| --- | --- | --- |
| Storefront | Next.js 16 App Router, Tailwind 4, CZ/EN toggle, cart, checkout | `src/app`, `src/components` |
| Admin | Shopify-style back office at `/admin` | `src/app/admin`, `src/components/admin` |
| Database, auth, storage | Supabase (Postgres with row-level security, email login, `media` bucket for photos and video) | `supabase/migrations`, `supabase/seed.sql` |
| Payments | Stripe, GoPay, Comgate, PayPal, bank transfer, cash, behind one adapter interface | `src/lib/payments` |
| Delivery | Zásilkovna/Packeta, PPL, GLS (label API), DPD, Česká pošta, FOFR (manual entry + tracking links), dealer delivery | `src/lib/shipping` |
| Email | Order confirmations and status updates through Resend | `src/lib/notify.ts` |
| Hosting | Netlify runs the full app; GitHub Pages serves a static storefront mirror | `netlify.toml`, `.github/workflows/pages.yml` |

Without Supabase environment variables the storefront serves the bundled catalog and the admin runs in **demo mode** (sample orders and products kept in the browser), so everything can be explored before any account exists.

## Admin features

Dashboard with revenue, orders, average order and a setup checklist · Orders with filters, CSV export, status changes, carrier label creation, tracking, customer notifications and packing slip · Products with photo upload and reordering, MP4 upload or YouTube/Vimeo links, specs, colours, tags, stock, SEO, bulk actions · Customers · Discount codes (percent, fixed, free shipping, limits, dates) · Landing page builder with hero, category tiles, product rows, campaign banners, video, brands, image+text, rich text and news sections, all with image or video backgrounds · Media library · Category headers · Analytics (90 days, top products, category, payment and shipping mix) · Settings for store info, announcement bar, payments, shipping methods, taxes, notifications, theme colours, team invites, connections and domains.

## Run locally

```bash
npm install
cp .env.example .env.local   # optional: fill in Supabase keys
npm run dev                  # http://localhost:3000, admin at /admin
npm run build && npm start
```

## Go live (Supabase + Netlify)

1. Create a project at supabase.com. In the SQL editor run `supabase/migrations/0001_init.sql`, then `supabase/seed.sql`.
2. On Netlify, import this repository. Add the variables from `.env.example` under Site configuration → Environment variables (at minimum the three Supabase values and `NEXT_PUBLIC_SITE_URL`).
3. Deploy. Open `/admin/login`, choose "Create the owner account" and sign up; the first account becomes the owner.
4. Add gateway and carrier keys when you have them. Each gateway's webhook URL is shown under Settings → Payments.

Gateways and carriers marked "manual" in Settings → Shipping have no public API without a contract; orders still record their tracking numbers and link to tracking pages.

## Static mirror on GitHub Pages

Every push runs `.github/workflows/pages.yml`, which strips the server-only parts (`src/app/api`, `src/app/admin`, `src/app/objednavka`, `src/proxy.ts`), builds with `STATIC_EXPORT=1` and a `/previous-web` base path, and publishes to the `gh-pages` branch:

https://bilguun17481.github.io/previous-web/

If that shows a 404 after a green run, set Settings → Pages → Source to *Deploy from a branch*, branch `gh-pages`, folder `/ (root)`.

## Catalog data

`src/data/catalog.ts` holds the 56 reconstructed products and seeds the database; once Supabase is connected the admin is the source of truth. Prices should be checked against the shop's own list.

## Product images from motodvorak.cz

`npm run fetch-images` crawls motodvorak.cz, matches page titles to catalog products and downloads each main image into `public/products/`, writing `src/data/images.json`. Products with database images use those first. See `scripts/fetch-images.mjs` for the override map.
