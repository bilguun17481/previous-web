import type { Homologation } from "@/data/catalog";

/* The signature mark: a small square carrying the vehicle's homologation class.
   Mirrors SIGMA's A / C / S product-line marks, but encodes a real fact. */
export function HomolBadge({ code, size = "sm" }: { code: Homologation; size?: "sm" | "lg" }) {
  if (code === "—") return null;
  const dark = code === "T3b";
  const dims = size === "lg" ? "h-9 min-w-9 px-2 text-[13px]" : "h-6 min-w-6 px-1.5 text-[10px]";
  return (
    <span
      title={code}
      className={`inline-flex items-center justify-center font-mono font-medium leading-none tracking-wide ${dims} ${
        dark ? "bg-ink text-paper" : "border border-ink text-ink"
      }`}
    >
      {code}
    </span>
  );
}
