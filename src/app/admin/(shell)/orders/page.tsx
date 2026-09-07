"use client";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useMemo, useState } from "react";
import { adm } from "@/lib/admin/i18n";
import { repo } from "@/lib/admin/repo";
import { Badge, Button, dateShort, downloadCsv, money, PageHeader, Select, Input, Table, Td, useAsync, useT } from "@/components/admin/ui";

function Orders() {
  const { t } = useT();
  const [q, setQ] = useState(useSearchParams().get("q") ?? "");
  const [status, setStatus] = useState(""); const [pay, setPay] = useState("");
  const { data } = useAsync(() => repo().orders.list());
  const list = useMemo(() => (data ?? []).filter((o) => (!status || o.status === status) && (!pay || o.payment_status === pay) && (!q || `${o.number} ${o.customer_name} ${o.customer_email} ${o.items.map((i) => i.name).join(" ")}`.toLowerCase().includes(q.toLowerCase()))), [data, status, pay, q]);
  const tone = (s: string) => (s === "paid" || s === "fulfilled" ? "green" : s === "pending" || s === "processing" ? "amber" : s === "cancelled" || s === "refunded" || s === "failed" ? "red" : "neutral");
  return (
    <>
      <PageHeader title={t(adm.orders.title)} sub={`${list.length}`} actions={<Button variant="secondary" onClick={() => downloadCsv("orders.csv", list.map((o) => ({ number: o.number, date: o.created_at, customer: o.customer_name, email: o.customer_email, total: o.total, status: o.status, payment: o.payment_status, provider: o.payment_provider, shipping: o.shipping_method, tracking: o.tracking_number })))}>{t(adm.common.export)}</Button>} />
      <div className="mb-4 flex flex-wrap gap-2">
        <Input placeholder={t(adm.nav.search)} value={q} onChange={(e) => setQ(e.target.value)} className="max-w-xs" />
        <Select value={status} onChange={(e) => setStatus(e.target.value)} className="w-44!"><option value="">{t(adm.orders.filterStatus)}: {t(adm.common.all)}</option>{Object.entries(adm.orders.st).map(([k, v]) => <option key={k} value={k}>{t(v)}</option>)}</Select>
        <Select value={pay} onChange={(e) => setPay(e.target.value)} className="w-44!"><option value="">{t(adm.orders.filterPayment)}: {t(adm.common.all)}</option>{Object.entries(adm.orders.ps).map(([k, v]) => <option key={k} value={k}>{t(v)}</option>)}</Select>
      </div>
      <Table head={[t(adm.orders.number), t(adm.common.date), t(adm.common.customer), t(adm.orders.items), t(adm.orders.payment), t(adm.common.status), t(adm.orders.shipping), t(adm.common.total)]}>
        {list.map((o) => (
          <tr key={o.id} className="hover:bg-tile">
            <Td><Link href={`/admin/orders/${o.id}/`} className="font-semibold hover:underline">#{o.number}</Link></Td>
            <Td className="text-mute">{dateShort(o.created_at)}</Td>
            <Td>{o.customer_name}<div className="text-[11px] text-mute">{o.customer_email}</div></Td>
            <Td className="text-mute">{o.items.reduce((s, i) => s + i.qty, 0)}</Td>
            <Td><Badge tone={tone(o.payment_status)}>{t(adm.orders.ps[o.payment_status])}</Badge> <span className="text-[11px] text-mute">{o.payment_provider}</span></Td>
            <Td><Badge tone={tone(o.status)}>{t(adm.orders.st[o.status])}</Badge></Td>
            <Td className="text-mute">{o.shipping_carrier}{o.tracking_number ? <div className="text-[11px]">{o.tracking_number}</div> : null}</Td>
            <Td className="font-semibold">{money(o.total)}</Td>
          </tr>
        ))}
        {!list.length && <tr><Td colSpan={8} className="text-center text-mute">{t(adm.common.empty)}</Td></tr>}
      </Table>
    </>
  );
}
export default function Page() { return <Suspense><Orders /></Suspense>; }
