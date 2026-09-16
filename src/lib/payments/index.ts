import type { Order } from "@/lib/types";
import { stripeProvider } from "./stripe";
import { gopay } from "./gopay";
import { comgateProvider } from "./comgate";
import { paypalProvider } from "./paypal";
import { offlineProvider } from "./offline";

export interface PaymentResult { redirectUrl?: string; status: "pending" | "paid"; ref?: string; clientSecret?: string }
export interface WebhookResult { orderId: string; status: "paid" | "failed" | "pending" | "refunded"; ref?: string }

export interface PaymentProvider {
  id: string;
  /** True when the server has the secrets it needs. */
  configured: boolean;
  createPayment(order: Order, urls: { returnUrl: string; cancelUrl: string; notifyUrl: string }): Promise<PaymentResult>;
  /** Payment confirmed on our own page (Apple Pay / Google Pay / Link through Stripe's Express Checkout). */
  createIntent?(order: Order): Promise<{ clientSecret: string; ref: string }>;
  /** Parse a gateway callback (POST webhook or GET return). Return null when the request is not an order update. */
  handleWebhook(req: Request): Promise<WebhookResult | null>;
}

/* Checkout ids that are variants of a stored payment method: the DB row is the base id, the variant
   decides how the gateway is opened (wallet on our page, or GoPay pre-set to a wallet). */
export const VARIANTS: Record<string, string> = { stripe_express: "stripe", gopay_gpay: "gopay", gopay_applepay: "gopay" };
export const baseMethodId = (id: string) => VARIANTS[id] ?? id;

export const providers: Record<string, PaymentProvider> = {
  stripe: stripeProvider,
  stripe_express: stripeProvider,
  gopay: gopay(),
  gopay_gpay: gopay("GPAY"),
  gopay_applepay: gopay("APPLE_PAY"),
  comgate: comgateProvider,
  paypal: paypalProvider,
  bank_transfer: offlineProvider("bank_transfer"),
  cash: offlineProvider("cash"),
};

/** Minor-unit amount (haléře / cents) for gateways that want integers. */
export const minor = (n: number) => Math.round(n * 100);
