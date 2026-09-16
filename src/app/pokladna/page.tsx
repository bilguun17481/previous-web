import { CheckoutView } from "@/components/views/CheckoutView";
import { getPaymentMethods, getShippingMethods, getProduct } from "@/lib/data";
import { supabaseConfigured } from "@/lib/supabase/env";
import { publicEnv } from "@/lib/env";
import { primaryImage } from "@/lib/productImage";

export const revalidate = 60;

export default async function Page({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const [shipping, payments] = await Promise.all([getShippingMethods(), getPaymentMethods()]);
  // ?add=<slug> puts that product in the cart (used by the payment demo link from the admin).
  const sp = await searchParams;
  const addSlug = typeof sp?.add === "string" ? sp.add : undefined;
  const preload = addSlug ? await getProduct(addSlug) : undefined;
  const preloadItem = preload ? { slug: preload.slug, name: preload.name, brand: preload.brand, price: preload.price, image: primaryImage(preload) } : undefined;
  return <CheckoutView shipping={shipping} payments={payments} live={supabaseConfigured} packetaKey={publicEnv("NEXT_PUBLIC_PACKETA_API_KEY")} preload={preloadItem} />;
}
