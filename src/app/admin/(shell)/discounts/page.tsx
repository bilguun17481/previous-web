"use client";
import { useState } from "react";
import { adm } from "@/lib/admin/i18n";
import { repo } from "@/lib/admin/repo";
import { Badge, Button, Card, Field, Input, PageHeader, Select, Table, Td, Toggle, useAsync, useT, useToast } from "@/components/admin/ui";
import type { Discount } from "@/lib/types";

const blank: Partial<Discount> = { code: "", type: "percent", value: 10, min_total: null, usage_limit: null, active: true, starts_at: null, ends_at: null };

export default function Discounts() {
  const { t } = useT();
  const toast = useToast();
  const { data, reload } = useAsync(() => repo().discounts.list());
  const [edit, setEdit] = useState<Partial<Discount> | null>(null);
  const save = async () => { try { await repo().discounts.save({ ...edit, code: edit!.code!.toUpperCase().trim() }); toast(t(adm.common.saved)); setEdit(null); reload(); } catch (e) { toast((e as Error).message, "err"); } };
  const fmt = (d: Discount) => d.type === "percent" ? `${d.value} %` : d.type === "fixed" ? `${d.value} Kč` : t(adm.discounts.free_shipping);
  return (
    <>
      <PageHeader title={t(adm.discounts.title)} actions={<Button onClick={() => setEdit(blank)}>{t(adm.discounts.new)}</Button>} />
      {edit && (
        <Card className="mb-4" title={edit.id ? t(adm.common.edit) : t(adm.discounts.new)}>
          <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-6">
            <Field label={t(adm.discounts.code)}><Input value={edit.code ?? ""} onChange={(e) => setEdit({ ...edit, code: e.target.value })} /></Field>
            <Field label={t(adm.discounts.type)}><Select value={edit.type} onChange={(e) => setEdit({ ...edit, type: e.target.value as Discount["type"] })}><option value="percent">{t(adm.discounts.percent)}</option><option value="fixed">{t(adm.discounts.fixed)}</option><option value="free_shipping">{t(adm.discounts.free_shipping)}</option></Select></Field>
            <Field label={t(adm.discounts.value)}><Input type="number" value={edit.value ?? 0} onChange={(e) => setEdit({ ...edit, value: Number(e.target.value) })} disabled={edit.type === "free_shipping"} /></Field>
            <Field label={t(adm.discounts.minTotal)}><Input type="number" value={edit.min_total ?? ""} onChange={(e) => setEdit({ ...edit, min_total: e.target.value ? Number(e.target.value) : null })} /></Field>
            <Field label={t(adm.discounts.limit)}><Input type="number" value={edit.usage_limit ?? ""} onChange={(e) => setEdit({ ...edit, usage_limit: e.target.value ? Number(e.target.value) : null })} /></Field>
            <Field label={t(adm.discounts.from)}><Input type="date" value={edit.starts_at?.slice(0, 10) ?? ""} onChange={(e) => setEdit({ ...edit, starts_at: e.target.value ? new Date(e.target.value).toISOString() : null })} /></Field>
            <Field label={t(adm.discounts.to)}><Input type="date" value={edit.ends_at?.slice(0, 10) ?? ""} onChange={(e) => setEdit({ ...edit, ends_at: e.target.value ? new Date(e.target.value).toISOString() : null })} /></Field>
            <div className="flex items-end pb-2"><Toggle checked={edit.active ?? true} onChange={(v) => setEdit({ ...edit, active: v })} label={t(adm.common.enabled)} /></div>
          </div>
          <div className="mt-4 flex gap-2"><Button onClick={save} disabled={!edit.code}>{t(adm.common.save)}</Button><Button variant="secondary" onClick={() => setEdit(null)}>{t(adm.common.cancel)}</Button></div>
        </Card>
      )}
      <Table head={[t(adm.discounts.code), t(adm.discounts.type), t(adm.discounts.minTotal), t(adm.discounts.used), t(adm.discounts.to), t(adm.common.status), ""]}>
        {(data ?? []).map((d) => (
          <tr key={d.id} className="hover:bg-tile">
            <Td className="font-mono font-semibold">{d.code}</Td><Td>{fmt(d)}</Td><Td className="text-mute">{d.min_total ? `${d.min_total} Kč` : "—"}</Td>
            <Td>{d.usage_limit ? `${d.used} / ${d.usage_limit}` : d.used}</Td><Td className="text-mute">{d.ends_at ? d.ends_at.slice(0, 10) : "—"}</Td>
            <Td>{d.active ? <Badge tone="green">{t(adm.common.enabled)}</Badge> : <Badge>{t(adm.common.disabled)}</Badge>}</Td>
            <Td className="text-right"><Button variant="ghost" onClick={() => setEdit(d)}>{t(adm.common.edit)}</Button><Button variant="ghost" onClick={async () => { if (confirm(t(adm.common.confirmDelete))) { await repo().discounts.remove(d.id); reload(); } }}>{t(adm.common.delete)}</Button></Td>
          </tr>
        ))}
      </Table>
    </>
  );
}
