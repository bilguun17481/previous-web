import manifest from "@/data/images.json";

const base = process.env.NEXT_PUBLIC_BASE_PATH || "";

/** Public URL of a downloaded product image, or undefined while none exists. */
export const imageFor = (slug: string): string | undefined => {
  const p = (manifest as Record<string, string>)[slug];
  return p ? base + p : undefined;
};
