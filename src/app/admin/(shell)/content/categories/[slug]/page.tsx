"use client";
import { useParams } from "next/navigation";
import { Editor } from "@/components/admin/pagebuilder/Editor";
import { CATEGORY_PAGE_PREFIX } from "@/lib/categoryBanner";

/** The category banner opens in the page editor as a single hero section. */
export default function CategoryBanner() {
  const { slug } = useParams<{ slug: string }>();
  return <Editor slug={CATEGORY_PAGE_PREFIX + slug} />;
}
