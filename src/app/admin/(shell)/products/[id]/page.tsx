"use client";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { adm } from "@/lib/admin/i18n";
import { repo } from "@/lib/admin/repo";
import { Button, Card, Field, Input, PageHeader, Select, TextField, Toggle, useT, useToast } from "@/components/admin/ui";
import { brands, categories } from "@/data/catalog";
import { refreshStorefront } from "@/lib/admin/revalidate";
import { Video } from "@/components/Media";
import type { ShopProduct } from "@/lib/types";

const blank: ShopProduct = { slug: "", brand: "CFMOTO", category: "ctyrkolky", name: "", price: 0, homologation: "—", art: "gear", short: { cs: "", en: "" }, description: { cs: "", en: "" }, specs: [], colors: ["#1f1f1f"], tags: [], status: "draft", stock: 0, sku: "", images: [], videos: [], featured: false };
const slugify = (s: string) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

export default function ProductEditor() {
  const { t } = useT();
  const toast = useToast();
  const router = useRouter();
  const { id } = useParams<{ id: string }>();
  const isNew = id === "new";
  const [p, setP] = useState<ShopProduct | null>(isNew ? blank : null);
  const [busy, setBusy] = useState(false);
  const [pct, setPct] = useState<number | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLInputElement>(null);
  const drag = useRef<number | null>(null);
  useEffect(() => { if (!isNew) repo().products.get(id).then((x) => setP(x ?? blank)); }, [id, isNew]);
  if (!p) return <p className="text-mute">{t(adm.common.loading)}</p>;
  const set = (patch: Partial<ShopProduct>) => setP({ ...p, ...patch });

  const save = async (status?: ShopProduct["status"]) => {
    setBusy(true);
    try {
      const slug = p.slug || slugify(`${p.brand} ${p.name}`);
      const newId = await repo().products.save({ ...p, slug, status: status ?? p.status });
      await refreshStorefront(["/", `/${p.category}/`, `/produkt/${slug}/`]);
      toast(t(adm.common.saved));
      if (isNew) router.replace(`/admin/products/${newId}/`); else setP({ ...p, slug, status: status ?? p.status });
    } catch (e) { toast((e as Error).message, "err"); }
    setBusy(false);
  };
  const remove = async () => { if (!confirm(t(adm.common.confirmDelete))) return; await repo().products.remove(p.id!); await refreshStorefront(["/", `/${p.category}/`]); router.push("/admin/products/"); };
  const uploadImages = async (files: FileList) => {
    const imgs = [...(p.images ?? [])];
    for (const f of Array.from(files)) { try { const m = await repo().media.upload(f, setPct); imgs.push({ url: m.url, alt: p.name }); } catch (e) { toast((e as Error).message, "err"); } }
    set({ images: imgs }); setPct(null);
  };
  const uploadVideo = async (f: File) => { try { const m = await repo().media.upload(f, setPct); set({ videos: [...(p.videos ?? []), { kind: "upload", url: m.url, title: f.name }] }); } catch (e) { toast((e as Error).message, "err"); } setPct(null); };
  const reorder = (from: number, to: number) => { const imgs = [...(p.images ?? [])]; const [m] = imgs.splice(from, 1); imgs.splice(to, 0, m); set({ images: imgs }); };
  const tags = ["new", "sale", "demo"] as const;

  return (
    <>
      <PageHeader title={isNew ? t(adm.products.new) : p.name || "…"} back={{ href: "/admin/products/", label: t(adm.products.title) }}
        actions={<>{!isNew && <a href={`/produkt/${p.slug}/`} target="_blank" className="inline-flex h-9 items-center rounded-md border border-hair px-3.5 text-[13px] hover:bg-tile">{t(adm.products.view)}</a>}
          {!isNew && <Button variant="danger" onClick={remove}>{t(adm.common.delete)}</Button>}
          {p.status !== "active" && <Button variant="secondary" disabled={busy} onClick={() => save("active")}>{t(adm.products.statusActive)}</Button>}
          <Button disabled={busy} onClick={() => save()}>{t(adm.common.save)}</Button></>} />
      <div className="grid gap-4 lg:grid-cols-[2fr_1fr]">
        <div className="space-y-4">
          <Card title={t(adm.products.basics)}>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label={t(adm.common.name)} className="sm:col-span-2"><Input value={p.name} onChange={(e) => set({ name: e.target.value, slug: isNew ? slugify(`${p.brand} ${e.target.value}`) : p.slug })} /></Field>
              <Field label={t(adm.products.brand)}><Select value={p.brand} onChange={(e) => set({ brand: e.target.value })}>{brands.map((b) => <option key={b}>{b}</option>)}<option value="Jiná">Jiná / Other</option></Select></Field>
              <Field label={t(adm.products.category)}><Select value={p.category} onChange={(e) => set({ category: e.target.value as ShopProduct["category"] })}>{categories.map((c) => <option key={c.slug} value={c.slug}>{t(c.label)}</option>)}</Select></Field>
              <Field label={t(adm.products.slug)} className="sm:col-span-2"><Input value={p.slug} onChange={(e) => set({ slug: slugify(e.target.value) })} /></Field>
              <Field label={t(adm.common.price) + " (Kč)"}><Input type="number" value={p.price} onChange={(e) => set({ price: Number(e.target.value) })} /></Field>
              <Field label={t(adm.products.oldPrice)}><Input type="number" value={p.oldPrice ?? ""} onChange={(e) => set({ oldPrice: e.target.value ? Number(e.target.value) : undefined })} /></Field>
              <Field label={t(adm.products.homologation)}><Select value={p.homologation} onChange={(e) => set({ homologation: e.target.value as ShopProduct["homologation"] })}>{["—", "T3b", "L7e", "L3e", "L1e"].map((h) => <option key={h}>{h}</option>)}</Select></Field>
              <Field label={t(adm.products.cc)}><Input type="number" value={p.cc ?? ""} onChange={(e) => set({ cc: e.target.value ? Number(e.target.value) : undefined })} /></Field>
              <Field label={t(adm.products.power)}><Input value={p.power ?? ""} onChange={(e) => set({ power: e.target.value })} placeholder="27 kW / 37 k" /></Field>
              <Field label={t(adm.products.drive)}><Input value={p.drive ?? ""} onChange={(e) => set({ drive: e.target.value })} placeholder="4x4" /></Field>
            </div>
            <div className="mt-4 space-y-4">
              <TextField label={t(adm.products.short)} value={p.short} onChange={(v) => set({ short: v })} multiline />
              <TextField label={t(adm.products.description)} value={p.description} onChange={(v) => set({ description: v })} multiline />
            </div>
          </Card>
          <Card title={t(adm.products.images)}>
            <p className="mb-3 text-[12px] text-mute">{t(adm.products.dragHint)}</p>
            <div className="grid grid-cols-3 gap-3 sm:grid-cols-5">
              {(p.images ?? []).map((img, i) => (
                <div key={img.url + i} draggable onDragStart={() => (drag.current = i)} onDragOver={(e) => e.preventDefault()} onDrop={() => { if (drag.current !== null && drag.current !== i) reorder(drag.current, i); drag.current = null; }} className={`group relative aspect-square cursor-move overflow-hidden rounded-md border ${i === 0 ? "border-ink" : "border-hair"}`}>
                  <img src={img.url} alt="" className="h-full w-full object-cover" />
                  <button type="button" onClick={() => set({ images: p.images!.filter((_, k) => k !== i) })} className="absolute right-1 top-1 hidden h-6 w-6 items-center justify-center rounded-full bg-paper text-[12px] shadow group-hover:flex">×</button>
                  {i === 0 && <span className="absolute bottom-1 left-1 rounded bg-ink px-1.5 py-0.5 text-[10px] text-paper">Main</span>}
                </div>
              ))}
              <button type="button" onClick={() => fileRef.current?.click()} className="flex aspect-square flex-col items-center justify-center rounded-md border border-dashed border-neutral-300 text-[12px] text-mute hover:border-ink hover:text-ink">{pct !== null ? `${pct}%` : "+ " + t(adm.common.upload)}</button>
              <input ref={fileRef} type="file" accept="image/*" multiple className="hidden" onChange={(e) => e.target.files && uploadImages(e.target.files)} />
            </div>
          </Card>
          <Card title={t(adm.products.videos)}>
            <div className="space-y-3">
              {(p.videos ?? []).map((v, i) => (
                <div key={v.url + i} className="flex items-center gap-3 rounded-md border border-hair p-2">
                  <div className="h-16 w-28 shrink-0 overflow-hidden bg-ink"><Video video={v} className="h-full w-full" /></div>
                  <Input value={v.title ?? ""} placeholder="Title" onChange={(e) => set({ videos: p.videos!.map((x, k) => (k === i ? { ...x, title: e.target.value } : x)) })} />
                  <span className="shrink-0 rounded bg-tile px-1.5 py-0.5 text-[10px] uppercase">{v.kind}</span>
                  <Button type="button" variant="ghost" onClick={() => set({ videos: p.videos!.filter((_, k) => k !== i) })}>×</Button>
                </div>
              ))}
              <div className="flex flex-wrap gap-2">
                <Input className="max-w-sm" placeholder={t(adm.products.addVideoUrl)} onKeyDown={(e) => { if (e.key === "Enter") { const u = (e.target as HTMLInputElement).value.trim(); if (u) { set({ videos: [...(p.videos ?? []), { kind: /vimeo/.test(u) ? "vimeo" : "youtube", url: u }] }); (e.target as HTMLInputElement).value = ""; } e.preventDefault(); } }} />
                <Button type="button" variant="secondary" onClick={() => videoRef.current?.click()}>{pct !== null ? `${pct}%` : t(adm.products.uploadVideo)}</Button>
                <input ref={videoRef} type="file" accept="video/mp4,video/webm" className="hidden" onChange={(e) => e.target.files?.[0] && uploadVideo(e.target.files[0])} />
              </div>
            </div>
          </Card>
          <Card title={t(adm.products.specs)}>
            <div className="space-y-2">
              {p.specs.map((s, i) => (
                <div key={i} className="grid grid-cols-[1fr_1fr_2fr_auto] gap-2">
                  <Input placeholder="Label CZ" value={s.label.cs} onChange={(e) => set({ specs: p.specs.map((x, k) => (k === i ? { ...x, label: { ...x.label, cs: e.target.value } } : x)) })} />
                  <Input placeholder="Label EN" value={s.label.en} onChange={(e) => set({ specs: p.specs.map((x, k) => (k === i ? { ...x, label: { ...x.label, en: e.target.value } } : x)) })} />
                  <Input placeholder="Value" value={s.value} onChange={(e) => set({ specs: p.specs.map((x, k) => (k === i ? { ...x, value: e.target.value } : x)) })} />
                  <Button type="button" variant="ghost" onClick={() => set({ specs: p.specs.filter((_, k) => k !== i) })}>×</Button>
                </div>
              ))}
              <Button type="button" variant="secondary" onClick={() => set({ specs: [...p.specs, { label: { cs: "", en: "" }, value: "" }] })}>{t(adm.products.addSpec)}</Button>
            </div>
          </Card>
        </div>
        <div className="space-y-4">
          <Card title={t(adm.common.status)}>
            <Select value={p.status} onChange={(e) => set({ status: e.target.value as ShopProduct["status"] })}><option value="draft">{t(adm.products.statusDraft)}</option><option value="active">{t(adm.products.statusActive)}</option><option value="archived">{t(adm.products.statusArchived)}</option></Select>
            <div className="mt-3"><Toggle checked={Boolean(p.featured)} onChange={(v) => set({ featured: v })} label={t(adm.products.featured)} /></div>
          </Card>
          <Card title={t(adm.products.inventory)}>
            <div className="grid gap-3"><Field label={t(adm.common.stock)}><Input type="number" value={p.stock ?? 0} onChange={(e) => set({ stock: Number(e.target.value) })} /></Field><Field label={t(adm.products.sku)}><Input value={p.sku ?? ""} onChange={(e) => set({ sku: e.target.value })} /></Field></div>
          </Card>
          <Card title={t(adm.products.tags)}>
            <div className="flex flex-wrap gap-3">{tags.map((tag) => <label key={tag} className="flex items-center gap-2 text-[13px]"><input type="checkbox" className="accent-ink" checked={p.tags?.includes(tag)} onChange={(e) => set({ tags: e.target.checked ? [...(p.tags ?? []), tag] : (p.tags ?? []).filter((x) => x !== tag) })} />{tag}</label>)}</div>
          </Card>
          <Card title={t(adm.products.colors)}>
            <div className="flex flex-wrap items-center gap-2">
              {p.colors.map((c, i) => <span key={i} className="group relative"><input type="color" value={c} onChange={(e) => set({ colors: p.colors.map((x, k) => (k === i ? e.target.value : x)) })} className="h-8 w-8 cursor-pointer rounded-full border border-hair" /><button type="button" onClick={() => set({ colors: p.colors.filter((_, k) => k !== i) })} className="absolute -right-1 -top-1 hidden h-4 w-4 rounded-full bg-ink text-[9px] text-paper group-hover:block">×</button></span>)}
              <Button type="button" variant="secondary" onClick={() => set({ colors: [...p.colors, "#c9c9c9"] })}>+</Button>
            </div>
          </Card>
          <Card title={t(adm.products.seo)}>
            <div className="space-y-3"><Field label={t(adm.products.seoTitle)}><Input defaultValue={p.name} /></Field><Field label={t(adm.products.seoDesc)}><Input defaultValue={p.short.cs} /></Field></div>
          </Card>
        </div>
      </div>
    </>
  );
}
