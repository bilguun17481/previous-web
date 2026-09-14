"use client";
import Link from "next/link";
import { useRef, type CSSProperties, type PointerEvent as RPointerEvent, type ReactNode } from "react";
import { Photo } from "@/components/Photo";
import { ProductCard } from "@/components/ProductCard";
import { BackgroundMedia, Video } from "@/components/Media";
import { FontLoader } from "@/components/FontLoader";
import { brands } from "@/data/catalog";
import { fontCss } from "@/lib/fonts";
import { dict, useLang } from "@/lib/i18n";
import type { Box, CtaVariant, Section, ShopProduct, Text, TextStyle } from "@/lib/types";

type Cat = { slug: string; label: Text; blurb: Text; image_url: string | null; video_url: string | null };

/** Hooks the admin page editor uses to select sections and move text boxes inside the live preview. */
export interface EditHooks { selected?: string | null; onSelect(id: string): void; onChange(id: string, patch: Partial<Section>): void }

/* ───────── typography helpers ───────── */
const px = (n: number) => `${n}px`;
/** Inline style for one text element. `base` is the design default used when the slot has no size set. */
export function textStyle(ts: TextStyle | undefined, base: { size: number; mobile?: number }): CSSProperties {
  const s: CSSProperties = {};
  if (!ts) return s;
  if (ts.font) s.fontFamily = fontCss(ts.font);
  if (ts.size) {
    const desktop = ts.size;
    const mobile = ts.sizeMobile ?? Math.max(12, Math.round(desktop * (base.mobile ? base.mobile / base.size : 0.6)));
    s.fontSize = desktop === mobile ? px(desktop) : `clamp(${px(mobile)}, ${((desktop / 1440) * 100).toFixed(2)}vw, ${px(desktop)})`;
  } else if (ts.sizeMobile) s.fontSize = px(ts.sizeMobile);
  if (ts.weight) s.fontWeight = ts.weight;
  if (ts.color) s.color = ts.color;
  if (ts.tracking !== undefined) s.letterSpacing = `${ts.tracking}em`;
  if (ts.leading) s.lineHeight = ts.leading;
  if (ts.upper !== undefined) s.textTransform = ts.upper ? "uppercase" : "none";
  if (ts.italic) s.fontStyle = "italic";
  if (ts.align) s.textAlign = ts.align;
  if (ts.shadow) s.textShadow = "0 2px 24px rgba(0,0,0,.45)";
  return s;
}
/** Every font family a list of sections references, for the loader. */
export function fontsIn(sections: Section[]): string[] {
  const out: string[] = [];
  for (const s of sections) for (const k of Object.keys(s.styles ?? {})) { const f = s.styles?.[k as keyof typeof s.styles]?.font; if (f) out.push(f); }
  return out;
}
const ctaClass = (v: CtaVariant | undefined, fallback: CtaVariant) => {
  switch (v ?? fallback) {
    case "white": return "btn-white"; case "outline-white": return "btn-outline-white"; case "ink": return "btn-ink"; case "ghost": return "btn-ghost"; case "link": return "btn-link";
  }
};
const alignClass = (a?: string) => (a === "center" ? "text-center" : a === "right" ? "text-right" : "text-left");
const alignBox = (a?: string) => (a === "center" ? "mx-auto" : a === "right" ? "ml-auto" : "");

