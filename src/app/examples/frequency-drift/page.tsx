import Link from "next/link";
import { FigureCard } from "@/components/figure-card";

export default function FrequencyDriftExamplePage() {
  return (
    <div className="mx-auto w-full max-w-6xl px-6 pb-20 pt-12">
      <div className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[color:var(--muted)]">
          Example B
        </p>
        <h1 className="text-3xl font-semibold md:text-4xl">Frequency drift diagnostics</h1>
        <p className="text-sm text-[color:var(--muted)]">
          Use this when the seasonal frequency drifts over time. Fixed-period methods drop in
          spectral correlation while adaptive spectral models retain structure.
        </p>
      </div>

      <section className="mt-10 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="rounded-3xl border border-[color:var(--border)] bg-white/90 p-6 shadow-[var(--shadow)]">
          <h2 className="text-xl font-semibold">Reproduce the case</h2>
          <pre className="mt-4 whitespace-pre-wrap rounded-2xl bg-[color:var(--ink)]/95 p-4 text-xs text-white">
{`python -m tsdecomp suite_run \\
  --suite core \\
  --methods stl,vmd \\
  --seed 0 \\
  --n_samples 3 \\
  --length 256`}
          </pre>
          <p className="mt-4 text-sm text-[color:var(--muted)]">
            Filter for{" "}
            <Link
              href="/scenarios/rw_trend_freq_drifting_cycle/"
              className="text-[color:var(--accent-strong)]"
            >
              rw_trend_freq_drifting_cycle
            </Link>{" "}
            to see drift-driven failures.
          </p>
        </div>
        <div className="rounded-3xl border border-[color:var(--border)] bg-white/90 p-6 shadow-[var(--shadow)]">
          <h2 className="text-xl font-semibold">Expected signals</h2>
          <div className="mt-4 space-y-3 text-sm text-[color:var(--muted)]">
            <p>STL loses spectral correlation as the period drifts.</p>
            <p>VMD keeps higher spectral + max-lag correlation across the drift.</p>
            <p>Trend R2 may stay stable even when seasonal recovery fails.</p>
          </div>
        </div>
      </section>

      <section className="mt-10 grid gap-6 md:grid-cols-2">
        <FigureCard
          src="/figs/fig07_stl_failure_1766848255126.png"
          caption="STL failure mode under frequency drift."
        />
        <FigureCard
          src="/figs/fig08_vmd_success_1766848314528.png"
          caption="VMD success on drifting frequencies."
        />
      </section>
    </div>
  );
}
