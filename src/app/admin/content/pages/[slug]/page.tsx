"use client";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { adm } from "@/lib/admin/i18n";
import { repo } from "@/lib/admin/repo";
import { Button, Card, Field, Input, PageHeader, Select, TextField, useT, useToast } from "@/components/admin/ui";
import { MediaPicker } from "@/components/admin/MediaPicker";
import { categories } from "@/data/catalog";
import type { Page, Section } from "@/lib/types";

const uid = () => Math.random().toString(36).slice(2, 8);
const blankSection = (type: Section["type"]): Section => {
  const T = { cs: "", en: "" };
  switch (type) {
    case "hero": return { id: uid(), type, media: { kind: "image", url: "" }, eyebrow: T, title: { cs: "Nadpis", en: "Headline" }, text: T, cta: { label: { cs: "Zobrazit", en: "View" }, href: "/" }, align: "left", height: "large", overlay: 60 };
    case "categories": return { id: uid(), type, eyebrow: T, title: T, text: T, categories: ["ctyrkolky", "utv", "motocykly", "skutry"] };
    case "products": return { id: uid(), type, eyebrow: T, title: { cs: "Vybrané modely", en: "Featured" }, source: "featured", limit: 8 };
    case "banner": return { id: uid(), type, media: { kind: "image", url: "" }, eyebrow: T, title: { cs: "Nadpis", en: "Headline" }, text: T, cta: { label: { cs: "Zobrazit", en: "View" }, href: "/" } };
    case "video": return { id: uid(), type, title: T, text: T, video: { kind: "youtube", url: "" } };
    case "brands": return { id: uid(), type, eyebrow: T, title: { cs: "Značky", en: "Brands" } };
    case "split": return { id: uid(), type, media: { kind: "image", url: "" }, eyebrow: T, title: { cs: "Nadpis", en: "Headline" }, text: T, cta: { label: { cs: "Více", en: "More" }, href: "/" }, mediaSide: "left" };
    case "richtext": return { id: uid(), type, title: T, body: T };
    case "news": return { id: uid(), type, limit: 3 };
  }
};

