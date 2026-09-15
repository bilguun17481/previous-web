import type { Order } from "@/lib/types";
import type { Shipment } from "./index";
import { splitName } from "./index";
/* Zásilkovna / Packeta REST API. Docs: https://docs.packeta.com
   Also books "external carriers" (Česká pošta, PPL, …) through the same contract when a carrier id is given. */
const endpoint = "https://www.zasilkovna.cz/api/rest";
const esc = (s: unknown) => String(s ?? "").replace(/[<>&'"]/g, (c) => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;", "'": "&apos;", '"': "&quot;" }[c]!));

async function call(xml: string) {
  const r = await fetch(endpoint, { method: "POST", headers: { "Content-Type": "text/xml" }, body: xml });
  const text = await r.text();
  if (/<status>fault<\/status>/.test(text)) throw new Error("Packeta: " + (text.match(/<string>(.*?)<\/string>/)?.[1] ?? text));
  return text;
}

export async function packetaShipment(order: Order, externalCarrierId?: number): Promise<Shipment> {
    const password = process.env.PACKETA_API_PASSWORD;
    const sender = process.env.PACKETA_SENDER_LABEL ?? "";
    const { first, last } = splitName(order.customer_name);
    const a = order.shipping_address ?? {};
    const point = order.pickup_point as { id?: number | string } | null;
    // 106 = Packeta home delivery CZ; an external carrier id books e.g. Balík Do ruky (13) or PPL (25) via Packeta.
    const addressId = externalCarrierId ?? point?.id ?? (order.shipping_method?.includes("home") || order.shipping_method?.includes("adres") ? 106 : undefined);
    const toAddress = addressId === 106 || Boolean(externalCarrierId);
    const weight = Math.max(0.5, order.items.reduce((s, i) => s + i.qty, 0) * 1.5);
    const created = await call(`<createPacket><apiPassword>${password}</apiPassword><packetAttributes>
      <number>${order.number}</number><name>${esc(first)}</name><surname>${esc(last)}</surname>
      <email>${esc(order.customer_email)}</email><phone>${esc(order.phone)}</phone>
      <addressId>${addressId}</addressId><value>${order.total}</value><weight>${weight}</weight><eshop>${esc(sender)}</eshop>
      ${order.payment_status !== "paid" ? `<cod>${order.total}</cod>` : ""}
      ${toAddress ? `<street>${esc(a.street)}</street><city>${esc(a.city)}</city><zip>${esc(a.zip)}</zip>` : ""}
    </packetAttributes></createPacket>`);
    const id = created.match(/<id>(\d+)<\/id>/)?.[1];
    const barcode = created.match(/<barcode>(.*?)<\/barcode>/)?.[1] ?? `Z${id}`;
    if (!id) throw new Error("Packeta: no packet id returned");
    if (externalCarrierId) {
      // External carrier: ask Packeta for the courier's own number and label.
      const num = await call(`<packetCourierNumber><apiPassword>${password}</apiPassword><packetId>${id}</packetId></packetCourierNumber>`).catch(() => "");
      const courierNumber = num.match(/<result>(.*?)<\/result>/)?.[1]?.trim();
      const lbl = await call(`<packetCourierLabelPdf><apiPassword>${password}</apiPassword><packetId>${id}</packetId><courierNumber>${esc(courierNumber)}</courierNumber></packetCourierLabelPdf>`).catch(() => "");
      const cpdf = lbl.match(/<result>([\s\S]*?)<\/result>/)?.[1]?.trim();
      if (courierNumber && cpdf) return { trackingNumber: courierNumber, labelPdfBase64: cpdf };
    }
    const label = await call(`<packetLabelPdf><apiPassword>${password}</apiPassword><packetId>${id}</packetId><format>A6 on A6</format><offset>0</offset></packetLabelPdf>`);
    const pdf = label.match(/<result>([\s\S]*?)<\/result>/)?.[1]?.trim();
    return { trackingNumber: barcode, labelPdfBase64: pdf };
}
