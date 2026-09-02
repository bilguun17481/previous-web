import type { Carrier } from "./index";
import { splitName } from "./index";
/* Zásilkovna / Packeta REST API. Docs: https://docs.packetery.com */
const password = process.env.PACKETA_API_PASSWORD;
const sender = process.env.PACKETA_SENDER_LABEL ?? "";
const endpoint = "https://www.zasilkovna.cz/api/rest";
const esc = (s: unknown) => String(s ?? "").replace(/[<>&'"]/g, (c) => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;", "'": "&apos;", '"': "&quot;" }[c]!));

async function call(xml: string) {
  const r = await fetch(endpoint, { method: "POST", headers: { "Content-Type": "text/xml" }, body: xml });
  const text = await r.text();
  if (/<status>fault<\/status>/.test(text)) throw new Error("Packeta: " + (text.match(/<string>(.*?)<\/string>/)?.[1] ?? text));
  return text;
}

export const packeta: Carrier = {
  id: "packeta",
  label: "Zásilkovna / Packeta",
  configured: Boolean(password),
  capability: "api",
  async createShipment(order) {
    const { first, last } = splitName(order.customer_name);
    const a = order.shipping_address ?? {};
    const point = order.pickup_point as { id?: number | string } | null;
    const addressId = point?.id ?? (order.shipping_method === "packeta_home" ? 106 : undefined); // 106 = Packeta home delivery CZ
    const weight = Math.max(0.5, order.items.reduce((s, i) => s + i.qty, 0) * 1.5);
    const created = await call(`<createPacket><apiPassword>${password}</apiPassword><packetAttributes>
      <number>${order.number}</number><name>${esc(first)}</name><surname>${esc(last)}</surname>
      <email>${esc(order.customer_email)}</email><phone>${esc(order.phone)}</phone>
      <addressId>${addressId}</addressId><value>${order.total}</value><weight>${weight}</weight><eshop>${esc(sender)}</eshop>
      ${order.payment_status !== "paid" ? `<cod>${order.total}</cod>` : ""}
      ${addressId === 106 ? `<street>${esc(a.street)}</street><city>${esc(a.city)}</city><zip>${esc(a.zip)}</zip>` : ""}
    </packetAttributes></createPacket>`);
    const id = created.match(/<id>(\d+)<\/id>/)?.[1];
    const barcode = created.match(/<barcode>(.*?)<\/barcode>/)?.[1] ?? `Z${id}`;
    if (!id) throw new Error("Packeta: no packet id returned");
    const label = await call(`<packetLabelPdf><apiPassword>${password}</apiPassword><packetId>${id}</packetId><format>A6 on A6</format><offset>0</offset></packetLabelPdf>`);
    const pdf = label.match(/<result>([\s\S]*?)<\/result>/)?.[1]?.trim();
    return { trackingNumber: barcode, labelPdfBase64: pdf };
  },
  trackingUrl: (n) => `https://tracking.packeta.com/cs/?id=${encodeURIComponent(n)}`,
};
