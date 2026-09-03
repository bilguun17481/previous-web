import type { Carrier } from "./index";
import { splitName } from "./index";
/* PPL myAPI2. Docs: https://ppl-cz.github.io/myapi2 — credentials from PPL customer support. */
const clientId = process.env.PPL_CLIENT_ID;
const clientSecret = process.env.PPL_CLIENT_SECRET;
const base = "https://api.dhl.com/ecs/ppl/myapi2";

async function token() {
  const r = await fetch("https://api.dhl.com/ecs/ppl/myapi2/login/getAccessToken", {
    method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ grant_type: "client_credentials", client_id: clientId!, client_secret: clientSecret!, scope: "myapi2" }),
  });
  return (await r.json()).access_token as string;
}

export const ppl: Carrier = {
  id: "ppl",
  label: "PPL",
  configured: Boolean(clientId && clientSecret),
  capability: "api",
  async createShipment(order) {
    const t = await token();
    const { first, last } = splitName(order.customer_name);
    const a = order.shipping_address ?? {};
    const r = await fetch(`${base}/shipment/batch`, {
      method: "POST", headers: { Authorization: `Bearer ${t}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        returnChannel: { type: "None" },
        labelSettings: { format: "Pdf", dpi: 300, completeLabelSettings: { isCompleteLabelRequested: true, pageSize: "A4", position: 1 } },
        shipments: [{
          referenceId: String(order.number), productType: "BUSD",
          recipient: { name: `${first} ${last}`, street: a.street, city: a.city, zipCode: a.zip, country: "CZ", email: order.customer_email, phone: order.phone },
          shipmentSet: { numberOfShipments: 1 },
          ...(order.payment_status !== "paid" ? { cashOnDelivery: { codPrice: order.total, codCurrency: order.currency, codVarSym: String(order.number) } } : {}),
        }],
      }),
    });
    if (!r.ok) throw new Error(`PPL batch ${r.status}: ${await r.text()}`);
    const location = r.headers.get("location") ?? "";
    // The batch is asynchronous: poll the returned location for label + shipment number.
    for (let i = 0; i < 10; i++) {
      await new Promise((res) => setTimeout(res, 1500));
      const s = await fetch(location, { headers: { Authorization: `Bearer ${t}` } });
      const d = await s.json();
      const item = d.items?.[0];
      if (item?.importState === "Complete") return { trackingNumber: item.shipmentNumber, labelUrl: d.completeLabel?.labelUrls?.[0] };
      if (item?.importState === "Error") throw new Error(`PPL: ${JSON.stringify(item.errorMessage)}`);
    }
    throw new Error("PPL: label not ready, retry from the order page");
  },
  trackingUrl: (n) => `https://www.ppl.cz/vyhledat-zasilku?shipmentId=${encodeURIComponent(n)}`,
};
