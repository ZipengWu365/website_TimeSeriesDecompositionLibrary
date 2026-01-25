type SeriesSparklineProps = {
  values: number[];
  width?: number;
  height?: number;
  className?: string;
};

function buildPath(values: number[], width: number, height: number): string {
  if (values.length < 2) {
    return "";
  }
  let min = Number.POSITIVE_INFINITY;
  let max = Number.NEGATIVE_INFINITY;
  for (const v of values) {
    if (v < min) min = v;
    if (v > max) max = v;
  }
  const pad = 6;
  const span = Math.max(max - min, 1e-9);
  const innerH = height - pad * 2;
  const step = width / (values.length - 1);
  let path = "";
  for (let i = 0; i < values.length; i += 1) {
    const x = i * step;
    const y = pad + innerH - ((values[i] - min) / span) * innerH;
    path += `${i === 0 ? "M" : "L"}${x.toFixed(2)},${y.toFixed(2)}`;
  }
  return path;
}

export function SeriesSparkline({
  values,
  width = 220,
  height = 90,
  className,
}: SeriesSparklineProps) {
  if (!values.length) {
    return (
      <div className={className}>
        <div className="rounded-2xl border border-[color:var(--border)] bg-white/70 px-3 py-6 text-center text-xs text-[color:var(--muted)]">
          No series data
        </div>
      </div>
    );
  }

  const path = buildPath(values, width, height);
  return (
    <div className={className}>
      <svg
        viewBox={`0 0 ${width} ${height}`}
        width="100%"
        height={height}
        preserveAspectRatio="none"
        className="w-full rounded-2xl border border-[color:var(--border)] bg-white/80"
        role="img"
        aria-label="Scenario time series"
      >
        <path
          d={path}
          fill="none"
          stroke="var(--accent)"
          strokeWidth="2"
        />
      </svg>
    </div>
  );
}
