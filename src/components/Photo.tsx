"use client";
/* Photo-style placeholder: a studio backdrop with a floor shadow, sized and
   captioned like the product photograph that will replace it. */
export function Photo({
  label,
  tone = "light",
  className = "",
  ratio = "aspect-[4/3]",
  hint,
}: {
  label: string;
  tone?: "light" | "dark";
  className?: string;
  ratio?: string;
  hint?: string;
}) {
  const bg =
    tone === "dark"
      ? "radial-gradient(120% 80% at 50% 30%, #3a3a3a 0%, #1a1a1a 55%, #0b0b0b 100%)"
      : "radial-gradient(120% 90% at 50% 28%, #ffffff 0%, #f1f1ef 55%, #e2e2de 100%)";
  return (
    <div className={`relative overflow-hidden ${ratio} ${className}`} style={{ background: bg }} aria-label={label} role="img">
      <div
        className="absolute left-1/2 top-[68%] h-[9%] w-[58%] -translate-x-1/2 rounded-[50%]"
        style={{ background: tone === "dark" ? "rgba(0,0,0,0.55)" : "rgba(0,0,0,0.10)", filter: "blur(10px)" }}
      />
      <div className={`absolute inset-x-0 top-[40%] flex flex-col items-center gap-1.5 text-center ${tone === "dark" ? "text-neutral-500" : "text-neutral-400"}`}>
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" aria-hidden>
          <path d="M4 8h3l2-3h6l2 3h3v11H4z" /><circle cx="12" cy="13" r="3.5" />
        </svg>
        <span className="text-[10px] uppercase tracking-[0.16em]">{hint ?? label}</span>
      </div>
    </div>
  );
}
