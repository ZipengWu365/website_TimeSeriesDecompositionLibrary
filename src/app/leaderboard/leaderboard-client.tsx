"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
} from "@tanstack/react-table";
import clsx from "clsx";
import type {
  LeaderboardFile,
  LeaderboardRow,
  Method,
  Scenario,
  ScenarioSeries,
  SuitesFile,
} from "@/lib/schemas";
import { BASE_PATH, DATA_VERSION } from "@/lib/constants";
import { SeriesSparkline } from "@/components/series-sparkline";

type AggregateRow = {
  method_name: string;
  display_name: string;
  needs_period: boolean;
  method_config_json: string;
  coverage_count: number;
  coverage_total: number;
  row_count: number;
  metric_T_r2: number;
  metric_T_dtw: number;
  metric_S_spectral_corr: number;
  metric_S_maxlag_corr: number;
  metric_S_r2: number;
  trend_score: number;
  seasonal_score: number;
  overall_score: number;
};

type LeaderboardClientProps = {
  suites: SuitesFile;
  scenarios: Scenario[];
  scenarioSeries: ScenarioSeries[];
  methods: Method[];
  leaderboards: Record<"core" | "full", LeaderboardFile>;
};

type ViewMode = "seasonal" | "trend" | "overall";

const METRIC_LABELS: Record<ViewMode, string> = {
  seasonal: "Seasonal (Spectral + Max-lag)",
  trend: "Trend (R2 + DTW)",
  overall: "Composite (Trend + Seasonal)",
};

const METRIC_GUIDE = [
  {
    key: "metric_T_r2",
    name: "Trend R2",
    direction: "Higher is better",
    formula: "1 - SSE/SST between true trend and estimated trend.",
    detail: "1 is perfect; 0 means no improvement over the mean trend.",
  },
  {
    key: "metric_T_dtw",
    name: "Trend DTW",
    direction: "Lower is better",
    formula: "Dynamic Time Warping distance between trend curves.",
    detail: "0 means perfect alignment; penalizes shape mismatches.",
  },
  {
    key: "metric_S_spectral_corr",
    name: "Seasonal Spectral Corr",
    direction: "Higher is better",
    formula: "Correlation between Welch power spectra of seasonal components.",
    detail: "Robust to phase offsets; 1 means identical spectra.",
  },
  {
    key: "metric_S_maxlag_corr",
    name: "Seasonal Max-lag Corr",
    direction: "Higher is better",
    formula: "Max Pearson correlation across +/- 10 lags.",
    detail: "Captures phase alignment after shifting.",
  },
  {
    key: "metric_S_r2",
    name: "Seasonal R2",
    direction: "Higher is better",
    formula: "R2 on seasonal component (auxiliary metric).",
    detail: "Phase-sensitive; used for diagnostics rather than ranking.",
  },
];

const DTW_SCALE = 0.9;

function normalizeDtw(value: number) {
  return 1 - Math.min(value / DTW_SCALE, 1);
}

function clip(value: number, min = -1, max = 1) {
  return Math.min(Math.max(value, min), max);
}

function buildCoverageCounts(rows: LeaderboardRow[]): Map<string, number> {
  const map = new Map<string, Set<string>>();
  for (const row of rows) {
    const current = map.get(row.method_name) ?? new Set<string>();
    current.add(row.scenario_id);
    map.set(row.method_name, current);
  }
  return new Map(Array.from(map.entries(), ([method, scenariosSet]) => [method, scenariosSet.size]));
}

