import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { discountFor } from "@/lib/checkout";
import type { Discount } from "@/lib/types";

export async function POST(req: Request) {
  const { code, subtotal, shipping } = await req.json();
  const { data } = await supabaseAdmin().from("discounts").select("*").ilike("code", String(code ?? "")).maybeSingle();
  const r = discountFor((data as Discount | null) ?? null, Number(subtotal) || 0, Number(shipping) || 0);
  return NextResponse.json({ valid: r.amount > 0 || r.freeShipping, ...r, code: data?.code ?? null });
}
