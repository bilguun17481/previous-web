"use client";
import { useMemo, useState } from "react";
import { Photo } from "@/components/Photo";
import { BackgroundMedia } from "@/components/Media";
import { ProductCard } from "@/components/ProductCard";
import type { Homologation } from "@/data/catalog";
import { dict, useLang } from "@/lib/i18n";
import type { ShopProduct, Text } from "@/lib/types";

type Cat = { slug: string; label: Text; blurb: Text; image_url: string | null; video_url: string | null };

export function CategoryView({ category: cat, products: all }: { category: Cat; products: ShopProduct[] }) {
  const { t } = useLang();
  const brandsHere = Array.from(new Set(all.map((p) => p.brand)));
  const homols = Array.from(new Set(all.map((p) => p.homologation))).filter((h) => h !== "—") as Homologation[];
  const [brand, setBrand] = useState<string | null>(null);
  const [homol, setHomol] = useState<Homologation | null>(null);
  const [sort, setSort] = useState<"price-asc" | "price-desc" | "name">("price-asc");
  const list = useMemo(() => all
    .filter((p) => (!brand || p.brand === brand) && (!homol || p.homologation === homol))
    .sort((a, b) => sort === "price-asc" ? a.price - b.price : sort === "price-desc" ? b.price - a.price : a.name.localeCompare(b.name)),
    [all, brand, homol, sort]);
  const Opt = ({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) => (
    <label className="flex cursor-pointer items-center gap-2.5 py-1.5 text-[13px]">
      <input type="checkbox" checked={active} onChange={onClick} className="h-4 w-4 accent-ink" />
      <span className={active ? "font-semibold" : ""}>{children}</span>
    </label>
  );
  const media = cat.video_url ? { kind: "video" as const, url: cat.video_url } : cat.image_url ? { kind: "image" as const, url: cat.image_url } : undefined;

  return (
    <>
      <section className="relative text-paper">
        <div className="relative aspect-[4/3] sm:aspect-[16/6]">
          <BackgroundMedia media={media} fallback={<Photo label={t(cat.label)} tone="dark" ratio="absolute inset-0" hint={t(cat.label)} />} />
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
        <div className="container-x absolute inset-x-0 bottom-0 pb-8 sm:pb-12">
          <div className="eyebrow !text-neutral-300">{t(dict.home.linesEyebrow)}</div>
          <h1 className="mt-2 text-[40px] font-bold leading-none tracking-[-0.02em] sm:text-[56px]">{t(cat.label)}</h1>
          <p className="mt-4 max-w-xl text-[14px] leading-relaxed text-neutral-200">{t(cat.blurb)}</p>
        </div>
      </section>
      <section className="container-x grid gap-10 py-10 lg:grid-cols-[220px_1fr]">
        <aside className="lg:sticky lg:top-28 lg:self-start">
          <div className="flex items-center justify-between border-b hairline pb-3">
            <span className="eyebrow !text-ink">{t(dict.catalog.filters)}</span>
            {(brand || homol) && <button className="text-[11px] text-mute underline underline-offset-4" onClick={() => { setBrand(null); setHomol(null); }}>{t(dict.catalog.reset)}</button>}
          </div>
          <div className="border-b hairline py-4">
            <div className="text-[12px] font-semibold uppercase tracking-[0.14em]">{t(dict.catalog.filterBrand)}</div>
            <div className="mt-2">{brandsHere.map((b) => <Opt key={b} active={brand === b} onClick={() => setBrand(brand === b ? null : b)}>{b} <span className="text-mute">({all.filter((p) => p.brand === b).length})</span></Opt>)}</div>
          </div>
          {homols.length > 1 && (
            <div className="border-b hairline py-4">
              <div className="text-[12px] font-semibold uppercase tracking-[0.14em]">{t(dict.catalog.filterHomol)}</div>
              <div className="mt-2">{homols.map((h) => <Opt key={h} active={homol === h} onClick={() => setHomol(homol === h ? null : h)}>{h} <span className="text-mute">({all.filter((p) => p.homologation === h).length})</span></Opt>)}</div>
            </div>
          )}
        </aside>
        <div>
          <div className="flex items-center justify-between border-b hairline pb-3 text-[12px] text-mute">
            <span>{list.length} {t(dict.catalog.models)}</span>
            <select value={sort} onChange={(e) => setSort(e.target.value as typeof sort)} className="bg-transparent text-[12px] outline-none">
              <option value="price-asc">{t(dict.catalog.sortPriceAsc)}</option>
              <option value="price-desc">{t(dict.catalog.sortPriceDesc)}</option>
              <option value="name">{t(dict.catalog.sortName)}</option>
            </select>
          </div>
          <div className="grid grid-cols-2 gap-x-5 gap-y-10 pt-8 xl:grid-cols-3">
            {list.map((p) => <ProductCard key={p.slug} p={p} />)}
          </div>
        </div>
      </section>
    </>
  );
}
