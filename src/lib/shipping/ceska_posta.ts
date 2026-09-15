import type { Order } from "@/lib/types";
import type { Shipment } from "./index";
import { splitName } from "./index";
/* Česká pošta B2B "nAPI" (Balík Do ruky, Balík Na poštu, Balíkovna). Docs: https://www.ceskaposta.cz/en/napi/b2b
   Credentials come from PoštaOnline → Služby pro firmy → Správa B2B profilu (API token + secret key),
   plus the customer id and the location (podací místo) number from the B2B contract.
   Beta: written from the public documentation, verify with real credentials before going live. */
const base = "https://b2b.postaonline.cz/restservices/ZSKService/v1";
const env = () => ({ token: process.env.CESKA_POSTA_API_TOKEN, secret: process.env.CESKA_POSTA_SECRET_KEY, customerId: process.env.CESKA_POSTA_CUSTOMER_ID, location: process.env.CESKA_POSTA_LOCATION_NUMBER });
export const ceskaPostaConfigured = () => { const e = env(); return Boolean(e.token && e.secret && e.customerId && e.location); };

/** prefix: DR = Balík Do ruky, NP = Balík Na poštu, NB = Balíkovna */
export async function ceskaPostaShipment(order: Order, prefix: "DR" | "NP" | "NB"): Promise<Shipment> {
  const { createHmac } = await import("node:crypto");
  const e = env();
  const { first, last } = splitName(order.customer_name);
  const a = order.shipping_address ?? {};
  const point = order.pickup_point as { id?: string | number; zip?: string } | null;
  const now = new Date();
  const body = {
    parcelServiceHeader: { transmissionDate: now.toISOString().slice(0, 10), customerID: e.customerId, postCode: "", locationNumber: Number(e.location), printParams: { idForm: 101, shiftHorizontal: 0, shiftVertical: 0 }, position: 1 },
    parcelServiceData: {
      parcelParams: { recordID: String(order.number), prefixParcelCode: prefix, weight: Math.max(0.5, order.items.reduce((s, i) => s + i.qty, 0) * 1.5), insuredValue: order.total, ...(order.payment_status !== "paid" ? { amount: order.total, currency: order.currency, vsVoucher: String(order.number) } : {}), ...(prefix !== "DR" && point?.id ? { depositPost: String(point.id) } : {}) },
      parcelAddress: { recordID: String(order.number), firstName: first, surname: last, address: { street: a.street, city: a.city, zipCode: a.zip, isoCountry: a.country ?? "CZ" }, mobilNumber: order.phone, emailAddress: order.customer_email },
    },
  };
  const payload = JSON.stringify(body);
  const timestamp = now.toISOString();
  const signature = createHmac("sha256", e.secret!).update(`${e.token};${timestamp};${payload}`).digest("base64");
  const r = await fetch(`${base}/parcelService`, { method: "POST", headers: { "Content-Type": "application/json", Accept: "application/json", "X-Token": e.token!, "X-Timestamp": timestamp, "X-Signature": signature }, body: payload });
  const text = await r.text();
  if (!r.ok) throw new Error(`Česká pošta ${r.status}: ${text.slice(0, 300)}`);
  const d = JSON.parse(text) as { responseHeader?: { resultParcelData?: { parcelCode?: string }[] }; parcelCode?: string; label?: string; responsePrintParams?: { file?: string } };
  const code = d.responseHeader?.resultParcelData?.[0]?.parcelCode ?? d.parcelCode;
  if (!code) throw new Error(`Česká pošta: no parcel code in response: ${text.slice(0, 200)}`);
  return { trackingNumber: code, labelPdfBase64: d.responsePrintParams?.file ?? d.label };
}
