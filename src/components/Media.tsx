"use client";
import type { MediaRef, ProductVideo } from "@/lib/types";
import type { Size } from "@/lib/mediaVariants";
import { useResolvedSrc } from "./SmartImg";

const ytId = (u: string) => u.match(/(?:youtu\.be\/|v=|\/embed\/|\/shorts\/)([\w-]{6,})/)?.[1];
const vimeoId = (u: string) => u.match(/vimeo\.com\/(?:video\/)?(\d+)/)?.[1];

/** Renders an uploaded MP4, a YouTube link or a Vimeo link. */
export function Video({ video, className = "", autoplay = false, muted = autoplay, controls = !autoplay, poster }: { video: ProductVideo | MediaRef; className?: string; autoplay?: boolean; muted?: boolean; controls?: boolean; poster?: string }) {
  const kind = video.kind;
  if (kind === "youtube") {
    const id = ytId(video.url);
    if (!id) return null;
    const p = new URLSearchParams({ rel: "0", modestbranding: "1", ...(autoplay ? { autoplay: "1", mute: "1", loop: "1", playlist: id, controls: "0" } : {}) });
    return <iframe className={className} src={`https://www.youtube-nocookie.com/embed/${id}?${p}`} title="Video" allow="autoplay; encrypted-media; picture-in-picture" allowFullScreen loading="lazy" />;
  }
  if (kind === "vimeo") {
    const id = vimeoId(video.url);
    if (!id) return null;
    const p = new URLSearchParams(autoplay ? { autoplay: "1", muted: "1", loop: "1", background: "1" } : { dnt: "1" });
    return <iframe className={className} src={`https://player.vimeo.com/video/${id}?${p}`} title="Video" allow="autoplay; fullscreen; picture-in-picture" allowFullScreen loading="lazy" />;
  }
  return <video className={className} src={video.url} poster={poster} autoPlay={autoplay} muted={muted} loop={autoplay} playsInline controls={controls} preload="metadata" />;
}

/** Full-bleed background media for hero and banner sections. */
function BackgroundImage({ url, alt, size }: { url: string; alt: string; size: Size }) {
  const src = useResolvedSrc(url, size);
  return <img src={src} alt={alt} loading={size === "full" ? "eager" : "lazy"} decoding="async" className="absolute inset-0 h-full w-full object-cover" />;
}

export function BackgroundMedia({ media, fallback, size = "full" }: { media?: MediaRef; fallback: React.ReactNode; size?: Size }) {
  if (!media?.url) return <>{fallback}</>;
  if (media.kind === "image") return <BackgroundImage url={media.url} alt={media.alt ?? ""} size={size} />;
  return <Video video={media} autoplay className="absolute inset-0 h-full w-full object-cover" poster={media.poster} />;
}
