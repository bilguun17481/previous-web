"use client";
import { adm } from "@/lib/admin/i18n";
import { Button, Field, Input, Select, TextField, useT } from "@/components/admin/ui";
import { MediaPicker } from "@/components/admin/MediaPicker";
import { useCategories } from "@/lib/admin/useCategories";
import type { CtaVariant, Section, TextSlot, TextStyle } from "@/lib/types";
import { ColorField, TypographyPanel } from "./Typography";
import { hasMedia, slotsOf } from "./blank";

type Tab = "content" | "look" | "type";
const num = (s: string) => (s === "" ? undefined : Number(s));

export function Inspector({ s, tab, onChange }: { s: Section; tab: Tab; onChange: (patch: Partial<Section>) => void }) {
  if (tab === "content") return <ContentTab s={s} onChange={onChange} />;
  if (tab === "look") return <LookTab s={s} onChange={onChange} />;
  return <TypeTab s={s} onChange={onChange} />;
}

/* ───────── Content ───────── */
function ContentTab({ s, onChange }: { s: Section; onChange: (patch: Partial<Section>) => void }) {
  const { t } = useT(); const categories = useCategories();
  const f = adm.pages.f;
  const up = (patch: Record<string, unknown>) => onChange(patch as Partial<Section>);
  const cta = "cta" in s ? s.cta : undefined;
  const CtaFields = () => (
    <div className="grid gap-3">
      <TextField label={t(f.cta)} value={cta?.label} onChange={(v) => up({ cta: { label: v, href: cta?.href ?? "/" } })} />
      <Field label={t(f.ctaHref)}><Input value={cta?.href ?? ""} placeholder="/ctyrkolky/" onChange={(e) => up({ cta: { label: cta?.label ?? { cs: "", en: "" }, href: e.target.value } })} /></Field>
    </div>
  );
  switch (s.type) {
    case "hero": case "banner": case "split": return (<div className="space-y-4">
      <Field label={t(f.media)}><MediaPicker value={s.media?.url ? s.media : undefined} onChange={(m) => up({ media: m ?? { kind: "image", url: "" } })} /></Field>
      <TextField label={t(f.eyebrow)} value={s.eyebrow} onChange={(v) => up({ eyebrow: v })} />
      <TextField label={t(f.title)} value={s.title} onChange={(v) => up({ title: v })} />
      <TextField label={t(f.text)} value={s.text} onChange={(v) => up({ text: v })} multiline />
      <CtaFields />
      {s.type === "split" && <Field label={t(f.mediaSide)}><Select value={s.mediaSide ?? "left"} onChange={(e) => up({ mediaSide: e.target.value })}><option value="left">{t(adm.pages.aligns.left)}</option><option value="right">{t(adm.pages.aligns.right)}</option></Select></Field>}
    </div>);
    case "categories": return (<div className="space-y-4">
      <TextField label={t(f.eyebrow)} value={s.eyebrow} onChange={(v) => up({ eyebrow: v })} />
      <TextField label={t(f.title)} value={s.title} onChange={(v) => up({ title: v })} />
      <TextField label={t(f.text)} value={s.text} onChange={(v) => up({ text: v })} />
      <div className="flex flex-wrap gap-3">{categories.map((c) => <label key={c.slug} className="flex items-center gap-2 text-[13px]"><input type="checkbox" className="accent-ink" checked={s.categories.includes(c.slug)} onChange={(e) => up({ categories: e.target.checked ? [...s.categories, c.slug] : s.categories.filter((x) => x !== c.slug) })} />{t(c.label)}</label>)}</div>
    </div>);
    case "products": return (<div className="space-y-4">
      <TextField label={t(f.eyebrow)} value={s.eyebrow} onChange={(v) => up({ eyebrow: v })} />
      <TextField label={t(f.title)} value={s.title} onChange={(v) => up({ title: v })} />
      <Field label={t(f.source)}><Select value={s.source} onChange={(e) => up({ source: e.target.value })}><option value="featured">★ Featured</option><option value="category">{t(adm.products.category)}</option><option value="manual">Slugs</option></Select></Field>
      {s.source === "category" && <Field label={t(adm.products.category)}><Select value={s.category ?? ""} onChange={(e) => up({ category: e.target.value })}><option value="">—</option>{categories.map((c) => <option key={c.slug} value={c.slug}>{t(c.label)}</option>)}</Select></Field>}
      {s.source === "manual" && <Field label="Slugs (comma separated)"><Input value={(s.slugs ?? []).join(", ")} onChange={(e) => up({ slugs: e.target.value.split(",").map((x) => x.trim()).filter(Boolean) })} /></Field>}
      <Field label={t(f.limit)}><Input type="number" min={1} max={24} value={s.limit ?? 8} onChange={(e) => up({ limit: Number(e.target.value) })} /></Field>
    </div>);
    case "video": return (<div className="space-y-4">
      <TextField label={t(f.title)} value={s.title} onChange={(v) => up({ title: v })} />
      <TextField label={t(f.text)} value={s.text} onChange={(v) => up({ text: v })} />
      <Field label={t(f.media)}><MediaPicker value={s.video?.url ? s.video : undefined} onChange={(m) => up({ video: m ?? { kind: "youtube", url: "" } })} accept="video/*" /></Field>
    </div>);
    case "brands": return (<div className="space-y-4"><TextField label={t(f.eyebrow)} value={s.eyebrow} onChange={(v) => up({ eyebrow: v })} /><TextField label={t(f.title)} value={s.title} onChange={(v) => up({ title: v })} /></div>);
    case "richtext": return (<div className="space-y-4"><TextField label={t(f.title)} value={s.title} onChange={(v) => up({ title: v })} /><TextField label={t(f.body)} value={s.body} onChange={(v) => up({ body: v })} multiline /></div>);
    case "news": return (<div className="space-y-4"><TextField label={t(f.title)} value={s.title} onChange={(v) => up({ title: v })} /><Field label={t(f.limit)}><Input type="number" min={1} max={3} value={s.limit ?? 3} onChange={(e) => up({ limit: Number(e.target.value) })} /></Field></div>);
    case "spacer": return <Field label={t(f.spacerHeight)}><Input type="number" min={0} max={400} value={s.height ?? 48} onChange={(e) => up({ height: Number(e.target.value) })} /></Field>;
  }
}

