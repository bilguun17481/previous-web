"use client";
import { adm } from "@/lib/admin/i18n";
import { FONTS } from "@/lib/fonts";
import { Field, Input, Select, useT } from "@/components/admin/ui";
import { FontLoader } from "@/components/FontLoader";
import type { TextStyle } from "@/lib/types";

/** Colour input that can also be empty (= theme default). */
export function ColorField({ label, value, onChange }: { label: string; value?: string; onChange: (v: string | undefined) => void }) {
  return (
    <Field label={label}>
      <div className="flex items-center gap-2">
        <input type="color" value={value && /^#[0-9a-f]{6}$/i.test(value) ? value : "#000000"} onChange={(e) => onChange(e.target.value)} className="h-9 w-10 cursor-pointer rounded-md border border-hair bg-paper p-0.5" />
        <Input value={value ?? ""} placeholder="—" onChange={(e) => onChange(e.target.value || undefined)} />
        {value && <button type="button" onClick={() => onChange(undefined)} className="text-[12px] text-mute hover:text-ink" title="Reset">×</button>}
      </div>
    </Field>
  );
}

const WEIGHTS = [300, 400, 500, 600, 700, 800, 900];
export function TypographyPanel({ value, onChange, showAlign = true }: { value: TextStyle | undefined; onChange: (v: TextStyle | undefined) => void; showAlign?: boolean }) {
  const { t } = useT();
  const l = adm.pages.ts;
  const v = value ?? {};
  const up = (patch: Partial<TextStyle>) => { const n = { ...v, ...patch }; for (const k of Object.keys(n) as (keyof TextStyle)[]) if (n[k] === undefined || n[k] === null || (n[k] as unknown) === "") delete n[k]; onChange(Object.keys(n).length ? n : undefined); };
  const num = (s: string) => (s === "" ? undefined : Number(s));
  return (
    <div className="space-y-3">
      <FontLoader fonts={FONTS.map((f) => f.name)} />
      <Field label={t(l.font)}>
        <Select value={v.font ?? ""} onChange={(e) => up({ font: e.target.value || undefined })} style={{ fontFamily: FONTS.find((f) => f.name === v.font)?.css }}>
          <option value="">{t(l.inherit)} (Inter)</option>
          {FONTS.map((f) => <option key={f.name} value={f.name} style={{ fontFamily: f.css }}>{f.name} — {f.note}</option>)}
        </Select>
      </Field>
      <div className="grid grid-cols-2 gap-3">
        <Field label={t(l.size)}><Input type="number" min={8} max={240} value={v.size ?? ""} placeholder="—" onChange={(e) => up({ size: num(e.target.value) })} /></Field>
        <Field label={t(l.sizeMobile)}><Input type="number" min={8} max={160} value={v.sizeMobile ?? ""} placeholder="auto" onChange={(e) => up({ sizeMobile: num(e.target.value) })} /></Field>
        <Field label={t(l.weight)}><Select value={v.weight ?? ""} onChange={(e) => up({ weight: num(e.target.value) })}><option value="">—</option>{WEIGHTS.map((w) => <option key={w} value={w}>{w}</option>)}</Select></Field>
        {showAlign && <Field label={t(l.align)}><Select value={v.align ?? ""} onChange={(e) => up({ align: (e.target.value || undefined) as TextStyle["align"] })}><option value="">—</option><option value="left">{t(adm.pages.aligns.left)}</option><option value="center">{t(adm.pages.aligns.center)}</option><option value="right">{t(adm.pages.aligns.right)}</option></Select></Field>}
        <Field label={t(l.tracking)}><Input type="number" step={0.01} min={-0.1} max={0.5} value={v.tracking ?? ""} placeholder="—" onChange={(e) => up({ tracking: num(e.target.value) })} /></Field>
        <Field label={t(l.leading)}><Input type="number" step={0.05} min={0.8} max={2.5} value={v.leading ?? ""} placeholder="—" onChange={(e) => up({ leading: num(e.target.value) })} /></Field>
      </div>
      <ColorField label={t(l.color)} value={v.color} onChange={(c) => up({ color: c })} />
      <div className="flex flex-wrap gap-4 text-[13px]">
        <label className="flex items-center gap-2"><input type="checkbox" className="accent-ink" checked={Boolean(v.upper)} onChange={(e) => up({ upper: e.target.checked || undefined })} />{t(l.upper)}</label>
        <label className="flex items-center gap-2"><input type="checkbox" className="accent-ink" checked={Boolean(v.italic)} onChange={(e) => up({ italic: e.target.checked || undefined })} />{t(l.italic)}</label>
        <label className="flex items-center gap-2"><input type="checkbox" className="accent-ink" checked={Boolean(v.shadow)} onChange={(e) => up({ shadow: e.target.checked || undefined })} />{t(l.shadow)}</label>
      </div>
      {value && <button type="button" onClick={() => onChange(undefined)} className="text-[12px] text-mute underline underline-offset-4 hover:text-ink">{t(l.reset)}</button>}
    </div>
  );
}
