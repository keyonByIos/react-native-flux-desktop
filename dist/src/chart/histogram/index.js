"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.HistogramChart = HistogramChart;
// Histogram：直方图。原始样本 → 等宽分箱计数（core/histogram）→ 相邻柱（paddingInner 近 0）。
// 复用笛卡尔 Plot（0 基线，频数天然从 0 起）；入场每柱自基线长高、类目错峰。悬停逐箱显 [下界,上界) 与频数。
// 柱为轴对齐矩形 → View 拼装，无锯齿。
const react_1 = __importDefault(require("react"));
const components_1 = require("../../components");
const common_1 = require("../core/common");
const scale_1 = require("../core/scale");
const theme_1 = require("../core/theme");
const histogram_1 = require("../core/histogram");
const clamp01 = (v) => Math.max(0, Math.min(1, v));
function HistogramChart(props) {
    const theme = (0, common_1.useChartTheme)();
    const { data, valueField, binCount, binWidth, color, height = 300, width, label = false, tooltip = true, animation = true, animateDuration = 800, binFormatter = scale_1.compactNumber, yAxisFormatter = scale_1.compactNumber, grid, style, } = props;
    const [measured, onLayout] = (0, common_1.useMeasuredWidth)(width ?? 520);
    const w = width ?? measured;
    const p = (0, common_1.useEnter)(animation, animateDuration);
    const values = data.map((d) => Number(d[valueField])).filter((v) => Number.isFinite(v));
    const bins = (0, histogram_1.histogram)(values, { binCount, binWidth });
    const n = bins.length;
    const col = (0, theme_1.seriesColor)(0, color, theme);
    const maxCount = Math.max(1, ...bins.map((b) => b.count));
    const { niceMax, ticks } = (0, scale_1.niceTicks)(maxCount);
    const categories = bins.map((b) => binFormatter(b.x0));
    const inner = 0.04;
    const band = (0, scale_1.bandScale)(n, [44, Math.max(44, w - 18)], { paddingInner: inner, paddingOuter: 0.02 });
    const xLabelPositions = bins.map((_, i) => band.scale(i) + band.bandwidth / 2);
    const stagger = 0.5;
    const seg = (i) => {
        const start = n <= 1 ? 0 : (i / n) * stagger;
        return clamp01((p - start) / (1 - stagger));
    };
    const tooltipFor = (i) => {
        const b = bins[i];
        return {
            title: `[${binFormatter(b.x0)}, ${binFormatter(b.x1)}${i === n - 1 ? ']' : ')'}`,
            rows: [{ name: '频数', value: String(b.count), color: col }],
        };
    };
    return (react_1.default.createElement(components_1.View, { style: [{ gap: theme.labelSize }, style], onLayout: onLayout },
        react_1.default.createElement(common_1.Plot, { width: w, height: height, categories: categories, yTicks: ticks, yMax: niceMax, yFormatter: yAxisFormatter, xLabelPositions: xLabelPositions, grid: grid, interactive: tooltip, tooltipFor: tooltipFor }, (ctx) => {
            const b = ctx.band(n, inner);
            const bars = [];
            bins.forEach((bn, i) => {
                const t = seg(i);
                const x0 = b.scale(i);
                const bw = Math.max(1, b.bandwidth - 1);
                const topY = ctx.yAt(bn.count * t);
                const hBar = Math.max(0, ctx.baseline - topY);
                const isActive = ctx.activeIndex === i;
                bars.push(react_1.default.createElement(components_1.View, { key: i, style: {
                        position: 'absolute',
                        left: x0,
                        top: topY,
                        width: bw,
                        height: hBar,
                        backgroundColor: col,
                        opacity: ctx.activeIndex == null || isActive ? 1 : 0.45,
                    } }));
                if (label && t > 0.85 && bn.count > 0) {
                    bars.push(react_1.default.createElement(components_1.Text, { key: `lb${i}`, style: { position: 'absolute', left: x0 + bw / 2 - 40, top: topY - theme.labelSize - 4, width: 80, textAlign: 'center', fontSize: theme.labelSize, color: theme.label }, numberOfLines: 1 }, bn.count));
                }
            });
            return react_1.default.createElement(react_1.default.Fragment, null, bars);
        })));
}
exports.default = HistogramChart;
