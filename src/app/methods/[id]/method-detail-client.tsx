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

// sklearn-style parameter definitions per method
const METHOD_PARAMETERS: Record<string, { name: string; type: string; default: string; description: string }[]> = {
  STL: [
    { name: "period", type: "int", default: "Required", description: "Length of the seasonal cycle. Auto-injected from scenario." },
    { name: "seasonal", type: "int", default: "7", description: "Length of the seasonal smoother." },
    { name: "trend", type: "int or None", default: "None", description: "Length of the trend smoother. Auto-computed if None." },
    { name: "robust", type: "bool", default: "False", description: "If True, use robust fitting with bisquare weights." },
  ],
  MSTL: [
    { name: "periods", type: "list[int]", default: "Required", description: "List of seasonal periods. Auto-injected from scenario." },
    { name: "stl_kwargs", type: "dict", default: "{}", description: "Additional arguments passed to each STL fit." },
  ],
  SSA: [
    { name: "window", type: "int or None", default: "T//4", description: "Embedding window length. Defaults to series length / 4." },
    { name: "rank", type: "int", default: "10", description: "Number of SVD components to use for reconstruction." },
  ],
  VMD: [
    { name: "K", type: "int", default: "5", description: "Number of modes to extract." },
    { name: "alpha", type: "float", default: "2000.0", description: "Bandwidth constraint (penalty on spectral width)." },
    { name: "tau", type: "float", default: "0.0", description: "Time-step of dual ascent." },
    { name: "tol", type: "float", default: "1e-7", description: "Convergence tolerance." },
  ],
  CEEMDAN: [
    { name: "trials", type: "int", default: "100", description: "Number of noise-assisted trials for averaging." },
    { name: "epsilon", type: "float", default: "0.1", description: "Noise amplitude scaling." },
  ],
  EMD: [
    { name: "max_imfs", type: "int or None", default: "None", description: "Maximum number of IMFs to extract." },
  ],
  WAVELET: [
    { name: "wavelet", type: "str", default: "'db4'", description: "Wavelet name (e.g., 'db4', 'haar', 'sym5')." },
    { name: "level", type: "int", default: "4", description: "Decomposition level." },
    { name: "trend_levels", type: "list[int]", default: "[0]", description: "Levels to assign to trend." },
    { name: "season_levels", type: "list[int]", default: "[1, 2]", description: "Levels to assign to seasonality." },
  ],
  MA_BASELINE: [
    { name: "period", type: "int", default: "Required", description: "Seasonal period for index averaging." },
    { name: "window", type: "int or None", default: "period", description: "Moving average window size." },
  ],
};

// sklearn-style attributes
const METHOD_ATTRIBUTES: Record<string, { name: string; type: string; description: string }[]> = {
  STL: [
    { name: "trend", type: "np.ndarray", description: "Extracted trend component of shape (n_samples,)." },
    { name: "season", type: "np.ndarray", description: "Extracted seasonal component of shape (n_samples,)." },
    { name: "residual", type: "np.ndarray", description: "Residual component after removing trend and season." },
  ],
  MSTL: [
    { name: "trend", type: "np.ndarray", description: "Extracted trend component." },
    { name: "season", type: "np.ndarray", description: "Sum of all seasonal components." },
    { name: "residual", type: "np.ndarray", description: "Residual after removing all components." },
  ],
  SSA: [
    { name: "components", type: "Dict[str, np.ndarray]", description: "Individual reconstructed components by index." },
    { name: "singular_values_", type: "np.ndarray", description: "Singular values from SVD decomposition." },
  ],
  VMD: [
    { name: "modes", type: "np.ndarray", description: "Array of shape (K, n_samples) with K extracted modes." },
    { name: "omega", type: "np.ndarray", description: "Center frequencies for each mode." },
  ],
};

