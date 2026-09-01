"use client";
import Link from "next/link";
import { Photo } from "./Photo";
import { formatKc, type Product } from "@/data/catalog";
import { dict, useLang } from "@/lib/i18n";

export function ProductCard({ p }: { p: Product }) {
  const { t } = useLang();
  return (
    <div className="group flex flex-col bg-paper">
      <Link href={`/produkt/${p.slug}/`} className="relative block focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ink">
        <Photo label={p.name} ratio="aspect-square" className="transition-opacity group-hover:opacity-90" />
        {p.tags && (
          <div className="absolute left-3 top-3 flex gap-1.5">
            {p.tags.map((tag) => (
              <span key={tag} className={`px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] leading-none ${tag === "sale" ? "bg-signal text-paper" : "bg-ink text-paper"}`}>
                {t(dict.catalog[tag])}
              </span>
            ))}
          </div>
        )}
      </Link>
      <div className="flex flex-1 flex-col pt-4">
        <div className="eyebrow">{p.brand}</div>
        <h3 className="mt-1.5 text-[16px] font-semibold leading-snug"><Link href={`/produkt/${p.slug}/`} className="hover:underline underline-offset-4">{p.name}</Link></h3>
        <p className="mt-1.5 line-clamp-2 text-[13px] leading-snug text-mute">{t(p.short)}</p>
        <div className="mt-auto flex flex-col items-start gap-3 pt-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-baseline gap-2 whitespace-nowrap text-[14px] font-semibold">
            <span className={p.oldPrice ? "text-signal" : ""}>{formatKc(p.price)}</span>
            {p.oldPrice && <span className="text-[12px] font-normal text-mute line-through">{formatKc(p.oldPrice)}</span>}
          </div>
          <Link href={`/produkt/${p.slug}/`} className="h-9 border border-ink px-4 text-[11px] font-semibold uppercase leading-9 tracking-[0.14em] hover:bg-ink hover:text-paper">{t(dict.catalog.buy)}</Link>
        </div>
      </div>
    </div>
  );
}
