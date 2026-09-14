import type { Section } from "@/lib/types";

export const uid = () => Math.random().toString(36).slice(2, 8);
const T = { cs: "", en: "" };
/** A new section of the given type with sensible starting content. */
export function blankSection(type: Section["type"]): Section {
  switch (type) {
    case "hero": return { id: uid(), type, media: { kind: "image", url: "" }, eyebrow: { ...T }, title: { cs: "Nadpis", en: "Headline" }, text: { ...T }, cta: { label: { cs: "Zobrazit", en: "View" }, href: "/" }, align: "left", height: "large", overlay: 60 };
    case "categories": return { id: uid(), type, eyebrow: { ...T }, title: { ...T }, text: { ...T }, categories: ["ctyrkolky", "utv", "motocykly", "skutry"] };
    case "products": return { id: uid(), type, eyebrow: { ...T }, title: { cs: "Vybrané modely", en: "Featured" }, source: "featured", limit: 8 };
    case "banner": return { id: uid(), type, media: { kind: "image", url: "" }, eyebrow: { ...T }, title: { cs: "Nadpis", en: "Headline" }, text: { ...T }, cta: { label: { cs: "Zobrazit", en: "View" }, href: "/" } };
    case "video": return { id: uid(), type, title: { ...T }, text: { ...T }, video: { kind: "youtube", url: "" } };
    case "brands": return { id: uid(), type, eyebrow: { ...T }, title: { cs: "Značky", en: "Brands" } };
    case "split": return { id: uid(), type, media: { kind: "image", url: "" }, eyebrow: { ...T }, title: { cs: "Nadpis", en: "Headline" }, text: { ...T }, cta: { label: { cs: "Více", en: "More" }, href: "/" }, mediaSide: "left" };
    case "richtext": return { id: uid(), type, title: { ...T }, body: { ...T } };
    case "news": return { id: uid(), type, limit: 3 };
    case "spacer": return { id: uid(), type, height: 48 };
  }
}
/** Which text slots a section type renders, for the typography tab. */
export function slotsOf(type: Section["type"]): ("eyebrow" | "title" | "text" | "cta")[] {
  switch (type) {
    case "hero": case "banner": case "split": return ["eyebrow", "title", "text", "cta"];
    case "categories": case "brands": return ["eyebrow", "title", "text"];
    case "products": return ["eyebrow", "title"];
    case "video": case "richtext": return ["title", "text"];
    case "news": return ["title", "eyebrow", "text"];
    case "spacer": return [];
  }
}
export const hasMedia = (type: Section["type"]) => type === "hero" || type === "banner";