export default function PageBuilder() {
  const { t } = useT();
  const toast = useToast();
  const { slug } = useParams<{ slug: string }>();
  const [page, setPage] = useState<Page | null>(null);
  const [openId, setOpenId] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  useEffect(() => { repo().pages.get(slug).then(setPage); }, [slug]);
  if (!page) return <p className="text-mute">{t(adm.common.loading)}</p>;
  const sections = page.sections;
  const setS = (i: number, s: Section) => setPage({ ...page, sections: sections.map((x, k) => (k === i ? s : x)) });
  const move = (i: number, d: -1 | 1) => { const a = [...sections]; const j = i + d; if (j < 0 || j >= a.length) return; [a[i], a[j]] = [a[j], a[i]]; setPage({ ...page, sections: a }); };
  const save = async (status?: Page["status"]) => { setBusy(true); try { const p = { ...page, status: status ?? page.status }; await repo().pages.save(p); setPage(p); toast(t(adm.common.saved)); } catch (e) { toast((e as Error).message, "err"); } setBusy(false); };
  const href = page.slug === "home" ? "/" : `/${page.slug}/`;

  return (
    <>
      <PageHeader title={t(page.title) || page.slug} sub={href} back={{ href: "/admin/content/pages/", label: t(adm.pages.title) }}
        actions={<><a href={href} target="_blank" className="inline-flex h-9 items-center rounded-md border border-hair px-3.5 text-[13px] hover:bg-tile">{t(adm.pages.preview)}</a>
          {page.status === "published" ? <Button variant="secondary" disabled={busy} onClick={() => save("draft")}>{t(adm.pages.unpublish)}</Button> : <Button variant="secondary" disabled={busy} onClick={() => save("published")}>{t(adm.pages.publish)}</Button>}
          <Button disabled={busy} onClick={() => save()}>{t(adm.common.save)}</Button></>} />
      <div className="grid gap-4 lg:grid-cols-[2fr_1fr]">
        <div className="space-y-3">
          {sections.map((s, i) => (
            <Card key={s.id} className={openId === s.id ? "border-ink" : ""}>
              <div className="flex items-center gap-3">
                <span className="rounded bg-tile px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide">{t(adm.pages.types[s.type])}</span>
                <button className="flex-1 text-left text-[13px] font-medium" onClick={() => setOpenId(openId === s.id ? null : s.id)}>{"title" in s && s.title ? t(s.title) : ""}</button>
                <Button variant="ghost" onClick={() => move(i, -1)} aria-label={t(adm.pages.up)}>↑</Button>
                <Button variant="ghost" onClick={() => move(i, 1)} aria-label={t(adm.pages.down)}>↓</Button>
                <Button variant="ghost" onClick={() => setPage({ ...page, sections: sections.filter((_, k) => k !== i) })}>×</Button>
              </div>
              {openId === s.id && <div className="mt-4 space-y-3 border-t border-hair pt-4"><SectionForm s={s} onChange={(n) => setS(i, n)} /></div>}
            </Card>
          ))}
          <Card title={t(adm.pages.addSection)}>
            <div className="flex flex-wrap gap-2">{(Object.keys(adm.pages.types) as Section["type"][]).map((ty) => <Button key={ty} variant="secondary" onClick={() => { const s = blankSection(ty); setPage({ ...page, sections: [...sections, s] }); setOpenId(s.id); }}>+ {t(adm.pages.types[ty])}</Button>)}</div>
          </Card>
        </div>
        <div className="space-y-4">
          <Card title={t(adm.pages.seo)}>
            <div className="space-y-3">
              <TextField label={t(adm.common.name)} value={page.title} onChange={(v) => setPage({ ...page, title: v })} />
              <TextField label={t(adm.products.seoTitle)} value={page.seo.title} onChange={(v) => setPage({ ...page, seo: { ...page.seo, title: v } })} />
              <TextField label={t(adm.products.seoDesc)} value={page.seo.description} onChange={(v) => setPage({ ...page, seo: { ...page.seo, description: v } })} multiline />
            </div>
          </Card>
        </div>
      </div>
    </>
  );
}

