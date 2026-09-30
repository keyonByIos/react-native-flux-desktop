"use strict";
// 比例尺原语：把数据域线性映射到像素域，纯函数、无渲染关切。
// 笛卡尔类图（line/area/column/bar）共用，保证刻度数学一致。
Object.defineProperty(exports, "__esModule", { value: true });
exports.linearScale = linearScale;
exports.niceTicks = niceTicks;
exports.bandScale = bandScale;
exports.compactNumber = compactNumber;
exports.linearTicks = linearTicks;
function linearScale(domain, range) {
    const [d0, d1] = domain;
    const [r0, r1] = range;
    const span = d1 - d0 || 1;
    const rspan = r1 - r0 || 1;
    const scale = ((value) => r0 + ((value - d0) / span) * rspan);
    scale.invert = (px) => d0 + ((px - r0) / rspan) * span;
    scale.domain = domain;
    scale.range = range;
    return scale;
}
/**
 * 把数据最大值向上取整到「漂亮」的轴界，并产出等距刻度（恒从 0 起）。
 * 复刻 d3/ECharts 的 1/2/5 × 10ⁿ 步进启发式，保证轴刻度可读。
 */
function niceTicks(max, count = 4) {
    if (!Number.isFinite(max) || max <= 0)
        return { niceMax: 1, ticks: [0, 1] };
    const rawStep = max / count;
    const mag = Math.pow(10, Math.floor(Math.log10(rawStep)));
    const norm = rawStep / mag;
    let step;
    if (norm <= 1)
        step = 1;
    else if (norm <= 2)
        step = 2;
    else if (norm <= 5)
        step = 5;
    else
        step = 10;
    step *= mag;
    const niceMax = Math.ceil(max / step) * step;
    const ticks = [];
    for (let v = 0; v <= niceMax + step / 1e6; v += step)
        ticks.push(Number(v.toFixed(10)));
    return { niceMax, ticks };
}
function bandScale(count, range, opts = {}) {
    const { paddingInner = 0.35, paddingOuter = 0.175 } = opts;
    const [r0, r1] = range;
    const width = Math.max(r1 - r0, 0);
    const n = Math.max(count, 1);
    const step = width / (n - paddingInner + paddingOuter * 2);
    const bandwidth = step * (1 - paddingInner);
    const start = r0 + step * paddingOuter;
    return { bandwidth, step, scale: (i) => start + i * step };
}
/** 数值紧凑格式化：12345 -> 12.3k，供轴与标签复用。 */
function compactNumber(v) {
    const abs = Math.abs(v);
    if (abs >= 1e9)
        return (v / 1e9).toFixed(abs >= 1e10 ? 0 : 1).replace(/\.0$/, '') + 'B';
    if (abs >= 1e6)
        return (v / 1e6).toFixed(abs >= 1e7 ? 0 : 1).replace(/\.0$/, '') + 'M';
    if (abs >= 1e3)
        return (v / 1e3).toFixed(abs >= 1e4 ? 0 : 1).replace(/\.0$/, '') + 'k';
    return Number.isInteger(v) ? String(v) : v.toFixed(1);
}
/**
 * 线性轴刻度：给定 [min,max] 产出跨界的「漂亮」等距刻度（1/2/5 × 10ⁿ 步进）。
 * 与 niceTicks 的区别：niceTicks 恒从 0 起，本函数支持任意（含负）下界，供散点 x 轴等用。
 */
function linearTicks(min, max, count = 5) {
    if (!Number.isFinite(min) || !Number.isFinite(max) || min === max)
        return [Number.isFinite(min) ? min : 0];
    const rawStep = (max - min) / count;
    const mag = Math.pow(10, Math.floor(Math.log10(Math.abs(rawStep) || 1)));
    const norm = rawStep / mag;
    let step;
    if (norm <= 1)
        step = 1;
    else if (norm <= 2)
        step = 2;
    else if (norm <= 5)
        step = 5;
    else
        step = 10;
    step *= mag;
    const start = Math.floor(min / step) * step;
    const end = Math.ceil(max / step) * step;
    const ticks = [];
    for (let v = start; v <= end + step / 1e6; v += step)
        ticks.push(Number(v.toFixed(10)));
    return ticks;
}
