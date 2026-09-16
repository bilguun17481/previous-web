/* Public Supabase settings. On the server they come from the environment at runtime.
   In the browser the values injected by the root layout (window.__ENV__, taken from the
   server's runtime environment) win over anything baked in at build time, so the host's
   runtime variables are the single source of truth and a stale build cannot break login. */
import { publicEnv } from "@/lib/env";

declare global { interface Window { __ENV__?: { url?: string; anonKey?: string; siteUrl?: string; stripeKey?: string } } }
const w = typeof window !== "undefined" ? window.__ENV__ ?? {} : {};

const rawUrl = (w.url || publicEnv("NEXT_PUBLIC_SUPABASE_URL")).trim();
const validUrl = (() => { try { return /^https?:\/\//.test(rawUrl) && Boolean(new URL(rawUrl).host) ? rawUrl.replace(/\/$/, "") : ""; } catch { return ""; } })();

export const SUPABASE_URL = validUrl;
export const SUPABASE_ANON_KEY = (w.anonKey || publicEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY")).trim();
/** True when the app is wired to a Supabase project with a well-formed URL; false falls back to the bundled catalog. */
export const supabaseConfigured = Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);
