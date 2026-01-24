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
    // =========== sr_methods ===========
    SymbolicRegressorBase: {
        name: "SymbolicRegressorBase",
        module: "sr_methods",
        signature: "class SymbolicRegressorBase(ABC)",
        description: "Abstract base class for all symbolic regression methods. Subclasses must implement fit() and predict().",
        parameters: [
            { name: "operators", type: "List[str]", description: "Allowed operators (e.g., '+', '-', '*', '/', 'sin', 'exp')." },
            { name: "max_complexity", type: "int", description: "Maximum expression complexity." },
            { name: "time_limit", type: "float", description: "Time limit per fit in seconds." },
        ],
        examples: [
            {
                title: "Implementing a Custom Regressor",
                code: `from sr_methods.base import SymbolicRegressorBase, SRResult

class MyRegressor(SymbolicRegressorBase):
    @property
    def name(self) -> str:
        return "my_regressor"
    
    def fit(self, t, y, **kwargs) -> SRResult:
        # Your implementation here
        return SRResult(expression="a*x + b", ...)
    
    def predict(self, t):
        # Evaluate discovered expression
        return self._result.sympy_expr.subs('x', t)`,
            },
        ],
        seeAlso: ["SRResult", "ND2Regressor", "GPlearnRegressor"],
    },
    SRResult: {
        name: "SRResult",
        module: "sr_methods",
        signature: "@dataclass SRResult(expression: str, sympy_expr: Any, params: Dict, r2_score: float, mse: float, complexity: int, runtime_sec: float, converged: bool, all_expressions: List[str], all_scores: List[float], metadata: Dict)",
        description: "Container for symbolic regression fit results. Stores discovered expression, metrics, and all candidates.",
        parameters: [
            { name: "expression", type: "str", description: "Best discovered expression as string." },
            { name: "sympy_expr", type: "sympy.Expr", description: "SymPy expression object for evaluation." },
            { name: "r2_score", type: "float", description: "R² score of the fit." },
            { name: "complexity", type: "int", description: "Number of nodes in expression tree." },
            { name: "all_expressions", type: "List[str]", description: "All candidate expressions found." },
        ],
        examples: [
            {
                title: "Accessing SR Results",
                code: `result = regressor.fit(t, y)

print(result.expression)     # "2.5*sin(x) + 1.2*x"
print(result.r2_score)       # 0.987
print(result.complexity)     # 7
print(len(result.all_expressions))  # 42`,
            },
        ],
        seeAlso: ["SymbolicRegressorBase", "evaluate_result"],
    },
    ND2Regressor: {
        name: "ND2Regressor",
        module: "sr_methods",
        signature: "class ND2Regressor(SymbolicRegressorBase)",
        description: "Neural Decomposition Dictionary (ND2) wrapper. Uses transformer-based MCTS with learned priors for symbolic regression.",
        parameters: [
            { name: "model_path", type: "str", description: "Path to pretrained ND2 model." },
            { name: "beam_size", type: "int", description: "Beam search width." },
            { name: "max_length", type: "int", description: "Maximum expression length." },
        ],
        examples: [
            {
                title: "Using ND2",
                code: `from sr_methods import ND2Regressor

regressor = ND2Regressor(
    model_path="./models/nd2_pretrained.pt",
    beam_size=10,
    time_limit=60
)
result = regressor.fit(t, y)
print(result.expression)  # e.g., "sin(omega*t) + a*t"`,
            },
        ],
        seeAlso: ["GPlearnRegressor", "PySRRegressor", "SRResult"],
    },
    GPlearnRegressor: {
        name: "GPlearnRegressor",
        module: "sr_methods",
        signature: "class GPlearnRegressor(SymbolicRegressorBase)",
        description: "GPlearn genetic programming wrapper. Uses evolutionary algorithms for symbolic regression.",
        parameters: [
            { name: "population_size", type: "int", description: "Population size for GP." },
            { name: "generations", type: "int", description: "Number of generations to evolve." },
            { name: "parsimony_coefficient", type: "float", description: "Penalty for expression complexity." },
        ],
        examples: [
            {
                title: "Using GPlearn",
                code: `from sr_methods import GPlearnRegressor

regressor = GPlearnRegressor(
    population_size=1000,
    generations=20,
    parsimony_coefficient=0.01
)
result = regressor.fit(t, y)
print(result.expression)
print(f"Complexity: {result.complexity}")`,
            },
        ],
        seeAlso: ["ND2Regressor", "PySRRegressor", "SRResult"],
    },
    PySRRegressor: {
        name: "PySRRegressor",
        module: "sr_methods",
        signature: "class PySRRegressor(SymbolicRegressorBase)",
        description: "PySR wrapper using Julia backend. High-performance multi-objective symbolic regression.",
        parameters: [
            { name: "niterations", type: "int", description: "Number of search iterations." },
            { name: "binary_operators", type: "List[str]", description: "Binary operators to use." },
            { name: "unary_operators", type: "List[str]", description: "Unary operators (sin, cos, exp, log)." },
        ],
        examples: [
            {
                title: "Using PySR",
                code: `from sr_methods import PySRRegressor

regressor = PySRRegressor(
    niterations=40,
    binary_operators=["+", "-", "*", "/"],
    unary_operators=["sin", "cos", "exp"]
)
result = regressor.fit(t, y)

# Access Pareto front
for expr, score in zip(result.all_expressions[:5], result.all_scores[:5]):
    print(f"{expr}: R²={score:.3f}")`,
            },
        ],
        seeAlso: ["ND2Regressor", "GPlearnRegressor", "SRResult"],
    },
    compute_expression_complexity: {
        name: "compute_expression_complexity",
        module: "sr_methods",
        signature: "compute_expression_complexity(expr_str: str) -> int",
        description: "Estimate expression complexity by counting operators and operands in the expression tree.",
        parameters: [
            { name: "expr_str", type: "str", description: "Expression string to analyze." },
        ],
        returns: { type: "int", description: "Estimated complexity score." },
        examples: [
            {
                title: "Compute Complexity",
                code: `from sr_methods.base import compute_expression_complexity

complexity = compute_expression_complexity("sin(2*x) + 3*x**2")
print(complexity)  # 9`,
            },
        ],
        seeAlso: ["is_symbolic_equivalent", "SRResult"],
    },
    is_symbolic_equivalent: {
        name: "is_symbolic_equivalent",
        module: "sr_methods",
        signature: "is_symbolic_equivalent(expr1: str, expr2: str, tolerance: float = 1e-10) -> bool",
        description: "Check if two expressions are symbolically equivalent using SymPy simplification.",
        parameters: [
            { name: "expr1", type: "str", description: "First expression." },
            { name: "expr2", type: "str", description: "Second expression." },
            { name: "tolerance", type: "float", description: "Numerical tolerance for comparison." },
        ],
        returns: { type: "bool", description: "True if expressions are equivalent." },
        examples: [
            {
                title: "Check Equivalence",
                code: `from sr_methods.base import is_symbolic_equivalent

# Equivalent expressions
is_symbolic_equivalent("x + x", "2*x")  # True
is_symbolic_equivalent("sin(x)**2 + cos(x)**2", "1")  # True

# Not equivalent
is_symbolic_equivalent("x**2", "x**3")  # False`,
            },
        ],
        seeAlso: ["compute_expression_complexity", "evaluate_result"],
    },
    // =========== sr_eval ===========
    EvalResult: {
        name: "EvalResult",
        module: "sr_eval",
        signature: "@dataclass EvalResult(sample_id: str, scenario: str, method: str, gt_expression: str, pred_expression: str, mse: float, r2_score: float, exact_match: bool, symbolic_equivalent: bool, complexity: int, runtime_sec: float)",
        description: "Evaluation result for a single SR sample. Contains ground truth, prediction, and all evaluation metrics.",
        parameters: [
            { name: "gt_expression", type: "str", description: "Ground truth expression." },
            { name: "pred_expression", type: "str", description: "Predicted expression." },
            { name: "exact_match", type: "bool", description: "Whether prediction exactly matches ground truth." },
            { name: "symbolic_equivalent", type: "bool", description: "Whether prediction is symbolically equivalent." },
        ],
        examples: [
            {
                title: "Evaluate SR Result",
                code: `from sr_eval import evaluate_result

eval_result = evaluate_result(
    sr_result=result,
    y_true=y_clean,
    y_pred=regressor.predict(t),
    gt_expression="2*sin(x) + x"
)
print(f"R²: {eval_result.r2_score:.3f}")
print(f"Exact match: {eval_result.exact_match}")
print(f"Symbolic equivalent: {eval_result.symbolic_equivalent}")`,
            },
        ],
        seeAlso: ["evaluate_result", "aggregate_results"],
    },
    evaluate_result: {
        name: "evaluate_result",
        module: "sr_eval",
        signature: "evaluate_result(sr_result: SRResult, y_true: np.ndarray, y_pred: np.ndarray, gt_expression: str, ...) -> EvalResult",
        description: "Evaluate a symbolic regression result against ground truth expression and data.",
        parameters: [
            { name: "sr_result", type: "SRResult", description: "Result from SR fit." },
            { name: "y_true", type: "np.ndarray", description: "Ground truth signal values." },
            { name: "y_pred", type: "np.ndarray", description: "Predicted values from SR." },
            { name: "gt_expression", type: "str", description: "Ground truth expression string." },
        ],
        returns: { type: "EvalResult", description: "Complete evaluation with all metrics." },
        examples: [
            {
                title: "Full Evaluation",
                code: `from sr_eval import evaluate_result

result = evaluate_result(
    sr_result=sr_result,
    y_true=sample.y_clean,
    y_pred=regressor.predict(sample.t),
    gt_expression=sample.combined_expr,
    sample_id=sample.sample_id,
    scenario=sample.scenario,
    method=regressor.name
)`,
            },
        ],
        seeAlso: ["EvalResult", "aggregate_results", "SRResult"],
    },
    aggregate_results: {
        name: "aggregate_results",
        module: "sr_eval",
        signature: "aggregate_results(results: List[EvalResult]) -> pd.DataFrame",
        description: "Aggregate multiple evaluation results into a pandas DataFrame for analysis.",
        parameters: [
            { name: "results", type: "List[EvalResult]", description: "List of evaluation results." },
        ],
        returns: { type: "pd.DataFrame", description: "DataFrame with one row per result." },
        examples: [
            {
                title: "Aggregate Results",
                code: `from sr_eval import aggregate_results

# After running benchmark
df = aggregate_results(all_results)
print(df.columns)
# ['sample_id', 'scenario', 'method', 'r2_score', 'complexity', ...]

# Analysis by method
df.groupby('method')['r2_score'].mean()`,
            },
        ],
        seeAlso: ["EvalResult", "compute_summary_stats"],
    },
    compute_summary_stats: {
        name: "compute_summary_stats",
        module: "sr_eval",
        signature: "compute_summary_stats(df: pd.DataFrame) -> pd.DataFrame",
        description: "Compute summary statistics grouped by method and scenario.",
        parameters: [
            { name: "df", type: "pd.DataFrame", description: "Results DataFrame from aggregate_results()." },
        ],
        returns: { type: "pd.DataFrame", description: "Summary with mean, std for each metric." },
        examples: [
            {
                title: "Compute Summary",
                code: `from sr_eval import compute_summary_stats

summary = compute_summary_stats(df)
print(summary[['method', 'r2_score_mean', 'complexity_mean']])`,
            },
        ],
        seeAlso: ["aggregate_results", "recovery_analysis"],
    },
    recovery_analysis: {
        name: "recovery_analysis",
        module: "sr_eval",
        signature: "recovery_analysis(df: pd.DataFrame, thresholds: Dict[str, float] = None) -> pd.DataFrame",
        description: "Analyze expression recovery rates based on R² and complexity thresholds.",
        parameters: [
            { name: "df", type: "pd.DataFrame", description: "Results DataFrame." },
            { name: "thresholds", type: "Dict[str, float]", description: "Custom thresholds for 'good' recovery." },
        ],
        returns: { type: "pd.DataFrame", description: "Recovery rates by method." },
        examples: [
            {
                title: "Recovery Analysis",
                code: `from sr_eval import recovery_analysis

recovery = recovery_analysis(df, thresholds={
    "r2_score": 0.95,
    "complexity": 15
})
print(recovery)
# method   recovery_rate  exact_match_rate
# ND2      0.78           0.45
# GPlearn  0.52           0.12`,
            },
        ],
        seeAlso: ["compute_summary_stats", "generate_report"],
    },
    generate_report: {
        name: "generate_report",
        module: "sr_eval",
        signature: "generate_report(df: pd.DataFrame, output_path: Optional[str] = None) -> str",
        description: "Generate a comprehensive markdown benchmark report with tables and statistics.",
        parameters: [
            { name: "df", type: "pd.DataFrame", description: "Results DataFrame." },
            { name: "output_path", type: "str", description: "Optional path to save report." },
        ],
        returns: { type: "str", description: "Markdown report content." },
        examples: [
            {
                title: "Generate Report",
                code: `from sr_eval import generate_report

report = generate_report(df, output_path="./results/sr_report.md")
print(report[:500])  # Preview first 500 chars`,
            },
        ],
        seeAlso: ["SRBenchmark", "aggregate_results"],
    },
    // =========== sr_scenarios ===========
    SRSample: {
        name: "SRSample",
        module: "sr_scenarios",
        signature: "@dataclass SRSample(sample_id: str, scenario: str, t: np.ndarray, u: np.ndarray, y_clean: np.ndarray, y_noisy: np.ndarray, trend_expr: str, cycle_expr: str, combined_expr: str, trend_params: Dict, cycle_params: Dict)",
        description: "A complete sample for symbolic regression benchmark with data and ground truth expressions.",
        parameters: [
            { name: "t", type: "np.ndarray", description: "Time axis (raw)." },
            { name: "u", type: "np.ndarray", description: "Normalized time [0, 1]." },
            { name: "y_clean", type: "np.ndarray", description: "Clean signal without noise." },
            { name: "trend_expr", type: "str", description: "Ground truth trend expression." },
            { name: "cycle_expr", type: "str", description: "Ground truth cycle expression." },
            { name: "combined_expr", type: "str", description: "Full expression (trend + cycle)." },
        ],
        examples: [
            {
                title: "Using SRSample",
                code: `sample = make_sr_sample("quadratic_trend", length=512)

print(sample.trend_expr)    # "a*u**2 + b*u + c"
print(sample.combined_expr) # "a*u**2 + b*u + c + A*sin(omega*t)"
print(sample.y_clean.shape) # (512,)

# Fit on clean data
result = regressor.fit(sample.u, sample.y_clean)`,
            },
        ],
        seeAlso: ["make_sr_sample", "list_sr_scenarios"],
    },
    list_sr_scenarios: {
        name: "list_sr_scenarios",
        module: "sr_scenarios",
        signature: "list_sr_scenarios() -> List[str]",
        description: "List all available symbolic regression scenario names.",
        returns: { type: "List[str]", description: "List of registered scenario names." },
        examples: [
            {
                title: "List Scenarios",
                code: `from sr_scenarios import list_sr_scenarios

scenarios = list_sr_scenarios()
print(scenarios)
# ['linear_trend', 'quadratic_trend', 'cubic_trend', 'exp_trend',
#  'logistic_trend', 'single_sine', 'multi_harmonic_2', 'multi_harmonic_3',
#  'trend_plus_sine', 'quadratic_plus_harmonic', ...]`,
            },
        ],
        seeAlso: ["make_sr_sample", "SRSample"],
    },
    get_trend_expression: {
        name: "get_trend_expression",
        module: "sr_scenarios",
        signature: "get_trend_expression(trend_type: str, params: Dict, var_name: str = 'u') -> Tuple[str, Dict]",
        description: "Generate symbolic expression string for a trend component type.",
        parameters: [
            { name: "trend_type", type: "str", description: "Type of trend (linear, quadratic, exp, logistic)." },
            { name: "params", type: "Dict", description: "Parameters for the trend." },
            { name: "var_name", type: "str", description: "Variable name to use." },
        ],
        returns: { type: "Tuple[str, Dict]", description: "Expression string and cleaned parameters." },
        examples: [
            {
                title: "Generate Trend Expression",
                code: `from sr_scenarios import get_trend_expression

expr, params = get_trend_expression(
    "quadratic",
    {"a": 2.5, "b": -1.0, "c": 0.5}
)
print(expr)    # "2.5*u**2 + -1.0*u + 0.5"
print(params)  # {"a": 2.5, "b": -1.0, "c": 0.5}`,
            },
        ],
        seeAlso: ["get_cycle_expression", "SRSample"],
    },
    get_cycle_expression: {
        name: "get_cycle_expression",
        module: "sr_scenarios",
        signature: "get_cycle_expression(cycle_type: str, params: Dict, time_var: str = 't', norm_var: str = 'u') -> Tuple[str, Dict]",
        description: "Generate symbolic expression string for a cycle/seasonal component.",
        parameters: [
            { name: "cycle_type", type: "str", description: "Type of cycle (sine, multi_harmonic, chirp)." },
            { name: "params", type: "Dict", description: "Parameters for the cycle." },
        ],
        returns: { type: "Tuple[str, Dict]", description: "Expression string and cleaned parameters." },
        examples: [
            {
                title: "Generate Cycle Expression",
                code: `from sr_scenarios import get_cycle_expression

expr, params = get_cycle_expression(
    "multi_harmonic",
    {"A1": 1.0, "omega1": 0.1, "A2": 0.5, "omega2": 0.2}
)
print(expr)
# "1.0*sin(0.1*t) + 0.5*sin(0.2*t)"`,
            },
        ],
        seeAlso: ["get_trend_expression", "SRSample"],
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
