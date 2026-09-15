import type { Order } from "@/lib/types";
import type { Shipment } from "./index";
import { splitName } from "./index";
/* DPD CZ Shipping API. Docs: https://www.dpd.cz/api/Shipping_API/DPD_Shipping_API.pdf
   The bearer key is issued by DPD technical support for contract customers. Labels are prepared by the
   depot for the courier; the API returns the parcel number, which is enough for tracking.
   Beta: written from the public documentation, verify with real credentials. */
const base = "https://shipping.dpdgroup.com/api/v1.1";
export const dpdConfigured = () => Boolean(process.env.DPD_API_KEY && process.env.DPD_CUSTOMER_ID);

export async function dpdShipment(order: Order): Promise<Shipment> {
  const { first, last } = splitName(order.customer_name);
  const a = order.shipping_address ?? {};
  const point = order.pickup_point as { id?: string | number } | null;
  const body = {
    shipments: [{
      reference: String(order.number), customerId: process.env.DPD_CUSTOMER_ID,
      receiver: { name: `${first} ${last}`.trim(), street: a.street, city: a.city, zip: a.zip, country: a.country ?? "CZ", email: order.customer_email, phone: order.phone },
      parcels: [{ weight: Math.max(0.5, order.items.reduce((s, i) => s + i.qty, 0) * 1.5) }],
      services: { ...(point?.id ? { pickup: { id: String(point.id) } } : {}), ...(order.payment_status !== "paid" ? { cod: { amount: order.total, currency: order.currency, variableSymbol: String(order.number) } } : {}), predict: { email: order.customer_email, phone: order.phone } },
    }],
  };
  const r = await fetch(`${base}/shipments`, { method: "POST", headers: { Authorization: `Bearer ${process.env.DPD_API_KEY}`, "Content-Type": "application/json" }, body: JSON.stringify(body) });
  const text = await r.text();
  if (!r.ok) throw new Error(`DPD ${r.status}: ${text.slice(0, 300)}`);
  const d = JSON.parse(text) as { shipments?: { parcels?: { parcelNumber?: string }[]; labelUrl?: string }[] };
  const n = d.shipments?.[0]?.parcels?.[0]?.parcelNumber;
  if (!n) throw new Error(`DPD: no parcel number in response: ${text.slice(0, 200)}`);
  return { trackingNumber: n, labelUrl: d.shipments?.[0]?.labelUrl };
}
