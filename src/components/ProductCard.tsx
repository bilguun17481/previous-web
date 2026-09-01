"use client";
import Link from "next/link";
import { Art } from "./Art";
import { HomolBadge } from "./Badge";
import { formatKc, type Product } from "@/data/catalog";
import { dict, useLang } from "@/lib/i18n";

export function ProductCard({ p, priority = false }: { p: Product; priority?: boolean }) {
  const { t } = useLang();
  return (
    <Link href={`/produkt/${p.slug}/`} className="group block focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ink">
      <div className="tile-art aspect-[4/3] text-ink/80 transition-colors group-hover:bg-tile-deep">
        <Art kind={p.art} className="p-[10%] transition-transform duration-500 ease-out group-hover:scale-[1.03]" />
        <div className="absolute left-3 top-3 flex gap-1.5">
          {p.tags?.map((tag) => (
            <span key={tag} className={`px-1.5 py-1 font-mono text-[10px] uppercase tracking-[0.12em] leading-none ${tag === "sale" ? "bg-signal text-paper" : "bg-paper text-ink"}`}>
              {t(dict.catalog[tag])}
            </span>
          ))}
        </div>
        <div className="absolute right-3 top-3">
          <HomolBadge code={p.homologation} />
        </div>
      </div>
      <div className="pt-3.5">
        <div className="eyebrow">{p.brand}</div>
        <h3 className="display mt-1 text-[17px] font-medium leading-tight">{p.name}</h3>
        <p className="mt-1.5 line-clamp-2 text-[13px] leading-snug text-mute">{t(p.short)}</p>
        <div className="mt-2.5 flex items-baseline gap-2 font-mono text-[13px]">
          <span className={p.oldPrice ? "text-signal" : ""}>{formatKc(p.price)}</span>
          {p.oldPrice && <span className="text-mute line-through">{formatKc(p.oldPrice)}</span>}
        </div>
      </div>
    </Link>
  );
}
