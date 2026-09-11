import { Sections } from "@/components/Sections";
import { getCategories, getProducts } from "@/lib/data";
import { supabaseConfigured } from "@/lib/supabase/env";
import { defaultFeatured } from "@/lib/defaultHome";
import type { Section, ShopProduct } from "@/lib/types";

/** Resolve the data a page's sections need and render them. Shared by the home page and custom pages. */
export async function renderSections(sections: Section[]) {
  const [categories, all] = await Promise.all([getCategories(), getProducts()]);
  const count = Object.fromEntries(categories.map((c) => [c.slug, all.filter((p) => p.category === c.slug).length]));
  const products: Record<string, ShopProduct[]> = {};
  for (const s of sections) {
    if (s.type !== "products") continue;
    let list: ShopProduct[] = [];
    if (s.source === "featured") list = supabaseConfigured ? all.filter((p) => p.featured) : defaultFeatured.map((x) => all.find((p) => p.slug === x)!).filter(Boolean);
    else if (s.source === "category" && s.category) list = all.filter((p) => p.category === s.category);
    else if (s.source === "manual" && s.slugs) list = s.slugs.map((x) => all.find((p) => p.slug === x)).filter(Boolean) as ShopProduct[];
    products[s.id] = list.slice(0, s.limit ?? 8);
  }
  return <Sections sections={sections} products={products} categories={categories} count={count} />;
}
