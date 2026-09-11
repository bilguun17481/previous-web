"use client";
import { useMemo, useRef, useState } from "react";
import { adm } from "@/lib/admin/i18n";
import { repo } from "@/lib/admin/repo";
import { Button, Card, Input, PageHeader, Select, Table, Td, useAsync, useT, useToast } from "@/components/admin/ui";
import { Video } from "@/components/Media";
import { bestMatch, fileLabel, folderOf } from "@/lib/admin/match";
import { refreshStorefront } from "@/lib/admin/revalidate";
import type { MediaItem, ShopProduct } from "@/lib/types";
import { variant } from "@/lib/mediaVariants";
import { memo } from "react";

type Picked = { file: File; folder: string };

/** One tile. Memoised so that selecting a photo repaints only that tile, not the whole grid. */
const MediaCard = memo(function MediaCard({ m, on, used, toggle, copy, labels, size }: { m: MediaItem; on: boolean; used?: string[]; toggle: (id: string) => void; copy: () => void; labels: { usedBy: string; unused: string; copy: string }; size: string }) {
  return (
    <div onClick={() => toggle(m.id)} className={`group relative cursor-pointer overflow-hidden rounded-lg border bg-paper ${on ? "border-ink ring-2 ring-ink" : "border-hair hover:border-neutral-400"}`}>
      <input type="checkbox" checked={on} onChange={() => toggle(m.id)} onClick={(e) => e.stopPropagation()} className="absolute left-2 top-2 z-10 h-4 w-4 accent-ink" />
      <div className="aspect-square bg-tile">{m.kind === "image" ? <img src={variant(m.url, "thumb")} alt="" className="h-full w-full object-cover" loading="lazy" decoding="async" onError={(e) => { if (e.currentTarget.src !== m.url) e.currentTarget.src = m.url; }} /> : <Video video={{ kind: "upload", url: m.url }} className="h-full w-full object-cover" />}</div>
      <div className="p-2 text-[11px]">
        <div className="truncate font-medium">{m.path.split("/").pop()}</div>
        <div className="truncate text-mute">{used ? `${labels.usedBy}: ${used.join(", ")}` : `${labels.unused} · ${size}`}</div>
        <div className="mt-1 hidden gap-1 group-hover:flex"><Button variant="secondary" className="!h-6 !px-2 text-[11px]" onClick={(e) => { e.stopPropagation(); copy(); }}>{labels.copy}</Button></div>
      </div>
    </div>
  );
});
const STORE_PATHS = ["/", "/ctyrkolky/", "/utv/", "/motocykly/", "/skutry/", "/prislusenstvi/"];

