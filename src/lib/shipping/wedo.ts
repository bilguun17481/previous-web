import type { Order } from "@/lib/types";
import type { Shipment } from "./index";
import { splitName } from "./index";
/* One by Allegro (formerly WE|DO) REST API v2. Docs: https://api.wedo.cz/v2/ (test: https://api.test.wedo.cz/v2/)
   Beta: written from the public documentation, verify with real credentials. */
const base = process.env.WEDO_SANDBOX === "true" ? "https://api.test.wedo.cz/v2" : "https://api.wedo.cz/v2";
export const wedoConfigured = () => Boolean(process.env.WEDO_API_TOKEN);

export async function wedoShipment(order: Order): Promise<Shipment> {
  const { first, last } = splitName(order.customer_name);
  const a = order.shipping_address ?? {};
  const point = order.pickup_point as { id?: string | number } | null;
  const headers = { Authorization: `Bearer ${process.env.WEDO_API_TOKEN}`, "Content-Type": "application/json", Accept: "application/json" };
  const body = {
    reference: String(order.number), product: point?.id ? "ONE_POINT" : "ONE_COURIER", ...(point?.id ? { pickupPointId: String(point.id) } : {}),
    recipient: { firstName: first, lastName: last, street: a.street, city: a.city, zip: a.zip, country: a.country ?? "CZ", email: order.customer_email, phone: order.phone },
    parcels: [{ weight: Math.max(0.5, order.items.reduce((s, i) => s + i.qty, 0) * 1.5), value: order.total }],
    ...(order.payment_status !== "paid" ? { cod: { amount: order.total, currency: order.currency, variableSymbol: String(order.number) } } : {}),
  };
  const r = await fetch(`${base}/shipments`, { method: "POST", headers, body: JSON.stringify(body) });
  const text = await r.text();
  if (!r.ok) throw new Error(`One by Allegro ${r.status}: ${text.slice(0, 300)}`);
  const d = JSON.parse(text) as { id?: string; trackingNumber?: string; parcels?: { trackingNumber?: string }[] };
  const n = d.trackingNumber ?? d.parcels?.[0]?.trackingNumber ?? d.id;
  if (!n) throw new Error(`One by Allegro: no tracking number in response: ${text.slice(0, 200)}`);
  const label = await fetch(`${base}/shipments/${d.id ?? n}/label?format=pdf`, { headers }).catch(() => null);
  const pdf = label && label.ok ? Buffer.from(await label.arrayBuffer()).toString("base64") : undefined;
  return { trackingNumber: n, labelPdfBase64: pdf };
}
