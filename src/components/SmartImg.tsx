"use client";
import { useEffect, useState } from "react";
import { variant, type Size } from "@/lib/mediaVariants";

/* Image that prefers a stored small variant but shows the original whenever the variant is missing.
   Availability is probed once per URL with an Image object and cached, so a missing variant never
   leaves a broken picture behind, even when the <img> error event does not reach React. */
const known = new Map<string, boolean>();
const pending = new Map<string, Promise<boolean>>();

function probe(url: string): Promise<boolean> {
  const cached = known.get(url);
  if (cached !== undefined) return Promise.resolve(cached);
  let p = pending.get(url);
  if (!p) {
    p = new Promise<boolean>((res) => {
      const img = new Image();
      img.onload = () => res(true);
      img.onerror = () => res(false);
      img.src = url;
    }).then((ok) => { known.set(url, ok); pending.delete(url); return ok; });
    pending.set(url, p);
  }
  return p;
}

export function useResolvedSrc(src: string | undefined, size: Size) {
  const candidate = variant(src, size);
  const initial = !src || !candidate || candidate === src ? src : known.get(candidate) === false ? src : known.get(candidate) ? candidate : src;
  const [resolved, setResolved] = useState<string | undefined>(initial);
  useEffect(() => {
    if (!src || !candidate || candidate === src) { setResolved(src); return; }
    let on = true;
    probe(candidate).then((ok) => { if (on) setResolved(ok ? candidate : src); });
    return () => { on = false; };
  }, [src, candidate]);
  return resolved;
}

export function SmartImg({ src, size = "thumb", alt = "", ...rest }: Omit<React.ImgHTMLAttributes<HTMLImageElement>, "src"> & { src: string | undefined; size?: Size }) {
  const resolved = useResolvedSrc(src, size);
  return <img src={resolved} alt={alt} loading="lazy" decoding="async" {...rest} />;
}
