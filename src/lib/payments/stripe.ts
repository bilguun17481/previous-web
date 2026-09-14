import Stripe from "stripe";
import { minor, type PaymentProvider } from "./index";

/* Stripe Checkout (Stripe's hosted payment page).
   Secrets are read on every call, so the host's runtime variables are used even where process.env
   is filled in after modules load (Cloudflare Workers). The fetch HTTP client and the SubtleCrypto
   provider let the SDK run outside Node as well as in it. */
const client = () => {
  const key = (process.env.STRIPE_SECRET_KEY ?? "").trim();
  return key ? new Stripe(key, { httpClient: Stripe.createFetchHttpClient() }) : null;
};
const cryptoProvider = Stripe.createSubtleCryptoProvider();

export const stripeProvider: PaymentProvider = {
  id: "stripe",
  get configured() { return Boolean((process.env.STRIPE_SECRET_KEY ?? "").trim()); },
  async createPayment(order, urls) {
    const stripe = client();
    if (!stripe) throw new Error("Stripe is not configured");
    const currency = order.currency.toLowerCase();
    const meta = { order_id: order.id, order_number: String(order.number) };
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      customer_email: order.customer_email,
      client_reference_id: order.id,
      metadata: meta,
      // Copy the order reference onto the PaymentIntent so charges and refunds carry it too.
      payment_intent_data: { metadata: meta, description: `Objednávka ${order.number}` },
      line_items: [
        ...order.items.map((i) => ({
          quantity: i.qty,
          price_data: { currency, unit_amount: minor(i.price), product_data: { name: i.name, ...(i.image ? { images: [i.image] } : {}) } },
        })),
        ...(order.shipping_cost > 0 ? [{ quantity: 1, price_data: { currency, unit_amount: minor(order.shipping_cost), product_data: { name: "Doprava / Shipping" } } }] : []),
      ],
      ...(order.discount_amount > 0 ? { discounts: [{ coupon: (await stripe.coupons.create({ amount_off: minor(order.discount_amount), currency, duration: "once", name: order.discount_code ?? "Sleva" })).id }] } : {}),
      success_url: urls.returnUrl,
      cancel_url: urls.cancelUrl,
      locale: order.locale === "cs" ? "cs" : "en",
    });
    return { redirectUrl: session.url ?? undefined, status: "pending", ref: session.id };
  },
  async handleWebhook(req) {
    const stripe = client();
    if (!stripe) return null;
    const secret = (process.env.STRIPE_WEBHOOK_SECRET ?? "").trim();
    if (!secret) throw new Error("STRIPE_WEBHOOK_SECRET is not set: add the signing secret from Stripe → Developers → Webhooks");
    const sig = req.headers.get("stripe-signature");
    if (!sig) throw new Error("Missing stripe-signature header: this address is for Stripe's webhook calls");
    const body = await req.text();
    // Rejects anything not signed with the endpoint's secret (or older than 5 minutes).
    const event = await stripe.webhooks.constructEventAsync(body, sig, secret, undefined, cryptoProvider);
    if (event.type === "checkout.session.completed" || event.type === "checkout.session.async_payment_succeeded") {
      const s = event.data.object as Stripe.Checkout.Session;
      const orderId = s.metadata?.order_id ?? s.client_reference_id;
      if (!orderId) return null;
      return { orderId, status: s.payment_status === "paid" ? "paid" : "pending", ref: typeof s.payment_intent === "string" ? s.payment_intent : s.id };
    }
    if (event.type === "checkout.session.async_payment_failed" || event.type === "checkout.session.expired") {
      const s = event.data.object as Stripe.Checkout.Session;
      const orderId = s.metadata?.order_id ?? s.client_reference_id;
      return orderId ? { orderId, status: "failed", ref: s.id } : null;
    }
    if (event.type === "charge.refunded") {
      const c = event.data.object as Stripe.Charge;
      const orderId = c.metadata?.order_id;
      return orderId ? { orderId, status: "refunded", ref: c.id } : null;
    }
    return null;
  },
};
