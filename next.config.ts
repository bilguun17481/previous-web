import type { NextConfig } from "next";

// STATIC_EXPORT=1 produces the plain HTML export used by the GitHub Pages mirror
// (no admin, no API routes). Netlify runs the full app.
const isStatic = process.env.STATIC_EXPORT === "1";
const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";

const nextConfig: NextConfig = {
  ...(isStatic ? { output: "export" as const } : {}),
  trailingSlash: true,
  basePath,
  images: { unoptimized: true },
  serverExternalPackages: ["stripe"],
};

export default nextConfig;
