"use client";
import Link from "next/link";
import { adm } from "@/lib/admin/i18n";
import { repo } from "@/lib/admin/repo";
import { Badge, Card, dateShort, money, Table, Td, useAsync, useT } from "@/components/admin/ui";
import { Bars } from "@/components/admin/Chart";
import { supabaseConfigured } from "@/lib/supabase/env";
import { useEffect, useState } from "react";

export default function Dashboard() {
  const { t } = useT();
  const r = repo();
  const [today, setToday] = useState("");
  useEffect(() => setToday(new Date().toLocaleDateString("cs-CZ", { weekday: "long", day: "numeric", month: "long" })), []);
  const { data } = useAsync(async () => {
    const [orders, products, days] = await Promise.all([r.orders.list(), r.products.list(), r.salesByDay(30)]);
    return { orders, products, days };
  });
  const orders = data?.orders ?? [];
  const todayKey = new Date().toDateString();
  const paid = orders.filter((o) => o.payment_status === "paid");
  const todayPaid = paid.filter((o) => new Date(o.created_at).toDateString() === todayKey);
  const rev30 = paid.filter((o) => Date.now() - new Date(o.created_at).getTime() < 30 * 864e5).reduce((s, o) => s + o.total, 0);
  const openOrders = orders.filter((o) => o.status === "paid" || o.status === "processing");
  const low = (data?.products ?? []).filter((p) => (p.stock ?? 0) <= 1 && p.status === "active");
  const tone = (s: string) => (s === "paid" || s === "fulfilled" ? "green" : s === "pending" || s === "processing" ? "amber" : s === "cancelled" || s === "refunded" ? "red" : "neutral");

  return (
    <>
      <div className="mb-6 flex items-end justify-between">
        <div><h1 className="text-[24px] font-semibold tracking-[-0.01em]">{t(adm.dash.title)}</h1><p className="text-[13px] text-mute">{today}</p></div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          [t(adm.dash.revenue) + " · " + t(adm.dash.today), money(todayPaid.reduce((s, o) => s + o.total, 0))],
          [t(adm.dash.revenue) + " · " + t(adm.dash.last30), money(rev30)],
          [t(adm.dash.aov), money(paid.length ? paid.reduce((s, o) => s + o.total, 0) / paid.length : 0)],
          [t(adm.dash.open), String(openOrders.length)],
        ].map(([k, v]) => <Card key={k}><div className="text-[12px] text-mute">{k}</div><div className="mt-1 text-[24px] font-semibold tracking-[-0.01em]">{v}</div></Card>)}
      </div>
      <div className="mt-4 grid gap-4 lg:grid-cols-[2fr_1fr]">
        <Card title={t(adm.dash.chart)}>{data ? <Bars data={data.days} /> : <div className="h-40" />}</Card>
        <Card title={t(adm.dash.setup)}>
          <ul className="space-y-2 text-[13px]">
            {adm.dash.setupItems.map((it, i) => {
              const done = i === 0 ? supabaseConfigured : false;
              return <li key={i} className="flex items-start gap-2.5"><span className={`mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full border ${done ? "border-ink bg-ink text-paper" : "border-neutral-300"}`}>{done && <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M5 12l5 5L20 7" /></svg>}</span><Link href={it.href} className={`hover:underline ${done ? "text-mute line-through" : ""}`}>{t(it)}</Link></li>;
            })}
          </ul>
        </Card>
      </div>
      <div className="mt-4 grid gap-4 lg:grid-cols-[2fr_1fr]">
        <Card title={t(adm.dash.recent)} actions={<Link href="/admin/orders/" className="text-[12px] text-mute hover:text-ink">{t(adm.common.all)} →</Link>}>
          <Table head={[t(adm.orders.number), t(adm.common.customer), t(adm.common.date), t(adm.orders.payment), t(adm.common.status), t(adm.common.total)]}>
            {orders.slice(0, 6).map((o) => (
              <tr key={o.id} className="hover:bg-tile"><Td><Link href={`/admin/orders/${o.id}/`} className="font-semibold hover:underline">#{o.number}</Link></Td><Td>{o.customer_name}</Td><Td className="text-mute">{dateShort(o.created_at)}</Td><Td><Badge tone={tone(o.payment_status)}>{t(adm.orders.ps[o.payment_status])}</Badge></Td><Td><Badge tone={tone(o.status)}>{t(adm.orders.st[o.status])}</Badge></Td><Td className="font-semibold">{money(o.total)}</Td></tr>
            ))}
          </Table>
        </Card>
        <Card title={t(adm.dash.lowStock)}>
          <ul className="space-y-2 text-[13px]">{low.slice(0, 8).map((p) => <li key={p.slug} className="flex justify-between"><Link href={`/admin/products/${p.id}/`} className="hover:underline">{p.name}</Link><span className={`${(p.stock ?? 0) <= 0 ? "text-signal" : "text-mute"}`}>{p.stock}</span></li>)}{!low.length && <li className="text-mute">{t(adm.common.empty)}</li>}</ul>
        </Card>
      </div>
    </>
  );
}
