"use strict";
// Histogram 分箱原语：把连续样本切成等宽区间并计数。纯函数、无渲染关切，便于探针验证。
// 默认箱数走 Freedman–Diaconis（抗离群），退化时（零 IQR / 样本过少）回退 Sturges。可外部指定 binCount 或 binWidth。
Object.defineProperty(exports, "__esModule", { value: true });
exports.suggestBinCount = suggestBinCount;
exports.histogram = histogram;
/** 建议箱数：Freedman–Diaconis 优先，零 IQR / 样本 <2 时回退 Sturges；夹在 [1, maxBins]。 */
function suggestBinCount(values, maxBins = 40) {
    const clean = (values ?? []).filter((v) => Number.isFinite(v));
    const n = clean.length;
    if (n < 2)
        return 1;
    const sorted = clean.slice().sort((a, b) => a - b);
    const q = (p) => {
        const idx = (n - 1) * p;
        const lo = Math.floor(idx);
        const hi = Math.ceil(idx);
        return lo === hi ? sorted[lo] : sorted[lo] + (sorted[hi] - sorted[lo]) * (idx - lo);
    };
    const iqr = q(0.75) - q(0.25);
    const min = sorted[0];
    const max = sorted[n - 1];
    const range = max - min;
    if (range <= 0)
        return 1;
    let bins;
    if (iqr > 0) {
        const binWidth = (2 * iqr) / Math.cbrt(n); // FD
        bins = Math.ceil(range / binWidth);
    }
    else {
        bins = Math.ceil(Math.log2(n) + 1); // Sturges
    }
    return Math.max(1, Math.min(maxBins, bins));
}
/**
 * 等宽分箱计数。opts.binCount 与 opts.binWidth 二选一（binWidth 优先）；都不给则用 suggestBinCount。
 * 末箱右闭（含 max），其余左闭右开。空/单值样本返回覆盖该值的 1 个箱。
 */
function histogram(values, opts = {}) {
    const clean = (values ?? []).filter((v) => Number.isFinite(v));
    const n = clean.length;
    if (n === 0)
        return [];
    const min = Math.min(...clean);
    const max = Math.max(...clean);
    if (min === max) {
        return [{ x0: min, x1: max, count: n }];
    }
    let width;
    let count;
    if (opts.binWidth != null && opts.binWidth > 0) {
        width = opts.binWidth;
        count = Math.max(1, Math.ceil((max - min) / width));
    }
    else {
        count = Math.max(1, Math.floor(opts.binCount ?? suggestBinCount(clean)));
        width = (max - min) / count;
    }
    const bins = [];
    for (let i = 0; i < count; i++) {
        bins.push({ x0: Number((min + i * width).toFixed(10)), x1: Number((min + (i + 1) * width).toFixed(10)), count: 0 });
    }
    // 用原始 min + k*width 判界，末箱右闭；避免浮点边界丢点
    for (const v of clean) {
        let idx = Math.floor((v - min) / width);
        if (idx >= count)
            idx = count - 1; // 落在 max 或浮点溢出 → 末箱
        if (idx < 0)
            idx = 0;
        bins[idx].count += 1;
    }
    return bins;
}
