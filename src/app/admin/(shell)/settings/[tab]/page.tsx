"use client";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { adm } from "@/lib/admin/i18n";
import { repo, type Profile } from "@/lib/admin/repo";
import { Badge, Button, Card, Field, Input, PageHeader, Select, TextField, Toggle, useAsync, useT, useToast } from "@/components/admin/ui";
import { supabaseConfigured } from "@/lib/supabase/env";
import { refreshStorefront } from "@/lib/admin/revalidate";
import type { PaymentMethod, ShippingMethod, StoreSettings, Text } from "@/lib/types";

type Status = { payments: Record<string, boolean>; carriers: Record<string, { configured: boolean; capability: string }>; email: boolean; packetaWidget: boolean; siteUrl: string | null };
const tabs = ["general", "payments", "shipping", "taxes", "notifications", "theme", "team", "connections", "domains"] as const;

export default function Settings() {
  const { t } = useT();
  const { tab } = useParams<{ tab: string }>();
  return (
    <>
      <PageHeader title={t(adm.settings.title)} />
      <div className="mb-6 flex flex-wrap gap-1 border-b border-hair">{tabs.map((x) => <Link key={x} href={`/admin/settings/${x}/`} className={`-mb-px border-b-2 px-3 py-2 text-[13px] ${tab === x ? "border-ink font-semibold" : "border-transparent text-mute hover:text-ink"}`}>{t(adm.settings.tabs[x])}</Link>)}</div>
      {tab === "general" && <General />}{tab === "payments" && <Payments />}{tab === "shipping" && <Shipping />}{tab === "taxes" && <Taxes />}
      {tab === "notifications" && <Notifications />}{tab === "theme" && <Theme />}{tab === "team" && <Team />}{tab === "connections" && <Connections />}{tab === "domains" && <Domains />}
    </>
  );
}

function useSetting<T>(key: string, fallback: T) {
  const [v, setV] = useState<T>(fallback);
  const [loaded, setLoaded] = useState(false);
  useEffect(() => { repo().settings.get<T>(key).then((x) => { if (x) setV({ ...fallback, ...x }); setLoaded(true); }); }, [key]); // eslint-disable-line react-hooks/exhaustive-deps
  return { v, setV, loaded };
}
function SaveBar({ onSave }: { onSave: () => Promise<void> }) {
  const { t } = useT(); const toast = useToast(); const [busy, setBusy] = useState(false);
  return <Button disabled={busy} onClick={async () => { setBusy(true); try { await onSave(); await refreshStorefront(["/", "/pokladna/"]); toast(t(adm.common.saved)); } catch (e) { toast((e as Error).message, "err"); } setBusy(false); }}>{t(adm.common.save)}</Button>;
}
function useStatus() { const [s, setS] = useState<Status | null>(null); useEffect(() => { if (supabaseConfigured) fetch("/api/admin/status").then((r) => r.ok ? r.json() : null).then(setS).catch(() => {}); }, []); return s; }

function General() {
  const { t } = useT(); const s = adm.settings.store;
  const { v, setV } = useSetting<StoreSettings>("store", { name: "", legal: "", address: "", phone: "", email: "", ico: "", dic: "", hours: { cs: "", en: "" }, currency: "CZK", locales: ["cs", "en"], defaultLocale: "cs" });
  const { v: ann, setV: setAnn } = useSetting<{ enabled: boolean; text: Text }>("announcement", { enabled: true, text: { cs: "", en: "" } });
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <Card title={t(adm.settings.tabs.general)} actions={<SaveBar onSave={() => repo().settings.set("store", v)} />}>
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label={t(s.name)}><Input value={v.name} onChange={(e) => setV({ ...v, name: e.target.value })} /></Field>
          <Field label={t(s.legal)}><Input value={v.legal} onChange={(e) => setV({ ...v, legal: e.target.value })} /></Field>
          <Field label={t(s.address)} className="sm:col-span-2"><Input value={v.address} onChange={(e) => setV({ ...v, address: e.target.value })} /></Field>
          <Field label={t(s.phone)}><Input value={v.phone} onChange={(e) => setV({ ...v, phone: e.target.value })} /></Field>
          <Field label={t(s.email)}><Input value={v.email} onChange={(e) => setV({ ...v, email: e.target.value })} /></Field>
          <Field label={t(s.ico)}><Input value={v.ico} onChange={(e) => setV({ ...v, ico: e.target.value })} /></Field>
          <Field label={t(s.dic)}><Input value={v.dic} onChange={(e) => setV({ ...v, dic: e.target.value })} /></Field>
          <div className="sm:col-span-2"><TextField label={t(s.hours)} value={v.hours} onChange={(h) => setV({ ...v, hours: h })} /></div>
        </div>
      </Card>
      <Card title={t(s.announcement)} actions={<SaveBar onSave={() => repo().settings.set("announcement", ann)} />}>
        <Toggle checked={ann.enabled} onChange={(x) => setAnn({ ...ann, enabled: x })} label={t(adm.common.enabled)} />
        <div className="mt-3"><TextField label={t(adm.pages.f.text)} value={ann.text} onChange={(x) => setAnn({ ...ann, text: x })} /></div>
      </Card>
    </div>
  );
}

