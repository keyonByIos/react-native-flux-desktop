"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ColumnChart = ColumnChart;
// Column：竖向柱状。band 比例尺定柱位；入场每柱从基线长高，类目间错峰（seg 分段进度）。
// grouped（系列并排分带宽）/ stack（系列累加堆叠）两种多序列布局。
const react_1 = __importDefault(require("react"));
const components_1 = require("../../components");
const common_1 = require("../core/common");
const data_1 = require("../core/data");
const scale_1 = require("../core/scale");
const theme_1 = require("../core/theme");
const clamp01 = (v) => Math.max(0, Math.min(1, v));
function ColumnChart(props) {
    const theme = (0, common_1.useChartTheme)();
    const { data, xField, yField, seriesField, color, height = 280, width, stack = false, radius = 4, label = false, maxColumnWidth, legend = true, tooltip = true, animation = true, animateDuration = 900, stagger = 0.45, yAxisFormatter = scale_1.compactNumber, xAxisFormatter, grid, referenceLine, style, } = props;
    const [measured, onLayout] = (0, common_1.useMeasuredWidth)(width ?? 520);
    const w = width ?? measured;
    const p = (0, common_1.useEnter)(animation, animateDuration);
    const prep = (0, data_1.prepare)(data, xField, yField, seriesField);
    const { isHidden, toggle, active } = (0, common_1.useLegendToggle)(prep.series.length);
    const nCat = prep.categories.length;
    const inner = stack ? 0.25 : 0.35;
    const visIdx = prep.series.map((_, i) => i).filter((i) => !isHidden(i));
    const visN = Math.max(1, visIdx.length);
    const yMax = stack
        ? Math.max(...prep.categories.map((_, i) => visIdx.reduce((a, si) => a + (prep.series[si].points[i] ?? 0), 0)), 1)
        : Math.max(...visIdx.flatMap((si) => prep.series[si].points.map((v) => v ?? 0)), 1);
    const { niceMax, ticks } = (0, scale_1.niceTicks)(Math.max(yMax, (referenceLine ?? []).reduce((m, r) => Math.max(m, r.value), 0)));
    const legendItems = prep.series.map((s, i) => ({ name: s.name, color: (0, theme_1.seriesColor)(i, color, theme) }));
    // 类目标签中心（柱带中心）——与 ctx.band 用同一 paddingInner，保持一致
    const band = (0, scale_1.bandScale)(nCat, [44, Math.max(44, w - 18)], { paddingInner: inner, paddingOuter: 0.175 });
    const xLabelPositions = prep.categories.map((_, i) => band.scale(i) + band.bandwidth / 2);
    const seg = (i) => {
        const start = nCat <= 1 ? 0 : (i / nCat) * stagger;
        return clamp01((p - start) / (1 - stagger));
    };
    return (react_1.default.createElement(components_1.View, { style: [{ gap: theme.labelSize }, style], onLayout: onLayout },
        react_1.default.createElement(common_1.Plot, { width: w, height: height, categories: prep.categories, yTicks: ticks, yMax: niceMax, yFormatter: yAxisFormatter, xFormatter: xAxisFormatter, xLabelPositions: xLabelPositions, grid: grid, interactive: tooltip, tooltipFor: (i) => ({
                title: prep.categories[i],
                rows: visIdx.map((si) => {
                    const s = prep.series[si];
                    return { name: s.name, color: (0, theme_1.seriesColor)(si, color, theme), value: s.points[i] == null ? '—' : yAxisFormatter(s.points[i]) };
                }),
            }) }, (ctx) => {
            const b = ctx.band(nCat, inner);
            const bars = [];
            prep.categories.forEach((_c, ci) => {
                let accTop = 0;
                visIdx.forEach((si, k) => {
                    const s = prep.series[si];
                    const v = s.points[ci] ?? 0;
                    const col = (0, theme_1.seriesColor)(si, color, theme);
                    const t = seg(ci);
                    // 宽度上限：限宽后在应得槽位内居中（stack 整带居中，grouped 各自槽内居中）
                    const rawW = Math.max(2, (stack ? b.bandwidth : b.bandwidth / visN) - (stack ? 0 : 1));
                    const bw = maxColumnWidth != null ? Math.min(rawW, maxColumnWidth) : rawW;
                    const slotX = b.scale(ci) + (stack ? 0 : k * (b.bandwidth / visN));
                    const slotW = stack ? b.bandwidth : b.bandwidth / visN;
                    const x0 = slotX + (slotW - bw) / 2;
                    const topY = ctx.yAt((accTop + v) * t);
                    const baseY = stack ? ctx.yAt(accTop * t) : ctx.baseline;
                    const hBar = Math.max(0, baseY - topY);
                    accTop += v;
                    // 堆叠时仅最顶段（末可见序列）圆顶角，内部接缝保持直角 → 平滑无缺口；非堆叠每根独立圆顶。
                    const rTop = stack ? (k === visIdx.length - 1 ? radius : 0) : radius;
                    const isActive = ctx.activeIndex === ci;
                    bars.push(react_1.default.createElement(components_1.View, { key: `${ci}-${si}`, style: {
                            position: 'absolute',
                            left: x0,
                            top: topY,
                            width: bw,
                            height: hBar,
                            borderTopLeftRadius: rTop,
                            borderTopRightRadius: rTop,
                            backgroundColor: col,
                            opacity: ctx.activeIndex == null || isActive ? 1 : 0.45,
                        } }));
                    // 数据标签：非堆叠→柱顶上方（主题标签色）；堆叠→柱段居中（白字，段太矮不画）
                    if (label && t > 0.85 && v > 0) {
                        const txt = yAxisFormatter(v);
                        const cx = x0 + bw / 2;
                        if (stack) {
                            if (hBar >= theme.labelSize + 6) {
                                bars.push(react_1.default.createElement(components_1.Text, { key: `lb${ci}-${si}`, style: { position: 'absolute', left: cx - 40, top: (topY + baseY) / 2 - theme.labelSize, width: 80, textAlign: 'center', fontSize: theme.labelSize, color: '#ffffff', fontWeight: '600' }, numberOfLines: 1 }, txt));
                            }
                        }
                        else {
                            bars.push(react_1.default.createElement(components_1.Text, { key: `lb${ci}-${si}`, style: { position: 'absolute', left: cx - 40, top: topY - theme.labelSize - 5, width: 80, textAlign: 'center', fontSize: theme.labelSize, color: theme.label }, numberOfLines: 1 }, txt));
                        }
                    }
                });
            });
            if (referenceLine && referenceLine.length) {
                bars.push(react_1.default.createElement(common_1.ReferenceLines, { key: "ref", lines: referenceLine, ctx: ctx, theme: theme, formatter: yAxisFormatter }));
            }
            return react_1.default.createElement(react_1.default.Fragment, null, bars);
        }),
        legend && prep.series.length > 1 ? react_1.default.createElement(common_1.ChartLegend, { items: legendItems, active: active, onToggleIndex: toggle }) : null));
}
exports.default = ColumnChart;
