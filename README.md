# Moto Dvořák · e-shop design mockup

Static design mockup of an e-commerce storefront for **Moto Dvořák** (Golčův Jeníkov; ATVs, UTVs, motorcycles, scooters, accessories, service), styled after the look and feel of SIGMA Imaging Nordic's site: photography-led full-bleed heroes and campaign banners with text overlays, a white header with spaced uppercase navigation, product cards on white with a buy button, hairline dividers, a light grey brand band, and a charcoal footer with newsletter and social links.

## Run

```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # static export to ./out
```

Next.js 16 (App Router, static export), Tailwind CSS 4, TypeScript. No backend; the cart and checkout show a fixed sample state.

## Live site

Every push to `main` or `claude/ecommerce-website-design-bv748b` runs `.github/workflows/pages.yml`, which builds the static export with `NEXT_PUBLIC_BASE_PATH=/previous-web` and publishes it to the `gh-pages` branch. GitHub Pages serves that branch at:

https://bilguun17481.github.io/previous-web/

If the page shows a 404 after a green workflow run, open the repository's **Settings → Pages** and set the source to *Deploy from a branch*, branch `gh-pages`, folder `/ (root)`. That is a one-time step.

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

## Product images

`src/components/Photo.tsx` renders the real photograph when one exists and a studio-backdrop placeholder otherwise. Images are looked up by catalog slug in `src/data/images.json`, which maps to files in `public/products/`.

To pull the pictures from motodvorak.cz (needs network access to that site, which the hosted build environment does not have):

```bash
npm run fetch-images -- --dry-run   # show which page each product matched
npm run fetch-images                # download into public/products and write images.json
```

The script crawls the site, matches page titles to catalog names, and takes each page's main image. Products it cannot match are listed in the report; add them to `OVERRIDES` in `scripts/fetch-images.mjs` as slug → page path and rerun. Commit `public/products/` and `src/data/images.json` together.
