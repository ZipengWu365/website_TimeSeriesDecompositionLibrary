import { notFound } from "next/navigation";
import Link from "next/link";
import { getLeaderboard, getMethods } from "@/lib/data";
import { BASE_PATH } from "@/lib/constants";
import { METHOD_DETAILS } from "@/lib/method-details";

type MethodPageProps = {
  params: { id: string };
};

export async function generateStaticParams() {
  const methods = await getMethods();
  return methods.methods.map((method) => ({ id: method.method_name }));
}

export default async function MethodDetailPage({ params }: MethodPageProps) {
  const [methods, leaderboard] = await Promise.all([getMethods(), getLeaderboard("core")]);
  const method = methods.methods.find((item) => item.method_name === params.id);
  if (!method) {
    notFound();
  }

  const rows = leaderboard.rows.filter((row) => row.method_name === method.method_name);
  const detail = METHOD_DETAILS[method.method_name];
  const tierStats = [1, 2, 3].map((tier) => {
    const tierRows = rows.filter((row) => row.tier === tier);
    if (!tierRows.length) {
      return { tier, empty: true as const };
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
          Method {method.method_name}
        </p>
        <h1 className="text-3xl font-semibold md:text-4xl">{method.display_name}</h1>
        <p className="text-sm text-[color:var(--muted)]">{method.reference}</p>
      </div>

      <section className="mt-10 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="rounded-3xl border border-[color:var(--border)] bg-white/90 p-6 shadow-[var(--shadow)]">
          <h2 className="text-xl font-semibold">Wrapper details</h2>
          <div className="mt-4 space-y-3 text-sm text-[color:var(--muted)]">
            <p>
              Wrapper path: <span className="font-semibold text-[color:var(--ink)]">{method.wrapper_path}</span>
            </p>
            <p>
              Period injection:{" "}
              <span className="font-semibold text-[color:var(--ink)]">
                {method.needs_period ? "Required" : "Not required"}
              </span>
            </p>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em]">Default config</p>
              <pre className="mt-2 whitespace-pre-wrap rounded-2xl bg-[color:var(--ink)]/95 p-4 text-xs text-white">
                {JSON.stringify(method.default_config, null, 2)}
              </pre>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em]">Expected strengths</p>
              <p className="mt-2">{method.expected_strengths.join(", ")}</p>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em]">Known signatures</p>
              <p className="mt-2">{method.known_signatures.join(", ")}</p>
            </div>
          </div>
          <div className="mt-6 text-sm text-[color:var(--muted)]">
            See{" "}
            <Link href={`${BASE_PATH}/docs#period-injection`} className="text-[color:var(--accent-strong)]">
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
              <Link href={`${BASE_PATH}/leaderboard/`} className="text-[color:var(--accent-strong)]">
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
                <div key={equation.title} className="rounded-2xl border border-[color:var(--border)] p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[color:var(--muted)]">
                    {equation.title}
                  </p>
                  <pre className="mt-2 whitespace-pre-wrap rounded-xl bg-[color:var(--ink)]/95 p-3 text-xs text-white">
                    {equation.latex}
                  </pre>
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
