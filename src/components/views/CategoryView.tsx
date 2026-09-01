"use client";
import { useMemo, useState } from "react";
import { ProductCard } from "@/components/ProductCard";
import { HomolBadge } from "@/components/Badge";
import { byCategory, categories, type Category, type Homologation } from "@/data/catalog";
import { dict, useLang } from "@/lib/i18n";

export function CategoryView({ category }: { category: Category }) {
  const { t } = useLang();
  const cat = categories.find((c) => c.slug === category)!;
  const all = byCategory(category);
  const brandsHere = Array.from(new Set(all.map((p) => p.brand)));
  const homols = Array.from(new Set(all.map((p) => p.homologation))).filter((h) => h !== "—") as Homologation[];
  const [brand, setBrand] = useState<string | null>(null);
  const [homol, setHomol] = useState<Homologation | null>(null);
  const list = useMemo(
    () => all.filter((p) => (!brand || p.brand === brand) && (!homol || p.homologation === homol)).sort((a, b) => a.price - b.price),
    [all, brand, homol],
  );
  const chip = (active: boolean) =>
    `h-8 px-3 text-[12px] font-medium tracking-tight transition-colors ${active ? "bg-ink text-paper" : "border hairline hover:border-ink"}`;

  return (
    <>
      <section className="bg-tile">
        <div className="container-x py-14">
          <div className="eyebrow">{t(dict.home.linesEyebrow)}</div>
          <h1 className="display mt-3 text-[44px] font-medium leading-none sm:text-[56px]">{t(cat.label)}</h1>
          <p className="mt-5 max-w-xl text-[14px] leading-relaxed text-mute">{t(cat.blurb)}</p>
        </div>
      </section>
      <section className="container-x">
        <div className="flex flex-wrap items-center gap-x-8 gap-y-3 border-b hairline py-4">
          <div className="flex items-center gap-2">
            <span className="eyebrow mr-1">{t(dict.catalog.filterBrand)}</span>
            <button className={chip(!brand)} onClick={() => setBrand(null)}>{t(dict.catalog.all)}</button>
            {brandsHere.map((b) => <button key={b} className={chip(brand === b)} onClick={() => setBrand(brand === b ? null : b)}>{b}</button>)}
          </div>
          {homols.length > 1 && (
            <div className="flex items-center gap-2">
              <span className="eyebrow mr-1">{t(dict.catalog.filterHomol)}</span>
              <button className={chip(!homol)} onClick={() => setHomol(null)}>{t(dict.catalog.all)}</button>
              {homols.map((h) => (
                <button key={h} onClick={() => setHomol(homol === h ? null : h)} aria-pressed={homol === h} className={`${homol === h ? "opacity-100" : "opacity-60 hover:opacity-100"}`}>
                  <HomolBadge code={h} />
                </button>
              ))}
            </div>
          )}
          <div className="ml-auto font-mono text-[11px] text-mute">{list.length} {t(dict.catalog.models)} · {t(dict.catalog.sort)}</div>
        </div>
        <div className="grid grid-cols-2 gap-x-6 gap-y-10 py-10 lg:grid-cols-4">
          {list.map((p) => <ProductCard key={p.slug} p={p} />)}
        </div>
      </section>
    </>
  );
}
