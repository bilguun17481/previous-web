/* Image variants. Originals stay untouched in storage; smaller WebP copies live beside them:
   thumbs/<path>.webp (320 px, admin grids and lists) and cards/<path>.webp (800 px, storefront cards).
   Heroes, banners and the product page's main image always use the original. */
export type Size = "thumb" | "card" | "full";
export const SIZES: Record<Exclude<Size, "full">, number> = { thumb: 320, card: 800 };
const PUBLIC = "/storage/v1/object/public/media/";

/** URL of a smaller variant of a Supabase Storage image; other URLs are returned unchanged. */
export function variant(url: string | undefined, size: Size): string | undefined {
  if (!url || size === "full" || !url.includes(PUBLIC)) return url;
  const [base, rest] = url.split(PUBLIC);
  if (!rest || rest.startsWith("thumbs/") || rest.startsWith("cards/") || rest.startsWith("videos/")) return url;
  return `${base}${PUBLIC}${size === "thumb" ? "thumbs" : "cards"}/${rest}.webp`;
}

/** Storage path of a variant for a given original path. */
export const variantPath = (path: string, size: Exclude<Size, "full">) => `${size === "thumb" ? "thumbs" : "cards"}/${path}.webp`;

/** Resize an image blob in the browser. Returns null when the browser cannot decode it (e.g. HEIC). */
export async function resizeImage(blob: Blob, max: number): Promise<Blob | null> {
  try {
    const bmp = await createImageBitmap(blob);
    const scale = Math.min(1, max / Math.max(bmp.width, bmp.height));
    const c = document.createElement("canvas");
    c.width = Math.max(1, Math.round(bmp.width * scale)); c.height = Math.max(1, Math.round(bmp.height * scale));
    c.getContext("2d")!.drawImage(bmp, 0, 0, c.width, c.height);
    bmp.close?.();
    return await new Promise<Blob | null>((res) => c.toBlob(res, "image/webp", 0.82));
  } catch { return null; }
}
