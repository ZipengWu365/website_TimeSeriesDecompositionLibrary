import Link from "next/link";

export default function DocsPage() {
  return (
    <div className="mx-auto w-full max-w-6xl px-6 pb-20 pt-12">
      <div className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[color:var(--muted)]">
          Docs
        </p>
        <h1 className="text-3xl font-semibold md:text-4xl">Protocol, metrics, and API.</h1>
        <p className="text-sm text-[color:var(--muted)]">
          This benchmark aligns decomposition outputs into Trend / Seasonal / Residual with
          reproducible period injection and schema validation.
        </p>
      </div>

      <section className="mt-10 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="space-y-6">
          <article
            id="protocol"
            className="rounded-3xl border border-[color:var(--border)] bg-white/90 p-6 shadow-[var(--shadow)]"
          >
            <h2 className="text-xl font-semibold">Protocol</h2>
            <p className="mt-3 text-sm text-[color:var(--muted)]">
              Methods are aligned into a canonical Trend / Seasonal / Residual interface. Periods
              are injected explicitly to ensure fairness for algorithms that require them.
            </p>
            <ul className="mt-4 space-y-2 text-sm text-[color:var(--muted)]">
              <li>1) Map native outputs to T/S/R with clear attribution.</li>
              <li>2) Inject periods from scenario metadata or method config.</li>
              <li>3) Validate determinism and schema before export.</li>
            </ul>
          </article>

          <article
            id="metrics"
            className="rounded-3xl border border-[color:var(--border)] bg-white/90 p-6 shadow-[var(--shadow)]"
          >
            <h2 className="text-xl font-semibold">Metrics</h2>
            <div className="mt-3 grid gap-4 text-sm text-[color:var(--muted)]">
              <div>
                <p className="font-semibold text-[color:var(--ink)]">Trend R2</p>
                <p>Explains trend variance while penalizing drift-induced leakage.</p>
              </div>
              <div>
                <p className="font-semibold text-[color:var(--ink)]">Trend DTW</p>
                <p>Dynamic time warping distance for shape alignment under phase shifts.</p>
              </div>
              <div>
                <p className="font-semibold text-[color:var(--ink)]">Seasonal Spectral Corr</p>
                <p>Compares dominant frequencies to mitigate phase offset penalties.</p>
              </div>
              <div>
                <p className="font-semibold text-[color:var(--ink)]">Seasonal Max-lag Corr</p>
                <p>Max correlation over lags for interpreting phase alignment quality.</p>
              </div>
            </div>
          </article>

          <article
            id="diagnostic-patterns"
            className="rounded-3xl border border-[color:var(--border)] bg-white/90 p-6 shadow-[var(--shadow)]"
          >
            <h2 className="text-xl font-semibold">Diagnostic patterns</h2>
            <div className="mt-4 space-y-3 text-sm text-[color:var(--muted)]">
              <div>
                <p className="font-semibold text-[color:var(--ink)]">Pattern I</p>
                <p>Fixed period methods degrade under drift and noise bursts.</p>
              </div>
              <div>
                <p className="font-semibold text-[color:var(--ink)]">Pattern II</p>
                <p>Global bases fail during regime switches and trend breaks.</p>
              </div>
              <div>
                <p className="font-semibold text-[color:var(--ink)]">Pattern III</p>
                <p>Adaptive spectral/multiscale models trade variance for robustness.</p>
              </div>
            </div>
          </article>
        </div>

        <div className="space-y-6">
          <article
            id="period-injection"
            className="rounded-3xl border border-[color:var(--border)] bg-white/90 p-6 shadow-[var(--shadow)]"
          >
            <h2 className="text-xl font-semibold">Period injection</h2>
            <p className="mt-3 text-sm text-[color:var(--muted)]">
              Methods that require seasonal periods receive values from the scenario metadata.
              The injected periods are logged in <code>scenario_periods_json</code> for audit.
            </p>
          </article>

          <article
            id="api"
            className="rounded-3xl border border-[color:var(--border)] bg-white/90 p-6 shadow-[var(--shadow)]"
          >
            <h2 className="text-xl font-semibold">API surface</h2>
            <pre className="mt-3 whitespace-pre-wrap rounded-2xl bg-[color:var(--ink)]/95 p-4 text-xs text-white">
{`decompose(series, config) -> DecompResult
DecompositionConfig(periods, seed, length, ...)
DecompResult(trend, seasonal, residual)`}
            </pre>
          </article>

          <article
            id="cli"
            className="rounded-3xl border border-[color:var(--border)] bg-white/90 p-6 shadow-[var(--shadow)]"
          >
            <h2 className="text-xl font-semibold">CLI commands</h2>
            <pre className="mt-3 whitespace-pre-wrap rounded-2xl bg-[color:var(--ink)]/95 p-4 text-xs text-white">
{`python -m tsdecomp validate --suite core

python -m tsdecomp suite_run \\
  --suite core \\
  --methods stl,mstl \\
  --seed 0 --n_samples 40 --length 960

python -m tsdecomp export \\
  --in runs/ \\
  --format leaderboard_csv \\
  --out_file leaderboard_core.csv`}
            </pre>
            <p className="mt-3 text-sm text-[color:var(--muted)]">
              Need submission details? Visit{" "}
              <Link href="/submit" className="text-[color:var(--accent-strong)]">
                Submit
              </Link>
              .
            </p>
          </article>
        </div>
      </section>
    </div>
  );
}
