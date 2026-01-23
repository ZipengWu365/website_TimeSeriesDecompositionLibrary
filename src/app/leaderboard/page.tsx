import { getLeaderboard, getMethods, getScenarios, getSuites } from "@/lib/data";
import LeaderboardClient from "@/app/leaderboard/leaderboard-client";

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
    </div>
  );
}
