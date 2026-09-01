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
      <div className="bg-tile text-center font-mono text-[11px] tracking-wide text-mute">
        <div className="container-x truncate py-1.5">{t(dict.topbar)}</div>
      </div>
      <div className="border-b hairline">
        <div className="container-x flex h-16 items-center justify-between gap-6">
          <Link href="/" className="display flex items-baseline gap-2 text-[19px] font-semibold leading-none">
            MOTO DVOŘÁK
            <span className="hidden font-mono text-[10px] font-normal tracking-[0.14em] text-mute sm:inline">GOLČŮV JENÍKOV</span>
          </Link>
          <nav className="hidden items-center gap-7 lg:flex" aria-label="Main">
            {links.map((l) => (
              <Link key={l.key} href={l.href} className="text-[13px] font-medium tracking-tight hover:text-mute">
                {t(dict.nav[l.key])}
              </Link>
            ))}
          </nav>
          <div className="flex items-center gap-4">
            <div className="flex font-mono text-[11px] tracking-[0.12em]" role="group" aria-label="Language">
              {(["cs", "en"] as const).map((l) => (
                <button
                  key={l}
                  onClick={() => setLang(l)}
                  aria-pressed={lang === l}
                  className={`px-1.5 py-1 uppercase ${lang === l ? "text-ink underline underline-offset-4" : "text-mute hover:text-ink"}`}
                >
                  {l === "cs" ? "CZ" : "EN"}
                </button>
              ))}
            </div>
            <button aria-label={t(dict.nav.search)} className="hidden sm:block hover:text-mute">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><circle cx="11" cy="11" r="7" /><path d="m20 20-4-4" /></svg>
            </button>
            <Link href="/kosik/" aria-label={t(dict.nav.cart)} className="relative hover:text-mute">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><path d="M4 6h16l-1.5 9h-13z" /><path d="M9 20h.01M16 20h.01M4 6 3 3" /></svg>
              <span className="absolute -right-2 -top-2 flex h-4 min-w-4 items-center justify-center bg-ink px-1 font-mono text-[10px] leading-none text-paper">3</span>
            </Link>
            <button className="lg:hidden" aria-label={t(dict.nav.menu)} aria-expanded={open} onClick={() => setOpen(!open)}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><path d={open ? "M5 5l14 14M19 5 5 19" : "M3 7h18M3 12h18M3 17h18"} /></svg>
            </button>
          </div>
        </div>
      </div>
      {open && (
        <nav className="border-b hairline lg:hidden" aria-label="Mobile">
          <div className="container-x grid py-3">
            {links.map((l) => (
              <Link key={l.key} href={l.href} onClick={() => setOpen(false)} className="border-b hairline py-3 text-[15px] font-medium last:border-0">
                {t(dict.nav[l.key])}
              </Link>
            ))}
          </div>
        </nav>
      )}
    </header>
  );
}
