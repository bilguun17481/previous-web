import Stripe from "stripe";
import { minor, type PaymentProvider } from "./index";

const key = process.env.STRIPE_SECRET_KEY;
const stripe = key ? new Stripe(key) : null;

export const stripeProvider: PaymentProvider = {
  id: "stripe",
  configured: Boolean(stripe),
  async createPayment(order, urls) {
    if (!stripe) throw new Error("Stripe is not configured");
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      customer_email: order.customer_email,
      client_reference_id: order.id,
      metadata: { order_id: order.id, order_number: String(order.number) },
      line_items: [
        ...order.items.map((i) => ({
          quantity: i.qty,
          price_data: { currency: order.currency.toLowerCase(), unit_amount: minor(i.price), product_data: { name: i.name, ...(i.image ? { images: [i.image] } : {}) } },
        })),
        ...(order.shipping_cost > 0 ? [{ quantity: 1, price_data: { currency: order.currency.toLowerCase(), unit_amount: minor(order.shipping_cost), product_data: { name: "Doprava / Shipping" } } }] : []),
      ],
      ...(order.discount_amount > 0 ? { discounts: [{ coupon: (await stripe.coupons.create({ amount_off: minor(order.discount_amount), currency: order.currency.toLowerCase(), duration: "once", name: order.discount_code ?? "Sleva" })).id }] } : {}),
      success_url: urls.returnUrl,
      cancel_url: urls.cancelUrl,
      locale: order.locale === "cs" ? "cs" : "en",
    });
    return { redirectUrl: session.url ?? undefined, status: "pending", ref: session.id };
  },
  async handleWebhook(req) {
    if (!stripe) return null;
    const secret = process.env.STRIPE_WEBHOOK_SECRET;
    const sig = req.headers.get("stripe-signature");
    const body = await req.text();
    const event = secret && sig ? stripe.webhooks.constructEvent(body, sig, secret) : (JSON.parse(body) as Stripe.Event);
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
