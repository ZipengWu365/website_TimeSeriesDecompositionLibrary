import Link from "next/link";

export default function StudioPage() {
  return (
    <div className="mx-auto w-full max-w-6xl px-6 pb-20 pt-12">
      <div className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[color:var(--muted)]">
          Studio
        </p>
        <h1 className="text-3xl font-semibold md:text-4xl">TSComp Studio (coming soon)</h1>
        <p className="text-sm text-[color:var(--muted)]">
          Studio will turn leaderboard exports into a structure summary card with diagnostics,
          failure signatures, and reproduce-ready commands.
        </p>
      </div>

      <section className="mt-10 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="rounded-3xl border border-[color:var(--border)] bg-white/90 p-6 shadow-[var(--shadow)]">
          <h2 className="text-xl font-semibold">Planned inputs</h2>
          <div className="mt-4 space-y-3 text-sm text-[color:var(--muted)]">
            <p>Leaderboard JSON exports (per suite and tier).</p>
            <p>Scenario metadata with injected periods and stressors.</p>
            <p>Method registry metadata for period requirements.</p>
          </div>
        </div>
        <div className="rounded-3xl border border-[color:var(--border)] bg-white/90 p-6 shadow-[var(--shadow)]">
          <h2 className="text-xl font-semibold">Planned outputs</h2>
          <div className="mt-4 space-y-3 text-sm text-[color:var(--muted)]">
            <p>Structure summary cards with trend/season diagnostics.</p>
            <p>Automatic links to scenarios that trigger each pattern.</p>
            <p>Copyable reproduce templates tied to each failure mode.</p>
          </div>
          <p className="mt-4 text-sm text-[color:var(--muted)]">
            Want to help? Share feedback via{" "}
            <Link href="/submit" className="text-[color:var(--accent-strong)]">
              Submit
            </Link>
            .
          </p>
        </div>
      </section>
    </div>
  );
}
