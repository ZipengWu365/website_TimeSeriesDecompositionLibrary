export type MethodEquation = {
  title: string;
  latex: string;
};

export type MethodCode = {
  title: string;
  language: "python" | "text";
  code: string;
};

export type MethodFigure = {
  src: string;
  caption: string;
};

export type MethodDetail = {
  overview: string;
  equations: MethodEquation[];
  code: MethodCode[];
  assumptions?: string[];
  figures?: MethodFigure[];
  notes?: string[];
};

export const METHOD_DETAILS: Record<string, MethodDetail> = {
  MA_BASELINE: {
    overview:
      "Centered moving average for trend, plus seasonal index averaging on the detrended series.",
    equations: [
      {
        title: "Trend (centered moving average)",
        latex: String.raw`\hat{T}_t = \frac{1}{w} \sum_{i=-k}^{k} y_{t+i}, \quad w = 2k + 1`,
      },
      {
        title: "Seasonal index mean",
        latex: String.raw`\hat{S}_{k + jP} = \bar{r}_k = \frac{1}{M_k} \sum_{j=0}^{M_k-1} (y_{k+jP} - \hat{T}_{k+jP})`,
      },
      {
        title: "Residual",
        latex: String.raw`\hat{R}_t = y_t - \hat{T}_t - \hat{S}_t`,
      },
    ],
    code: [
      {
        title: "Moving average + seasonal indices",
        language: "python",
        code: String.raw`def _moving_average(y: np.ndarray, window: int) -> np.ndarray:
    window = max(1, int(window))
    kernel = np.ones(window) / window
    return np.convolve(y, kernel, mode="same")

def _estimate_seasonal_indices(detrended: np.ndarray, period: int) -> np.ndarray:
    season = np.zeros_like(detrended)
    for offset in range(period):
        idx = np.arange(offset, len(detrended), period)
        season[idx] = np.mean(detrended[idx])
    season -= np.mean(season)
    return season`,
      },
    ],
    assumptions: [
      "Trend is piecewise-constant within the moving window.",
      "Seasonal component is strictly periodic with integer period.",
    ],
  },
  STL: {
    overview:
      "STL uses LOESS smoothing to iteratively extract seasonality and trend with a fixed period.",
    equations: [
      {
        title: "LOESS tricube weights",
        latex: String.raw`W(u) = (1 - |u|^3)^3,\quad |u| < 1`,
      },
      {
        title: "Seasonal update",
        latex: String.raw`S_t^{(k+1)} = C_t^{(k+1)} - L_t^{(k+1)}`,
      },
      {
        title: "Trend update",
        latex: String.raw`T_t^{(k+1)} = \text{LOESS}_{n_t}(y_t - S_t^{(k+1)})`,
      },
    ],
    code: [
      {
        title: "Statsmodels STL wrapper",
        language: "python",
        code: String.raw`stl = STL(y, period=period, **cfg)
res = stl.fit()
trend = np.asarray(res.trend)
seasonal = np.asarray(res.seasonal)
residual = np.asarray(res.resid)`,
      },
    ],
    assumptions: [
      "Trend is locally polynomial (smooth) under LOESS.",
      "Seasonal component is strictly periodic with fixed period.",
    ],
    figures: [
      {
        src: "/figs/fig03_stl_loess_principle_1766848070886.png",
        caption: "LOESS smoothing and seasonal subseries principle for STL.",
      },
      {
        src: "/figs/fig07_stl_failure_1766848255126.png",
        caption: "Failure mode on frequency-drifting seasonal signals.",
      },
    ],
  },
  MSTL: {
    overview:
      "MSTL extends STL to multiple seasonalities by iteratively removing each period.",
    equations: [
      {
        title: "Multi-seasonal update",
        latex: String.raw`S_t^{(m)} = \text{STL}_{P_m}(y_t - T_t - \sum_{i \neq m} S_t^{(i)})`,
      },
      {
        title: "Aggregate seasonality",
        latex: String.raw`S_t = \sum_{m=1}^{M} S_t^{(m)}`,
      },
    ],
    code: [
      {
        title: "Statsmodels MSTL wrapper",
        language: "python",
        code: String.raw`mstl = MSTL(y, periods=periods, **cfg)
res = mstl.fit()
season = res.seasonal.sum(axis=1)`,
      },
    ],
    assumptions: [
      "Each seasonal component is strictly periodic with known periods.",
      "Trend remains smooth across seasonal iterations.",
    ],
  },
  ROBUSTSTL: {
    overview:
      "Robust STL applies bisquare weights to reduce outlier influence in the LOESS fits.",
    equations: [
      {
        title: "Robust weights",
        latex: String.raw`\rho_t = \left(1 - (R_t / h)^2\right)^2,\quad |R_t| < h`,
      },
      {
        title: "Weighted LOESS",
        latex: String.raw`w_i^{robust}(x) = w_i(x) \cdot \rho_i`,
      },
    ],
    code: [
      {
        title: "Robust STL wrapper",
        language: "python",
        code: String.raw`stl = STL(y, period=period, robust=True, **cfg)
res = stl.fit()
trend = res.trend
season = res.seasonal`,
      },
    ],
    assumptions: [
      "Same periodicity assumptions as STL.",
      "Outliers are down-weighted by bisquare reweighting.",
    ],
  },
  SSA: {
    overview:
      "SSA embeds the series in a Hankel trajectory matrix, performs SVD, and groups components by frequency.",
    equations: [
      {
        title: "Trajectory matrix",
        latex: String.raw`\mathbf{X} = [y_1,\dots,y_K; y_2,\dots,y_{K+1}; \dots; y_L,\dots,y_N]`,
      },
      {
        title: "SVD",
        latex: String.raw`\mathbf{X} = \sum_{i=1}^{d} \sigma_i \mathbf{u}_i \mathbf{v}_i^T`,
      },
      {
        title: "Dominant frequency",
        latex: String.raw`f_i = \arg\max_f |\mathcal{F}[\mathbf{u}_i](f)|`,
      },
      {
        title: "Diagonal averaging",
        latex: String.raw`\tilde{y}_k = \frac{1}{|\mathcal{A}_k|} \sum_{(i,j)\in\mathcal{A}_k} X_{ij}`,
      },
    ],
    code: [
      {
        title: "SSA core loop",
        language: "python",
        code: String.raw`X = np.empty((L, K), dtype=float)
for i in range(K):
    X[:, i] = y_arr[i : i + L]
U, s, Vt = np.linalg.svd(X, full_matrices=False)
Xi = np.outer(U[:, idx], s[idx] * Vt[idx, :])`,
      },
    ],
    figures: [
      {
        src: "/figs/fig04_ssa_svd_1766848141585.png",
        caption: "SSA pipeline: embedding, SVD, grouping, and reconstruction.",
      },
    ],
    assumptions: [
      "Components occupy separable subspaces in the trajectory matrix.",
      "Trend and seasonal structure are low-rank.",
    ],
  },
  EMD: {
    overview:
      "EMD decomposes the series into intrinsic mode functions (IMFs) via iterative sifting.",
    equations: [
      {
        title: "IMF condition",
        latex: String.raw`m(t) = \frac{U(t) + L(t)}{2}, \quad h(t) \leftarrow h(t) - m(t)`,
      },
      {
        title: "Extrema / zero-crossing balance",
        latex: String.raw`\#\text{extrema}(c) \approx \#\text{zero-crossings}(c)`,
      },
      {
        title: "Reconstruction",
        latex: String.raw`y(t) = \sum_{k=1}^{M} c_k(t) + r(t)`,
      },
    ],
    code: [
      {
        title: "PyEMD wrapper with frequency grouping",
        language: "python",
        code: String.raw`emd = EMD()
imfs = emd.emd(y_arr)
dom_freqs = [dominant_frequency(comp, fs) for comp in imfs]
trend = aggregate_modes(imfs, trend_imfs)
season = aggregate_modes(imfs, season_imfs)`,
      },
    ],
    assumptions: [
      "Signal is a sum of locally symmetric AM/FM oscillations.",
      "Sifting converges to IMFs with zero-mean envelopes.",
    ],
  },
  CEEMDAN: {
    overview:
      "CEEMDAN averages EMD over noise-perturbed copies to reduce mode mixing.",
    equations: [
      {
        title: "Noise-assisted ensemble",
        latex: String.raw`y^{(i)}(t) = y(t) + w_i(t), \quad \bar{c}_k(t) = \frac{1}{I}\sum_{i=1}^{I} c_k^{(i)}(t)`,
      },
    ],
    code: [
      {
        title: "CEEMDAN wrapper",
        language: "python",
        code: String.raw`ceemdan = CEEMDAN()
if "trials" in cfg:
    ceemdan.trials = int(cfg["trials"])
imfs = np.asarray(ceemdan(y), dtype=float)`,
      },
    ],
    assumptions: [
      "Noise-assisted ensemble reduces mode mixing in IMFs.",
      "Grouping by dominant frequency recovers trend/season.",
    ],
  },
  VMD: {
    overview:
      "VMD solves a variational problem that enforces narrow-band modes around learned center frequencies.",
    equations: [
      {
        title: "Variational objective",
        latex: String.raw`\min_{u_k,\omega_k} \sum_k \left\| \partial_t \left[u_k^+(t) e^{-j \omega_k t}\right] \right\|_2^2`,
      },
      {
        title: "Center frequency update",
        latex: String.raw`\omega_k = \frac{\int_0^{\infty} \omega |\hat{u}_k(\omega)|^2 d\omega}{\int_0^{\infty} |\hat{u}_k(\omega)|^2 d\omega}`,
      },
      {
        title: "Reconstruction",
        latex: String.raw`f(t) = \sum_{k=1}^{K} u_k(t)`,
      },
    ],
    code: [
      {
        title: "VMD call",
        language: "python",
        code: String.raw`K = int(cfg.get("K", 5))
alpha = float(cfg.get("alpha", 2000.0))
modes, _, omega = VMD(y, alpha, tau, K, DC, init, tol)`,
      },
    ],
    figures: [
      {
        src: "/figs/fig05_vmd_frequency_1766848177394.png",
        caption: "VMD frequency-domain optimization intuition.",
      },
      {
        src: "/figs/fig08_vmd_success_1766848314528.png",
        caption: "VMD maintains seasonal recovery under frequency drift.",
      },
    ],
    assumptions: [
      "Signal is a sum of narrow-band modes.",
      "Modes are spectrally separable.",
    ],
  },
  WAVELET: {
    overview:
      "Wavelet decomposition separates low- and high-frequency content via filter banks.",
    equations: [
      {
        title: "DWT filter bank",
        latex: String.raw`a_j[n] = (a_{j-1} * h)[2n], \quad d_j[n] = (a_{j-1} * g)[2n]`,
      },
      {
        title: "Reconstruction",
        latex: String.raw`y(t) = \sum_k c_{J,k}\phi_{J,k}(t) + \sum_{j=1}^{J}\sum_k d_{j,k}\psi_{j,k}(t)`,
      },
      {
        title: "Trend/season assignment",
        latex: String.raw`\hat{T} \leftarrow \text{levels } \{0\},\quad \hat{S} \leftarrow \text{levels } \{1,2\}`,
      },
    ],
    code: [
      {
        title: "PyWavelets wrapper",
        language: "python",
        code: String.raw`coeffs = pywt.wavedec(y, wavelet, level=level)
trend = _reconstruct_from_levels(coeffs, trend_levels, wavelet_name, len(y))
season = _reconstruct_from_levels(coeffs, season_levels, wavelet_name, len(y))`,
      },
    ],
    assumptions: [
      "Components are separable across wavelet scales.",
      "Low-frequency levels capture trend; mid-levels capture seasonality.",
    ],
  },
  GABOR_BANDS: {
    overview:
      "Short-time Fourier transform (Gabor) decomposition into fixed time-frequency bands.",
    equations: [
      {
        title: "STFT",
        latex: String.raw`Z[m,k] = \sum_n x[n] w[n-m] e^{-j 2\pi k n / N}`,
      },
      {
        title: "Band reconstruction",
        latex: String.raw`\hat{x}_{band}(t) = \sum_{k \in \mathcal{B}} Z[m,k] e^{j 2\pi k t / N}`,
      },
    ],
    code: [
      {
        title: "Gabor dispatch (bands)",
        language: "python",
        code: String.raw`gabor_cfg = GaborConfig(**gabor_kwargs)
gabor_result = gabor_decompose(y, gabor_cfg)
return _gabor_to_decomp_result(y, gabor_result, "bands")`,
      },
    ],
    assumptions: [
      "Signal energy is concentrated in fixed time-frequency bands.",
      "Window length controls bias-variance in time-frequency resolution.",
    ],
  },
  GABOR_RIDGE: {
    overview:
      "Ridge tracking on the STFT magnitude to follow dominant time-varying frequencies.",
    equations: [
      {
        title: "Ridge selection",
        latex: String.raw`k^*(m) = \arg\max_k |Z[m,k]|`,
      },
    ],
    code: [
      {
        title: "Ridge toggle",
        language: "python",
        code: String.raw`gabor_cfg = GaborConfig(**gabor_kwargs)
gabor_cfg.ridge = True
gabor_result = gabor_decompose(y, gabor_cfg)`,
      },
    ],
    assumptions: [
      "A dominant ridge captures the primary oscillatory component.",
      "Ridge continuity is stable across time frames.",
    ],
  },
  GABOR_CLUSTER: {
    overview:
      "Clusters STFT atoms in time-frequency space, then sums cluster reconstructions into trend/season.",
    equations: [
      {
        title: "Feature assignment",
        latex: String.raw`c = \arg\min_j \|\phi(t,f,|Z|) - \mu_j\|_2^2`,
      },
    ],
    code: [
      {
        title: "Cluster reconstruction",
        language: "python",
        code: String.raw`feats, Z = _extract_gabor_features(x, cfg, window)
labels = _assign_clusters_faiss(feats, model)
Zj = Z * mask
xj = _istft_rfft(Zj, L, hop, n_fft, window, N)`,
      },
    ],
    assumptions: [
      "Clusters in time-frequency space correspond to coherent components.",
      "Trend resides in low-frequency clusters under a threshold.",
    ],
  },
  STD: {
    overview:
      "Multi-scale basis projection with cached components; current wrapper falls back to SSA when unavailable.",
    equations: [
      {
        title: "Windowed basis projection",
        latex: String.raw`\hat{x} = \mathbf{B}\mathbf{c}, \quad \mathbf{c} = \mathbf{B}^\top x`,
      },
    ],
    code: [
      {
        title: "STD wrapper (fallback)",
        language: "python",
        code: String.raw`try:
    import fasttimes
    _HAS_FASTTIMES = True
except ImportError:
    _HAS_FASTTIMES = False
if not _HAS_FASTTIMES:
    return ssa_decompose(y, params)`,
      },
    ],
    assumptions: [
      "Multi-scale bases are available for projection.",
      "Fallback path behaves like SSA when bases are missing.",
    ],
    notes: ["The public wrapper is a placeholder until the fasttimes backend is available."],
  },
};
