import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { currentStaff } from "@/lib/staff";

/** Staff only: refresh cached storefront pages right after an admin save. */
export async function POST(req: Request) {
  if (!(await currentStaff())) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const { paths } = (await req.json()) as { paths?: string[] };
  const list = paths?.length ? paths : ["/"];
  for (const p of list) revalidatePath(p);
  revalidatePath("/", "layout");
  return NextResponse.json({ ok: true, revalidated: list });
}
