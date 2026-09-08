/* Match uploaded file names to catalog products. Used by the media library auto-assign tool. */
import type { ShopProduct } from "@/lib/types";

const strip = (s: string) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
/** File name without folder, extension, and a trailing view/sequence suffix such as "-2" or " front". */
export const fileLabel = (path: string) =>
  strip(path.split("/").pop() ?? path).replace(/\.[a-z0-9]{2,5}$/i, "").replace(/(?:[-_ ]\d{1,2}|[-_ ]?(?:front|back|side|left|right|detail|main|hero))$/i, "");

const tokens = (s: string) =>
  strip(s).replace(/(\d)\s(\d{3})\b/g, "$1$2").replace(/([a-z])(\d)/g, "$1 $2").replace(/(\d)([a-z])/g, "$1 $2").split(/[^a-z0-9]+/).filter(Boolean);

/** 0..1 similarity between a file label and a product; numbers must agree when both sides have any. */
export function score(label: string, p: ShopProduct) {
  const brand = strip(p.brand);
  const lt = tokens(label).filter((t) => t !== brand);
  const pt = tokens(p.name).filter((t) => t !== brand);
  if (!lt.length || !pt.length) return 0;
  const ln = lt.filter((t) => /\d/.test(t)), pn = pt.filter((t) => /\d/.test(t));
  if (ln.length && pn.length && !ln.some((n) => pn.includes(n))) return 0;
  const hits = pt.filter((t) => lt.includes(t)).length;
  if (!hits) return 0;
  const precision = hits / pt.length, recall = hits / lt.length;
  const f1 = (2 * precision * recall) / (precision + recall);
  return Math.min(1, f1 + (tokens(label).includes(brand) ? 0.1 : 0));
}

export function bestMatch(label: string, products: ShopProduct[]) {
  let best: { p: ShopProduct; s: number } | null = null;
  for (const p of products) { const s = score(label, p); if (!best || s > best.s) best = { p, s }; }
  return best && best.s >= 0.3 ? best : null;
}
