import Link from "next/link";
import { FigureCard } from "@/components/figure-card";

export default function RegimeEventsExamplePage() {
  return (
    <div className="mx-auto w-full max-w-6xl px-6 pb-20 pt-12">
      <div className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[color:var(--muted)]">
          Example C
        </p>
        <h1 className="text-3xl font-semibold md:text-4xl">Regime switches and events</h1>
        <p className="text-sm text-[color:var(--muted)]">
          Use this when trend regimes change and sparse events appear. Global bases and fixed
          windows blur the switch boundaries.
        </p>
      </div>

      <section className="mt-10 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="rounded-3xl border border-[color:var(--border)] bg-white/90 p-6 shadow-[var(--shadow)]">
          <h2 className="text-xl font-semibold">Reproduce the case</h2>
          <pre className="mt-4 whitespace-pre-wrap rounded-2xl bg-[color:var(--ink)]/95 p-4 text-xs text-white">
{`python -m tsdecomp suite_run \\
  --suite core \\
  --methods ssa,wavelet \\
  --seed 0 \\
  --n_samples 3 \\
  --length 256`}
          </pre>
          <p className="mt-4 text-sm text-[color:var(--muted)]">
            Filter for{" "}
            <Link
              href="/scenarios/piecewise_trend_regime_cycle_with_events/"
              className="text-[color:var(--accent-strong)]"
            >
              piecewise_trend_regime_cycle_with_events
            </Link>{" "}
            to observe regime-driven drops.
          </p>
        </div>
        <div className="rounded-3xl border border-[color:var(--border)] bg-white/90 p-6 shadow-[var(--shadow)]">
          <h2 className="text-xl font-semibold">Expected signals</h2>
          <div className="mt-4 space-y-3 text-sm text-[color:var(--muted)]">
            <p>Trend R2 declines when regime switches are smoothed over.</p>
            <p>Wavelet/SSA can keep seasonal structure but may leak events into residuals.</p>
            <p>Inspect scenario figures for boundary artifacts around the switch.</p>
          </div>
        </div>
      </section>

      <section className="mt-10 grid gap-6 md:grid-cols-2">
        <FigureCard
          src="/figs/decomp_compare_piecewise_trend_regime_cycle_with_events.png"
          caption="Regime-switching decomposition comparison."
        />
        <FigureCard
          src="/figs/decomp_facets_piecewise_trend_regime_cycle_with_events_page1.png"
          caption="Component facets showing regime boundaries and events."
        />
      </section>
    </div>
  );
}
