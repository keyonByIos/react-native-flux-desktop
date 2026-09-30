"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BoxPlotChart = BoxPlotChart;
// BoxPlot：箱线图（Tukey 五数概括）。每个类目一行原始数值 → 箱体（Q1~Q3）+ 中位线 + 上下须（fence 内极值）+ 离群点。
// 自带 [lo,hi] 线性 y 轴（支持非零基线，不复用强制 0 基线的 Plot）；入场由中位线向两端展开。
// 全部轴对齐矩形/竖线 → View 拼装，无斜边、无锯齿。悬浮逐类目 tooltip 显示 min/Q1/median/Q3/max/离群数。
const react_1 = __importDefault(require("react"));
const components_1 = require("../../components");
const common_1 = require("../core/common");
const grid_1 = require("../core/grid");
const scale_1 = require("../core/scale");
const theme_1 = require("../core/theme");
const boxplot_1 = require("../core/boxplot");
const PAD_L = 44;
const PAD_R = 18;
const PAD_T = 16;
const PAD_B = 30;
const TIP_W = 168;
function BoxPlotChart(props) {
    const theme = (0, common_1.useChartTheme)();
    const { data, xField, yField, color, height = 300, width, mean = false, outliers = true, boxOpacity = '33', legend = false, tooltip = true, animation = true, animateDuration = 800, yAxisFormatter = scale_1.compactNumber, xAxisFormatter, grid, style, } = props;
    const [measured, onLayout] = (0, common_1.useMeasuredWidth)(width ?? 520);
    const w = width ?? measured;
    const p = (0, common_1.useEnter)(animation, animateDuration);
    const categories = data.map((d) => String(d[xField] ?? ''));
    const stats = data.map((d) => (0, boxplot_1.boxStats)(d[yField] ?? []));
    const valid = stats.filter((s) => s != null);
    const [lo, hi] = (0, boxplot_1.boxDomain)(valid);
    const pad = (hi - lo) * 0.06 || 1;
    const ticks = (0, scale_1.linearTicks)(lo - pad, hi + pad, 5);
    const domLo = ticks[0];
    const domHi = ticks[ticks.length - 1];
    const plotW = Math.max(0, w - PAD_L - PAD_R);
    const plotH = Math.max(0, height - PAD_T - PAD_B);
    const yScale = (0, scale_1.linearScale)([domLo, domHi], [PAD_T + plotH, PAD_T]); // 值大 → y 小（顶部）
    const baseline = PAD_T + plotH;
    const nCat = categories.length;
    const band = (0, scale_1.bandScale)(nCat, [PAD_L, PAD_L + plotW], { paddingInner: 0.55, paddingOuter: 0.3 });
    const labelXs = categories.map((_, i) => band.scale(i) + band.bandwidth / 2);
    const gridYs = ticks.map((t) => yScale(t));
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
                { name: '上须 / Max', value: f(s.whiskerHigh) },
                { name: 'Q3', value: f(s.q3) },
                { name: '中位数', value: f(s.median), color: (0, theme_1.seriesColor)(i, color, theme) },
                { name: 'Q1', value: f(s.q1) },
                { name: '下须 / Min', value: f(s.whiskerLow) },
                { name: '样本数', value: String(s.count) },
                ...(s.outliers.length ? [{ name: '离群点', value: s.outliers.map(f).join(' ') }] : []),
            ],
        };
    }
    const marks = [];
    stats.forEach((s, i) => {
        if (!s)
            return;
        const cx = labelXs[i];
        const col = (0, theme_1.seriesColor)(i, color, theme);
        const boxW = Math.min(band.bandwidth, 46);
        const t = p; // 由中位线向两端展开
        const at = (v) => yScale(s.median + (v - s.median) * t);
        const q1y = at(s.q1);
        const q3y = at(s.q3);
        const medY = at(s.median);
        const wLowY = at(s.whiskerLow);
        const wHighY = at(s.whiskerHigh);
        const dim = activeIndex != null && activeIndex !== i;
        const op = dim ? 0.4 : 1;
        const capW = boxW * 0.5;
        // 竖直须线（下须→上须）
        marks.push(react_1.default.createElement(components_1.View, { key: `wk${i}`, style: { position: 'absolute', left: cx - 1, top: wHighY, width: 2, height: Math.max(0, wLowY - wHighY), backgroundColor: col, opacity: op } }));
        // 上下须帽
        marks.push(react_1.default.createElement(components_1.View, { key: `wth${i}`, style: { position: 'absolute', left: cx - capW / 2, top: wHighY - 1, width: capW, height: 2, backgroundColor: col, opacity: op } }));
        marks.push(react_1.default.createElement(components_1.View, { key: `wtl${i}`, style: { position: 'absolute', left: cx - capW / 2, top: wLowY - 1, width: capW, height: 2, backgroundColor: col, opacity: op } }));
        // 箱体（Q1~Q3）：半透明填充 + 实色描边
        marks.push(react_1.default.createElement(components_1.View, { key: `box${i}`, style: {
                position: 'absolute',
                left: cx - boxW / 2,
                top: q3y,
                width: boxW,
                height: Math.max(1, q1y - q3y),
                backgroundColor: `${col}${boxOpacity}`,
                borderWidth: 1.5,
                borderColor: col,
                borderRadius: 2,
                opacity: op,
            } }));
        // 中位线（加粗）
        marks.push(react_1.default.createElement(components_1.View, { key: `med${i}`, style: { position: 'absolute', left: cx - boxW / 2, top: medY - 1, width: boxW, height: 2, backgroundColor: col, opacity: op } }));
        // 均值菱形
        if (mean) {
            marks.push(react_1.default.createElement(components_1.View, { key: `mn${i}`, style: { position: 'absolute', left: cx - 4, top: at(s.mean) - 4, width: 8, height: 8, backgroundColor: theme.ink ?? col, transform: [{ rotate: '45deg' }], opacity: op } }));
        }
        // 离群点
        if (outliers) {
            s.outliers.forEach((o, oi) => {
                marks.push(react_1.default.createElement(components_1.View, { key: `ot${i}-${oi}`, style: { position: 'absolute', left: cx - 3, top: yScale(s.median + (o - s.median) * t) - 3, width: 6, height: 6, borderRadius: 3, borderWidth: 1.5, borderColor: col, backgroundColor: 'transparent', opacity: op } }));
            });
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
exports.default = BoxPlotChart;
