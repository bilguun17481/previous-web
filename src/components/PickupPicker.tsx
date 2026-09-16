"use client";
/* Pickup-point pickers for the checkout. Each carrier ships its own map widget:
   PPL   – map widget from ppl.cz (ParcelShop, ParcelBox, AlzaBox), reports the chosen point through a DOM event.
   GLS   – <gls-dpm> web component (GLS Delivery Point Map) used by GLS across central Europe.
   Česká pošta – the Balíkovna / post-office location picker at b2c.cpost.cz, embedded in an iframe and
           reporting through postMessage.
   Anything else falls back to a text field for the point's name or number. No API keys are needed. */
import { useEffect, useRef, useState } from "react";
import { dict, useLang, type Lang } from "@/lib/i18n";

export type PickupPoint = { id: string; name: string; address?: string; carrier: string; raw?: unknown };

declare module "react" {
  namespace JSX { interface IntrinsicElements { "gls-dpm": React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & { country?: string; language?: string; "dropoff-point"?: string } } }
}

function loadScript(src: string, attrs: Record<string, string> = {}) {
  return new Promise<void>((res, rej) => {
    const id = "s-" + src.replace(/[^a-z0-9]/gi, "");
    const existing = document.getElementById(id) as HTMLScriptElement | null;
    if (existing) { if (existing.dataset.loaded) res(); else { existing.addEventListener("load", () => res()); existing.addEventListener("error", () => rej(new Error("script"))); } return; }
    const s = document.createElement("script"); s.id = id; s.src = src; s.async = true;
    for (const [k, v] of Object.entries(attrs)) s.setAttribute(k, v);
    s.onload = () => { s.dataset.loaded = "1"; res(); }; s.onerror = () => rej(new Error("script"));
    document.body.appendChild(s);
  });
}

/** Which carriers have a map here. Others use the manual field. */
export const hasPickupMap = (carrier: string) => ["ppl", "gls", "balikovna", "ceska_posta"].includes(carrier);

