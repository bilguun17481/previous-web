"use client";
import Link from "next/link";
import { Art } from "@/components/Art";
import { HomolBadge } from "@/components/Badge";
import { ProductCard } from "@/components/ProductCard";
import { brands, byCategory, bySlug, categories, formatKc, products } from "@/data/catalog";
import { dict, useLang } from "@/lib/i18n";

export function HomeView() {
  const { t } = useLang();
  const hero = bySlug("kentoya-v-cross-125-4t")!;
  const featured = [
    "kentoya-v-cross-125-4t", "cfmoto-gladiator-x520-g2", "cfmoto-450-mt-r", "tgb-blade-600-ltx-max-eps-e5",
    "linhai-landforce-650l-eps", "cfmoto-gladiator-u6-ev", "tumoto-nexy-plus-125", "cfmoto-gladiator-x1000",
  ].map((s) => bySlug(s)!);
  const h = dict.home;

  return (
    <>
      {/* Hero */}
      <section className="bg-tile">
        <div className="container-x grid min-h-[calc(100vh-7rem)] grid-cols-1 items-center gap-8 py-12 lg:grid-cols-[5fr_7fr] lg:py-0">
          <div className="order-2 lg:order-1">
            <div className="eyebrow rise">{t(dict.hero.eyebrow)} · Kentoya</div>
            <h1 className="display rise rise-2 mt-4 text-[64px] font-medium leading-[0.92] sm:text-[88px] lg:text-[104px]">
              {t(dict.hero.title)}
            </h1>
            <p className="rise rise-3 mt-6 max-w-md text-[15px] leading-relaxed text-neutral-700">{t(dict.hero.lead)}</p>
            <div className="rise rise-3 mt-8 flex flex-wrap items-center gap-x-8 gap-y-4">
              <div>
                <div className="eyebrow">{t(dict.hero.from)}</div>
                <div className="mt-1 font-mono text-[20px]">
                  <span className="text-signal">{formatKc(hero.price)}</span>
                  <span className="ml-2 text-[14px] text-mute line-through">{formatKc(hero.oldPrice!)}</span>
                </div>
              </div>
              <Link href={`/produkt/${hero.slug}/`} className="btn-ink">{t(dict.hero.cta)}</Link>
            </div>
          </div>
          <div className="relative order-1 aspect-[4/3] w-full text-ink lg:order-2 lg:aspect-auto lg:h-[70vh]">
            <Art kind="scooter" draw className="h-full w-full" />
            <div className="absolute bottom-0 right-0 flex items-center gap-3">
              <HomolBadge code="L3e" size="lg" />
              <span className="font-mono text-[11px] tracking-[0.12em] text-mute">125 CCM · 14 K · ABS + ASR</span>
            </div>
          </div>
        </div>
      </section>

      {/* Lines */}
      <section className="container-x py-20">
        <div className="grid gap-8 lg:grid-cols-[1fr_2fr]">
          <div>
            <div className="eyebrow">{t(h.linesEyebrow)}</div>
            <h2 className="display mt-3 text-[34px] font-medium leading-tight">{t(h.linesTitle)}</h2>
            <p className="mt-4 max-w-sm text-[14px] leading-relaxed text-mute">{t(h.linesLead)}</p>
          </div>
          <div className="grid grid-cols-2 gap-px bg-hair lg:grid-cols-4">
            {categories.filter((c) => c.slug !== "prislusenstvi").map((c) => (
              <Link key={c.slug} href={`/${c.slug}/`} className="group bg-paper p-5 transition-colors hover:bg-tile">
                <div className="aspect-[4/3] text-ink/70"><Art kind={c.art} className="h-full w-full transition-transform duration-500 group-hover:scale-105" /></div>
                <div className="display mt-3 text-[17px] font-medium">{t(c.label)}</div>
                <div className="mt-0.5 font-mono text-[11px] text-mute">{byCategory(c.slug).length} {t(dict.catalog.models)}</div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured */}
      <section className="container-x border-t hairline py-20">
        <div className="flex items-end justify-between">
          <div>
            <div className="eyebrow">{t(h.featuredEyebrow)}</div>
            <h2 className="display mt-3 text-[34px] font-medium leading-tight">{t(h.featuredTitle)}</h2>
          </div>
          <Link href="/ctyrkolky/" className="btn-link">{t(h.all)} <span aria-hidden>→</span></Link>
        </div>
        <div className="mt-10 grid grid-cols-2 gap-x-6 gap-y-10 lg:grid-cols-4">
          {featured.map((p) => <ProductCard key={p.slug} p={p} />)}
        </div>
      </section>

      {/* Homologation explainer, the signature */}
      <section className="bg-tile">
        <div className="container-x py-20">
          <div className="max-w-2xl">
            <div className="eyebrow">{t(h.homolEyebrow)}</div>
            <h2 className="display mt-3 text-[34px] font-medium leading-tight">{t(h.homolTitle)}</h2>
            <p className="mt-4 text-[14px] leading-relaxed text-mute">{t(h.homolLead)}</p>
          </div>
          <div className="mt-12 grid gap-px bg-hair sm:grid-cols-2 lg:grid-cols-4">
            {(["T3b", "L7e", "L3e", "L1e"] as const).map((code) => (
              <div key={code} className="bg-paper p-6">
                <HomolBadge code={code} size="lg" />
                <p className="mt-5 text-[13px] leading-relaxed">{t(dict.homol[code])}</p>
                <div className="mt-4 font-mono text-[11px] text-mute">
                  {products.filter((p) => p.homologation === code).length} {t(dict.catalog.models)}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Brands */}
      <section className="container-x py-20">
        <div className="eyebrow">{t(h.brandsEyebrow)}</div>
        <h2 className="display mt-3 text-[34px] font-medium leading-tight">{t(h.brandsTitle)}</h2>
        <div className="mt-10 grid grid-cols-2 gap-px bg-hair md:grid-cols-5">
          {brands.map((b) => (
            <div key={b} className="bg-paper py-8 text-center">
              <div className="display text-[22px] font-semibold uppercase tracking-tight">{b}</div>
              <div className="mt-1 font-mono text-[11px] text-mute">{products.filter((p) => p.brand === b).length} {t(dict.catalog.models)}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Service */}
      <section className="container-x border-t hairline py-20">
        <div className="grid items-center gap-10 lg:grid-cols-2">
          <div>
            <div className="eyebrow">{t(dict.nav.servis)}</div>
            <h2 className="display mt-3 text-[34px] font-medium leading-tight">{t(h.serviceTitle)}</h2>
            <p className="mt-4 max-w-md text-[14px] leading-relaxed text-mute">{t(h.serviceLead)}</p>
            <Link href="/servis/" className="btn-ghost mt-8">{t(h.serviceCta)}</Link>
          </div>
          <div className="tile-art aspect-[16/9] text-ink/70"><Art kind="gear" className="p-[14%]" /></div>
        </div>
      </section>
    </>
  );
}
