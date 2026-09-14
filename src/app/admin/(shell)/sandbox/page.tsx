"use client";
import Link from "next/link";
import { useState } from "react";
import { adm } from "@/lib/admin/i18n";
import { repo } from "@/lib/admin/repo";
import { setActiveSandbox, useActiveSandbox } from "@/lib/admin/sandbox";
import { refreshStorefront } from "@/lib/admin/revalidate";
import { Badge, Button, dateShort, Input, PageHeader, Table, Td, useAsync, useT, useToast } from "@/components/admin/ui";

export default function SandboxList() {
  const { t } = useT(); const toast = useToast(); const s = adm.sandbox;
  const active = useActiveSandbox();
  const { data, reload } = useAsync(() => repo().changesets.list());
  const [name, setName] = useState("");
  const create = async () => { const n = name.trim(); if (!n) return; const c = await repo().changesets.create(n); setName(""); setActiveSandbox({ id: c.id, name: c.name }); reload(); };
  const publish = async (id: string, nm: string) => { if (!confirm(t(s.confirmPublish))) return; const n = await repo().changesets.publish(id); if (active?.id === id) setActiveSandbox(null); await refreshStorefront(["/"]); toast(`${t(s.publishedN)} ${n} (${nm})`); reload(); };
  const discard = async (id: string) => { if (!confirm(t(s.confirmDiscard))) return; await repo().changesets.update(id, { status: "discarded" }); if (active?.id === id) setActiveSandbox(null); reload(); };
  const tone = (st: string) => (st === "open" ? "blue" : st === "published" ? "green" : "neutral");
  return (
    <>
      <PageHeader title={t(s.title)} actions={<div className="flex gap-2"><Input placeholder={t(s.namePh)} value={name} onChange={(e) => setName(e.target.value)} onKeyDown={(e) => e.key === "Enter" && create()} className="w-56" /><Button onClick={create}>{t(s.new)}</Button></div>} />
      <p className="mb-5 max-w-3xl text-[13px] text-mute">{t(s.intro)}</p>
      <div className="mb-5 flex items-center gap-3 rounded-md border border-hair bg-paper px-4 py-3 text-[13px]">
        <span className={`h-2.5 w-2.5 rounded-full ${active ? "bg-violet-600" : "bg-emerald-500"}`} />
        {active ? <><span>{t(s.active)}: <strong>{active.name}</strong></span><span className="text-mute">· {t(s.modeHint)}</span><Button variant="secondary" className="ml-auto" onClick={() => setActiveSandbox(null)}>{t(s.deactivate)}</Button></> : <span>{t(s.live)}</span>}
      </div>
      {data && !data.length && <p className="text-[13px] text-mute">{t(s.none)}</p>}
      {data && data.length > 0 && (
        <Table head={[t(adm.common.name), t(s.items), t(adm.common.status), t(adm.common.date), ""]}>
          {data.map((c) => (
            <tr key={c.id} className="hover:bg-tile">
              <Td><Link href={`/admin/sandbox/${c.id}/`} className="font-semibold hover:underline">{c.name}</Link>{active?.id === c.id && <Badge tone="blue">{t(s.active)}</Badge>}{c.note && <div className="text-[11px] text-mute">{c.note}</div>}</Td>
              <Td className="text-mute">{c.item_count ?? 0}</Td>
              <Td><Badge tone={tone(c.status)}>{c.status === "open" ? t(s.open) : c.status === "published" ? t(s.published) : t(s.discarded)}</Badge></Td>
              <Td className="text-mute">{dateShort(c.published_at ?? c.created_at)}</Td>
              <Td className="text-right">{c.status === "open" && <div className="flex justify-end gap-1">
                {active?.id === c.id ? <Button variant="ghost" onClick={() => setActiveSandbox(null)}>{t(s.deactivate)}</Button> : <Button variant="ghost" onClick={() => setActiveSandbox({ id: c.id, name: c.name })}>{t(s.activate)}</Button>}
                <a href="/" target="_blank" onClick={() => setActiveSandbox({ id: c.id, name: c.name })} className="inline-flex h-9 items-center rounded-md px-3.5 text-[13px] font-medium hover:bg-tile">{t(s.previewSite)}</a>
                <Button variant="ghost" onClick={() => publish(c.id, c.name)}>{t(s.publish)}</Button>
                <Button variant="ghost" onClick={() => discard(c.id)}>{t(s.discard)}</Button>
              </div>}</Td>
            </tr>
          ))}
        </Table>
      )}
    </>
  );
}
