"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import type { Scenario, SuitesFile } from "@/lib/schemas";

type ScenariosClientProps = {
  scenarios: Scenario[];
  suites: SuitesFile;
};

export default function ScenariosClient({ scenarios, suites }: ScenariosClientProps) {
  const [query, setQuery] = useState("");

  const scenarioSuites = useMemo(() => {
    const map = new Map<string, string[]>();
    for (const suite of suites.suites) {
      for (const scenarioId of suite.scenario_ids) {
        const current = map.get(scenarioId) ?? [];
        current.push(suite.suite_id);
        map.set(scenarioId, current);
      }
    }
    return map;
  }, [suites]);

  const filtered = useMemo(() => {
    return scenarios.filter((scenario) => {
      if (query.trim()) {
        const q = query.toLowerCase();
        return (
          scenario.scenario_id.toLowerCase().includes(q) ||
          scenario.description.toLowerCase().includes(q) ||
          scenario.tags.some((tag) => tag.toLowerCase().includes(q))
        );
      }
      return true;
    });
  }, [scenarios, query]);

  return (
    <section className="mt-10 space-y-6">
      <div className="flex flex-wrap items-center gap-3 rounded-3xl border border-[color:var(--border)] bg-white/85 p-5 shadow-[var(--shadow)]">
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search scenario, tag, or description"
          className="min-w-[240px] flex-1 rounded-full border border-[color:var(--border)] px-4 py-2 text-sm"
        />
        <span className="text-xs font-semibold uppercase tracking-[0.2em] text-[color:var(--muted)]">
          {filtered.length} scenarios
        </span>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {filtered.map((scenario) => (
          <Link
            key={scenario.scenario_id}
            href={`/scenarios/${scenario.scenario_id}`}
            className="rounded-3xl border border-[color:var(--border)] bg-white/90 p-5 shadow-[var(--shadow)] transition hover:-translate-y-0.5 hover:border-[color:var(--accent)]"
          >
            <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-[0.2em] text-[color:var(--muted)]">
              <span>{scenario.scenario_id}</span>
            </div>
            <h3 className="mt-3 text-lg font-semibold">{scenario.family}</h3>
            <p className="mt-2 text-sm text-[color:var(--muted)]">{scenario.description}</p>
            <div className="mt-4 flex flex-wrap gap-2 text-xs text-[color:var(--muted)]">
              <span className="rounded-full border border-[color:var(--border)] px-3 py-1">
                periods: {scenario.base_periods.length ? scenario.base_periods.join(", ") : "none"}
              </span>
              {scenario.tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full border border-[color:var(--border)] px-3 py-1"
                >
                  {tag}
                </span>
              ))}
            </div>
            <div className="mt-3 text-xs text-[color:var(--muted)]">
              Stressors: {scenario.stressors.join(", ")}
            </div>
            <div className="mt-4 text-xs text-[color:var(--muted)]">
              Suites: {(scenarioSuites.get(scenario.scenario_id) ?? []).join(", ").toUpperCase()}
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