// Methods (sklearn style)
const METHOD_METHODS: Record<string, { name: string; signature: string; description: string }[]> = {
  STL: [
    { name: "fit", signature: "fit(y)", description: "Fit the STL model to time series y. Returns DecompResult." },
  ],
  SSA: [
    { name: "fit", signature: "fit(y, window=None, rank=10)", description: "Fit SSA decomposition." },
    { name: "reconstruct", signature: "reconstruct(groups)", description: "Reconstruct series from selected component groups." },
  ],
  VMD: [
    { name: "fit", signature: "fit(y, K=5, alpha=2000)", description: "Run variational mode decomposition." },
  ],
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

  const methodKey = rawId.toUpperCase();
  const parameters = METHOD_PARAMETERS[methodKey] || [];
  const attributes = METHOD_ATTRIBUTES[methodKey] || METHOD_ATTRIBUTES["STL"] || [];
  const methods = METHOD_METHODS[methodKey] || METHOD_METHODS["STL"] || [];

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
    <div className="mx-auto w-full max-w-4xl px-6 pb-20 pt-12">
      {/* Breadcrumb */}
      <nav className="mb-4 text-sm text-[color:var(--muted)]">
        <Link href="/methods/" className="hover:text-[color:var(--ink)]">
          Methods
        </Link>
        <span className="mx-2">›</span>
        <span>{resolvedMethod.display_name}</span>
      </nav>

      {/* Class Signature (sklearn style) */}
      <div className="rounded-xl bg-[color:var(--ink)] p-4">
        <code className="text-sm text-white">
          <span className="text-blue-300">class</span>{" "}
          <span className="text-yellow-300 font-bold">tsdecomp.methods.{resolvedMethod.display_name}</span>
          <span className="text-gray-400">(</span>
          {parameters.slice(0, 3).map((p, i) => (
            <span key={p.name}>
              <span className="text-orange-300">{p.name}</span>
              <span className="text-gray-400">=</span>
              <span className="text-green-300">{p.default}</span>
              {i < Math.min(parameters.length, 3) - 1 && <span className="text-gray-400">, </span>}
            </span>
          ))}
          {parameters.length > 3 && <span className="text-gray-400">, ...</span>}
          <span className="text-gray-400">)</span>
        </code>
        <div className="mt-2 text-right">
          <a
            href={`https://github.com/ZipengWu365/TS-component-structure-Recover-library/blob/main/tsdecomp/methods/${rawId.toLowerCase()}.py`}
            target="_blank"
            rel="noreferrer"
            className="text-xs text-blue-300 hover:underline"
          >
            [source]
          </a>
        </div>
      </div>

      {/* Description */}
      <div className="mt-6 space-y-3">
        <p className="text-[color:var(--ink)]">
          {detail?.overview || resolvedMethod.reference}
        </p>
        <p className="text-sm text-[color:var(--muted)]">
          Read more in the{" "}
          <Link href={`/user-guide/methods/`} className="text-[color:var(--accent-strong)] hover:underline">
            User Guide
          </Link>.
        </p>
      </div>

      {/* Parameters Section (sklearn style) */}
      {parameters.length > 0 && (
        <section className="mt-8">
          <h2 className="text-lg font-bold border-b border-[color:var(--border)] pb-2">Parameters</h2>
          <dl className="mt-4 space-y-4">
            {parameters.map((param) => (
              <div key={param.name} className="grid grid-cols-[160px_1fr] gap-4">
                <dt>
                  <code className="font-bold text-[color:var(--ink)]">{param.name}</code>
                  <span className="text-[color:var(--muted)]"> : </span>
                  <span className="text-sm text-[color:var(--accent-strong)]">{param.type}</span>
                  {param.default !== "Required" && (
                    <span className="text-sm text-[color:var(--muted)]"> = {param.default}</span>
                  )}
                </dt>
                <dd className="text-sm text-[color:var(--muted)]">{param.description}</dd>
              </div>
            ))}
          </dl>
        </section>
      )}

      {/* Attributes Section */}
      {attributes.length > 0 && (
        <section className="mt-8">
          <h2 className="text-lg font-bold border-b border-[color:var(--border)] pb-2">Attributes</h2>
          <dl className="mt-4 space-y-4">
            {attributes.map((attr) => (
              <div key={attr.name} className="grid grid-cols-[160px_1fr] gap-4">
                <dt>
                  <code className="font-bold text-[color:var(--ink)]">{attr.name}</code>
                  <span className="text-[color:var(--muted)]"> : </span>
                  <span className="text-sm text-[color:var(--accent-strong)]">{attr.type}</span>
                </dt>
                <dd className="text-sm text-[color:var(--muted)]">{attr.description}</dd>
              </div>
            ))}
          </dl>
        </section>
      )}

      {/* Methods Section */}
      {methods.length > 0 && (
        <section className="mt-8">
          <h2 className="text-lg font-bold border-b border-[color:var(--border)] pb-2">Methods</h2>
          <div className="mt-4 overflow-hidden rounded-lg border border-[color:var(--border)]">
            <table className="w-full text-sm">
              <tbody>
                {methods.map((m) => (
                  <tr key={m.name} className="border-b border-[color:var(--border)] last:border-0">
                    <td className="px-4 py-3 font-mono text-[color:var(--accent-strong)]">{m.signature}</td>
                    <td className="px-4 py-3 text-[color:var(--muted)]">{m.description}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* See Also */}
      <section className="mt-8">
        <h2 className="text-lg font-bold border-b border-[color:var(--border)] pb-2">See Also</h2>
        <div className="mt-4 space-y-2">
          <div>
            <Link href="/methods/MSTL/" className="text-[color:var(--accent-strong)] hover:underline font-mono">
              MSTL
            </Link>
            <span className="text-sm text-[color:var(--muted)]"> : Multi-seasonal STL for multiple periods.</span>
          </div>
          <div>
            <Link href="/methods/VMD/" className="text-[color:var(--accent-strong)] hover:underline font-mono">
              VMD
            </Link>
            <span className="text-sm text-[color:var(--muted)]"> : Variational Mode Decomposition for non-stationary signals.</span>
          </div>
          <div>
            <Link href="/methods/SSA/" className="text-[color:var(--accent-strong)] hover:underline font-mono">
              SSA
            </Link>
            <span className="text-sm text-[color:var(--muted)]"> : Singular Spectrum Analysis for subspace decomposition.</span>
          </div>
        </div>
      </section>

      {/* Examples */}
      {detail?.code && detail.code.length > 0 && (
        <section className="mt-8">
          <h2 className="text-lg font-bold border-b border-[color:var(--border)] pb-2">Examples</h2>
          <div className="mt-4 space-y-4">
            {detail.code.map((block) => (
              <div key={block.title}>
                <p className="text-sm text-[color:var(--muted)] mb-2">{block.title}</p>
                <pre className="overflow-x-auto rounded-lg bg-[color:var(--ink)] p-4 text-sm text-white">
                  {block.code}
                </pre>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Benchmark Performance */}
      <section className="mt-8">
        <h2 className="text-lg font-bold border-b border-[color:var(--border)] pb-2">Benchmark Performance</h2>
        <div className="mt-4 overflow-hidden rounded-lg border border-[color:var(--border)]">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-xs uppercase text-[color:var(--muted)]">
              <tr>
                <th className="px-4 py-3 text-left">Tier</th>
                <th className="px-4 py-3 text-left">Trend R²</th>
                <th className="px-4 py-3 text-left">Spectral Corr</th>
                <th className="px-4 py-3 text-left">Max-lag Corr</th>
              </tr>
            </thead>
            <tbody>
              {tierStats.map((stat) => (
                <tr key={stat.tier} className="border-t border-[color:var(--border)]">
                  <td className="px-4 py-3">Tier {stat.tier}</td>
                  {"empty" in stat ? (
                    <td className="px-4 py-3 text-[color:var(--muted)]" colSpan={3}>
                      No benchmark data
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
        <p className="mt-3 text-xs text-[color:var(--muted)]">
          Cross-tier drops often indicate period drift or regime shifts. See{" "}
          <Link href="/leaderboard/" className="text-[color:var(--accent-strong)] hover:underline">
            full leaderboard
          </Link>{" "}
          for scenario breakdowns.
        </p>
      </section>

      {/* Mathematical Formulation (collapsed) */}
      {detail && (
        <section className="mt-8">
          <h2 className="text-lg font-bold border-b border-[color:var(--border)] pb-2">Mathematical Formulation</h2>
          <div className="mt-4 space-y-4">
            {detail.equations.map((equation) => (
              <div key={equation.title} className="rounded-lg border border-[color:var(--border)] p-4">
                <p className="text-xs font-semibold uppercase text-[color:var(--muted)] mb-2">
                  {equation.title}
                </p>
                <MathBlock latex={equation.latex} className="mt-2" />
              </div>
            ))}
            {detail.assumptions?.length ? (
              <div className="rounded-lg bg-gray-50 p-4 text-sm">
                <p className="font-semibold text-[color:var(--ink)]">Implicit Assumptions</p>
                <ul className="mt-2 space-y-1 text-[color:var(--muted)] list-disc list-inside">
                  {detail.assumptions.map((assumption) => (
                    <li key={assumption}>{assumption}</li>
                  ))}
                </ul>
              </div>
            ) : null}
          </div>
        </section>
      )}

      {/* Figures */}
      {detail?.figures?.length ? (
        <section className="mt-8">
          <h2 className="text-lg font-bold border-b border-[color:var(--border)] pb-2">Figures</h2>
          <div className="mt-4 grid gap-6 md:grid-cols-2">
            {detail.figures.map((figure) => (
              <figure key={figure.src} className="rounded-lg border border-[color:var(--border)] p-4">
                <img
                  src={`${BASE_PATH}${figure.src}`}
                  alt={figure.caption}
                  className="w-full rounded-lg"
                />
                <figcaption className="mt-2 text-xs text-center text-[color:var(--muted)]">
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
