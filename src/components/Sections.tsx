"use client";
import Link from "next/link";
import { Photo } from "@/components/Photo";
import { ProductCard } from "@/components/ProductCard";
import { BackgroundMedia, Video } from "@/components/Media";
import { brands } from "@/data/catalog";
import { dict, useLang } from "@/lib/i18n";
import type { Section, ShopProduct, Text } from "@/lib/types";

type Cat = { slug: string; label: Text; blurb: Text; image_url: string | null; video_url: string | null };

/** Renders the landing-page builder sections. `products` is keyed by section id. */
export function Sections({ sections, products, categories, count }: { sections: Section[]; products: Record<string, ShopProduct[]>; categories: Cat[]; count: Record<string, number> }) {
  const { t } = useLang();
  const T = (x?: Text) => (x ? t(x) : "");
  return (
    <>
      {sections.map((s) => {
        switch (s.type) {
          case "hero": {
            const h = s.height === "medium" ? "aspect-[4/5] sm:aspect-[16/8] lg:aspect-[21/8]" : "aspect-[4/5] sm:aspect-[16/9] lg:aspect-[21/9]";
            return (
              <section key={s.id} className="relative text-paper">
                <div className={`relative ${h}`}>
                  <BackgroundMedia media={s.media} fallback={<Photo label={T(s.title)} tone="dark" ratio="absolute inset-0" hint={T(s.title)} />} />
                </div>
                <div className="absolute inset-0" style={{ background: `linear-gradient(to top, rgba(0,0,0,${(s.overlay ?? 60) / 100}), rgba(0,0,0,0.15) 60%, transparent)` }} />
                <div className={`container-x absolute inset-x-0 bottom-0 pb-10 sm:pb-14 lg:pb-20 ${s.align === "center" ? "text-center" : ""}`}>
                  <div className={`max-w-xl ${s.align === "center" ? "mx-auto" : ""}`}>
                    {s.eyebrow && <div className="eyebrow rise !text-neutral-300">{T(s.eyebrow)}</div>}
                    <h1 className="rise rise-2 mt-3 text-[44px] font-bold leading-[1.02] tracking-[-0.02em] sm:text-[64px] lg:text-[76px]">{T(s.title)}</h1>
                    {s.text && <p className={`rise rise-3 mt-4 max-w-md text-[15px] leading-relaxed text-neutral-200 ${s.align === "center" ? "mx-auto" : ""}`}>{T(s.text)}</p>}
                    {s.cta && <Link href={s.cta.href} className="btn-white rise rise-3 mt-7">{T(s.cta.label)}</Link>}
                  </div>
                </div>
              </section>
            );
          }
          case "categories":
            return (
              <section key={s.id} className="container-x py-16">
                {(s.title || s.eyebrow) && (
                  <div className="text-center">
                    {s.eyebrow && <div className="eyebrow">{T(s.eyebrow)}</div>}
                    {s.title && <h2 className="h-section mt-3">{T(s.title)}</h2>}
                    {s.text && <p className="mx-auto mt-4 max-w-2xl text-[14px] leading-relaxed text-mute">{T(s.text)}</p>}
                  </div>
                )}
                <div className="mt-10 grid grid-cols-2 gap-4 lg:grid-cols-4">
                  {s.categories.map((slug) => categories.find((c) => c.slug === slug)).filter(Boolean).map((c) => (
                    <Link key={c!.slug} href={`/${c!.slug}/`} className="group relative block overflow-hidden text-paper">
                      <div className="relative aspect-[3/4] transition-transform duration-700 group-hover:scale-[1.03]">
                        <BackgroundMedia media={c!.image_url ? { kind: "image", url: c!.image_url } : undefined} fallback={<Photo label={T(c!.label)} tone="dark" ratio="absolute inset-0" />} />
                      </div>
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                      <div className="absolute inset-x-0 bottom-0 p-5">
                        <div className="text-[18px] font-semibold leading-tight sm:text-[22px]">{T(c!.label)}</div>
                        <div className="mt-1 text-[12px] text-neutral-300">{count[c!.slug] ?? 0} {t(dict.catalog.models)}</div>
                      </div>
                    </Link>
                  ))}
                </div>
              </section>
            );
          case "products":
            return (
              <section key={s.id} className="container-x py-16">
                <div className="flex items-end justify-between border-b hairline pb-5">
                  <div>
                    {s.eyebrow && <div className="eyebrow">{T(s.eyebrow)}</div>}
                    {s.title && <h2 className="h-section mt-2">{T(s.title)}</h2>}
                  </div>
                  <Link href={s.category ? `/${s.category}/` : "/ctyrkolky/"} className="btn-link">{t(dict.home.all)} <span aria-hidden>→</span></Link>
                </div>
                <div className="mt-8 grid grid-cols-2 gap-x-5 gap-y-10 lg:grid-cols-4">
                  {(products[s.id] ?? []).map((p) => <ProductCard key={p.slug} p={p} />)}
                </div>
              </section>
            );
          case "banner":
            return (
              <section key={s.id} className="relative text-paper">
                <div className="relative aspect-[4/5] sm:aspect-[16/7]">
                  <BackgroundMedia media={s.media} fallback={<Photo label={T(s.title)} tone="dark" ratio="absolute inset-0" hint={T(s.eyebrow) || T(s.title)} />} />
                </div>
                <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/30 to-transparent" />
                <div className="container-x absolute inset-0 flex items-center">
                  <div className="max-w-md">
                    {s.eyebrow && <div className="eyebrow !text-neutral-300">{T(s.eyebrow)}</div>}
                    <h2 className="mt-3 text-[32px] font-bold leading-tight tracking-[-0.02em] sm:text-[44px]">{T(s.title)}</h2>
                    {s.text && <p className="mt-4 text-[14px] leading-relaxed text-neutral-200">{T(s.text)}</p>}
                    {s.cta && <Link href={s.cta.href} className="btn-outline-white mt-7">{T(s.cta.label)}</Link>}
                  </div>
                </div>
              </section>
            );
          case "video":
            if (!s.video?.url) return null;
            return (
              <section key={s.id} className="container-x py-16">
                {s.title && <h2 className="h-section text-center">{T(s.title)}</h2>}
                {s.text && <p className="mx-auto mt-3 max-w-2xl text-center text-[14px] text-mute">{T(s.text)}</p>}
                <div className="mt-8 aspect-video w-full bg-ink"><Video video={s.video} className="h-full w-full" /></div>
              </section>
            );
          case "brands":
            return (
              <section key={s.id} className="bg-tile">
                <div className="container-x py-14 text-center">
                  {s.eyebrow && <div className="eyebrow">{T(s.eyebrow)}</div>}
                  {s.title && <h2 className="h-section mt-2">{T(s.title)}</h2>}
                  <div className="mt-10 flex flex-wrap items-center justify-center gap-x-14 gap-y-6">
                    {brands.map((b) => <div key={b} className="text-[22px] font-extrabold uppercase tracking-[-0.02em] text-ink/80">{b}</div>)}
                  </div>
                </div>
              </section>
            );
          case "split":
            return (
              <section key={s.id} className="container-x py-16">
                <div className={`grid items-center gap-10 lg:grid-cols-2 ${s.mediaSide === "right" ? "lg:[&>*:first-child]:order-2" : ""}`}>
                  <div className="relative aspect-[4/3]">
                    <BackgroundMedia media={s.media} fallback={<Photo label={T(s.title)} ratio="absolute inset-0" hint={T(s.eyebrow) || T(s.title)} />} />
                  </div>
                  <div className="lg:px-10">
                    {s.eyebrow && <div className="eyebrow">{T(s.eyebrow)}</div>}
                    <h2 className="h-section mt-3">{T(s.title)}</h2>
                    {s.text && <p className="mt-4 max-w-md text-[14px] leading-relaxed text-mute">{T(s.text)}</p>}
                    {s.cta && <Link href={s.cta.href} className="btn-ink mt-8">{T(s.cta.label)}</Link>}
                  </div>
                </div>
              </section>
            );
          case "richtext":
            return (
              <section key={s.id} className="container-x max-w-3xl py-16">
                {s.title && <h2 className="h-section">{T(s.title)}</h2>}
                <div className="prose mt-5 whitespace-pre-line text-[15px] leading-relaxed">{T(s.body)}</div>
              </section>
            );
          case "news":
            return (
              <section key={s.id} className="container-x py-16">
                <div className="flex items-end justify-between border-b hairline pb-5">
                  <h2 className="h-section">{s.title ? T(s.title) : t(dict.home.newsEyebrow)}</h2>
                </div>
                <div className="mt-8 grid gap-8 md:grid-cols-3">
                  {dict.news.slice(0, s.limit ?? 3).map((n, i) => (
                    <article key={i}>
                      <Photo label={t(n.title)} ratio="aspect-[3/2]" hint={t(n.tag)} />
                      <div className="eyebrow mt-4">{t(n.tag)}</div>
                      <h3 className="mt-2 text-[18px] font-semibold leading-snug">{t(n.title)}</h3>
                      <p className="mt-2 text-[13px] leading-relaxed text-mute">{t(n.text)}</p>
                    </article>
                  ))}
                </div>
              </section>
            );
          default:
            return null;
        }
      })}
    </>
  );
}
