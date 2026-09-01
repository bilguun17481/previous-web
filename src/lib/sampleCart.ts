import { bySlug } from "@/data/catalog";
/* Static sample state for the design mockup. */
export const sampleCart = [
  { p: bySlug("kentoya-v-cross-125-4t")!, qty: 1 },
  { p: bySlug("prilba-otevrena-s-plexi")!, qty: 2 },
  { p: bySlug("plachta-na-skutr")!, qty: 1 },
];
export const cartSubtotal = sampleCart.reduce((s, i) => s + i.p.price * i.qty, 0);
