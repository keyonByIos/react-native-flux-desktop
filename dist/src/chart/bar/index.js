"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BarChart = BarChart;
// Bar：横向条形图。自成帧（类目在 y、数值在 x），不复用竖向 Plot。
// 入场每条约从左侧基线伸出，类目间错峰；grouped / stack 两种多序列布局。
// 约定与 Column 一致：xField = 类目维、yField = 数值（仅方向转 90°）。
const react_1 = __importDefault(require("react"));
const components_1 = require("../../components");
const common_1 = require("../core/common");
const data_1 = require("../core/data");
const scale_1 = require("../core/scale");
const theme_1 = require("../core/theme");
const grid_1 = require("../core/grid");
const clamp01 = (v) => Math.max(0, Math.min(1, v));
const PAD_L = 76;
const PAD_R = 40;
const PAD_T = 8;
const PAD_B = 24;
function BarChart(props) {
    const theme = (0, common_1.useChartTheme)();
    const { data, xField, yField, seriesField, color, width, height, stack = false, radius = 4, label = false, maxBarWidth, legend = true, tooltip = true, animation = true, animateDuration = 900, stagger = 0.4, valueFormatter = scale_1.compactNumber, grid, style, } = props;
    const [measured, onLayout] = (0, common_1.useMeasuredWidth)(width ?? 520);
    const w = width ?? measured;
    const p = (0, common_1.useEnter)(animation, animateDuration);
    const prep = (0, data_1.prepare)(data, xField, yField, seriesField);
    const { isHidden, toggle, active: legendActive } = (0, common_1.useLegendToggle)(prep.series.length);
    const nCat = prep.categories.length;
    const visIdx = prep.series.map((_, i) => i).filter((i) => !isHidden(i));
    const visN = Math.max(1, visIdx.length);
    const rowArea = Math.max(height ?? 40 * nCat + PAD_T + PAD_B, PAD_T + PAD_B + nCat * 22);
    const H = height ?? rowArea;
    const plotW = Math.max(0, w - PAD_L - PAD_R);
    const plotH = H - PAD_T - PAD_B;
    const yMax = stack
        ? Math.max(...prep.categories.map((_, i) => visIdx.reduce((a, si) => a + (prep.series[si].points[i] ?? 0), 0)), 1)
        : Math.max(...visIdx.flatMap((si) => prep.series[si].points.map((v) => v ?? 0)), 1);
    const { niceMax, ticks } = (0, scale_1.niceTicks)(yMax);
    const xAt = (v) => PAD_L + (Math.max(0, Math.min(niceMax, v)) / (niceMax || 1)) * plotW;
    const rowH = plotH / Math.max(nCat, 1);
    const legendItems = prep.series.map((s, i) => ({ name: s.name, color: (0, theme_1.seriesColor)(i, color, theme) }));
    const seg = (i) => {
        const start = nCat <= 1 ? 0 : (i / nCat) * stagger;
        return clamp01((p - start) / (1 - stagger));
    };
    // 悬浮行：抓帧可由 FLUX_CHART_HOVER 预设，否则命中行 hover 驱动。
    const [hover, setHover] = react_1.default.useState(() => {
        const env = typeof process !== 'undefined' ? process.env.FLUX_CHART_HOVER : undefined;
        if (env != null && env !== '' && Number.isFinite(Number(env))) {
            const k = Number(env);
            return k >= 0 && k < nCat ? k : null;
        }
        return null;
    });
    const activeIndex = tooltip ? hover : null;
    const TIP_W = 150;
    const tip = activeIndex != null
        ? {
            title: prep.categories[activeIndex],
            rows: visIdx.map((si) => { const s = prep.series[si]; return { name: s.name, color: (0, theme_1.seriesColor)(si, color, theme), value: s.points[activeIndex] == null ? '—' : valueFormatter(s.points[activeIndex]) }; }),
        }
        : null;
    const rowCenterY = activeIndex != null ? PAD_T + activeIndex * rowH + rowH / 2 : 0;
    const rowVal = activeIndex != null ? (stack ? visIdx.reduce((a, si) => a + (prep.series[si].points[activeIndex] ?? 0), 0) : Math.max(0, ...visIdx.map((si) => prep.series[si].points[activeIndex] ?? 0))) : 0;
    const barEnd = xAt(rowVal);
    const tipLeft = barEnd + 10 + TIP_W > w ? Math.max(4, barEnd - 10 - TIP_W) : barEnd + 10;
    const bars = [];
    prep.categories.forEach((_c, ci) => {
        let accLen = 0;
        const rowTop = PAD_T + ci * rowH;
        const bandH = rowH * 0.64;
        const rowY0 = rowTop + (rowH - bandH) / 2;
        const subH = stack ? bandH : bandH / visN;
        visIdx.forEach((si, k) => {
            const s = prep.series[si];
            const v = s.points[ci] ?? 0;
            const col = (0, theme_1.seriesColor)(si, color, theme);
            const t = seg(ci);
            // 高度上限：限粗后在应得槽位内居中（stack 整行带居中，grouped 各自槽内居中）
            const slotY = rowY0 + (stack ? 0 : k * subH);
            const slotH = stack ? bandH : bandH / visN;
            const rawH = Math.max(2, slotH - (stack ? 0 : 1));
            const barH = maxBarWidth != null ? Math.min(rawH, maxBarWidth) : rawH;
            const y0 = slotY + (slotH - barH) / 2;
            const xStart = stack ? xAt(accLen) : PAD_L;
            const xEnd = stack ? xAt((accLen + v) * t) : xAt(v * t);
            accLen += v;
            // 堆叠时仅最右段（末可见序列）圆右角，内部接缝保持直角 → 平滑无缺口；非堆叠每根独立圆右帽。
            const rRight = stack ? (k === visIdx.length - 1 ? radius : 0) : radius;
            const active = activeIndex === ci;
            bars.push(react_1.default.createElement(components_1.View, { key: `${ci}-${si}`, style: {
                    position: 'absolute',
                    left: xStart,
                    top: y0,
                    width: Math.max(0, xEnd - xStart),
                    height: barH,
                    borderTopRightRadius: rRight,
                    borderBottomRightRadius: rRight,
                    backgroundColor: col,
                    opacity: activeIndex == null || active ? 1 : 0.45,
                } }));
            // 数据标签：非堆叠→条末端右侧（主题标签色）；堆叠→段居中（白字，段太窄不画）
            if (label && t > 0.85 && v > 0) {
                const txt = valueFormatter(v);
                if (stack) {
                    if (xEnd - xStart >= 34) {
                        bars.push(react_1.default.createElement(components_1.Text, { key: `lb${ci}-${si}`, numberOfLines: 1, style: { position: 'absolute', left: (xStart + xEnd) / 2 - 30, top: y0 + barH / 2 - theme.labelSize, width: 60, textAlign: 'center', fontSize: theme.labelSize, color: '#ffffff', fontWeight: '600' } }, txt));
                    }
                }
                else {
                    bars.push(react_1.default.createElement(components_1.Text, { key: `lb${ci}-${si}`, numberOfLines: 1, style: { position: 'absolute', left: xEnd + 6, top: y0 + barH / 2 - theme.labelSize, width: 60, textAlign: 'left', fontSize: theme.labelSize, color: theme.label } }, txt));
                }
            }
        });
    });
    return (react_1.default.createElement(components_1.View, { style: [{ gap: theme.labelSize }, style], onLayout: onLayout },
        react_1.default.createElement(components_1.View, { style: { width: w, height: H, position: 'relative' } },
            react_1.default.createElement(grid_1.GridLines, { area: { left: PAD_L, top: PAD_T, width: plotW, height: plotH }, vertical: ticks.map((t) => xAt(t)), config: grid, fallbackColor: theme.gridLine }),
            ticks.map((t, i) => (react_1.default.createElement(components_1.Text, { key: `xl${i}`, style: { position: 'absolute', left: xAt(t) - 20, top: H - PAD_B + 4, width: 40, textAlign: 'center', fontSize: theme.labelSize, color: theme.label } }, valueFormatter(t)))),
            react_1.default.createElement(components_1.View, { style: { position: 'absolute', left: PAD_L, top: PAD_T, width: 1, height: plotH, backgroundColor: theme.axisLine } }),
            prep.categories.map((c, ci) => (react_1.default.createElement(components_1.Text, { key: `c${ci}`, numberOfLines: 1, style: { position: 'absolute', right: w - PAD_L + 8, top: PAD_T + ci * rowH + rowH / 2 - theme.labelSize, width: PAD_L - 12, textAlign: 'right', fontSize: theme.labelSize, color: theme.label } }, c))),
            bars,
            activeIndex != null ? (react_1.default.createElement(components_1.View, { style: { position: 'absolute', left: PAD_L, top: PAD_T + activeIndex * rowH, width: plotW, height: rowH, backgroundColor: theme.fillTrack, opacity: 0.5 } })) : null,
            tip ? (react_1.default.createElement(components_1.View, { style: { position: 'absolute', left: tipLeft, top: Math.max(4, rowCenterY - 8 - tip.rows.length * 9), width: TIP_W, backgroundColor: theme.tooltipBg, borderRadius: 6, padding: 8, gap: 4 } },
                react_1.default.createElement(components_1.Text, { style: { fontSize: theme.labelSize, color: theme.tooltipText, opacity: 0.7 } }, tip.title),
                tip.rows.map((r, i) => (react_1.default.createElement(components_1.View, { key: i, style: { flexDirection: 'row', alignItems: 'center', gap: 6 } },
                    r.color ? react_1.default.createElement(components_1.View, { style: { width: 8, height: 8, borderRadius: 4, backgroundColor: r.color } }) : null,
                    react_1.default.createElement(components_1.Text, { style: { flex: 1, fontSize: theme.labelSize, color: theme.tooltipText }, numberOfLines: 1 }, r.name),
                    react_1.default.createElement(components_1.Text, { style: { fontSize: theme.labelSize, color: theme.tooltipText, fontWeight: '600' } }, r.value)))))) : null,
            tooltip
                ? prep.categories.map((_, ci) => (react_1.default.createElement(components_1.Pressable, { key: `hit${ci}`, onMouseEnter: () => setHover(ci), onMouseLeave: () => setHover((h) => (h === ci ? null : h)), style: { position: 'absolute', left: PAD_L, top: PAD_T + ci * rowH, width: plotW, height: rowH } })))
                : null),
        legend && prep.series.length > 1 ? react_1.default.createElement(common_1.ChartLegend, { items: legendItems, active: legendActive, onToggleIndex: toggle }) : null));
}
exports.default = BarChart;
