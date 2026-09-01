"use client";
import Link from "next/link";
import { useState } from "react";
import { Art } from "@/components/Art";
import { HomolBadge } from "@/components/Badge";
import { ProductCard } from "@/components/ProductCard";
import { byCategory, bySlug, categories, formatKc } from "@/data/catalog";
import { dict, useLang } from "@/lib/i18n";

export function ProductView({ slug }: { slug: string }) {
  const { t } = useLang();
  const p = bySlug(slug)!;
  const cat = categories.find((c) => c.slug === p.category)!;
  const [color, setColor] = useState(0);
  const related = byCategory(p.category).filter((x) => x.slug !== p.slug).slice(0, 4);
  const d = dict.product;
  const facts = [p.cc && `${p.cc} ccm`, p.power, p.drive].filter(Boolean) as string[];

  return (
    <>
      <div className="container-x py-4 font-mono text-[11px] tracking-wide text-mute">
        <Link href="/" className="hover:text-ink">Moto Dvořák</Link> / <Link href={`/${cat.slug}/`} className="hover:text-ink">{t(cat.label)}</Link> / <span className="text-ink">{p.name}</span>
      </div>
      <section className="container-x grid gap-10 lg:grid-cols-[7fr_5fr]">
        <div>
          <div className="tile-art aspect-[4/3] text-ink">
            <Art kind={p.art} draw className="p-[8%]" />
            <div className="absolute left-4 top-4 flex gap-1.5">
              {p.tags?.map((tag) => (
                <span key={tag} className={`px-1.5 py-1 font-mono text-[10px] uppercase tracking-[0.12em] leading-none ${tag === "sale" ? "bg-signal text-paper" : "bg-paper text-ink"}`}>{t(dict.catalog[tag])}</span>
              ))}
            </div>
            <div className="absolute bottom-4 left-4 font-mono text-[11px] tracking-[0.12em] text-mute">{facts.join(" · ")}</div>
          </div>
          {p.colors.length > 1 && (
            <div className="mt-5 flex items-center gap-4">
              <span className="eyebrow">{t(d.colors)}</span>
              <div className="flex gap-2">
                {p.colors.map((c, i) => (
                  <button key={c} onClick={() => setColor(i)} aria-label={`Color ${i + 1}`} aria-pressed={color === i}
                    className={`h-6 w-6 border ${color === i ? "border-ink ring-1 ring-ink ring-offset-2" : "hairline"}`} style={{ background: c }} />
                ))}
              </div>
            </div>
          )}
        </div>
        <div>
          <div className="flex items-center justify-between">
            <div className="eyebrow">{p.brand} · {t(cat.label)}</div>
            <HomolBadge code={p.homologation} size="lg" />
          </div>
          <h1 className="display mt-3 text-[38px] font-medium leading-[1.02] sm:text-[46px]">{p.name}</h1>
          <p className="mt-5 text-[15px] leading-relaxed text-neutral-700">{t(p.short)}</p>
          <div className="mt-8 flex items-baseline gap-3 font-mono">
            <span className={`text-[28px] ${p.oldPrice ? "text-signal" : ""}`}>{formatKc(p.price)}</span>
            {p.oldPrice && <span className="text-[15px] text-mute line-through">{formatKc(p.oldPrice)}</span>}
          </div>
          <div className="mt-1 font-mono text-[11px] text-mute">{t(d.vat)} · {t(dict.catalog.inStock)}</div>
          <div className="mt-6 flex flex-wrap gap-3">
            <button className="btn-ink flex-1 sm:flex-none">{t(d.addToCart)}</button>
            {p.category !== "prislusenstvi" && <button className="btn-ghost flex-1 sm:flex-none">{t(d.reserve)}</button>}
          </div>

          <dl className="mt-10 border-t hairline">
            <div className="grid grid-cols-[1fr_2fr] gap-4 border-b hairline py-3 text-[13px]">
              <dt className="text-mute">{t(d.included)}</dt><dd>{t(d.includedList)}</dd>
            </div>
            <div className="grid grid-cols-[1fr_2fr] gap-4 border-b hairline py-3 text-[13px]">
              <dt className="text-mute">{t(d.delivery)}</dt><dd>{t(d.deliveryText)}</dd>
            </div>
            <div className="grid grid-cols-[1fr_2fr] gap-4 border-b hairline py-3 text-[13px]">
              <dt className="text-mute">{t(d.financing)}</dt><dd>{t(d.financingText)}</dd>
            </div>
          </dl>
        </div>
      </section>

      <section className="container-x mt-20 grid gap-10 lg:grid-cols-[1fr_2fr]">
        <div>
          <div className="eyebrow">{t(d.specs)}</div>
          <h2 className="display mt-3 text-[28px] font-medium leading-tight">{p.name}</h2>
        </div>
        <table className="w-full border-t hairline font-mono text-[13px]">
          <tbody>
            {p.specs.map((s, i) => (
              <tr key={i} className="border-b hairline">
                <th scope="row" className="w-1/3 py-3 pr-4 text-left font-normal text-mute">{t(s.label)}</th>
                <td className="py-3">{s.value}</td>
              </tr>
            ))}
            {p.homologation !== "—" && (
              <tr className="border-b hairline">
                <th scope="row" className="py-3 pr-4 text-left font-normal text-mute">{t(dict.catalog.filterHomol)}</th>
                <td className="py-3"><span className="mr-3 inline-block align-middle"><HomolBadge code={p.homologation} /></span>{t(dict.homol[p.homologation])}</td>
              </tr>
            )}
          </tbody>
        </table>
      </section>

      {related.length > 0 && (
        <section className="container-x mt-20">
          <div className="flex items-end justify-between">
            <h2 className="display text-[28px] font-medium leading-tight">{t(d.related)}</h2>
            <Link href={`/${cat.slug}/`} className="btn-link">{t(d.back)} {t(cat.label)} <span aria-hidden>→</span></Link>
          </div>
          <div className="mt-8 grid grid-cols-2 gap-x-6 gap-y-10 lg:grid-cols-4">
            {related.map((r) => <ProductCard key={r.slug} p={r} />)}
          </div>
        </section>
      )}
    </>
  );
}
