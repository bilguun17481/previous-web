"use client";
import { supabaseConfigured } from "@/lib/supabase/env";
/** Ask the server to drop cached storefront pages. No-op in demo mode. */
export async function refreshStorefront(paths: string[] = ["/"]) {
  if (!supabaseConfigured) return;
  await fetch("/api/admin/revalidate", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ paths }) }).catch(() => {});
}
