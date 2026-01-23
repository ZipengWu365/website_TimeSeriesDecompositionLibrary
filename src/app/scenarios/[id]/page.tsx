import ScenarioDetailClient from "@/app/scenarios/[id]/scenario-detail-client";
import { getScenarios } from "@/lib/data";

type ScenarioPageProps = {
  params: { id: string };
};

export async function generateStaticParams() {
  const scenarios = await getScenarios();
  return scenarios.scenarios.map((scenario) => ({ id: scenario.scenario_id }));
}

export const dynamicParams = false;
export const dynamic = "force-static";

export default function ScenarioDetailPage(_: ScenarioPageProps) {
  return <ScenarioDetailClient />;
}
