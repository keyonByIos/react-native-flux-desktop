"use strict";
// Violin 密度原语：核密度估计（KDE，高斯核）把一组原始样本平滑成密度曲线，供小提琴轮廓使用。
// 纯函数、无渲染关切，便于探针验证。带宽用 Silverman 经验法则，退化（零方差）时给极小正带宽避免除零。
Object.defineProperty(exports, "__esModule", { value: true });
exports.silvermanBandwidth = silvermanBandwidth;
exports.kde = kde;
exports.maxDensity = maxDensity;
/** 样本标准差（n-1）。n<2 返回 0。 */
function std(values) {
    const n = values.length;
    if (n < 2)
        return 0;
    const mean = values.reduce((a, b) => a + b, 0) / n;
    const varr = values.reduce((a, b) => a + (b - mean) * (b - mean), 0) / (n - 1);
    return Math.sqrt(varr);
}
/** type-7 分位数（arr 升序）。 */
function quantile(sorted, p) {
    const n = sorted.length;
    if (n === 0)
        return NaN;
    if (n === 1)
        return sorted[0];
    const idx = (n - 1) * Math.max(0, Math.min(1, p));
    const lo = Math.floor(idx);
    const hi = Math.ceil(idx);
    return lo === hi ? sorted[lo] : sorted[lo] + (sorted[hi] - sorted[lo]) * (idx - lo);
}
/**
 * Silverman 经验带宽：h = 0.9 · min(sd, IQR/1.34) · n^(-1/5)。
 * 零方差 / 样本过少时退回基于极差的稳健值，最终保证 h>0。
 */
function silvermanBandwidth(values) {
    const clean = (values ?? []).filter((v) => Number.isFinite(v));
    const n = clean.length;
    if (n < 2)
        return 1;
    const sorted = clean.slice().sort((a, b) => a - b);
    const sd = std(clean);
    const iqr = quantile(sorted, 0.75) - quantile(sorted, 0.25);
    const spread = Math.min(sd || Infinity, (iqr || Infinity) / 1.34);
    const range = sorted[n - 1] - sorted[0];
    let h = 0.9 * (Number.isFinite(spread) && spread > 0 ? spread : (range || 1) / 4) * Math.pow(n, -1 / 5);
    if (!Number.isFinite(h) || h <= 0)
        h = (range || 1) / 10;
    return h;
}
/**
 * 高斯核 KDE。在 [min - 3h, max + 3h]（可裁剪到数据范围）均匀取 gridSize 个采样点，
 * 返回逐点密度。density 非负；无有效样本返回 []。
 * opts.at：给定自定义采样位置数组（优先于 gridSize/范围推导）。
 */
function kde(values, opts = {}) {
    const clean = (values ?? []).filter((v) => Number.isFinite(v));
    const n = clean.length;
    if (n === 0)
        return [];
    const h = opts.bandwidth && opts.bandwidth > 0 ? opts.bandwidth : silvermanBandwidth(clean);
    const sorted = clean.slice().sort((a, b) => a - b);
    const min = sorted[0];
    const max = sorted[n - 1];
    let grid;
    if (opts.at && opts.at.length) {
        grid = opts.at.slice();
    }
    else {
        const gs = Math.max(2, Math.floor(opts.gridSize ?? 48));
        const lo = opts.cutToRange ? min : min - 3 * h;
        const hi = opts.cutToRange ? max : max + 3 * h;
        grid = [];
        for (let i = 0; i < gs; i++)
            grid.push(lo + ((hi - lo) * i) / (gs - 1));
    }
    const invH = 1 / h;
    const norm = 1 / (n * h * Math.sqrt(2 * Math.PI));
    return grid.map((g) => {
        let sum = 0;
        for (const xi of clean) {
            const u = (g - xi) * invH;
            sum += Math.exp(-0.5 * u * u);
        }
        return { value: g, density: sum * norm };
    });
}
/** 一组 DensityPoint[] 的最大密度（跨多条小提琴共享同一横向量程时用）。空返回 0。 */
function maxDensity(series) {
    let m = 0;
    for (const s of series)
        for (const pt of s)
            if (pt.density > m)
                m = pt.density;
    return m;
}
