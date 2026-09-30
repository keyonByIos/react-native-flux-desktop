"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.WaterfallChart = WaterfallChart;
// Waterfall：瀑布图。复用竖向 Plot（类目 x + 数值 y），每根柱「浮动」于累计区间 [prevCum, cum]。
// 增=success 色、减=error 色、合计行（totalField 真值）从中性色 0 起。入场：每柱自其底沿长高、类目错峰。
const react_1 = __importDefault(require("react"));
const components_1 = require("../../components");
const theme_1 = require("../../theme");
const common_1 = require("../core/common");
const data_1 = require("../core/data");
const scale_1 = require("../core/scale");
const clamp01 = (v) => Math.max(0, Math.min(1, v));
function WaterfallChart(props) {
    const theme = (0, common_1.useChartTheme)();
    const { token } = (0, theme_1.useToken)();
    const { data, xField = 'label', yField = 'value', totalField, color, height = 300, width, radius = 3, tooltip = true, animation = true, animateDuration = 1000, stagger = 0.45, yAxisFormatter = scale_1.compactNumber, grid, style, } = props;
    const [measured, onLayout] = (0, common_1.useMeasuredWidth)(width ?? 520);
    const w = width ?? measured;
    const p = (0, common_1.useEnter)(animation, animateDuration);
    const pairs = (0, data_1.flatPairs)(data, xField, yField);
    const nCat = pairs.length;
    const inc = color?.increase ?? token.colorSuccess;
    const dec = color?.decrease ?? token.colorError;
    const tot = color?.total ?? theme.primary;
    // 逐行推累计：合计行取绝对值并重置基准为 0（其后增量继续累计）
    let cum = 0;
    const bars = pairs.map((d, i) => {
        const isTotal = totalField ? !!data[i][totalField] : false;
        if (isTotal) {
            const top = d.value;
            cum = d.value; // 合计即当前累计
            return { from: 0, to: top, isTotal, label: d.label };
        }
        const from = cum;
        const to = cum + d.value;
        cum = to;
        return { from, to, isTotal, label: d.label };
    });
    const maxCum = Math.max(0, ...bars.map((b) => Math.max(b.from, b.to)));
    const { niceMax, ticks } = (0, scale_1.niceTicks)(maxCum);
    const inner = 0.35;
    const band = (0, scale_1.bandScale)(nCat, [44, Math.max(44, w - 18)], { paddingInner: inner, paddingOuter: 0.175 });
    const xLabelPositions = pairs.map((_, i) => band.scale(i) + band.bandwidth / 2);
    const seg = (i) => {
        const start = nCat <= 1 ? 0 : (i / nCat) * stagger;
        return clamp01((p - start) / (1 - stagger));
    };
    return (react_1.default.createElement(components_1.View, { style: [{ gap: theme.labelSize }, style], onLayout: onLayout },
        react_1.default.createElement(common_1.Plot, { width: w, height: height, categories: pairs.map((d) => d.label), yTicks: ticks, yMax: niceMax, yFormatter: yAxisFormatter, xLabelPositions: xLabelPositions, grid: grid, interactive: tooltip, tooltipFor: (i) => {
                const bar = bars[i];
                const delta = bar.to - bar.from;
                const col = bar.isTotal ? tot : delta >= 0 ? inc : dec;
                return {
                    title: pairs[i].label,
                    rows: bar.isTotal
                        ? [{ name: '合计', color: tot, value: yAxisFormatter(bar.to) }]
                        : [
                            { name: delta >= 0 ? '增' : '减', color: col, value: `${delta >= 0 ? '+' : '−'}${yAxisFormatter(Math.abs(delta))}` },
                            { name: '累计', value: yAxisFormatter(bar.to) },
                        ],
                };
            } }, (ctx) => {
            const b = ctx.band(nCat, inner);
            const nodes = [];
            bars.forEach((bar, i) => {
                const t = seg(i);
                const from = bar.from;
                const to = bar.from + (bar.to - bar.from) * t;
                const hi = Math.max(from, to);
                const lo = Math.min(from, to);
                const topY = ctx.yAt(hi);
                const botY = ctx.yAt(lo);
                const col = bar.isTotal ? tot : bar.to >= bar.from ? inc : dec;
                nodes.push(react_1.default.createElement(components_1.View, { key: i, style: {
                        position: 'absolute',
                        left: b.scale(i),
                        top: topY,
                        width: Math.max(2, b.bandwidth),
                        height: Math.max(1, botY - topY),
                        borderTopLeftRadius: radius,
                        borderTopRightRadius: radius,
                        backgroundColor: col,
                        opacity: ctx.activeIndex == null || ctx.activeIndex === i ? 1 : 0.45,
                    } }));
                // 连接虚线到下一根柱的底沿（非末根）
                if (i < bars.length - 1) {
                    const y = ctx.yAt(bar.to);
                    const x0 = b.scale(i) + b.bandwidth;
                    const x1 = b.scale(i + 1);
                    nodes.push(react_1.default.createElement(components_1.View, { key: `c${i}`, style: { position: 'absolute', left: x0, top: y, width: Math.max(0, x1 - x0), height: 1, backgroundColor: theme.gridLine } }));
                }
            });
            return react_1.default.createElement(react_1.default.Fragment, null, nodes);
        })));
}
exports.default = WaterfallChart;
