import type { Carrier } from "./index";
/* DPD CZ. Their shipping API is issued per customer contract (DPD Shipper / "DPD API 2.0").
   Until credentials exist, shipments are entered manually and this adapter only provides tracking links. */
const key = process.env.DPD_CLIENT_KEY;
export const dpd: Carrier = {
  id: "dpd",
  label: "DPD",
  configured: Boolean(key),
  capability: "manual",
  async createShipment() {
    throw new Error("DPD: create the parcel in DPD Shipper and paste the parcel number into the order.");
  },
  trackingUrl: (n) => `https://tracking.dpd.de/status/cs_CZ/parcel/${encodeURIComponent(n)}`,
};
