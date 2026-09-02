import { supabaseServer } from "@/lib/supabase/server";
/** Resolve the signed-in staff member for route handlers; null when anonymous. */
export async function currentStaff() {
  const sb = await supabaseServer();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) return null;
  const { data } = await sb.from("profiles").select("role").eq("id", user.id).maybeSingle();
  return data ? { id: user.id, email: user.email, role: data.role as string } : null;
}
