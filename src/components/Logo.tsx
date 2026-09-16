"use client";
import Link from "next/link";
import { useSettings } from "@/lib/settings";
import { FontLoader } from "@/components/FontLoader";
import { fontCss } from "@/lib/fonts";
import { useResolvedSrc } from "@/components/SmartImg";

export interface LogoSettings { image?: string; text?: string; showText?: boolean; height?: number; font?: string; size?: number; tracking?: number; upper?: boolean; weight?: number }
export const DEFAULT_LOGO: Required<Pick<LogoSettings, "text" | "showText" | "height" | "size" | "tracking" | "upper" | "weight">> = { text: "Moto Dvořák", showText: true, height: 40, size: 22, tracking: -0.03, upper: true, weight: 800 };

/** Storefront wordmark and/or logo image from Nastavení → Vzhled. `scale` shrinks it for the footer. */
export function Logo({ scale = 1, link = true, className = "", override }: { scale?: number; link?: boolean; className?: string; override?: LogoSettings }) {
  const { theme } = useSettings();
  const l: LogoSettings = { ...DEFAULT_LOGO, ...((theme as { logo?: LogoSettings } | null)?.logo ?? {}), ...(override ?? {}) };
  const img = useResolvedSrc(l.image, "card");
  const text = (l.text ?? DEFAULT_LOGO.text).trim();
  const showText = l.image ? l.showText !== false : true;
  const inner = (
    <span className={`inline-flex items-center gap-3 leading-none ${className}`}>
      {l.font && <FontLoader fonts={[l.font]} />}
      {l.image && img ? <img src={img} alt={showText ? "" : text} style={{ height: (l.height ?? DEFAULT_LOGO.height) * scale, width: "auto", maxWidth: "min(60vw, 320px)" }} /> : null}
      {showText && text ? <span style={{ fontFamily: fontCss(l.font), fontSize: (l.size ?? DEFAULT_LOGO.size) * scale, letterSpacing: `${l.tracking ?? DEFAULT_LOGO.tracking}em`, textTransform: (l.upper ?? DEFAULT_LOGO.upper) ? "uppercase" : "none", fontWeight: l.weight ?? DEFAULT_LOGO.weight }}>{text}</span> : null}
    </span>
  );
  return link ? <Link href="/" aria-label={text} className="shrink-0">{inner}</Link> : inner;
}
