import manifest from "@/data/images.json";
/** Public path of a downloaded product image, or undefined while none exists. */
export const imageFor = (slug: string): string | undefined => (manifest as Record<string, string>)[slug];
