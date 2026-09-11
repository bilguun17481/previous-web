"use client";
import Link from "next/link";
import { useMemo, useState } from "react";
import { adm } from "@/lib/admin/i18n";
import { repo } from "@/lib/admin/repo";
import { Badge, Button, downloadCsv, Input, LinkButton, money, PageHeader, Select, Table, Td, useAsync, useT, useToast } from "@/components/admin/ui";
import { primaryImage } from "@/lib/productImage";
import { variant } from "@/lib/mediaVariants";
import { categories } from "@/data/catalog";
import { refreshStorefront } from "@/lib/admin/revalidate";

export default function Products() {
  const { t } = useT();
  const toast = useToast();
  const [q, setQ] = useState(""); const [cat, setCat] = useState(""); const [status, setStatus] = useState("");
  const [sel, setSel] = useState<Set<string>>(new Set());
  const { data, reload } = useAsync(() => repo().products.list());
  const list = useMemo(() => (data ?? []).filter((p) => (!cat || p.category === cat) && (!status || p.status === status) && (!q || `${p.name} ${p.brand} ${p.sku ?? ""}`.toLowerCase().includes(q.toLowerCase()))), [data, q, cat, status]);
  const bulk = async (s: "active" | "archived") => { for (const id of sel) { const p = list.find((x) => x.id === id); if (p) await repo().products.save({ ...p, status: s }); } setSel(new Set()); await refreshStorefront(["/", "/ctyrkolky/", "/utv/", "/motocykly/", "/skutry/", "/prislusenstvi/"]); toast(t(adm.common.saved)); reload(); };
  const tone = (s?: string) => (s === "active" ? "green" : s === "draft" ? "amber" : "neutral");
  return (
    <>
      <PageHeader title={t(adm.products.title)} sub={`${list.length}`} actions={<><Button variant="secondary" onClick={() => downloadCsv("products.csv", list.map((p) => ({ slug: p.slug, name: p.name, brand: p.brand, category: p.category, price: p.price, stock: p.stock, status: p.status })))}>{t(adm.common.export)}</Button><LinkButton href="/admin/products/new/">{t(adm.products.new)}</LinkButton></>} />
      <div className="mb-4 flex flex-wrap gap-2">
        <Input placeholder={t(adm.nav.search)} value={q} onChange={(e) => setQ(e.target.value)} className="max-w-xs" />
        <Select value={cat} onChange={(e) => setCat(e.target.value)} className="w-44!"><option value="">{t(adm.products.category)}: {t(adm.common.all)}</option>{categories.map((c) => <option key={c.slug} value={c.slug}>{t(c.label)}</option>)}</Select>
        <Select value={status} onChange={(e) => setStatus(e.target.value)} className="w-40!"><option value="">{t(adm.common.status)}: {t(adm.common.all)}</option><option value="active">{t(adm.products.statusActive)}</option><option value="draft">{t(adm.products.statusDraft)}</option><option value="archived">{t(adm.products.statusArchived)}</option></Select>
        {sel.size > 0 && <div className="ml-auto flex gap-2"><Button variant="secondary" onClick={() => bulk("active")}>{t(adm.products.bulkActivate)} ({sel.size})</Button><Button variant="secondary" onClick={() => bulk("archived")}>{t(adm.products.bulkArchive)}</Button></div>}
      </div>
      <Table head={[<input key="all" type="checkbox" className="accent-ink" checked={sel.size === list.length && list.length > 0} onChange={(e) => setSel(e.target.checked ? new Set(list.map((p) => p.id!)) : new Set())} />, "", t(adm.common.name), t(adm.products.category), t(adm.common.status), t(adm.common.stock), t(adm.common.price)]}>
        {list.map((p) => (
          <tr key={p.id} className="hover:bg-tile">
            <Td><input type="checkbox" className="accent-ink" checked={sel.has(p.id!)} onChange={(e) => { const n = new Set(sel); e.target.checked ? n.add(p.id!) : n.delete(p.id!); setSel(n); }} /></Td>
            <Td>{primaryImage(p) ? <img src={variant(primaryImage(p), "thumb")} alt="" className="h-10 w-10 rounded object-cover" loading="lazy" /> : <div className="h-10 w-10 rounded bg-tile" />}</Td>
            <Td><Link href={`/admin/products/${p.id}/`} className="font-semibold hover:underline">{p.name}</Link><div className="text-[11px] text-mute">{[p.brand, p.sku, p.featured ? "★" : null].filter(Boolean).join(" · ")}</div></Td>
            <Td className="text-mute">{t(categories.find((c) => c.slug === p.category)?.label ?? { cs: p.category, en: p.category })}</Td>
            <Td><Badge tone={tone(p.status)}>{p.status === "active" ? t(adm.products.statusActive) : p.status === "draft" ? t(adm.products.statusDraft) : t(adm.products.statusArchived)}</Badge></Td>
            <Td className={(p.stock ?? 0) <= 0 ? "text-signal" : ""}>{p.stock ?? 0}</Td>
            <Td className="font-semibold">{money(p.price)}{p.oldPrice && <span className="ml-1 text-[11px] font-normal text-mute line-through">{money(p.oldPrice)}</span>}</Td>
          </tr>
        ))}
      </Table>
    </>
  );
}
