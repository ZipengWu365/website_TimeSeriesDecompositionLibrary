import Link from "next/link";

const navItems = [
  { href: "/", label: "Home" },
  { href: "/leaderboard", label: "Leaderboard" },
  { href: "/scenarios", label: "Scenarios" },
  { href: "/methods", label: "Methods" },
  { href: "/examples", label: "Examples" },
  { href: "/docs", label: "Documentation" },
  { href: "/api-reference", label: "API Reference" },
  { href: "/submit", label: "Submit" },
  { href: "/studio", label: "Studio" },
];

export function Sidebar() {
  return (
    <aside className="w-64 flex-shrink-0 border-r border-gray-200 bg-white min-h-screen hidden md:block">
      <div className="p-4">
        <nav className="space-y-1">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="block px-4 py-2 text-sm font-medium text-gray-700 rounded-md hover:bg-gray-100 hover:text-gray-900"
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
    </aside>
  );
}
