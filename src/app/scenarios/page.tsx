import { getScenarios, getSuites } from "@/lib/data";
import ScenariosClient from "@/app/scenarios/scenarios-client";

export default async function ScenariosPage() {
  const [scenarios, suites] = await Promise.all([getScenarios(), getSuites()]);

  return (
    <div className="mx-auto w-full max-w-6xl px-6 pb-20 pt-12">
      <div className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[color:var(--muted)]">
          Scenarios
        </p>
        <h1 className="text-3xl font-semibold md:text-4xl">Stress tests with causal intent.</h1>
        <p className="text-sm text-[color:var(--muted)]">
          Each scenario specifies a generation mechanism, tier, base periods, and the
          diagnostic pattern it targets.
        </p>
      </div>

      <ScenariosClient scenarios={scenarios.scenarios} suites={suites} />
    </div>
  );
}
