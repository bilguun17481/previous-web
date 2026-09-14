"use client";
import { useEffect } from "react";
import { fontsUrl } from "@/lib/fonts";

/** Loads the Google Fonts a page uses. Safe to render several times; stylesheets are de-duplicated. */
export function FontLoader({ fonts }: { fonts: string[] }) {
  const url = fontsUrl(fonts);
  useEffect(() => {
    if (!url) return;
    const id = "gf-" + btoa(url).replace(/[^a-z0-9]/gi, "").slice(0, 24);
    if (document.getElementById(id)) return;
    const link = document.createElement("link");
    link.id = id; link.rel = "stylesheet"; link.href = url;
    document.head.appendChild(link);
  }, [url]);
  return null;
}