/* ───────── Look (layout, colours, placement) ───────── */
function LookTab({ s, onChange }: { s: Section; onChange: (patch: Partial<Section>) => void }) {
  const { t } = useT();
  const p = adm.pages;
  const up = (patch: Record<string, unknown>) => onChange(patch as Partial<Section>);
  const media = hasMedia(s.type);
  const box = s.box;
  const reset = () => onChange({ styles: undefined, bg: undefined, color: undefined, padY: undefined, maxWidth: undefined, box: undefined, ctaVariant: undefined, overlay: undefined, overlayColor: undefined, gap: undefined });
  return (
    <div className="space-y-4">
      {media && (<>
        <div className="grid grid-cols-2 gap-3">
          <Field label={t(p.f.height)}><Select value={("height" in s && s.height) || (s.type === "hero" ? "large" : "medium")} onChange={(e) => up({ height: e.target.value })}>
            <option value="small">{t(p.heights.small)}</option><option value="medium">{t(p.heights.medium)}</option><option value="large">{t(p.heights.large)}</option>{s.type === "hero" && <option value="screen">{t(p.heights.screen)}</option>}
          </Select></Field>
          <Field label={t(p.f.align)}><Select value={("align" in s && s.align) || "left"} onChange={(e) => up({ align: e.target.value })}><option value="left">{t(p.aligns.left)}</option><option value="center">{t(p.aligns.center)}</option><option value="right">{t(p.aligns.right)}</option></Select></Field>
        </div>
        <Field label={t(p.positioning)}>
          <Select value={box ? "free" : "auto"} onChange={(e) => up({ box: e.target.value === "free" ? { x: 5, y: s.type === "hero" ? 50 : 30, w: 45 } : undefined })}><option value="auto">{t(p.posAuto)}</option><option value="free">{t(p.posFree)}</option></Select>
        </Field>
        {box && (<>
          <p className="text-[12px] text-mute">{t(p.posHint)}</p>
          <div className="grid grid-cols-3 gap-3">
            <Field label={t(p.x)}><Input type="number" min={0} max={95} value={Math.round(box.x)} onChange={(e) => up({ box: { ...box, x: Number(e.target.value) } })} /></Field>
            <Field label={t(p.y)}><Input type="number" min={0} max={95} value={Math.round(box.y)} onChange={(e) => up({ box: { ...box, y: Number(e.target.value) } })} /></Field>
            <Field label={t(p.w)}><Input type="number" min={15} max={100} value={Math.round(box.w)} onChange={(e) => up({ box: { ...box, w: Number(e.target.value) } })} /></Field>
          </div>
        </>)}
        <div className="grid grid-cols-2 gap-3">
          <Field label={t(p.f.overlay)}><Input type="range" min={0} max={100} value={s.overlay ?? (s.type === "hero" ? 60 : 70)} onChange={(e) => up({ overlay: Number(e.target.value) })} className="!px-0" /></Field>
          <ColorField label={t(p.overlayColor)} value={s.overlayColor} onChange={(c) => up({ overlayColor: c })} />
        </div>
      </>)}
      {!media && s.type !== "spacer" && (<>
        <div className="grid grid-cols-2 gap-3">
          <ColorField label={t(p.bg)} value={s.bg} onChange={(c) => up({ bg: c })} />
          <ColorField label={t(p.color)} value={s.color} onChange={(c) => up({ color: c })} />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Field label={t(p.padY)}><Input type="number" min={0} max={300} value={s.padY ?? ""} placeholder="64" onChange={(e) => up({ padY: num(e.target.value) })} /></Field>
          {(s.type === "categories" || s.type === "products") && <Field label={t(p.f.columns)}><Select value={s.columns ?? 4} onChange={(e) => up({ columns: Number(e.target.value) })}><option value={2}>2</option><option value={3}>3</option><option value={4}>4</option></Select></Field>}
          {s.type === "split" && <Field label={t(p.f.ratio)}><Select value={s.ratio ?? "4/3"} onChange={(e) => up({ ratio: e.target.value })}><option value="4/3">4:3</option><option value="1/1">1:1</option><option value="3/4">3:4</option><option value="16/9">16:9</option></Select></Field>}
          {s.type === "richtext" && <Field label={t(p.f.align)}><Select value={s.align ?? "left"} onChange={(e) => up({ align: e.target.value })}><option value="left">{t(p.aligns.left)}</option><option value="center">{t(p.aligns.center)}</option></Select></Field>}
        </div>
      </>)}
      {s.type === "spacer" && <ColorField label={t(p.bg)} value={s.bg} onChange={(c) => up({ bg: c })} />}
      {slotsOf(s.type).length > 0 && (
        <div className="grid grid-cols-2 gap-3">
          <Field label={t(p.maxWidth)}><Input type="number" min={200} max={1400} value={s.maxWidth ?? ""} placeholder="auto" onChange={(e) => up({ maxWidth: num(e.target.value) })} /></Field>
          <Field label={t(p.gap)}><Input type="number" min={0} max={80} value={s.gap ?? ""} placeholder="16" onChange={(e) => up({ gap: num(e.target.value) })} /></Field>
        </div>
      )}
      {"cta" in s && s.cta && <Field label={t(p.ctaVariant)}><Select value={s.ctaVariant ?? ""} onChange={(e) => up({ ctaVariant: (e.target.value || undefined) as CtaVariant })}><option value="">—</option>{(Object.keys(p.cta) as CtaVariant[]).map((k) => <option key={k} value={k}>{t(p.cta[k])}</option>)}</Select></Field>}
      <Button variant="secondary" onClick={reset} className="w-full">{t(p.reset)}</Button>
    </div>
  );
}

