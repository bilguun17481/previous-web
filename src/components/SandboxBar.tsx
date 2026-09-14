"use client";
import { usePathname } from "next/navigation";
import { adm } from "@/lib/admin/i18n";
import { clearSandboxCookie } from "@/lib/admin/sandbox";
import { useLang } from "@/lib/i18n";

/** Fixed banner on the storefront while a staff member previews a sandbox. */
export function SandboxBar({ name }: { name: string }) {
  const { t } = useLang();
  const pathname = usePathname();
  if (pathname?.startsWith("/admin")) return null;
  return (
    <div className="fixed inset-x-0 bottom-0 z-50 flex flex-wrap items-center justify-center gap-x-4 gap-y-1 bg-violet-700 px-4 py-2 text-[12px] text-white shadow-lg">
      <span className="font-semibold">{t(adm.sandbox.previewBar)}: {name}</span>
      <span className="text-violet-200">{t(adm.sandbox.previewHint)}</span>
      <a href="/admin/sandbox/" className="underline underline-offset-4">Admin</a>
      <button onClick={() => { clearSandboxCookie(); try { localStorage.removeItem("md-sandbox-active"); } catch {} location.reload(); }} className="rounded border border-white/60 px-2 py-0.5 hover:bg-white hover:text-violet-700">{t(adm.sandbox.previewExit)}</button>
    </div>
  );
}
