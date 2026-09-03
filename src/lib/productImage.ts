import { imageFor } from "@/lib/images";
import type { ShopProduct } from "@/lib/types";
/** First product image: database images win, then the local manifest. */
export const primaryImage = (p: ShopProduct) => p.images?.[0]?.url ?? imageFor(p.slug);
