"use client";
import { useState } from "react";
import { adm } from "@/lib/admin/i18n";
import { repo, type CategoryRow } from "@/lib/admin/repo";
import { Button, Card, Field, Input, LinkButton, PageHeader, Select, TextField, useAsync, useT, useToast } from "@/components/admin/ui";
import { MediaPicker } from "@/components/admin/MediaPicker";
import { refreshStorefront } from "@/lib/admin/revalidate";

const slugify = (s: string) => s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

export default function Categories() {
  const { t } = useT(); const toast = useToast(); const c9 = adm.categories;
  const { data, setData, reload } = useAsync(() => repo().categories.list());
  const { data: products } = useAsync(() => repo().products.list());
  const [draft, setDraft] = useState<{ slug: string; cs: string; en: string } | null>(null);
  const [deleting, setDeleting] = useState<{ slug: string; target: string } | null>(null);
  const list = data ?? [];
  const countIn = (slug: string) => (products ?? []).filter((p) => p.category === slug).length;
  const set = (i: number, c: CategoryRow) => setData(list.map((x, k) => (k === i ? c : x)));
  const save = async (c: CategoryRow) => { try { await repo().categories.save(c); await refreshStorefront(["/", `/${c.slug}/`]); toast(t(adm.common.saved)); } catch (e) { toast((e as Error).message, "err"); } };
  const create = async () => {
    if (!draft) return; const slug = slugify(draft.slug || draft.cs); if (!slug) return;
    if (list.some((c) => c.slug === slug)) { toast(t(c9.exists), "err"); return; }
    await repo().categories.save({ slug, label: { cs: draft.cs || slug, en: draft.en || draft.cs || slug }, blurb: { cs: "", en: "" }, image_url: null, video_url: null, sort: list.length });
    await refreshStorefront(["/"]); setDraft(null); toast(t(adm.common.saved)); reload();
  };
  const move = async (i: number, d: -1 | 1) => {
    const j = i + d; if (j < 0 || j >= list.length) return;
    const a = [...list]; [a[i], a[j]] = [a[j], a[i]];
    const renumbered = a.map((c, k) => ({ ...c, sort: k })); setData(renumbered);
    for (const c of renumbered) if (c.sort !== list.find((x) => x.slug === c.slug)?.sort) await repo().categories.save(c);
    await refreshStorefront(["/"]);
  };
  const remove = async () => {
    if (!deleting) return; const n = countIn(deleting.slug);
    if (n > 0 && !deleting.target) { toast(t(c9.pickTarget), "err"); return; }
    if (!confirm(t(adm.common.confirmDelete))) return;
    try {
      for (const p of (products ?? []).filter((p) => p.category === deleting.slug)) await repo().products.save({ ...p, category: deleting.target });
      await repo().categories.remove(deleting.slug);
      await refreshStorefront(["/", `/${deleting.slug}/`]); setDeleting(null); toast(t(adm.common.saved)); reload();
    } catch (e) { toast((e as Error).message, "err"); }
  };
  return (
    <>
      <PageHeader title={t(c9.title)} sub={t(c9.bannerHint)} actions={<Button onClick={() => setDraft({ slug: "", cs: "", en: "" })}>{t(c9.new)}</Button>} />
      {draft && (
        <Card title={t(c9.new)} actions={<div className="flex gap-2"><Button variant="secondary" onClick={() => setDraft(null)}>{t(adm.common.cancel)}</Button><Button onClick={create} disabled={!draft.cs && !draft.slug}>{t(adm.common.save)}</Button></div>} className="mb-4">
          <div className="grid gap-3 sm:grid-cols-3">
            <Field label={t(c9.nameCs)}><Input value={draft.cs} onChange={(e) => setDraft({ ...draft, cs: e.target.value, slug: draft.slug || slugify(e.target.value) })} /></Field>
            <Field label={t(c9.nameEn)}><Input value={draft.en} onChange={(e) => setDraft({ ...draft, en: e.target.value })} /></Field>
            <Field label={t(c9.slug)} hint={`/${slugify(draft.slug || draft.cs) || "…"}/`}><Input value={draft.slug} onChange={(e) => setDraft({ ...draft, slug: slugify(e.target.value) })} /></Field>
          </div>
        </Card>
      )}
      <div className="grid gap-4 lg:grid-cols-2">
        {list.map((c, i) => (
          <Card key={c.slug} title={`/${c.slug}/ · ${countIn(c.slug)} ${t(c9.products)}`} actions={<div className="flex items-center gap-1">
            <Button variant="ghost" onClick={() => move(i, -1)} disabled={i === 0} aria-label={t(adm.pages.up)}>↑</Button>
            <Button variant="ghost" onClick={() => move(i, 1)} disabled={i === list.length - 1} aria-label={t(adm.pages.down)}>↓</Button>
            <LinkButton href={`/admin/content/categories/${c.slug}/`} variant="secondary">{t(c9.editBanner)}</LinkButton>
            <Button onClick={() => save(c)}>{t(adm.common.save)}</Button>
          </div>}>
            <div className="space-y-3">
              <TextField label={t(adm.common.name)} value={c.label} onChange={(v) => set(i, { ...c, label: v })} />
              <TextField label={t(c9.blurb)} value={c.blurb} onChange={(v) => set(i, { ...c, blurb: v })} multiline />
              <Field label={t(c9.hero)}><MediaPicker value={c.video_url ? { kind: "video", url: c.video_url } : c.image_url ? { kind: "image", url: c.image_url } : undefined} onChange={(m) => set(i, { ...c, image_url: m?.kind === "image" ? m.url : null, video_url: m && m.kind !== "image" ? m.url : null })} /></Field>
              {deleting?.slug === c.slug ? (
                <div className="flex flex-wrap items-end gap-3 rounded-md border border-signal/40 bg-red-50 p-3 text-[13px]">
                  {countIn(c.slug) > 0 && <Field label={t(c9.moveTo)} className="min-w-[220px]"><Select value={deleting.target} onChange={(e) => setDeleting({ ...deleting, target: e.target.value })}><option value="">—</option>{list.filter((x) => x.slug !== c.slug).map((x) => <option key={x.slug} value={x.slug}>{t(x.label)}</option>)}</Select></Field>}
                  <Button variant="danger" onClick={remove}>{t(adm.common.delete)}</Button>
                  <Button variant="ghost" onClick={() => setDeleting(null)}>{t(adm.common.cancel)}</Button>
                </div>
              ) : <button type="button" onClick={() => setDeleting({ slug: c.slug, target: "" })} className="text-[12px] text-mute underline underline-offset-4 hover:text-signal">{t(c9.deleteCat)}</button>}
            </div>
          </Card>
        ))}
      </div>
    </>
  );
}
