import { notFound } from "next/navigation";
import { products as localProducts } from "@/data/catalog";
import { getCategories, getProduct, getProducts } from "@/lib/data";
import { supabaseConfigured } from "@/lib/supabase/env";
import { ProductView } from "@/components/views/ProductView";

export const revalidate = 30;
// New products added in the admin render on demand. The GitHub Pages workflow flips this to false for the static export.
export const dynamicParams = true;

export async function generateStaticParams() {
  const list = supabaseConfigured ? await getProducts() : localProducts;
  return list.map((p) => ({ slug: p.slug }));
}

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const p = await getProduct(slug);
  if (!p) notFound();
  const [cats, siblings] = await Promise.all([getCategories(), getProducts({ category: p.category })]);
  const cat = cats.find((c) => c.slug === p.category)!;
  return <ProductView p={p} category={cat} related={siblings.filter((x) => x.slug !== p.slug).slice(0, 4)} />;
}
