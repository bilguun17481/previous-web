/* Public Supabase settings. On the server they come from the environment at runtime.
   In the browser they are baked in at build time when available, otherwise read from
   window.__ENV__, which the root layout injects from the server's runtime environment. */
declare global { interface Window { __ENV__?: { url?: string; anonKey?: string; siteUrl?: string } } }
const w = typeof window !== "undefined" ? window.__ENV__ ?? {} : {};

const rawUrl = (process.env.NEXT_PUBLIC_SUPABASE_URL || w.url || "").trim();
const validUrl = (() => { try { return /^https?:\/\//.test(rawUrl) && Boolean(new URL(rawUrl).host) ? rawUrl.replace(/\/$/, "") : ""; } catch { return ""; } })();

export const SUPABASE_URL = validUrl;
export const SUPABASE_ANON_KEY = (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || w.anonKey || "").trim();
/** True when the app is wired to a Supabase project with a well-formed URL; false falls back to the bundled catalog. */
export const supabaseConfigured = Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);
