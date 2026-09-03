import { createClient } from "@supabase/supabase-js";
import { SUPABASE_URL } from "./env";
/** Service-role client. Server only: route handlers and webhooks. Never import from client code. */
export const supabaseAdmin = () => {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!key) throw new Error("SUPABASE_SERVICE_ROLE_KEY is not set");
  return createClient(SUPABASE_URL, key, { auth: { persistSession: false } });
};
