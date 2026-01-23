import Link from "next/link";
import { DATA_VERSION } from "@/lib/constants";

const NAV_ITEMS = [
  { href: "/", label: "Overview" },
  { href: "/leaderboard", label: "Leaderboard" },
  { href: "/scenarios", label: "Scenarios" },
  { href: "/methods", label: "Methods" },
  { href: "/results", label: "Results" },
  { href: "/experiments", label: "Experiments" },
  { href: "/docs", label: "Docs" },
  { href: "/submit", label: "Submit" },
];

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-20 border-b border-[color:var(--border)] bg-white/70 backdrop-blur">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-4">
        <div className="flex items-center gap-3">
          <Link href="/" className="text-lg font-semibold uppercase tracking-[0.18em]">
            TSDecomp
          </Link>
          <span className="rounded-full border border-[color:var(--border)] px-2 py-1 text-xs uppercase tracking-[0.18em] text-[color:var(--muted)]">
            {DATA_VERSION}
          </span>
        </div>
        <nav className="hidden items-center gap-5 text-sm font-semibold text-[color:var(--muted)] md:flex">
          {NAV_ITEMS.map((item) => (
            <Link key={item.href} href={item.href} className="transition hover:text-[color:var(--ink)]">
              {item.label}
            </Link>
          ))}
        </nav>
        <details className="relative md:hidden">
          <summary className="cursor-pointer rounded-full border border-[color:var(--border)] px-3 py-2 text-xs font-semibold text-[color:var(--muted)]">
            Menu
          </summary>
          <div className="absolute right-0 top-12 w-44 rounded-2xl border border-[color:var(--border)] bg-white p-3 text-sm shadow-[var(--shadow)]">
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="block rounded-lg px-2 py-2 text-[color:var(--muted)] hover:text-[color:var(--ink)]"
              >
                {item.label}
              </Link>
            ))}
          </div>
        </details>
        <div className="flex items-center gap-3 text-sm">
          <Link
            href="/leaderboard"
            className="rounded-full border border-[color:var(--accent)] px-4 py-2 font-semibold text-[color:var(--accent-strong)] transition hover:bg-[color:var(--accent)] hover:text-white"
          >
            View Core Suite
          </Link>
        </div>
      </div>
    </header>
  );
}
