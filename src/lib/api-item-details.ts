/**
 * API item details with code examples.
 * Each item has signature, description, parameters, and usage examples.
 */

export type ApiItemDetail = {
    name: string;
    module: string;
    signature: string;
    description: string;
    parameters?: { name: string; type: string; description: string }[];
    returns?: { type: string; description: string };
    examples: { title: string; code: string }[];
    seeAlso?: string[];
};

export const API_ITEM_DETAILS: Record<string, ApiItemDetail> = {
    decompose: {
        name: "decompose",
        module: "tsdecomp",
        signature: "decompose(series: np.ndarray, config: DecompositionConfig) -> DecompResult",
        description:
            "Main entry point for time series decomposition. Dispatches to the registered method based on config.method.",
        parameters: [
            { name: "series", type: "np.ndarray", description: "1D time series array of shape (n,)." },
            { name: "config", type: "DecompositionConfig", description: "Configuration specifying method and parameters." },
        ],
        returns: { type: "DecompResult", description: "Container with trend, season, residual arrays." },
        examples: [
            {
                title: "Basic Usage",
                code: `from tsdecomp import decompose, DecompositionConfig
import numpy as np

# Create sample data
t = np.linspace(0, 10, 512)
y = 0.5 * t + np.sin(2 * np.pi * t / 50) + np.random.randn(512) * 0.1

# Configure and run decomposition
config = DecompositionConfig(method="stl", params={"period": 50})
result = decompose(y, config)

print(result.trend.shape)    # (512,)
print(result.season.shape)   # (512,)`,
            },
            {
                title: "Using VMD",
                code: `config = DecompositionConfig(
    method="vmd",
    params={"K": 5, "alpha": 2000}
)
result = decompose(y, config)

# Access individual modes
print(result.components.keys())  # dict_keys(['mode_0', 'mode_1', ...])`,
            },
        ],
        seeAlso: ["DecompositionConfig", "DecompResult", "MethodRegistry"],
    },
    DecompositionConfig: {
        name: "DecompositionConfig",
        module: "tsdecomp.core",
        signature: "DecompositionConfig(method: str, params: Dict = {}, return_components: List[str] = None, device: str = 'cpu', n_jobs: int = 1, seed: int = 42)",
        description:
            "Pydantic model for configuring a decomposition method. Validates parameters and provides defaults.",
        parameters: [
            { name: "method", type: "str", description: "Name of the decomposition method (e.g., 'stl', 'mstl', 'ssa', 'vmd')." },
            { name: "params", type: "Dict", description: "Method-specific parameters." },
            { name: "return_components", type: "List[str] or None", description: "Specific components to return, or None for all." },
            { name: "device", type: "str", description: "Compute device ('cpu' or 'cuda')." },
            { name: "n_jobs", type: "int", description: "Number of parallel jobs." },
            { name: "seed", type: "int", description: "Random seed for reproducibility." },
        ],
        examples: [
            {
                title: "STL Configuration",
                code: `from tsdecomp import DecompositionConfig

config = DecompositionConfig(
    method="stl",
    params={"period": 52, "seasonal": 7, "robust": True}
)`,
            },
            {
                title: "Multi-seasonal MSTL",
                code: `config = DecompositionConfig(
    method="mstl",
    params={"periods": [7, 365]}  # weekly + yearly
)`,
            },
        ],
        seeAlso: ["decompose", "DecompResult"],
    },
    DecompResult: {
        name: "DecompResult",
        module: "tsdecomp.core",
        signature: "@dataclass DecompResult(trend: np.ndarray, season: np.ndarray, residual: np.ndarray, components: Dict = {}, meta: Dict = {})",
        description:
            "Unified container for decomposition results. Provides standard access to trend, season, and residual components.",
        parameters: [
            { name: "trend", type: "np.ndarray", description: "Extracted trend component." },
            { name: "season", type: "np.ndarray", description: "Extracted seasonal component." },
            { name: "residual", type: "np.ndarray", description: "Residual after removing trend and season." },
            { name: "components", type: "Dict[str, np.ndarray]", description: "Additional method-specific components." },
            { name: "meta", type: "Dict[str, Any]", description: "Metadata from the decomposition process." },
        ],
        examples: [
            {
                title: "Accessing Components",
                code: `result = decompose(y, config)

# Standard components
trend = result.trend
season = result.season
residual = result.residual

# Verify decomposition
reconstructed = trend + season + residual
np.allclose(y, reconstructed)  # True`,
            },
        ],
        seeAlso: ["decompose", "DecompositionConfig"],
    },
    r2_score: {
        name: "r2_score",
        module: "tsdecomp.metrics",
        signature: "r2_score(y_true: np.ndarray, y_pred: np.ndarray) -> float",
        description: "Coefficient of determination (R²). Returns 1 - (SS_res / SS_tot).",
        parameters: [
            { name: "y_true", type: "np.ndarray", description: "Ground truth values." },
            { name: "y_pred", type: "np.ndarray", description: "Predicted/estimated values." },
        ],
        returns: { type: "float", description: "R² score in range (-inf, 1]. Higher is better." },
        examples: [
            {
                title: "Evaluate Trend Recovery",
                code: `from tsdecomp.metrics import r2_score

# Compare extracted trend to ground truth
score = r2_score(true_trend, result.trend)
print(f"Trend R²: {score:.3f}")  # e.g., 0.987`,
            },
        ],
        seeAlso: ["dtw_distance", "compute_metrics"],
    },
    spectral_correlation: {
        name: "spectral_correlation",
        module: "tsdecomp.metrics",
        signature: "spectral_correlation(s1: np.ndarray, s2: np.ndarray, fs: float = 1.0) -> float",
        description: "Correlation of power spectral densities using Welch's method. Measures frequency-domain similarity.",
        parameters: [
            { name: "s1", type: "np.ndarray", description: "First signal." },
            { name: "s2", type: "np.ndarray", description: "Second signal." },
            { name: "fs", type: "float", description: "Sampling frequency." },
        ],
        returns: { type: "float", description: "Spectral correlation in range [-1, 1]." },
        examples: [
            {
                title: "Evaluate Seasonal Recovery",
                code: `from tsdecomp.metrics import spectral_correlation

score = spectral_correlation(true_season, result.season)
print(f"Spectral Corr: {score:.3f}")  # e.g., 0.954`,
            },
        ],
        seeAlso: ["max_lag_correlation", "compute_metrics"],
    },
    compute_metrics: {
        name: "compute_metrics",
        module: "tsdecomp.metrics",
        signature: "compute_metrics(y_true: np.ndarray, y_pred: np.ndarray, fs: float = 1.0) -> Dict[str, float]",
        description: "Compute all standard metrics in one call: R², DTW distance, spectral correlation, max-lag correlation.",
        parameters: [
            { name: "y_true", type: "np.ndarray", description: "Ground truth values." },
            { name: "y_pred", type: "np.ndarray", description: "Predicted/estimated values." },
            { name: "fs", type: "float", description: "Sampling frequency for spectral metrics." },
        ],
        returns: { type: "Dict[str, float]", description: "Dictionary with keys: r2, dtw, spectral_corr, max_lag_corr." },
        examples: [
            {
                title: "Full Evaluation",
                code: `from tsdecomp.metrics import compute_metrics

metrics = compute_metrics(true_trend, result.trend)
print(metrics)
# {'r2': 0.987, 'dtw': 12.3, 'spectral_corr': 0.95, 'max_lag_corr': 0.89}`,
            },
        ],
        seeAlso: ["r2_score", "spectral_correlation", "max_lag_correlation"],
    },
    run_suite: {
        name: "run_suite",
        module: "tsdecomp.leaderboard",
        signature: "run_suite(suite_name: str, methods: List[str], seed: int = 0, out_dir: str = 'runs/', n_samples: int = 1, length: int = 512, dt: float = 1.0, verbose: bool = True) -> pd.DataFrame",
        description: "Run a benchmark suite with specified methods. Generates scenarios, runs decompositions, and computes metrics.",
        parameters: [
            { name: "suite_name", type: "str", description: "Name of suite ('core' or 'full')." },
            { name: "methods", type: "List[str]", description: "List of method names to benchmark." },
            { name: "seed", type: "int", description: "Random seed for reproducibility." },
            { name: "out_dir", type: "str", description: "Directory to save results." },
        ],
        returns: { type: "pd.DataFrame", description: "DataFrame with results per scenario and method." },
        examples: [
            {
                title: "Run Core Benchmark",
                code: `from tsdecomp.leaderboard import run_suite

results = run_suite(
    suite_name="core",
    methods=["stl", "mstl", "ssa", "vmd"],
    seed=42,
    out_dir="./runs/"
)
print(results.head())`,
            },
        ],
        seeAlso: ["export_leaderboard", "validate_suite"],
    },
    SRBenchmark: {
        name: "SRBenchmark",
        module: "sr_eval",
        signature: "class SRBenchmark(methods: List[SymbolicRegressorBase], time_limit: float = 60.0, verbose: bool = False)",
        description: "Main class for running symbolic regression benchmarks. Evaluates multiple SR methods on a set of samples.",
        parameters: [
            { name: "methods", type: "List[SymbolicRegressorBase]", description: "List of symbolic regressor instances." },
            { name: "time_limit", type: "float", description: "Time limit per sample in seconds." },
            { name: "verbose", type: "bool", description: "Print progress during execution." },
        ],
        examples: [
            {
                title: "Run SR Benchmark",
                code: `from sr_eval import SRBenchmark
from sr_methods import ND2Regressor, GPlearnRegressor
from sr_scenarios import make_sr_sample, list_sr_scenarios

# Create regressors
methods = [ND2Regressor(), GPlearnRegressor()]
benchmark = SRBenchmark(methods, time_limit=60)

# Generate samples
samples = [make_sr_sample(s) for s in list_sr_scenarios()[:5]]

# Run benchmark
results_df = benchmark.run(samples)
print(results_df[['scenario', 'method', 'r2_score', 'complexity']])`,
            },
        ],
        seeAlso: ["SRSample", "make_sr_sample", "SymbolicRegressorBase"],
    },
    make_sr_sample: {
        name: "make_sr_sample",
        module: "sr_scenarios",
        signature: "make_sr_sample(scenario: str, length: int = 512, noise_sigma: float = 0.1, random_seed: Optional[int] = None) -> SRSample",
        description: "Create a symbolic regression sample with ground truth expressions.",
        parameters: [
            { name: "scenario", type: "str", description: "Scenario name from the registry." },
            { name: "length", type: "int", description: "Time series length." },
            { name: "noise_sigma", type: "float", description: "Noise standard deviation." },
        ],
        returns: { type: "SRSample", description: "Sample with data and ground truth expressions." },
        examples: [
            {
                title: "Generate Sample",
                code: `from sr_scenarios import make_sr_sample, list_sr_scenarios

# List available scenarios
print(list_sr_scenarios())
# ['linear_trend', 'quadratic_trend', 'single_sine', ...]

# Create a sample
sample = make_sr_sample("linear_trend", length=256, noise_sigma=0.05)
print(sample.trend_expr)   # "a*u + b"
print(sample.y_clean[:5])  # array([...])`,
            },
        ],
        seeAlso: ["SRSample", "SRBenchmark", "list_sr_scenarios"],
    },
};

// Get all item names for static generation
export function getAllApiItemNames(): string[] {
    return Object.keys(API_ITEM_DETAILS);
}

// Get item by name (case-insensitive)
export function getApiItemDetail(name: string): ApiItemDetail | undefined {
    const key = Object.keys(API_ITEM_DETAILS).find(
        (k) => k.toLowerCase() === name.toLowerCase()
    );
    return key ? API_ITEM_DETAILS[key] : undefined;
}
