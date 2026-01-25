import Link from "next/link";
import { DATA_VERSION } from "@/lib/constants";

const NAV_ITEMS = [
  { href: "/", label: "Overview" },
  { href: "/leaderboard", label: "Leaderboard" },
  { href: "/scenarios", label: "Scenarios" },
  { href: "/methods", label: "Methods" },
  { href: "/examples", label: "Examples" },
  { href: "/docs", label: "Docs" },
  { href: "/api-reference", label: "API Reference" },
  { href: "/submit", label: "Submit" },
  { href: "/studio", label: "Studio" },
];

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-20 border-b border-[color:var(--border)] bg-[color:var(--bg)]">
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-6 py-3">
        <div className="flex items-center gap-4">
          <Link href="/" className="flex items-center gap-2">
            {/* Logo placeholder if needed, using text for now */}
            <span className="text-xl font-bold tracking-tight text-[color:var(--accent-orange)]">tsdecomp</span>
          </Link>
          <span className="hidden md:inline-block h-6 w-px bg-[color:var(--border)]"></span>
          <span className="text-sm font-medium text-[color:var(--muted)]">
            v{DATA_VERSION}
          </span>
        </div>

        <div className="flex-1" />

        <div className="flex items-center gap-4 text-sm">
          {/* Search could go here */}
          <div className="hidden md:flex items-center gap-4">
            <Link href="https://github.com/ZipengWu365/TS-component-structure-Recover-library" target="_blank" className="text-[color:var(--ink)] hover:text-[color:var(--accent)]">
              GitHub
            </Link>
          </div>
          {/* Mobile menu detail kept simple */}
          <details className="relative md:hidden">
            <summary className="cursor-pointer list-none font-medium text-[color:var(--ink)]">
              Menu
            </summary>
            <div className="absolute right-0 top-10 w-48 rounded-md border border-[color:var(--border)] bg-white py-2 shadow-lg">
              {NAV_ITEMS.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="block px-4 py-2 hover:bg-[color:var(--surface)] hover:text-[color:var(--accent)]"
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </details>
        </div>
      </div>
    </header>
  );
}
