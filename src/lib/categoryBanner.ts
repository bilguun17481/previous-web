import type { Page, Section, Text } from "@/lib/types";
/* Category pages open with a hero banner. It is edited in the page editor as a one-section "virtual page"
   (slug "category:<slug>") and stored in settings under "category_banner:<slug>", so no schema change is needed. */
export const CATEGORY_PAGE_PREFIX = "category:";
export const bannerKey = (slug: string) => `category_banner:${slug}`;
export const isCategoryPage = (slug: string) => slug.startsWith(CATEGORY_PAGE_PREFIX);
export const categorySlugOf = (pageSlug: string) => pageSlug.slice(CATEGORY_PAGE_PREFIX.length);

type Cat = { slug: string; label: Text; blurb: Text; image_url: string | null; video_url: string | null };
/** The banner a category shows until someone customises it: its photo or video, name and blurb. */
export function defaultCategoryBanner(cat: Cat): Section {
  return {
    id: `cat-${cat.slug}`, type: "hero",
    media: cat.video_url ? { kind: "video", url: cat.video_url } : { kind: "image", url: cat.image_url ?? "" },
    eyebrow: { cs: "Sortiment", en: "Range" }, title: cat.label, text: cat.blurb, height: "small", overlay: 70, align: "left",
  };
}
export function categoryBannerPage(cat: Cat, stored: Page | null): Page {
  const def = defaultCategoryBanner(cat);
  const s = stored?.sections?.[0];
  const hero = s && s.type === "hero" ? (s as Extract<Section, { type: "hero" }>) : null;
  // Keep a customised banner, but fall back to the category's own media when the stored one is empty.
  const section: Section = hero ? { ...hero, media: hero.media?.url ? hero.media : (def as Extract<Section, { type: "hero" }>).media } : def;
  return { slug: CATEGORY_PAGE_PREFIX + cat.slug, title: cat.label, sections: [section], status: "published", seo: {}, updated_at: stored?.updated_at ?? new Date().toISOString() };
}
