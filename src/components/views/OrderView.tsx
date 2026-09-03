"use client";
import Link from "next/link";
import { useEffect } from "react";
import { formatKc } from "@/data/catalog";
import { useCart } from "@/lib/cart";
import { useLang } from "@/lib/i18n";
import type { Order } from "@/lib/types";

export function OrderView({ order, paid, cancelled }: { order: Order; paid: boolean; cancelled: boolean }) {
  const { lang } = useLang();
  const { clear } = useCart();
  const cs = lang === "cs";
  useEffect(() => { if (!cancelled) clear(); }, [cancelled, clear]);
  const isPaid = order.payment_status === "paid" || paid;
  return (
    <section className="container-x max-w-3xl py-14">
      <div className="eyebrow">{cs ? "Objednávka" : "Order"} #{order.number}</div>
      <h1 className="mt-2 text-[36px] font-bold leading-tight tracking-[-0.02em]">
        {cancelled ? (cs ? "Platba nebyla dokončena" : "Payment was not completed") : cs ? "Děkujeme za objednávku" : "Thank you for your order"}
      </h1>
      <p className="mt-4 text-[14px] leading-relaxed text-mute">
        {cancelled
          ? cs ? "Objednávku jsme uložili. Můžete platbu zkusit znovu, nebo nás kontaktovat." : "We saved the order. You can retry the payment or contact us."
          : isPaid
            ? cs ? "Platba proběhla. Potvrzení jsme poslali na e-mail." : "Payment received. A confirmation has been emailed to you."
            : order.payment_provider === "bank_transfer"
              ? cs ? `Zaplaťte prosím převodem na účet uvedený v e-mailu, variabilní symbol ${order.number}.` : `Please pay by bank transfer to the account in the email, reference ${order.number}.`
              : cs ? "Objednávku jsme přijali a ozveme se s termínem předání." : "We received the order and will contact you about handover."}
      </p>
      <ul className="mt-8 divide-y hairline border-y hairline text-[14px]">
        {order.items.map((i) => (
          <li key={i.slug} className="flex justify-between py-3"><span>{i.name} <span className="text-mute">× {i.qty}</span></span><span className="font-semibold">{formatKc(i.price * i.qty)}</span></li>
        ))}
        <li className="flex justify-between py-3 text-mute"><span>{cs ? "Doprava" : "Shipping"}</span><span>{formatKc(order.shipping_cost)}</span></li>
        {order.discount_amount > 0 && <li className="flex justify-between py-3 text-mute"><span>{cs ? "Sleva" : "Discount"} {order.discount_code}</span><span>−{formatKc(order.discount_amount)}</span></li>}
        <li className="flex justify-between py-3 text-[18px] font-semibold"><span>{cs ? "Celkem" : "Total"}</span><span>{formatKc(order.total)}</span></li>
      </ul>
      <Link href="/" className="btn-ink mt-8">{cs ? "Zpět do obchodu" : "Back to the shop"}</Link>
    </section>
  );
}