/* ───────── text stack (eyebrow / title / text / cta) ───────── */
type Cta = { label: Text; href: string } | undefined;
function Stack({ s, eyebrow, title, text, cta, base, onDark, TitleTag = "h2", ctaFallback, animate = false, edit }: {
  s: Section; eyebrow?: Text; title?: Text; text?: Text; cta?: Cta; base: { eyebrow: number; title: number; titleMobile: number; text: number };
  onDark: boolean; TitleTag?: "h1" | "h2"; ctaFallback: CtaVariant; animate?: boolean; edit?: boolean;
}) {
  const { t } = useLang();
  const T = (x?: Text) => (x ? t(x) : "");
  const st = s.styles ?? {};
  const gap = s.gap ?? 16;
  const stop = (e: React.MouseEvent) => { if (edit) e.preventDefault(); };
  return (
    <div className={alignClass("align" in s ? s.align : undefined)} style={{ maxWidth: s.maxWidth ? px(s.maxWidth) : undefined, color: s.color }}>
      {T(eyebrow) ? <div className={`eyebrow ${onDark ? "!text-neutral-300" : ""} ${animate ? "rise" : ""}`} style={textStyle(st.eyebrow, { size: base.eyebrow })}>{T(eyebrow)}</div> : null}
      {T(title) ? <TitleTag className={`${animate ? "rise rise-2" : ""} font-bold leading-[1.02] tracking-[-0.02em]`} style={{ marginTop: T(eyebrow) ? gap * 0.75 : 0, fontSize: `clamp(${px(base.titleMobile)}, ${((base.title / 1440) * 100).toFixed(2)}vw, ${px(base.title)})`, ...textStyle(st.title, { size: base.title, mobile: base.titleMobile }) }}>{T(title)}</TitleTag> : null}
      {T(text) ? <p className={`${animate ? "rise rise-3" : ""} whitespace-pre-line leading-relaxed ${onDark ? "text-neutral-200" : "text-mute"}`} style={{ marginTop: gap, fontSize: px(base.text), ...textStyle(st.text, { size: base.text }) }}>{T(text)}</p> : null}
      {cta && T(cta.label) ? <div style={{ marginTop: gap * 1.6 }}><Link href={cta.href || "/"} onClick={stop} className={`${ctaClass(s.ctaVariant, ctaFallback)} ${animate ? "rise rise-3" : ""}`} style={textStyle(st.cta, { size: 12 })}>{T(cta.label)}</Link></div> : null}
    </div>
  );
}

