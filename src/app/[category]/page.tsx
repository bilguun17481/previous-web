import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { categories as localCategories, type Category } from "@/data/catalog";
import { getCategories, getPage, getPageAsViewer, getProducts, getSetting } from "@/lib/data";
import { bannerKey, categoryBannerPage } from "@/lib/categoryBanner";
import type { Page as BuilderPage } from "@/lib/types";
import { renderSections } from "@/lib/renderPage";
import { CategoryView } from "@/components/views/CategoryView";

export const revalidate = 60;
// Custom pages from the admin render on demand. The GitHub Pages workflow flips this to false for the static export.
export const dynamicParams = true;

export function generateStaticParams() {
  return localCategories.map((c) => ({ category: c.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ category: string }> }): Promise<Metadata> {
  const { category } = await params;
  const page = await getPage(category);
  if (!page) return {};
  return { title: `${page.seo?.title?.cs || page.title.cs} · Moto Dvořák`, description: page.seo?.description?.cs };
}

/** Serves both catalog categories (/ctyrkolky/) and pages built in the admin (/akce/, /o-nas/, …). */
export default async function Page({ params }: { params: Promise<{ category: string }> }) {
  const { category } = await params;
  const cats = await getCategories();
  const cat = cats.find((c) => c.slug === category);
  if (cat) {
    const [products, stored] = await Promise.all([getProducts({ category: category as Category }), getSetting<BuilderPage>(bannerKey(cat.slug))]);
    return <CategoryView category={cat} products={products} banner={categoryBannerPage(cat, stored).sections[0]} />;
  }
  const page = (await getPage(category)) ?? (await getPageAsViewer(category)); // drafts are visible to signed-in staff only
  if (!page) notFound();
  return renderSections(page.sections);
}
