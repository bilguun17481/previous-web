"use client";
import { useMemo, useState } from "react";
import { adm } from "@/lib/admin/i18n";
import { repo } from "@/lib/admin/repo";
import { Badge, dateShort, downloadCsv, Button, Input, money, PageHeader, Table, Td, useAsync, useT } from "@/components/admin/ui";
import Link from "next/link";

export default function Customers() {
  const { t } = useT();
  const [q, setQ] = useState("");
  const { data } = useAsync(async () => { const [customers, orders] = await Promise.all([repo().customers.list(), repo().orders.list()]); return { customers, orders }; });
  const rows = useMemo(() => (data?.customers ?? []).map((c) => { const os = (data?.orders ?? []).filter((o) => o.customer_email === c.email && o.status !== "cancelled"); return { ...c, orders: os.length, spent: os.filter((o) => o.payment_status === "paid").reduce((s, o) => s + o.total, 0), last: os[0] }; }).filter((c) => !q || `${c.name} ${c.email} ${c.phone}`.toLowerCase().includes(q.toLowerCase())), [data, q]);
  return (
    <>
      <PageHeader title={t(adm.customers.title)} sub={`${rows.length}`} actions={<Button variant="secondary" onClick={() => downloadCsv("customers.csv", rows.map((c) => ({ name: c.name, email: c.email, phone: c.phone, orders: c.orders, spent: c.spent, marketing: c.marketing, since: c.created_at })))}>{t(adm.common.export)}</Button>} />
      <Input placeholder={t(adm.nav.search)} value={q} onChange={(e) => setQ(e.target.value)} className="mb-4 max-w-xs" />
      <Table head={[t(adm.common.name), t(adm.orders.contact), t(adm.nav.orders), t(adm.customers.spent), t(adm.customers.marketing), t(adm.customers.since)]}>
        {rows.map((c) => (
          <tr key={c.id} className="hover:bg-tile">
            <Td className="font-semibold">{c.name ?? "—"}{c.address?.city ? <div className="text-[11px] font-normal text-mute">{c.address.city}</div> : null}</Td>
            <Td><a href={`mailto:${c.email}`} className="hover:underline">{c.email}</a><div className="text-[11px] text-mute">{c.phone}</div></Td>
            <Td>{c.orders} {c.last ? <Link href={`/admin/orders/${c.last.id}/`} className="text-[11px] text-mute hover:underline">· #{c.last.number}</Link> : null}</Td>
            <Td className="font-semibold">{money(c.spent)}</Td>
            <Td>{c.marketing ? <Badge tone="green">{t(adm.common.yes)}</Badge> : <Badge>{t(adm.common.no)}</Badge>}</Td>
            <Td className="text-mute">{dateShort(c.created_at)}</Td>
          </tr>
        ))}
      </Table>
    </>
  );
}
