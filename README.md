# Moto Dvořák · e-shop design mockup

Static design mockup of an e-commerce storefront for **Moto Dvořák** (Golčův Jeníkov; ATVs, UTVs, motorcycles, scooters, accessories, service), built in the visual language of SIGMA Imaging Nordic's site: white ground, monochrome type, hairline grids, product tiles on a light grey field, and a small square "line mark" on every product. Here that mark carries the vehicle's homologation class (T3b / L7e / L3e / L1e), which tells a Czech buyer what licence and plate the machine needs.

## Run

```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # static export to ./out
```

Next.js 16 (App Router, static export), Tailwind CSS 4, TypeScript. No backend; the cart and checkout show a fixed sample state.

## Pages

| Route | What it is |
| --- | --- |
| `/` | Hero (V-Cross 125), category tiles, featured models, homologation explainer, brands, service |
| `/ctyrkolky/`, `/utv/`, `/motocykly/`, `/skutry/`, `/prislusenstvi/` | Category listings with brand and homologation filters |
| `/produkt/<slug>/` | Product detail: art, colours, price, specs table, related models |
| `/kosik/`, `/pokladna/` | Cart and checkout mockups |
| `/servis/`, `/kontakt/` | Service offer and contact details |

Language toggle (CZ / EN) sits in the header; all UI copy and product descriptions live in `src/lib/i18n.tsx` and `src/data/catalog.ts`.

## Catalog data

`src/data/catalog.ts` holds 56 products across CFMOTO, Linhai, TGB, Kentoya and TUMOTO. The live motodvorak.cz site could not be fetched from the build environment, so the range was **reconstructed** from search-index snippets of motodvorak.cz product pages plus each importer's current Czech line-up and price lists. Prices are in Kč incl. VAT and should be checked against the shop's own list before going live. Editing that one file updates every page.

Product photography is replaced by inline SVG line drawings (`src/components/Art.tsx`), one per vehicle type. Swap in real photos by rendering an `<img>` inside the `.tile-art` container in `ProductCard.tsx` and `ProductView.tsx`.
