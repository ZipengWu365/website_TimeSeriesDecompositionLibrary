import Link from "next/link";
import { FigureCard } from "@/components/figure-card";

const overviewFigures = [
  {
    src: "/figs/fig09_heatmap_1766848349088.png",
    caption: "Method-scenario heatmap of trend and seasonal recovery.",
  },
  {
    src: "/figs/fig02_method_comparison_1766848048180.png",
    caption: "Method overview by implicit priors and failure modes.",
  },
  {
    src: "/figs/fig06_synthetic_data_1766848210813.png",
    caption: "Synthetic data generation taxonomy for trends and cycles.",
  },
];

const trendFigures = [
  {
    src: "/figs/analysis/cell-3-output-1.png",
    caption: "Trend R2 by scenario and method (bar summary).",
  },
  {
    src: "/figs/heatmap_T_r2.png",
    caption: "Trend R2 heatmap across scenarios.",
  },
  {
    src: "/figs/heatmap_T_dtw.png",
    caption: "Trend DTW distance heatmap (lower is better).",
  },
];

const seasonalFigures = [
  {
    src: "/figs/analysis/cell-4-output-1.png",
    caption: "Seasonal R2 by scenario and method (bar summary).",
  },
  {
    src: "/figs/heatmap_S_spectral_corr.png",
    caption: "Seasonal spectral correlation heatmap.",
  },
  {
    src: "/figs/heatmap_S_maxlag_corr.png",
    caption: "Seasonal max-lag correlation heatmap.",
  },
];

const patternFigures = [
  {
    src: "/figs/fig07_stl_failure_1766848255126.png",
    caption: "Fixed-period STL failure under frequency drift.",
  },
  {
    src: "/figs/fig08_vmd_success_1766848314528.png",
    caption: "VMD success on drifting frequencies via adaptive bands.",
  },
];

const scenarioBlocks = [
  {
    id: "logistic_trend_multi_seasonal",
    title: "Logistic trend + multi-seasonal",
    summary:
      "Stationary multi-seasonal signals match STL-family assumptions. CEEMDAN remains competitive due to adaptive IMFs.",
    figures: [
      {
        src: "/figs/bars_logistic_trend_multi_seasonal.png",
        caption: "Metric bars for logistic + multi-seasonal scenario.",
      },
      {
        src: "/figs/decomp_compare_logistic_trend_multi_seasonal.png",
        caption: "Decomposition comparison on logistic + multi-seasonal.",
      },
      {
        src: "/figs/decomp_facets_logistic_trend_multi_seasonal_page1.png",
        caption: "Component facets for logistic + multi-seasonal.",
      },
    ],
  },
  {
    id: "poly_trend_multi_harmonic",
    title: "Polynomial trend + multi-harmonic",
    summary:
      "Multi-harmonic cycles favor SSA-style grouping. STL maintains strong trend recovery while SSA isolates harmonics.",
    figures: [
      {
        src: "/figs/bars_poly_trend_multi_harmonic.png",
        caption: "Metric bars for polynomial + multi-harmonic scenario.",
      },
      {
        src: "/figs/decomp_compare_poly_trend_multi_harmonic.png",
        caption: "Decomposition comparison on polynomial + multi-harmonic.",
      },
    ],
  },
  {
    id: "rw_trend_freq_drifting_cycle",
    title: "Random walk trend + drifting cycle",
    summary:
      "Non-stationary drift breaks fixed-period methods. Wavelet, EMD, and VMD better retain seasonal structure.",
    figures: [
      {
        src: "/figs/bars_rw_trend_freq_drifting_cycle.png",
        caption: "Metric bars for random walk + drifting cycle.",
      },
      {
        src: "/figs/decomp_compare_rw_trend_freq_drifting_cycle.png",
        caption: "Decomposition comparison on random walk + drifting cycle.",
      },
      {
        src: "/figs/decomp_facets_rw_trend_freq_drifting_cycle_page1.png",
        caption: "Component facets for drifting cycle case.",
      },
    ],
  },
  {
    id: "piecewise_trend_regime_cycle_with_events",
    title: "Piecewise trend + regime cycle + events",
    summary:
      "Abrupt regimes and events confuse global bases. Robust STL and wavelet variants handle shocks with fewer artifacts.",
    figures: [
      {
        src: "/figs/bars_piecewise_trend_regime_cycle_with_events.png",
        caption: "Metric bars for piecewise + regime cycle + events.",
      },
      {
        src: "/figs/decomp_compare_piecewise_trend_regime_cycle_with_events.png",
        caption: "Decomposition comparison on regime switch scenario.",
      },
      {
        src: "/figs/decomp_facets_piecewise_trend_regime_cycle_with_events_page1.png",
        caption: "Component facets for regime switch scenario.",
      },
    ],
  },
  {
    id: "trend_only_linear",
    title: "Trend only (linear)",
    summary:
      "Sanity check for trend recovery. Seasonal output should remain near zero.",
    figures: [
      {
        src: "/figs/bars_trend_only_linear.png",
        caption: "Metric bars for trend-only linear scenario.",
      },
      {
        src: "/figs/decomp_compare_trend_only_linear.png",
        caption: "Decomposition comparison on trend-only linear.",
      },
    ],
  },
  {
    id: "trend_plus_single_sine",
    title: "Trend + single sine",
    summary:
      "Canonical stationary case; most methods achieve high trend and seasonal alignment.",
    figures: [
      {
        src: "/figs/bars_trend_plus_single_sine.png",
        caption: "Metric bars for trend + single sine.",
      },
      {
        src: "/figs/decomp_compare_trend_plus_single_sine.png",
        caption: "Decomposition comparison on trend + single sine.",
      },
    ],
  },
];

