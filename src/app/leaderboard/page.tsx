import {
  getLeaderboard,
  getMethods,
  getScenarios,
  getScenarioSeries,
  getSrFormulaExamples,
  getSuites,
} from "@/lib/data";
import LeaderboardClient from "@/app/leaderboard/leaderboard-client";
import { FigureCard } from "@/components/figure-card";
import { MathBlock } from "@/components/math-block";

function pickNd2Row<T extends { sr_method: string; decomp_method: string; trend_expr: string }>(
  rows: T[],
) {
  return (
    rows.find(
      (row) => row.sr_method === "nd2" && row.decomp_method === "stl" && row.trend_expr,
    ) ??
    rows.find((row) => row.sr_method === "nd2" && row.trend_expr) ??
    rows.find((row) => row.sr_method === "nd2")
  );
}

export default async function LeaderboardPage() {
  const [suites, scenarios, scenarioSeries, methods, core, full, srFormulas] =
    await Promise.all([
      getSuites(),
      getScenarios(),
      getScenarioSeries(),
      getMethods(),
      getLeaderboard("core"),
      getLeaderboard("full"),
      getSrFormulaExamples(),
    ]);

  return (
    <div className="mx-auto w-full max-w-6xl px-6 pb-20 pt-12">
      <div className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[color:var(--muted)]">
          Leaderboard
        </p>
        <h1 className="text-3xl font-semibold md:text-4xl">
          Diagnose methods across tiers and scenarios.
        </h1>
        <p className="text-sm text-[color:var(--muted)]">
          Use seasonal metrics as primary signals, then inspect trend recovery and max-lag
          correlation for phase shifts.
        </p>
      </div>

      <LeaderboardClient
        suites={suites}
        scenarios={scenarios.scenarios}
        scenarioSeries={scenarioSeries.scenarios}
        methods={methods.methods}
        leaderboards={{ core, full }}
      />

      <section className="mt-12 space-y-4">
        <h2 className="text-2xl font-semibold">Performance overview</h2>
        <p className="text-sm text-[color:var(--muted)]">
          Heatmaps and summaries are aligned with the leaderboard to highlight where method
          priors break down.
        </p>
        <div className="grid gap-6 md:grid-cols-2">
          <FigureCard
            src="/figs/fig09_heatmap_1766848349088.png"
            caption="Method-scenario performance heatmap (trend and seasonal)."
          />
          <FigureCard
            src="/figs/analysis/cell-3-output-1.png"
            caption="Trend R2 summary by scenario and method."
          />
          <FigureCard
            src="/figs/heatmap_T_r2.png"
            caption="Trend R2 heatmap across scenarios."
          />
          <FigureCard
            src="/figs/analysis/cell-4-output-1.png"
            caption="Seasonal R2 summary by scenario and method."
          />
          <FigureCard
            src="/figs/heatmap_S_spectral_corr.png"
            caption="Seasonal spectral correlation heatmap."
          />
          <FigureCard
            src="/figs/heatmap_S_maxlag_corr.png"
            caption="Seasonal max-lag correlation heatmap."
          />
        </div>
      </section>

      <section className="mt-12 space-y-4">
        <h2 className="text-2xl font-semibold">Diagnostic patterns</h2>
        <p className="text-sm text-[color:var(--muted)]">
          Fixed-period methods collapse under drift, while adaptive spectral approaches
          retain seasonal structure.
        </p>
        <div className="grid gap-6 md:grid-cols-2">
          <FigureCard
            src="/figs/fig07_stl_failure_1766848255126.png"
            caption="STL failure mode under frequency drift."
          />
          <FigureCard
            src="/figs/fig08_vmd_success_1766848314528.png"
            caption="VMD success on drifting frequencies."
          />
        </div>
      </section>

      <section className="mt-12 space-y-4">
        <h2 className="text-2xl font-semibold">Downstream symbolic regression</h2>
        <p className="text-sm text-[color:var(--muted)]">
          Decomposition quality influences symbolic regression. ND2 recovers concise trends
          while GPlearn often fails on composite signals.
        </p>
        <div className="grid gap-6 md:grid-cols-2">
          <FigureCard
            src="/figs/benchmark_4panel_summary.png"
            caption="Symbolic regression benchmark summary."
          />
          <FigureCard
            src="/figs/sr_trend_r2_by_scenario.png"
            caption="Trend R2 by scenario for SR methods."
          />
          <FigureCard
            src="/figs/final_report/sr_success_rate.png"
            caption="Symbolic regression success rate."
          />
          <FigureCard
            src="/figs/final_report/sr_r2_distribution.png"
            caption="Distribution of SR R2 scores."
          />
        </div>
        {srFormulas.scenarios.length ? (
          <div className="space-y-4">
            <div className="rounded-3xl border border-[color:var(--border)] bg-white/90 p-5 shadow-[var(--shadow)]">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[color:var(--muted)]">
                ND2 reconstruction vs truth
              </p>
              <h3 className="mt-2 text-lg font-semibold">Component fits on ground truth</h3>
              <p className="mt-2 text-sm text-[color:var(--muted)]">
                These plots evaluate ND2 expressions directly against the oracle trend/seasonal
                components for the selected sample.
              </p>
            </div>
            <div className="grid gap-6 md:grid-cols-2">
              {srFormulas.scenarios.map((scenario) => {
                const nd2Row = pickNd2Row(scenario.rows);
                return (
                  <div key={scenario.scenario} className="space-y-3">
                    <FigureCard
                      src={`/figs/sr_nd2/${scenario.scenario}_nd2_vs_truth.png`}
                      caption={`ND2 vs ground truth (${scenario.scenario}).`}
                    />
                    <div className="grid gap-3 rounded-3xl border border-[color:var(--border)] bg-white/90 p-4 shadow-[var(--shadow)] md:grid-cols-2">
                      <div className="space-y-2">
                        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[color:var(--muted)]">
                          ND2 trend formula
                        </p>
                        {nd2Row?.trend_expr_latex ? (
                          <MathBlock latex={nd2Row.trend_expr_latex} />
                        ) : (
                          <pre className="max-h-32 overflow-auto whitespace-pre-wrap break-all text-xs text-[color:var(--ink)]">
                            {nd2Row?.trend_expr || "n/a"}
                          </pre>
                        )}
                      </div>
                      <div className="space-y-2">
                        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[color:var(--muted)]">
                          ND2 seasonal formula
                        </p>
                        {nd2Row?.seasonal_expr_latex ? (
                          <MathBlock latex={nd2Row.seasonal_expr_latex} />
                        ) : (
                          <pre className="max-h-32 overflow-auto whitespace-pre-wrap break-all text-xs text-[color:var(--ink)]">
                            {nd2Row?.seasonal_expr || "n/a"}
                          </pre>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : null}
        {srFormulas.scenarios.length ? (
          <div className="space-y-6">
            <div className="rounded-3xl border border-[color:var(--border)] bg-white/90 p-5 shadow-[var(--shadow)]">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[color:var(--muted)]">
                Formula snapshots
              </p>
              <h3 className="mt-2 text-lg font-semibold">Side-by-side expressions</h3>
              <p className="mt-2 text-sm text-[color:var(--muted)]">
                Each scenario shows one fixed sample with oracle trend/seasonal formulas
                and the symbolic regression predictions for each pipeline.
              </p>
            </div>
            {srFormulas.scenarios.map((scenario) => (
              <div
                key={scenario.scenario}
                className="rounded-3xl border border-[color:var(--border)] bg-white/90 shadow-[var(--shadow)]"
              >
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[color:var(--border)] px-5 py-4">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[color:var(--muted)]">
                      {scenario.scenario}
                    </p>
                    <p className="mt-1 text-sm text-[color:var(--muted)]">
                      Sample {scenario.sample_id}
                    </p>
                  </div>
                  <span className="rounded-full border border-[color:var(--border)] px-3 py-1 text-xs text-[color:var(--muted)]">
                    Oracle SR (true components)
                  </span>
                </div>
                <div className="grid gap-4 px-5 py-4 md:grid-cols-[1fr_1.6fr]">
                  <div className="space-y-3">
                    <div className="rounded-2xl border border-[color:var(--border)] bg-white/80 p-4">
                      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[color:var(--muted)]">
                        Trend (oracle SR)
                      </p>
                      <pre className="mt-2 max-h-40 overflow-auto whitespace-pre-wrap break-all text-xs text-[color:var(--ink)]">
                        {scenario.oracle_trend_expr || "n/a"}
                      </pre>
                    </div>
                    <div className="rounded-2xl border border-[color:var(--border)] bg-white/80 p-4">
                      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[color:var(--muted)]">
                        Seasonal (oracle SR)
                      </p>
                      <pre className="mt-2 max-h-40 overflow-auto whitespace-pre-wrap break-all text-xs text-[color:var(--ink)]">
                        {scenario.oracle_seasonal_expr || "n/a"}
                      </pre>
                    </div>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse text-left text-sm">
                      <thead className="bg-[color:var(--bg)]/80 text-xs uppercase tracking-[0.2em] text-[color:var(--muted)]">
                        <tr>
                          <th className="px-4 py-3">Decomp</th>
                          <th className="px-4 py-3">SR Method</th>
                          <th className="px-4 py-3">Final R2</th>
                          <th className="px-4 py-3">Trend expr</th>
                          <th className="px-4 py-3">Seasonal expr</th>
                        </tr>
                      </thead>
                      <tbody>
                        {scenario.rows.map((row) => (
                          <tr
                            key={`${row.decomp_method}-${row.sr_method}`}
                            className="border-t border-[color:var(--border)]"
                          >
                            <td className="px-4 py-4 font-semibold">{row.decomp_method}</td>
                            <td className="px-4 py-4 font-semibold">{row.sr_method}</td>
                            <td className="px-4 py-4">
                              {row.final_r2 === null || row.final_r2 === undefined
                                ? "n/a"
                                : row.final_r2.toFixed(3)}
                            </td>
                            <td className="px-4 py-4">
                              <pre className="max-h-32 overflow-auto whitespace-pre-wrap break-all text-xs text-[color:var(--ink)]">
                                {row.trend_expr || "n/a"}
                              </pre>
                            </td>
                            <td className="px-4 py-4">
                              <pre className="max-h-32 overflow-auto whitespace-pre-wrap break-all text-xs text-[color:var(--ink)]">
                                {row.seasonal_expr || "n/a"}
                              </pre>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : null}
      </section>
    </div>
  );
}
