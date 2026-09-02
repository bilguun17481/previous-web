import type { Section } from "@/lib/types";
/** Home layout used when no published `home` page exists in the database. Mirrors supabase/seed.sql. */
export const defaultHome: Section[] = [
  { id: "hero", type: "hero", media: { kind: "image", url: "" }, eyebrow: { cs: "Novinka 2026 · Kentoya", en: "New for 2026 · Kentoya" }, title: { cs: "V-Cross 125", en: "V-Cross 125" }, text: { cs: "14 koní, ABS a ASR, osmipalcový displej. Nejlépe vybavená stodvacetpětka, jakou Kentoya kdy postavila.", en: "14 hp, ABS and ASR, an eight-inch display. The best-equipped 125 Kentoya has ever built." }, cta: { label: { cs: "Prohlédnout", en: "View model" }, href: "/produkt/kentoya-v-cross-125-4t/" }, productSlug: "kentoya-v-cross-125-4t", align: "left", height: "large", overlay: 60 },
  { id: "cats", type: "categories", eyebrow: { cs: "Sortiment", en: "Range" }, title: { cs: "Čtyři řady, jedna dílna.", en: "Four lines, one workshop." }, text: { cs: "Všechno, co prodáme, také servisujeme.", en: "Everything we sell, we also service." }, categories: ["ctyrkolky", "utv", "motocykly", "skutry"] },
  { id: "featured", type: "products", eyebrow: { cs: "Vybrané modely", en: "Featured models" }, title: { cs: "Právě skladem", en: "In stock now" }, source: "featured", limit: 8 },
  { id: "campaign", type: "banner", media: { kind: "image", url: "" }, eyebrow: { cs: "Pracovní čtyřkolky", en: "Utility ATVs" }, title: { cs: "Postavené pro les, pole a zimu.", en: "Built for forest, field and winter." }, text: { cs: "CFMOTO, Linhai a TGB s traktorovou homologací T3b.", en: "CFMOTO, Linhai and TGB with T3b tractor homologation." }, cta: { label: { cs: "Zobrazit čtyřkolky", en: "See ATVs" }, href: "/ctyrkolky/" } },
  { id: "news", type: "news", limit: 3 },
  { id: "brands", type: "brands", eyebrow: { cs: "Značky", en: "Brands" }, title: { cs: "Autorizovaný prodej a servis", en: "Authorised sales and service" } },
  { id: "service", type: "split", media: { kind: "image", url: "" }, eyebrow: { cs: "Servis", en: "Service" }, title: { cs: "Servis, který zná váš stroj.", en: "Service that knows your machine." }, text: { cs: "Záruční i pozáruční servis čtyřkolek, skútrů a zahradní techniky.", en: "Warranty and post-warranty service for ATVs, scooters and garden machinery." }, cta: { label: { cs: "Objednat servis", en: "Book a service" }, href: "/servis/" } },
];

const FEATURED = ["kentoya-v-cross-125-4t", "cfmoto-gladiator-x520-g2", "cfmoto-450-mt-r", "tgb-blade-600-ltx-max-eps-e5", "linhai-landforce-650l-eps", "cfmoto-gladiator-u6-ev", "tumoto-nexy-plus-125", "cfmoto-gladiator-x1000"];
export const defaultFeatured = FEATURED;
