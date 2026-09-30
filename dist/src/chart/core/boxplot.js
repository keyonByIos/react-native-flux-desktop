"use strict";
// BoxPlot 统计原语：由一组原始数值算出「五数概括 + 离群点」（Tukey 箱线图口径）。
// 纯函数、无渲染关切，便于探针验证。分位数用 type-7 线性插值（与 numpy/d3 默认一致）。
// 离群判定：低于 Q1-1.5·IQR 或高于 Q3+1.5·IQR（fence 之外）；须线（whisker）止于 fence 内的极值。
Object.defineProperty(exports, "__esModule", { value: true });
exports.quantileSorted = quantileSorted;
exports.boxStats = boxStats;
exports.boxDomain = boxDomain;
/** 升序数值数组上的 type-7 分位数（0..1）。要求 arr 已排序且非空。 */
function quantileSorted(arr, p) {
    const n = arr.length;
    if (n === 0)
        return NaN;
    if (n === 1)
        return arr[0];
    const idx = (n - 1) * Math.max(0, Math.min(1, p));
    const lo = Math.floor(idx);
    const hi = Math.ceil(idx);
    if (lo === hi)
        return arr[lo];
    const frac = idx - lo;
    return arr[lo] + (arr[hi] - arr[lo]) * frac;
}
/** 由原始数值算箱线图统计；无有效样本返回 null。 */
function boxStats(values) {
    const clean = (values ?? []).filter((v) => Number.isFinite(v)).slice().sort((a, b) => a - b);
    const n = clean.length;
    if (n === 0)
        return null;
    const q1 = quantileSorted(clean, 0.25);
    const median = quantileSorted(clean, 0.5);
    const q3 = quantileSorted(clean, 0.75);
    const iqr = q3 - q1;
    const lowerFence = q1 - 1.5 * iqr;
    const upperFence = q3 + 1.5 * iqr;
    const outliers = [];
    let whiskerLow = clean[n - 1];
    let whiskerHigh = clean[0];
    for (const v of clean) {
        if (v < lowerFence || v > upperFence)
            outliers.push(v);
        else {
            if (v < whiskerLow)
                whiskerLow = v;
            if (v > whiskerHigh)
                whiskerHigh = v;
        }
    }
    // 全部为离群点（理论不可能，护栏）：须线退回 min/max
    if (outliers.length === n) {
        whiskerLow = clean[0];
        whiskerHigh = clean[n - 1];
    }
    const mean = clean.reduce((a, b) => a + b, 0) / n;
    return { count: n, min: clean[0], max: clean[n - 1], q1, median, q3, iqr, whiskerLow, whiskerHigh, outliers, mean };
}
/** 一组 BoxStats 的绘图值域下/上界（含须线与离群点），供 y 轴定域。 */
function boxDomain(boxes) {
    let lo = Infinity;
    let hi = -Infinity;
    for (const b of boxes) {
        lo = Math.min(lo, b.whiskerLow, b.min);
        hi = Math.max(hi, b.whiskerHigh, b.max);
    }
    if (!Number.isFinite(lo) || !Number.isFinite(hi))
        return [0, 1];
    if (lo === hi)
        return [lo - 1, hi + 1];
    return [lo, hi];
}
