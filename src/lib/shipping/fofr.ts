import type { Carrier } from "./index";
/* FOFR pallet freight has no public shipment API; orders are booked in the FOFR customer portal.
   The order page records the shipment number by hand and links to tracking. */
export const fofr: Carrier = {
  id: "fofr",
  label: "FOFR",
  configured: Boolean(process.env.FOFR_API_KEY),
  capability: "manual",
  async createShipment() {
    throw new Error("FOFR: book the pallet in the FOFR portal and paste the shipment number into the order.");
  },
  trackingUrl: (n) => `https://www.fofr.cz/sledovani-zasilky/?cislo=${encodeURIComponent(n)}`,
};
