"use client";
import Link from "next/link";
import { dict, useLang } from "@/lib/i18n";

export function Footer() {
  const { t } = useLang();
  const f = dict.footer;
  return (
    <footer className="mt-24 bg-charcoal text-paper">
      <div className="border-b border-neutral-800">
        <div className="container-x flex flex-col gap-6 py-10 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="text-[16px] font-semibold">{t(f.newsletter)}</div>
            <div className="mt-1 text-[13px] text-neutral-400">{t(f.newsletterHint)}</div>
          </div>
          <form className="flex w-full max-w-md" onSubmit={(e) => e.preventDefault()}>
            <input type="email" placeholder="jmeno@email.cz" className="h-12 flex-1 border border-neutral-600 bg-transparent px-4 text-[13px] outline-none placeholder:text-neutral-500 focus:border-paper" />
            <button className="btn-white">{t(f.subscribe)}</button>
          </form>
        </div>
      </div>
      <div className="container-x grid gap-10 py-14 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
        <div>
          <div className="text-[20px] font-extrabold uppercase tracking-[-0.03em]">Moto Dvořák</div>
          <p className="mt-4 text-[13px] leading-relaxed text-neutral-400">
            Dvořák a synové s.r.o.<br />Nádraží 604, 582 82 Golčův Jeníkov<br />+420 603 235 182<br />servis@elektrodvorak.cz
          </p>
          <div className="mt-5 flex gap-3 text-neutral-400">
            {["facebook", "instagram", "youtube"].map((s) => (
              <a key={s} href="#" aria-label={s} className="flex h-9 w-9 items-center justify-center border border-neutral-700 hover:border-paper hover:text-paper">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                  {s === "facebook" && <path d="M14 8h3V4h-3c-2.8 0-4 1.7-4 4v2H7v4h3v8h4v-8h3l1-4h-4V8.5c0-.3.2-.5.5-.5z" />}
                  {s === "instagram" && <path d="M7 3h10a4 4 0 0 1 4 4v10a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4V7a4 4 0 0 1 4-4zm0 2a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2zm5 3.5a4.5 4.5 0 1 1 0 9 4.5 4.5 0 0 1 0-9zm0 2a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5zM17.5 6a1 1 0 1 1 0 2 1 1 0 0 1 0-2z" />}
                  {s === "youtube" && <path d="M21.6 7.2a2.5 2.5 0 0 0-1.8-1.8C18.2 5 12 5 12 5s-6.2 0-7.8.4A2.5 2.5 0 0 0 2.4 7.2 26 26 0 0 0 2 12a26 26 0 0 0 .4 4.8 2.5 2.5 0 0 0 1.8 1.8C5.8 19 12 19 12 19s6.2 0 7.8-.4a2.5 2.5 0 0 0 1.8-1.8A26 26 0 0 0 22 12a26 26 0 0 0-.4-4.8zM10 15V9l5.2 3z" />}
                </svg>
              </a>
            ))}
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
        <div className="container-x flex flex-wrap items-center justify-between gap-3 py-5 text-[11px] text-neutral-500">
          <span>© 2026 {t(f.rights)}</span>
          <span className="uppercase tracking-[0.14em]">CFMOTO · Linhai · TGB · Kentoya · TUMOTO</span>
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
          <li key={i}><Link href={href} className="text-[13px] text-neutral-300 hover:text-paper">{label}</Link></li>
        ))}
      </ul>
    </div>
  );
}
