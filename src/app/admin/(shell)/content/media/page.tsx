"use client";
import { useRef, useState } from "react";
import { adm } from "@/lib/admin/i18n";
import { repo } from "@/lib/admin/repo";
import { Button, PageHeader, Select, useAsync, useT, useToast } from "@/components/admin/ui";
import { Video } from "@/components/Media";

export default function Media() {
  const { t } = useT();
  const toast = useToast();
  const { data, reload } = useAsync(() => repo().media.list());
  const [filter, setFilter] = useState(""); const [pct, setPct] = useState<number | null>(null); const [over, setOver] = useState(false);
  const input = useRef<HTMLInputElement>(null);
  const upload = async (files: FileList | null) => { if (!files) return; for (const f of Array.from(files)) { try { await repo().media.upload(f, setPct); } catch (e) { toast((e as Error).message, "err"); } } setPct(null); reload(); };
  const list = (data ?? []).filter((m) => !filter || m.kind === filter);
  const fmt = (n: number | null) => (n == null ? "" : n > 1e6 ? `${(n / 1e6).toFixed(1)} MB` : `${Math.round(n / 1e3)} kB`);
  return (
    <>
      <PageHeader title={t(adm.media.title)} sub={`${list.length}`} actions={<Select value={filter} onChange={(e) => setFilter(e.target.value)} className="w-36!"><option value="">{t(adm.media.filter)}: {t(adm.common.all)}</option><option value="image">{t(adm.media.images)}</option><option value="video">{t(adm.media.videos)}</option></Select>} />
      <div onDragOver={(e) => { e.preventDefault(); setOver(true); }} onDragLeave={() => setOver(false)} onDrop={(e) => { e.preventDefault(); setOver(false); upload(e.dataTransfer.files); }} onClick={() => input.current?.click()}
        className={`mb-6 flex h-28 cursor-pointer items-center justify-center rounded-lg border-2 border-dashed text-[13px] ${over ? "border-ink bg-tile" : "border-neutral-300 text-mute hover:border-ink"}`}>
        {pct !== null ? `${pct}%` : t(adm.media.drop)}
        <input ref={input} type="file" multiple accept="image/*,video/*" className="hidden" onChange={(e) => upload(e.target.files)} />
      </div>
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
