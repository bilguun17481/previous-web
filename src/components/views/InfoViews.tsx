"use client";
import { Photo } from "@/components/Photo";
import { dict, useLang } from "@/lib/i18n";

export function ServiceView() {
  const { t } = useLang();
  const s = dict.service;
  return (
    <>
      <section className="relative text-paper">
        <Photo label={t(s.title)} tone="dark" ratio="aspect-[4/3] sm:aspect-[16/6]" hint={t(dict.nav.servis)} />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
        <div className="container-x absolute inset-x-0 bottom-0 pb-8 sm:pb-12">
          <div className="eyebrow !text-neutral-300">{t(dict.nav.servis)}</div>
          <h1 className="mt-2 text-[40px] font-bold leading-none tracking-[-0.02em] sm:text-[56px]">{t(s.title)}</h1>
          <p className="mt-4 max-w-xl text-[14px] leading-relaxed text-neutral-200">{t(s.lead)}</p>
        </div>
      </section>
      <section className="container-x py-16">
        <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {s.items.map((it, i) => (
            <li key={i} className="bg-tile p-6">
              <div className="text-[18px] font-semibold leading-snug">{t(it)}</div>
            </li>
          ))}
        </ul>
        <a href="tel:+420603235182" className="btn-ink mt-10">{t(s.cta)} · +420 603 235 182</a>
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
      <h1 className="mt-2 text-[40px] font-bold leading-none tracking-[-0.02em] sm:text-[56px]">{t(c.title)}</h1>
      <div className="mt-12 grid gap-10 lg:grid-cols-2">
        <Photo label={t(c.showroom)} ratio="aspect-[4/3]" hint={t(c.showroom)} />
        <div className="grid gap-px bg-hair sm:grid-cols-2">
          <Cell label={t(c.showroom)}>Dvořák a synové s.r.o.<br />Nádraží 604<br />582 82 Golčův Jeníkov</Cell>
          <Cell label={t(c.hours)}>{t(c.hoursValue).split("\n").map((l, i) => <span key={i}>{l}<br /></span>)}</Cell>
          <Cell label={t(c.phone)}><a className="hover:underline" href="tel:+420603235182">+420 603 235 182</a></Cell>
          <Cell label={t(c.email)}><a className="hover:underline" href="mailto:servis@elektrodvorak.cz">servis@elektrodvorak.cz</a></Cell>
          <div className="bg-paper p-6 sm:col-span-2">
            <div className="eyebrow">{t(c.directions)}</div>
            <p className="mt-3 text-[14px] leading-relaxed text-mute">{t(c.directionsText)}</p>
          </div>
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
