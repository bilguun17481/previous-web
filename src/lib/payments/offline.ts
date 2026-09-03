import type { PaymentProvider } from "./index";
/** Bank transfer and cash on collection: no gateway, the order waits for staff to mark it paid. */
export const offlineProvider = (id: "bank_transfer" | "cash"): PaymentProvider => ({
  id,
  configured: true,
  async createPayment() { return { status: "pending" }; },
  async handleWebhook() { return null; },
});
