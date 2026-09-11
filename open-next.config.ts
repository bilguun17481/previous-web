import { defineCloudflareConfig } from "@opennextjs/cloudflare";

/* No persistent page cache: every storefront request renders fresh from Supabase, so admin edits
   show immediately without a deploy. Add an R2 incremental cache here later if traffic grows. */
export default defineCloudflareConfig({});
