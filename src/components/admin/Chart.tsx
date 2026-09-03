"use client";
/** Minimal bar chart for revenue by day. Monochrome, no library. */
export function Bars({ data, height = 160 }: { data: { day: string; revenue: number; orders: number }[]; height?: number }) {
  const max = Math.max(1, ...data.map((d) => d.revenue));
  const w = 100 / data.length;
  return (
    <div>
      <svg viewBox={`0 0 100 ${height}`} preserveAspectRatio="none" className="block w-full" style={{ height }} role="img" aria-label="Revenue by day">
        {data.map((d, i) => {
          const h = (d.revenue / max) * (height - 8);
          return <rect key={d.day} x={i * w + w * 0.15} y={height - h} width={w * 0.7} height={h} fill={i === data.length - 1 ? "#111" : "#c9c9c4"}><title>{`${d.day}: ${d.revenue.toLocaleString("cs-CZ")} Kč · ${d.orders}`}</title></rect>;
        })}
      </svg>
      <div className="mt-1 flex justify-between text-[10px] text-mute"><span>{data[0]?.day.slice(5)}</span><span>{data[data.length - 1]?.day.slice(5)}</span></div>
    </div>
  );
}
