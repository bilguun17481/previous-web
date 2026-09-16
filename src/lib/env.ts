/** Reads a public environment variable at runtime.
    Next replaces literal `process.env.NEXT_PUBLIC_*` reads with the value present at build time, so a
    value corrected at the host afterwards would be ignored until the next build. A computed key is not
    inlined, so the live value wins and the build-time value only fills in when the runtime has none. */
export function publicEnv(name: "NEXT_PUBLIC_SUPABASE_URL" | "NEXT_PUBLIC_SUPABASE_ANON_KEY" | "NEXT_PUBLIC_SITE_URL" | "NEXT_PUBLIC_PACKETA_API_KEY" | "NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY"): string {
  const live = typeof process !== "undefined" && process.env ? (process.env as Record<string, string | undefined>)[name] : undefined;
  const built = name === "NEXT_PUBLIC_SUPABASE_URL" ? process.env.NEXT_PUBLIC_SUPABASE_URL
    : name === "NEXT_PUBLIC_SUPABASE_ANON_KEY" ? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    : name === "NEXT_PUBLIC_SITE_URL" ? process.env.NEXT_PUBLIC_SITE_URL
    : name === "NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY" ? process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
    : process.env.NEXT_PUBLIC_PACKETA_API_KEY;
  const v = (live || built || "").trim();
  // Addresses are joined with "/..." later, so a trailing slash typed at the host must not double up.
  return name === "NEXT_PUBLIC_SITE_URL" || name === "NEXT_PUBLIC_SUPABASE_URL" ? v.replace(/\/+$/, "") : v;
}
