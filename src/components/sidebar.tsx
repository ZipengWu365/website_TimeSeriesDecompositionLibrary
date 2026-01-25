import Link from "next/link";

const navItems = [
  { href: "/", label: "Home" },
  { href: "/user-guide", label: "User Guide" },
  { href: "/leaderboard", label: "Leaderboard" },
  { href: "/scenarios", label: "Scenarios" },
  { href: "/methods", label: "Methods" },
  { href: "/examples", label: "Examples" },
  { href: "/docs", label: "Documentation" },
  { href: "/api-reference", label: "API Reference" },
  { href: "/submit", label: "Submit" },
];

export function Sidebar() {
  return (
    <aside className="w-64 flex-shrink-0 border-r border-[color:var(--border)] bg-[color:var(--surface)] min-h-screen hidden md:block">
      <div className="py-6 px-4">
        <nav className="space-y-1">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="block px-3 py-2 text-[15px] text-[color:var(--ink)] hover:bg-[color:var(--bg)] hover:text-[color:var(--accent)] border-l-2 border-transparent hover:border-[color:var(--accent)] transition-colors rounded-r-md"
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
    </aside>
  );
}
