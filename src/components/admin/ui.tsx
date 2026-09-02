"use client";
import Link from "next/link";
import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { useLang } from "@/lib/i18n";
import type { Text } from "@/lib/types";

export const useT = () => { const { t, lang } = useLang(); return { t: (x: Text) => t(x), lang }; };

export function PageHeader({ title, sub, actions, back }: { title: string; sub?: string; actions?: ReactNode; back?: { href: string; label: string } }) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div>
        {back && <Link href={back.href} className="text-[12px] text-mute hover:text-ink">← {back.label}</Link>}
        <h1 className="text-[24px] font-semibold leading-tight tracking-[-0.01em]">{title}</h1>
        {sub && <p className="mt-1 text-[13px] text-mute">{sub}</p>}
      </div>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </div>
  );
}

export function Card({ title, children, className = "", actions }: { title?: string; children: ReactNode; className?: string; actions?: ReactNode }) {
  return (
    <section className={`rounded-lg border border-hair bg-paper ${className}`}>
      {(title || actions) && <header className="flex items-center justify-between border-b border-hair px-5 py-3"><h2 className="text-[13px] font-semibold">{title}</h2>{actions}</header>}
      <div className="p-5">{children}</div>
    </section>
  );
}

const base = "h-9 w-full rounded-md border border-hair bg-paper px-3 text-[13px] outline-none focus:border-ink disabled:bg-tile";
export function Field({ label, children, hint, className = "" }: { label: string; children: ReactNode; hint?: string; className?: string }) {
  return <label className={`block ${className}`}><span className="mb-1 block text-[12px] font-medium text-neutral-700">{label}</span>{children}{hint && <span className="mt-1 block text-[11px] text-mute">{hint}</span>}</label>;
}
export const Input = (p: React.InputHTMLAttributes<HTMLInputElement>) => <input {...p} className={`${base} ${p.className ?? ""}`} />;
export const Select = (p: React.SelectHTMLAttributes<HTMLSelectElement>) => <select {...p} className={`${base} ${p.className ?? ""}`} />;
export const Textarea = (p: React.TextareaHTMLAttributes<HTMLTextAreaElement>) => <textarea {...p} className={`min-h-24 w-full rounded-md border border-hair bg-paper px-3 py-2 text-[13px] outline-none focus:border-ink ${p.className ?? ""}`} />;