/* ───────── positioned text box over media (hero, banner) ───────── */
function OverlayBox({ s, box, edit, children, defaultClass }: { s: Section; box?: Box; edit?: EditHooks; children: ReactNode; defaultClass: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const drag = useRef<{ x: number; y: number; bx: number; by: number; bw: number; mode: "move" | "resize" } | null>(null);
  const editing = Boolean(edit);
  const start = (mode: "move" | "resize") => (e: RPointerEvent) => {
    if (!editing || !ref.current) return;
    e.preventDefault(); e.stopPropagation();
    const b = box ?? { x: 5, y: 55, w: 45 };
    drag.current = { x: e.clientX, y: e.clientY, bx: b.x, by: b.y, bw: b.w, mode };
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };
  const move = (e: RPointerEvent) => {
    const d = drag.current; const host = ref.current?.parentElement; if (!d || !host) return;
    const r = host.getBoundingClientRect();
    const dx = ((e.clientX - d.x) / r.width) * 100, dy = ((e.clientY - d.y) / r.height) * 100;
    const next: Box = d.mode === "move"
      ? { x: Math.min(95, Math.max(0, d.bx + dx)), y: Math.min(95, Math.max(0, d.by + dy)), w: d.bw }
      : { x: d.bx, y: d.by, w: Math.min(100 - d.bx, Math.max(15, d.bw + dx)) };
    edit?.onChange(s.id, { box: next });
  };
  const end = () => { drag.current = null; };
  if (!box) return <div ref={ref} className={defaultClass}>{children}</div>;
  return (
    <div ref={ref} className={`absolute ${editing ? "cursor-move outline-dashed outline-1 outline-white/60" : ""}`} style={{ left: `${box.x}%`, top: `${box.y}%`, width: `${box.w}%` }}
      onPointerDown={start("move")} onPointerMove={move} onPointerUp={end} onPointerCancel={end}>
      {children}
      {editing && <span onPointerDown={start("resize")} onPointerMove={move} onPointerUp={end} className="absolute -right-2 top-1/2 h-8 w-4 -translate-y-1/2 cursor-ew-resize rounded bg-white/90 shadow" title="Šířka" />}
    </div>
  );
}

const heightClass = (h?: string, kind: "hero" | "banner" = "hero") => {
  if (h === "screen") return "min-h-[80vh]";
  if (kind === "hero") return h === "small" ? "aspect-[4/5] sm:aspect-[16/7] lg:aspect-[21/7]" : h === "medium" ? "aspect-[4/5] sm:aspect-[16/8] lg:aspect-[21/8]" : "aspect-[4/5] sm:aspect-[16/9] lg:aspect-[21/9]";
  return h === "small" ? "aspect-[4/5] sm:aspect-[16/6]" : h === "large" ? "aspect-[4/5] sm:aspect-[16/9]" : "aspect-[4/5] sm:aspect-[16/7]";
};
const overlayStyle = (s: Section, kind: "hero" | "banner"): CSSProperties => {
  const c = s.overlayColor ?? "#000000";
  const a = (s.overlay ?? (kind === "hero" ? 60 : 70)) / 100;
  const rgba = (al: number) => { const n = parseInt(c.replace("#", ""), 16); const r = (n >> 16) & 255, g = (n >> 8) & 255, b = n & 255; return `rgba(${r},${g},${b},${al})`; };
  return { background: kind === "hero" ? `linear-gradient(to top, ${rgba(a)}, ${rgba(a * 0.25)} 60%, transparent)` : `linear-gradient(to right, ${rgba(a)}, ${rgba(a * 0.4)} 50%, transparent)` };
};

/** Renders the landing-page builder sections. `products` is keyed by section id. */
export function Sections({ sections, products, categories, count, edit }: { sections: Section[]; products: Record<string, ShopProduct[]>; categories: Cat[]; count: Record<string, number>; edit?: EditHooks }) {
  const { t } = useLang();
  const T = (x?: Text) => (x ? t(x) : "");
  const editing = Boolean(edit);
  const wrap = (s: Section, node: ReactNode) => {
    if (!edit) return node;
    const sel = edit.selected === s.id;
    return (
      <div key={s.id} data-section={s.id} onClickCapture={(e) => { e.preventDefault(); edit.onSelect(s.id); }} className={`relative ${sel ? "outline outline-2 outline-offset-[-2px] outline-sky-500" : "hover:outline hover:outline-1 hover:outline-offset-[-1px] hover:outline-sky-300"}`}>
        {node}
        {sel && <span className="pointer-events-none absolute left-2 top-2 z-10 rounded bg-sky-500 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white">{s.type}</span>}
      </div>
    );
  };
  return (
    <>
      <FontLoader fonts={fontsIn(sections)} />
      {sections.map((s) => {
        if (s.hidden && !editing) return null;
        const dim = s.hidden ? "opacity-40" : "";
        const pad = s.padY !== undefined ? { paddingTop: px(s.padY), paddingBottom: px(s.padY) } : undefined;
        switch (s.type) {
          case "hero": {
            const stack = <Stack s={s} eyebrow={s.eyebrow} title={s.title} text={s.text} cta={s.cta} base={{ eyebrow: 11, title: 76, titleMobile: 44, text: 15 }} onDark TitleTag="h1" ctaFallback="white" animate={!editing} edit={editing} />;
            return wrap(s, (
              <section key={s.id} className={`relative text-paper ${dim}`}>
                <div className={`relative ${heightClass(s.height, "hero")}`}>
                  <BackgroundMedia media={s.media} fallback={<Photo label={T(s.title)} tone="dark" ratio="absolute inset-0" hint={T(s.title)} />} />
                </div>
                <div className="absolute inset-0" style={overlayStyle(s, "hero")} />
                {/* Free placement is a desktop layout: phones are far narrower, so they use the automatic bottom layout. */}
                {s.box && <div className="absolute inset-0 hidden sm:block"><OverlayBox s={s} box={s.box} edit={edit} defaultClass="">{stack}</OverlayBox></div>}
                <div className={`container-x absolute inset-x-0 bottom-0 pb-10 sm:pb-14 lg:pb-20 ${s.box ? "sm:hidden" : ""}`}><div className={`max-w-xl ${alignBox(s.align)}`}>{stack}</div></div>
              </section>
            ));
          }
          case "banner": {
            const stack = <Stack s={s} eyebrow={s.eyebrow} title={s.title} text={s.text} cta={s.cta} base={{ eyebrow: 11, title: 44, titleMobile: 32, text: 14 }} onDark ctaFallback="outline-white" edit={editing} />;
            return wrap(s, (
              <section key={s.id} className={`relative text-paper ${dim}`}>
                <div className={`relative ${heightClass(s.height, "banner")}`}>
                  <BackgroundMedia media={s.media} fallback={<Photo label={T(s.title)} tone="dark" ratio="absolute inset-0" hint={T(s.eyebrow) || T(s.title)} />} />
                </div>
                <div className="absolute inset-0" style={overlayStyle(s, "banner")} />
                {s.box && <div className="absolute inset-0 hidden sm:block"><OverlayBox s={s} box={s.box} edit={edit} defaultClass="">{stack}</OverlayBox></div>}
                <div className={`container-x absolute inset-0 flex items-center ${s.box ? "sm:hidden" : ""}`}><div className={`max-w-md ${alignBox(s.align)}`}>{stack}</div></div>
              </section>
            ));
          }
          case "categories": {
            const cols = s.columns ?? 4;
            return wrap(s, (
              <section key={s.id} className={dim} style={{ background: s.bg, color: s.color }}>
                <div className="container-x py-16" style={pad}>
                  {(T(s.title) || T(s.eyebrow) || T(s.text)) && <div className="mx-auto text-center [&>div]:mx-auto"><Stack s={{ ...s, align: "center" } as Section} eyebrow={s.eyebrow} title={s.title} text={s.text} base={{ eyebrow: 11, title: 34, titleMobile: 28, text: 14 }} onDark={false} ctaFallback="ink" edit={editing} /></div>}
                  <div className={`mt-10 grid grid-cols-2 gap-4 ${cols === 2 ? "lg:grid-cols-2" : cols === 3 ? "lg:grid-cols-3" : "lg:grid-cols-4"}`}>
                    {s.categories.map((slug) => categories.find((c) => c.slug === slug)).filter(Boolean).map((c) => (
                      <Link key={c!.slug} href={`/${c!.slug}/`} onClick={(e) => editing && e.preventDefault()} className="group relative block overflow-hidden text-paper">
                        <div className="relative aspect-[3/4] transition-transform duration-700 group-hover:scale-[1.03]">
                          <BackgroundMedia media={c!.image_url ? { kind: "image", url: c!.image_url } : undefined} size="card" fallback={<Photo label={T(c!.label)} tone="dark" ratio="absolute inset-0" />} />
                        </div>
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                        <div className="absolute inset-x-0 bottom-0 p-5">
                          <div className="text-[18px] font-semibold leading-tight sm:text-[22px]" style={textStyle(s.styles?.text, { size: 22 })}>{T(c!.label)}</div>
                          <div className="mt-1 text-[12px] text-neutral-300">{count[c!.slug] ?? 0} {t(dict.catalog.models)}</div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              </section>
            ));
          }
          case "products": {
            const cols = s.columns ?? 4;
            return wrap(s, (
              <section key={s.id} className={dim} style={{ background: s.bg, color: s.color }}>
                <div className="container-x py-16" style={pad}>
                  <div className="flex items-end justify-between border-b hairline pb-5">
                    <Stack s={s} eyebrow={s.eyebrow} title={s.title} base={{ eyebrow: 11, title: 34, titleMobile: 28, text: 14 }} onDark={false} ctaFallback="ink" edit={editing} />
                    <Link href={s.category ? `/${s.category}/` : "/ctyrkolky/"} onClick={(e) => editing && e.preventDefault()} className="btn-link">{t(dict.home.all)} <span aria-hidden>→</span></Link>
                  </div>
                  <div className={`mt-8 grid grid-cols-2 gap-x-5 gap-y-10 ${cols === 2 ? "lg:grid-cols-2" : cols === 3 ? "lg:grid-cols-3" : "lg:grid-cols-4"}`}>
                    {(products[s.id] ?? []).map((p) => <ProductCard key={p.slug} p={p} />)}
                  </div>
                </div>
              </section>
            ));
          }
          case "video":
            if (!s.video?.url && !editing) return null;
            return wrap(s, (
              <section key={s.id} className={dim} style={{ background: s.bg, color: s.color }}>
                <div className="container-x py-16" style={pad}>
                  <div className="[&>div]:mx-auto"><Stack s={{ ...s, align: "center" } as Section} title={s.title} text={s.text} base={{ eyebrow: 11, title: 34, titleMobile: 28, text: 14 }} onDark={false} ctaFallback="ink" edit={editing} /></div>
                  <div className="mt-8 aspect-video w-full bg-ink">{s.video?.url ? <Video video={s.video} className="h-full w-full" /> : <div className="flex h-full items-center justify-center text-[13px] text-neutral-400">Video</div>}</div>
                </div>
              </section>
            ));
          case "brands":
            return wrap(s, (
              <section key={s.id} className={`bg-tile ${dim}`} style={{ background: s.bg, color: s.color }}>
                <div className="container-x py-14 text-center" style={pad}>
                  <div className="[&>div]:mx-auto"><Stack s={{ ...s, align: "center" } as Section} eyebrow={s.eyebrow} title={s.title} base={{ eyebrow: 11, title: 34, titleMobile: 28, text: 14 }} onDark={false} ctaFallback="ink" edit={editing} /></div>
                  <div className="mt-10 flex flex-wrap items-center justify-center gap-x-14 gap-y-6">
                    {brands.map((b) => <div key={b} className="text-[22px] font-extrabold uppercase tracking-[-0.02em] text-ink/80" style={textStyle(s.styles?.text, { size: 22 })}>{b}</div>)}
                  </div>
                </div>
              </section>
            ));
          case "split":
            return wrap(s, (
              <section key={s.id} className={dim} style={{ background: s.bg, color: s.color }}>
                <div className="container-x py-16" style={pad}>
                  <div className={`grid items-center gap-10 lg:grid-cols-2 ${s.mediaSide === "right" ? "lg:[&>*:first-child]:order-2" : ""}`}>
                    <div className="relative" style={{ aspectRatio: s.ratio ?? "4/3" }}>
                      <BackgroundMedia media={s.media} fallback={<Photo label={T(s.title)} ratio="absolute inset-0" hint={T(s.eyebrow) || T(s.title)} />} />
                    </div>
                    <div className="lg:px-10"><Stack s={s} eyebrow={s.eyebrow} title={s.title} text={s.text} cta={s.cta} base={{ eyebrow: 11, title: 34, titleMobile: 28, text: 14 }} onDark={false} ctaFallback="ink" edit={editing} /></div>
                  </div>
                </div>
              </section>
            ));
          case "richtext":
            return wrap(s, (
              <section key={s.id} className={dim} style={{ background: s.bg, color: s.color }}>
                <div className={`container-x py-16 ${s.align === "center" ? "text-center" : ""}`} style={{ ...pad, maxWidth: px(s.maxWidth ?? 768) }}>
                  {T(s.title) ? <h2 className="h-section" style={textStyle(s.styles?.title, { size: 34, mobile: 28 })}>{T(s.title)}</h2> : null}
                  <div className="prose mt-5 whitespace-pre-line text-[15px] leading-relaxed" style={textStyle(s.styles?.text, { size: 15 })}>{T(s.body)}</div>
                </div>
              </section>
            ));
          case "news":
            return wrap(s, (
              <section key={s.id} className={dim} style={{ background: s.bg, color: s.color }}>
                <div className="container-x py-16" style={pad}>
                  <div className="flex items-end justify-between border-b hairline pb-5">
                    <h2 className="h-section" style={textStyle(s.styles?.title, { size: 34, mobile: 28 })}>{s.title && T(s.title) ? T(s.title) : t(dict.home.newsEyebrow)}</h2>
                  </div>
                  <div className="mt-8 grid gap-8 md:grid-cols-3">
                    {dict.news.slice(0, s.limit ?? 3).map((n, i) => (
                      <article key={i}>
                        <Photo label={t(n.title)} ratio="aspect-[3/2]" hint={t(n.tag)} />
                        <div className="eyebrow mt-4" style={textStyle(s.styles?.eyebrow, { size: 11 })}>{t(n.tag)}</div>
                        <h3 className="mt-2 text-[18px] font-semibold leading-snug" style={textStyle(s.styles?.text, { size: 18 })}>{t(n.title)}</h3>
                        <p className="mt-2 text-[13px] leading-relaxed text-mute">{t(n.text)}</p>
                      </article>
                    ))}
                  </div>
                </div>
              </section>
            ));
          case "spacer":
            return wrap(s, <div key={s.id} className={`${dim} ${editing ? "bg-[repeating-linear-gradient(45deg,transparent,transparent_8px,rgba(0,0,0,.04)_8px,rgba(0,0,0,.04)_16px)]" : ""}`} style={{ height: px(s.height ?? 48), background: s.bg }} />);
          default:
            return null;
        }
      })}
    </>
  );
}
