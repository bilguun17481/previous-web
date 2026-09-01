"use client";
import { Art } from "@/components/Art";
import { dict, useLang } from "@/lib/i18n";

export function ServiceView() {
  const { t } = useLang();
  const s = dict.service;
  return (
    <>
      <section className="bg-tile">
        <div className="container-x grid items-center gap-8 py-14 lg:grid-cols-2">
          <div>
            <div className="eyebrow">{t(dict.nav.servis)}</div>
            <h1 className="display mt-3 text-[44px] font-medium leading-none sm:text-[56px]">{t(s.title)}</h1>
            <p className="mt-5 max-w-lg text-[14px] leading-relaxed text-mute">{t(s.lead)}</p>
            <a href="tel:+420603235182" className="btn-ink mt-8">{t(s.cta)} · +420 603 235 182</a>
          </div>
          <div className="aspect-[16/9] text-ink/70"><Art kind="gear" draw className="h-full w-full p-[8%]" /></div>
        </div>
      </section>
      <section className="container-x py-16">
        <ul className="grid gap-px bg-hair sm:grid-cols-2 lg:grid-cols-3">
          {s.items.map((it, i) => (
            <li key={i} className="bg-paper p-6">
              <div className="font-mono text-[11px] text-mute">{String(i + 1).padStart(2, "0")}</div>
              <div className="display mt-3 text-[18px] font-medium leading-snug">{t(it)}</div>
            </li>
          ))}
        </ul>
      </section>
    </>
  );
}

export function ContactView() {
  const { t } = useLang();
  const c = dict.contact;
  return (
    <section className="container-x py-14">
      <div className="eyebrow">Golčův Jeníkov</div>
      <h1 className="display mt-3 text-[44px] font-medium leading-none sm:text-[56px]">{t(c.title)}</h1>
      <div className="mt-12 grid gap-px bg-hair md:grid-cols-2 lg:grid-cols-4">
        <Cell label={t(c.showroom)}>Dvořák a synové s.r.o.<br />Nádraží 604<br />582 82 Golčův Jeníkov</Cell>
        <Cell label={t(c.hours)}>{t(c.hoursValue).split("\n").map((l, i) => <span key={i}>{l}<br /></span>)}</Cell>
        <Cell label={t(c.phone)}><a className="hover:underline" href="tel:+420603235182">+420 603 235 182</a></Cell>
        <Cell label={t(c.email)}><a className="hover:underline" href="mailto:servis@elektrodvorak.cz">servis@elektrodvorak.cz</a></Cell>
      </div>
      <div className="mt-12 grid gap-8 lg:grid-cols-[1fr_2fr]">
        <div>
          <div className="eyebrow">{t(c.directions)}</div>
          <p className="mt-3 max-w-sm text-[14px] leading-relaxed text-mute">{t(c.directionsText)}</p>
        </div>
        <div className="relative aspect-[16/7] bg-tile">
          <svg viewBox="0 0 800 350" className="absolute inset-0 h-full w-full text-ink/40" fill="none" stroke="currentColor" strokeWidth="1.4" aria-hidden>
            <path d="M0 210 C150 190 260 240 400 200 S650 150 800 190" />
            <path d="M0 240 C150 220 260 270 400 230 S650 180 800 220" strokeDasharray="6 8" />
            <path d="M330 0 L360 350 M120 0 L60 350" />
            <circle cx="400" cy="215" r="9" fill="currentColor" stroke="none" />
          </svg>
          <div className="absolute left-[52%] top-[52%] bg-ink px-2 py-1 font-mono text-[11px] text-paper">Nádraží 604</div>
        </div>
      </div>
    </section>
  );
}

function Cell({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="bg-paper p-6">
      <div className="eyebrow">{label}</div>
      <div className="mt-3 text-[14px] leading-relaxed">{children}</div>
    </div>
  );
}
