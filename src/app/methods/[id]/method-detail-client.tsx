"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { BASE_PATH, DATA_VERSION } from "@/lib/constants";
import { METHOD_DETAILS } from "@/lib/method-details";
import { MathBlock } from "@/components/math-block";
import {
  LeaderboardFile,
  LeaderboardFileSchema,
  Method,
  MethodsFile,
  MethodsFileSchema,
} from "@/lib/schemas";

type TierStat =
  | { tier: number; empty: true }
  | { tier: number; trend: number; spectral: number; maxlag: number };

const FALLBACK_METHOD: Method = {
  method_name: "unknown",
  display_name: "unknown",
  reference: "Metadata not found in methods.json.",
  needs_period: false,
  default_config: {},
  wrapper_path: "unknown",
  expected_strengths: [],
  known_signatures: [],
};

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

export default function MethodDetailClient() {
  const params = useParams();
  const rawId = useMemo(() => normalizeParam(params?.id), [params]);

  const [methodsFile, setMethodsFile] = useState<MethodsFile | null>(null);
  const [leaderboardFile, setLeaderboardFile] = useState<LeaderboardFile | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    const methodsUrl = `${BASE_PATH}/data/${DATA_VERSION}/methods.json`;
    const leaderboardUrl = `${BASE_PATH}/data/${DATA_VERSION}/leaderboard_core.json`;

    Promise.all([
      fetchJson(methodsUrl, MethodsFileSchema),
      fetchJson(leaderboardUrl, LeaderboardFileSchema),
    ])
      .then(([methodsPayload, leaderboardPayload]) => {
        if (!active) {
          return;
        }
        setMethodsFile(methodsPayload);
        setLeaderboardFile(leaderboardPayload);
      })
      .catch((err: unknown) => {
        if (!active) {
          return;
        }
        setError(err instanceof Error ? err.message : "Failed to load method data.");
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

  if (!rawId || !methodsFile || !leaderboardFile) {
    return (
      <div className="mx-auto w-full max-w-6xl px-6 pb-20 pt-12">
        <div className="rounded-3xl border border-[color:var(--border)] bg-white/90 p-6 text-sm text-[color:var(--muted)] shadow-[var(--shadow)]">
          Loading method details...
        </div>
      </div>
    );
  }

  const method =
    methodsFile.methods.find((item) => item.method_name === rawId) ??
    methodsFile.methods.find((item) => item.method_name.toLowerCase() === rawId.toLowerCase());
  const detailKey =
    Object.keys(METHOD_DETAILS).find((key) => key.toLowerCase() === rawId.toLowerCase()) ??
    method?.method_name;
  const detail = detailKey ? METHOD_DETAILS[detailKey] : undefined;
  const resolvedMethod = method
    ? method
    : {
        ...FALLBACK_METHOD,
        method_name: rawId,
        display_name: rawId,
      };

  const rows = leaderboardFile.rows.filter(
    (row) => row.method_name === resolvedMethod.method_name,
  );
  const tierStats = [1, 2, 3].map<TierStat>((tier) => {
    const tierRows = rows.filter((row) => row.tier === tier);
    if (!tierRows.length) {
      return { tier, empty: true };
    }
    const count = tierRows.length;
    const avg = (key: "metric_T_r2" | "metric_S_spectral_corr" | "metric_S_maxlag_corr") =>
      tierRows.reduce((sum, row) => sum + row[key], 0) / count;
    return {
      tier,
      trend: avg("metric_T_r2"),
      spectral: avg("metric_S_spectral_corr"),
      maxlag: avg("metric_S_maxlag_corr"),
    };
  });

  return (
    <div className="mx-auto w-full max-w-6xl px-6 pb-20 pt-12">
      <div className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[color:var(--muted)]">
          Method {resolvedMethod.method_name}
        </p>
        <h1 className="text-3xl font-semibold md:text-4xl">{resolvedMethod.display_name}</h1>
        <p className="text-sm text-[color:var(--muted)]">{resolvedMethod.reference}</p>
      </div>

      <section className="mt-10 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="rounded-3xl border border-[color:var(--border)] bg-white/90 p-6 shadow-[var(--shadow)]">
          <h2 className="text-xl font-semibold">Wrapper details</h2>
          <div className="mt-4 space-y-3 text-sm text-[color:var(--muted)]">
            <p>
              Wrapper path:{" "}
              <span className="font-semibold text-[color:var(--ink)]">
                {resolvedMethod.wrapper_path}
              </span>
            </p>
            <p>
              Period injection:{" "}
              <span className="font-semibold text-[color:var(--ink)]">
                {resolvedMethod.needs_period ? "Required" : "Not required"}
              </span>
            </p>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em]">Default config</p>
              <pre className="mt-2 whitespace-pre-wrap rounded-2xl bg-[color:var(--ink)]/95 p-4 text-xs text-white">
                {JSON.stringify(resolvedMethod.default_config, null, 2)}
              </pre>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em]">Expected strengths</p>
              <p className="mt-2">{resolvedMethod.expected_strengths.join(", ")}</p>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em]">Known signatures</p>
              <p className="mt-2">{resolvedMethod.known_signatures.join(", ")}</p>
            </div>
          </div>
          <div className="mt-6 text-sm text-[color:var(--muted)]">
            See{" "}
            <Link
              href={{ pathname: "/docs", hash: "period-injection" }}
              className="text-[color:var(--accent-strong)]"
            >
              period injection protocol
            </Link>{" "}
            for fairness constraints.
          </div>
        </div>
        <div className="rounded-3xl border border-[color:var(--border)] bg-white/90 p-6 shadow-[var(--shadow)]">
          <h2 className="text-xl font-semibold">Tier performance</h2>
          <div className="mt-4 overflow-hidden rounded-2xl border border-[color:var(--border)]">
            <table className="w-full text-left text-sm">
              <thead className="bg-[color:var(--bg)]/70 text-xs uppercase tracking-[0.2em] text-[color:var(--muted)]">
                <tr>
                  <th className="px-4 py-3">Tier</th>
                  <th className="px-4 py-3">Trend R2</th>
                  <th className="px-4 py-3">Spectral</th>
                  <th className="px-4 py-3">Max-lag</th>
                </tr>
              </thead>
              <tbody>
                {tierStats.map((stat) => (
                  <tr key={stat.tier} className="border-t border-[color:var(--border)]">
                    <td className="px-4 py-3">Tier {stat.tier}</td>
                    {"empty" in stat ? (
                      <td className="px-4 py-3" colSpan={3}>
                        No rows
                      </td>
                    ) : (
                      <>
                        <td className="px-4 py-3">{stat.trend.toFixed(3)}</td>
                        <td className="px-4 py-3">{stat.spectral.toFixed(3)}</td>
                        <td className="px-4 py-3">{stat.maxlag.toFixed(3)}</td>
                      </>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-6 rounded-2xl border border-[color:var(--border)] bg-[color:var(--bg)]/70 p-4 text-xs text-[color:var(--muted)]">
            <p className="font-semibold text-[color:var(--ink)]">Diagnostic note</p>
            <p className="mt-2">
              Cross-tier drops often indicate period drift or regime shifts. Compare with{" "}
              <Link href="/leaderboard/" className="text-[color:var(--accent-strong)]">
                tier-wise leaderboard
              </Link>{" "}
              to inspect full scenario breakdowns.
            </p>
          </div>
        </div>
      </section>

      {detail && (
        <section className="mt-10 grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="rounded-3xl border border-[color:var(--border)] bg-white/90 p-6 shadow-[var(--shadow)]">
            <h2 className="text-xl font-semibold">Mathematical formulation</h2>
            <p className="mt-3 text-sm text-[color:var(--muted)]">{detail.overview}</p>
            <div className="mt-4 space-y-4">
              {detail.equations.map((equation) => (
                <div
                  key={equation.title}
                  className="rounded-2xl border border-[color:var(--border)] p-4"
                >
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[color:var(--muted)]">
                    {equation.title}
                  </p>
                  <MathBlock latex={equation.latex} className="mt-2" />
                </div>
              ))}
            </div>
            {detail.assumptions?.length ? (
              <div className="mt-4 rounded-2xl border border-[color:var(--border)] bg-[color:var(--bg)]/70 p-4 text-xs text-[color:var(--muted)]">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[color:var(--muted)]">
                  Implicit assumptions
                </p>
                <ul className="mt-2 space-y-1">
                  {detail.assumptions.map((assumption) => (
                    <li key={assumption}>{assumption}</li>
                  ))}
                </ul>
              </div>
            ) : null}
            {detail.notes?.length ? (
              <div className="mt-4 rounded-2xl border border-[color:var(--border)] bg-[color:var(--bg)]/70 p-4 text-xs text-[color:var(--muted)]">
                <p className="font-semibold text-[color:var(--ink)]">Notes</p>
                <ul className="mt-2 space-y-1">
                  {detail.notes.map((note) => (
                    <li key={note}>{note}</li>
                  ))}
                </ul>
              </div>
            ) : null}
          </div>
          <div className="rounded-3xl border border-[color:var(--border)] bg-white/90 p-6 shadow-[var(--shadow)]">
            <h2 className="text-xl font-semibold">Implementation highlights</h2>
            <div className="mt-4 space-y-4">
              {detail.code.map((block) => (
                <div key={block.title}>
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[color:var(--muted)]">
                    {block.title}
                  </p>
                  <pre className="mt-2 whitespace-pre-wrap rounded-2xl bg-[color:var(--ink)]/95 p-4 text-xs text-white">
                    {block.code}
                  </pre>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {detail?.figures?.length ? (
        <section className="mt-10">
          <h2 className="text-xl font-semibold">Figures</h2>
          <div className="mt-4 grid gap-6 md:grid-cols-2">
            {detail.figures.map((figure) => (
              <figure
                key={figure.src}
                className="rounded-3xl border border-[color:var(--border)] bg-white/90 p-4 shadow-[var(--shadow)]"
              >
                <img
                  src={`${BASE_PATH}${figure.src}`}
                  alt={figure.caption}
                  className="h-auto w-full rounded-2xl border border-[color:var(--border)]"
                />
                <figcaption className="mt-3 text-xs text-[color:var(--muted)]">
                  {figure.caption}
                </figcaption>
              </figure>
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}
