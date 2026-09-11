"use client";
import { useRef, useState } from "react";
import { adm } from "@/lib/admin/i18n";
import { repo } from "@/lib/admin/repo";
import { Button, Card, PageHeader, Select, Table, Td, useAsync, useT, useToast } from "@/components/admin/ui";
import { Video } from "@/components/Media";
import { bestMatch, fileLabel } from "@/lib/admin/match";
import { refreshStorefront } from "@/lib/admin/revalidate";
import type { MediaItem, ShopProduct } from "@/lib/types";

export default function Media() {
  const { t } = useT();
  const toast = useToast();
  const { data, reload } = useAsync(() => repo().media.list());
  const [filter, setFilter] = useState(""); const [pct, setPct] = useState<number | null>(null); const [over, setOver] = useState(false);
  const [assign, setAssign] = useState<{ item: MediaItem; slug: string | ""; sure: boolean }[] | null>(null);
  const [products, setProducts] = useState<ShopProduct[]>([]);
  const [applying, setApplying] = useState(false);
  const startAssign = async () => {
    const ps = await repo().products.list(); setProducts(ps);
    const rows = (data ?? []).filter((m) => m.kind === "image").map((item) => {
      const already = ps.find((p) => p.images?.some((i) => i.url === item.url));
      const m = already ? { p: already, s: 1 } : bestMatch(fileLabel(item.path), ps);
      return { item, slug: m ? m.p.slug : "", sure: Boolean(m && m.s >= 0.75) };
    });
    setAssign(rows);
  };
  const applyAssign = async () => {
    if (!assign) return; setApplying(true);
    const bySlug = new Map<string, MediaItem[]>();
    assign.filter((r) => r.slug).forEach((r) => bySlug.set(r.slug, [...(bySlug.get(r.slug) ?? []), r.item]));
    let n = 0;
    for (const [slug, items] of bySlug) {
      const p = products.find((x) => x.slug === slug); if (!p) continue;
      const existing = p.images ?? [];
      const add = items.sort((a, b) => a.path.localeCompare(b.path, undefined, { numeric: true })).filter((i) => !existing.some((e) => e.url === i.url)).map((i) => ({ url: i.url, alt: p.name }));
      if (!add.length) continue;
      await repo().products.save({ ...p, images: [...existing, ...add] }); n += add.length;
    }
    await refreshStorefront(["/", "/ctyrkolky/", "/utv/", "/motocykly/", "/skutry/", "/prislusenstvi/"]);
    toast(`${t(adm.common.saved)} · ${n}`); setApplying(false); setAssign(null);
  };
  const input = useRef<HTMLInputElement>(null);
  const folderInput = useRef<HTMLInputElement>(null);
  const [progress, setProgress] = useState<string | null>(null);
  const isMedia = (f: File) => /^(image|video)\//.test(f.type) || /\.(jpe?g|png|webp|gif|avif|mp4|webm|mov)$/i.test(f.name);
  const upload = async (files: File[]) => {
    const list = files.filter(isMedia);
    if (!list.length) { toast(t(adm.media.nothing), "err"); return; }
    let done = 0, failed = 0;
    for (const f of list) {
      setProgress(`${done + 1} / ${list.length} · ${f.name}`);
      try { await repo().media.upload(f, setPct); done++; } catch (e) { failed++; toast(`${f.name}: ${(e as Error).message}`, "err"); }
    }
    setPct(null); setProgress(null); toast(`${done} ${t(adm.media.uploaded)}${failed ? ` · ${failed} ${t(adm.media.failed)}` : ""}`); reload();
  };
  /** Expand dropped items, including folders and subfolders, into files. */
  const collect = async (dt: DataTransfer): Promise<File[]> => {
    const entries = Array.from(dt.items ?? []).map((i) => (i as DataTransferItem & { webkitGetAsEntry?: () => FileSystemEntry | null }).webkitGetAsEntry?.()).filter(Boolean) as FileSystemEntry[];
    if (!entries.length) return Array.from(dt.files ?? []);
    const out: File[] = [];
    const walk = async (e: FileSystemEntry): Promise<void> => {
      if (e.isFile) { await new Promise<void>((res) => (e as FileSystemFileEntry).file((f) => { out.push(f); res(); }, () => res())); return; }
      if (e.isDirectory) {
        const reader = (e as FileSystemDirectoryEntry).createReader();
        for (;;) { const batch = await new Promise<FileSystemEntry[]>((res) => reader.readEntries(res, () => res([]))); if (!batch.length) break; for (const c of batch) await walk(c); }
      }
    };
    for (const e of entries) await walk(e);
    return out;
  };
  const list = (data ?? []).filter((m) => !filter || m.kind === filter);
  const fmt = (n: number | null) => (n == null ? "" : n > 1e6 ? `${(n / 1e6).toFixed(1)} MB` : `${Math.round(n / 1e3)} kB`);
  return (
    <>
      <PageHeader title={t(adm.media.title)} sub={`${list.length}`} actions={<><Button variant="secondary" onClick={startAssign} disabled={!data?.length}>{t(adm.media.assign)}</Button><Select value={filter} onChange={(e) => setFilter(e.target.value)} className="w-36!"><option value="">{t(adm.media.filter)}: {t(adm.common.all)}</option><option value="image">{t(adm.media.images)}</option><option value="video">{t(adm.media.videos)}</option></Select></>} />
      {assign && (
        <Card className="mb-6" title={t(adm.media.assignTitle)} actions={<div className="flex gap-2"><Button variant="secondary" onClick={() => setAssign(null)}>{t(adm.common.cancel)}</Button><Button disabled={applying} onClick={applyAssign}>{t(adm.media.apply)} ({assign.filter((r) => r.slug).length})</Button></div>}>
          <p className="mb-3 text-[12px] text-mute">{t(adm.media.assignHint)}</p>
          <Table head={["", t(adm.media.file), t(adm.products.title), ""]}>
            {assign.map((r, i) => (
              <tr key={r.item.id} className={r.slug ? "" : "bg-amber-50/50"}>
                <Td><img src={r.item.url} alt="" className="h-10 w-10 rounded object-cover" /></Td>
                <Td className="font-mono text-[12px]">{r.item.path.split("/").pop()}</Td>
                <Td><Select value={r.slug} onChange={(e) => setAssign(assign.map((x, k) => (k === i ? { ...x, slug: e.target.value, sure: true } : x)))} className="max-w-md"><option value="">— {t(adm.media.skip)} —</option>{products.map((p) => <option key={p.slug} value={p.slug}>{p.brand} · {p.name}</option>)}</Select></Td>
                <Td className="text-[11px] text-mute">{r.slug ? (r.sure ? "" : t(adm.media.unsure)) : t(adm.media.noMatch)}</Td>
              </tr>
            ))}
          </Table>
        </Card>
      )}
      <div onDragOver={(e) => { e.preventDefault(); setOver(true); }} onDragLeave={() => setOver(false)} onDrop={async (e) => { e.preventDefault(); setOver(false); upload(await collect(e.dataTransfer)); }} onClick={() => input.current?.click()}
        className={`mb-6 flex h-28 cursor-pointer items-center justify-center rounded-lg border-2 border-dashed text-[13px] ${over ? "border-ink bg-tile" : "border-neutral-300 text-mute hover:border-ink"}`}>
        {progress ?? t(adm.media.drop)}
        <input ref={input} type="file" multiple accept="image/*,video/*" className="hidden" onChange={(e) => upload(Array.from(e.target.files ?? []))} />
        <input ref={folderInput} type="file" multiple className="hidden" {...({ webkitdirectory: "" } as Record<string, string>)} onChange={(e) => upload(Array.from(e.target.files ?? []))} />
      </div>
      <div className="-mt-4 mb-6 flex gap-2"><Button variant="secondary" onClick={() => input.current?.click()}>{t(adm.media.chooseFiles)}</Button><Button variant="secondary" onClick={() => folderInput.current?.click()}>{t(adm.media.chooseFolder)}</Button></div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 xl:grid-cols-6">
        {list.map((m) => (
          <div key={m.id} className="group overflow-hidden rounded-lg border border-hair bg-paper">
            <div className="aspect-square bg-tile">{m.kind === "image" ? <img src={m.url} alt="" className="h-full w-full object-cover" /> : <Video video={{ kind: "upload", url: m.url }} className="h-full w-full object-cover" />}</div>
            <div className="p-2 text-[11px]"><div className="truncate font-medium">{m.path.split("/").pop()}</div><div className="text-mute">{m.kind} · {fmt(m.size)}</div>
              <div className="mt-1.5 flex gap-1"><Button variant="secondary" className="!h-7 !px-2 text-[11px]" onClick={() => { navigator.clipboard.writeText(m.url); toast(t(adm.media.copied)); }}>{t(adm.media.copy)}</Button><Button variant="ghost" className="!h-7 !px-2 text-[11px]" onClick={async () => { if (confirm(t(adm.common.confirmDelete))) { await repo().media.remove(m); reload(); } }}>{t(adm.common.delete)}</Button></div>
            </div>
          </div>
        ))}
        {!list.length && <p className="col-span-full text-[13px] text-mute">{t(adm.common.empty)}</p>}
      </div>
    </>
  );
}
