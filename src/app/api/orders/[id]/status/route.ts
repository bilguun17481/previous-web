import { NextResponse } from "next/server";
import { currentStaff } from "@/lib/staff";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { notifyOrderStatus } from "@/lib/notify";
import type { Order } from "@/lib/types";

/** Staff only: change order / payment status, optionally add tracking, and email the customer. */
export async function POST(req: Request, ctx: { params: Promise<{ id: string }> }) {
  if (!(await currentStaff())) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const { id } = await ctx.params;
  const body = await req.json() as Partial<Pick<Order, "status" | "payment_status" | "tracking_number" | "notes">> & { message?: string; notify?: boolean };
  const db = supabaseAdmin();
  const { data } = await db.from("orders").select("*").eq("id", id).maybeSingle();
  if (!data) return NextResponse.json({ error: "not found" }, { status: 404 });
  const order = data as Order;
  const patch: Record<string, unknown> = {};
  (["status", "payment_status", "tracking_number", "notes"] as const).forEach((k) => { if (body[k] !== undefined) patch[k] = body[k]; });
  const text = body.message ?? Object.entries(patch).map(([k, v]) => `${k}: ${v}`).join(", ");
  patch.timeline = [...order.timeline, { at: new Date().toISOString(), text }];
  await db.from("orders").update(patch).eq("id", id);
  if (body.notify) await notifyOrderStatus({ ...order, ...patch } as Order, text);
  return NextResponse.json({ ok: true });
}
