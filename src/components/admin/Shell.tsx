"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, type ReactNode } from "react";
import { adm } from "@/lib/admin/i18n";
import { repo } from "@/lib/admin/repo";
import { useLang } from "@/lib/i18n";
import { supabaseConfigured } from "@/lib/supabase/env";
import { supabaseBrowser } from "@/lib/supabase/client";
import { ToastProvider, useT } from "./ui";

const I = {
  home: "M3 11l9-8 9 8v9a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z", orders: "M6 3h12l1 4H5zM5 7h14v13H5zM9 11h6", products: "M4 7l8-4 8 4v10l-8 4-8-4zM4 7l8 4 8-4M12 11v10",
  customers: "M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM22 21v-2a4 4 0 0 0-3-3.9M16 3.1a4 4 0 0 1 0 7.8", discounts: "M20 12l-8 8-8-8V4h8zM8 8h.01",
  content: "M4 4h16v16H4zM4 9h16M9 9v11", analytics: "M4 20V10M10 20V4M16 20v-7M22 20H2", settings: "M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z",
};
const Icon = ({ d }: { d: string }) => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d={d} /></svg>;

export function AdminShell({ children }: { children: ReactNode }) {
  const { t } = useT();
  const { lang, setLang } = useLang();
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const nav = [
    { href: "/admin/", key: "home", icon: I.home }, { href: "/admin/orders/", key: "orders", icon: I.orders }, { href: "/admin/products/", key: "products", icon: I.products },
    { href: "/admin/customers/", key: "customers", icon: I.customers }, { href: "/admin/discounts/", key: "discounts", icon: I.discounts },
    { href: "/admin/content/pages/", key: "content", icon: I.content, children: [{ href: "/admin/content/pages/", key: "pages" }, { href: "/admin/content/media/", key: "media" }, { href: "/admin/content/categories/", key: "categories" }] },
    { href: "/admin/analytics/", key: "analytics", icon: I.analytics }, { href: "/admin/settings/general/", key: "settings", icon: I.settings },
  ] as const;
  const active = (href: string) => href === "/admin/" ? pathname === "/admin" || pathname === "/admin/" : pathname.startsWith(href.replace(/\/$/, ""));
  const logout = async () => { if (supabaseConfigured) await supabaseBrowser().auth.signOut(); router.push("/admin/login/"); };

  return (
    <ToastProvider>
      <div className="min-h-screen bg-[#f6f6f4] text-ink">
        <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b border-hair bg-paper px-4">
          <button className="lg:hidden" onClick={() => setOpen(!open)} aria-label="Menu"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M3 7h18M3 12h18M3 17h18" /></svg></button>
          <Link href="/admin/" className="text-[15px] font-extrabold uppercase tracking-[-0.03em]">Moto Dvořák <span className="ml-1 rounded bg-tile px-1.5 py-0.5 text-[10px] font-semibold tracking-normal text-mute">ADMIN</span></Link>
          <div className="hidden flex-1 md:block"><input placeholder={t(adm.nav.search)} className="h-8 w-full max-w-md rounded-md border border-hair bg-[#f6f6f4] px-3 text-[13px] outline-none focus:border-ink" onKeyDown={(e) => { if (e.key === "Enter") router.push(`/admin/orders/?q=${encodeURIComponent((e.target as HTMLInputElement).value)}`); }} /></div>
          <div className="ml-auto flex items-center gap-3 text-[12px]">
            {repo().mode === "demo" && <span className="hidden rounded-full bg-amber-50 px-2 py-0.5 font-medium text-amber-700 md:inline">Demo</span>}
            <div className="flex">{(["cs", "en"] as const).map((l) => <button key={l} onClick={() => setLang(l)} className={`px-1.5 font-semibold uppercase ${lang === l ? "" : "text-mute"}`}>{l === "cs" ? "CZ" : "EN"}</button>)}</div>
            <Link href="/" target="_blank" className="hidden rounded-md border border-hair px-2.5 py-1.5 hover:bg-tile sm:inline">{t(adm.nav.viewStore)}</Link>
            <button onClick={logout} className="rounded-md px-2 py-1.5 hover:bg-tile">{t(adm.nav.logout)}</button>
          </div>
        </header>
        <div className="flex">
          <aside className={`${open ? "block" : "hidden"} fixed inset-y-14 left-0 z-20 w-56 shrink-0 border-r border-hair bg-paper p-3 lg:static lg:block lg:h-[calc(100vh-3.5rem)] lg:sticky lg:top-14`}>
            <nav className="space-y-0.5">
              {nav.map((n) => (
                <div key={n.key}>
                  <Link href={n.href} onClick={() => setOpen(false)} className={`flex items-center gap-2.5 rounded-md px-2.5 py-2 text-[13px] font-medium ${active(n.href) && !("children" in n) ? "bg-ink text-paper" : active(n.href) ? "text-ink" : "text-neutral-600 hover:bg-tile"}`}>
                    <Icon d={n.icon} />{t(adm.nav[n.key])}
                  </Link>
                  {"children" in n && active("/admin/content/") && (
                    <div className="ml-7 mt-0.5 space-y-0.5">{n.children.map((c) => <Link key={c.key} href={c.href} onClick={() => setOpen(false)} className={`block rounded-md px-2.5 py-1.5 text-[13px] ${pathname.startsWith(c.href.replace(/\/$/, "")) ? "bg-ink text-paper" : "text-neutral-600 hover:bg-tile"}`}>{t(adm.nav[c.key])}</Link>)}</div>
                  )}
                </div>
              ))}
            </nav>
          </aside>
          <main className="min-w-0 flex-1 p-4 md:p-6 lg:p-8">
            {repo().mode === "demo" && <div className="mb-5 rounded-md border border-amber-200 bg-amber-50 px-4 py-2.5 text-[12px] text-amber-800">{t(adm.common.demo)}</div>}
            {children}
          </main>
        </div>
      </div>
    </ToastProvider>
  );
}
