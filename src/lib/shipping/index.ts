import type { Order } from "@/lib/types";
import { packeta } from "./packeta";
import { ppl } from "./ppl";
import { dpd } from "./dpd";
import { ceskaPosta } from "./ceska_posta";
import { gls } from "./gls";
import { fofr } from "./fofr";

export interface Shipment { trackingNumber: string; labelPdfBase64?: string; labelUrl?: string }
export interface Carrier {
  id: string;
  label: string;
  /** True when the server has API credentials for this carrier. */
  configured: boolean;
  /** Which parts of the integration exist: labels via API, or manual entry only. */
  capability: "api" | "manual";
  createShipment(order: Order): Promise<Shipment>;
  trackingUrl(trackingNumber: string): string;
}

export const carriers: Record<string, Carrier> = {
  packeta, ppl, dpd, ceska_posta: ceskaPosta, gls, fofr,
  dealer: {
    id: "dealer", label: "Vlastní doprava / odběr", configured: true, capability: "manual",
    async createShipment(order) { return { trackingNumber: `MD-${order.number}` }; },
    trackingUrl: () => "",
  },
};

export const splitName = (full: string | null) => {
  const parts = (full ?? "").trim().split(/\s+/);
  return { first: parts[0] ?? "", last: parts.slice(1).join(" ") || parts[0] || "" };
};
