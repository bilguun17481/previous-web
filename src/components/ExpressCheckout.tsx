"use client";
/* Apple Pay, Google Pay and Link directly on the checkout page, through Stripe's Express Checkout element.
   The order is created when the customer confirms in the wallet sheet; the payment is then confirmed
   against a PaymentIntent and the webhook marks the order paid. Needs NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
   Apple Pay also needs the shop's domain registered in Stripe → Settings → Payment methods → Apple Pay. */
import { useEffect, useRef, useState } from "react";
import { dict, useLang } from "@/lib/i18n";

/* eslint-disable @typescript-eslint/no-explicit-any */
declare global { interface Window { Stripe?: (key: string, opts?: Record<string, unknown>) => any } }

export function stripePublicKey(): string {
  const w = typeof window !== "undefined" ? window.__ENV__?.stripeKey : undefined;
  return (w || process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || "").trim();
}

export interface ExpressOrderInput { email?: string; name?: string; phone?: string }
export function ExpressCheckout({ amount, currency, lang: _lang, createOrder, onError }: {
  amount: number; currency: string; lang: "cs" | "en";
  /** Creates the order and returns the PaymentIntent client secret. `wallet` carries what the wallet sheet knows about the buyer. */
  createOrder: (wallet: ExpressOrderInput) => Promise<{ orderId: string; clientSecret: string }>;
  onError: (msg: string) => void;
}) {
  const { t } = useLang();
  const host = useRef<HTMLDivElement>(null);
  const stripeRef = useRef<any>(null);
  const elementsRef = useRef<any>(null);
  const [state, setState] = useState<"loading" | "ready" | "none">("loading");
  const key = stripePublicKey();
  const latest = useRef({ createOrder, onError }); latest.current = { createOrder, onError };

  useEffect(() => {
    if (!key || !host.current || amount <= 0) return;
    let cancelled = false;
    const boot = async () => {
      if (!window.Stripe) await new Promise<void>((res, rej) => { const s = document.createElement("script"); s.src = "https://js.stripe.com/v3/"; s.async = true; s.onload = () => res(); s.onerror = () => rej(new Error("stripe.js")); document.head.appendChild(s); }).catch(() => null);
      if (cancelled || !window.Stripe) { setState("none"); return; }
      const stripe = stripeRef.current ?? window.Stripe(key);
      stripeRef.current = stripe;
      const elements = stripe.elements({ mode: "payment", amount: Math.round(amount * 100), currency: currency.toLowerCase(), appearance: { theme: "flat", variables: { colorPrimary: "#111111", borderRadius: "0px" } } });
      elementsRef.current = elements;
      const ece = elements.create("expressCheckout", { buttonType: { applePay: "buy", googlePay: "buy" }, buttonHeight: 48, layout: { maxColumns: 3, overflow: "never" } });
      ece.on("ready", (e: any) => setState(e.availablePaymentMethods ? "ready" : "none"));
      ece.on("click", (e: any) => e.resolve({ emailRequired: true, phoneNumberRequired: false }));
      ece.on("confirm", async (e: any) => {
        try {
          const { error: submitError } = await elements.submit();
          if (submitError) throw new Error(submitError.message);
          const bd = e.billingDetails ?? {};
          const { orderId, clientSecret } = await latest.current.createOrder({ email: bd.email, name: bd.name, phone: bd.phone });
          const { error } = await stripe.confirmPayment({ elements, clientSecret, confirmParams: { return_url: `${location.origin}/objednavka/${orderId}/?paid=1` }, redirect: "if_required" });
          if (error) throw new Error(error.message);
          location.href = `/objednavka/${orderId}/?paid=1`;
        } catch (err) { e.paymentFailed?.({ reason: "fail" }); latest.current.onError((err as Error).message); }
      });
      ece.mount(host.current!);
    };
    boot();
    return () => { cancelled = true; try { elementsRef.current?.getElement?.("expressCheckout")?.unmount(); } catch {} };
  }, [key, currency]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => { if (elementsRef.current && amount > 0) elementsRef.current.update({ amount: Math.round(amount * 100) }); }, [amount]);

  if (!key || amount <= 0 || state === "none") return null;
  return (
    <div className="mt-4">
      <div className="mb-2 text-[12px] font-semibold uppercase tracking-[0.14em] text-mute">{t(dict.checkout.express)}</div>
      <div ref={host} className={state === "loading" ? "h-12 animate-pulse bg-tile" : ""} />
      <div className="my-4 flex items-center gap-3 text-[11px] uppercase tracking-[0.14em] text-mute"><span className="h-px flex-1 bg-hair" />{t(dict.checkout.or)}<span className="h-px flex-1 bg-hair" /></div>
    </div>
  );
}
