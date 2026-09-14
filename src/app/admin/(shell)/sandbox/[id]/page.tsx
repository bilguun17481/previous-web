"use client";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { adm } from "@/lib/admin/i18n";
import { repo } from "@/lib/admin/repo";
import { setActiveSandbox, useActiveSandbox } from "@/lib/admin/sandbox";
import { refreshStorefront } from "@/lib/admin/revalidate";
import { Badge, Button, Card, dateTime, money, PageHeader, Table, Td, useAsync, useT, useToast } from "@/components/admin/ui";
import type { ChangesetItem } from "@/lib/types";

const fmt = (k: string, v: unknown) => {
  if (v === null || v === undefined || v === "") return "—";
  if (k === "price" || k === "oldPrice") return money(Number(v));
  if (typeof v === "object") { const o = v as Record<string, unknown>; if ("cs" in o) return String(o.cs); if (Array.isArray(v)) return `${v.length} ×`; return "…"; }
  return String(v);
};
const KEYS: Record<string, { cs: string; en: string }> = { price: { cs: "Cena", en: "Price" }, oldPrice: { cs: "Původní cena", en: "Compare-at price" }, name: { cs: "Název", en: "Name" }, status: { cs: "Stav", en: "Status" }, featured: { cs: "Vybraný", en: "Featured" }, stock: { cs: "Sklad", en: "Stock" }, images: { cs: "Fotografie", en: "Photos" }, colors: { cs: "Barvy", en: "Colours" }, short: { cs: "Krátký popis", en: "Short description" }, description: { cs: "Popis", en: "Description" }, specs: { cs: "Technické údaje", en: "Specs" }, tags: { cs: "Štítky", en: "Tags" } };

function Changes({ it }: { it: ChangesetItem }) {
  const { t, lang } = useT(); const s = adm.sandbox;
  if (it.entity === "page") { const secs = (it.patch.sections as unknown[] | undefined)?.length ?? 0; return <span className="text-mute">{secs} {t(adm.pages.sections).toLowerCase()} · {String(it.patch.status ?? "")}</span>; }
  if (it.entity === "setting") return <span className="text-mute">{it.entity_id}</span>;
  const keys = Object.keys(it.patch);
  return (
    <ul className="space-y-0.5">
      {keys.map((k) => <li key={k}><span className="text-mute">{KEYS[k]?.[lang] ?? k}:</span> <span className="line-through text-mute">{fmt(k, it.before?.[k])}</span> → <strong>{fmt(k, it.patch[k])}</strong></li>)}
      {!keys.length && <li className="text-mute">{t(s.change)}</li>}
    </ul>
  );
}

export default function SandboxDetail() {
  const { t } = useT(); const toast = useToast(); const router = useRouter(); const s = adm.sandbox;
  const { id } = useParams<{ id: string }>();
  const active = useActiveSandbox();
  const { data: cs } = useAsync(() => repo().changesets.get(id), [id]);
  const { data: items, reload } = useAsync(() => repo().changesets.items(id), [id]);
  if (!cs) return <p className="text-mute">{t(adm.common.loading)}</p>;
  const isActive = active?.id === cs.id;
  const publish = async () => { if (!confirm(t(s.confirmPublish))) return; const n = await repo().changesets.publish(cs.id); if (isActive) setActiveSandbox(null); await refreshStorefront(["/"]); toast(`${t(s.publishedN)} ${n}`); router.push("/admin/sandbox/"); };
  const discard = async () => { if (!confirm(t(s.confirmDiscard))) return; await repo().changesets.update(cs.id, { status: "discarded" }); if (isActive) setActiveSandbox(null); router.push("/admin/sandbox/"); };
  const href = (it: ChangesetItem) => (it.entity === "product" ? `/admin/products/${it.entity_id}/` : it.entity === "page" ? `/admin/content/pages/${it.entity_id}/` : "/admin/settings/general/");
  return (
    <>
      <PageHeader title={cs.name} sub={cs.note ?? undefined} back={{ href: "/admin/sandbox/", label: t(s.title) }} actions={cs.status === "open" ? <>
        {isActive ? <Button variant="secondary" onClick={() => setActiveSandbox(null)}>{t(s.deactivate)}</Button> : <Button variant="secondary" onClick={() => setActiveSandbox({ id: cs.id, name: cs.name })}>{t(s.activate)}</Button>}
        <a href="/" target="_blank" onClick={() => setActiveSandbox({ id: cs.id, name: cs.name })} className="inline-flex h-9 items-center rounded-md border border-hair px-3.5 text-[13px] font-medium hover:bg-tile">{t(s.previewSite)}</a>
        <Button variant="danger" onClick={discard}>{t(s.discard)}</Button>
        <Button onClick={publish} disabled={!items?.length}>{t(s.publish)} ({items?.length ?? 0})</Button>
      </> : <Badge tone={cs.status === "published" ? "green" : "neutral"}>{cs.status === "published" ? t(s.published) : t(s.discarded)}</Badge>} />
      {isActive && <div className="mb-4 rounded-md border border-violet-200 bg-violet-50 px-4 py-2.5 text-[12px] text-violet-800">{t(s.modeHint)}</div>}
      <Card>
        {items && !items.length ? <p className="text-[13px] text-mute">{t(s.emptyItems)}</p> : (
          <Table head={["", t(adm.common.name), t(s.change), t(adm.common.date), ""]}>
            {(items ?? []).map((it) => (
              <tr key={it.id} className="align-top hover:bg-tile">
                <Td><Badge tone={it.entity === "product" ? "blue" : it.entity === "page" ? "amber" : "neutral"}>{t(s.entity[it.entity])}</Badge></Td>
                <Td><Link href={href(it)} className="font-semibold hover:underline">{it.label || it.entity_id}</Link></Td>
                <Td className="text-[12px]"><Changes it={it} /></Td>
                <Td className="text-mute">{dateTime(it.updated_at)}</Td>
                <Td className="text-right">{cs.status === "open" && <Button variant="ghost" onClick={async () => { await repo().changesets.unstage(it.id); reload(); }}>{t(s.removeItem)}</Button>}</Td>
              </tr>
            ))}
          </Table>
        )}
      </Card>
    </>
  );
}
