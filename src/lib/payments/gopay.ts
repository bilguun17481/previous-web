import { minor, type PaymentProvider } from "./index";
/* GoPay REST API v3. Docs: https://doc.gopay.com */
const env = () => ({ goid: process.env.GOPAY_GOID, clientId: process.env.GOPAY_CLIENT_ID, clientSecret: process.env.GOPAY_CLIENT_SECRET, base: process.env.GOPAY_SANDBOX === "false" ? "https://gate.gopay.cz/api" : "https://gw.sandbox.gopay.com/api" });

async function token(scope: "payment-create" | "payment-all") {
  const { clientId, clientSecret, base } = env();
  const r = await fetch(`${base}/oauth2/token`, {
    method: "POST",
    headers: { Authorization: "Basic " + Buffer.from(`${clientId}:${clientSecret}`).toString("base64"), "Content-Type": "application/x-www-form-urlencoded" },
    body: `grant_type=client_credentials&scope=${scope}`,
  });
  if (!r.ok) throw new Error(`GoPay auth ${r.status}`);
  return (await r.json()).access_token as string;
}

/** GoPay gateway; `instrument` pre-selects a wallet (GPAY, APPLE_PAY) so the customer lands straight on it. */
export const gopay = (instrument?: "GPAY" | "APPLE_PAY" | "PAYMENT_CARD"): PaymentProvider => ({
  id: instrument === "GPAY" ? "gopay_gpay" : instrument === "APPLE_PAY" ? "gopay_applepay" : "gopay",
  get configured() { const e = env(); return Boolean(e.goid && e.clientId && e.clientSecret); },
  async createPayment(order, urls) {
    const { goid, base } = env();
    const t = await token("payment-create");
    const r = await fetch(`${base}/payments/payment`, {
      method: "POST",
      headers: { Authorization: `Bearer ${t}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        payer: { ...(instrument ? { default_payment_instrument: instrument, allowed_payment_instruments: [instrument, "PAYMENT_CARD"] } : {}), contact: { email: order.customer_email, phone_number: order.phone ?? undefined, first_name: order.customer_name?.split(" ")[0], last_name: order.customer_name?.split(" ").slice(1).join(" ") } },
        target: { type: "ACCOUNT", goid: Number(goid) },
        amount: minor(order.total),
        currency: order.currency,
        order_number: String(order.number),
        order_description: `Objednávka ${order.number}`,
        items: order.items.map((i) => ({ type: "ITEM", name: i.name, amount: minor(i.price * i.qty), count: i.qty })),
        callback: { return_url: urls.returnUrl, notification_url: urls.notifyUrl },
        lang: order.locale === "cs" ? "CS" : "EN",
        additional_params: [{ name: "order_id", value: order.id }],
      }),
    });
    const data = await r.json();
    if (!r.ok) throw new Error(`GoPay create ${r.status}: ${JSON.stringify(data)}`);
    return { redirectUrl: data.gw_url, status: "pending", ref: String(data.id) };
  },
  async handleWebhook(req) {
    // GoPay pings notification_url with ?id=<payment id>; the state must be fetched.
    const id = new URL(req.url).searchParams.get("id");
    if (!id) return null;
    const t = await token("payment-all");
    const r = await fetch(`${env().base}/payments/payment/${id}`, { headers: { Authorization: `Bearer ${t}` } });
    const p = await r.json();
    const orderId = (p.additional_params ?? []).find((x: { name: string }) => x.name === "order_id")?.value;
    if (!orderId) return null;
    const map: Record<string, "paid" | "failed" | "pending" | "refunded"> = { PAID: "paid", CANCELED: "failed", TIMEOUTED: "failed", REFUNDED: "refunded", PARTIALLY_REFUNDED: "refunded" };
    return { orderId, status: map[p.state] ?? "pending", ref: String(p.id) };
  },
});