export default function Media() {
  const { t } = useT();
  const toast = useToast();
  const { data, reload } = useAsync(async () => {
    const [media, products, extra] = await Promise.all([repo().media.list(), repo().products.list(), repo().media.listFolders()]);
    return { media, products, extra };
  });
  const media = data?.media ?? [], products = data?.products ?? [];
  const [folder, setFolder] = useState<string | null>(null); // null = all, "" = no folder
  const [sel, setSel] = useState<Set<string>>(new Set());
  const [pct, setPct] = useState<number | null>(null); const [progress, setProgress] = useState<string | null>(null); const [over, setOver] = useState(false);
  const [busy, setBusy] = useState(false);
  const [assignTo, setAssignTo] = useState(""); const [moveTo, setMoveTo] = useState("");
  const [renaming, setRenaming] = useState<string | null>(null); const [renameVal, setRenameVal] = useState("");
  const [newFolder, setNewFolder] = useState<string | null>(null);
  const [review, setReview] = useState<{ item: MediaItem; slug: string; sure: boolean }[] | null>(null);
  const input = useRef<HTMLInputElement>(null); const folderInput = useRef<HTMLInputElement>(null);

  const folders = useMemo(() => Array.from(new Set([...(data?.extra ?? []), ...media.map((m) => folderOf(m.path)).filter(Boolean)])).sort(), [data, media]);
  const usedBy = useMemo(() => { const m = new Map<string, string[]>(); products.forEach((p) => p.images?.forEach((i) => m.set(i.url, [...(m.get(i.url) ?? []), p.name]))); return m; }, [products]);
  const list = media.filter((m) => folder === null || folderOf(m.path) === folder);
  const groups = Array.from(list.reduce<Map<string, MediaItem[]>>((g, m) => { const k = folderOf(m.path); g.set(k, [...(g.get(k) ?? []), m]); return g; }, new Map()));
  const selected = media.filter((m) => sel.has(m.id));
  const fmt = (n: number | null) => (n == null ? "" : n > 1e6 ? `${(n / 1e6).toFixed(1)} MB` : `${Math.round(n / 1e3)} kB`);

  /* ── upload ── */
  const isMedia = (f: File) => /^(image|video)\//.test(f.type) || /\.(jpe?g|png|webp|gif|avif|mp4|webm|mov)$/i.test(f.name);
  const upload = async (items: Picked[]) => {
    const base = folder ?? "";
    const list = items.filter((i) => isMedia(i.file));
    if (!list.length) { toast(t(adm.media.nothing), "err"); return; }
    let done = 0, failed = 0;
    for (const { file: f, folder: sub } of list) {
      const target = [base, sub].filter(Boolean).join("/");
      setProgress(`${done + 1} / ${list.length} · ${target ? target + "/" : ""}${f.name}`);
      try { await repo().media.upload(f, setPct, target); done++; } catch (e) { failed++; toast(`${f.name}: ${(e as Error).message}`, "err"); }
    }
    setPct(null); setProgress(null); toast(`${done} ${t(adm.media.uploaded)}${failed ? ` · ${failed} ${t(adm.media.failed)}` : ""}`); reload();
  };
  const collect = async (dt: DataTransfer): Promise<Picked[]> => {
    const entries = Array.from(dt.items ?? []).map((i) => (i as DataTransferItem & { webkitGetAsEntry?: () => FileSystemEntry | null }).webkitGetAsEntry?.()).filter(Boolean) as FileSystemEntry[];
    if (!entries.length) return Array.from(dt.files ?? []).map((file) => ({ file, folder: "" }));
    const out: Picked[] = [];
    const walk = async (e: FileSystemEntry): Promise<void> => {
      if (e.isFile) { await new Promise<void>((res) => (e as FileSystemFileEntry).file((f) => { out.push({ file: f, folder: e.fullPath.split("/").slice(1, -1).join("/") }); res(); }, () => res())); return; }
      if (e.isDirectory) { const r = (e as FileSystemDirectoryEntry).createReader(); for (;;) { const b = await new Promise<FileSystemEntry[]>((res) => r.readEntries(res, () => res([]))); if (!b.length) break; for (const c of b) await walk(c); } }
    };
    for (const e of entries) await walk(e);
    return out;
  };

  /* ── product links follow moved files ── */
  const relink = async (pairs: { from: string; to: string }[]) => {
    const changed = pairs.filter((p) => p.from !== p.to); if (!changed.length) return;
    for (const p of products) {
      if (!p.images?.some((i) => changed.some((c) => c.from === i.url))) continue;
      await repo().products.save({ ...p, images: p.images.map((i) => ({ ...i, url: changed.find((c) => c.from === i.url)?.to ?? i.url })) });
    }
  };

  /* ── folder actions ── */
  const createFolder = async () => {
    const name = (newFolder ?? "").trim().replace(/\//g, "-"); if (!name) return;
    const full = folder ? `${folder}/${name}` : name;
    await repo().media.saveFolders(Array.from(new Set([...(data?.extra ?? []), full]))); setNewFolder(null); setFolder(full); reload();
  };
  const renameFolder = async (from: string) => {
    const leaf = renameVal.trim().replace(/\//g, "-"); if (!leaf || leaf === from.split("/").pop()) { setRenaming(null); return; }
    const to = [...from.split("/").slice(0, -1), leaf].join("/");
    setBusy(true);
    try {
      const pairs: { from: string; to: string }[] = [];
      for (const m of media.filter((x) => folderOf(x.path) === from || folderOf(x.path).startsWith(from + "/"))) {
        const moved = await repo().media.move(m, folderOf(m.path).replace(from, to)); pairs.push({ from: m.url, to: moved.url });
      }
      await relink(pairs);
      await repo().media.saveFolders((data?.extra ?? []).map((f) => (f === from || f.startsWith(from + "/") ? f.replace(from, to) : f)));
      await refreshStorefront(STORE_PATHS); toast(t(adm.common.saved)); setFolder(to);
    } catch (e) { toast((e as Error).message, "err"); }
    setRenaming(null); setBusy(false); reload();
  };
  const deleteFolder = async (f: string) => {
    if (media.some((m) => folderOf(m.path) === f || folderOf(m.path).startsWith(f + "/"))) { toast(t(adm.media.folderNotEmpty), "err"); return; }
    await repo().media.saveFolders((data?.extra ?? []).filter((x) => x !== f)); if (folder === f) setFolder(null); reload();
  };

  /* ── selection actions ── */
  const toggle = (id: string) => setSel((s) => { const n = new Set(s); n.has(id) ? n.delete(id) : n.add(id); return n; });
  const moveSelected = async () => {
    setBusy(true);
    try {
      const pairs: { from: string; to: string }[] = [];
      for (const m of selected) { const moved = await repo().media.move(m, moveTo); pairs.push({ from: m.url, to: moved.url }); }
      await relink(pairs); await refreshStorefront(STORE_PATHS); toast(`${selected.length} ${t(adm.media.moved)}`); setSel(new Set());
    } catch (e) { toast((e as Error).message, "err"); }
    setBusy(false); reload();
  };
  const assignSelected = async () => {
    const p = products.find((x) => x.slug === assignTo); if (!p) return;
    setBusy(true);
    try {
      const existing = p.images ?? [];
      const add = [...selected].sort((a, b) => a.path.localeCompare(b.path, undefined, { numeric: true })).filter((m) => m.kind === "image" && !existing.some((e) => e.url === m.url)).map((m) => ({ url: m.url, alt: p.name }));
      await repo().products.save({ ...p, images: [...existing, ...add] });
      await refreshStorefront([...STORE_PATHS, `/produkt/${p.slug}/`]); toast(`${add.length} ${t(adm.media.assigned)} · ${p.name}`); setSel(new Set());
    } catch (e) { toast((e as Error).message, "err"); }
    setBusy(false); reload();
  };
  const deleteSelected = async () => {
    if (!confirm(t(adm.common.confirmDelete))) return;
    setBusy(true); for (const m of selected) await repo().media.remove(m); setSel(new Set()); setBusy(false); reload();
  };

  /* ── thumbnails for files uploaded before variants existed ── */
  const backfill = async () => {
    setBusy(true);
    const imgs = media.filter((m) => m.kind === "image"); let made = 0, skipped = 0, failed = 0;
    for (let i = 0; i < imgs.length; i++) {
      setProgress(`${t(adm.media.thumbs)} ${i + 1} / ${imgs.length}`);
      try { if (await repo().media.hasVariants(imgs[i])) { skipped++; continue; } (await repo().media.makeVariants(imgs[i])) ? made++ : failed++; } catch { failed++; }
    }
    setProgress(null); setBusy(false); toast(`${made} ${t(adm.media.thumbsMade)} · ${skipped} ${t(adm.media.thumbsHad)}${failed ? ` · ${failed} ${t(adm.media.failed)}` : ""}`);
  };

  /* ── assign by name (review table) ── */
  const startReview = () => {
    const rows = (folder === null ? media : list).filter((m) => m.kind === "image").map((item) => {
      const already = products.find((p) => p.images?.some((i) => i.url === item.url));
      const f = folderOf(item.path);
      const m = already ? { p: already, s: 1 } : (f && bestMatch(f.split("/").pop()!, products)) || bestMatch(fileLabel(item.path), products);
      return { item, slug: m ? m.p.slug : "", sure: Boolean(m && m.s >= 0.75) };
    });
    setReview(rows);
  };
  const applyReview = async () => {
    if (!review) return; setBusy(true);
    const bySlug = new Map<string, MediaItem[]>();
    review.filter((r) => r.slug).forEach((r) => bySlug.set(r.slug, [...(bySlug.get(r.slug) ?? []), r.item]));
    let n = 0;
    for (const [slug, items] of bySlug) {
      const p = products.find((x) => x.slug === slug); if (!p) continue;
      const existing = p.images ?? [];
      const add = items.sort((a, b) => a.path.localeCompare(b.path, undefined, { numeric: true })).filter((i) => !existing.some((e) => e.url === i.url)).map((i) => ({ url: i.url, alt: p.name }));
      if (add.length) { await repo().products.save({ ...p, images: [...existing, ...add] }); n += add.length; }
    }
    await refreshStorefront(STORE_PATHS); toast(`${n} ${t(adm.media.assigned)}`); setBusy(false); setReview(null); reload();
  };

  const FolderRow = ({ f, label, count }: { f: string | null; label: string; count: number }) => (
    <div className={`group flex items-center gap-1 rounded-md px-2 py-1.5 text-[13px] ${folder === f ? "bg-ink text-paper" : "hover:bg-tile"}`}>
      {renaming !== null && renaming === f ? (
        <input autoFocus value={renameVal} onChange={(e) => setRenameVal(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") renameFolder(f!); if (e.key === "Escape") setRenaming(null); }} onBlur={() => renameFolder(f!)} className="h-7 w-full rounded border border-hair bg-paper px-2 text-ink" />
      ) : (
        <>
          <button className="flex-1 truncate text-left" style={{ paddingLeft: f ? (f.split("/").length - 1) * 12 : 0 }} onClick={() => setFolder(f)}>{f ? "▸ " : ""}{label}</button>
          <span className={`text-[11px] ${folder === f ? "text-neutral-300" : "text-mute"}`}>{count}</span>
          {f && <button title={t(adm.media.rename)} className="hidden px-1 group-hover:inline" onClick={() => { setRenaming(f); setRenameVal(f.split("/").pop()!); }}>✎</button>}
          {f && <button title={t(adm.media.deleteFolder)} className="hidden px-1 group-hover:inline" onClick={() => deleteFolder(f)}>×</button>}
        </>
      )}
    </div>
  );

  return (
    <>
      <PageHeader title={t(adm.media.title)} sub={`${media.length}`} actions={<><Button variant="secondary" onClick={() => setNewFolder("")}>{t(adm.media.newFolder)}</Button><Button variant="secondary" onClick={startReview} disabled={!media.length}>{t(adm.media.assignByName)}</Button><Button variant="secondary" onClick={backfill} disabled={busy || !media.length}>{t(adm.media.thumbs)}</Button></>} />

      {review && (
        <Card className="mb-6" title={t(adm.media.assignTitle)} actions={<div className="flex gap-2"><Button variant="secondary" onClick={() => setReview(null)}>{t(adm.common.cancel)}</Button><Button disabled={busy} onClick={applyReview}>{t(adm.media.apply)} ({review.filter((r) => r.slug).length})</Button></div>}>
          <p className="mb-3 text-[12px] text-mute">{t(adm.media.assignHint)}</p>
          <Table head={["", t(adm.media.file), t(adm.products.title), ""]}>
            {review.map((r, i) => (
              <tr key={r.item.id} className={r.slug ? "" : "bg-amber-50/50"}>
                <Td><img src={variant(r.item.url, "thumb")} alt="" className="h-10 w-10 rounded object-cover" loading="lazy" /></Td>
                <Td className="font-mono text-[12px]">{folderOf(r.item.path) && <span className="text-mute">{folderOf(r.item.path)}/</span>}{r.item.path.split("/").pop()}</Td>
                <Td><Select value={r.slug} onChange={(e) => setReview(review.map((x, k) => (k === i ? { ...x, slug: e.target.value, sure: true } : x)))} className="max-w-md"><option value="">— {t(adm.media.skip)} —</option>{products.map((p) => <option key={p.slug} value={p.slug}>{p.brand} · {p.name}</option>)}</Select></Td>
                <Td className="text-[11px] text-mute">{r.slug ? (r.sure ? "" : t(adm.media.unsure)) : t(adm.media.noMatch)}</Td>
              </tr>
            ))}
          </Table>
        </Card>
      )}

      <div className="grid gap-6 lg:grid-cols-[220px_1fr]">
        <aside className="rounded-lg border border-hair bg-paper p-2 lg:sticky lg:top-20 lg:self-start">
          <FolderRow f={null} label={t(adm.media.allFiles)} count={media.length} />
          <FolderRow f="" label={t(adm.media.noFolder)} count={media.filter((m) => !folderOf(m.path)).length} />
          <div className="my-1 border-t border-hair" />
          {folders.map((f) => <FolderRow key={f} f={f} label={f.split("/").pop()!} count={media.filter((m) => folderOf(m.path) === f).length} />)}
          {newFolder !== null && (
            <div className="mt-2 flex gap-1">
              <Input autoFocus placeholder={t(adm.media.folderName)} value={newFolder} onChange={(e) => setNewFolder(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") createFolder(); if (e.key === "Escape") setNewFolder(null); }} />
              <Button onClick={createFolder}>OK</Button>
            </div>
          )}
        </aside>

        <div className="min-w-0">
          <div onDragOver={(e) => { e.preventDefault(); setOver(true); }} onDragLeave={() => setOver(false)} onDrop={async (e) => { e.preventDefault(); setOver(false); upload(await collect(e.dataTransfer)); }} onClick={() => input.current?.click()}
            className={`flex h-20 cursor-pointer items-center justify-center rounded-lg border-2 border-dashed text-[13px] ${over ? "border-ink bg-tile" : "border-neutral-300 text-mute hover:border-ink"}`}>
            {progress ?? `${t(adm.media.drop)}${folder ? ` · ${t(adm.media.uploadTo)} ${folder}` : ""}`}
            <input ref={input} type="file" multiple accept="image/*,video/*" className="hidden" onChange={(e) => upload(Array.from(e.target.files ?? []).map((file) => ({ file, folder: "" })))} />
            <input ref={folderInput} type="file" multiple className="hidden" {...({ webkitdirectory: "" } as Record<string, string>)} onChange={(e) => upload(Array.from(e.target.files ?? []).map((file) => ({ file, folder: ((file as File & { webkitRelativePath?: string }).webkitRelativePath ?? "").split("/").slice(0, -1).join("/") })))} />
          </div>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <Button variant="secondary" onClick={() => input.current?.click()}>{t(adm.media.chooseFiles)}</Button>
            <Button variant="secondary" onClick={() => folderInput.current?.click()}>{t(adm.media.chooseFolder)}</Button>
            <span className="ml-auto text-[12px] text-mute">{pct !== null ? `${pct}%` : ""}</span>
            {list.length > 0 && <Button variant="ghost" onClick={() => setSel(sel.size === list.length ? new Set() : new Set(list.map((m) => m.id)))}>{sel.size === list.length ? t(adm.media.clearSel) : t(adm.media.selectAll)}</Button>}
          </div>

          {sel.size > 0 && (
            <div className="sticky top-16 z-10 mt-3 flex flex-wrap items-center gap-2 rounded-lg border border-ink bg-paper p-2 text-[13px] shadow-sm">
              <span className="px-2 font-semibold">{sel.size} {t(adm.media.selected)}</span>
              <Select value={assignTo} onChange={(e) => setAssignTo(e.target.value)} className="w-64!"><option value="">{t(adm.media.chooseProduct)}</option>{products.map((p) => <option key={p.slug} value={p.slug}>{p.brand} · {p.name}</option>)}</Select>
              <Button disabled={!assignTo || busy} onClick={assignSelected}>{t(adm.media.assignBtn)}</Button>
              <span className="mx-1 text-mute">|</span>
              <Select value={moveTo} onChange={(e) => setMoveTo(e.target.value)} className="w-48!"><option value="">{t(adm.media.noFolder)}</option>{folders.map((f) => <option key={f} value={f}>{f}</option>)}</Select>
              <Button variant="secondary" disabled={busy} onClick={moveSelected}>{t(adm.media.move)}</Button>
              <span className="mx-1 text-mute">|</span>
              <Button variant="danger" disabled={busy} onClick={deleteSelected}>{t(adm.common.delete)}</Button>
              <Button variant="ghost" onClick={() => setSel(new Set())}>{t(adm.media.clearSel)}</Button>
            </div>
          )}

          {groups.map(([g, items]) => (
            <section key={g || "_"} className="mt-6">
              {folder === null && g && <h2 className="mb-3 text-[13px] font-semibold">{g} <span className="font-normal text-mute">· {items.length}</span></h2>}
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 xl:grid-cols-5">
                {items.map((m) => <MediaCard key={m.id} m={m} on={sel.has(m.id)} used={usedBy.get(m.url)} toggle={toggle} copy={() => { navigator.clipboard.writeText(m.url); toast(t(adm.media.copied)); }} labels={{ usedBy: t(adm.media.usedBy), unused: t(adm.media.unused), copy: t(adm.media.copy) }} size={fmt(m.size)} />)}
              </div>
            </section>
          ))}
          {!list.length && <p className="mt-6 text-[13px] text-mute">{t(adm.common.empty)}</p>}
        </div>
      </div>
    </>
  );
}
