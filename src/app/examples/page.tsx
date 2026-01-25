import Link from "next/link";
import { BASE_PATH } from "@/lib/constants";

const EXAMPLES = [
  {
    slug: "stationary-period",
    title: "Single-period stationarity",
    summary:
      "Use STL or MSTL when seasonality is stable and focus on spectral + max-lag agreement.",
    figure: "/figs/decomp_compare_trend_plus_single_sine.png",
  },
  {
    slug: "frequency-drift",
    title: "Frequency drift diagnostics",
    summary:
      "Stress-test fixed-period methods and compare adaptive spectral models like VMD.",
    figure: "/figs/fig08_vmd_success_1766848314528.png",
  },
  {
    slug: "regime-events",
    title: "Regime switches and events",
    summary:
      "Inspect SSA/Wavelet behavior when trend regimes and sparse events collide.",
    figure: "/figs/decomp_compare_piecewise_trend_regime_cycle_with_events.png",
  },
];

export default function ExamplesPage() {
  return (
    <div className="mx-auto w-full max-w-6xl px-6 pb-20 pt-12">
      <div className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[color:var(--muted)]">
          Examples
        </p>
        <h1 className="text-3xl font-semibold md:text-4xl text-[color:var(--ink)]">Decomposition recipes.</h1>
        <p className="text-sm text-[color:var(--muted)]">
          Each case includes a reproducible command, expected behavior, and diagnostic plots.
        </p>
      </div>

      <section className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {EXAMPLES.map((example) => (
          <Link
            key={example.slug}
            href={`/examples/${example.slug}/`}
            className="rounded-3xl border border-[color:var(--border)] bg-white/90 p-4 shadow-[var(--shadow)] transition hover:-translate-y-0.5 hover:border-[color:var(--accent)]"
          >
            <img
              src={`${BASE_PATH}${example.figure}`}
              alt={example.title}
              className="h-36 w-full rounded-2xl border border-[color:var(--border)] object-cover"
            />
            <div className="mt-4 space-y-2">
              <h3 className="text-lg font-semibold">{example.title}</h3>
              <p className="text-sm text-[color:var(--muted)]">{example.summary}</p>
              <span className="text-xs font-semibold text-[color:var(--accent-strong)]">
                Open case
              </span>
            </div>
          </Link>
        ))}
      </section>
    </div>
  );
}
