"use client";
import { formatKc } from "@/data/catalog";
import { dict, useLang } from "@/lib/i18n";
import { cartSubtotal, sampleCart } from "@/lib/sampleCart";

const field = "h-11 w-full border-b hairline bg-transparent text-[14px] outline-none focus:border-ink placeholder:text-neutral-400";

export function CheckoutView() {
  const { t } = useLang();
  const k = dict.checkout;
  const Radio = ({ name, label, checked = false }: { name: string; label: string; checked?: boolean }) => (
    <label className="flex cursor-pointer items-center gap-3 border-b hairline py-3.5 text-[14px] last:border-0">
      <input type="radio" name={name} defaultChecked={checked} className="h-4 w-4 accent-ink" />
      {label}
    </label>
  );
  return (
    <section className="container-x py-12">
      <h1 className="display text-[44px] font-medium leading-none">{t(k.title)}</h1>
      <form className="mt-10 grid gap-12 lg:grid-cols-[7fr_4fr]" onSubmit={(e) => e.preventDefault()}>
        <div className="space-y-12">
          <fieldset>
            <legend className="eyebrow">01 · {t(k.contact)}</legend>
            <div className="mt-4 grid gap-x-8 gap-y-2 sm:grid-cols-2">
              <input className={field} placeholder={t(k.name)} />
              <input className={field} type="email" placeholder={t(k.email)} />
              <input className={field} type="tel" placeholder={t(k.phone)} />
            </div>
          </fieldset>
          <fieldset>
            <legend className="eyebrow">02 · {t(k.delivery)}</legend>
            <div className="mt-4 border-t hairline">
              <Radio name="d" label={t(k.optPickup)} checked />
              <Radio name="d" label={`${t(k.optShip)} · ${formatKc(2500)}`} />
              <Radio name="d" label={`${t(k.optParcel)} · ${formatKc(129)}`} />
            </div>
            <div className="mt-4 grid gap-x-8 gap-y-2 sm:grid-cols-[2fr_1fr_1fr]">
              <input className={field} placeholder={t(k.street)} />
              <input className={field} placeholder={t(k.city)} />
              <input className={field} placeholder={t(k.zip)} />
            </div>
          </fieldset>
          <fieldset>
            <legend className="eyebrow">03 · {t(k.payment)}</legend>
            <div className="mt-4 border-t hairline">
              <Radio name="p" label={t(k.payTransfer)} checked />
              <Radio name="p" label={t(k.payCard)} />
              <Radio name="p" label={t(k.payFin)} />
              <Radio name="p" label={t(k.payCash)} />
            </div>
          </fieldset>
        </div>
        <aside className="h-fit bg-tile p-6">
          <div className="eyebrow">{t(k.summary)}</div>
          <ul className="mt-4 space-y-3 border-b hairline pb-4 text-[13px]">
            {sampleCart.map(({ p, qty }) => (
              <li key={p.slug} className="flex justify-between gap-4">
                <span>{p.name}<span className="ml-2 font-mono text-[11px] text-mute">× {qty}</span></span>
                <span className="font-mono">{formatKc(p.price * qty)}</span>
              </li>
            ))}
          </ul>
          <div className="mt-4 flex justify-between font-mono text-[17px]"><span>{t(dict.cart.total)}</span><span>{formatKc(cartSubtotal)}</span></div>
          <div className="font-mono text-[11px] text-mute">{t(dict.cart.vatIncl)}</div>
          <button className="btn-ink mt-6 w-full">{t(k.place)}</button>
          <p className="mt-4 text-[11px] leading-relaxed text-mute">{t(k.terms)}</p>
        </aside>
      </form>
    </section>
  );
}
