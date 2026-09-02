"use client";
import Link from "next/link";
import { useState } from "react";
import { adm } from "@/lib/admin/i18n";
import { repo } from "@/lib/admin/repo";
import { Badge, Button, dateShort, Input, PageHeader, Table, Td, useAsync, useT } from "@/components/admin/ui";

export default function Pages() {
  const { t } = useT();
  const { data, reload } = useAsync(() => repo().pages.list());
  const [slug, setSlug] = useState("");
  const create = async () => { const s = slug.toLowerCase().replace(/[^a-z0-9-]+/g, "-"); if (!s) return; await repo().pages.save({ slug: s, title: { cs: s, en: s }, sections: [], status: "draft", seo: {}, updated_at: new Date().toISOString() }); setSlug(""); reload(); };
  return (
    <>
      <PageHeader title={t(adm.pages.title)} actions={<div className="flex gap-2"><Input placeholder={t(adm.pages.slug)} value={slug} onChange={(e) => setSlug(e.target.value)} className="w-44" /><Button onClick={create}>{t(adm.pages.new)}</Button></div>} />
      <Table head={[t(adm.pages.slug), t(adm.common.name), t(adm.pages.sections), t(adm.common.status), t(adm.common.date), ""]}>
        {(data ?? []).map((p) => (
          <tr key={p.slug} className="hover:bg-tile">
            <Td className="font-mono">/{p.slug === "home" ? "" : p.slug + "/"}</Td><Td className="font-semibold"><Link href={`/admin/content/pages/${p.slug}/`} className="hover:underline">{t(p.title) || p.slug}</Link></Td>
            <Td className="text-mute">{p.sections.length}</Td><Td>{p.status === "published" ? <Badge tone="green">{t(adm.pages.published)}</Badge> : <Badge tone="amber">{t(adm.pages.draft)}</Badge>}</Td>
            <Td className="text-mute">{dateShort(p.updated_at)}</Td>
            <Td className="text-right">{p.slug !== "home" && <Button variant="ghost" onClick={async () => { if (confirm(t(adm.common.confirmDelete))) { await repo().pages.remove(p.slug); reload(); } }}>{t(adm.common.delete)}</Button>}</Td>
          </tr>
        ))}
      </Table>
    </>
  );
}
