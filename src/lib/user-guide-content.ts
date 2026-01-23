/**
 * User Guide content for sklearn-style documentation.
 * Extracted from decomposition_method_analysis.qmd and organized by section.
 */

export type UserGuideSection = {
    id: string;
    number: number;
    title: string;
    description: string;
    subsections?: { id: string; title: string }[];
};

export const USER_GUIDE_SECTIONS: UserGuideSection[] = [
    {
        id: "introduction",
        number: 1,
        title: "Introduction & Quick Start",
        description:
            "Overview of time series decomposition, the benchmark motivation, and a quick start guide.",
        subsections: [
            { id: "motivation", title: "Why Decomposition?" },
            { id: "quickstart", title: "Quick Start" },
            { id: "installation", title: "Installation" },
        ],
    },
    {
        id: "benchmark",
        number: 2,
        title: "Benchmark Task & Evaluation",
        description:
            "Formalizing decomposition as a component-recovery task with ground-truth evaluation.",
        subsections: [
            { id: "task-definition", title: "Task Definition" },
            { id: "scenario-suite", title: "Scenario Suite" },
            { id: "difficulty-tiers", title: "Difficulty Stratification" },
        ],
    },
    {
        id: "methods",
        number: 3,
        title: "Decomposition Methods",
        description:
            "Overview of method families: Moving Average, STL/MSTL, SSA, EMD/CEEMDAN, VMD, Wavelet.",
        subsections: [
            { id: "smoothing", title: "Moving Average Baseline" },
            { id: "stl-family", title: "STL / MSTL (LOESS)" },
            { id: "subspace", title: "SSA (Subspace)" },
            { id: "emd-family", title: "EMD / CEEMDAN" },
            { id: "vmd", title: "VMD (Variational)" },
            { id: "wavelet", title: "Wavelet" },
        ],
    },
    {
        id: "metrics",
        number: 4,
        title: "Metrics & Protocol",
        description:
            "Trend and seasonal metrics: R², DTW, spectral correlation, max-lag correlation.",
        subsections: [
            { id: "trend-metrics", title: "Trend Metrics" },
            { id: "seasonal-metrics", title: "Seasonal Metrics" },
            { id: "aggregation", title: "Aggregation & Reporting" },
        ],
    },
    {
        id: "failure-taxonomy",
        number: 5,
        title: "Failure Taxonomy",
        description:
            "Theory-consistent explanations for systematic method–data mismatches.",
        subsections: [
            { id: "fixed-period-failure", title: "Fixed-Period under Drift" },
            { id: "global-basis-leakage", title: "Global-Basis Leakage" },
            { id: "adaptive-robustness", title: "Adaptive Spectral Robustness" },
        ],
    },
    {
        id: "symbolic-regression",
        number: 6,
        title: "Symbolic Regression",
        description:
            "Downstream structure-recovery task: decompose-then-regress for interpretable expressions.",
        subsections: [
            { id: "task-definition-sr", title: "Task Definition" },
            { id: "nd2-vs-gplearn", title: "ND2 vs GPlearn" },
            { id: "benefits", title: "Benefits of Pre-Decomposition" },
        ],
    },
];

export type SectionContent = {
    overview: string;
    content: string; // Markdown content
    figures?: { src: string; caption: string }[];
    code?: { title: string; language: string; code: string }[];
    equations?: { title: string; latex: string }[];
};

