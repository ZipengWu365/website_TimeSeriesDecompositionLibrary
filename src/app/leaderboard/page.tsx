import { getLeaderboard, getMethods, getScenarios, getScenarioSeries, getSuites, getSnapshot } from "@/lib/data";
import LeaderboardClient from "@/app/leaderboard/leaderboard-client";
import { FigureCard } from "@/components/figure-card";

export default async function LeaderboardPage() {
  const [suites, scenarios, scenarioSeries, methods, core, full, coreSnapshot, fullSnapshot] =
    await Promise.all([
      getSuites(),
      getScenarios(),
      getScenarioSeries(),
      getMethods(),
      getLeaderboard("core"),
      getLeaderboard("full"),
      getSnapshot("core"),
      getSnapshot("full"),
    ]);

  return (
    <div className="mx-auto w-full max-w-6xl px-6 pb-20 pt-12">
      <div className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[color:var(--muted)]">
          Leaderboard
        </p>
        <h1 className="text-3xl font-semibold md:text-4xl">
          Diagnose methods across scenarios.
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
        snapshots={{ core: coreSnapshot, full: fullSnapshot }}
      />

      <section className="mt-12 space-y-4">
        <h2 className="text-2xl font-semibold">Latest benchmark figures</h2>
        <p className="text-sm text-[color:var(--muted)]">
          Updated visuals from the 2026-01-28 benchmark run.
        </p>
        <div className="grid gap-6 md:grid-cols-2">
          <FigureCard
            src="/figs/combined_radar_charts.png"
            caption="Tier-wise radar summaries for the core suite."
          />
          <FigureCard
            src="/figs/heatmap_T_r2.png"
            caption="Trend R2 heatmap across scenarios."
          />
          <FigureCard
            src="/figs/heatmap_T_dtw.png"
            caption="Trend DTW heatmap across scenarios."
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

    </div>
  );
}
