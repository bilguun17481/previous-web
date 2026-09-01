"use client";
import Link from "next/link";
import { useState } from "react";
import { dict, useLang } from "@/lib/i18n";

const links = [
  { href: "/ctyrkolky/", key: "ctyrkolky" },
  { href: "/utv/", key: "utv" },
  { href: "/motocykly/", key: "motocykly" },
  { href: "/skutry/", key: "skutry" },
  { href: "/prislusenstvi/", key: "prislusenstvi" },
  { href: "/servis/", key: "servis" },
  { href: "/kontakt/", key: "kontakt" },
] as const;

export function Header() {
  const { lang, setLang, t } = useLang();
  const [open, setOpen] = useState(false);
  return (
    <header className="sticky top-0 z-40 bg-paper">
      <div className="bg-ink text-paper">
        <div className="container-x flex h-8 items-center justify-between text-[11px] tracking-wide">
          <span className="truncate">{t(dict.topbar)}</span>
          <div className="hidden shrink-0 gap-1 sm:flex" role="group" aria-label="Language">
            {(["cs", "en"] as const).map((l) => (
              <button key={l} onClick={() => setLang(l)} aria-pressed={lang === l}
                className={`px-1.5 font-semibold uppercase tracking-[0.12em] ${lang === l ? "text-paper" : "text-neutral-500 hover:text-paper"}`}>
                {l === "cs" ? "CZ" : "EN"}
              </button>
            ))}
          </div>
        </div>
      </div>
      <div className="border-b hairline">
        <div className="container-x flex h-[72px] items-center justify-between gap-6">
          <Link href="/" className="text-[22px] font-extrabold uppercase leading-none tracking-[-0.03em]">
            Moto Dvořák
          </Link>
          <nav className="hidden items-center gap-8 lg:flex" aria-label="Main">
            {links.map((l) => (
              <Link key={l.key} href={l.href} className="text-[12px] font-semibold uppercase tracking-[0.14em] hover:text-mute">
                {t(dict.nav[l.key])}
              </Link>
            ))}
          </nav>
          <div className="flex items-center gap-5">
            <div className="flex sm:hidden" role="group" aria-label="Language">
              {(["cs", "en"] as const).map((l) => (
                <button key={l} onClick={() => setLang(l)} aria-pressed={lang === l} className={`px-1 text-[11px] font-semibold uppercase ${lang === l ? "" : "text-mute"}`}>{l === "cs" ? "CZ" : "EN"}</button>
              ))}
            </div>
            <button aria-label={t(dict.nav.search)} className="hover:text-mute">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="11" cy="11" r="7" /><path d="m20 20-4-4" /></svg>
            </button>
            <Link href="/kosik/" aria-label={t(dict.nav.cart)} className="relative hover:text-mute">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M6 7h12l1 13H5z" /><path d="M9 10V6a3 3 0 0 1 6 0v4" /></svg>
              <span className="absolute -right-2.5 -top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-ink px-1 text-[10px] font-semibold leading-none text-paper">3</span>
            </Link>
            <button className="lg:hidden" aria-label={t(dict.nav.menu)} aria-expanded={open} onClick={() => setOpen(!open)}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d={open ? "M5 5l14 14M19 5 5 19" : "M3 7h18M3 12h18M3 17h18"} /></svg>
            </button>
          </div>
        </div>
      </div>
      {open && (
        <nav className="border-b hairline lg:hidden" aria-label="Mobile">
          <div className="container-x grid py-2">
            {links.map((l) => (
              <Link key={l.key} href={l.href} onClick={() => setOpen(false)} className="border-b hairline py-3.5 text-[13px] font-semibold uppercase tracking-[0.14em] last:border-0">
                {t(dict.nav[l.key])}
              </Link>
            ))}
          </div>
        </nav>
      )}
    </header>
  );
}
