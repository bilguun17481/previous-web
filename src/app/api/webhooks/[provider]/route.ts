import { NextResponse } from "next/server";
import { providers } from "@/lib/payments";
import { applyPaymentUpdate } from "@/lib/checkout";

export const runtime = "nodejs";

async function handle(req: Request, provider: string) {
  const p = providers[provider];
  if (!p) return NextResponse.json({ error: "unknown provider" }, { status: 404 });
  try {
    const result = await p.handleWebhook(req);
    if (result) await applyPaymentUpdate(result.orderId, result.status, result.ref);
    // Buyer-facing returns (PayPal, GoPay) come in as GET: send the shopper to the order page.
    if (req.method === "GET" && result) {
      const site = process.env.NEXT_PUBLIC_SITE_URL ?? new URL(req.url).origin;
      return NextResponse.redirect(`${site}/objednavka/${result.orderId}/?${result.status === "paid" ? "paid=1" : "cancelled=1"}`);
    }
    return NextResponse.json({ ok: true, handled: Boolean(result) });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 400 });
  }
}

export async function POST(req: Request, ctx: { params: Promise<{ provider: string }> }) { return handle(req, (await ctx.params).provider); }
export async function GET(req: Request, ctx: { params: Promise<{ provider: string }> }) { return handle(req, (await ctx.params).provider); }