function SectionForm({ s, onChange }: { s: Section; onChange: (s: Section) => void }) {
  const { t } = useT();
  const f = adm.pages.f;
  const up = (patch: Record<string, unknown>) => onChange({ ...s, ...patch } as Section);
  const cta = "cta" in s ? s.cta : undefined;
  const CtaFields = () => (
    <div className="grid gap-3 sm:grid-cols-[2fr_1fr]">
      <TextField label={t(f.cta)} value={cta?.label} onChange={(v) => up({ cta: { label: v, href: cta?.href ?? "/" } })} />
      <Field label={t(f.ctaHref)}><Input value={cta?.href ?? ""} onChange={(e) => up({ cta: { label: cta?.label ?? { cs: "", en: "" }, href: e.target.value } })} /></Field>
    </div>
  );
  switch (s.type) {
    case "hero": return (<>
      <Field label={t(f.media)}><MediaPicker value={s.media?.url ? s.media : undefined} onChange={(m) => up({ media: m ?? { kind: "image", url: "" } })} /></Field>
      <TextField label={t(f.eyebrow)} value={s.eyebrow} onChange={(v) => up({ eyebrow: v })} />
      <TextField label={t(f.title)} value={s.title} onChange={(v) => up({ title: v })} />
      <TextField label={t(f.text)} value={s.text} onChange={(v) => up({ text: v })} multiline />
      <CtaFields />
      <div className="grid gap-3 sm:grid-cols-3">
        <Field label={t(f.align)}><Select value={s.align ?? "left"} onChange={(e) => up({ align: e.target.value })}><option value="left">Left</option><option value="center">Center</option></Select></Field>
        <Field label={t(f.height)}><Select value={s.height ?? "large"} onChange={(e) => up({ height: e.target.value })}><option value="large">Large</option><option value="medium">Medium</option></Select></Field>
        <Field label={t(f.overlay)}><Input type="number" min={0} max={100} value={s.overlay ?? 60} onChange={(e) => up({ overlay: Number(e.target.value) })} /></Field>
      </div></>);
    case "banner": case "split": return (<>
      <Field label={t(f.media)}><MediaPicker value={s.media?.url ? s.media : undefined} onChange={(m) => up({ media: m ?? { kind: "image", url: "" } })} /></Field>
      <TextField label={t(f.eyebrow)} value={s.eyebrow} onChange={(v) => up({ eyebrow: v })} />
      <TextField label={t(f.title)} value={s.title} onChange={(v) => up({ title: v })} />
      <TextField label={t(f.text)} value={s.text} onChange={(v) => up({ text: v })} multiline />
      <CtaFields />
      {s.type === "split" && <Field label={t(f.mediaSide)}><Select value={s.mediaSide ?? "left"} onChange={(e) => up({ mediaSide: e.target.value })}><option value="left">Left</option><option value="right">Right</option></Select></Field>}</>);
    case "categories": return (<>
      <TextField label={t(f.eyebrow)} value={s.eyebrow} onChange={(v) => up({ eyebrow: v })} />
      <TextField label={t(f.title)} value={s.title} onChange={(v) => up({ title: v })} />
      <TextField label={t(f.text)} value={s.text} onChange={(v) => up({ text: v })} />
      <div className="flex flex-wrap gap-3">{categories.map((c) => <label key={c.slug} className="flex items-center gap-2 text-[13px]"><input type="checkbox" className="accent-ink" checked={s.categories.includes(c.slug)} onChange={(e) => up({ categories: e.target.checked ? [...s.categories, c.slug] : s.categories.filter((x) => x !== c.slug) })} />{t(c.label)}</label>)}</div></>);
    case "products": return (<>
      <TextField label={t(f.eyebrow)} value={s.eyebrow} onChange={(v) => up({ eyebrow: v })} />
      <TextField label={t(f.title)} value={s.title} onChange={(v) => up({ title: v })} />
      <div className="grid gap-3 sm:grid-cols-3">
        <Field label={t(f.source)}><Select value={s.source} onChange={(e) => up({ source: e.target.value })}><option value="featured">★ Featured</option><option value="category">Category</option><option value="manual">Manual slugs</option></Select></Field>
        {s.source === "category" && <Field label={t(adm.products.category)}><Select value={s.category ?? ""} onChange={(e) => up({ category: e.target.value })}>{categories.map((c) => <option key={c.slug} value={c.slug}>{t(c.label)}</option>)}</Select></Field>}
        {s.source === "manual" && <Field label="Slugs (comma separated)"><Input value={(s.slugs ?? []).join(", ")} onChange={(e) => up({ slugs: e.target.value.split(",").map((x) => x.trim()).filter(Boolean) })} /></Field>}
        <Field label={t(f.limit)}><Input type="number" value={s.limit ?? 8} onChange={(e) => up({ limit: Number(e.target.value) })} /></Field>
      </div></>);
    case "video": return (<>
      <TextField label={t(f.title)} value={s.title} onChange={(v) => up({ title: v })} />
      <TextField label={t(f.text)} value={s.text} onChange={(v) => up({ text: v })} />
      <Field label={t(f.media)}><MediaPicker value={s.video?.url ? s.video : undefined} onChange={(m) => up({ video: m ?? { kind: "youtube", url: "" } })} accept="video/*" /></Field></>);
    case "brands": return (<><TextField label={t(f.eyebrow)} value={s.eyebrow} onChange={(v) => up({ eyebrow: v })} /><TextField label={t(f.title)} value={s.title} onChange={(v) => up({ title: v })} /></>);
    case "richtext": return (<><TextField label={t(f.title)} value={s.title} onChange={(v) => up({ title: v })} /><TextField label={t(f.body)} value={s.body} onChange={(v) => up({ body: v })} multiline /></>);
    case "news": return <><TextField label={t(f.title)} value={s.title} onChange={(v) => up({ title: v })} /><Field label={t(f.limit)}><Input type="number" value={s.limit ?? 3} onChange={(e) => up({ limit: Number(e.target.value) })} /></Field></>;
  }
}
