"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { FigureCard } from "@/components/figure-card";
import { BASE_PATH, DATA_VERSION } from "@/lib/constants";
import {
  LeaderboardFile,
  LeaderboardFileSchema,
  MethodsFile,
  MethodsFileSchema,
  ScenariosFile,
  ScenariosFileSchema,
  SuitesFile,
  SuitesFileSchema,
} from "@/lib/schemas";

async function fetchJson<T>(path: string, schema: { parse: (value: unknown) => T }): Promise<T> {
  const response = await fetch(path, { cache: "force-cache" });
  if (!response.ok) {
    throw new Error(`Failed to load ${path}`);
  }
  const payload = await response.json();
  return schema.parse(payload);
}

function normalizeParam(value: string | string[] | undefined): string {
  if (!value) {
    return "";
  }
  const raw = Array.isArray(value) ? value[0] : value;
  return decodeURIComponent(raw);
}

const SCENARIO_FIGURES: Record<string, { src: string; caption: string }[]> = {
  trend_only_linear: [
    {
      src: "/figs/bars_trend_only_linear.png",
      caption: "Metric bars for trend-only linear scenario.",
    },
    {
      src: "/figs/decomp_compare_trend_only_linear.png",
      caption: "Decomposition comparison on trend-only linear.",
    },
  ],
  trend_plus_single_sine: [
    {
      src: "/figs/bars_trend_plus_single_sine.png",
      caption: "Metric bars for trend + single sine scenario.",
    },
    {
      src: "/figs/decomp_compare_trend_plus_single_sine.png",
      caption: "Decomposition comparison on trend + single sine.",
    },
  ],
  poly_trend_multi_harmonic: [
    {
      src: "/figs/bars_poly_trend_multi_harmonic.png",
      caption: "Metric bars for polynomial + multi-harmonic scenario.",
    },
    {
      src: "/figs/decomp_compare_poly_trend_multi_harmonic.png",
      caption: "Decomposition comparison on polynomial + multi-harmonic.",
    },
  ],
  logistic_trend_multi_seasonal: [
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
  rw_trend_freq_drifting_cycle: [
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
  piecewise_trend_regime_cycle_with_events: [
    {
      src: "/figs/bars_piecewise_trend_regime_cycle_with_events.png",
      caption: "Metric bars for piecewise + regime cycle + events.",
    },
    {
      src: "/figs/decomp_compare_piecewise_trend_regime_cycle_with_events.png",
      caption: "Decomposition comparison on regime-switching scenario.",
    },
    {
      src: "/figs/decomp_facets_piecewise_trend_regime_cycle_with_events_page1.png",
      caption: "Component facets for regime switch scenario.",
    },
  ],
};

export default function ScenarioDetailClient() {
  const params = useParams();
  const rawId = useMemo(() => normalizeParam(params?.id), [params]);

  const [scenariosFile, setScenariosFile] = useState<ScenariosFile | null>(null);
  const [suitesFile, setSuitesFile] = useState<SuitesFile | null>(null);
  const [leaderboardFile, setLeaderboardFile] = useState<LeaderboardFile | null>(null);
  const [methodsFile, setMethodsFile] = useState<MethodsFile | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    const scenariosUrl = `${BASE_PATH}/data/${DATA_VERSION}/scenarios.json`;
    const suitesUrl = `${BASE_PATH}/data/${DATA_VERSION}/suites.json`;
    const leaderboardUrl = `${BASE_PATH}/data/${DATA_VERSION}/leaderboard_core.json`;
    const methodsUrl = `${BASE_PATH}/data/${DATA_VERSION}/methods.json`;

    Promise.all([
      fetchJson(scenariosUrl, ScenariosFileSchema),
      fetchJson(suitesUrl, SuitesFileSchema),
      fetchJson(leaderboardUrl, LeaderboardFileSchema),
      fetchJson(methodsUrl, MethodsFileSchema),
    ])
      .then(([scenariosPayload, suitesPayload, leaderboardPayload, methodsPayload]) => {
        if (!active) {
          return;
        }
        setScenariosFile(scenariosPayload);
        setSuitesFile(suitesPayload);
        setLeaderboardFile(leaderboardPayload);
        setMethodsFile(methodsPayload);
      })
      .catch((err: unknown) => {
        if (!active) {
          return;
        }
        setError(err instanceof Error ? err.message : "Failed to load scenario data.");
      });

    return () => {
      active = false;
    };
  }, []);

  if (error) {
    return (
      <div className="mx-auto w-full max-w-6xl px-6 pb-20 pt-12">
        <div className="rounded-3xl border border-red-200 bg-white/90 p-6 text-sm text-red-600 shadow-[var(--shadow)]">
          {error}
        </div>
      </div>
    );
  }

  if (!rawId || !scenariosFile || !suitesFile || !leaderboardFile || !methodsFile) {
    return (
      <div className="mx-auto w-full max-w-6xl px-6 pb-20 pt-12">
        <div className="rounded-3xl border border-[color:var(--border)] bg-white/90 p-6 text-sm text-[color:var(--muted)] shadow-[var(--shadow)]">
          Loading scenario details...
        </div>
      </div>
    );
  }

  const scenario =
    scenariosFile.scenarios.find((item) => item.scenario_id === rawId) ??
    scenariosFile.scenarios.find((item) => item.scenario_id.toLowerCase() === rawId.toLowerCase());

  if (!scenario) {
    return (
      <div className="mx-auto w-full max-w-6xl px-6 pb-20 pt-12">
        <div className="rounded-3xl border border-[color:var(--border)] bg-white/90 p-6 text-sm text-[color:var(--muted)] shadow-[var(--shadow)]">
          Scenario not found.
        </div>
      </div>
    );
  }

  const suiteForScenario =
    suitesFile.suites.find((suite) => suite.scenario_ids.includes(scenario.scenario_id)) ??
    suitesFile.suites[0];

  const rows = leaderboardFile.rows.filter((row) => row.scenario_id === scenario.scenario_id);
  const topMethods = rows
    .slice()
    .sort((a, b) => b.metric_S_spectral_corr - a.metric_S_spectral_corr)
    .slice(0, 4)
    .map((row) => {
      const meta = methodsFile.methods.find((method) => method.method_name === row.method_name);
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
                href={`/methods/${method.method_name}/`}
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
              Jump to{" "}
              <Link
                href={{ pathname: "/docs", hash: "diagnostic-patterns" }}
                className="text-[color:var(--accent-strong)]"
              >
                Diagnostic Patterns
              </Link>{" "}
              to see why these scenarios stress period drift, regime switches, or sparse events.
            </p>
          </div>
        </div>
      </section>

      {SCENARIO_FIGURES[scenario.scenario_id]?.length ? (
        <section className="mt-10 space-y-4">
          <h2 className="text-xl font-semibold">Scenario figures</h2>
          <div className="grid gap-6 md:grid-cols-2">
            {SCENARIO_FIGURES[scenario.scenario_id].map((figure) => (
              <FigureCard key={figure.src} src={figure.src} caption={figure.caption} />
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}