function buildAggregates(
  rows: LeaderboardRow[],
  methodMap: Map<string, Method>,
  coverageCounts: Map<string, number>,
  coverageTotal: number,
): AggregateRow[] {
  const grouped = new Map<
    string,
    {
      row_count: number;
      scenario_ids: Set<string>;
      metric_T_r2: number;
      metric_T_dtw: number;
      metric_S_spectral_corr: number;
      metric_S_maxlag_corr: number;
      metric_S_r2: number;
      method_config_json: string;
    }
  >();

  for (const row of rows) {
    const current = grouped.get(row.method_name) ?? {
      row_count: 0,
      scenario_ids: new Set<string>(),
      metric_T_r2: 0,
      metric_T_dtw: 0,
      metric_S_spectral_corr: 0,
      metric_S_maxlag_corr: 0,
      metric_S_r2: 0,
      method_config_json: row.method_config_json,
    };
    current.row_count += 1;
    current.scenario_ids.add(row.scenario_id);
    current.metric_T_r2 += row.metric_T_r2;
    current.metric_T_dtw += row.metric_T_dtw;
    current.metric_S_spectral_corr += row.metric_S_spectral_corr;
    current.metric_S_maxlag_corr += row.metric_S_maxlag_corr;
    current.metric_S_r2 += row.metric_S_r2 ?? 0;
    grouped.set(row.method_name, current);
  }

  return Array.from(grouped.entries()).map(([methodName, sums]) => {
    const count = Math.max(sums.row_count, 1);
    const metric_T_r2 = sums.metric_T_r2 / count;
    const metric_T_dtw = sums.metric_T_dtw / count;
    const metric_S_spectral_corr = sums.metric_S_spectral_corr / count;
    const metric_S_maxlag_corr = sums.metric_S_maxlag_corr / count;
    const metric_S_r2 = sums.metric_S_r2 / count;
    const trend_score = (clip(metric_T_r2) + normalizeDtw(metric_T_dtw)) / 2;
    const seasonal_score = (metric_S_spectral_corr + metric_S_maxlag_corr) / 2;
    const overall_score = 0.5 * trend_score + 0.5 * seasonal_score;
    const meta = methodMap.get(methodName);
    return {
      method_name: methodName,
      display_name: meta?.display_name ?? methodName,
      needs_period: meta?.needs_period ?? false,
      method_config_json: sums.method_config_json,
      coverage_count: coverageCounts.get(methodName) ?? sums.scenario_ids.size,
      coverage_total: coverageTotal,
      row_count: sums.row_count,
      metric_T_r2,
      metric_T_dtw,
      metric_S_spectral_corr,
      metric_S_maxlag_corr,
      metric_S_r2,
      trend_score,
      seasonal_score,
      overall_score,
    };
  });
}

function sortAggregates(rows: AggregateRow[], view: ViewMode): AggregateRow[] {
  const sortKey =
    view === "seasonal"
      ? "metric_S_spectral_corr"
      : view === "trend"
        ? "metric_T_r2"
        : "overall_score";
  return rows.slice().sort((a, b) => b[sortKey] - a[sortKey]);
}

