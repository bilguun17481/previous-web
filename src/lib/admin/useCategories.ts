"use client";
import { useEffect, useState } from "react";
import { categories as localCategories } from "@/data/catalog";
import { repo, type CategoryRow } from "@/lib/admin/repo";

const fallback: CategoryRow[] = localCategories.map((c, i) => ({ slug: c.slug, label: c.label, blurb: c.blurb, image_url: null, video_url: null, sort: i }));
/** The store's categories for admin selects and labels; the bundled list until the database answers. */
export function useCategories() {
  const [cats, setCats] = useState<CategoryRow[]>(fallback);
  useEffect(() => { repo().categories.list().then((c) => { if (c.length) setCats(c); }).catch(() => {}); }, []);
  return cats;
}
