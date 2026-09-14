import { CheckoutView } from "@/components/views/CheckoutView";
import { getPaymentMethods, getShippingMethods } from "@/lib/data";
import { supabaseConfigured } from "@/lib/supabase/env";
import { publicEnv } from "@/lib/env";

export const revalidate = 60;

export default async function Page() {
  const [shipping, payments] = await Promise.all([getShippingMethods(), getPaymentMethods()]);
  return <CheckoutView shipping={shipping} payments={payments} live={supabaseConfigured} packetaKey={publicEnv("NEXT_PUBLIC_PACKETA_API_KEY")} />;
}
