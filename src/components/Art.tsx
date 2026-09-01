import type { Art as ArtKind } from "@/data/catalog";

/* Thin technical-drawing silhouettes used in place of product photography. */
const common = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.6,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  vectorEffect: "non-scaling-stroke" as const,
};

function Wheel({ cx, cy, r }: { cx: number; cy: number; r: number }) {
  return (
    <>
      <circle cx={cx} cy={cy} r={r} />
      <circle cx={cx} cy={cy} r={r * 0.42} />
      <circle cx={cx} cy={cy} r={r * 0.08} />
    </>
  );
}

const shapes: Record<ArtKind, React.ReactNode> = {
  atv: (
    <>
      <Wheel cx={97} cy={170} r={38} />
      <Wheel cx={305} cy={170} r={38} />
      <path d="M45 165 A55 55 0 0 1 150 165" />
      <path d="M250 165 A55 55 0 0 1 355 165" />
      <path d="M150 165 V140 L175 120 L240 118 L262 130 V165" />
      <path d="M165 118 Q205 98 262 112" />
      <path d="M175 140 H235 V165 H175 Z" />
      <path d="M145 178 H255" />
      <path d="M122 114 L142 72 L168 64" />
      <path d="M150 68 L178 60" />
      <path d="M55 108 L140 105 M55 108 V120 M140 105 V118" />
      <path d="M262 108 L352 110 M352 110 V122" />
      <circle cx={60} cy={136} r={7} />
    </>
  ),
  utv: (
    <>
      <Wheel cx={100} cy={180} r={40} />
      <Wheel cx={300} cy={180} r={40} />
      <path d="M50 178 A50 50 0 0 1 150 178" />
      <path d="M250 178 A50 50 0 0 1 350 178" />
      <path d="M30 150 L60 118 L130 112" />
      <path d="M30 150 V170 H50" />
      <path d="M130 112 L145 55 L250 50 L262 112" />
      <path d="M130 112 L165 62" />
      <path d="M175 130 V105 L205 100 V130" />
      <path d="M262 112 V90 L360 92 V150 H262" />
      <path d="M275 102 H350" />
      <path d="M150 165 H360" />
      <circle cx={168} cy={95} r={8} />
      <circle cx={42} cy={138} r={6} />
    </>
  ),
  moto: (
    <>
      <Wheel cx={90} cy={175} r={45} />
      <Wheel cx={310} cy={175} r={45} />
      <path d="M43 158 A50 50 0 0 1 128 143" />
      <path d="M96 172 L128 80 M104 176 L136 84" />
      <path d="M118 78 L158 72" />
      <path d="M124 76 L114 54 L142 48 L150 72" />
      <path d="M136 80 L164 84 L206 70 L246 78 L304 84 L336 94" />
      <path d="M164 84 L174 140 H214 L206 78" />
      <path d="M214 140 L270 152 L310 175" />
      <path d="M174 102 H234 L238 140 H178 Z" />
      <path d="M180 146 L262 162 L336 152" />
      <path d="M254 100 L280 150" />
      <path d="M270 152 L322 96" />
      <path d="M267 145 A52 52 0 0 1 355 149" />
    </>
  ),
  scooter: (
    <>
      <Wheel cx={85} cy={185} r={32} />
      <Wheel cx={315} cy={185} r={32} />
      <path d="M49 172 A38 38 0 0 1 121 172" />
      <path d="M88 182 L118 92" />
      <path d="M104 92 L148 84" />
      <path d="M140 86 L150 66" />
      <circle cx={152} cy={63} r={3} />
      <path d="M118 92 Q94 134 122 172" />
      <path d="M130 104 Q114 136 136 168" />
      <path d="M122 172 H210" />
      <path d="M210 172 L222 138 Q232 112 262 108 H330 Q348 112 344 134 L336 168" />
      <path d="M250 108 Q292 88 334 106" />
      <path d="M279 172 A38 38 0 0 1 351 172" />
      <path d="M300 178 L356 170" />
      <circle cx={106} cy={114} r={5} />
    </>
  ),
  gear: (
    <>
      <path d="M200 60 L262 96 V168 L200 204 L138 168 V96 Z" />
      <circle cx={200} cy={132} r={22} />
      <path d="M262 96 L328 58 M138 168 L72 206" />
      <path d="M300 74 L318 44 L340 58 L322 88 Z" />
      <path d="M100 190 L82 220 L60 206 L78 176 Z" />
    </>
  ),
};

export function Art({ kind, className = "", draw = false }: { kind: ArtKind; className?: string; draw?: boolean }) {
  return (
    <svg viewBox="0 0 400 240" className={`${className} ${draw ? "draw" : ""}`} aria-hidden="true" {...common}>
      {shapes[kind]}
    </svg>
  );
}
