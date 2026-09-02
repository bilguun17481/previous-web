import { NextResponse } from "next/server";
import { currentStaff } from "@/lib/staff";
import { providers } from "@/lib/payments";
import { carriers } from "@/lib/shipping";

/** Staff only: which gateways and carriers have server-side credentials. Never returns the keys. */
export async function GET() {
  if (!(await currentStaff())) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  return NextResponse.json({
    payments: Object.fromEntries(Object.values(providers).map((p) => [p.id, p.configured])),
    carriers: Object.fromEntries(Object.values(carriers).map((c) => [c.id, { configured: c.configured, capability: c.capability }])),
    email: Boolean(process.env.RESEND_API_KEY),
    packetaWidget: Boolean(process.env.NEXT_PUBLIC_PACKETA_API_KEY),
    siteUrl: process.env.NEXT_PUBLIC_SITE_URL ?? null,
  });
}
