"use client";
import { adm } from "@/lib/admin/i18n";
import { repo, type CategoryRow } from "@/lib/admin/repo";
import { Button, Card, Field, PageHeader, TextField, useAsync, useT, useToast } from "@/components/admin/ui";
import { MediaPicker } from "@/components/admin/MediaPicker";
import { refreshStorefront } from "@/lib/admin/revalidate";

export default function Categories() {
  const { t } = useT();
  const toast = useToast();
  const { data, setData } = useAsync(() => repo().categories.list());
  const set = (i: number, c: CategoryRow) => setData((data ?? []).map((x, k) => (k === i ? c : x)));
  const save = async (c: CategoryRow) => { try { await repo().categories.save(c); await refreshStorefront(["/", `/${c.slug}/`]); toast(t(adm.common.saved)); } catch (e) { toast((e as Error).message, "err"); } };
  return (
    <>
      <PageHeader title={t(adm.categories.title)} />
      <div className="grid gap-4 lg:grid-cols-2">
        {(data ?? []).map((c, i) => (
          <Card key={c.slug} title={`/${c.slug}/`} actions={<Button onClick={() => save(c)}>{t(adm.common.save)}</Button>}>
            <div className="space-y-3">
              <TextField label={t(adm.common.name)} value={c.label} onChange={(v) => set(i, { ...c, label: v })} />
              <TextField label={t(adm.categories.blurb)} value={c.blurb} onChange={(v) => set(i, { ...c, blurb: v })} multiline />
              <Field label={t(adm.categories.hero)}><MediaPicker value={c.video_url ? { kind: "video", url: c.video_url } : c.image_url ? { kind: "image", url: c.image_url } : undefined} onChange={(m) => set(i, { ...c, image_url: m?.kind === "image" ? m.url : null, video_url: m && m.kind !== "image" ? m.url : null })} /></Field>
            </div>
          </Card>
        ))}
      </div>
    </>
  );
}
