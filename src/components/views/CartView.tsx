"use client";
import Link from "next/link";
import { Photo } from "@/components/Photo";
import { formatKc } from "@/data/catalog";
import { dict, useLang } from "@/lib/i18n";
import { cartSubtotal, sampleCart } from "@/lib/sampleCart";

export function CartView() {
  const { t } = useLang();
  const c = dict.cart;
  return (
    <section className="container-x py-12">
      <div className="flex items-baseline gap-4">
        <h1 className="text-[40px] font-bold leading-none tracking-[-0.02em]">{t(c.title)}</h1>
        <span className="text-[13px] text-mute">{sampleCart.length} {t(c.items)}</span>
      </div>
      <div className="mt-10 grid gap-12 lg:grid-cols-[7fr_4fr]">
        <ul className="border-t hairline">
          {sampleCart.map(({ p, qty }) => (
            <li key={p.slug} className="grid grid-cols-[88px_1fr_auto] items-center gap-5 border-b hairline py-5 sm:grid-cols-[120px_1fr_auto_auto]">
              <Link href={`/produkt/${p.slug}/`}><Photo label={p.name} ratio="aspect-square" hint="" /></Link>
              <div>
                <div className="eyebrow">{p.brand}</div>
                <Link href={`/produkt/${p.slug}/`} className="mt-1 block text-[16px] font-semibold leading-tight hover:underline underline-offset-4">{p.name}</Link>
                <button className="mt-2 text-[12px] text-mute underline underline-offset-4">{t(c.remove)}</button>
              </div>
              <div className="hidden items-center border hairline text-[13px] sm:flex">
                <button className="h-10 w-10 hover:bg-tile" aria-label="−">−</button>
                <span className="w-8 text-center font-semibold">{qty}</span>
                <button className="h-10 w-10 hover:bg-tile" aria-label="+">+</button>
              </div>
              <div className="text-right text-[15px] font-semibold">{formatKc(p.price * qty)}<div className="text-[11px] font-normal text-mute sm:hidden">× {qty}</div></div>
            </li>
          ))}
        </ul>
        <aside className="h-fit bg-tile p-6">
          <dl className="space-y-3 text-[13px]">
            <div className="flex justify-between"><dt className="text-mute">{t(c.subtotal)}</dt><dd>{formatKc(cartSubtotal)}</dd></div>
            <div className="flex justify-between"><dt className="text-mute">{t(c.delivery)}</dt><dd>{t(c.free)}</dd></div>
            <div className="text-[11px] text-mute">{t(c.pickup)}</div>
            <div className="flex justify-between border-t hairline pt-4 text-[18px] font-semibold"><dt>{t(c.total)}</dt><dd>{formatKc(cartSubtotal)}</dd></div>
            <div className="text-[11px] text-mute">{t(c.vatIncl)}</div>
          </dl>
          <Link href="/pokladna/" className="btn-ink mt-6 w-full">{t(c.checkout)}</Link>
          <Link href="/skutry/" className="btn-link mt-5 block text-center">{t(c.continue)}</Link>
          <p className="mt-6 text-[12px] leading-relaxed text-mute">{t(c.note)}</p>
        </aside>
      </div>
    </section>
  );
}
