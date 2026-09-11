"use client";
import Link from "next/link";
import { Photo } from "@/components/Photo";
import { formatKc } from "@/data/catalog";
import { dict, useLang } from "@/lib/i18n";
import { useCart } from "@/lib/cart";

export function CartView() {
  const { t } = useLang();
  const { items, setQty, remove, subtotal, hydrated } = useCart();
  const c = dict.cart;
  return (
    <section className="container-x py-12">
      <div className="flex items-baseline gap-4">
        <h1 className="text-[40px] font-bold leading-none tracking-[-0.02em]">{t(c.title)}</h1>
        <span className="text-[13px] text-mute">{items.length} {t(c.items)}</span>
      </div>
      {hydrated && items.length === 0 ? (
        <div className="mt-10 border-t hairline py-16 text-center">
          <p className="text-[15px] text-mute">{t(c.empty)}</p>
          <Link href="/skutry/" className="btn-ink mt-6">{t(c.continue)}</Link>
        </div>
      ) : (
        <div className="mt-10 grid gap-12 lg:grid-cols-[7fr_4fr]">
          <ul className="border-t hairline">
            {items.map((i) => (
              <li key={i.slug} className="grid grid-cols-[88px_1fr_auto] items-center gap-5 border-b hairline py-5 sm:grid-cols-[120px_1fr_auto_auto]">
                <Link href={`/produkt/${i.slug}/`}><Photo label={i.name} src={i.image} size="thumb" ratio="aspect-square" hint="" /></Link>
                <div>
                  <div className="eyebrow">{i.brand}</div>
                  <Link href={`/produkt/${i.slug}/`} className="mt-1 block text-[16px] font-semibold leading-tight hover:underline underline-offset-4">{i.name}</Link>
                  <button onClick={() => remove(i.slug)} className="mt-2 text-[12px] text-mute underline underline-offset-4">{t(c.remove)}</button>
                </div>
                <div className="hidden items-center border hairline text-[13px] sm:flex">
                  <button onClick={() => setQty(i.slug, i.qty - 1)} className="h-10 w-10 hover:bg-tile" aria-label="−">−</button>
                  <span className="w-8 text-center font-semibold">{i.qty}</span>
                  <button onClick={() => setQty(i.slug, i.qty + 1)} className="h-10 w-10 hover:bg-tile" aria-label="+">+</button>
                </div>
                <div className="text-right text-[15px] font-semibold">{formatKc(i.price * i.qty)}<div className="text-[11px] font-normal text-mute sm:hidden">× {i.qty}</div></div>
              </li>
            ))}
          </ul>
          <aside className="h-fit bg-tile p-6">
            <dl className="space-y-3 text-[13px]">
              <div className="flex justify-between"><dt className="text-mute">{t(c.subtotal)}</dt><dd>{formatKc(subtotal)}</dd></div>
              <div className="flex justify-between"><dt className="text-mute">{t(c.delivery)}</dt><dd>{t(c.atCheckout)}</dd></div>
              <div className="flex justify-between border-t hairline pt-4 text-[18px] font-semibold"><dt>{t(c.total)}</dt><dd>{formatKc(subtotal)}</dd></div>
              <div className="text-[11px] text-mute">{t(c.vatIncl)}</div>
            </dl>
            <Link href="/pokladna/" className="btn-ink mt-6 w-full">{t(c.checkout)}</Link>
            <Link href="/skutry/" className="btn-link mt-5 block text-center">{t(c.continue)}</Link>
            <p className="mt-6 text-[12px] leading-relaxed text-mute">{t(c.note)}</p>
          </aside>
        </div>
      )}
    </section>
  );
}
