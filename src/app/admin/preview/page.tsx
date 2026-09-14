"use client";
/* Live preview frame for the page editor. The editor embeds this page in an iframe sized like a
   phone or a desktop and streams the sections in over postMessage, so media queries behave exactly
   as on the real site. Clicks and text-box drags are reported back to the editor. */
import { useEffect, useMemo, useState } from "react";
import { Sections } from "@/components/Sections";
import { repo, type CategoryRow } from "@/lib/admin/repo";
import { useLang } from "@/lib/i18n";
import { defaultFeatured } from "@/lib/defaultHome";
import type { Section, ShopProduct } from "@/lib/types";

export type PreviewIn = { type: "md-preview"; sections: Section[]; selected: string | null; lang: "cs" | "en" };
export type PreviewOut = { type: "md-preview-ready" } | { type: "md-preview-height"; height: number } | { type: "md-preview-select"; id: string } | { type: "md-preview-change"; id: string; patch: Partial<Section> };

export default function PreviewFrame() {
  const { lang, setLang } = useLang();
  const [sections, setSections] = useState<Section[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [all, setAll] = useState<ShopProduct[]>([]);
  const [cats, setCats] = useState<CategoryRow[]>([]);
  const post = (m: PreviewOut) => window.parent?.postMessage(m, "*");

  useEffect(() => {
    Promise.all([repo().products.list(), repo().categories.list()]).then(([p, c]) => { setAll(p); setCats(c); });
    const onMsg = (e: MessageEvent<PreviewIn>) => {
      if (e.data?.type !== "md-preview") return;
      setSections(e.data.sections); setSelected(e.data.selected);
      if (e.data.lang && e.data.lang !== lang) setLang(e.data.lang);
    };
    window.addEventListener("message", onMsg);
    post({ type: "md-preview-ready" });
    const ro = new ResizeObserver(() => post({ type: "md-preview-height", height: document.documentElement.scrollHeight }));
    ro.observe(document.body);
    return () => { window.removeEventListener("message", onMsg); ro.disconnect(); };
  }, [lang, setLang]);

  const products = useMemo(() => {
    const out: Record<string, ShopProduct[]> = {};
    for (const s of sections) {
      if (s.type !== "products") continue;
      let list: ShopProduct[] = [];
      if (s.source === "featured") { list = all.filter((p) => p.featured); if (!list.length) list = defaultFeatured.map((x) => all.find((p) => p.slug === x)).filter(Boolean) as ShopProduct[]; }
      else if (s.source === "category" && s.category) list = all.filter((p) => p.category === s.category);
      else if (s.source === "manual" && s.slugs) list = s.slugs.map((x) => all.find((p) => p.slug === x)).filter(Boolean) as ShopProduct[];
      out[s.id] = list.slice(0, s.limit ?? 8);
    }
    return out;
  }, [sections, all]);
  const count = useMemo(() => Object.fromEntries(cats.map((c) => [c.slug, all.filter((p) => p.category === c.slug).length])), [cats, all]);

  return (
    <div className="min-h-screen bg-paper">
      <Sections sections={sections} products={products} categories={cats} count={count} edit={{ selected, onSelect: (id) => post({ type: "md-preview-select", id }), onChange: (id, patch) => post({ type: "md-preview-change", id, patch }) }} />
      {!sections.length && <div className="flex h-[60vh] items-center justify-center text-[14px] text-mute">—</div>}
    </div>
  );
}
