"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ComboChart = ComboChart;
// Combo：折柱组合。同一类目轴上，柱取 barField、折线取 lineField，共享左 y 轴（单轴，避免右侧标签溢出）。
// 入场：柱自基线长高（错峰）+ 折线沿弧长描出。折线点位对齐柱带中心。
const react_1 = __importDefault(require("react"));
const components_1 = require("../../components");
const common_1 = require("../core/common");
const scale_1 = require("../core/scale");
const geometry_1 = require("../core/geometry");
const mark_1 = require("../core/mark");
const clamp01 = (v) => Math.max(0, Math.min(1, v));
function ComboChart(props) {
    const theme = (0, common_1.useChartTheme)();
    const { data, xField, barField, lineField, color, height = 300, width, radius = 4, legend = true, tooltip = true, animation = true, animateDuration = 1000, yAxisFormatter = scale_1.compactNumber, grid, style, } = props;
    const [measured, onLayout] = (0, common_1.useMeasuredWidth)(width ?? 520);
    const w = width ?? measured;
    const p = (0, common_1.useEnter)(animation, animateDuration);
    const barCol = color?.[0] ?? theme.palette[0];
    const lineCol = color?.[1] ?? theme.palette[2];
    const categories = [];
    const catIdx = new Map();
    const barVals = [];
    const lineVals = [];
    for (const row of data) {
        const c = String(row[xField]);
        let i = catIdx.get(c);
        if (i === undefined) {
            i = categories.length;
            catIdx.set(c, i);
            categories.push(c);
            barVals.push(0);
            lineVals.push(0);
        }
        barVals[i] += Number(row[barField]) || 0;
        lineVals[i] = Number(row[lineField]) || 0;
    }
    const nCat = categories.length;
    const { isHidden, toggle, active } = (0, common_1.useLegendToggle)(2);
    const barOn = !isHidden(0);
    const lineOn = !isHidden(1);
    const yMax = Math.max(1, ...(barOn ? barVals : []), ...(lineOn ? lineVals : []));
    const { niceMax, ticks } = (0, scale_1.niceTicks)(yMax);
    const inner = 0.4;
    const band = (0, scale_1.bandScale)(nCat, [44, Math.max(44, w - 18)], { paddingInner: inner, paddingOuter: 0.175 });
    const xLabelPositions = categories.map((_, i) => band.scale(i) + band.bandwidth / 2);
    const legendItems = [
        { name: barField, color: barCol },
        { name: lineField, color: lineCol },
    ];
    return (react_1.default.createElement(components_1.View, { style: [{ gap: theme.labelSize }, style], onLayout: onLayout },
        react_1.default.createElement(common_1.Plot, { width: w, height: height, categories: categories, yTicks: ticks, yMax: niceMax, yFormatter: yAxisFormatter, xLabelPositions: xLabelPositions, grid: grid, interactive: tooltip, tooltipFor: (i) => ({ title: categories[i], rows: [].concat(barOn ? [{ name: barField, color: barCol, value: yAxisFormatter(barVals[i]) }] : [], lineOn ? [{ name: lineField, color: lineCol, value: yAxisFormatter(lineVals[i]) }] : []) }) }, (ctx) => {
            const b = ctx.band(nCat, inner);
            const nodes = [];
            // 柱
            if (barOn)
                barVals.forEach((v, i) => {
                    const start = nCat <= 1 ? 0 : (i / nCat) * 0.45;
                    const t = clamp01((p - start) / (1 - 0.45));
                    const topY = ctx.yAt(v * t);
                    nodes.push(react_1.default.createElement(components_1.View, { key: `bar${i}`, style: {
                            position: 'absolute',
                            left: b.scale(i),
                            top: topY,
                            width: Math.max(2, b.bandwidth),
                            height: Math.max(0, ctx.baseline - topY),
                            borderTopLeftRadius: radius,
                            borderTopRightRadius: radius,
                            backgroundColor: barCol,
                            opacity: ctx.activeIndex == null || ctx.activeIndex === i ? 1 : 0.45,
                        } }));
                });
            // 折线（对齐柱心）
            if (lineOn) {
                const pts = categories.map((_, i) => [b.scale(i) + b.bandwidth / 2, ctx.yAt(lineVals[i])]);
                const total = (0, geometry_1.polylineLength)(pts);
                const shown = (0, geometry_1.truncatePolyline)(pts, p);
                nodes.push(react_1.default.createElement(mark_1.Segments, { key: "line", pts: shown, color: lineCol, width: 2.5 }));
                const vis = pts.filter((_, i) => total <= 0 || (i / Math.max(pts.length - 1, 1)) * total <= total * p + 0.5);
                nodes.push(react_1.default.createElement(mark_1.Dots, { key: "dots", pts: vis, color: lineCol, r: 3.5, bg: theme.tooltipBg, opacity: p }));
            }
            return react_1.default.createElement(react_1.default.Fragment, null, nodes);
        }),
        legend ? react_1.default.createElement(common_1.ChartLegend, { items: legendItems, active: active, onToggleIndex: toggle }) : null));
}
exports.default = ComboChart;