/* ───────── Type (typography per slot) ───────── */
function TypeTab({ s, onChange }: { s: Section; onChange: (patch: Partial<Section>) => void }) {
  const { t } = useT();
  const slots = slotsOf(s.type);
  const styles = s.styles ?? {};
  const set = (slot: TextSlot, v: TextStyle | undefined) => { const n = { ...styles }; if (v) n[slot] = v; else delete n[slot]; onChange({ styles: Object.keys(n).length ? n : undefined }); };
  const applyFontAll = (font: string) => { const n = { ...styles }; for (const sl of slots) n[sl] = { ...(n[sl] ?? {}), font }; onChange({ styles: n }); };
  const firstFont = slots.map((sl) => styles[sl]?.font).find(Boolean);
  if (!slots.length) return <p className="text-[13px] text-mute">—</p>;
  return (
    <div className="space-y-3">
      {slots.map((slot) => <details key={slot} open={slot === "title"} className="rounded-md border border-hair">
        <summary className="cursor-pointer select-none px-3 py-2 text-[13px] font-medium">{t(adm.pages.slots[slot])}{styles[slot] ? <span className="ml-2 rounded bg-sky-50 px-1.5 py-0.5 text-[10px] font-semibold text-sky-700">✎</span> : null}</summary>
        <div className="border-t border-hair p-3"><TypographyPanel value={styles[slot]} onChange={(v) => set(slot, v)} showAlign={slot !== "cta"} /></div>
      </details>)}
      {firstFont && <Button variant="secondary" className="w-full" onClick={() => applyFontAll(firstFont)}>{t(adm.pages.fontAll)}: {firstFont}</Button>}
    </div>
  );
}
