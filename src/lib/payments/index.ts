import type { Order } from "@/lib/types";
import { stripeProvider } from "./stripe";
import { gopayProvider } from "./gopay";
import { comgateProvider } from "./comgate";
import { paypalProvider } from "./paypal";
import { offlineProvider } from "./offline";

export interface PaymentResult { redirectUrl?: string; status: "pending" | "paid"; ref?: string }
export interface WebhookResult { orderId: string; status: "paid" | "failed" | "pending" | "refunded"; ref?: string }

export interface PaymentProvider {
  id: string;
  /** True when the server has the secrets it needs. */
  configured: boolean;
  createPayment(order: Order, urls: { returnUrl: string; cancelUrl: string; notifyUrl: string }): Promise<PaymentResult>;
  /** Parse a gateway callback (POST webhook or GET return). Return null when the request is not an order update. */
  handleWebhook(req: Request): Promise<WebhookResult | null>;
}

export const providers: Record<string, PaymentProvider> = {
  stripe: stripeProvider,
  gopay: gopayProvider,
  comgate: comgateProvider,
  paypal: paypalProvider,
  bank_transfer: offlineProvider("bank_transfer"),
  cash: offlineProvider("cash"),
};

/** Minor-unit amount (haléře / cents) for gateways that want integers. */
export const minor = (n: number) => Math.round(n * 100);