export default function LeaderboardClient({
  suites,
  scenarios,
  scenarioSeries,
  methods,
  leaderboards,
}: LeaderboardClientProps) {
  const [suiteId, setSuiteId] = useState<"core" | "full">("core");
  const [scenarioFilter, setScenarioFilter] = useState("all");
  const [view, setView] = useState<ViewMode>("seasonal");
  const [search, setSearch] = useState("");
  const [sorting, setSorting] = useState<SortingState>([
    { id: view === "seasonal" ? "metric_S_spectral_corr" : "metric_T_r2", desc: true },
  ]);
  const [selectedMethods, setSelectedMethods] = useState<string[]>([]);
  const [reproMethod, setReproMethod] = useState<string | null>(null);
  const [compareOpen, setCompareOpen] = useState(false);

  useEffect(() => {
    const sortKey =
      view === "seasonal"
        ? "metric_S_spectral_corr"
        : view === "trend"
          ? "metric_T_r2"
          : "overall_score";
    setSorting([{ id: sortKey, desc: true }]);
  }, [view]);

  useEffect(() => {
    setScenarioFilter("all");
  }, [suiteId]);

  const suite = suites.suites.find((item) => item.suite_id === suiteId);
  const suiteScenarioCount = suite?.scenario_ids.length ?? 0;
  const scenarioMap = useMemo(
    () => new Map(scenarios.map((scenario) => [scenario.scenario_id, scenario])),
    [scenarios],
  );
  const methodMap = useMemo(
    () => new Map(methods.map((method) => [method.method_name, method])),
    [methods],
  );
  const scenarioSeriesMap = useMemo(
    () => new Map(scenarioSeries.map((item) => [item.scenario_id, item])),
    [scenarioSeries],
  );

  const filteredRows = useMemo(() => {
    const rows = leaderboards[suiteId].rows;
    return rows.filter((row) => {
      if (scenarioFilter !== "all" && row.scenario_id !== scenarioFilter) {
        return false;
      }
      if (search.trim()) {
        return row.method_name.toLowerCase().includes(search.trim().toLowerCase());
      }
      return true;
    });
  }, [leaderboards, suiteId, scenarioFilter, search]);

  const coverageCounts = useMemo(
    () => buildCoverageCounts(leaderboards[suiteId].rows),
    [leaderboards, suiteId],
  );

  const aggregates = useMemo<AggregateRow[]>(() => {
    return buildAggregates(filteredRows, methodMap, coverageCounts, suiteScenarioCount);
  }, [filteredRows, methodMap, coverageCounts, suiteScenarioCount]);

  const scenarioLeaderboards = useMemo(() => {
    if (!suite) {
      return [];
    }
    return suite.scenario_ids.map((scenarioId) => {
      const rows = leaderboards[suiteId].rows.filter((row) => row.scenario_id === scenarioId);
      const scenarioCoverage = buildCoverageCounts(rows);
      const aggregatesForScenario = buildAggregates(rows, methodMap, scenarioCoverage, rows.length ? 1 : 0);
      return {
        scenarioId,
        scenario: scenarioMap.get(scenarioId),
        series: scenarioSeriesMap.get(scenarioId),
        rows: sortAggregates(aggregatesForScenario, view),
      };
    });
  }, [leaderboards, suite, suiteId, methodMap, scenarioMap, scenarioSeriesMap, view]);

  const selectedRows = useMemo(
    () => aggregates.filter((row) => selectedMethods.includes(row.method_name)),
    [aggregates, selectedMethods],
  );

  const columns = useMemo<ColumnDef<AggregateRow>[]>(
    () => [
      {
        id: "select",
        header: "",
        cell: ({ row }) => {
          const isSelected = selectedMethods.includes(row.original.method_name);
          return (
            <button
              type="button"
              onClick={() => {
                setSelectedMethods((prev) => {
                  if (isSelected) {
                    return prev.filter((item) => item !== row.original.method_name);
                  }
                  if (prev.length >= 5) {
                    return prev;
                  }
                  return [...prev, row.original.method_name];
                });
                setCompareOpen(true);
              }}
              className={clsx(
                "h-7 w-7 rounded-full border text-xs font-semibold",
                isSelected
                  ? "border-[color:var(--accent)] bg-[color:var(--accent)] text-white"
                  : "border-[color:var(--border)] text-[color:var(--muted)]",
              )}
            >
              {isSelected ? "x" : "+"}
            </button>
          );
        },
      },
      {
        header: "Method",
        accessorKey: "display_name",
        cell: ({ row }) => (
          <div className="space-y-1">
            <Link
              href={`/methods/${row.original.method_name}/`}
              className="text-sm font-semibold text-[color:var(--ink)]"
            >
              {row.original.display_name}
            </Link>
            <div className="flex flex-wrap items-center gap-2 text-xs text-[color:var(--muted)]">
              <span className="rounded-full border border-[color:var(--border)] px-2 py-0.5">
                {row.original.needs_period ? "needs period" : "period-free"}
              </span>
              <span>
                {row.original.coverage_total > 0
                  ? `coverage: ${row.original.coverage_count}/${row.original.coverage_total} scenarios (${suiteId})`
                  : `coverage: ${row.original.coverage_count} scenarios`}
              </span>
            </div>
          </div>
        ),
      },
      {
        header: "Trend R2",
        accessorKey: "metric_T_r2",
        cell: ({ row }) => row.original.metric_T_r2.toFixed(3),
      },
      {
        header: "Trend DTW",
        accessorKey: "metric_T_dtw",
        cell: ({ row }) => row.original.metric_T_dtw.toFixed(3),
      },
      {
        header: "Spectral Corr",
        accessorKey: "metric_S_spectral_corr",
        cell: ({ row }) => row.original.metric_S_spectral_corr.toFixed(3),
      },
      {
        header: "Max-lag Corr",
        accessorKey: "metric_S_maxlag_corr",
        cell: ({ row }) => row.original.metric_S_maxlag_corr.toFixed(3),
      },
      {
        header: "Overall",
        accessorKey: "overall_score",
        cell: ({ row }) => row.original.overall_score.toFixed(3),
      },
      {
        id: "actions",
        header: "",
        cell: ({ row }) => (
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() =>
                setReproMethod((current) =>
                  current === row.original.method_name ? null : row.original.method_name,
                )
              }
              className="rounded-full border border-[color:var(--border)] px-3 py-1 text-xs font-semibold text-[color:var(--muted)] transition hover:border-[color:var(--accent)] hover:text-[color:var(--accent-strong)]"
            >
              Reproduce
            </button>
            <Link
              href={{ pathname: "/docs", hash: "diagnostic-patterns" }}
              className="text-xs font-semibold text-[color:var(--accent-strong)]"
            >
              Why?
            </Link>
          </div>
        ),
      },
    ],
    [selectedMethods, suiteId],
  );

  const table = useReactTable({
    data: aggregates,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  const reproScenario = suite?.scenario_ids[0]
    ? scenarioMap.get(suite.scenario_ids[0])
    : scenarios[0];
  const reproduceCommand = reproMethod
    ? `python -m tsdecomp suite_run \\\n  --suite ${suiteId} \\\n  --methods ${reproMethod} \\\n  --seed ${reproScenario?.default_seed ?? 0} \\\n  --n_samples ${reproScenario?.default_samples ?? 40} \\\n  --length ${reproScenario?.default_length ?? 960}\n\npython -m tsdecomp export \\\n  --in runs/ \\\n  --format leaderboard_csv \\\n  --out_file leaderboard_${suiteId}.csv`
    : "";

  return (
    <section className="mt-10 space-y-6">
      <div className="grid gap-4 rounded-3xl border border-[color:var(--border)] bg-white/85 p-5 shadow-[var(--shadow)] md:grid-cols-4">
        <div className="md:col-span-2">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[color:var(--muted)]">
            Filter view
          </p>
          <div className="mt-3 flex flex-wrap items-center gap-3">
            <select
              value={suiteId}
              onChange={(event) => setSuiteId(event.target.value as "core" | "full")}
              className="rounded-full border border-[color:var(--border)] bg-white px-4 py-2 text-sm font-semibold text-[color:var(--ink)]"
            >
              {suites.suites.map((item) => (
                <option key={item.suite_id} value={item.suite_id}>
                  {item.name}
                </option>
              ))}
            </select>
            <select
              value={scenarioFilter}
              onChange={(event) => setScenarioFilter(event.target.value)}
              className="rounded-full border border-[color:var(--border)] bg-white px-4 py-2 text-sm font-semibold text-[color:var(--ink)]"
            >
              <option value="all">All scenarios</option>
              {suite?.scenario_ids.map((scenarioId) => (
                <option key={scenarioId} value={scenarioId}>
                  {scenarioId}
                </option>
              ))}
            </select>
            <select
              value={view}
              onChange={(event) => setView(event.target.value as ViewMode)}
              className="rounded-full border border-[color:var(--border)] bg-white px-4 py-2 text-sm font-semibold text-[color:var(--ink)]"
            >
              <option value="seasonal">Seasonal view</option>
              <option value="trend">Trend view</option>
              <option value="overall">Composite view</option>
            </select>
          </div>
          <p className="mt-3 text-xs text-[color:var(--muted)]">{METRIC_LABELS[view]}</p>
        </div>
        <div className="flex flex-col justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[color:var(--muted)]">
              Search
            </p>
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search method name"
              className="mt-3 w-full rounded-full border border-[color:var(--border)] px-4 py-2 text-sm"
            />
          </div>
          <div className="flex items-center gap-3 text-xs text-[color:var(--muted)]">
            <span>{aggregates.length} methods</span>
            <span>{filteredRows.length} rows</span>
          </div>
        </div>
        <div className="flex flex-col justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[color:var(--muted)]">
              Downloads
            </p>
            <div className="mt-3 flex flex-wrap gap-2 text-xs font-semibold">
              <a
                href={`${BASE_PATH}/data/${DATA_VERSION}/leaderboard_${suiteId}.json`}
                className="rounded-full border border-[color:var(--border)] px-3 py-2 text-[color:var(--muted)] transition hover:border-[color:var(--accent)] hover:text-[color:var(--accent-strong)]"
              >
                JSON
              </a>
              <a
                href={`${BASE_PATH}/data/${DATA_VERSION}/leaderboard_${suiteId}.csv`}
                className="rounded-full border border-[color:var(--border)] px-3 py-2 text-[color:var(--muted)] transition hover:border-[color:var(--accent)] hover:text-[color:var(--accent-strong)]"
              >
                CSV
              </a>
            </div>
          </div>
          <div className="text-xs text-[color:var(--muted)]">
            Data version {DATA_VERSION} - Suite {suiteId}
          </div>
        </div>
      </div>

      <section className="rounded-3xl border border-[color:var(--border)] bg-white/90 p-5 shadow-[var(--shadow)]">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[color:var(--muted)]">
              Metric guide
            </p>
            <h3 className="mt-1 text-lg font-semibold">How to read each metric</h3>
          </div>
          <span className="text-xs text-[color:var(--muted)]">
            Primary metrics: Trend R2, Trend DTW, Spectral Corr, Max-lag Corr
          </span>
        </div>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          {METRIC_GUIDE.map((metric) => (
            <div
              key={metric.key}
              className="rounded-2xl border border-[color:var(--border)] bg-white/80 p-4"
            >
              <div className="flex items-center justify-between gap-2">
                <p className="text-sm font-semibold text-[color:var(--ink)]">{metric.name}</p>
                <span className="rounded-full border border-[color:var(--border)] px-2 py-0.5 text-xs text-[color:var(--muted)]">
                  {metric.direction}
                </span>
              </div>
              <p className="mt-2 text-xs text-[color:var(--muted)]">{metric.formula}</p>
              <p className="mt-2 text-xs text-[color:var(--muted)]">{metric.detail}</p>
            </div>
          ))}
        </div>
      </section>

      {reproMethod && (
        <div className="rounded-3xl border border-[color:var(--border)] bg-white/90 p-5 shadow-[var(--shadow)]">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[color:var(--muted)]">
                Reproduce run
              </p>
              <p className="mt-1 text-sm font-semibold text-[color:var(--ink)]">
                {methodMap.get(reproMethod)?.display_name ?? reproMethod}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setReproMethod(null)}
              className="text-xs font-semibold text-[color:var(--muted)]"
            >
              Close
            </button>
          </div>
          <pre className="mt-4 whitespace-pre-wrap rounded-2xl bg-[color:var(--ink)]/95 p-4 text-xs text-white">
            {reproduceCommand}
          </pre>
        </div>
      )}

      <div className="overflow-hidden rounded-3xl border border-[color:var(--border)] bg-white/90 shadow-[var(--shadow)]">
        <table className="w-full border-collapse text-left text-sm">
          <thead className="bg-[color:var(--bg)]/80 text-xs uppercase tracking-[0.2em] text-[color:var(--muted)]">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th key={header.id} className="px-4 py-3">
                    {header.isPlaceholder ? null : (
                      <button
                        type="button"
                        onClick={header.column.getToggleSortingHandler()}
                        className="flex items-center gap-2"
                      >
                        {flexRender(header.column.columnDef.header, header.getContext())}
                        {header.column.getIsSorted() === "asc" && "asc"}
                        {header.column.getIsSorted() === "desc" && "desc"}
                      </button>
                    )}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.map((row) => (
              <tr key={row.id} className="border-t border-[color:var(--border)]">
                {row.getVisibleCells().map((cell) => (
                  <td key={cell.id} className="px-4 py-4 align-top">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <section className="space-y-6">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[color:var(--muted)]">
            Scenario leaderboards
          </p>
          <h3 className="mt-2 text-lg font-semibold">One leaderboard per scenario</h3>
          <p className="mt-2 text-sm text-[color:var(--muted)]">
            Ranked by {METRIC_LABELS[view]} for quick scenario-specific diagnostics.
          </p>
        </div>
        <div className="space-y-6">
          {scenarioLeaderboards.map(({ scenarioId, scenario, series, rows }) => (
            <div
              key={scenarioId}
              className="overflow-hidden rounded-3xl border border-[color:var(--border)] bg-white/90 shadow-[var(--shadow)]"
            >
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[color:var(--border)] px-5 py-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[color:var(--muted)]">
                    {scenarioId}
                  </p>
                  <p className="mt-1 text-base font-semibold">
                    {scenario?.family ?? scenarioId}
                  </p>
                </div>
                <Link
                  href={`/scenarios/${scenarioId}/`}
                  className="rounded-full border border-[color:var(--border)] px-3 py-1 text-xs font-semibold text-[color:var(--accent-strong)]"
                >
                  View scenario
                </Link>
              </div>
              <div className="grid gap-4 md:grid-cols-[240px_1fr]">
                <div className="space-y-2 px-5 py-4">
                  <SeriesSparkline values={series?.values ?? []} height={120} />
                  <div className="text-xs text-[color:var(--muted)]">
                    Example series (seed {series?.seed ?? "?"}, length {series?.length ?? "?"})
                  </div>
                </div>
                <div className="overflow-x-auto">
                  {rows.length ? (
                    <table className="w-full border-collapse text-left text-sm">
                      <thead className="bg-[color:var(--bg)]/80 text-xs uppercase tracking-[0.2em] text-[color:var(--muted)]">
                        <tr>
                          <th className="px-4 py-3">Method</th>
                          <th className="px-4 py-3">Trend R2</th>
                          <th className="px-4 py-3">Trend DTW</th>
                          <th className="px-4 py-3">Spectral Corr</th>
                          <th className="px-4 py-3">Max-lag Corr</th>
                          <th className="px-4 py-3">Overall</th>
                        </tr>
                      </thead>
                      <tbody>
                        {rows.map((row) => (
                          <tr key={row.method_name} className="border-t border-[color:var(--border)]">
                            <td className="px-4 py-4 font-semibold">
                              <Link href={`/methods/${row.method_name}/`} className="text-[color:var(--ink)]">
                                {row.display_name}
                              </Link>
                            </td>
                            <td className="px-4 py-4">{row.metric_T_r2.toFixed(3)}</td>
                            <td className="px-4 py-4">{row.metric_T_dtw.toFixed(3)}</td>
                            <td className="px-4 py-4">{row.metric_S_spectral_corr.toFixed(3)}</td>
                            <td className="px-4 py-4">{row.metric_S_maxlag_corr.toFixed(3)}</td>
                            <td className="px-4 py-4">{row.overall_score.toFixed(3)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  ) : (
                    <div className="px-5 py-6 text-sm text-[color:var(--muted)]">
                      No data for this scenario.
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <div className="grid gap-6 md:grid-cols-[1.1fr_0.9fr]">
        <div className="rounded-3xl border border-[color:var(--border)] bg-white/90 p-5 shadow-[var(--shadow)]">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[color:var(--muted)]">
            Breakdown
          </p>
          <h3 className="mt-2 text-lg font-semibold">Scenario families in this suite</h3>
          <div className="mt-4 flex flex-wrap gap-2 text-xs font-semibold">
            {suite?.scenario_ids.map((scenarioId) => {
              const scenario = scenarioMap.get(scenarioId);
              return (
                <Link
                  key={scenarioId}
                  href={`/scenarios/${scenarioId}/`}
                  className="rounded-full border border-[color:var(--border)] px-3 py-1 text-[color:var(--muted)] transition hover:border-[color:var(--accent)] hover:text-[color:var(--accent-strong)]"
                >
                  {scenario?.family ?? scenarioId}
                </Link>
              );
            })}
          </div>
        </div>
        <div className="rounded-3xl border border-[color:var(--border)] bg-white/90 p-5 shadow-[var(--shadow)]">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[color:var(--muted)]">
            Compare
          </p>
          <h3 className="mt-2 text-lg font-semibold">Pick 2-5 methods</h3>
          <p className="mt-2 text-sm text-[color:var(--muted)]">
            Selected methods show side-by-side metric cards and quick visual bars.
          </p>
          <button
            type="button"
            onClick={() => setCompareOpen(true)}
            className="mt-4 rounded-full border border-[color:var(--accent)] px-4 py-2 text-xs font-semibold text-[color:var(--accent-strong)]"
          >
            Open compare drawer
          </button>
        </div>
      </div>

      {compareOpen && (
        <CompareDrawer
          rows={selectedRows}
          onClose={() => setCompareOpen(false)}
          onClear={() => setSelectedMethods([])}
        />
      )}
    </section>
  );
}

function CompareDrawer({
  rows,
  onClose,
  onClear,
}: {
  rows: AggregateRow[];
  onClose: () => void;
  onClear: () => void;
}) {
  return (
    <div className="fixed inset-x-0 bottom-6 z-30 mx-auto w-[min(90%,1100px)] rounded-3xl border border-[color:var(--border)] bg-white/95 p-5 shadow-[var(--shadow)] backdrop-blur">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[color:var(--muted)]">
            Compare drawer
          </p>
          <p className="text-sm text-[color:var(--muted)]">
            {rows.length ? `${rows.length} methods selected` : "Select 2-5 methods to compare."}
          </p>
        </div>
        <div className="flex items-center gap-3 text-xs font-semibold">
          <button
            type="button"
            onClick={onClear}
            className="rounded-full border border-[color:var(--border)] px-3 py-2 text-[color:var(--muted)]"
          >
            Clear
          </button>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-[color:var(--accent)] px-3 py-2 text-[color:var(--accent-strong)]"
          >
            Close
          </button>
        </div>
      </div>
      <div className="mt-4 grid gap-3 md:grid-cols-3">
        {rows.map((row) => (
          <div
            key={row.method_name}
            className="rounded-2xl border border-[color:var(--border)] bg-white/90 p-4"
          >
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold">{row.display_name}</p>
              <span className="text-xs text-[color:var(--muted)]">
                {row.coverage_total > 0
                  ? `${row.coverage_count}/${row.coverage_total} scenarios`
                  : `${row.coverage_count} scenarios`}
              </span>
            </div>
            <div className="mt-3 space-y-2 text-xs text-[color:var(--muted)]">
              <MetricBar label="Trend R2" value={row.metric_T_r2} />
              <MetricBar label="Spectral" value={row.metric_S_spectral_corr} />
              <MetricBar label="Max-lag" value={row.metric_S_maxlag_corr} />
              <MetricBar label="Overall" value={row.overall_score} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function MetricBar({ label, value }: { label: string; value: number }) {
  const width = Math.max(8, Math.min(100, Math.round(value * 100)));
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between">
        <span>{label}</span>
        <span className="text-[color:var(--ink)]">{value.toFixed(2)}</span>
      </div>
      <div className="h-2 w-full rounded-full bg-[color:var(--bg)]">
        <div
          className="h-2 rounded-full bg-[color:var(--accent)]"
          style={{ width: `${width}%` }}
        />
      </div>
    </div>
  );
}
