import { NextResponse } from "next/server";
import { currentStaff, staffDiagnosis } from "@/lib/staff";
import { providers } from "@/lib/payments";
import { allCarriers } from "@/lib/shipping";
import { publicEnv } from "@/lib/env";

/** Staff only: which gateways and carriers have server-side credentials. Never returns the keys. */
export async function GET() {
  if (!(await currentStaff())) return NextResponse.json({ error: "unauthorized", reason: await staffDiagnosis() }, { status: 401 });
  return NextResponse.json({
    payments: Object.fromEntries(Object.values(providers).map((p) => [p.id, p.configured])),
    carriers: Object.fromEntries(allCarriers().map((c) => [c.id, { configured: c.configured, capability: c.capability, route: c.route, beta: Boolean(c.beta), label: c.label, group: c.group, services: c.services, env: c.env }])),
    balikobot: Boolean(process.env.BALIKOBOT_API_USER && process.env.BALIKOBOT_API_KEY),
    email: Boolean(process.env.RESEND_API_KEY),
    packetaWidget: Boolean(publicEnv("NEXT_PUBLIC_PACKETA_API_KEY")),
    siteUrl: publicEnv("NEXT_PUBLIC_SITE_URL") || null,
  });
}
