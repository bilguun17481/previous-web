import type { Order } from "@/lib/types";
import type { Shipment } from "./index";
import { splitName } from "./index";
/* Balíkobot (https://balikobot.cz): one API in front of 30+ carriers. The shop's own carrier contracts
   and prices stay in place; Balíkobot only relays the shipment. Docs: https://balikobotv2.docs.apiary.io */
const base = "https://apiv2.balikobot.cz";
export const balikobotConfigured = () => Boolean(process.env.BALIKOBOT_API_USER && process.env.BALIKOBOT_API_KEY);

/** Create a shipment at the given Balíkobot shipper and return its label and tracking number. */
export async function balikobotShipment(order: Order, shipper: string, serviceType: string): Promise<Shipment> {
  const auth = "Basic " + Buffer.from(`${process.env.BALIKOBOT_API_USER}:${process.env.BALIKOBOT_API_KEY}`).toString("base64");
  const service = process.env[`BALIKOBOT_SERVICE_${shipper.toUpperCase()}`] || serviceType;
  const { first, last } = splitName(order.customer_name);
  const a = order.shipping_address ?? {};
  const point = order.pickup_point as { id?: string | number } | null;
  const weight = Math.max(0.5, order.items.reduce((s, i) => s + i.qty, 0) * 1.5);
  const pkg: Record<string, unknown> = {
    eid: String(order.number), service_type: service, rec_name: `${first} ${last}`.trim(), rec_street: a.street, rec_city: a.city, rec_zip: a.zip, rec_country: a.country ?? "CZ",
    rec_email: order.customer_email, rec_phone: order.phone, price: order.total, weight, vs: String(order.number),
    ...(point?.id ? { branch_id: String(point.id) } : {}),
    ...(order.payment_status !== "paid" ? { cod_price: order.total, cod_currency: order.currency } : {}),
  };
  const r = await fetch(`${base}/${shipper}/add`, { method: "POST", headers: { Authorization: auth, "Content-Type": "application/json" }, body: JSON.stringify({ packages: [pkg] }) });
  const d = (await r.json().catch(() => ({}))) as { status?: number; packages?: { carrier_id?: string; label_url?: string; track_url?: string; errors?: unknown }[]; message?: string };
  if (!r.ok || d.status !== 200) throw new Error(`Balíkobot ${shipper}: ${d.message ?? JSON.stringify(d.packages?.[0]?.errors ?? d)}`);
  const p = d.packages?.[0];
  if (!p?.carrier_id) throw new Error(`Balíkobot ${shipper}: no carrier number returned`);
  return { trackingNumber: p.carrier_id, labelUrl: p.label_url };
}
