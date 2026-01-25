import "server-only";

import { cache } from "react";
import path from "node:path";
import fs from "node:fs/promises";
import {
  LeaderboardFile,
  LeaderboardFileSchema,
  MethodsFile,
  MethodsFileSchema,
  SrFormulaExamplesFile,
  SrFormulaExamplesFileSchema,
  ApiReferenceFile,
  ApiReferenceFileSchema,
  ScenariosFile,
  ScenariosFileSchema,
  ScenarioSeriesFile,
  ScenarioSeriesFileSchema,
  SuitesFile,
  SuitesFileSchema,
} from "@/lib/schemas";
import { DATA_VERSION } from "@/lib/constants";

async function readJson<T>(relativePath: string): Promise<T> {
  const fullPath = path.join(process.cwd(), "public", "data", DATA_VERSION, relativePath);
  const payload = await fs.readFile(fullPath, "utf-8");
  return JSON.parse(payload) as T;
}

export const getSuites = cache(async (): Promise<SuitesFile> => {
  const payload = await readJson<SuitesFile>("suites.json");
  return SuitesFileSchema.parse(payload);
});

export const getScenarios = cache(async (): Promise<ScenariosFile> => {
  const payload = await readJson<ScenariosFile>("scenarios.json");
  return ScenariosFileSchema.parse(payload);
});

export const getScenarioSeries = cache(async (): Promise<ScenarioSeriesFile> => {
  const payload = await readJson<ScenarioSeriesFile>("scenario_series.json");
  return ScenarioSeriesFileSchema.parse(payload);
});

export const getMethods = cache(async (): Promise<MethodsFile> => {
  const payload = await readJson<MethodsFile>("methods.json");
  return MethodsFileSchema.parse(payload);
});

export const getLeaderboard = cache(async (suiteId: "core" | "full"): Promise<LeaderboardFile> => {
  const filename = suiteId === "core" ? "leaderboard_core.json" : "leaderboard_full.json";
  const payload = await readJson<LeaderboardFile>(filename);
  return LeaderboardFileSchema.parse(payload);
});

export const getSrFormulaExamples = cache(async (): Promise<SrFormulaExamplesFile> => {
  const payload = await readJson<SrFormulaExamplesFile>("sr_formula_examples.json");
  return SrFormulaExamplesFileSchema.parse(payload);
});

export const getApiReference = cache(async (): Promise<ApiReferenceFile> => {
  const payload = await readJson<ApiReferenceFile>("api_reference.json");
  return ApiReferenceFileSchema.parse(payload);
});
