"use client";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { formatKc } from "@/data/catalog";
import { dict, useLang } from "@/lib/i18n";
import { useCart } from "@/lib/cart";
import type { PaymentMethod, ShippingMethod } from "@/lib/types";

const field = "h-11 w-full border-b hairline bg-transparent text-[14px] outline-none focus:border-ink placeholder:text-neutral-400";
declare global { interface Window { Packeta?: { Widget: { pick: (key: string, cb: (p: Record<string, unknown> | null) => void, opts?: Record<string, unknown>) => void } } } }

export function CheckoutView({ shipping, payments, live, packetaKey }: { shipping: ShippingMethod[]; payments: PaymentMethod[]; live: boolean; packetaKey: string }) {
  const { t, lang } = useLang();
  const { items, subtotal, hydrated } = useCart();
  const router = useRouter();
  const k = dict.checkout;
  const hasVehicle = items.some((i) => !i.slug.match(/^(navijak|snehova|zadni|tazne|prilba|plachta|motorovy|pneumatika)/));
  const methods = shipping.filter((m) => !hasVehicle || m.vehicles);
  const [form, setForm] = useState({ name: "", email: "", phone: "", street: "", city: "", zip: "", notes: "" });
  const [ship, setShip] = useState(methods[0]?.id ?? "");
  const [pay, setPay] = useState(payments[0]?.id ?? "");
  const [point, setPoint] = useState<Record<string, unknown> | null>(null);
  const [code, setCode] = useState("");
  const [discount, setDiscount] = useState<{ amount: number; freeShipping: boolean; code: string | null } | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => { if (!methods.find((m) => m.id === ship)) setShip(methods[0]?.id ?? ""); }, [methods, ship]);
  const sm = methods.find((m) => m.id === ship);
  const shipCost = useMemo(() => !sm ? 0 : sm.free_over != null && subtotal >= sm.free_over ? 0 : Number(sm.price), [sm, subtotal]);
  const discountAmt = discount ? (discount.freeShipping ? shipCost : discount.amount) : 0;
  const total = Math.max(0, subtotal + shipCost - discountAmt);
  const needsAddress = sm && !sm.needs_pickup_point && sm.carrier !== "dealer" || sm?.id === "dealer_delivery";

  useEffect(() => {
    if (!sm?.needs_pickup_point || !packetaKey || window.Packeta) return;
    const s = document.createElement("script"); s.src = "https://widget.packeta.com/v6/www/js/library.js"; s.async = true; document.body.appendChild(s);
  }, [sm, packetaKey]);

  const pickPoint = () => window.Packeta?.Widget.pick(packetaKey, (p) => p && setPoint(p), { language: lang, country: "cz" });

  const applyCode = async () => {
    if (!code) return;
    const r = await fetch("/api/discount", { method: "POST", body: JSON.stringify({ code, subtotal, shipping: shipCost }) });
    const d = await r.json();
    setDiscount(d.valid ? d : null);
    if (!d.valid) setError(t(k.badCode));
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault(); setError(null);
    if (!live) { setError(t(k.demo)); return; }
    if (sm?.needs_pickup_point && !point) { setError(t(k.pickPoint)); return; }
    setBusy(true);
    try {
      const r = await fetch("/api/checkout", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({
        items: items.map((i) => ({ slug: i.slug, qty: i.qty })), email: form.email, name: form.name, phone: form.phone,
        address: { street: form.street, city: form.city, zip: form.zip, country: "CZ" }, shippingMethod: ship, pickupPoint: point,
        paymentMethod: pay, discountCode: discount?.code ?? undefined, notes: form.notes, locale: lang,
      }) });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error ?? "Checkout failed");
      if (d.redirectUrl) window.location.href = d.redirectUrl; else router.push(`/objednavka/${d.orderId}/`);
    } catch (err) { setError((err as Error).message); setBusy(false); }
  };

  const Radio = ({ name, value, current, onChange, label, right, children }: { name: string; value: string; current: string; onChange: (v: string) => void; label: string; right?: string; children?: React.ReactNode }) => (
    <label className="flex cursor-pointer items-center gap-3 border-b hairline py-3.5 text-[14px] last:border-0">
      <input type="radio" name={name} value={value} checked={current === value} onChange={() => onChange(value)} className="h-4 w-4 accent-ink" />
      <span className="flex-1">{label}{children}</span>
      {right && <span className="text-[13px] text-mute">{right}</span>}
    </label>
  );

  if (hydrated && items.length === 0) return (
    <section className="container-x py-16 text-center"><p className="text-mute">{t(dict.cart.empty)}</p><Link href="/skutry/" className="btn-ink mt-6">{t(dict.cart.continue)}</Link></section>
  );

  return (
    <section className="container-x py-12">
      <h1 className="text-[40px] font-bold leading-none tracking-[-0.02em]">{t(k.title)}</h1>
      <form className="mt-10 grid gap-12 lg:grid-cols-[7fr_4fr]" onSubmit={submit}>
        <div className="space-y-12">
          <fieldset>
            <legend className="eyebrow">01 · {t(k.contact)}</legend>
            <div className="mt-4 grid gap-x-8 gap-y-2 sm:grid-cols-2">
              <input required className={field} placeholder={t(k.name)} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
              <input required className={field} type="email" placeholder={t(k.email)} value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
              <input required className={field} type="tel" placeholder={t(k.phone)} value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
            </div>
          </fieldset>
          <fieldset>
            <legend className="eyebrow">02 · {t(k.delivery)}</legend>
            <div className="mt-4 border-t hairline">
              {methods.map((m) => (
                <Radio key={m.id} name="d" value={m.id} current={ship} onChange={setShip} label={t(m.name)} right={m.free_over != null && subtotal >= m.free_over ? t(dict.cart.free) : m.price ? formatKc(Number(m.price)) : t(dict.cart.free)}>
                  {t(m.description) ? <span className="block text-[12px] text-mute">{t(m.description)}</span> : null}
                </Radio>
              ))}
            </div>
            {sm?.needs_pickup_point && (
              <div className="mt-4 flex flex-wrap items-center gap-4">
                <button type="button" onClick={pickPoint} className="btn-ghost" disabled={!packetaKey}>{t(k.choosePoint)}</button>
                <span className="text-[13px]">{point ? String(point.name ?? point.place ?? "") : packetaKey ? null : t(k.noWidget)}</span>
              </div>
            )}
            {needsAddress && (
              <div className="mt-4 grid gap-x-8 gap-y-2 sm:grid-cols-[2fr_1fr_1fr]">
                <input required className={field} placeholder={t(k.street)} value={form.street} onChange={(e) => setForm({ ...form, street: e.target.value })} />
                <input required className={field} placeholder={t(k.city)} value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} />
                <input required className={field} placeholder={t(k.zip)} value={form.zip} onChange={(e) => setForm({ ...form, zip: e.target.value })} />
              </div>
            )}
          </fieldset>
          <fieldset>
            <legend className="eyebrow">03 · {t(k.payment)}</legend>
            <div className="mt-4 border-t hairline">
              {payments.map((m) => <Radio key={m.id} name="p" value={m.id} current={pay} onChange={setPay} label={t(m.name)} right={m.test_mode && live ? "test" : undefined} />)}
            </div>
          </fieldset>
          <fieldset>
            <legend className="eyebrow">04 · {t(k.notes)}</legend>
            <textarea className="mt-4 h-24 w-full border hairline p-3 text-[14px] outline-none focus:border-ink" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
          </fieldset>
        </div>
        <aside className="h-fit bg-tile p-6">
          <div className="eyebrow">{t(k.summary)}</div>
          <ul className="mt-4 space-y-3 border-b hairline pb-4 text-[13px]">
            {items.map((i) => <li key={i.slug} className="flex justify-between gap-4"><span>{i.name}<span className="ml-2 text-[11px] text-mute">× {i.qty}</span></span><span className="font-semibold">{formatKc(i.price * i.qty)}</span></li>)}
          </ul>
          <div className="mt-4 flex gap-2">
            <input className="h-10 flex-1 border hairline bg-paper px-3 text-[13px] outline-none focus:border-ink" placeholder={t(k.code)} value={code} onChange={(e) => setCode(e.target.value)} />
            <button type="button" onClick={applyCode} className="h-10 border border-ink px-4 text-[11px] font-semibold uppercase tracking-[0.14em] hover:bg-ink hover:text-paper">{t(k.apply)}</button>
          </div>
          <dl className="mt-4 space-y-2 text-[13px]">
            <div className="flex justify-between"><dt className="text-mute">{t(dict.cart.subtotal)}</dt><dd>{formatKc(subtotal)}</dd></div>
            <div className="flex justify-between"><dt className="text-mute">{t(dict.cart.delivery)}</dt><dd>{shipCost ? formatKc(shipCost) : t(dict.cart.free)}</dd></div>
            {discountAmt > 0 && <div className="flex justify-between text-signal"><dt>{t(k.discount)} {discount?.code}</dt><dd>−{formatKc(discountAmt)}</dd></div>}
            <div className="flex justify-between border-t hairline pt-3 text-[18px] font-semibold"><dt>{t(dict.cart.total)}</dt><dd>{formatKc(total)}</dd></div>
          </dl>
          <div className="text-[11px] text-mute">{t(dict.cart.vatIncl)}</div>
          {error ? <p className="mt-4 text-[13px] text-signal">{error}</p> : null}
          <button disabled={busy} className="btn-ink mt-6 w-full disabled:opacity-50">{busy ? "…" : t(k.place)}</button>
          <p className="mt-4 text-[11px] leading-relaxed text-mute">{t(k.terms)}</p>
        </aside>
      </form>
    </section>
  );
}
