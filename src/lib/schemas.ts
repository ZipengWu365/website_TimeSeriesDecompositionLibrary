import { z } from "zod";

export const SuiteSchema = z.object({
  suite_id: z.string(),
  name: z.string(),
  scenario_ids: z.array(z.string()),
  description: z.string(),
});

export const SuitesFileSchema = z.object({
  suite_version: z.string(),
  suites: z.array(SuiteSchema),
  tiers: z.record(z.string(), z.number()),
  scenario_periods: z.record(z.string(), z.array(z.number())),
});

export const ScenarioSchema = z.object({
  scenario_id: z.string(),
  tier: z.number(),
  base_periods: z.array(z.number()),
  family: z.string(),
  tags: z.array(z.string()),
  patterns: z.array(z.string()),
  description: z.string(),
  stressors: z.array(z.string()),
  default_length: z.number(),
  default_samples: z.number(),
  default_seed: z.number(),
});

export const ScenariosFileSchema = z.object({
  scenarios: z.array(ScenarioSchema),
});

export const ScenarioSeriesSchema = z.object({
  scenario_id: z.string(),
  seed: z.number(),
  length: z.number(),
  dt: z.number(),
  values: z.array(z.number()),
});

export const ScenarioSeriesFileSchema = z.object({
  suite_version: z.string().optional(),
  generated_at: z.string().optional(),
  scenarios: z.array(ScenarioSeriesSchema),
});

export const MethodSchema = z.object({
  method_name: z.string(),
  display_name: z.string(),
  reference: z.string(),
  needs_period: z.boolean(),
  default_config: z.record(z.string(), z.any()),
  wrapper_path: z.string(),
  expected_strengths: z.array(z.string()),
  known_signatures: z.array(z.string()),
});

export const MethodsFileSchema = z.object({
  methods: z.array(MethodSchema),
});

export const LeaderboardRowSchema = z.object({
  suite_version: z.string(),
  suite_id: z.string(),
  scenario_id: z.string(),
  tier: z.number(),
  seed: z.number(),
  method_name: z.string(),
  method_config_json: z.string(),
  metric_T_r2: z.number(),
  metric_T_dtw: z.number(),
  metric_S_spectral_corr: z.number(),
  metric_S_maxlag_corr: z.number(),
  metric_S_r2: z.number().optional(),
  length: z.number(),
  timestamp: z.string(),
  package_version: z.string().optional(),
  git_commit: z.string().optional(),
  scenario_periods_json: z.string().optional(),
});

export const LeaderboardFileSchema = z.object({
  suite_version: z.string(),
  suite_id: z.string(),
  rows: z.array(LeaderboardRowSchema),
});

export const SrFormulaRowSchema = z.object({
  decomp_method: z.string(),
  sr_method: z.string(),
  final_r2: z.number().nullable().optional(),
  success: z.boolean().optional(),
  trend_expr: z.string(),
  seasonal_expr: z.string(),
  full_expr: z.string(),
  trend_expr_latex: z.string().optional(),
  seasonal_expr_latex: z.string().optional(),
  full_expr_latex: z.string().optional(),
});

export const SrFormulaScenarioSchema = z.object({
  scenario: z.string(),
  sample_id: z.string(),
  oracle_trend_expr: z.string(),
  oracle_seasonal_expr: z.string(),
  rows: z.array(SrFormulaRowSchema),
});

export const SrFormulaExamplesFileSchema = z.object({
  generated_at: z.string().optional(),
  source_file: z.string().optional(),
  selection_rule: z.string().optional(),
  scenarios: z.array(SrFormulaScenarioSchema),
});

export const ApiReferenceItemSchema = z.object({
  name: z.string(),
  signature: z.string(),
  docstring: z.string().optional(),
  source: z.string().optional(),
});

export const ApiReferenceSectionSchema = z.object({
  module: z.string(),
  description: z.string().optional(),
  items: z.array(ApiReferenceItemSchema),
});

export const ApiReferenceFileSchema = z.object({
  generated_at: z.string(),
  source_repo: z.string().optional(),
  sections: z.array(ApiReferenceSectionSchema),
});

export type SuitesFile = z.infer<typeof SuitesFileSchema>;
export type Scenario = z.infer<typeof ScenarioSchema>;
export type ScenariosFile = z.infer<typeof ScenariosFileSchema>;
export type ScenarioSeries = z.infer<typeof ScenarioSeriesSchema>;
export type ScenarioSeriesFile = z.infer<typeof ScenarioSeriesFileSchema>;
export type Method = z.infer<typeof MethodSchema>;
export type MethodsFile = z.infer<typeof MethodsFileSchema>;
export type LeaderboardRow = z.infer<typeof LeaderboardRowSchema>;
export type LeaderboardFile = z.infer<typeof LeaderboardFileSchema>;
export type SrFormulaRow = z.infer<typeof SrFormulaRowSchema>;
export type SrFormulaScenario = z.infer<typeof SrFormulaScenarioSchema>;
export type SrFormulaExamplesFile = z.infer<typeof SrFormulaExamplesFileSchema>;
export type ApiReferenceFile = z.infer<typeof ApiReferenceFileSchema>;
