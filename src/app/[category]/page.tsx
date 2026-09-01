import { notFound } from "next/navigation";
import { categories, type Category } from "@/data/catalog";
import { CategoryView } from "@/components/views/CategoryView";

export function generateStaticParams() {
  return categories.map((c) => ({ category: c.slug }));
}

export default async function Page({ params }: { params: Promise<{ category: string }> }) {
  const { category } = await params;
  if (!categories.some((c) => c.slug === category)) notFound();
  return <CategoryView category={category as Category} />;
}
