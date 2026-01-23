import Link from "next/link";

export default function Home() {
  return (
    <div className="mx-auto w-full max-w-6xl px-6 pb-20 pt-12">
      <section className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="space-y-6">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[color:var(--muted)]">
            TSComp benchmark for interpretable time-series decomposition
          </p>
          <h1 className="text-4xl font-semibold leading-tight md:text-5xl">
            Benchmark component recovery, not just forecasting error.
          </h1>
          <p className="text-lg text-[color:var(--muted)]">
            TSComp stress-tests trend, seasonal, and residual recovery across drift,
            regimes, and events. The toolkit is powered by tsdecomp so diagnostics stay
            reproducible and tier-wise.
          </p>
          <div className="flex flex-wrap gap-4">
            <Link
              href="/leaderboard"
              className="rounded-full bg-[color:var(--accent)] px-5 py-2 text-sm font-semibold text-white transition hover:bg-[color:var(--accent-strong)]"
            >
              Open the Leaderboard
            </Link>
            <Link
              href="/docs"
              className="rounded-full border border-[color:var(--border)] px-5 py-2 text-sm font-semibold text-[color:var(--muted)] transition hover:border-[color:var(--accent)] hover:text-[color:var(--accent-strong)]"
            >
              Read the Protocol
            </Link>
          </div>
          <div className="grid gap-4 pt-6 md:grid-cols-3">
            {[
              {
                title: "Component Recovery",
                body: "Score trend, seasonal, and residual accuracy separately to diagnose failures.",
              },
              {
                title: "Non-Stationary Stress",
                body: "Drift, regime switches, and sparse events expose brittle decomposition.",
              },
              {
                title: "Reproducible CLI",
                body: "Suite runs, export, and validation are a single command away.",
              },
            ].map((item) => (
              <div
                key={item.title}
                className="rounded-2xl border border-[color:var(--border)] bg-white/80 p-4 shadow-[var(--shadow)]"
              >
                <h3 className="text-base font-semibold">{item.title}</h3>
                <p className="mt-2 text-sm text-[color:var(--muted)]">{item.body}</p>
              </div>
            ))}
          </div>
        </div>
        <div className="rounded-3xl border border-[color:var(--border)] bg-white/80 p-6 shadow-[var(--shadow)]">
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[color:var(--muted)]">
            Quickstart
          </p>
          <h2 className="mt-3 text-2xl font-semibold">Run the core suite fast</h2>
          <p className="mt-2 text-sm text-[color:var(--muted)]">
            Start with a 60-second smoke run, then switch to the official settings for
            leaderboard snapshots.
          </p>
          <div className="mt-4 space-y-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[color:var(--muted)]">
                Smoke run (fast)
              </p>
              <pre className="mt-2 whitespace-pre-wrap rounded-2xl bg-[color:var(--ink)]/95 p-4 text-xs text-white">
{`pip install -e .

python -m tsdecomp suite_run \\
  --suite core \\
  --methods stl,ssa \\
  --seed 0 \\
  --n_samples 3 \\
  --length 256

python -m tsdecomp export \\
  --in runs/ \\
  --format leaderboard_csv \\
  --out_file leaderboard_core.csv`}
              </pre>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[color:var(--muted)]">
                Official core run
              </p>
              <pre className="mt-2 whitespace-pre-wrap rounded-2xl bg-[color:var(--ink)]/95 p-4 text-xs text-white">
{`python -m tsdecomp suite_run \\
  --suite core \\
  --methods stl,mstl,robust_stl,ssa,emd,ceemdan,vmd,wavelet \\
  --seed 0 \\
  --n_samples 40 \\
  --length 960

python -m tsdecomp export \\
  --in runs/ \\
  --format leaderboard_csv \\
  --out_file leaderboard_core.csv`}
              </pre>
            </div>
          </div>
          <p className="mt-4 text-sm text-[color:var(--muted)]">
            Exported CSV feeds directly into the leaderboard without any extra scripts.
          </p>
        </div>
      </section>

      <section className="mt-16 grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="rounded-3xl border border-[color:var(--border)] bg-white/80 p-6 shadow-[var(--shadow)]">
          <h2 className="text-2xl font-semibold">Benchmark narrative</h2>
          <p className="mt-3 text-sm text-[color:var(--muted)]">
            The benchmark is organized around diagnostic patterns: fixed-period
            methods collapse under drift, global bases miss regime switches, and
            adaptive spectral approaches trade bias for variance. The scenarios,
            leaderboard, and docs are aligned with the paper to keep the story cohesive.
          </p>
          <div className="mt-5 grid gap-4 md:grid-cols-3">
            {[
              { tag: "Pattern I", text: "Fixed period vs drift" },
              { tag: "Pattern II", text: "Global basis vs regime switch" },
              { tag: "Pattern III", text: "Adaptive spectral multiscale" },
            ].map((item) => (
              <div
                key={item.tag}
                className="rounded-2xl border border-[color:var(--border)] bg-white/90 p-4"
              >
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[color:var(--muted)]">
                  {item.tag}
                </p>
                <p className="mt-2 text-sm font-semibold">{item.text}</p>
              </div>
            ))}
          </div>
        </div>
        <div className="space-y-6">
          <div className="rounded-3xl border border-[color:var(--border)] bg-white/80 p-6 shadow-[var(--shadow)]">
            <h3 className="text-lg font-semibold">How to cite</h3>
            <pre className="mt-3 whitespace-pre-wrap rounded-2xl bg-[#0f1418] p-4 text-xs text-white">
{`@misc{tscomp2026,
  title={TSComp: Interpretable Time-Series Decomposition as Component Recovery},
  author={Anonymous Authors},
  year={2026},
  note={Under review.}
}`}
            </pre>
          </div>
          <div className="rounded-3xl border border-[color:var(--border)] bg-white/80 p-6 shadow-[var(--shadow)]">
            <h3 className="text-lg font-semibold">Changelog</h3>
            <ul className="mt-3 space-y-2 text-sm text-[color:var(--muted)]">
              <li>v0.0.0 - Initial core + full suite scaffolding.</li>
              <li>v0.1.0 - Adds diagnostics for regime switching scenarios.</li>
              <li>v0.2.0 - Planned: artifact export + seed replay bundles.</li>
            </ul>
          </div>
        </div>
      </section>
    </div>
  );
}
