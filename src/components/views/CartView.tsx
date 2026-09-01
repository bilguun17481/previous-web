"use client";
import Link from "next/link";
import { Art } from "@/components/Art";
import { HomolBadge } from "@/components/Badge";
import { formatKc } from "@/data/catalog";
import { dict, useLang } from "@/lib/i18n";
import { cartSubtotal, sampleCart } from "@/lib/sampleCart";

export function CartView() {
  const { t } = useLang();
  const c = dict.cart;
  return (
    <section className="container-x py-12">
      <div className="flex items-baseline gap-4">
        <h1 className="display text-[44px] font-medium leading-none">{t(c.title)}</h1>
        <span className="font-mono text-[12px] text-mute">{sampleCart.length} {t(c.items)}</span>
      </div>
      <div className="mt-10 grid gap-12 lg:grid-cols-[7fr_4fr]">
        <ul className="border-t hairline">
          {sampleCart.map(({ p, qty }) => (
            <li key={p.slug} className="grid grid-cols-[96px_1fr_auto] items-center gap-5 border-b hairline py-5 sm:grid-cols-[128px_1fr_auto_auto]">
              <Link href={`/produkt/${p.slug}/`} className="tile-art aspect-[4/3] text-ink/70"><Art kind={p.art} className="p-[10%]" /></Link>
              <div>
                <div className="eyebrow">{p.brand}</div>
                <Link href={`/produkt/${p.slug}/`} className="display mt-1 block text-[17px] font-medium leading-tight hover:underline">{p.name}</Link>
                <div className="mt-2 flex items-center gap-3"><HomolBadge code={p.homologation} /><button className="text-[12px] text-mute underline-offset-4 hover:underline">{t(c.remove)}</button></div>
              </div>
              <div className="hidden items-center border hairline font-mono text-[13px] sm:flex">
                <button className="h-9 w-9 hover:bg-tile" aria-label="−">−</button>
                <span className="w-8 text-center">{qty}</span>
                <button className="h-9 w-9 hover:bg-tile" aria-label="+">+</button>
              </div>
              <div className="text-right font-mono text-[14px]">{formatKc(p.price * qty)}<div className="text-[11px] text-mute sm:hidden">× {qty}</div></div>
            </li>
          ))}
        </ul>
        <aside className="h-fit bg-tile p-6">
          <dl className="space-y-3 font-mono text-[13px]">
            <div className="flex justify-between"><dt className="text-mute">{t(c.subtotal)}</dt><dd>{formatKc(cartSubtotal)}</dd></div>
            <div className="flex justify-between"><dt className="text-mute">{t(c.delivery)}</dt><dd>{t(c.free)}</dd></div>
            <div className="text-[11px] text-mute">{t(c.pickup)}</div>
            <div className="flex justify-between border-t hairline pt-4 text-[17px]"><dt>{t(c.total)}</dt><dd>{formatKc(cartSubtotal)}</dd></div>
            <div className="text-[11px] text-mute">{t(c.vatIncl)}</div>
          </dl>
          <Link href="/pokladna/" className="btn-ink mt-6 w-full">{t(c.checkout)}</Link>
          <Link href="/skutry/" className="btn-link mt-4 block text-center">{t(c.continue)}</Link>
          <p className="mt-6 text-[12px] leading-relaxed text-mute">{t(c.note)}</p>
        </aside>
      </div>
    </section>
  );
}
