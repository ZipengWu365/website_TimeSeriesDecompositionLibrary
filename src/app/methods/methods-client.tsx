"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import type { Method } from "@/lib/schemas";

type MethodsClientProps = {
  methods: Method[];
};

export default function MethodsClient({ methods }: MethodsClientProps) {
  const [query, setQuery] = useState("");
  const [periodFilter, setPeriodFilter] = useState<"all" | "needs" | "free">("all");

  const filtered = useMemo(() => {
    return methods.filter((method) => {
      if (periodFilter === "needs" && !method.needs_period) {
        return false;
      }
      if (periodFilter === "free" && method.needs_period) {
        return false;
      }
      if (query.trim()) {
        const q = query.toLowerCase();
        return (
          method.method_name.toLowerCase().includes(q) ||
          method.display_name.toLowerCase().includes(q) ||
          method.expected_strengths.some((item) => item.toLowerCase().includes(q))
        );
      }
      return true;
    });
  }, [methods, periodFilter, query]);

  return (
    <section className="mt-10 space-y-6">
      <div className="flex flex-wrap items-center gap-3 rounded-3xl border border-[color:var(--border)] bg-white/85 p-5 shadow-[var(--shadow)]">
        <select
          value={periodFilter}
          onChange={(event) => setPeriodFilter(event.target.value as "all" | "needs" | "free")}
          className="rounded-full border border-[color:var(--border)] bg-white px-4 py-2 text-sm font-semibold"
        >
          <option value="all">All methods</option>
          <option value="needs">Needs period</option>
          <option value="free">Period-free</option>
        </select>
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search method or signature"
          className="min-w-[240px] flex-1 rounded-full border border-[color:var(--border)] px-4 py-2 text-sm"
        />
        <span className="text-xs font-semibold uppercase tracking-[0.2em] text-[color:var(--muted)]">
          {filtered.length} methods
        </span>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {filtered.map((method) => (
          <Link
            key={method.method_name}
            href={`/methods/${method.method_name}/`}
            className="rounded-3xl border border-[color:var(--border)] bg-white/90 p-5 shadow-[var(--shadow)] transition hover:-translate-y-0.5 hover:border-[color:var(--accent)]"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">{method.display_name}</h3>
              <span className="text-xs font-semibold text-[color:var(--muted)]">
                {method.needs_period ? "needs period" : "period-free"}
              </span>
            </div>
            <p className="mt-2 text-xs text-[color:var(--muted)]">{method.reference}</p>
            <div className="mt-4 flex flex-wrap gap-2 text-xs text-[color:var(--muted)]">
              {method.expected_strengths.map((strength) => (
                <span
                  key={strength}
                  className="rounded-full border border-[color:var(--border)] px-3 py-1"
                >
                  {strength}
                </span>
              ))}
            </div>
            <p className="mt-4 text-sm text-[color:var(--muted)]">
              Known signature: {method.known_signatures.join(", ")}
            </p>
          </Link>
        ))}
      </div>
    </section>
  );
}
