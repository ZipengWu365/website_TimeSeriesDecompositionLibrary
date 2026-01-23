import Link from "next/link";
import { FigureCard } from "@/components/figure-card";

const flowchartFigure = {
  src: "/figs/fig10_flowchart_1766848383670.png",
  caption: "End-to-end experiment pipeline from data generation to reporting.",
};

export default function ExperimentsPage() {
  return (
    <div className="mx-auto w-full max-w-6xl px-6 pb-20 pt-12">
      <div className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[color:var(--muted)]">
          Experiments
        </p>
        <h1 className="text-3xl font-semibold md:text-4xl">
          Plans, logs, and reports.
        </h1>
        <p className="text-sm text-[color:var(--muted)]">
          This page consolidates the experiment roadmap, smoke tests, and symbolic
          regression pipeline decisions.
        </p>
      </div>

      <section className="mt-10 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="rounded-3xl border border-[color:var(--border)] bg-white/90 p-6 shadow-[var(--shadow)]">
          <h2 className="text-xl font-semibold">Executive summary</h2>
          <ul className="mt-4 space-y-2 text-sm text-[color:var(--muted)]">
            <li>ND2 consistently recovers clean trend expressions on composite signals.</li>
            <li>STL and MSTL remain strong baselines for stationary seasonal data.</li>
            <li>Data-driven DR_TS_REG shows promise in early smoke tests; DR_TS_AE needs more training.</li>
          </ul>
        </div>
        <FigureCard src={flowchartFigure.src} caption={flowchartFigure.caption} />
      </section>

      <section className="mt-12 space-y-4">
        <h2 className="text-2xl font-semibold">Decomposition benchmark V1</h2>
        <p className="text-sm text-[color:var(--muted)]">
          Thirteen classical methods were evaluated across six scenarios. STL-family
          methods excel in stationary settings but degrade under regime switches and
          frequency drift.
        </p>
      </section>

      <section className="mt-10 space-y-4">
        <h2 className="text-2xl font-semibold">Data-driven methods V2 (smoke)</h2>
        <p className="text-sm text-[color:var(--muted)]">
          Early validation focused on DR_TS_AE and DR_TS_REG with limited scenarios.
        </p>
        <div className="overflow-hidden rounded-2xl border border-[color:var(--border)]">
          <table className="w-full text-left text-sm">
            <thead className="bg-[color:var(--bg)]/70 text-xs uppercase tracking-[0.2em] text-[color:var(--muted)]">
              <tr>
                <th className="px-4 py-3">Method</th>
                <th className="px-4 py-3">Scenario</th>
                <th className="px-4 py-3">Trend R2</th>
                <th className="px-4 py-3">Season R2</th>
                <th className="px-4 py-3">Notes</th>
              </tr>
            </thead>
            <tbody>
              {[
                ["DR_TS_AE", "trend_only_linear", "0.986", "n/a", "Matches classical baselines"],
                ["DR_TS_REG", "trend_only_linear", "0.673", "n/a", "Needs tuning"],
                ["DR_TS_AE", "trend_plus_single_sine", "0.492", "0.065", "Underfitting"],
                ["DR_TS_REG", "trend_plus_single_sine", "0.924", "0.954", "Promising separation"],
              ].map((row) => (
                <tr key={row.join("-")} className="border-t border-[color:var(--border)]">
                  {row.map((cell) => (
                    <td key={cell} className="px-4 py-3">
                      {cell}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="mt-12 space-y-4">
        <h2 className="text-2xl font-semibold">Symbolic regression benchmark</h2>
        <p className="text-sm text-[color:var(--muted)]">
          ND2 versus GPlearn comparisons run on composite trend + seasonal scenarios.
          ND2 is more accurate but needs a minor wrapper fix for pipeline metrics.
        </p>
        <div className="overflow-hidden rounded-2xl border border-[color:var(--border)]">
          <table className="w-full text-left text-sm">
            <thead className="bg-[color:var(--bg)]/70 text-xs uppercase tracking-[0.2em] text-[color:var(--muted)]">
              <tr>
                <th className="px-4 py-3">Metric</th>
                <th className="px-4 py-3">ND2</th>
                <th className="px-4 py-3">GPlearn</th>
              </tr>
            </thead>
            <tbody>
              {[
                ["Success rate (R2 > 0.8)", "88%", "0%"],
                ["Mean trend R2", "0.865", "-2.48"],
                ["Runtime per sample", "~60s (GPU)", "~24s (CPU)"],
                ["Structural recovery", "High", "Low"],
              ].map((row) => (
                <tr key={row.join("-")} className="border-t border-[color:var(--border)]">
                  {row.map((cell) => (
                    <td key={cell} className="px-4 py-3">
                      {cell}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="rounded-2xl border border-[color:var(--border)] bg-[color:var(--bg)]/70 p-4 text-xs text-[color:var(--muted)]">
          <p className="font-semibold text-[color:var(--ink)]">Pipeline note</p>
          <p className="mt-2">
            ND2 runs completed successfully but the wrapper missed an MSE field, which
            caused automated validation to report zero success. Fixing the wrapper resolves this.
          </p>
        </div>
      </section>

      <section className="mt-12 space-y-4">
        <h2 className="text-2xl font-semibold">ND2 integration plan</h2>
        <p className="text-sm text-[color:var(--muted)]">
          ND2 is adapted for time series regression by treating time as a single-node variable.
          Decomposition can be applied first, then ND2 fits trend and seasonal components separately.
        </p>
        <div className="grid gap-4 md:grid-cols-2">
          {[
            ["Direct ND2", "Fit ND2 directly on y(t) with time as the only variable."],
            ["Decomp + ND2", "Decompose y = T + S, then fit ND2 to T(t) and S(t) separately."],
            ["Hardware", "GPU is required for ND2 inference; runs are batched lightly."],
            ["Metrics", "R2, MSE, mechanism score, and runtime per task."],
          ].map((item) => (
            <div
              key={item[0]}
              className="rounded-2xl border border-[color:var(--border)] bg-white/90 p-4 text-sm text-[color:var(--muted)]"
            >
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[color:var(--muted)]">
                {item[0]}
              </p>
              <p className="mt-2">{item[1]}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-12 space-y-4">
        <h2 className="text-2xl font-semibold">SR benchmark design</h2>
        <p className="text-sm text-[color:var(--muted)]">
          The symbolic regression benchmark reuses the synthetic generator and records
          ground-truth expressions for trend and seasonality.
        </p>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-2xl border border-[color:var(--border)] bg-white/90 p-4 text-sm text-[color:var(--muted)]">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[color:var(--muted)]">
              Scenario tiers
            </p>
            <ul className="mt-2 space-y-1">
              <li>Level 1: trend-only families (linear, poly, exp, logistic).</li>
              <li>Level 2: cycle-only families (single sine, multi-harmonic).</li>
              <li>Level 3: trend + cycle composites with drift and noise.</li>
              <li>Level 4-5: multi-cycle and noise stress tests.</li>
            </ul>
          </div>
          <div className="rounded-2xl border border-[color:var(--border)] bg-white/90 p-4 text-sm text-[color:var(--muted)]">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[color:var(--muted)]">
              Metrics
            </p>
            <ul className="mt-2 space-y-1">
              <li>Numerical fit: R2, MSE, NMSE, Pearson.</li>
              <li>Expression quality: complexity, mechanism score, runtime.</li>
              <li>Baseline methods: ND2, GPlearn, PySR, PSRN (when available).</li>
            </ul>
          </div>
        </div>
      </section>

      <section className="mt-12 space-y-4">
        <h2 className="text-2xl font-semibold">Data-driven decomposition plan</h2>
        <p className="text-sm text-[color:var(--muted)]">
          Three planned method families are documented with shared evaluation metrics and
          scenario coverage.
        </p>
        <div className="grid gap-4 md:grid-cols-3">
          {[
            ["DR_TS_REG", "Convex trend/seasonal regularization with period penalties."],
            ["DR_TS_AE", "Structured autoencoder with trend and seasonal branches."],
            ["SL_LIB", "Sparse library retrieval over trend and seasonal bases."],
          ].map((item) => (
            <div
              key={item[0]}
              className="rounded-2xl border border-[color:var(--border)] bg-white/90 p-4 text-sm text-[color:var(--muted)]"
            >
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[color:var(--muted)]">
                {item[0]}
              </p>
              <p className="mt-2">{item[1]}</p>
              <Link
                href={`/methods/${item[0]}`}
                className="mt-3 inline-flex text-xs font-semibold text-[color:var(--accent-strong)]"
              >
                View method
              </Link>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-12 space-y-4">
        <h2 className="text-2xl font-semibold">Pipeline fairness rules</h2>
        <p className="text-sm text-[color:var(--muted)]">
          The decomposition + SR pipeline follows three alignment rules to keep comparisons fair.
        </p>
        <div className="grid gap-4 md:grid-cols-3">
          {[
            ["Operator set alignment", "Use the same operators for direct SR and decomp + SR."],
            ["Time budget alignment", "Enforce the same wall-clock budget per run."],
            ["Complexity alignment", "Cap expression nodes and depth consistently."],
          ].map((rule) => (
            <div
              key={rule[0]}
              className="rounded-2xl border border-[color:var(--border)] bg-white/90 p-4 text-sm text-[color:var(--muted)]"
            >
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[color:var(--muted)]">
                {rule[0]}
              </p>
              <p className="mt-2">{rule[1]}</p>
            </div>
          ))}
        </div>
        <div className="rounded-2xl border border-[color:var(--border)] bg-white/90 p-4 text-sm text-[color:var(--muted)]">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[color:var(--muted)]">
            Oracle baselines
          </p>
          <p className="mt-2">
            Oracle-SR fits symbolic models to ground-truth components. Oracle-Decomp evaluates
            decomposition alone. The ceiling uses true expressions for reference.
          </p>
        </div>
      </section>

      <section className="mt-12 space-y-4">
        <h2 className="text-2xl font-semibold">Experiment log snapshot</h2>
        <div className="grid gap-6 md:grid-cols-2">
          <div className="rounded-3xl border border-[color:var(--border)] bg-white/90 p-6 shadow-[var(--shadow)]">
            <h3 className="text-lg font-semibold">System configuration</h3>
            <ul className="mt-3 space-y-2 text-sm text-[color:var(--muted)]">
              <li>CPU: Intel Xeon Platinum 8360Y</li>
              <li>Cores: 144 (72 physical, dual socket)</li>
              <li>Memory: 503 GB RAM</li>
              <li>Python: 3.10.8</li>
            </ul>
          </div>
          <div className="rounded-3xl border border-[color:var(--border)] bg-white/90 p-6 shadow-[var(--shadow)]">
            <h3 className="text-lg font-semibold">Key notes</h3>
            <ul className="mt-3 space-y-2 text-sm text-[color:var(--muted)]">
              <li>GPlearn required scikit-learn 1.5.x for compatibility.</li>
              <li>No GPU available for SR runs in the log snapshot.</li>
              <li>Parallelization planned to use all available cores.</li>
            </ul>
          </div>
        </div>
      </section>

      <section className="mt-12 space-y-4">
        <h2 className="text-2xl font-semibold">Developer guide highlights</h2>
        <p className="text-sm text-[color:var(--muted)]">
          Synthetic series are generated with explicit trend, seasonal, event, and noise components.
        </p>
        <div className="grid gap-4 md:grid-cols-2">
          {[
            ["generator.py", "Core generation of trend, cycle, noise, and events."],
            ["scenarios.py", "Scenario registry and dataset factory."],
            ["plotting.py", "Component and spectrum visualization helpers."],
            ["tests", "Determinism and shape validation (recommended)."],
          ].map((item) => (
            <div
              key={item[0]}
              className="rounded-2xl border border-[color:var(--border)] bg-white/90 p-4 text-sm text-[color:var(--muted)]"
            >
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[color:var(--muted)]">
                {item[0]}
              </p>
              <p className="mt-2">{item[1]}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-12 space-y-4">
        <h2 className="text-2xl font-semibold">Reference papers</h2>
        <div className="grid gap-4 md:grid-cols-2">
          {[
            {
              label: "Seasonal-Trend-Dispersion Decomposition",
              href: "/resources/STD_A_Seasonal-Trend-Dispersion_Decomposition_of_Time_Series.pdf",
            },
            {
              label: "Latent seasonal-trend representations (NeurIPS 2022)",
              href: "/resources/NeurIPS-2022-learning-latent-seasonal-trend-representations-for-time-series-forecasting-Paper-Conference.pdf",
            },
            {
              label: "Reference: 2405.14616v1",
              href: "/resources/2405.14616v1.pdf",
            },
            {
              label: "Decomposition method analysis report (PDF)",
              href: "/resources/decomposition_method_analysis.pdf",
            },
          ].map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="rounded-2xl border border-[color:var(--border)] bg-white/90 px-4 py-3 text-sm font-semibold text-[color:var(--accent-strong)] shadow-[var(--shadow)]"
            >
              {item.label}
            </a>
          ))}
        </div>
      </section>
    </div>
  );
}
