import Link from "next/link";

const FOOTER_LINKS = [
  { href: "/docs", label: "Protocol & Metrics" },
  { href: "/results", label: "Results" },
  { href: "/experiments", label: "Experiments" },
  { href: "/submit", label: "Submission Contract" },
  { href: "/scenarios", label: "Scenario Library" },
  { href: "/methods", label: "Method Registry" },
];

export function SiteFooter() {
  return (
    <footer className="relative z-10 border-t border-[color:var(--border)] bg-white/60 backdrop-blur">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-6 py-10 md:flex-row md:items-center md:justify-between">
        <div className="space-y-2">
          <p className="text-xs uppercase tracking-[0.2em] text-[color:var(--muted)]">
            Interpretable Time-Series Decomposition
          </p>
          <p className="text-sm text-[color:var(--muted)]">
            Component recovery benchmark for trend, seasonal, and residual diagnostics.
          </p>
        </div>
        <div className="flex flex-wrap gap-4 text-sm font-semibold text-[color:var(--muted)]">
          {FOOTER_LINKS.map((link) => (
            <Link key={link.href} href={link.href} className="transition hover:text-[color:var(--ink)]">
              {link.label}
            </Link>
          ))}
        </div>
      </div>
    </footer>
  );
}
