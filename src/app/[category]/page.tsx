import { notFound } from "next/navigation";
import { categories as localCategories, type Category } from "@/data/catalog";
import { getCategories, getProducts } from "@/lib/data";
import { CategoryView } from "@/components/views/CategoryView";

export const revalidate = 60;
export const dynamicParams = false;

export function generateStaticParams() {
  return localCategories.map((c) => ({ category: c.slug }));
}

export default async function Page({ params }: { params: Promise<{ category: string }> }) {
  const { category } = await params;
  const cats = await getCategories();
  const cat = cats.find((c) => c.slug === category);
  if (!cat) notFound();
  const products = await getProducts({ category: category as Category });
  return <CategoryView category={cat} products={products} />;
}
