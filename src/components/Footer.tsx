"use client";
import Link from "next/link";
import { dict, useLang } from "@/lib/i18n";

export function Footer() {
  const { t } = useLang();
  const f = dict.footer;
  return (
    <footer className="mt-24 bg-ink text-paper">
      <div className="container-x grid gap-10 py-14 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
        <div>
          <div className="display text-[19px] font-semibold">MOTO DVOŘÁK</div>
          <p className="mt-3 max-w-xs text-[13px] leading-relaxed text-neutral-400">
            Nádraží 604<br />582 82 Golčův Jeníkov<br />+420 603 235 182<br />servis@elektrodvorak.cz
          </p>
          <div className="mt-6">
            <div className="text-[13px] font-medium">{t(f.newsletter)}</div>
            <div className="mt-1 text-[12px] text-neutral-400">{t(f.newsletterHint)}</div>
            <form className="mt-3 flex max-w-sm border-b border-neutral-600" onSubmit={(e) => e.preventDefault()}>
              <input type="email" placeholder="jmeno@email.cz" className="h-10 flex-1 bg-transparent text-[13px] outline-none placeholder:text-neutral-500" />
              <button className="text-[13px] font-medium hover:text-neutral-300">{t(f.subscribe)}</button>
            </form>
          </div>
        </div>
        <Col title={t(f.sales)} items={[
          ["/ctyrkolky/", t(dict.nav.ctyrkolky)], ["/utv/", t(dict.nav.utv)], ["/motocykly/", t(dict.nav.motocykly)],
          ["/skutry/", t(dict.nav.skutry)], ["/prislusenstvi/", t(dict.nav.prislusenstvi)],
        ]} />
        <Col title={t(f.help)} items={[
          ["/servis/", t(dict.nav.servis)], ["/servis/", t(f.parts)], ["#", t(f.financing)], ["#", t(f.delivery)], ["#", t(f.warranty)],
        ]} />
        <Col title={t(f.company)} items={[
          ["/kontakt/", t(dict.nav.kontakt)], ["#", t(f.about)], ["#", t(f.terms)], ["#", t(f.privacy)],
        ]} />
      </div>
      <div className="border-t border-neutral-800">
        <div className="container-x flex flex-wrap items-center justify-between gap-3 py-5 font-mono text-[11px] tracking-wide text-neutral-500">
          <span>© 2026 {t(f.rights)}</span>
          <span>CFMOTO · LINHAI · TGB · KENTOYA · TUMOTO</span>
        </div>
      </div>
    </footer>
  );
}

function Col({ title, items }: { title: string; items: [string, string][] }) {
  return (
    <div>
      <div className="eyebrow !text-neutral-500">{title}</div>
      <ul className="mt-4 space-y-2.5">
        {items.map(([href, label], i) => (
          <li key={i}><Link href={href} className="text-[13px] hover:text-neutral-300">{label}</Link></li>
        ))}
      </ul>
    </div>
  );
}