export function PickupPicker({ carrier, onPick, onClose }: { carrier: string; onPick: (p: PickupPoint) => void; onClose: () => void }) {
  const { t, lang } = useLang();
  const k = dict.checkout;
  const [failed, setFailed] = useState(false);
  const [manual, setManual] = useState({ id: "", name: "" });
  const pick = (p: PickupPoint) => { onPick(p); onClose(); };
  useEffect(() => { const h = (e: KeyboardEvent) => e.key === "Escape" && onClose(); window.addEventListener("keydown", h); return () => window.removeEventListener("keydown", h); }, [onClose]);
  const manualOnly = !hasPickupMap(carrier) || failed;
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 p-3" onClick={onClose} role="dialog" aria-modal="true">
      <div className="flex h-[min(90vh,760px)] w-full max-w-4xl flex-col overflow-hidden rounded-lg bg-paper shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between border-b hairline px-4 py-3">
          <div className="text-[14px] font-semibold">{t(k.choosePoint)}</div>
          <button type="button" onClick={onClose} className="rounded-md px-2 py-1 text-[13px] hover:bg-tile" aria-label={t(dict.cart.remove)}>×</button>
        </div>
        <div className="relative min-h-0 flex-1">
          {!manualOnly && carrier === "ppl" && <PplMap lang={lang} onPick={pick} onFail={() => setFailed(true)} />}
          {!manualOnly && carrier === "gls" && <GlsMap lang={lang} onPick={pick} onFail={() => setFailed(true)} />}
          {!manualOnly && (carrier === "balikovna" || carrier === "ceska_posta") && <CpostMap type={carrier === "balikovna" ? "BALIKOVNY" : "POSTY"} onPick={pick} onFail={() => setFailed(true)} />}
          {manualOnly && (
            <div className="mx-auto max-w-md p-6">
              <p className="text-[13px] text-mute">{t(k.pointManualHint)}</p>
              <input className="mt-4 h-11 w-full border-b hairline bg-transparent text-[14px] outline-none focus:border-ink" placeholder={t(k.pointName)} value={manual.name} onChange={(e) => setManual({ ...manual, name: e.target.value })} />
              <input className="mt-2 h-11 w-full border-b hairline bg-transparent text-[14px] outline-none focus:border-ink" placeholder={t(k.pointId)} value={manual.id} onChange={(e) => setManual({ ...manual, id: e.target.value })} />
              <button type="button" className="btn-ink mt-6" disabled={!manual.name && !manual.id} onClick={() => pick({ id: manual.id || manual.name, name: manual.name || manual.id, carrier })}>{t(k.usePoint)}</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* PPL ParcelShop map widget. Docs: PPL "Mapový widget" (ppl.cz → pro e-shopy → integrace). */
function PplMap({ lang, onPick, onFail }: { lang: Lang; onPick: (p: PickupPoint) => void; onFail: () => void }) {
  const host = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const handler = (e: Event) => {
      const d = (e as CustomEvent).detail as Record<string, unknown> | undefined; if (!d) return;
      const code = String(d.code ?? d.id ?? ""); if (!code) return;
      onPick({ id: code, name: String(d.name ?? code), address: [d.street, d.city, d.zipCode].filter(Boolean).join(", "), carrier: "ppl", raw: d });
    };
    document.addEventListener("ppl-parcelshop-map", handler);
    loadScript("https://www.ppl.cz/sources/map/main.js").catch(onFail);
    return () => document.removeEventListener("ppl-parcelshop-map", handler);
  }, [onPick, onFail]);
  return <div ref={host} className="h-full w-full"><div id="ppl-parcelshop-map" className="h-full w-full" data-language={lang} data-mode="default" data-initialfilters="ParcelShop,ParcelBox,AlzaBox" data-country="cz" data-lat="49.82" data-lng="15.48" /></div>;
}

/* GLS Delivery Point Map web component. Docs: GLS "Map widget / gls-dpm". */
function GlsMap({ lang, onPick, onFail }: { lang: Lang; onPick: (p: PickupPoint) => void; onFail: () => void }) {
  const ref = useRef<HTMLElement>(null);
  useEffect(() => {
    const el = ref.current; if (!el) return;
    const handler = (e: Event) => {
      const d = (e as CustomEvent).detail as Record<string, unknown> | undefined; if (!d) return;
      const id = String(d.id ?? d.pclshopid ?? ""); if (!id) return;
      const c = (d.contact ?? d.address ?? {}) as Record<string, unknown>;
      onPick({ id, name: String(d.name ?? id), address: [c.address ?? c.street, c.city, c.postalCode ?? c.zip].filter(Boolean).join(", "), carrier: "gls", raw: d });
    };
    el.addEventListener("change", handler);
    loadScript("https://map.gls-hungary.com/widget/gls-dpm.js", { type: "module" }).catch(onFail);
    return () => el.removeEventListener("change", handler);
  }, [onPick, onFail]);
  return <gls-dpm ref={ref} country="cz" language={lang} style={{ display: "block", height: "100%", width: "100%" }} />;
}

/* Česká pošta location picker (Balíkovna boxes and partner shops, or post offices). Reports the chosen place via postMessage. */
function CpostMap({ type, onPick, onFail }: { type: "BALIKOVNY" | "POSTY"; onPick: (p: PickupPoint) => void; onFail: () => void }) {
  useEffect(() => {
    const handler = (e: MessageEvent) => {
      if (!/cpost\.cz$/.test(new URL(e.origin).hostname)) return;
      let d: Record<string, unknown> | null = null;
      try { d = typeof e.data === "string" ? JSON.parse(e.data) : e.data; } catch { return; }
      if (!d || typeof d !== "object") return;
      const place = (d.point ?? d.place ?? d.data ?? d) as Record<string, unknown>;
      const id = String(place.id ?? place.ID ?? place.zip ?? place.psc ?? ""); if (!id) return;
      onPick({ id, name: String(place.name ?? place.nazev ?? id), address: [place.address ?? place.street, place.city ?? place.obec, place.zip ?? place.psc].filter(Boolean).join(", "), carrier: type === "BALIKOVNY" ? "balikovna" : "ceska_posta", raw: place });
    };
    window.addEventListener("message", handler);
    return () => window.removeEventListener("message", handler);
  }, [type, onPick]);
  return <iframe title="Česká pošta" src={`https://b2c.cpost.cz/locations/?type=${type}`} className="h-full w-full border-0" onError={onFail} allow="geolocation" />;
}