const srFigures = [
  {
    src: "/figs/benchmark_4panel_summary.png",
    caption: "Symbolic regression benchmark summary panels.",
  },
  {
    src: "/figs/sr_trend_r2_by_scenario.png",
    caption: "Trend R2 by scenario for SR methods.",
  },
  {
    src: "/figs/final_report/sr_success_rate.png",
    caption: "Symbolic regression success rate.",
  },
  {
    src: "/figs/final_report/sr_r2_distribution.png",
    caption: "Distribution of SR R2 scores.",
  },
  {
    src: "/figs/final_report/sr_mechanism_score.png",
    caption: "Mechanism score comparison for SR methods.",
  },
];

const reportFigures = [
  {
    src: "/figs/final_report/decomp_trend_r2_heatmap.png",
    caption: "Full report: trend R2 heatmap.",
  },
  {
    src: "/figs/final_report/decomp_trend_r2_heatmap_v2.png",
    caption: "Full report: trend R2 heatmap (variant).",
  },
  {
    src: "/figs/final_report/decomp_season_r2_heatmap.png",
    caption: "Full report: seasonal R2 heatmap.",
  },
];

export default function ResultsPage() {
  return (
    <div className="mx-auto w-full max-w-6xl px-6 pb-20 pt-12">
      <div className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[color:var(--muted)]">
          Results
        </p>
        <h1 className="text-3xl font-semibold md:text-4xl">
          Decomposition and symbolic regression findings.
        </h1>
        <p className="text-sm text-[color:var(--muted)]">
          Figures are grouped by the questions they answer: overall capability, diagnostic
          patterns, and scenario-specific behavior.
        </p>
      </div>

      <section className="mt-10 space-y-4">
        <h2 className="text-2xl font-semibold">Benchmark overview</h2>
        <p className="text-sm text-[color:var(--muted)]">
          The core suite covers stationary, multi-seasonal, and non-stationary regimes to
          highlight where method priors break down.
        </p>
        <div className="grid gap-6 md:grid-cols-2">
          {overviewFigures.map((figure) => (
            <FigureCard key={figure.src} src={figure.src} caption={figure.caption} />
          ))}
        </div>
      </section>

      <section className="mt-12 space-y-4">
        <h2 className="text-2xl font-semibold">Trend recovery</h2>
        <p className="text-sm text-[color:var(--muted)]">
          Trend R2 and DTW show how well each method tracks slow components even under
          drift and regime shifts.
        </p>
        <div className="grid gap-6 md:grid-cols-2">
          {trendFigures.map((figure) => (
            <FigureCard key={figure.src} src={figure.src} caption={figure.caption} />
          ))}
        </div>
      </section>

      <section className="mt-12 space-y-4">
        <h2 className="text-2xl font-semibold">Seasonal recovery</h2>
        <p className="text-sm text-[color:var(--muted)]">
          Spectral and max-lag correlation reveal whether methods capture frequency content
          even when phases drift.
        </p>
        <div className="grid gap-6 md:grid-cols-2">
          {seasonalFigures.map((figure) => (
            <FigureCard key={figure.src} src={figure.src} caption={figure.caption} />
          ))}
        </div>
      </section>

      <section className="mt-12 space-y-4">
        <h2 className="text-2xl font-semibold">Diagnostic patterns</h2>
        <p className="text-sm text-[color:var(--muted)]">
          Fixed-period assumptions collapse under drift, while adaptive spectral methods
          keep pace by tracking shifting frequencies.
        </p>
        <div className="grid gap-6 md:grid-cols-2">
          {patternFigures.map((figure) => (
            <FigureCard key={figure.src} src={figure.src} caption={figure.caption} />
          ))}
        </div>
      </section>

      <section className="mt-12 space-y-8">
        <div>
          <h2 className="text-2xl font-semibold">Scenario breakdowns</h2>
          <p className="text-sm text-[color:var(--muted)]">
            Each block links back to the scenario definition and shows metrics plus
            decomposition snapshots.
          </p>
        </div>
        <div className="space-y-10">
          {scenarioBlocks.map((scenario) => (
            <div key={scenario.id} className="rounded-3xl border border-[color:var(--border)] bg-white/90 p-6 shadow-[var(--shadow)]">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <h3 className="text-xl font-semibold">{scenario.title}</h3>
                  <p className="mt-2 text-sm text-[color:var(--muted)]">{scenario.summary}</p>
                </div>
                <Link
                  href={`/scenarios/${scenario.id}`}
                  className="rounded-full border border-[color:var(--accent)] px-4 py-2 text-xs font-semibold text-[color:var(--accent-strong)]"
                >
                  View scenario
                </Link>
              </div>
              <div className="mt-6 grid gap-6 md:grid-cols-2">
                {scenario.figures.map((figure) => (
                  <FigureCard key={figure.src} src={figure.src} caption={figure.caption} />
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-12 space-y-4">
        <h2 className="text-2xl font-semibold">Symbolic regression results</h2>
        <p className="text-sm text-[color:var(--muted)]">
          ND2 consistently recovers concise trend expressions, while GPlearn struggles on
          composite signals. Decomposition improves SR interpretability by simplifying targets.
        </p>
        <div className="grid gap-6 md:grid-cols-2">
          {srFigures.map((figure) => (
            <FigureCard key={figure.src} src={figure.src} caption={figure.caption} />
          ))}
        </div>
      </section>

      <section className="mt-12 space-y-4">
        <h2 className="text-2xl font-semibold">Full report heatmaps</h2>
        <p className="text-sm text-[color:var(--muted)]">
          Additional summary heatmaps from the consolidated report for cross-checking trends.
        </p>
        <div className="grid gap-6 md:grid-cols-2">
          {reportFigures.map((figure) => (
            <FigureCard key={figure.src} src={figure.src} caption={figure.caption} />
          ))}
        </div>
      </section>
    </div>
  );
}
