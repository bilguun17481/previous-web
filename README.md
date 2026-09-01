# Moto Dvořák · e-shop design mockup

Static design mockup of an e-commerce storefront for **Moto Dvořák** (Golčův Jeníkov; ATVs, UTVs, motorcycles, scooters, accessories, service), styled after the look and feel of SIGMA Imaging Nordic's site: photography-led full-bleed heroes and campaign banners with text overlays, a white header with spaced uppercase navigation, product cards on white with a buy button, hairline dividers, a light grey brand band, and a charcoal footer with newsletter and social links.

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

Product photography is stood in for by `src/components/Photo.tsx`, a studio-backdrop placeholder sized like the final image. Replace it with an `<img>` (or `next/image`) at each call site once photos are available; the surrounding layout does not change.
