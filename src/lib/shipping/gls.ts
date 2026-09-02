import type { Carrier } from "./index";
import { splitName } from "./index";
/* GLS MyGLS API (JSON). Docs: https://api.mygls.cz — username + password from the GLS account. */
const username = process.env.GLS_USERNAME;
const password = process.env.GLS_PASSWORD;
const clientNumber = process.env.GLS_CLIENT_NUMBER;
const base = "https://api.mygls.cz/ParcelService.svc/json";

export const gls: Carrier = {
  id: "gls",
  label: "GLS",
  configured: Boolean(username && password && clientNumber),
  capability: "api",
  async createShipment(order) {
    const { createHash } = await import("node:crypto");
    const pwHash = Array.from(createHash("sha512").update(password!).digest());
    const { first, last } = splitName(order.customer_name);
    const a = order.shipping_address ?? {};
    const r = await fetch(`${base}/PrintLabels`, {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        Username: username, Password: pwHash, TypeOfPrinter: "A4_2x2",
        ParcelList: [{
          ClientNumber: Number(clientNumber), ClientReference: String(order.number), Count: 1,
          ...(order.payment_status !== "paid" ? { CODAmount: order.total, CODReference: String(order.number) } : {}),
          PickupAddress: { Name: "Moto Dvořák", Street: "Nádraží", HouseNumber: "604", City: "Golčův Jeníkov", ZipCode: "58282", CountryIsoCode: "CZ" },
          DeliveryAddress: { Name: `${first} ${last}`, Street: a.street, City: a.city, ZipCode: a.zip, CountryIsoCode: "CZ", ContactEmail: order.customer_email, ContactPhone: order.phone },
        }],
      }),
    });
    const d = await r.json();
    if (d.PrintLabelsErrorList?.length) throw new Error(`GLS: ${d.PrintLabelsErrorList[0].ErrorDescription}`);
    const number = String(d.PrintLabelsInfoList?.[0]?.ParcelNumber ?? "");
    return { trackingNumber: number, labelPdfBase64: Buffer.from(d.Labels as number[]).toString("base64") };
  },
  trackingUrl: (n) => `https://gls-group.eu/CZ/cs/sledovani-zasilek?match=${encodeURIComponent(n)}`,
};
