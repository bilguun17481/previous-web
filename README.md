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

## Sandbox (staged changes)

Admin → Sandbox. A sandbox is a named bundle of changes to products, pages and settings. Create one and click "Pracovat v něm": from then on every save in the admin is staged into the sandbox instead of going live, and the admin shows the staged versions (products carry an "in sandbox" badge). "Náhled na webu" opens the storefront with the staged changes applied, visible only to signed-in staff (an `md-sandbox` cookie; the data is read as the viewer, so RLS keeps it staff-only). "Publikovat vše" applies everything to the live data at once; "Zahodit" drops it. The bulk price tool on the product list (select rows → "Změnit ceny…") is the typical way to prepare a price change: percent or amount, rounding to …990, and the old price shown struck through.

Tables: `changesets`, `changeset_items` (migration `0003_sandbox.sql`). Code: `src/lib/admin/sandbox.ts` (active sandbox state), the `withSandbox` wrapper in `src/lib/admin/repo.ts`, and the overlay in `src/lib/data.ts`.

## Page builder

Admin → Obsah → Stránky. The editor shows a live preview (an iframe at desktop or phone width, so breakpoints behave like the real site), a section list on the left (drag to reorder, hide, duplicate) and an inspector on the right with three tabs: Obsah (texts, media, links), Vzhled (height, alignment, free text placement over hero and banner photos by dragging in the preview, overlay, background and text colours, padding, columns, button style) and Písmo (font, size, weight, colour, spacing, uppercase, shadow for every text element; fonts load from Google Fonts on demand, see `src/lib/fonts.ts`). Undo/redo with Ctrl+Z / Ctrl+Shift+Z, save with Ctrl+S. Sections render through `src/components/Sections.tsx`; the preview frame is `src/app/admin/preview/`.

## Carriers

`src/lib/shipping/catalog.ts` lists every carrier the shop can offer (Zásilkovna, Česká pošta, Balíkovna, PPL, DPD, GLS, One by Allegro, AlzaBox, DoDo, Liftago, Messenger, Toptrans, FOFR, Geis, Raben, Dachser, Gebrüder Weiss, DB Schenker, Packeta SK, Slovenská pošta, SPS, 123Kuriér, DHL Express, UPS, FedEx, InPost, Magyar Posta, Pošta bez hranic). The registry in `src/lib/shipping/index.ts` connects each one by the best route available at runtime: its own API (Packeta, PPL, GLS verified; Česká pošta, DPD, One by Allegro written from public docs and marked unverified), then Balíkobot (`BALIKOBOT_API_USER` + `BALIKOBOT_API_KEY` give every catalogue carrier a label route), then Zásilkovna's external carriers, and finally manual entry with a tracking link. Admin → Nastavení → Doprava shows the overview with the route in use and the variables each direct connection needs, and adds a shipping method for any carrier in one click. Pickup-point maps in the checkout (`src/components/PickupPicker.tsx`): Zásilkovna's widget (needs `NEXT_PUBLIC_PACKETA_API_KEY`), PPL's ParcelShop map, GLS's delivery point map and Česká pošta's Balíkovna / post-office picker need no keys; other carriers take a typed point name or number.

## Stripe

Card payments use Stripe Checkout (Stripe's hosted payment page). The shop creates a Checkout Session for the order, sends the customer to Stripe, and marks the order paid when Stripe's webhook arrives.

1. Stripe dashboard → Developers → API keys: copy the **Secret key** (`sk_test_…` while testing, `sk_live_…` for real payments).
2. Developers → Webhooks → Add destination → endpoint URL `https://<your-site>/api/webhooks/stripe/` **with the trailing slash** (without it the request is redirected and Stripe treats the redirect as a failure). Subscribe to `checkout.session.completed`, `checkout.session.async_payment_succeeded`, `checkout.session.async_payment_failed`, `checkout.session.expired`, `charge.refunded`, `payment_intent.succeeded` and `payment_intent.payment_failed` (the last two carry Apple Pay / Google Pay / Link paid on the shop's own checkout through the Express Checkout element, which needs `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` and, for Apple Pay, the domain registered under Stripe → Settings → Payment methods → Apple Pay). Copy the **Signing secret** (`whsec_…`).
3. Host → runtime variables (Cloudflare: Settings → Variables and Secrets, type Secret): `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`. The webhook also needs `SUPABASE_SERVICE_ROLE_KEY` to update the order.
4. Admin → Settings → Payments: switch "Platební karta (Stripe)" on. Test mode in the admin is informational; which mode Stripe runs in follows the key you set.
5. `/api/health/` shows whether the secret key is test or live, whether the webhook secret is set, and the exact webhook URL. In Stripe's test mode pay with card `4242 4242 4242 4242`, any future expiry and any CVC; Stripe → Developers → Webhooks → your endpoint shows every delivery and the response the shop returned.

## Hosting on Cloudflare Workers

The app also builds for Cloudflare Workers through OpenNext (`open-next.config.ts`, `wrangler.jsonc`). Storefront pages render fresh on every request there, so admin edits show without a redeploy.

```bash
npm run cf:build      # builds .open-next/
npm run cf:preview    # runs the worker locally with wrangler
```

On Cloudflare: Workers & Pages → Create → Workers → Import a repository → pick this repo and branch. Build command `npm run cf:build`, deploy command `npx wrangler deploy`. Add the variables from `.env.example` under Settings → Variables and Secrets (runtime). The runtime values are the source of truth: the server reads them on every request and hands the public ones to the browser through `window.__ENV__`, so build-time variables are optional and a wrong build-time value cannot break the site. Then set `NEXT_PUBLIC_SITE_URL` and the Supabase Auth Site URL to the worker's address. `/api/health/` reports what the server and the browser are using and whether they match.

## Static mirror on GitHub Pages

Every push runs `.github/workflows/pages.yml`, which strips the server-only parts (`src/app/api`, `src/app/admin`, `src/app/objednavka`, `src/proxy.ts`), builds with `STATIC_EXPORT=1` and a `/previous-web` base path, and publishes to the `gh-pages` branch:

https://bilguun17481.github.io/previous-web/

If that shows a 404 after a green run, set Settings → Pages → Source to *Deploy from a branch*, branch `gh-pages`, folder `/ (root)`.

## Catalog data

`src/data/catalog.ts` holds the 56 reconstructed products and seeds the database; once Supabase is connected the admin is the source of truth. Prices should be checked against the shop's own list.

## Product images from motodvorak.cz

`npm run fetch-images` crawls motodvorak.cz, matches page titles to catalog products and downloads each main image into `public/products/`, writing `src/data/images.json`. Products with database images use those first. See `scripts/fetch-images.mjs` for the override map.
