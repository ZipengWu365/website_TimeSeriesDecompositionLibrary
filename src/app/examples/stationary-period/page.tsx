import Link from "next/link";
import { FigureCard } from "@/components/figure-card";

export default function StationaryPeriodExamplePage() {
  return (
    <div className="mx-auto w-full max-w-6xl px-6 pb-20 pt-12">
      <div className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[color:var(--muted)]">
          Example A
        </p>
        <h1 className="text-3xl font-semibold md:text-4xl">Single-period stationarity</h1>
        <p className="text-sm text-[color:var(--muted)]">
          Use this when the seasonal cycle is stable and the trend is smooth. STL/MSTL should
          saturate on spectral + max-lag metrics if the period is correctly injected.
        </p>
      </div>

      <section className="mt-10 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="rounded-3xl border border-[color:var(--border)] bg-white/90 p-6 shadow-[var(--shadow)]">
          <h2 className="text-xl font-semibold">Reproduce the case</h2>
          <pre className="mt-4 whitespace-pre-wrap rounded-2xl bg-[color:var(--ink)]/95 p-4 text-xs text-white">
{`python -m tsdecomp suite_run \\
  --suite core \\
  --methods stl,mstl \\
  --seed 0 \\
  --n_samples 3 \\
  --length 256`}
          </pre>
          <p className="mt-4 text-sm text-[color:var(--muted)]">
            Filter the leaderboard to the{" "}
            <Link
              href="/scenarios/trend_plus_single_sine/"
              className="text-[color:var(--accent-strong)]"
            >
              trend_plus_single_sine
            </Link>{" "}
            scenario to inspect stable-period behavior.
          </p>
        </div>
        <div className="rounded-3xl border border-[color:var(--border)] bg-white/90 p-6 shadow-[var(--shadow)]">
          <h2 className="text-xl font-semibold">Expected signals</h2>
          <div className="mt-4 space-y-3 text-sm text-[color:var(--muted)]">
            <p>High spectral correlation indicates the period was injected correctly.</p>
            <p>Max-lag correlation should be near 1 if phase alignment is stable.</p>
            <p>Trend R2 should stay high with smooth LOESS smoothing.</p>
          </div>
        </div>
      </section>

      <section className="mt-10 grid gap-6 md:grid-cols-2">
        <FigureCard
          src="/figs/bars_trend_plus_single_sine.png"
          caption="Metric bars for the stationary single-sine scenario."
        />
        <FigureCard
          src="/figs/decomp_compare_trend_plus_single_sine.png"
          caption="Component recovery comparison for trend + single sine."
        />
      </section>
    </div>
  );
}
