"use client";
import { useParams } from "next/navigation";
import { useState } from "react";
import { adm } from "@/lib/admin/i18n";
import { repo } from "@/lib/admin/repo";
import { Badge, Button, Card, dateTime, Field, Input, money, PageHeader, Textarea, useAsync, useT, useToast } from "@/components/admin/ui";
import type { Order } from "@/lib/types";

const trackingUrls: Record<string, (n: string) => string> = {
  packeta: (n) => `https://tracking.packeta.com/cs/?id=${n}`, ppl: (n) => `https://www.ppl.cz/vyhledat-zasilku?shipmentId=${n}`, dpd: (n) => `https://tracking.dpd.de/status/cs_CZ/parcel/${n}`,
  ceska_posta: (n) => `https://www.postaonline.cz/trackandtrace/-/zasilka/cislo?parcelNumbers=${n}`, gls: (n) => `https://gls-group.eu/CZ/cs/sledovani-zasilek?match=${n}`, fofr: (n) => `https://www.fofr.cz/sledovani-zasilky/?cislo=${n}`,
};

export default function OrderDetail() {
  const { t } = useT();
  const toast = useToast();
  const { id } = useParams<{ id: string }>();
  const r = repo();
  const { data: o, reload } = useAsync(() => r.orders.get(id), [id]);
  const [tracking, setTracking] = useState<string | null>(null);
  const [note, setNote] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  if (!o) return <p className="text-mute">{t(adm.common.loading)}</p>;

  const patch = async (p: Partial<Order>, text: string, notify = false) => {
    setBusy(true);
    try {
      if (r.mode === "supabase") {
        const res = await fetch(`/api/orders/${o.id}/status`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...p, message: text, notify }) });
        if (!res.ok) throw new Error((await res.json()).error);
      } else await r.orders.update(o.id, { ...p, timeline: [...o.timeline, { at: new Date().toISOString(), text }] });
      toast(t(adm.common.saved)); reload();
    } catch (e) { toast((e as Error).message, "err"); }
    setBusy(false);
  };
  const label = async () => {
    setBusy(true);
    try {
      if (r.mode === "demo") { await r.orders.update(o.id, { tracking_number: `Z${Math.floor(Math.random() * 1e9)}`, status: "processing", timeline: [...o.timeline, { at: new Date().toISOString(), text: "Štítek vytvořen (demo)" }] }); }
      else { const res = await fetch(`/api/orders/${o.id}/label`, { method: "POST" }); const d = await res.json(); if (!res.ok) throw new Error(d.error); }
      toast(t(adm.common.saved)); reload();
    } catch (e) { toast((e as Error).message, "err"); }
    setBusy(false);
  };
  const tone = (s: string) => (s === "paid" || s === "fulfilled" ? "green" : s === "pending" || s === "processing" ? "amber" : "red");
  const tn = tracking ?? o.tracking_number ?? "";
  const turl = o.shipping_carrier && tn && trackingUrls[o.shipping_carrier]?.(tn);
  const addr = o.shipping_address ?? {};

  return (
    <>
      <PageHeader title={`#${o.number}`} sub={`${dateTime(o.created_at)} · ${o.payment_provider ?? ""}`} back={{ href: "/admin/orders/", label: t(adm.orders.title) }}
        actions={<><Button variant="secondary" onClick={() => window.print()}>{t(adm.orders.print)}</Button>
          {o.payment_status !== "paid" && <Button variant="secondary" disabled={busy} onClick={() => patch({ payment_status: "paid", status: o.status === "pending" ? "paid" : o.status }, "Platba přijata", true)}>{t(adm.orders.markPaid)}</Button>}
          {o.status !== "fulfilled" && o.status !== "cancelled" && <Button disabled={busy} onClick={() => patch({ status: "fulfilled" }, "Objednávka vyřízena", true)}>{t(adm.orders.markFulfilled)}</Button>}
          {o.status !== "cancelled" && <Button variant="danger" disabled={busy} onClick={() => confirm(t(adm.common.confirmDelete)) && patch({ status: "cancelled" }, "Objednávka stornována", true)}>{t(adm.orders.cancel)}</Button>}</>} />
      <div className="grid gap-4 lg:grid-cols-[2fr_1fr]">
        <div className="space-y-4">
          <Card title={t(adm.orders.items)} actions={<div className="flex gap-2"><Badge tone={tone(o.payment_status)}>{t(adm.orders.ps[o.payment_status])}</Badge><Badge tone={tone(o.status)}>{t(adm.orders.st[o.status])}</Badge></div>}>
            <ul className="divide-y divide-hair text-[13px]">
              {o.items.map((i) => <li key={i.slug} className="flex items-center gap-3 py-2.5">{i.image ? <img src={i.image} alt="" className="h-10 w-10 rounded object-cover" /> : <div className="h-10 w-10 rounded bg-tile" />}<div className="flex-1"><div className="font-medium">{i.name}</div><div className="text-[11px] text-mute">{i.brand} · {i.slug}</div></div><div className="text-mute">{i.qty} × {money(i.price)}</div><div className="w-24 text-right font-semibold">{money(i.price * i.qty)}</div></li>)}
            </ul>
            <dl className="mt-3 space-y-1 border-t border-hair pt-3 text-[13px]">
              <div className="flex justify-between"><dt className="text-mute">Mezisoučet</dt><dd>{money(o.subtotal)}</dd></div>
              <div className="flex justify-between"><dt className="text-mute">{t(adm.orders.shipping)} · {o.shipping_method}</dt><dd>{money(o.shipping_cost)}</dd></div>
              {o.discount_amount > 0 && <div className="flex justify-between text-signal"><dt>Sleva {o.discount_code}</dt><dd>−{money(o.discount_amount)}</dd></div>}
              <div className="flex justify-between text-[15px] font-semibold"><dt>{t(adm.common.total)}</dt><dd>{money(o.total)}</dd></div>
            </dl>
          </Card>
          <Card title={t(adm.orders.shipping)}>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="text-[13px]"><div className="text-[11px] uppercase tracking-[0.08em] text-mute">{t(adm.orders.address)}</div>{o.pickup_point ? <div className="mt-1"><span className="text-mute">{t(adm.orders.pickup)}:</span> {String((o.pickup_point as { name?: string }).name ?? "")}</div> : <div className="mt-1">{addr.street}<br />{addr.zip} {addr.city}</div>}<div className="mt-2 text-mute">{o.shipping_carrier}</div></div>
              <div>
                <Field label={t(adm.orders.tracking)}><Input value={tn} onChange={(e) => setTracking(e.target.value)} /></Field>
                <div className="mt-2 flex flex-wrap gap-2">
                  <Button variant="secondary" disabled={busy || !tn} onClick={() => patch({ tracking_number: tn, status: o.status === "paid" ? "processing" : o.status }, `Zásilka: ${tn}`, true)}>{t(adm.orders.saveTracking)}</Button>
                  {o.shipping_carrier && o.shipping_carrier !== "dealer" && <Button disabled={busy} onClick={label}>{t(adm.orders.label)}</Button>}
                </div>
                {turl ? <a href={turl} target="_blank" className="mt-2 block text-[12px] underline underline-offset-4">Tracking →</a> : null}
                {o.label_url ? <a href={o.label_url} target="_blank" className="mt-1 block text-[12px] underline underline-offset-4">PDF štítek →</a> : null}
              </div>
            </div>
          </Card>
          <Card title={t(adm.orders.notes)}>
            <Textarea value={note ?? o.notes ?? ""} onChange={(e) => setNote(e.target.value)} />
            <Button variant="secondary" className="mt-2" disabled={busy || note === null} onClick={() => patch({ notes: note ?? "" }, "Poznámka upravena")}>{t(adm.common.save)}</Button>
          </Card>
        </div>
        <div className="space-y-4">
          <Card title={t(adm.orders.contact)}>
            <div className="text-[13px]"><div className="font-medium">{o.customer_name}</div><a href={`mailto:${o.customer_email}`} className="text-mute hover:underline">{o.customer_email}</a><div className="text-mute">{o.phone}</div></div>
            {o.notes ? <p className="mt-3 rounded bg-tile p-2 text-[12px]">{o.notes}</p> : null}
          </Card>
          <Card title={t(adm.orders.timeline)}>
            <ul className="space-y-2 text-[12px]">{[...o.timeline].reverse().map((e, i) => <li key={i} className="flex gap-3"><span className="w-24 shrink-0 text-mute">{dateTime(e.at)}</span><span>{e.text}</span></li>)}</ul>
          </Card>
        </div>
      </div>
    </>
  );
}
