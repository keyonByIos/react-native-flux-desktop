"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ViolinChart = ViolinChart;
// Violin：小提琴图。每个类目一行原始数值 → 高斯 KDE 密度曲线 → 对称轮廓（密集水平矩形条栅格化，轴对齐无锯齿）。
// 组内共享同一横向量程（按全局最大密度归一），便于跨类目比较分布形态；可选内嵌迷你箱（IQR 盒 + 中位线 + 须线）。
// 自带 [lo,hi] 线性 y 轴（非零基线，不复用强制 0 基线的 Plot）；入场轮廓由中轴横向展开。悬浮逐类目 tooltip 显五数概括。
const react_1 = __importDefault(require("react"));
const components_1 = require("../../components");
const common_1 = require("../core/common");
const grid_1 = require("../core/grid");
const scale_1 = require("../core/scale");
const theme_1 = require("../core/theme");
const violin_1 = require("../core/violin");
const boxplot_1 = require("../core/boxplot");
const PAD_L = 44;
const PAD_R = 18;
const PAD_T = 16;
const PAD_B = 30;
const TIP_W = 168;
const GRID_N = 56; // 每条小提琴的纵向采样点数
function ViolinChart(props) {
    const theme = (0, common_1.useChartTheme)();
    const { data, xField, yField, color, height = 300, width, box = true, mean = false, bandwidth, fillOpacity = 'cc', legend = false, tooltip = true, animation = true, animateDuration = 800, yAxisFormatter = scale_1.compactNumber, xAxisFormatter, grid, style, } = props;
    const [measured, onLayout] = (0, common_1.useMeasuredWidth)(width ?? 520);
    const w = width ?? measured;
    const p = (0, common_1.useEnter)(animation, animateDuration);
    const categories = data.map((d) => String(d[xField] ?? ''));
    const samples = data.map((d) => (d[yField] ?? []).filter((v) => Number.isFinite(v)));
    const stats = samples.map((s) => (0, boxplot_1.boxStats)(s));
    const nCat = categories.length;
    // 全域（含所有样本）定 y 轴
    let lo = Infinity;
    let hi = -Infinity;
    for (const arr of samples)
        for (const v of arr) {
            if (v < lo)
                lo = v;
            if (v > hi)
                hi = v;
        }
    if (!Number.isFinite(lo) || !Number.isFinite(hi)) {
        lo = 0;
        hi = 1;
    }
    if (lo === hi) {
        lo -= 1;
        hi += 1;
    }
    const pad = (hi - lo) * 0.06;
    const ticks = (0, scale_1.linearTicks)(lo - pad, hi + pad, 5);
    const domLo = ticks[0];
    const domHi = ticks[ticks.length - 1];
    const plotW = Math.max(0, w - PAD_L - PAD_R);
    const plotH = Math.max(0, height - PAD_T - PAD_B);
    const yScale = (0, scale_1.linearScale)([domLo, domHi], [PAD_T + plotH, PAD_T]); // 值大 → y 小
    const baseline = PAD_T + plotH;
    const band = (0, scale_1.bandScale)(nCat, [PAD_L, PAD_L + plotW], { paddingInner: 0.32, paddingOuter: 0.2 });
    const labelXs = categories.map((_, i) => band.scale(i) + band.bandwidth / 2);
    const gridYs = ticks.map((t) => yScale(t));
    // 共享纵向采样网格（跨 domLo..domHi 均匀），使各 violin 轮廓对齐同一批 y 像素
    const gridAt = [];
    for (let i = 0; i < GRID_N; i++)
        gridAt.push(domLo + ((domHi - domLo) * i) / (GRID_N - 1));
    const densities = samples.map((s) => (s.length ? (0, violin_1.kde)(s, { at: gridAt, bandwidth }) : []));
    const maxD = (0, violin_1.maxDensity)(densities) || 1;
    const halfMax = band.bandwidth / 2;
    const sliceH = plotH / (GRID_N - 1) + 1.2; // 轻微重叠消除条缝
    const [hover, setHover] = react_1.default.useState(() => {
        const env = typeof process !== 'undefined' ? process.env.FLUX_CHART_HOVER : undefined;
        if (env != null && env !== '' && Number.isFinite(Number(env))) {
            const k = Number(env);
            return k >= 0 && k < nCat ? k : null;
        }
        return null;
    });
    const activeIndex = tooltip ? hover : null;
    const tip = activeIndex != null ? buildTip(activeIndex) : null;
    const crossX = activeIndex != null ? labelXs[activeIndex] : 0;
    const flip = activeIndex != null && crossX + 12 + TIP_W > w;
    const tipLeft = flip ? crossX - 12 - TIP_W : crossX + 12;
    function buildTip(i) {
        const s = stats[i];
        if (!s)
            return null;
        const f = yAxisFormatter;
        return {
            title: categories[i],
            rows: [
                { name: 'Max', value: f(s.max) },
                { name: 'Q3', value: f(s.q3) },
                { name: '中位数', value: f(s.median), color: (0, theme_1.seriesColor)(i, color, theme) },
                { name: 'Q1', value: f(s.q1) },
                { name: 'Min', value: f(s.min) },
                { name: '样本数', value: String(s.count) },
            ],
        };
    }
    const marks = [];
    densities.forEach((dens, i) => {
        if (!dens.length)
            return;
        const cx = labelXs[i];
        const col = (0, theme_1.seriesColor)(i, color, theme);
        const dim = activeIndex != null && activeIndex !== i;
        const op = dim ? 0.35 : 1;
        // 轮廓：逐采样点画水平条（左右对称），半宽 ∝ 密度 / 全局最大 × 入场进度
        dens.forEach((pt, gi) => {
            const hw = (pt.density / maxD) * halfMax * p;
            if (hw < 0.4)
                return;
            const y = yScale(pt.value);
            marks.push(react_1.default.createElement(components_1.View, { key: `v${i}-${gi}`, style: { position: 'absolute', left: cx - hw, top: y - sliceH / 2, width: hw * 2, height: sliceH, backgroundColor: `${col}${fillOpacity}`, opacity: op } }));
        });
        // 内嵌迷你箱
        const s = stats[i];
        if (box && s) {
            const boxW = Math.min(12, halfMax * 0.5);
            const q1y = yScale(s.q1);
            const q3y = yScale(s.q3);
            const wLowY = yScale(s.whiskerLow);
            const wHighY = yScale(s.whiskerHigh);
            const medY = yScale(s.median);
            // 须线
            marks.push(react_1.default.createElement(components_1.View, { key: `wk${i}`, style: { position: 'absolute', left: cx - 1, top: wHighY, width: 2, height: Math.max(0, wLowY - wHighY), backgroundColor: theme.ink ?? col, opacity: op * 0.9 } }));
            // IQR 盒
            marks.push(react_1.default.createElement(components_1.View, { key: `bx${i}`, style: { position: 'absolute', left: cx - boxW / 2, top: q3y, width: boxW, height: Math.max(2, q1y - q3y), backgroundColor: theme.ink ?? '#fff', borderRadius: 2, opacity: op * 0.9 } }));
            // 中位线
            marks.push(react_1.default.createElement(components_1.View, { key: `md${i}`, style: { position: 'absolute', left: cx - boxW / 2 - 2, top: medY - 1, width: boxW + 4, height: 2, backgroundColor: col, opacity: op } }));
            if (mean) {
                marks.push(react_1.default.createElement(components_1.View, { key: `mn${i}`, style: { position: 'absolute', left: cx - 3, top: yScale(s.mean) - 3, width: 6, height: 6, borderRadius: 3, backgroundColor: theme.ink ?? col, opacity: op } }));
            }
        }
    });
    return (react_1.default.createElement(components_1.View, { style: [{ gap: theme.labelSize }, style], onLayout: onLayout },
        react_1.default.createElement(components_1.View, { style: { width: w, height, position: 'relative' } },
            react_1.default.createElement(grid_1.GridLines, { area: { left: PAD_L, top: PAD_T, width: plotW, height: plotH }, horizontal: gridYs, config: { ...grid, show: grid?.show !== false }, fallbackColor: theme.gridLine }),
            ticks.map((tk, i) => (react_1.default.createElement(components_1.Text, { key: `yl${i}`, style: { position: 'absolute', right: w - PAD_L + 8, top: yScale(tk) - theme.labelSize, width: PAD_L - 12, textAlign: 'right', fontSize: theme.labelSize, color: theme.label }, numberOfLines: 1 }, yAxisFormatter(tk)))),
            react_1.default.createElement(components_1.View, { style: { position: 'absolute', left: PAD_L, top: baseline, width: plotW, height: 1, backgroundColor: theme.axisLine } }),
            categories.map((c, i) => (react_1.default.createElement(components_1.Text, { key: `x${i}`, style: { position: 'absolute', left: labelXs[i] - plotW / Math.max(nCat, 1) / 2 - 6, top: baseline + 8, width: plotW / Math.max(nCat, 1) + 12, textAlign: 'center', fontSize: theme.labelSize, color: theme.label, fontWeight: activeIndex === i ? '600' : 'normal', opacity: activeIndex === i ? 1 : 0.85 }, numberOfLines: 1 }, xAxisFormatter ? xAxisFormatter(c) : c))),
            react_1.default.createElement(components_1.View, { style: { position: 'absolute', left: 0, top: 0, width: w, height } }, marks),
            activeIndex != null ? react_1.default.createElement(components_1.View, { style: { position: 'absolute', left: crossX, top: PAD_T, width: 1, height: plotH, backgroundColor: theme.axisLine } }) : null,
            tip ? (react_1.default.createElement(components_1.View, { style: { position: 'absolute', left: Math.max(4, tipLeft), top: PAD_T + 6, width: TIP_W, backgroundColor: theme.tooltipBg, borderRadius: 6, padding: 8, gap: 3 } },
                react_1.default.createElement(components_1.Text, { style: { fontSize: theme.labelSize, color: theme.tooltipText, opacity: 0.7 } }, tip.title),
                tip.rows.map((r, i) => (react_1.default.createElement(components_1.View, { key: i, style: { flexDirection: 'row', alignItems: 'center', gap: 6 } },
                    r.color ? react_1.default.createElement(components_1.View, { style: { width: 8, height: 8, borderRadius: 4, backgroundColor: r.color } }) : react_1.default.createElement(components_1.View, { style: { width: 8 } }),
                    react_1.default.createElement(components_1.Text, { style: { flex: 1, fontSize: theme.labelSize, color: theme.tooltipText }, numberOfLines: 1 }, r.name),
                    react_1.default.createElement(components_1.Text, { style: { fontSize: theme.labelSize, color: theme.tooltipText, fontWeight: '600' } }, r.value)))))) : null,
            tooltip
                ? categories.map((_, i) => (react_1.default.createElement(components_1.Pressable, { key: `hit${i}`, onMouseEnter: () => setHover(i), onMouseLeave: () => setHover((h) => (h === i ? null : h)), style: { position: 'absolute', left: labelXs[i] - band.step / 2, top: PAD_T, width: band.step, height: plotH } })))
                : null),
        legend && nCat > 0 ? (react_1.default.createElement(components_1.View, { style: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 } }, categories.map((c, i) => (react_1.default.createElement(components_1.View, { key: i, style: { flexDirection: 'row', alignItems: 'center', gap: 6 } },
            react_1.default.createElement(components_1.View, { style: { width: 9, height: 9, borderRadius: 2, backgroundColor: (0, theme_1.seriesColor)(i, color, theme) } }),
            react_1.default.createElement(components_1.Text, { style: { fontSize: theme.labelSize, color: theme.label } }, c)))))) : null));
}
exports.default = ViolinChart;
