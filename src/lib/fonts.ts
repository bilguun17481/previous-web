/* Fonts the page builder can apply. Inter is bundled; the rest load from Google Fonts on demand
   (only the families a page actually uses). `css` is the font-family value. */
export interface FontDef { name: string; css: string; google?: string; note: string }
export const FONTS: FontDef[] = [
  { name: "Inter", css: '"Inter Variable", Inter, system-ui, sans-serif', note: "výchozí / default" },
  { name: "Archivo", css: '"Archivo", sans-serif', google: "Archivo:wght@300..900", note: "technický grotesk" },
  { name: "Barlow", css: '"Barlow", sans-serif', google: "Barlow:wght@300;400;500;600;700;800;900", note: "hranatý, motorsport" },
  { name: "Barlow Condensed", css: '"Barlow Condensed", sans-serif', google: "Barlow+Condensed:wght@300;400;500;600;700;800;900", note: "zúžený, titulky" },
  { name: "Oswald", css: '"Oswald", sans-serif', google: "Oswald:wght@300..700", note: "vysoký, výrazný" },
  { name: "Bebas Neue", css: '"Bebas Neue", sans-serif', google: "Bebas+Neue", note: "jen verzálky, plakát" },
  { name: "Anton", css: '"Anton", sans-serif', google: "Anton", note: "těžký, plakát" },
  { name: "Montserrat", css: '"Montserrat", sans-serif', google: "Montserrat:wght@300..900", note: "geometrický" },
  { name: "Manrope", css: '"Manrope", sans-serif', google: "Manrope:wght@300..800", note: "moderní, čistý" },
  { name: "DM Sans", css: '"DM Sans", sans-serif', google: "DM+Sans:wght@300..900", note: "přátelský" },
  { name: "Space Grotesk", css: '"Space Grotesk", sans-serif', google: "Space+Grotesk:wght@300..700", note: "technický" },
  { name: "Roboto Condensed", css: '"Roboto Condensed", sans-serif', google: "Roboto+Condensed:wght@300..900", note: "zúžený" },
  { name: "Playfair Display", css: '"Playfair Display", serif', google: "Playfair+Display:wght@400..900", note: "patkový, elegantní" },
  { name: "Merriweather", css: '"Merriweather", serif', google: "Merriweather:wght@300;400;700;900", note: "patkový, čtivý" },
];
export const fontCss = (name?: string) => FONTS.find((f) => f.name === name)?.css;
/** Google Fonts stylesheet URL for the given family names (bundled fonts are skipped). */
export function fontsUrl(names: string[]): string | null {
  const fams = Array.from(new Set(names)).map((n) => FONTS.find((f) => f.name === n)?.google).filter(Boolean) as string[];
  if (!fams.length) return null;
  return `https://fonts.googleapis.com/css2?${fams.map((f) => `family=${f}`).join("&")}&display=swap`;
}
