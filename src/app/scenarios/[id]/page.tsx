import { notFound } from "next/navigation";
import Link from "next/link";
import { getLeaderboard, getMethods, getScenarios, getSuites } from "@/lib/data";

type ScenarioPageProps = {
  params: { id: string };
};

export async function generateStaticParams() {
  const scenarios = await getScenarios();
  return scenarios.scenarios.map((scenario) => ({ id: scenario.scenario_id }));
}

export default async function ScenarioDetailPage({ params }: ScenarioPageProps) {
  const [scenarios, suites, leaderboard, methods] = await Promise.all([
    getScenarios(),
    getSuites(),
    getLeaderboard("core"),
    getMethods(),
  ]);

  const scenario = scenarios.scenarios.find((item) => item.scenario_id === params.id);
  if (!scenario) {
    notFound();
  }

  const suiteForScenario =
    suites.suites.find((suite) => suite.scenario_ids.includes(scenario.scenario_id)) ??
    suites.suites[0];

  const rows = leaderboard.rows.filter((row) => row.scenario_id === scenario.scenario_id);
  const topMethods = rows
    .slice()
    .sort((a, b) => b.metric_S_spectral_corr - a.metric_S_spectral_corr)
    .slice(0, 4)
    .map((row) => {
      const meta = methods.methods.find((method) => method.method_name === row.method_name);
      return {
        method_name: row.method_name,
        display_name: meta?.display_name ?? row.method_name,
        spectral: row.metric_S_spectral_corr,
        maxlag: row.metric_S_maxlag_corr,
      };
    });

  const reproduceCommand = `python -m tsdecomp suite_run \\\n  --suite ${suiteForScenario.suite_id} \\\n  --methods stl,mstl \\\n  --seed ${scenario.default_seed} \\\n  --n_samples ${scenario.default_samples} \\\n  --length ${scenario.default_length}`;

  return (
    <div className="mx-auto w-full max-w-6xl px-6 pb-20 pt-12">
      <div className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[color:var(--muted)]">
          Scenario {scenario.scenario_id}
        </p>
        <h1 className="text-3xl font-semibold md:text-4xl">{scenario.family}</h1>
        <p className="text-sm text-[color:var(--muted)]">{scenario.description}</p>
      </div>

      <section className="mt-10 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="rounded-3xl border border-[color:var(--border)] bg-white/90 p-6 shadow-[var(--shadow)]">
          <h2 className="text-xl font-semibold">Scenario details</h2>
          <div className="mt-4 grid gap-3 text-sm text-[color:var(--muted)]">
            <div className="flex flex-wrap gap-2">
              <span className="rounded-full border border-[color:var(--border)] px-3 py-1">
                Tier {scenario.tier}
              </span>
              <span className="rounded-full border border-[color:var(--border)] px-3 py-1">
                Base periods: {scenario.base_periods.length ? scenario.base_periods.join(", ") : "none"}
              </span>
              <span className="rounded-full border border-[color:var(--border)] px-3 py-1">
                Suite: {suiteForScenario.suite_id.toUpperCase()}
              </span>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em]">Stressors</p>
              <p className="mt-1">{scenario.stressors.join(", ")}</p>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em]">Patterns</p>
              <p className="mt-1">{scenario.patterns.join(", ")}</p>
            </div>
          </div>
          <div className="mt-6">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[color:var(--muted)]">
              Reproduce
            </p>
            <pre className="mt-3 whitespace-pre-wrap rounded-2xl bg-[color:var(--ink)]/95 p-4 text-xs text-white">
              {reproduceCommand}
            </pre>
          </div>
        </div>
        <div className="rounded-3xl border border-[color:var(--border)] bg-white/90 p-6 shadow-[var(--shadow)]">
          <h2 className="text-xl font-semibold">Top methods (seasonal spectral)</h2>
          <div className="mt-4 space-y-3">
            {topMethods.map((method) => (
              <Link
                key={method.method_name}
                href={`/methods/${method.method_name}`}
                className="flex items-center justify-between rounded-2xl border border-[color:var(--border)] px-4 py-3 text-sm transition hover:border-[color:var(--accent)]"
              >
                <div>
                  <p className="font-semibold">{method.display_name}</p>
                  <p className="text-xs text-[color:var(--muted)]">
                    spectral {method.spectral.toFixed(3)} - max-lag {method.maxlag.toFixed(3)}
                  </p>
                </div>
                <span className="text-xs font-semibold text-[color:var(--accent-strong)]">
                  View
                </span>
              </Link>
            ))}
          </div>
          <div className="mt-6 rounded-2xl border border-[color:var(--border)] bg-[color:var(--bg)]/70 p-4 text-xs text-[color:var(--muted)]">
            <p className="font-semibold text-[color:var(--ink)]">Need more context?</p>
            <p className="mt-2">
              Jump to <Link href="/docs#diagnostic-patterns" className="text-[color:var(--accent-strong)]">Diagnostic
              Patterns</Link> to see why these scenarios stress period drift, regime
              switches, or sparse events.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
