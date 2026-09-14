"use client";
/* Which sandbox (staged change set) the admin is currently working in. Stored in localStorage for
   the admin and mirrored into a cookie so the storefront shows the same sandbox as a preview. */
import { useEffect, useState } from "react";

export type ActiveSandbox = { id: string; name: string } | null;
const KEY = "md-sandbox-active";
const COOKIE = "md-sandbox";
const EVENT = "md-sandbox-change";

export function activeSandbox(): ActiveSandbox {
  try { const r = localStorage.getItem(KEY); return r ? (JSON.parse(r) as ActiveSandbox) : null; } catch { return null; }
}
export function setActiveSandbox(s: ActiveSandbox) {
  try { if (s) localStorage.setItem(KEY, JSON.stringify(s)); else localStorage.removeItem(KEY); } catch {}
  document.cookie = s ? `${COOKIE}=${encodeURIComponent(s.id)}; path=/; max-age=${60 * 60 * 24 * 30}; samesite=lax` : `${COOKIE}=; path=/; max-age=0`;
  window.dispatchEvent(new Event(EVENT));
}
/** Reactive view of the active sandbox for admin components. */
export function useActiveSandbox(): ActiveSandbox {
  const [s, setS] = useState<ActiveSandbox>(null);
  useEffect(() => { const read = () => setS(activeSandbox()); read(); window.addEventListener(EVENT, read); window.addEventListener("storage", read); return () => { window.removeEventListener(EVENT, read); window.removeEventListener("storage", read); }; }, []);
  return s;
}
/** Cookie value on the storefront (client side), used by the preview bar. */
export function sandboxCookie(): string | null {
  const m = typeof document !== "undefined" ? document.cookie.match(new RegExp(`(?:^|; )${COOKIE}=([^;]*)`)) : null;
  return m ? decodeURIComponent(m[1]) : null;
}
export function clearSandboxCookie() { document.cookie = `${COOKIE}=; path=/; max-age=0`; }
