import Link from "next/link";

export default function SubmitPage() {
  return (
    <div className="mx-auto w-full max-w-6xl px-6 pb-20 pt-12">
      <div className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[color:var(--muted)]">
          Submit
        </p>
        <h1 className="text-3xl font-semibold md:text-4xl">Contribution protocol</h1>
        <p className="text-sm text-[color:var(--muted)]">
          Submissions are PR-based with strict schema validation, deterministic checks, and
          period injection enforcement.
        </p>
      </div>

      <section className="mt-10 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="space-y-6">
          <article className="rounded-3xl border border-[color:var(--border)] bg-white/90 p-6 shadow-[var(--shadow)]">
            <h2 className="text-xl font-semibold">Submission steps</h2>
            <div className="mt-4 space-y-3 text-sm text-[color:var(--muted)]">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[color:var(--muted)]">
                  Step 1
                </p>
                <p className="mt-1">
                  Fork the repo and add a wrapper under <code>tsdecomp/methods/</code>.
                </p>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[color:var(--muted)]">
                  Step 2
                </p>
                <p className="mt-1">
                  Run <code>python -m tsdecomp validate --suite core</code>.
                </p>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[color:var(--muted)]">
                  Step 3
                </p>
                <p className="mt-1">
                  Run <code>python -m tsdecomp suite_run --suite core --methods your_method</code>.
                </p>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[color:var(--muted)]">
                  Step 4
                </p>
                <p className="mt-1">
                  Export CSV via{" "}
                  <code>python -m tsdecomp export --in runs/ --format leaderboard_csv --out_file leaderboard.csv</code>.
                </p>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[color:var(--muted)]">
                  Step 5
                </p>
                <p className="mt-1">
                  Add <code>submissions/your_method/vX.Y.Z/leaderboard.csv</code> and open a PR.
                </p>
              </div>
            </div>
          </article>

          <article className="rounded-3xl border border-[color:var(--border)] bg-white/90 p-6 shadow-[var(--shadow)]">
            <h2 className="text-xl font-semibold">Schema contract (v1)</h2>
            <div className="mt-4 space-y-3 text-sm text-[color:var(--muted)]">
              <p className="font-semibold text-[color:var(--ink)]">Required</p>
              <p>
                suite_version, scenario_id, tier, seed, method_name, method_config_json,
                metric_T_r2, metric_T_dtw, metric_S_spectral_corr, metric_S_maxlag_corr
              </p>
              <p className="font-semibold text-[color:var(--ink)]">Recommended</p>
              <p>
                length, timestamp, package_version, git_commit, scenario_periods_json
              </p>
            </div>
          </article>
        </div>

        <div className="space-y-6">
          <article className="rounded-3xl border border-[color:var(--border)] bg-white/90 p-6 shadow-[var(--shadow)]">
            <h2 className="text-xl font-semibold">CI validation</h2>
            <div className="mt-4 space-y-3 text-sm text-[color:var(--muted)]">
              <div>Schema compliance + required fields present.</div>
              <div>Suite version matches current benchmark tag.</div>
              <div>Method name is snake_case and registered in registry.</div>
              <div>Deterministic rerun on a random subset of scenarios.</div>
              <div>Period injection verified (no hidden leakage).</div>
            </div>
          </article>

          <article className="rounded-3xl border border-[color:var(--border)] bg-white/90 p-6 shadow-[var(--shadow)]">
            <h2 className="text-xl font-semibold">Reproduce template</h2>
            <pre className="mt-3 whitespace-pre-wrap rounded-2xl bg-[color:var(--ink)]/95 p-4 text-xs text-white">
{`python -m tsdecomp suite_run \\
  --suite core \\
  --methods your_method \\
  --seed 0 \\
  --n_samples 40 \\
  --length 960`}
            </pre>
            <p className="mt-3 text-sm text-[color:var(--muted)]">
              See <Link href="/docs" className="text-[color:var(--accent-strong)]">Docs</Link> for protocol
              alignment and API details.
            </p>
          </article>
        </div>
      </section>
    </div>
  );
}