function Payments() {
  const { t } = useT(); const toast = useToast(); const status = useStatus();
  const { data, setData } = useAsync(() => repo().payments.list());
  const save = async (m: PaymentMethod) => { await repo().payments.save(m); await refreshStorefront(["/pokladna/"]); toast(t(adm.common.saved)); };
  const site = status?.siteUrl ?? (typeof window !== "undefined" ? window.location.origin : "");
  return (
    <div className="space-y-4">
      <p className="text-[13px] text-mute">{t(adm.settings.pay.hint)}</p>
      <div className="grid gap-4 lg:grid-cols-2">
        {(data ?? []).map((m, i) => {
          const gateway = !["bank_transfer", "cash"].includes(m.id);
          const conf = status?.payments[m.id];
          return (
            <Card key={m.id} title={t(m.name)} actions={<Button variant="secondary" onClick={() => save(m)}>{t(adm.common.save)}</Button>}>
              <div className="flex flex-wrap items-center gap-6">
                <Toggle checked={m.enabled} onChange={(v) => setData((data ?? []).map((x, k) => (k === i ? { ...x, enabled: v } : x)))} label={t(adm.common.enabled)} />
                {gateway && <Toggle checked={m.test_mode} onChange={(v) => setData((data ?? []).map((x, k) => (k === i ? { ...x, test_mode: v } : x)))} label={t(adm.settings.pay.testMode)} />}
                {gateway && status && (conf ? <Badge tone="green">{t(adm.settings.pay.configured)}</Badge> : <Badge tone="amber">{t(adm.settings.pay.missing)}</Badge>)}
              </div>
              {gateway && <div className="mt-3 text-[12px] text-mute">{t(adm.settings.pay.webhook)}: <code className="rounded bg-tile px-1">{site}/api/webhooks/{m.id}</code></div>}
              <div className="mt-3"><TextField label={t(adm.common.name)} value={m.name} onChange={(v) => setData((data ?? []).map((x, k) => (k === i ? { ...x, name: v } : x)))} /></div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

function Shipping() {
  const { t } = useT(); const toast = useToast(); const status = useStatus(); const s = adm.settings.ship;
  const { data, setData, reload } = useAsync(() => repo().shipping.list());
  const carriers = ["dealer", "packeta", "ppl", "dpd", "ceska_posta", "gls", "fofr"];
  const blank: ShippingMethod = { id: "", carrier: "packeta", name: { cs: "", en: "" }, description: { cs: "", en: "" }, price: 0, free_over: null, enabled: true, needs_pickup_point: false, vehicles: false, sort: (data?.length ?? 0) + 1 };
  const [draft, setDraft] = useState<ShippingMethod | null>(null);
  const upd = (i: number, p: Partial<ShippingMethod>) => setData((data ?? []).map((x, k) => (k === i ? { ...x, ...p } : x)));
  const Form = ({ m, onChange }: { m: ShippingMethod; onChange: (m: ShippingMethod) => void }) => (
    <div className="grid gap-3 sm:grid-cols-2">
      <Field label={t(s.id)}><Input value={m.id} onChange={(e) => onChange({ ...m, id: e.target.value.toLowerCase().replace(/[^a-z0-9_]+/g, "_") })} disabled={Boolean(data?.some((x) => x.id === m.id && x !== m))} /></Field>
      <Field label={t(s.carrier)}><Select value={m.carrier} onChange={(e) => onChange({ ...m, carrier: e.target.value })}>{carriers.map((c) => <option key={c} value={c}>{c}</option>)}</Select></Field>
      <div className="sm:col-span-2"><TextField label={t(adm.common.name)} value={m.name} onChange={(v) => onChange({ ...m, name: v })} /></div>
      <div className="sm:col-span-2"><TextField label={t(adm.pages.f.text)} value={m.description} onChange={(v) => onChange({ ...m, description: v })} /></div>
      <Field label={t(adm.common.price) + " (Kč)"}><Input type="number" value={m.price} onChange={(e) => onChange({ ...m, price: Number(e.target.value) })} /></Field>
      <Field label={t(s.freeOver)}><Input type="number" value={m.free_over ?? ""} onChange={(e) => onChange({ ...m, free_over: e.target.value ? Number(e.target.value) : null })} /></Field>
      <div className="flex flex-wrap gap-5 sm:col-span-2">
        <Toggle checked={m.enabled} onChange={(v) => onChange({ ...m, enabled: v })} label={t(adm.common.enabled)} />
        <Toggle checked={m.needs_pickup_point} onChange={(v) => onChange({ ...m, needs_pickup_point: v })} label={t(s.needsPoint)} />
        <Toggle checked={m.vehicles} onChange={(v) => onChange({ ...m, vehicles: v })} label={t(s.vehicles)} />
      </div>
    </div>
  );
  return (
    <div className="space-y-4">
      <div className="flex justify-end"><Button onClick={() => setDraft(blank)}>{t(s.new)}</Button></div>
      {draft && <Card title={t(s.new)} actions={<div className="flex gap-2"><Button variant="secondary" onClick={() => setDraft(null)}>{t(adm.common.cancel)}</Button><Button disabled={!draft.id} onClick={async () => { await repo().shipping.save(draft); setDraft(null); toast(t(adm.common.saved)); reload(); }}>{t(adm.common.save)}</Button></div>}><Form m={draft} onChange={setDraft} /></Card>}
      <div className="grid gap-4 lg:grid-cols-2">
        {(data ?? []).map((m, i) => {
          const c = status?.carriers[m.carrier];
          return (
            <Card key={m.id} title={t(m.name) || m.id} actions={<div className="flex items-center gap-2">
              {c && (c.capability === "api" ? <Badge tone={c.configured ? "green" : "amber"}>{c.configured ? t(s.api) : `${t(s.api)} · ${t(adm.settings.pay.missing)}`}</Badge> : <Badge>{t(s.manual)}</Badge>)}
              <Button variant="ghost" onClick={async () => { if (confirm(t(adm.common.confirmDelete))) { await repo().shipping.remove(m.id); reload(); } }}>{t(adm.common.delete)}</Button>
              <Button variant="secondary" onClick={async () => { await repo().shipping.save(m); toast(t(adm.common.saved)); }}>{t(adm.common.save)}</Button></div>}>
              <Form m={m} onChange={(x) => upd(i, x)} />
            </Card>
          );
        })}
      </div>
    </div>
  );
}

function Taxes() {
  const { t } = useT(); const { v, setV } = useSetting("taxes", { vatRate: 21, pricesIncludeVat: true });
  return <Card title={t(adm.settings.tabs.taxes)} actions={<SaveBar onSave={() => repo().settings.set("taxes", v)} />}><div className="grid max-w-md gap-3"><Field label={t(adm.settings.tax.rate)}><Input type="number" value={v.vatRate} onChange={(e) => setV({ ...v, vatRate: Number(e.target.value) })} /></Field><Toggle checked={v.pricesIncludeVat} onChange={(x) => setV({ ...v, pricesIncludeVat: x })} label={t(adm.settings.tax.incl)} /></div></Card>;
}
function Notifications() {
  const { t } = useT(); const status = useStatus(); const { v, setV } = useSetting("notifications", { orderEmailTo: "", customerConfirmation: true });
  return <Card title={t(adm.settings.tabs.notifications)} actions={<SaveBar onSave={() => repo().settings.set("notifications", v)} />}><div className="grid max-w-md gap-3"><Field label={t(adm.settings.notif.staff)}><Input type="email" value={v.orderEmailTo} onChange={(e) => setV({ ...v, orderEmailTo: e.target.value })} /></Field><Toggle checked={v.customerConfirmation} onChange={(x) => setV({ ...v, customerConfirmation: x })} label={t(adm.settings.notif.customer)} /><p className="text-[12px] text-mute">{t(adm.settings.notif.resend)} {status && (status.email ? <Badge tone="green">OK</Badge> : <Badge tone="amber">{t(adm.settings.pay.missing)}</Badge>)}</p></div></Card>;
}
function Theme() {
  const { t } = useT(); const { v, setV } = useSetting("theme", { accent: "#111111", signal: "#d0021b", font: "Inter" });
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <Card title={t(adm.settings.tabs.theme)} actions={<SaveBar onSave={() => repo().settings.set("theme", v)} />}>
        <div className="grid gap-3">
          <Field label={t(adm.settings.theme.accent)}><div className="flex gap-2"><input type="color" value={v.accent} onChange={(e) => setV({ ...v, accent: e.target.value })} className="h-9 w-12 rounded border border-hair" /><Input value={v.accent} onChange={(e) => setV({ ...v, accent: e.target.value })} /></div></Field>
          <Field label={t(adm.settings.theme.signal)}><div className="flex gap-2"><input type="color" value={v.signal} onChange={(e) => setV({ ...v, signal: e.target.value })} className="h-9 w-12 rounded border border-hair" /><Input value={v.signal} onChange={(e) => setV({ ...v, signal: e.target.value })} /></div></Field>
          <Field label={t(adm.settings.theme.font)}><Select value={v.font} onChange={(e) => setV({ ...v, font: e.target.value })}><option>Inter</option><option>Helvetica Neue</option><option>system-ui</option></Select></Field>
        </div>
      </Card>
      <Card title={t(adm.settings.theme.preview)}>
        <div className="space-y-3" style={{ fontFamily: v.font }}>
          <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-mute">Novinka 2026</div>
          <div className="text-[28px] font-bold tracking-[-0.02em]" style={{ color: v.accent }}>V-Cross 125</div>
          <div className="flex items-center gap-3"><span className="text-[18px] font-semibold" style={{ color: v.signal }}>69 990 Kč</span><span className="text-mute line-through">74 990 Kč</span></div>
          <button className="h-11 px-6 text-[12px] font-semibold uppercase tracking-[0.14em] text-paper" style={{ background: v.accent }}>Koupit</button>
        </div>
      </Card>
    </div>
  );
}
function Team() {
  const { t } = useT(); const toast = useToast(); const { data, reload } = useAsync(() => repo().team.list());
  const [email, setEmail] = useState(""); const [role, setRole] = useState<Profile["role"]>("staff");
  const invite = async () => { if (!supabaseConfigured) return toast(t(adm.common.demo), "err"); const r = await fetch("/api/admin/team", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email, role }) }); if (r.ok) { toast(t(adm.settings.team.invited)); setEmail(""); reload(); } else toast((await r.json()).error, "err"); };
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <Card title={t(adm.settings.tabs.team)}>
        <ul className="divide-y divide-hair text-[13px]">{(data ?? []).map((p) => <li key={p.id} className="flex items-center justify-between py-2.5"><div><div className="font-medium">{p.full_name || p.email}</div><div className="text-[11px] text-mute">{p.email}</div></div><Badge tone={p.role === "owner" ? "blue" : "neutral"}>{p.role}</Badge></li>)}</ul>
      </Card>
      <Card title={t(adm.settings.team.invite)}>
        <div className="grid gap-3"><Field label={t(adm.settings.store.email)}><Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} /></Field><Field label={t(adm.settings.team.role)}><Select value={role} onChange={(e) => setRole(e.target.value as Profile["role"])}><option value="staff">staff</option><option value="admin">admin</option></Select></Field><Button onClick={invite} disabled={!email}>{t(adm.settings.team.invite)}</Button></div>
      </Card>
    </div>
  );
}
function Connections() {
  const { t } = useT(); const status = useStatus(); const c = adm.settings.conn;
  const vars = ["NEXT_PUBLIC_SUPABASE_URL", "NEXT_PUBLIC_SUPABASE_ANON_KEY", "SUPABASE_SERVICE_ROLE_KEY", "NEXT_PUBLIC_SITE_URL", "STRIPE_SECRET_KEY", "STRIPE_WEBHOOK_SECRET", "GOPAY_GOID / GOPAY_CLIENT_ID / GOPAY_CLIENT_SECRET", "COMGATE_MERCHANT / COMGATE_SECRET", "PAYPAL_CLIENT_ID / PAYPAL_CLIENT_SECRET", "PACKETA_API_PASSWORD / NEXT_PUBLIC_PACKETA_API_KEY", "PPL_CLIENT_ID / PPL_CLIENT_SECRET", "GLS_USERNAME / GLS_PASSWORD / GLS_CLIENT_NUMBER", "RESEND_API_KEY"];
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <Card title={t(c.supabase)} actions={supabaseConfigured ? <Badge tone="green">OK</Badge> : <Badge tone="amber">{t(adm.settings.pay.missing)}</Badge>}>
        <ol className="list-decimal space-y-2 pl-5 text-[13px]">{c.steps.map((s, i) => <li key={i}>{t(s)}</li>)}</ol>
        <p className="mt-4 text-[12px] text-mute">{t(c.hint)}</p>
      </Card>
      <Card title="Environment variables">
        <ul className="space-y-1.5 font-mono text-[12px]">{vars.map((v) => <li key={v} className="flex items-center justify-between gap-3"><span>{v}</span>{status && v.startsWith("STRIPE") && (status.payments.stripe ? <Badge tone="green">OK</Badge> : <Badge tone="amber">—</Badge>)}{status && v.startsWith("PACKETA") && (status.carriers.packeta?.configured ? <Badge tone="green">OK</Badge> : <Badge tone="amber">—</Badge>)}{status && v.startsWith("RESEND") && (status.email ? <Badge tone="green">OK</Badge> : <Badge tone="amber">—</Badge>)}</li>)}</ul>
        <p className="mt-3 text-[12px] text-mute">.env.example</p>
      </Card>
    </div>
  );
}
function Domains() { const { t } = useT(); return <Card title={t(adm.settings.tabs.domains)}><p className="text-[13px]">{t(adm.settings.domains.hint)}</p></Card>; }