export const SECTION_CONTENT: Record<string, SectionContent> = {
    introduction: {
        overview:
            "Time series decomposition separates observations into interpretable components: trend, seasonality, and residual.",
        content: `
Time-series research has long emphasized end-to-end modeling of raw observations for downstream performance.
However, in many real-world settings, the primary objective is not merely to minimize pointwise prediction error,
but to **isolate and interpret structural components** that carry scientific and operational meaning.

Time-series decomposition serves as a foundational primitive across domains: it transforms an opaque sequence
into semantically meaningful components, enabling direct reasoning about:

- **Trend** shape and smoothness
- **Seasonal** pattern stability and evolution  
- **Residual** fluctuations and noise characteristics

We view decomposition as a structured operator \\(\\mathcal{D}\\) that maps observations to components:

$$
(T, S, R) = \\mathcal{D}(y)
$$

where \\(T\\) is the trend, \\(S\\) is the seasonal component, and \\(R\\) is the residual.
`,
        figures: [
            {
                src: "/figs/fig01_decomposition_problem_1766848017819.png",
                caption: "The decomposition problem: separating trend, seasonality, and residual.",
            },
        ],
        code: [
            {
                title: "Quick Start",
                language: "python",
                code: `from tsdecomp import decompose, DecompositionConfig
import numpy as np

# Example: decompose a simulated time series
t = np.linspace(0, 10, 512)
y = 0.5 * t + np.sin(2 * np.pi * t / 50) + np.random.randn(512) * 0.1

# Configure STL decomposition
config = DecompositionConfig(method="stl", params={"period": 50})
result = decompose(y, config)

print(result.trend.shape)    # (512,)
print(result.season.shape)   # (512,)
print(result.residual.shape) # (512,)`,
            },
        ],
    },
    benchmark: {
        overview:
            "We formalize decomposition as component recovery under controlled generating mechanisms.",
        content: `
A benchmark scenario is defined by selecting one **trend family**, one **cycle family**, a **noise family**,
and an optional **event driver** configuration.

## Scenario Suite

We include:
- **Stationary regimes** (smooth trend + fixed-period seasonality) as sanity checks
- **Non-stationary regimes** (frequency drift, regime switching) that stress fixed-period assumptions

## Difficulty Stratification

| Tier | Description | Examples |
|:-----|:------------|:---------|
| 1 | Stationary, single period | Linear trend + single sine |
| 2 | Multi-seasonal, multi-harmonic | Polynomial trend + multi-seasonal |
| 3 | Non-stationary, events | Frequency drift, regime switching |

## Reproducibility Protocol

All scenarios are generated by deterministic code with explicit parameter sampling and fixed random seeds.
Each method is executed under a unified interface, and outputs are aligned into \\((\\hat{T}, \\hat{S}, \\hat{R})\\).
`,
        figures: [
            {
                src: "/figs/fig06_synthetic_data_1766848210813.png",
                caption: "Synthetic data generation taxonomy: trend and cycle families.",
            },
        ],
    },
    methods: {
        overview:
            "We evaluate six method families covering common practice in statistics and signal processing.",
        content: `
## Method Families

| Family | Representative | Prior |
|:-------|:---------------|:------|
| Smoothing | Moving Average | Local constancy |
| STL/MSTL | LOESS-based | Locally polynomial trend, fixed period |
| Subspace | SSA | Low-rank Hankel structure |
| Sifting | EMD/CEEMDAN | AM/FM oscillations |
| Variational | VMD | Spectrally compact modes |
| Multi-scale | Wavelet | Filter-bank locality |

## Compatibility Matrix

| Method | Compatible Regimes | Failure Regimes |
|:-------|:-------------------|:----------------|
| STL | Smooth trend, stationary period | Frequency drift |
| SSA | Sinusoidal, low-rank | Regime changes |
| VMD | Non-stationary (compact spectrum) | Broadband |
| Wavelet | Multi-scale, localized | Misaligned bands |
`,
        figures: [
            {
                src: "/figs/fig02_method_comparison_1766848048180.png",
                caption: "Overview of decomposition method priors.",
            },
        ],
    },
    metrics: {
        overview:
            "We evaluate trend and seasonal recovery with complementary criteria.",
        content: `
## Trend Metrics

**R² (Coefficient of Determination)**
$$
R_T^2 = 1 - \\frac{\\sum_t (T_t - \\hat{T}_t)^2}{\\sum_t (T_t - \\bar{T})^2}
$$

**DTW Distance**: Shape similarity under monotone time reparameterization.

## Seasonal Metrics

**Spectral Correlation**: Pearson correlation between power spectral densities.

**Max-Lag Correlation**: \\(\\max_\\ell \\rho(\\ell)\\) over a lag search window—robust to phase shifts.

## Aggregation

- **Scenario-level**: Performance within each scenario
- **Tier-level**: Aggregated by difficulty tier
- **Overall**: Global ranking with tier breakdowns
`,
        equations: [
            {
                title: "Trend R²",
                latex: String.raw`R_T^2 = 1 - \frac{\sum_t (T_t - \hat{T}_t)^2}{\sum_t (T_t - \bar{T})^2}`,
            },
            {
                title: "Max-lag correlation",
                latex: String.raw`\max_{\ell \in \mathcal{L}} \rho(\ell)`,
            },
        ],
    },
    "failure-taxonomy": {
        overview:
            "We organize theoretical interpretation around mechanistic failure modes.",
        content: `
## Failure Mode I: Fixed-Period under Drift

Methods like STL rely on \\(S_{t+P} = S_t\\). Under frequency drift, samples at fixed lag \\(P\\)
correspond to different phases—averaging collapses the seasonal estimate toward zero.

## Failure Mode II: Global-Basis Leakage

SSA and similar methods assume low-rank Hankel structure. Regime switches introduce localized
structure that cannot be captured without spreading energy across many basis elements.

## Failure Mode III: Adaptive Robustness Boundaries

VMD favors spectral compactness. A drifting-frequency cycle is globally broadband but locally
narrow-band—substantial recovery remains possible. The boundary is highly broadband or
overlapping drifting components.
`,
        figures: [
            {
                src: "/figs/fig07_stl_failure_1766848255126.png",
                caption: "STL failure on frequency-drifting signals.",
            },
            {
                src: "/figs/fig08_vmd_success_1766848314528.png",
                caption: "VMD success on chirp signals due to spectral compactness.",
            },
        ],
    },
    "symbolic-regression": {
        overview:
            "Symbolic regression on decomposed components yields simpler, more faithful expressions.",
        content: `
## Task Definition

- **Direct protocol**: SR fits \\(\\hat{g}(t)\\) to raw \\(y_t\\)
- **Decomposed protocol**: SR fits separate expressions to \\(\\hat{T}\\) and \\(\\hat{S}\\)

## ND2 vs GPlearn

| Method | Type | Median Nodes | Mechanism Score |
|:-------|:-----|:------------:|:---------------:|
| ND2 | Neural MCTS | 8 | 0.35 |
| GPlearn | Genetic Programming | 23 | 0.14 |

## Benefits of Pre-Decomposition

- Simplifies the target signal
- Allows SR to focus on simpler component-wise structure
- Reduces expression complexity
`,
        figures: [
            {
                src: "/figs/benchmark_4panel_summary.png",
                caption: "Symbolic regression benchmark summary.",
            },
        ],
    },
};
