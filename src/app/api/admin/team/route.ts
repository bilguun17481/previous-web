import { NextResponse } from "next/server";
import { currentStaff } from "@/lib/staff";
import { supabaseAdmin } from "@/lib/supabase/admin";

/** Owner/admin only: invite a staff member by email or change a role. */
export async function POST(req: Request) {
  const me = await currentStaff();
  if (!me || me.role === "staff") return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const { email, role } = await req.json();
  const db = supabaseAdmin();
  const { data, error } = await db.auth.admin.inviteUserByEmail(email, { redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL ?? ""}/admin/login/` });
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  if (role) await db.from("profiles").update({ role }).eq("id", data.user.id);
  return NextResponse.json({ ok: true });
}

export async function PATCH(req: Request) {
  const me = await currentStaff();
  if (!me || me.role !== "owner") return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const { id, role } = await req.json();
  const { error } = await supabaseAdmin().from("profiles").update({ role }).eq("id", id);
  return error ? NextResponse.json({ error: error.message }, { status: 400 }) : NextResponse.json({ ok: true });
}
