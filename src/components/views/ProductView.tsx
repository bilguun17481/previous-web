"use client";
import Link from "next/link";
import { useState } from "react";
import { Photo } from "@/components/Photo";
import { Video } from "@/components/Media";
import { ProductCard } from "@/components/ProductCard";
import { formatKc } from "@/data/catalog";
import { dict, useLang } from "@/lib/i18n";
import { useCart } from "@/lib/cart";
import { imageFor } from "@/lib/images";
import type { ShopProduct, Text } from "@/lib/types";

type Cat = { slug: string; label: Text };
type Slide = { kind: "image"; url?: string; label: string } | { kind: "video"; video: NonNullable<ShopProduct["videos"]>[number]; label: string };

export function ProductView({ p, category: cat, related }: { p: ShopProduct; category: Cat; related: ShopProduct[] }) {
  const { t, lang } = useLang();
  const { add } = useCart();
  const [color, setColor] = useState(0);
  const [active, setActive] = useState(0);
  const [added, setAdded] = useState(false);
  const d = dict.product;
  const facts = [p.cc && `${p.cc} ccm`, p.power, p.drive].filter(Boolean) as string[];
  const images = p.images?.length ? p.images.map((i) => i.url) : imageFor(p.slug) ? [imageFor(p.slug)!] : [];
  const slides: Slide[] = [
    ...(images.length ? images : [undefined]).map((u, i) => ({ kind: "image" as const, url: u, label: `${i + 1}` })),
    ...(p.videos ?? []).map((v, i) => ({ kind: "video" as const, video: v, label: v.title ?? `Video ${i + 1}` })),
  ];
  const cur = slides[active] ?? slides[0];
  const out = p.stock !== undefined && p.stock <= 0;
  const onAdd = () => { add({ slug: p.slug, name: p.name, brand: p.brand, price: p.price, image: images[0] }); setAdded(true); setTimeout(() => setAdded(false), 1800); };

  return (
    <>
      <div className="container-x py-4 text-[12px] text-mute">
        <Link href="/" className="hover:text-ink">Moto Dvořák</Link> <span className="mx-1">/</span> <Link href={`/${cat.slug}/`} className="hover:text-ink">{t(cat.label)}</Link> <span className="mx-1">/</span> <span className="text-ink">{p.name}</span>
      </div>
      <section className="container-x grid gap-10 lg:grid-cols-[7fr_5fr]">
        <div>
          <div className="relative">
            {cur.kind === "video"
              ? <div className="aspect-square bg-ink sm:aspect-[4/3]"><Video video={cur.video} className="h-full w-full" /></div>
              : <Photo label={p.name} src={cur.url} ratio="aspect-square sm:aspect-[4/3]" hint={`${p.brand} ${p.name}`} />}
            {p.tags && (
              <div className="absolute left-4 top-4 flex gap-1.5">
                {p.tags.map((tag) => <span key={tag} className={`px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] leading-none ${tag === "sale" ? "bg-signal text-paper" : "bg-ink text-paper"}`}>{t(dict.catalog[tag])}</span>)}
              </div>
            )}
          </div>
          {slides.length > 1 && (
            <div className="mt-3 grid grid-cols-4 gap-3 sm:grid-cols-5">
              {slides.map((s, i) => (
                <button key={i} onClick={() => setActive(i)} aria-pressed={active === i} className={`relative border ${active === i ? "border-ink" : "border-transparent hover:border-hair"}`}>
                  {s.kind === "video"
                    ? <div className="flex aspect-[4/3] items-center justify-center bg-ink text-paper"><svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z" /></svg></div>
                    : <Photo label={`${p.name} ${s.label}`} src={s.url} size="thumb" ratio="aspect-[4/3]" hint={s.label} />}
                </button>
              ))}
            </div>
          )}
        </div>
        <div className="lg:pl-4">
          <div className="eyebrow">{p.brand} · {t(cat.label)}</div>
          <h1 className="mt-3 text-[34px] font-bold leading-[1.05] tracking-[-0.02em] sm:text-[42px]">{p.name}</h1>
          {facts.length > 0 && <div className="mt-3 text-[13px] text-mute">{facts.join(" · ")}</div>}
          <p className="mt-5 text-[15px] leading-relaxed">{t(p.short)}</p>
          <div className="mt-8 flex items-baseline gap-3">
            <span className={`text-[28px] font-semibold ${p.oldPrice ? "text-signal" : ""}`}>{formatKc(p.price)}</span>
            {p.oldPrice && <span className="text-[15px] text-mute line-through">{formatKc(p.oldPrice)}</span>}
          </div>
          <div className="mt-1 text-[12px] text-mute">{t(d.vat)} · <span className={out ? "text-signal" : "text-ink"}>{out ? t(dict.catalog.soldOut) : t(dict.catalog.inStock)}</span></div>
          {p.colors.length > 1 && (
            <div className="mt-6">
              <div className="text-[12px] font-semibold uppercase tracking-[0.14em]">{t(d.colors)}</div>
              <div className="mt-2 flex gap-2">
                {p.colors.map((c, i) => <button key={c} onClick={() => setColor(i)} aria-label={`Color ${i + 1}`} aria-pressed={color === i} className={`h-7 w-7 rounded-full border ${color === i ? "border-ink ring-1 ring-ink ring-offset-2" : "border-hair"}`} style={{ background: c }} />)}
              </div>
            </div>
          )}
          <div className="mt-7 flex flex-col gap-3 sm:flex-row">
            <button onClick={onAdd} disabled={out} className="btn-ink flex-1 disabled:opacity-40">{added ? t(d.added) : t(d.addToCart)}</button>
            {p.category !== "prislusenstvi" && <Link href="/kontakt/" className="btn-ghost flex-1">{t(d.reserve)}</Link>}
          </div>
          {p.description && (p.description.cs || p.description.en) ? <div className="mt-8 whitespace-pre-line text-[14px] leading-relaxed text-neutral-700">{p.description[lang] || p.description.cs}</div> : null}
          <dl className="mt-8 border-t hairline text-[13px]">
            {[[d.included, d.includedList], [d.delivery, d.deliveryText], [d.financing, d.financingText]].map(([k, v], i) => (
              <div key={i} className="grid grid-cols-[110px_1fr] gap-4 border-b hairline py-3.5"><dt className="font-semibold">{t(k)}</dt><dd className="text-mute">{t(v)}</dd></div>
            ))}
          </dl>
        </div>
      </section>

      <section className="container-x mt-20 grid gap-8 lg:grid-cols-[1fr_2fr]">
        <div><div className="eyebrow">{t(d.specs)}</div><h2 className="h-section mt-2">{p.name}</h2></div>
        <table className="w-full border-t hairline text-[14px]">
          <tbody>
            {p.specs.map((s, i) => (
              <tr key={i} className="border-b hairline"><th scope="row" className="w-1/3 py-3.5 pr-4 text-left font-semibold">{t(s.label)}</th><td className="py-3.5 text-mute">{s.value}</td></tr>
            ))}
            {p.homologation !== "—" && (
              <tr className="border-b hairline"><th scope="row" className="py-3.5 pr-4 text-left font-semibold">{t(dict.catalog.filterHomol)}</th><td className="py-3.5 text-mute"><span className="mr-2 font-semibold text-ink">{p.homologation}</span>{t(dict.homol[p.homologation])}</td></tr>
            )}
          </tbody>
        </table>
      </section>

      {related.length > 0 && (
        <section className="container-x mt-20">
          <div className="flex items-end justify-between border-b hairline pb-5">
            <h2 className="h-section">{t(d.related)}</h2>
            <Link href={`/${cat.slug}/`} className="btn-link">{t(d.back)} {t(cat.label)} <span aria-hidden>→</span></Link>
          </div>
          <div className="mt-8 grid grid-cols-2 gap-x-5 gap-y-10 lg:grid-cols-4">{related.map((r) => <ProductCard key={r.slug} p={r} />)}</div>
        </section>
      )}
    </>
  );
}
