import type { Order } from "@/lib/types";
import { CARRIERS, type CarrierDef, type CarrierGroup, type CarrierService } from "./catalog";

export interface Shipment { trackingNumber: string; labelPdfBase64?: string; labelUrl?: string }
export type CarrierRoute = "direct" | "balikobot" | "packeta" | "manual";
export interface Carrier {
  id: string;
  label: string;
  group: CarrierGroup;
  services: CarrierService[];
  /** True when the server has credentials for the route in use. */
  configured: boolean;
  /** "api": labels are created from the order page. "manual": enter the parcel number by hand. */
  capability: "api" | "manual";
  /** How shipments reach the carrier: its own API, Balíkobot, Zásilkovna's external carriers, or by hand. */
  route: CarrierRoute;
  /** Adapter written from public documentation and not yet verified with live credentials. */
  beta?: boolean;
  /** Environment variables the direct route needs. */
  env: string[];
  createShipment(order: Order): Promise<Shipment>;
  trackingUrl(trackingNumber: string): string;
}

export const splitName = (full: string | null) => {
  const parts = (full ?? "").trim().split(/\s+/);
  return { first: parts[0] ?? "", last: parts.slice(1).join(" ") || parts[0] || "" };
};

/* Direct adapters. Each is a factory read at call time so host runtime variables are honoured. */
type Direct = { configured(): boolean; beta?: boolean; create(order: Order): Promise<Shipment> };
const direct: Record<string, Direct> = {
  packeta: { configured: () => Boolean(process.env.PACKETA_API_PASSWORD), create: (o) => import("./packeta").then((m) => m.packetaShipment(o)) },
  packeta_sk: { configured: () => Boolean(process.env.PACKETA_API_PASSWORD), create: (o) => import("./packeta").then((m) => m.packetaShipment(o)) },
  ppl: { configured: () => Boolean(process.env.PPL_CLIENT_ID && process.env.PPL_CLIENT_SECRET), create: (o) => import("./ppl").then((m) => m.pplShipment(o)) },
  gls: { configured: () => Boolean(process.env.GLS_USERNAME && process.env.GLS_PASSWORD && process.env.GLS_CLIENT_NUMBER), create: (o) => import("./gls").then((m) => m.glsShipment(o)) },
  ceska_posta: { configured: () => Boolean(process.env.CESKA_POSTA_API_TOKEN && process.env.CESKA_POSTA_SECRET_KEY && process.env.CESKA_POSTA_CUSTOMER_ID && process.env.CESKA_POSTA_LOCATION_NUMBER), beta: true, create: (o) => import("./ceska_posta").then((m) => m.ceskaPostaShipment(o, o.shipping_method?.includes("posta") ? "NP" : "DR")) },
  balikovna: { configured: () => Boolean(process.env.CESKA_POSTA_API_TOKEN && process.env.CESKA_POSTA_SECRET_KEY && process.env.CESKA_POSTA_CUSTOMER_ID && process.env.CESKA_POSTA_LOCATION_NUMBER), beta: true, create: (o) => import("./ceska_posta").then((m) => m.ceskaPostaShipment(o, "NB")) },
  dpd: { configured: () => Boolean(process.env.DPD_API_KEY && process.env.DPD_CUSTOMER_ID), beta: true, create: (o) => import("./dpd").then((m) => m.dpdShipment(o)) },
  wedo: { configured: () => Boolean(process.env.WEDO_API_TOKEN), beta: true, create: (o) => import("./wedo").then((m) => m.wedoShipment(o)) },
};
const balikobotOn = () => Boolean(process.env.BALIKOBOT_API_USER && process.env.BALIKOBOT_API_KEY);
const packetaOn = () => Boolean(process.env.PACKETA_API_PASSWORD);

/** Resolve one catalogue entry into a working adapter using the best route available right now. */
function build(def: CarrierDef): Carrier {
  const base = { id: def.id, label: def.label, group: def.group, services: def.services, env: def.env ?? [], trackingUrl: def.tracking };
  if (def.id === "dealer") return { ...base, configured: true, capability: "manual", route: "manual", async createShipment(order) { return { trackingNumber: `MD-${order.number}` }; } };
  const d = direct[def.id];
  if (d?.configured()) return { ...base, configured: true, capability: "api", route: "direct", beta: d.beta, createShipment: d.create };
  if (def.balikobot && balikobotOn()) {
    const { shipper, service } = def.balikobot;
    return { ...base, configured: true, capability: "api", route: "balikobot", createShipment: (o) => import("./balikobot").then((m) => m.balikobotShipment(o, shipper, service)) };
  }
  if (def.packetaCarrierId && packetaOn()) {
    const cid = def.packetaCarrierId;
    return { ...base, configured: true, capability: "api", route: "packeta", createShipment: (o) => import("./packeta").then((m) => m.packetaShipment(o, cid)) };
  }
  return {
    ...base, configured: false, capability: d ? "api" : "manual", route: "manual", beta: d?.beta,
    async createShipment() { throw new Error(`${def.label}: no connection configured. Add ${def.env?.length ? def.env.join(", ") : "Balíkobot credentials (BALIKOBOT_API_USER, BALIKOBOT_API_KEY)"} to the host, or create the shipment at the carrier and paste the parcel number into the order.`); },
  };
}

/** Live registry, rebuilt on each access so newly added host variables take effect without a restart. */
export const carriers: Record<string, Carrier> = new Proxy({} as Record<string, Carrier>, {
  get: (_t, id: string) => { const def = CARRIERS.find((c) => c.id === id); return def ? build(def) : undefined; },
  has: (_t, id: string) => CARRIERS.some((c) => c.id === id),
  ownKeys: () => CARRIERS.map((c) => c.id),
  getOwnPropertyDescriptor: (_t, id: string) => { const def = CARRIERS.find((c) => c.id === id); return def ? { enumerable: true, configurable: true, value: build(def) } : undefined; },
});
export const allCarriers = () => CARRIERS.map(build);
