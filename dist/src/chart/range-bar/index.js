"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RangeBarChart = RangeBarChart;
// RangeBar：区间条 / 甘特式横条。每个类目一行 [start, end] 数值区间 → 横向浮动条（x 轴为线性数值、y 轴为类目）。
// 与 BarChart（0 基线、值定长）不同：条从 start 起、到 end 止，表「一段跨度」（工期 / 温度区间 / 分数带 / 优先级区间）。
// 轴对齐矩形 → View 拼装，无锯齿；入场由 start 端向 end 生长；悬浮逐行 tooltip 显 起 / 止 / 跨度。
const react_1 = __importDefault(require("react"));
const components_1 = require("../../components");
const common_1 = require("../core/common");
const grid_1 = require("../core/grid");
const scale_1 = require("../core/scale");
const theme_1 = require("../core/theme");
const PAD_L = 92;
const PAD_R = 18;
const PAD_T = 14;
const PAD_B = 30;
const TIP_W = 156;
function RangeBarChart(props) {
    const theme = (0, common_1.useChartTheme)();
    const { data, yField, startField, endField, color, colorField, height = 300, width, barRatio = 0.6, label = false, radius = 4, legend = false, tooltip = true, animation = true, animateDuration = 800, xAxisFormatter = scale_1.compactNumber, yAxisFormatter, grid, style, } = props;
    const [measured, onLayout] = (0, common_1.useMeasuredWidth)(width ?? 520);
    const w = width ?? measured;
    const p = (0, common_1.useEnter)(animation, animateDuration);
    const categories = data.map((d) => String(d[yField] ?? ''));
    const rows = data.map((d) => ({
        start: Number(d[startField]),
        end: Number(d[endField]),
    }));
    const valid = rows.filter((r) => Number.isFinite(r.start) && Number.isFinite(r.end));
    let lo = Infinity;
    let hi = -Infinity;
    for (const r of valid) {
        lo = Math.min(lo, r.start, r.end);
        hi = Math.max(hi, r.start, r.end);
    }
    if (!Number.isFinite(lo) || !Number.isFinite(hi)) {
        lo = 0;
        hi = 1;
    }
    if (lo === hi) {
        lo -= 1;
        hi += 1;
    }
    const ticks = (0, scale_1.linearTicks)(lo, hi, 5);
    const domLo = ticks[0];
    const domHi = ticks[ticks.length - 1];
    const plotW = Math.max(0, w - PAD_L - PAD_R);
    const plotH = Math.max(0, height - PAD_T - PAD_B);
    const xScale = (0, scale_1.linearScale)([domLo, domHi], [PAD_L, PAD_L + plotW]);
    const baseline = PAD_T + plotH;
    const nRow = categories.length;
    const band = (0, scale_1.bandScale)(nRow, [PAD_T, PAD_T + plotH], { paddingInner: 0.42, paddingOuter: 0.2 });
    const gridXs = ticks.map((t) => xScale(t));
    // 分色：colorField 存在则按去重值映射色板，否则按行序号
    const colorKeys = colorField ? Array.from(new Set(data.map((d) => String(d[colorField] ?? '')))) : null;
    const colorOf = (i) => {
        if (colorField && colorKeys)
            return (0, theme_1.seriesColor)(colorKeys.indexOf(String(data[i][colorField] ?? '')), color, theme);
        return (0, theme_1.seriesColor)(i, color, theme);
    };
    const [hover, setHover] = react_1.default.useState(() => {
        const env = typeof process !== 'undefined' ? process.env.FLUX_CHART_HOVER : undefined;
        if (env != null && env !== '' && Number.isFinite(Number(env))) {
            const k = Number(env);
            return k >= 0 && k < nRow ? k : null;
        }
        return null;
    });
    const activeIndex = tooltip ? hover : null;
    const tip = activeIndex != null ? buildTip(activeIndex) : null;
    const tipRowY = activeIndex != null ? band.scale(activeIndex) + band.bandwidth / 2 : 0;
    const hoverEndX = activeIndex != null ? xScale(Math.max(rows[activeIndex].start, rows[activeIndex].end)) : 0;
    const flip = activeIndex != null && hoverEndX + 12 + TIP_W > w;
    const tipLeft = flip ? hoverEndX - 12 - TIP_W : hoverEndX + 12;
    function buildTip(i) {
        const r = rows[i];
        if (!Number.isFinite(r.start) || !Number.isFinite(r.end))
            return null;
        const f = xAxisFormatter;
        return {
            title: categories[i],
            rows: [
                { name: '起', value: f(Math.min(r.start, r.end)), color: colorOf(i) },
                { name: '止', value: f(Math.max(r.start, r.end)) },
                { name: '跨度', value: f(Math.abs(r.end - r.start)) },
            ],
        };
    }
    const marks = [];
    rows.forEach((r, i) => {
        if (!Number.isFinite(r.start) || !Number.isFinite(r.end))
            return;
        const a = Math.min(r.start, r.end);
        const b = Math.max(r.start, r.end);
        const col = colorOf(i);
        const y = band.scale(i) + (band.bandwidth * (1 - barRatio)) / 2;
        const barH = Math.max(3, band.bandwidth * barRatio);
        const x0 = xScale(a);
        const fullW = Math.max(0, xScale(b) - x0);
        const bw = fullW * p; // 由 start 端向 end 生长
        const dim = activeIndex != null && activeIndex !== i;
        const op = dim ? 0.4 : 1;
        marks.push(react_1.default.createElement(components_1.View, { key: `bar${i}`, style: { position: 'absolute', left: x0, top: y, width: bw, height: barH, backgroundColor: col, borderRadius: radius, opacity: op } }));
        if (label && p > 0.85) {
            marks.push(react_1.default.createElement(components_1.Text, { key: `lb${i}`, style: { position: 'absolute', left: x0 + bw + 6, top: y + barH / 2 - theme.labelSize, fontSize: theme.labelSize, color: theme.label, opacity: op }, numberOfLines: 1 }, `${xAxisFormatter(a)} – ${xAxisFormatter(b)}`));
        }
    });
    return (react_1.default.createElement(components_1.View, { style: [{ gap: theme.labelSize }, style], onLayout: onLayout },
        react_1.default.createElement(components_1.View, { style: { width: w, height, position: 'relative' } },
            react_1.default.createElement(grid_1.GridLines, { area: { left: PAD_L, top: PAD_T, width: plotW, height: plotH }, vertical: gridXs, config: { ...grid, show: grid?.show !== false }, fallbackColor: theme.gridLine }),
            ticks.map((tk, i) => (react_1.default.createElement(components_1.Text, { key: `xl${i}`, style: { position: 'absolute', left: xScale(tk) - 30, top: baseline + 8, width: 60, textAlign: 'center', fontSize: theme.labelSize, color: theme.label }, numberOfLines: 1 }, xAxisFormatter(tk)))),
            react_1.default.createElement(components_1.View, { style: { position: 'absolute', left: PAD_L, top: PAD_T, width: 1, height: plotH, backgroundColor: theme.axisLine } }),
            categories.map((c, i) => (react_1.default.createElement(components_1.Text, { key: `y${i}`, style: { position: 'absolute', right: w - PAD_L + 8, top: band.scale(i) + band.bandwidth / 2 - theme.labelSize, width: PAD_L - 12, textAlign: 'right', fontSize: theme.labelSize, color: theme.label, fontWeight: activeIndex === i ? '600' : 'normal', opacity: activeIndex === i ? 1 : 0.85 }, numberOfLines: 1 }, yAxisFormatter ? yAxisFormatter(c) : c))),
            react_1.default.createElement(components_1.View, { style: { position: 'absolute', left: 0, top: 0, width: w, height } }, marks),
            activeIndex != null ? react_1.default.createElement(components_1.View, { style: { position: 'absolute', left: PAD_L, top: tipRowY, width: plotW, height: 1, backgroundColor: theme.axisLine } }) : null,
            tip ? (react_1.default.createElement(components_1.View, { style: { position: 'absolute', left: Math.max(4, tipLeft), top: Math.max(PAD_T, Math.min(tipRowY - 30, height - 90)), width: TIP_W, backgroundColor: theme.tooltipBg, borderRadius: 6, padding: 8, gap: 3 } },
                react_1.default.createElement(components_1.Text, { style: { fontSize: theme.labelSize, color: theme.tooltipText, opacity: 0.7 } }, tip.title),
                tip.rows.map((r, i) => (react_1.default.createElement(components_1.View, { key: i, style: { flexDirection: 'row', alignItems: 'center', gap: 6 } },
                    r.color ? react_1.default.createElement(components_1.View, { style: { width: 8, height: 8, borderRadius: 4, backgroundColor: r.color } }) : react_1.default.createElement(components_1.View, { style: { width: 8 } }),
                    react_1.default.createElement(components_1.Text, { style: { flex: 1, fontSize: theme.labelSize, color: theme.tooltipText }, numberOfLines: 1 }, r.name),
                    react_1.default.createElement(components_1.Text, { style: { fontSize: theme.labelSize, color: theme.tooltipText, fontWeight: '600' } }, r.value)))))) : null,
            tooltip
                ? categories.map((_, i) => (react_1.default.createElement(components_1.Pressable, { key: `hit${i}`, onMouseEnter: () => setHover(i), onMouseLeave: () => setHover((h) => (h === i ? null : h)), style: { position: 'absolute', left: PAD_L, top: band.scale(i) - band.step * 0.21, width: plotW, height: band.step } })))
                : null),
        legend && colorKeys ? (react_1.default.createElement(components_1.View, { style: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 } }, colorKeys.map((k, i) => (react_1.default.createElement(components_1.View, { key: i, style: { flexDirection: 'row', alignItems: 'center', gap: 6 } },
            react_1.default.createElement(components_1.View, { style: { width: 9, height: 9, borderRadius: 2, backgroundColor: (0, theme_1.seriesColor)(i, color, theme) } }),
            react_1.default.createElement(components_1.Text, { style: { fontSize: theme.labelSize, color: theme.label } }, k)))))) : null));
}
exports.default = RangeBarChart;
