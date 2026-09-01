import { notFound } from "next/navigation";
import { bySlug, products } from "@/data/catalog";
import { ProductView } from "@/components/views/ProductView";

export function generateStaticParams() {
  return products.map((p) => ({ slug: p.slug }));
}

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const p = bySlug(slug);
  if (!p) notFound();
  return <ProductView slug={slug} />;
}
