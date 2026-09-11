"use client";
import { useRef, useState } from "react";
import { adm } from "@/lib/admin/i18n";
import { repo } from "@/lib/admin/repo";
import { Button, Input, useAsync, useT, useToast } from "./ui";
import type { MediaItem, MediaRef } from "@/lib/types";
import { SmartImg } from "@/components/SmartImg";

/** Upload a file or pick from the media library. Returns a MediaRef. */
export function MediaPicker({ value, onChange, accept = "image/*,video/*", allowUrl = true }: { value?: MediaRef; onChange: (m: MediaRef | undefined) => void; accept?: string; allowUrl?: boolean }) {
  const { t } = useT();
  const toast = useToast();
  const [open, setOpen] = useState(false);
  const [pct, setPct] = useState<number | null>(null);
  const file = useRef<HTMLInputElement>(null);
  const { data, reload } = useAsync(() => (open ? repo().media.list() : Promise.resolve([] as MediaItem[])), [open]);
  const upload = async (f: File) => {
    try { const m = await repo().media.upload(f, setPct); onChange({ kind: m.kind === "video" ? "video" : "image", url: m.url }); toast(t(adm.common.saved)); reload(); }
    catch (e) { toast((e as Error).message, "err"); }
    setPct(null);
  };
  const urlKind = (u: string): MediaRef["kind"] => /youtu/.test(u) ? "youtube" : /vimeo/.test(u) ? "vimeo" : /\.(mp4|webm|mov)(\?|$)/i.test(u) ? "video" : "image";
  return (
    <div>
      <div className="flex flex-wrap items-center gap-2">
        {value?.url ? (
          <div className="flex items-center gap-3 rounded-md border border-hair p-2">
            {value.kind === "image" ? <SmartImg src={value.url} size="thumb" className="h-14 w-20 rounded object-cover" /> : <div className="flex h-14 w-20 items-center justify-center rounded bg-ink text-[10px] uppercase text-paper">{value.kind}</div>}
            <span className="max-w-[240px] truncate text-[12px] text-mute">{value.url}</span>
            <Button variant="ghost" type="button" onClick={() => onChange(undefined)}>{t(adm.common.remove)}</Button>
          </div>
        ) : null}
        <input ref={file} type="file" accept={accept} className="hidden" onChange={(e) => e.target.files?.[0] && upload(e.target.files[0])} />
        <Button type="button" variant="secondary" onClick={() => file.current?.click()} disabled={pct !== null}>{pct !== null ? `${pct}%` : t(adm.common.upload)}</Button>
        <Button type="button" variant="secondary" onClick={() => setOpen(!open)}>{t(adm.common.chooseMedia)}</Button>
      </div>
      {allowUrl && <Input className="mt-2" placeholder={t(adm.common.url) + " (https://…, YouTube, Vimeo)"} defaultValue={value?.kind === "youtube" || value?.kind === "vimeo" ? value.url : ""} onBlur={(e) => e.target.value && onChange({ kind: urlKind(e.target.value), url: e.target.value })} />}
      {open && (
        <div className="mt-2 grid max-h-64 grid-cols-4 gap-2 overflow-auto rounded-md border border-hair p-2 sm:grid-cols-6">
          {(data ?? []).map((m) => (
            <button type="button" key={m.id} onClick={() => { onChange({ kind: m.kind === "video" ? "video" : "image", url: m.url }); setOpen(false); }} className="aspect-square overflow-hidden rounded border border-hair hover:border-ink">
              {m.kind === "image" ? <SmartImg src={m.url} size="thumb" className="h-full w-full object-cover" /> : <div className="flex h-full items-center justify-center bg-ink text-[10px] uppercase text-paper">video</div>}
            </button>
          ))}
          {!data?.length && <div className="col-span-full p-4 text-center text-[12px] text-mute">{t(adm.common.empty)}</div>}
        </div>
      )}
    </div>
  );
}
