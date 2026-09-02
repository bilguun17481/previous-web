import { NextResponse } from "next/server";
import { currentStaff } from "@/lib/staff";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { carriers } from "@/lib/shipping";
import type { Order } from "@/lib/types";

export const runtime = "nodejs";

/** Staff only: create the shipment at the carrier, store the label in Storage, and record the tracking number. */
export async function POST(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  if (!(await currentStaff())) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const { id } = await ctx.params;
  const db = supabaseAdmin();
  const { data } = await db.from("orders").select("*").eq("id", id).maybeSingle();
  if (!data) return NextResponse.json({ error: "not found" }, { status: 404 });
  const order = data as Order;
  const carrier = carriers[order.shipping_carrier ?? "dealer"];
  if (!carrier) return NextResponse.json({ error: "unknown carrier" }, { status: 400 });
  try {
    const s = await carrier.createShipment(order);
    let labelUrl = s.labelUrl ?? null;
    if (s.labelPdfBase64) {
      const path = `labels/${order.number}-${carrier.id}.pdf`;
      await db.storage.from("media").upload(path, Buffer.from(s.labelPdfBase64, "base64"), { contentType: "application/pdf", upsert: true });
      labelUrl = db.storage.from("media").getPublicUrl(path).data.publicUrl;
    }
    const timeline = [...order.timeline, { at: new Date().toISOString(), text: `Štítek ${carrier.label}: ${s.trackingNumber}` }];
    await db.from("orders").update({ tracking_number: s.trackingNumber, label_url: labelUrl, status: order.status === "paid" ? "processing" : order.status, timeline }).eq("id", id);
    return NextResponse.json({ trackingNumber: s.trackingNumber, labelUrl, trackingUrl: carrier.trackingUrl(s.trackingNumber) });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message, capability: carrier.capability, configured: carrier.configured }, { status: 400 });
  }
}
