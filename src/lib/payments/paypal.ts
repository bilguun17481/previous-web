import type { PaymentProvider } from "./index";
/* PayPal Orders API v2. Docs: https://developer.paypal.com/docs/api/orders/v2/ */
const clientId = process.env.PAYPAL_CLIENT_ID;
const clientSecret = process.env.PAYPAL_CLIENT_SECRET;
const base = process.env.PAYPAL_SANDBOX === "false" ? "https://api-m.paypal.com" : "https://api-m.sandbox.paypal.com";

async function token() {
  const r = await fetch(`${base}/v1/oauth2/token`, {
    method: "POST",
    headers: { Authorization: "Basic " + Buffer.from(`${clientId}:${clientSecret}`).toString("base64"), "Content-Type": "application/x-www-form-urlencoded" },
    body: "grant_type=client_credentials",
  });
  return (await r.json()).access_token as string;
}

export const paypalProvider: PaymentProvider = {
  id: "paypal",
  configured: Boolean(clientId && clientSecret),
  async createPayment(order, urls) {
    const t = await token();
    const r = await fetch(`${base}/v2/checkout/orders`, {
      method: "POST",
      headers: { Authorization: `Bearer ${t}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        intent: "CAPTURE",
        purchase_units: [{ reference_id: order.id, custom_id: order.id, amount: { currency_code: order.currency, value: order.total.toFixed(2) }, description: `Objednávka ${order.number}` }],
        payment_source: { paypal: { experience_context: { return_url: `${urls.notifyUrl}?order=${order.id}`, cancel_url: urls.cancelUrl, user_action: "PAY_NOW" } } },
      }),
    });
    const data = await r.json();
    if (!r.ok) throw new Error(`PayPal create ${r.status}: ${JSON.stringify(data)}`);
    const approve = (data.links as { rel: string; href: string }[]).find((l) => l.rel === "payer-action" || l.rel === "approve")?.href;
    return { redirectUrl: approve, status: "pending", ref: data.id };
  },
  async handleWebhook(req) {
    const url = new URL(req.url);
    // Buyer returns from PayPal: capture the approved order.
    if (req.method === "GET") {
      const orderId = url.searchParams.get("order");
      const ppOrder = url.searchParams.get("token");
      if (!orderId || !ppOrder) return null;
      const t = await token();
      const r = await fetch(`${base}/v2/checkout/orders/${ppOrder}/capture`, { method: "POST", headers: { Authorization: `Bearer ${t}`, "Content-Type": "application/json" } });
      const data = await r.json();
      return { orderId, status: data.status === "COMPLETED" ? "paid" : "failed", ref: ppOrder };
    }
    // Server webhook (PAYMENT.CAPTURE.COMPLETED / REFUNDED).
    const ev = await req.json();
    const orderId = ev?.resource?.custom_id;
    if (!orderId) return null;
    if (ev.event_type === "PAYMENT.CAPTURE.COMPLETED") return { orderId, status: "paid", ref: ev.resource.id };
    if (ev.event_type === "PAYMENT.CAPTURE.REFUNDED") return { orderId, status: "refunded", ref: ev.resource.id };
    if (ev.event_type === "PAYMENT.CAPTURE.DENIED") return { orderId, status: "failed", ref: ev.resource.id };
    return null;
  },
};
