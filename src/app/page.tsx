import { getPage } from "@/lib/data";
import { defaultHome } from "@/lib/defaultHome";
import { renderSections } from "@/lib/renderPage";

export const revalidate = 60;

export default async function Page() {
  const page = await getPage("home");
  return renderSections(page?.sections?.length ? page.sections : defaultHome);
}
