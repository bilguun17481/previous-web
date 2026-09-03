"use client";
import { adm } from "@/lib/admin/i18n";
import { repo } from "@/lib/admin/repo";
import { Card, money, PageHeader, useAsync, useT } from "@/components/admin/ui";
import { Bars } from "@/components/admin/Chart";
import { categories } from "@/data/catalog";

export default function Analytics() {
  const { t } = useT();
  const { data } = useAsync(async () => { const r = repo(); const [orders, products, days] = await Promise.all([r.orders.list(), r.products.list(), r.salesByDay(90)]); return { orders, products, days }; });
  const paid = (data?.orders ?? []).filter((o) => o.payment_status === "paid");
  const agg = (key: (o: typeof paid[number]) => string) => Object.entries(paid.reduce<Record<string, number>>((m, o) => { const k = key(o) || "—"; m[k] = (m[k] ?? 0) + o.total; return m; }, {})).sort((a, b) => b[1] - a[1]);
  const top = Object.entries(paid.flatMap((o) => o.items).reduce<Record<string, { name: string; qty: number; rev: number }>>((m, i) => { m[i.slug] = { name: i.name, qty: (m[i.slug]?.qty ?? 0) + i.qty, rev: (m[i.slug]?.rev ?? 0) + i.price * i.qty }; return m; }, {})).sort((a, b) => b[1].rev - a[1].rev).slice(0, 8);
  const byCat = agg((o) => { const cats = o.items.map((i) => data?.products.find((p) => p.slug === i.slug)?.category ?? "—"); return cats[0]; });
  const Rows = ({ rows }: { rows: [string, number][] }) => { const max = Math.max(1, ...rows.map((r) => r[1])); return <ul className="space-y-2 text-[13px]">{rows.map(([k, v]) => <li key={k}><div className="flex justify-between"><span>{k}</span><span className="font-semibold">{money(v)}</span></div><div className="mt-1 h-1.5 rounded bg-tile"><div className="h-full rounded bg-ink" style={{ width: `${(v / max) * 100}%` }} /></div></li>)}{!rows.length && <li className="text-mute">{t(adm.common.empty)}</li>}</ul>; };
  return (
    <>
      <PageHeader title={t(adm.analytics.title)} sub={t(adm.analytics.days90)} />
      <Card title={t(adm.dash.chart)}>{data ? <Bars data={data.days} height={200} /> : <div className="h-52" />}</Card>
      <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Card title={t(adm.analytics.topProducts)}><ul className="space-y-2 text-[13px]">{top.map(([slug, v]) => <li key={slug} className="flex justify-between gap-2"><span className="truncate">{v.name} <span className="text-mute">· {v.qty} {t(adm.analytics.sold)}</span></span><span className="shrink-0 font-semibold">{money(v.rev)}</span></li>)}</ul></Card>
        <Card title={t(adm.analytics.byCategory)}><Rows rows={byCat.map(([k, v]) => [t(categories.find((c) => c.slug === k)?.label ?? { cs: k, en: k }), v])} /></Card>
        <Card title={t(adm.analytics.byPayment)}><Rows rows={agg((o) => o.payment_provider ?? "")} /></Card>
        <Card title={t(adm.analytics.byShipping)}><Rows rows={agg((o) => o.shipping_method ?? "")} /></Card>
      </div>
    </>
  );
}
