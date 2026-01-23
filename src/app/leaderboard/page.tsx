import { getLeaderboard, getMethods, getScenarios, getSuites } from "@/lib/data";
import LeaderboardClient from "@/app/leaderboard/leaderboard-client";
import { FigureCard } from "@/components/figure-card";

export default async function LeaderboardPage() {
  const [suites, scenarios, methods, core, full] = await Promise.all([
    getSuites(),
    getScenarios(),
    getMethods(),
    getLeaderboard("core"),
    getLeaderboard("full"),
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
          Default view is tier-wise. Use seasonal metrics as primary signals, then inspect
          trend recovery and max-lag correlation for phase shifts.
        </p>
      </div>

      <LeaderboardClient
        suites={suites}
        scenarios={scenarios.scenarios}
        methods={methods.methods}
        leaderboards={{ core, full }}
      />

      <section className="mt-12 space-y-4">
        <h2 className="text-2xl font-semibold">Performance overview</h2>
        <p className="text-sm text-[color:var(--muted)]">
          Heatmaps and summaries are aligned with the tier-wise leaderboard to highlight
          where method priors break down.
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
      </section>
    </div>
  );
}
