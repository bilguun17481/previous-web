import type { Carrier } from "./index";
/* Česká pošta B2B API (Balík do ruky / Balíkovna). Requires a B2B contract and certificate.
   Docs: https://www.ceskaposta.cz/sluzby/b2b-api. Manual entry until credentials are issued. */
const token = process.env.CESKA_POSTA_API_TOKEN;
export const ceskaPosta: Carrier = {
  id: "ceska_posta",
  label: "Česká pošta",
  configured: Boolean(token),
  capability: "manual",
  async createShipment() {
    throw new Error("Česká pošta: create the parcel in Podání Online and paste the parcel number into the order.");
  },
  trackingUrl: (n) => `https://www.postaonline.cz/trackandtrace/-/zasilka/cislo?parcelNumbers=${encodeURIComponent(n)}`,
};
