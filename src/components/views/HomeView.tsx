"use client";
import Link from "next/link";
import { Photo } from "@/components/Photo";
import { ProductCard } from "@/components/ProductCard";
import { brands, byCategory, bySlug, categories, formatKc, products } from "@/data/catalog";
import { dict, useLang } from "@/lib/i18n";
import { imageFor } from "@/lib/images";

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
      {/* Hero: full-bleed campaign photo with text overlay */}
      <section className="relative text-paper">
        <Photo label={hero.name} src={imageFor(hero.slug)} fit="cover" tone="dark" ratio="aspect-[4/5] sm:aspect-[16/9] lg:aspect-[21/9]" hint={`${hero.brand} ${hero.name}`} />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
        <div className="container-x absolute inset-x-0 bottom-0 pb-10 sm:pb-14 lg:pb-20">
          <div className="max-w-xl">
            <div className="eyebrow rise !text-neutral-300">{t(dict.hero.eyebrow)} · Kentoya</div>
            <h1 className="rise rise-2 mt-3 text-[44px] font-bold leading-[1.02] tracking-[-0.02em] sm:text-[64px] lg:text-[76px]">{t(dict.hero.title)}</h1>
            <p className="rise rise-3 mt-4 max-w-md text-[15px] leading-relaxed text-neutral-200">{t(dict.hero.lead)}</p>
            <div className="rise rise-3 mt-7 flex flex-wrap items-center gap-4">
              <Link href={`/produkt/${hero.slug}/`} className="btn-white">{t(dict.hero.cta)}</Link>
              <span className="text-[14px]">
                <span className="text-neutral-300">{t(dict.hero.from)} </span>
                <span className="font-semibold">{formatKc(hero.price)}</span>
              </span>
            </div>
          </div>
        </div>
        <div className="absolute bottom-5 right-5 flex gap-1.5 sm:right-10" aria-hidden>
          {[0, 1, 2].map((i) => <span key={i} className={`h-1.5 w-6 ${i === 0 ? "bg-paper" : "bg-paper/40"}`} />)}
        </div>
      </section>

      {/* Range tiles */}
      <section className="container-x py-16">
        <div className="text-center">
          <div className="eyebrow">{t(h.linesEyebrow)}</div>
          <h2 className="h-section mt-3">{t(h.linesTitle)}</h2>
          <p className="mx-auto mt-4 max-w-2xl text-[14px] leading-relaxed text-mute">{t(h.linesLead)}</p>
        </div>
        <div className="mt-10 grid grid-cols-2 gap-4 lg:grid-cols-4">
          {categories.filter((c) => c.slug !== "prislusenstvi").map((c) => (
            <Link key={c.slug} href={`/${c.slug}/`} className="group relative block overflow-hidden text-paper">
              <Photo label={t(c.label)} tone="dark" ratio="aspect-[3/4]" className="transition-transform duration-700 group-hover:scale-[1.03]" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-5">
                <div className="text-[18px] font-semibold leading-tight sm:text-[22px]">{t(c.label)}</div>
                <div className="mt-1 text-[12px] text-neutral-300">{byCategory(c.slug).length} {t(dict.catalog.models)}</div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured */}
      <section className="container-x py-16">
        <div className="flex items-end justify-between border-b hairline pb-5">
          <div>
            <div className="eyebrow">{t(h.featuredEyebrow)}</div>
            <h2 className="h-section mt-2">{t(h.featuredTitle)}</h2>
          </div>
          <Link href="/ctyrkolky/" className="btn-link">{t(h.all)} <span aria-hidden>→</span></Link>
        </div>
        <div className="mt-8 grid grid-cols-2 gap-x-5 gap-y-10 lg:grid-cols-4">
          {featured.map((p) => <ProductCard key={p.slug} p={p} />)}
        </div>
      </section>

      {/* Campaign banner */}
      <section className="relative text-paper">
        <Photo label={t(dict.campaign.title)} tone="dark" ratio="aspect-[4/5] sm:aspect-[16/7]" hint="CFMOTO GLADIATOR X520" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/30 to-transparent" />
        <div className="container-x absolute inset-0 flex items-center">
          <div className="max-w-md">
            <div className="eyebrow !text-neutral-300">{t(dict.campaign.eyebrow)}</div>
            <h2 className="mt-3 text-[32px] font-bold leading-tight tracking-[-0.02em] sm:text-[44px]">{t(dict.campaign.title)}</h2>
            <p className="mt-4 text-[14px] leading-relaxed text-neutral-200">{t(dict.campaign.text)}</p>
            <Link href="/ctyrkolky/" className="btn-outline-white mt-7">{t(dict.campaign.cta)}</Link>
          </div>
        </div>
      </section>

      {/* News */}
      <section className="container-x py-16">
        <div className="flex items-end justify-between border-b hairline pb-5">
          <h2 className="h-section">{t(h.newsEyebrow)}</h2>
          <Link href="#" className="btn-link">{t(h.allNews)} <span aria-hidden>→</span></Link>
        </div>
        <div className="mt-8 grid gap-8 md:grid-cols-3">
          {dict.news.map((n, i) => (
            <article key={i} className="group">
              <Photo label={t(n.title)} ratio="aspect-[3/2]" hint={t(n.tag)} className="transition-opacity group-hover:opacity-90" />
              <div className="eyebrow mt-4">{t(n.tag)}</div>
              <h3 className="mt-2 text-[18px] font-semibold leading-snug">{t(n.title)}</h3>
              <p className="mt-2 text-[13px] leading-relaxed text-mute">{t(n.text)}</p>
            </article>
          ))}
        </div>
      </section>

      {/* Brands */}
      <section className="bg-tile">
        <div className="container-x py-14 text-center">
          <div className="eyebrow">{t(h.brandsEyebrow)}</div>
          <h2 className="h-section mt-2">{t(h.brandsTitle)}</h2>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-x-14 gap-y-6">
            {brands.map((b) => (
              <div key={b} className="text-center">
                <div className="text-[22px] font-extrabold uppercase tracking-[-0.02em] text-ink/80">{b}</div>
                <div className="mt-0.5 text-[11px] text-mute">{products.filter((p) => p.brand === b).length} {t(dict.catalog.models)}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Service */}
      <section className="container-x py-16">
        <div className="grid items-center gap-10 lg:grid-cols-2">
          <Photo label={t(h.serviceTitle)} ratio="aspect-[4/3]" hint={t(dict.nav.servis)} />
          <div className="lg:pl-10">
            <div className="eyebrow">{t(dict.nav.servis)}</div>
            <h2 className="h-section mt-3">{t(h.serviceTitle)}</h2>
            <p className="mt-4 max-w-md text-[14px] leading-relaxed text-mute">{t(h.serviceLead)}</p>
            <Link href="/servis/" className="btn-ink mt-8">{t(h.serviceCta)}</Link>
          </div>
        </div>
      </section>
    </>
  );
}
