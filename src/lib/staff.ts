import { supabaseServer } from "@/lib/supabase/server";
/** Resolve the signed-in staff member for route handlers; null when anonymous. */
export async function currentStaff() {
  const sb = await supabaseServer();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) return null;
  const { data } = await sb.from("profiles").select("role").eq("id", user.id).maybeSingle();
  return data ? { id: user.id, email: user.email, role: data.role as string } : null;
}

/** Why currentStaff() came back empty, for the status endpoint. Never includes token values. */
export async function staffDiagnosis(): Promise<string> {
  const { cookies } = await import("next/headers");
  const names = (await cookies()).getAll().map((c) => c.name);
  const authCookies = names.filter((n) => n.startsWith("sb-") && n.includes("auth-token"));
  if (!authCookies.length) return `no Supabase session cookie reached the server (cookies seen: ${names.length ? names.join(", ") : "none"})`;
  const sb = await supabaseServer();
  const { data: { user }, error } = await sb.auth.getUser();
  if (!user) return `session cookie present but not valid: ${error?.message ?? "no user"}`;
  const { data, error: pe } = await sb.from("profiles").select("role").eq("id", user.id).maybeSingle();
  if (pe) return `signed in as ${user.email} but reading profiles failed: ${pe.message}`;
  if (!data) return `signed in as ${user.email} but there is no row in profiles for this user`;
  return "ok";
}
