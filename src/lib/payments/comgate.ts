import { minor, type PaymentProvider } from "./index";
/* Comgate payment gateway. Docs: https://help.comgate.cz/docs/protocol-api-en */
const merchant = process.env.COMGATE_MERCHANT;
const secret = process.env.COMGATE_SECRET;
const test = process.env.COMGATE_TEST !== "false";
const base = "https://payments.comgate.cz/v1.0";

export const comgateProvider: PaymentProvider = {
  id: "comgate",
  configured: Boolean(merchant && secret),
  async createPayment(order) {
    const body = new URLSearchParams({
      merchant: merchant!, secret: secret!, test: String(test),
      price: String(minor(order.total)), curr: order.currency,
      label: `Objednávka ${order.number}`.slice(0, 16), refId: order.id,
      method: "ALL", email: order.customer_email, prepareOnly: "true",
      lang: order.locale === "cs" ? "cs" : "en", country: "CZ",
    });
    const r = await fetch(`${base}/create`, { method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded" }, body });
    const data = Object.fromEntries(new URLSearchParams(await r.text()));
    if (data.code !== "0") throw new Error(`Comgate create: ${data.message}`);
    return { redirectUrl: data.redirect, status: "pending", ref: data.transId };
  },
  async handleWebhook(req) {
    // Comgate POSTs application/x-www-form-urlencoded: transId, refId, status, secret …
    const data = Object.fromEntries(new URLSearchParams(await req.text()));
    if (data.secret !== secret || !data.refId) return null;
    const map: Record<string, "paid" | "failed" | "pending"> = { PAID: "paid", CANCELLED: "failed", AUTHORIZED: "pending", PENDING: "pending" };
    return { orderId: data.refId, status: map[data.status] ?? "pending", ref: data.transId };
  },
};