/** Two inputs for a {cs,en} text. */
export function TextField({ label, value, onChange, multiline = false }: { label: string; value: Text | undefined; onChange: (v: Text) => void; multiline?: boolean }) {
  const v = value ?? { cs: "", en: "" };
  const C = multiline ? Textarea : Input;
  return (
    <div>
      <span className="mb-1 block text-[12px] font-medium text-neutral-700">{label}</span>
      <div className="grid gap-2 sm:grid-cols-2">
        <div className="relative"><C value={v.cs} onChange={(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => onChange({ ...v, cs: e.target.value })} placeholder="CZ" /><span className="pointer-events-none absolute right-2 top-2 text-[10px] font-semibold text-mute">CZ</span></div>
        <div className="relative"><C value={v.en} onChange={(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => onChange({ ...v, en: e.target.value })} placeholder="EN" /><span className="pointer-events-none absolute right-2 top-2 text-[10px] font-semibold text-mute">EN</span></div>
      </div>
    </div>
  );
}

export function Toggle({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label?: string }) {
  return (
    <button type="button" role="switch" aria-checked={checked} onClick={() => onChange(!checked)} className="inline-flex items-center gap-2 text-[13px]">
      <span className={`relative h-5 w-9 rounded-full transition-colors ${checked ? "bg-ink" : "bg-neutral-300"}`}><span className={`absolute top-0.5 h-4 w-4 rounded-full bg-paper transition-transform ${checked ? "left-4.5 translate-x-0" : "left-0.5"}`} style={{ left: checked ? 18 : 2 }} /></span>
      {label && <span>{label}</span>}
    </button>
  );
}

export function Button({ variant = "primary", className = "", ...p }: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "primary" | "secondary" | "danger" | "ghost" }) {
  const v = { primary: "bg-ink text-paper hover:bg-neutral-700", secondary: "border border-hair bg-paper hover:bg-tile", danger: "border border-signal text-signal hover:bg-signal hover:text-paper", ghost: "hover:bg-tile" }[variant];
  return <button {...p} className={`inline-flex h-9 items-center justify-center gap-2 rounded-md px-3.5 text-[13px] font-medium transition-colors disabled:opacity-50 ${v} ${className}`} />;
}
export function LinkButton({ href, children, variant = "primary" }: { href: string; children: ReactNode; variant?: "primary" | "secondary" }) {
  const v = variant === "primary" ? "bg-ink text-paper hover:bg-neutral-700" : "border border-hair bg-paper hover:bg-tile";
  return <Link href={href} className={`inline-flex h-9 items-center gap-2 rounded-md px-3.5 text-[13px] font-medium transition-colors ${v}`}>{children}</Link>;
}

export function Badge({ tone = "neutral", children }: { tone?: "neutral" | "green" | "amber" | "red" | "blue"; children: ReactNode }) {
  const c = { neutral: "bg-tile text-neutral-700", green: "bg-emerald-50 text-emerald-700", amber: "bg-amber-50 text-amber-700", red: "bg-red-50 text-red-700", blue: "bg-sky-50 text-sky-700" }[tone];
  return <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium ${c}`}>{children}</span>;
}

export function Table({ head, children }: { head: ReactNode[]; children: ReactNode }) {
  return (
    <div className="overflow-x-auto rounded-lg border border-hair">
      <table className="w-full text-[13px]">
        <thead className="bg-tile text-left text-[11px] uppercase tracking-[0.08em] text-mute"><tr>{head.map((h, i) => <th key={i} className="px-4 py-2.5 font-medium">{h}</th>)}</tr></thead>
        <tbody className="divide-y divide-hair">{children}</tbody>
      </table>
    </div>
  );
}
export const Td = (p: React.TdHTMLAttributes<HTMLTableCellElement>) => <td {...p} className={`px-4 py-3 align-middle ${p.className ?? ""}`} />;

/* toasts */
const ToastCtx = createContext<(msg: string, tone?: "ok" | "err") => void>(() => {});
export const useToast = () => useContext(ToastCtx);
export function ToastProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<{ id: number; msg: string; tone: "ok" | "err" }[]>([]);
  const push = (msg: string, tone: "ok" | "err" = "ok") => { const id = Date.now(); setItems((c) => [...c, { id, msg, tone }]); setTimeout(() => setItems((c) => c.filter((x) => x.id !== id)), 3500); };
  return (
    <ToastCtx.Provider value={push}>
      {children}
      <div className="pointer-events-none fixed bottom-4 right-4 z-50 space-y-2">{items.map((i) => <div key={i.id} className={`rounded-md px-4 py-2.5 text-[13px] text-paper shadow-lg ${i.tone === "ok" ? "bg-ink" : "bg-signal"}`}>{i.msg}</div>)}</div>
    </ToastCtx.Provider>
  );
}

export const money = (n: number) => n.toLocaleString("cs-CZ", { maximumFractionDigits: 0 }) + " Kč";
export const dateShort = (s: string) => new Date(s).toLocaleDateString("cs-CZ", { day: "numeric", month: "numeric", year: "numeric" });
export const dateTime = (s: string) => new Date(s).toLocaleString("cs-CZ", { day: "numeric", month: "numeric", hour: "2-digit", minute: "2-digit" });

export function useAsync<T>(fn: () => Promise<T>, deps: unknown[] = []) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [tick, setTick] = useState(0);
  useEffect(() => { let on = true; setLoading(true); fn().then((d) => { if (on) { setData(d); setLoading(false); } }).catch(() => on && setLoading(false)); return () => { on = false; }; }, [...deps, tick]); // eslint-disable-line react-hooks/exhaustive-deps
  return { data, loading, reload: () => setTick((x) => x + 1), setData };
}

export function downloadCsv(name: string, rows: Record<string, unknown>[]) {
  if (!rows.length) return;
  const keys = Object.keys(rows[0]);
  const esc = (v: unknown) => `"${String(v ?? "").replace(/"/g, '""')}"`;
  const csv = [keys.join(","), ...rows.map((r) => keys.map((k) => esc(r[k])).join(","))].join("\n");
  const a = document.createElement("a"); a.href = URL.createObjectURL(new Blob(["﻿" + csv], { type: "text/csv" })); a.download = name; a.click();
}
