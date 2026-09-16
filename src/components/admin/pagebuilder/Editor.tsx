"use client";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { adm } from "@/lib/admin/i18n";
import { repo } from "@/lib/admin/repo";
import { refreshStorefront } from "@/lib/admin/revalidate";
import { useActiveSandbox } from "@/lib/admin/sandbox";
import { defaultHome } from "@/lib/defaultHome";
import { Badge, Button, Field, Input, Select, TextField, useT, useToast } from "@/components/admin/ui";
import type { Page, Section } from "@/lib/types";
import type { PreviewIn, PreviewOut } from "@/app/admin/preview/page";
import { Inspector } from "./Inspector";
import { blankSection, uid } from "./blank";
import { categorySlugOf, isCategoryPage } from "@/lib/categoryBanner";

type Tab = "content" | "look" | "type";
const DEVICES = { desktop: 1280, mobile: 390 } as const;

/** Visual page editor: section list · live preview (iframe) · inspector. */
export function Editor({ slug }: { slug: string }) {
  const { t, lang } = useT();
  const toast = useToast();
  const sandbox = useActiveSandbox();
  const [hist, setHist] = useState<Page[]>([]);
  const [hi, setHi] = useState(-1);
  const [savedAt, setSavedAt] = useState<Page | null>(null);
  const [selected, setSelected] = useState<string | null>(null);
  const [tab, setTab] = useState<Tab>("content");
  const [device, setDevice] = useState<keyof typeof DEVICES>("desktop");
  const [adding, setAdding] = useState(false);
  const [busy, setBusy] = useState(false);
  const [showList, setShowList] = useState(true);
  const [showPanel, setShowPanel] = useState(true);
  useEffect(() => { try { setShowList(localStorage.getItem("md-editor-list") !== "hidden"); setShowPanel(localStorage.getItem("md-editor-panel") !== "hidden"); } catch {} }, []);
  const toggleList = () => { const v = !showList; setShowList(v); try { localStorage.setItem("md-editor-list", v ? "shown" : "hidden"); } catch {} };
  const togglePanel = () => { const v = !showPanel; setShowPanel(v); try { localStorage.setItem("md-editor-panel", v ? "shown" : "hidden"); } catch {} };
  const page = hist[hi] ?? null;
  const dirty = page !== null && page !== savedAt;
  const coalesce = useRef<{ key: string; at: number } | null>(null);

  useEffect(() => { repo().pages.get(slug).then((p) => { const pg = p ?? { slug, title: { cs: slug, en: slug }, sections: [], status: "draft" as const, seo: {}, updated_at: new Date().toISOString() }; setHist([pg]); setHi(0); setSavedAt(pg); }); }, [slug]);

  /** Push a new state. `key` merges rapid successive edits of the same thing (drags, typing) into one undo step. */
  const commit = useCallback((next: Page, key?: string) => {
    const now = Date.now();
    const merge = key && coalesce.current && coalesce.current.key === key && now - coalesce.current.at < 1200;
    coalesce.current = key ? { key, at: now } : null;
    setHist((h) => { const base = h.slice(0, hi + 1); if (merge) base[base.length - 1] = next; else base.push(next); return base.slice(-120); });
    setHi((i) => (merge ? i : Math.min(i + 1, 119)));
  }, [hi]);
  const undo = () => { if (hi > 0) { setHi(hi - 1); coalesce.current = null; } };
  const redo = () => { if (hi < hist.length - 1) { setHi(hi + 1); coalesce.current = null; } };

  const patchSection = useCallback((id: string, patch: Partial<Section>, key?: string) => {
    if (!page) return;
    commit({ ...page, sections: page.sections.map((s) => (s.id === id ? ({ ...s, ...patch } as Section) : s)) }, key ?? `sec:${id}:${Object.keys(patch).join(",")}`);
  }, [page, commit]);
  const setSections = (sections: Section[]) => page && commit({ ...page, sections });
  const move = (from: number, to: number) => { if (!page || to < 0 || to >= page.sections.length) return; const a = [...page.sections]; const [x] = a.splice(from, 1); a.splice(to, 0, x); setSections(a); };
  const add = (type: Section["type"]) => { if (!page) return; const s = blankSection(type); const i = selected ? page.sections.findIndex((x) => x.id === selected) + 1 : page.sections.length; const a = [...page.sections]; a.splice(i || page.sections.length, 0, s); setSections(a); setSelected(s.id); setTab("content"); setAdding(false); };
  const duplicate = (id: string) => { if (!page) return; const i = page.sections.findIndex((x) => x.id === id); const copy = { ...JSON.parse(JSON.stringify(page.sections[i])), id: uid() } as Section; const a = [...page.sections]; a.splice(i + 1, 0, copy); setSections(a); setSelected(copy.id); };
  const remove = (id: string) => { if (!page) return; setSections(page.sections.filter((x) => x.id !== id)); if (selected === id) setSelected(null); };

  const save = async (status?: Page["status"]) => {
    if (!page) return; setBusy(true);
    try { const p = { ...page, status: status ?? page.status }; await repo().pages.save(p); await refreshStorefront([p.slug === "home" ? "/" : `/${p.slug}/`]); commit(p); setSavedAt(p); toast(sandbox ? `${t(adm.pages.savedSandbox)} „${sandbox.name}“` : t(adm.common.saved)); }
    catch (e) { toast((e as Error).message, "err"); }
    setBusy(false);
  };

  // keyboard: undo / redo / save
  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      const mod = e.ctrlKey || e.metaKey; if (!mod) return;
      const tag = (e.target as HTMLElement)?.tagName; const typing = tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT";
      if (e.key.toLowerCase() === "z" && !typing) { e.preventDefault(); e.shiftKey ? redo() : undo(); }
      if (e.key.toLowerCase() === "y" && !typing) { e.preventDefault(); redo(); }
      if (e.key.toLowerCase() === "s") { e.preventDefault(); save(); }
    };
    window.addEventListener("keydown", h); return () => window.removeEventListener("keydown", h);
  });
  useEffect(() => { const h = (e: BeforeUnloadEvent) => { if (dirty) { e.preventDefault(); } }; window.addEventListener("beforeunload", h); return () => window.removeEventListener("beforeunload", h); }, [dirty]);

  /* ───── preview iframe ───── */
  const frame = useRef<HTMLIFrameElement>(null);
  const [ready, setReady] = useState(false);
  const [frameH, setFrameH] = useState(800);
  const host = useRef<HTMLDivElement>(null);
  const [hostW, setHostW] = useState(900);
  useEffect(() => { const el = host.current; if (!el) return; const ro = new ResizeObserver(() => setHostW(el.clientWidth)); ro.observe(el); return () => ro.disconnect(); }, []);
  useEffect(() => {
    const onMsg = (e: MessageEvent<PreviewOut>) => {
      const m = e.data; if (!m || typeof m !== "object" || !("type" in m)) return;
      if (m.type === "md-preview-ready") setReady(true);
      else if (m.type === "md-preview-height") setFrameH(Math.max(300, m.height));
      else if (m.type === "md-preview-select") { setSelected(m.id); setShowPanel(true); }
      else if (m.type === "md-preview-change") patchSection(m.id, m.patch, `box:${m.id}`);
    };
    window.addEventListener("message", onMsg); return () => window.removeEventListener("message", onMsg);
  }, [patchSection]);
  useEffect(() => {
    if (!ready || !page) return;
    const msg: PreviewIn = { type: "md-preview", sections: page.sections, selected, lang };
    frame.current?.contentWindow?.postMessage(msg, "*");
  }, [ready, page, selected, lang]);
  // scroll the preview to the selected section
  useEffect(() => { if (!selected || !frame.current?.contentDocument) return; const el = frame.current.contentDocument.querySelector(`[data-section="${selected}"]`); el?.scrollIntoView({ block: "nearest", behavior: "smooth" }); }, [selected]);
  const devW = DEVICES[device];
  const scale = Math.min(1, (hostW - 2) / devW);

  const sel = useMemo(() => page?.sections.find((s) => s.id === selected) ?? null, [page, selected]);
  const single = isCategoryPage(slug); // category banner: exactly one hero, no list, always live
  useEffect(() => { if (single && page?.sections[0] && !selected) setSelected(page.sections[0].id); }, [single, page, selected]);
  if (!page) return <p className="text-mute">{t(adm.common.loading)}</p>;
  const href = single ? `/${categorySlugOf(slug)}/` : page.slug === "home" ? "/" : `/${page.slug}/`;
  const p = adm.pages;

  return (
    <div className="-m-4 flex h-[calc(100vh-3.5rem)] flex-col md:-m-6 lg:-m-8">
      {/* toolbar */}
      <div className="flex flex-wrap items-center gap-2 border-b border-hair bg-paper px-4 py-2">
        {!single && <button onClick={toggleList} title={showList ? t(p.hideList) : t(p.showList)} className={`hidden h-8 w-8 items-center justify-center rounded-md border border-hair text-[13px] hover:bg-tile md:inline-flex ${showList ? "" : "text-mute"}`} aria-pressed={showList}>☰</button>}
        <Link href={single ? "/admin/content/categories/" : "/admin/content/pages/"} className="text-[12px] text-mute hover:text-ink">← {single ? t(adm.categories.title) : t(p.title)}</Link>
        <span className="text-[14px] font-semibold">{single ? `${t(p.categoryBanner)}: ${t(page.title)}` : t(page.title) || page.slug}</span>
        <span className="font-mono text-[11px] text-mute">{href}</span>
        {!single && (page.status === "published" ? <Badge tone="green">{t(p.published)}</Badge> : <Badge tone="amber">{t(p.draft)}</Badge>)}
        {dirty && <span className="text-[11px] text-amber-700">● {t(p.unsaved)}</span>}
        {sandbox && <span className="rounded-full bg-violet-50 px-2 py-0.5 text-[11px] font-medium text-violet-700">Sandbox: {sandbox.name}</span>}
        <div className="ml-auto flex items-center gap-1">
          <Button variant="ghost" onClick={undo} disabled={hi <= 0} title={`${t(p.undo)} (Ctrl+Z)`}>↶</Button>
          <Button variant="ghost" onClick={redo} disabled={hi >= hist.length - 1} title={`${t(p.redo)} (Ctrl+Shift+Z)`}>↷</Button>
          <div className="mx-2 flex rounded-md border border-hair p-0.5 text-[12px]">
            {(Object.keys(DEVICES) as (keyof typeof DEVICES)[]).map((d) => <button key={d} onClick={() => setDevice(d)} className={`rounded px-2 py-1 ${device === d ? "bg-ink text-paper" : "text-mute hover:text-ink"}`}>{t(p[d])}</button>)}
          </div>
          <a href={href} target="_blank" className="inline-flex h-9 items-center rounded-md border border-hair px-3 text-[13px] hover:bg-tile">{t(p.preview)}</a>
          {!single && (page.status === "published" ? <Button variant="secondary" disabled={busy} onClick={() => save("draft")}>{t(p.unpublish)}</Button> : <Button variant="secondary" disabled={busy} onClick={() => save("published")}>{t(p.publish)}</Button>)}
          <Button disabled={busy || !dirty} onClick={() => save()}>{t(p.saveTo)}</Button>
          <button onClick={togglePanel} title={showPanel ? t(p.hidePanel) : t(p.showPanel)} className={`ml-1 inline-flex h-8 w-8 items-center justify-center rounded-md border border-hair text-[13px] hover:bg-tile ${showPanel ? "" : "text-mute"}`} aria-pressed={showPanel}>⚙</button>
        </div>
      </div>

      <div className="flex min-h-0 flex-1">
        {/* section list */}
        <aside className={`w-60 shrink-0 overflow-y-auto border-r border-hair bg-paper p-2 ${showList && !single ? "hidden md:block" : "hidden"}`}>
          <div className="mb-1 flex items-center justify-between px-1"><span className="text-[11px] font-semibold uppercase tracking-wide text-mute">{t(p.sections)}</span><button onClick={() => setAdding(!adding)} className="rounded-md border border-hair px-2 py-0.5 text-[12px] hover:bg-tile">+ {t(adm.common.add)}</button></div>
          {adding && (
            <div className="mb-2 grid gap-1 rounded-md border border-hair bg-[#f6f6f4] p-1.5">
              {(Object.keys(p.types) as Section["type"][]).map((ty) => <button key={ty} onClick={() => add(ty)} className="rounded px-2 py-1.5 text-left hover:bg-paper"><div className="text-[12px] font-medium">{t(p.types[ty])}</div><div className="text-[10px] text-mute">{t(p.typeHints[ty])}</div></button>)}
            </div>
          )}
          {!page.sections.length && <div className="p-2 text-[12px] text-mute">{t(p.empty)}{page.slug === "home" && <button onClick={() => setSections(defaultHome)} className="mt-2 block text-left underline underline-offset-4 hover:text-ink">{t(p.loadDefault)}</button>}</div>}
          <ul className="space-y-0.5">
            {page.sections.map((s, i) => (
              <li key={s.id} draggable onDragStart={(e) => e.dataTransfer.setData("text/plain", String(i))} onDragOver={(e) => e.preventDefault()} onDrop={(e) => { e.preventDefault(); const from = Number(e.dataTransfer.getData("text/plain")); if (!Number.isNaN(from)) move(from, i); }}
                onClick={() => setSelected(s.id)} className={`group flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-[12px] ${selected === s.id ? "bg-ink text-paper" : "hover:bg-tile"} ${s.hidden ? "opacity-60" : ""}`}>
                <span className="cursor-grab text-[10px] opacity-50">⋮⋮</span>
                <div className="min-w-0 flex-1"><div className="truncate font-medium">{t(p.types[s.type])}</div><div className={`truncate text-[10px] ${selected === s.id ? "text-neutral-300" : "text-mute"}`}>{"title" in s && s.title ? t(s.title) : ""}{s.hidden ? ` · ${t(p.hiddenBadge)}` : ""}</div></div>
                <div className={`hidden gap-0.5 group-hover:flex ${selected === s.id ? "flex" : ""}`}>
                  <button title={t(p.up)} onClick={(e) => { e.stopPropagation(); move(i, i - 1); }} className="px-1">↑</button>
                  <button title={t(p.down)} onClick={(e) => { e.stopPropagation(); move(i, i + 1); }} className="px-1">↓</button>
                </div>
              </li>
            ))}
          </ul>
        </aside>

        {/* preview */}
        <div className="min-w-0 flex-1 overflow-auto bg-[#e9e9e6] p-4" onClick={() => setAdding(false)}>
          <div ref={host} className="mx-auto" style={{ maxWidth: devW }}>
            <div className="overflow-hidden rounded-md bg-paper shadow-md" style={{ width: devW * scale, height: frameH * scale }}>
              <iframe ref={frame} src="/admin/preview/" title="Preview" className="border-0 bg-paper" style={{ width: devW, height: frameH, transform: `scale(${scale})`, transformOrigin: "top left" }} />
            </div>
          </div>
        </div>

        {/* inspector */}
        {!showPanel && <button onClick={togglePanel} title={t(p.showPanel)} className="flex w-7 shrink-0 items-start justify-center border-l border-hair bg-paper pt-3 text-[12px] text-mute hover:bg-tile hover:text-ink">‹</button>}
        <aside className={`w-[340px] shrink-0 overflow-y-auto border-l border-hair bg-paper ${showPanel ? "" : "hidden"}`}>
          {sel ? (<>
            <div className="sticky top-0 z-10 border-b border-hair bg-paper px-3 pt-2">
              <div className="flex items-center justify-between"><span className="text-[13px] font-semibold">{t(p.types[sel.type])}</span>
                {!single && <div className="flex gap-1 text-[12px]">
                  <button className="rounded px-1.5 py-0.5 hover:bg-tile" onClick={() => patchSection(sel.id, { hidden: !sel.hidden })}>{sel.hidden ? t(p.show) : t(p.hide)}</button>
                  <button className="rounded px-1.5 py-0.5 hover:bg-tile" onClick={() => duplicate(sel.id)}>{t(p.duplicate)}</button>
                  <button className="rounded px-1.5 py-0.5 text-signal hover:bg-tile" onClick={() => { if (confirm(t(adm.common.confirmDelete))) remove(sel.id); }}>{t(adm.common.delete)}</button>
                </div>}
              </div>
              <div className="mt-2 flex gap-4 text-[12px]">{(["content", "look", "type"] as Tab[]).map((tb) => <button key={tb} onClick={() => setTab(tb)} className={`border-b-2 pb-1.5 ${tab === tb ? "border-ink font-semibold" : "border-transparent text-mute hover:text-ink"}`}>{t(p.tabs[tb])}</button>)}</div>
            </div>
            <div className="p-3"><Inspector s={sel} tab={tab} onChange={(patch) => patchSection(sel.id, patch)} /></div>
          </>) : (
            <div className="p-3">
              <div className="mb-3 text-[13px] font-semibold">{t(p.tabs.page)}</div>
              <p className="mb-3 text-[12px] text-mute">{t(p.selectHint)}</p>
              <div className="space-y-3">
                <TextField label={t(adm.common.name)} value={page.title} onChange={(v) => commit({ ...page, title: v }, "title")} />
                <Field label={t(adm.common.status)}><Select value={page.status} onChange={(e) => commit({ ...page, status: e.target.value as Page["status"] })}><option value="draft">{t(p.draft)}</option><option value="published">{t(p.published)}</option></Select></Field>
                <div className="pt-2 text-[12px] font-semibold">{t(p.seo)}</div>
                <p className="text-[11px] text-mute">{t(p.seoHint)}</p>
                <TextField label={t(adm.products.seoTitle)} value={page.seo.title} onChange={(v) => commit({ ...page, seo: { ...page.seo, title: v } }, "seo-title")} />
                <TextField label={t(adm.products.seoDesc)} value={page.seo.description} onChange={(v) => commit({ ...page, seo: { ...page.seo, description: v } }, "seo-desc")} multiline />
                <Field label={t(p.slug)}><Input value={href} disabled /></Field>
              </div>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}
