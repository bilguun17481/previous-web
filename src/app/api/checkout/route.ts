import { NextResponse } from "next/server";
import { createOrder, type CheckoutInput } from "@/lib/checkout";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const input = (await req.json()) as CheckoutInput;
    if (!input.email || !input.items?.length || !input.shippingMethod || !input.paymentMethod) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }
    const site = process.env.NEXT_PUBLIC_SITE_URL ?? new URL(req.url).origin;
    const result = await createOrder(input, site);
    return NextResponse.json(result);
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 400 });
  }
}
