"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.HeatmapChart = HeatmapChart;
// Heatmap：热力图。x/y 两种类目构成网格，单元色块以「基准色 + alpha 强度」映射数值（本管线无逐像素渐变，用 alpha 阶梯）。
// 入场：单元格按对角线 (xi+yi) 错峰淡入。附最低/最高色阶图例。
const react_1 = __importDefault(require("react"));
const components_1 = require("../../components");
const theme_1 = require("../../theme");
const common_1 = require("../core/common");
const scale_1 = require("../core/scale");
const theme_2 = require("../core/theme");
const clamp01 = (v) => Math.max(0, Math.min(1, v));
const PAD_L = 64;
const PAD_R = 16;
const PAD_T = 10;
const PAD_B = 28;
function HeatmapChart(props) {
    const theme = (0, common_1.useChartTheme)();
    const { token } = (0, theme_1.useToken)();
    const { data, xField = 'x', yField = 'y', valueField = 'value', width, height = 300, color, showValue = false, cellGap = 2, tooltip = true, animation = true, animateDuration = 1000, valueFormatter = scale_1.compactNumber, style, } = props;
    const [measured, onLayout] = (0, common_1.useMeasuredWidth)(width ?? 520);
    const w = width ?? measured;
    const p = (0, common_1.useEnter)(animation, animateDuration);
    const base = color ?? theme.primary;
    const xs = [];
    const ys = [];
    const idx = (arr, v) => {
        let i = arr.indexOf(v);
        if (i < 0) {
            i = arr.length;
            arr.push(v);
        }
        return i;
    };
    const cells = [];
    let maxV = 0;
    for (const row of data) {
        const xi = idx(xs, String(row[xField]));
        const yi = idx(ys, String(row[yField]));
        const v = Number(row[valueField]) || 0;
        cells.push({ xi, yi, v });
        if (v > maxV)
            maxV = v;
    }
    maxV = maxV || 1;
    const nx = Math.max(xs.length, 1);
    const ny = Math.max(ys.length, 1);
    const gridW = Math.max(0, w - PAD_L - PAD_R);
    const gridH = Math.max(0, height - PAD_T - PAD_B);
    const cw = gridW / nx;
    const ch = gridH / ny;
    const diagMax = nx + ny - 2;
    // 悬浮单元格（线性 index）：抓帧可由 FLUX_CHART_HOVER 预设。
    const [hover, setHover] = react_1.default.useState(() => {
        const env = typeof process !== 'undefined' ? process.env.FLUX_CHART_HOVER : undefined;
        if (env != null && env !== '' && Number.isFinite(Number(env))) {
            const k = Number(env);
            return k >= 0 && k < cells.length ? k : null;
        }
        return null;
    });
    const activeIndex = tooltip ? hover : null;
    const TIP_W = 150;
    const active = activeIndex != null ? cells[activeIndex] : null;
    const alphaHex = (v) => {
        const a = 0.08 + 0.92 * (v / maxV);
        return Math.round(clamp01(a) * 255).toString(16).padStart(2, '0');
    };
    return (react_1.default.createElement(components_1.View, { style: [{ width: w, gap: theme.labelSize }, style], onLayout: onLayout },
        react_1.default.createElement(components_1.View, { style: { width: w, height, position: 'relative' } },
            ys.map((c, yi) => (react_1.default.createElement(components_1.Text, { key: `y${yi}`, numberOfLines: 1, style: { position: 'absolute', right: w - PAD_L + 8, top: PAD_T + yi * ch + ch / 2 - theme.labelSize, width: PAD_L - 12, textAlign: 'right', fontSize: theme.labelSize, color: theme.label } }, c))),
            xs.map((c, xi) => (react_1.default.createElement(components_1.Text, { key: `x${xi}`, numberOfLines: 1, style: { position: 'absolute', left: PAD_L + xi * cw - cw / 2, top: PAD_T + gridH + 8, width: cw, textAlign: 'center', fontSize: theme.labelSize, color: theme.label } }, c))),
            cells.map((cell, i) => {
                const t = clamp01((p * (diagMax + 1) - (cell.xi + cell.yi)) / 1);
                if (t <= 0)
                    return null;
                const isActive = activeIndex === i;
                return (react_1.default.createElement(components_1.View, { key: i, style: {
                        position: 'absolute',
                        left: PAD_L + cell.xi * cw + cellGap / 2,
                        top: PAD_T + cell.yi * ch + cellGap / 2,
                        width: Math.max(0, cw - cellGap),
                        height: Math.max(0, ch - cellGap),
                        borderRadius: token.borderRadiusSM,
                        opacity: activeIndex == null || isActive ? t : t * 0.55,
                        borderWidth: isActive ? 1.5 : 0,
                        borderColor: theme.ink,
                        backgroundColor: (0, theme_2.withAlpha)(base, alphaHex(cell.v)),
                        alignItems: 'center',
                        justifyContent: 'center',
                    } }, showValue ? react_1.default.createElement(components_1.Text, { style: { fontSize: theme.labelSize, color: cell.v / maxV > 0.55 ? token.colorTextBase ?? '#000' : theme.label } }, valueFormatter(cell.v)) : null));
            }),
            active ? (react_1.default.createElement(components_1.View, { style: { position: 'absolute', left: Math.max(4, Math.min(w - TIP_W - 4, PAD_L + active.xi * cw + cw / 2 - TIP_W / 2)), top: Math.max(4, PAD_T + active.yi * ch - 52), width: TIP_W, backgroundColor: theme.tooltipBg, borderRadius: 6, padding: 8, gap: 4 } },
                react_1.default.createElement(components_1.Text, { style: { fontSize: theme.labelSize, color: theme.tooltipText, opacity: 0.7 }, numberOfLines: 1 }, `${ys[active.yi]} · ${xs[active.xi]}`),
                react_1.default.createElement(components_1.View, { style: { flexDirection: 'row', alignItems: 'center', gap: 6 } },
                    react_1.default.createElement(components_1.View, { style: { width: 8, height: 8, borderRadius: 4, backgroundColor: (0, theme_2.withAlpha)(base, alphaHex(active.v)) } }),
                    react_1.default.createElement(components_1.Text, { style: { flex: 1, fontSize: theme.labelSize, color: theme.tooltipText }, numberOfLines: 1 }, "\u6570\u503C"),
                    react_1.default.createElement(components_1.Text, { style: { fontSize: theme.labelSize, color: theme.tooltipText, fontWeight: '600' } }, valueFormatter(active.v))))) : null,
            tooltip
                ? cells.map((cell, i) => (react_1.default.createElement(components_1.Pressable, { key: `hit${i}`, onMouseEnter: () => setHover(i), onMouseLeave: () => setHover((h) => (h === i ? null : h)), style: { position: 'absolute', left: PAD_L + cell.xi * cw, top: PAD_T + cell.yi * ch, width: cw, height: ch } })))
                : null),
        react_1.default.createElement(components_1.View, { style: { flexDirection: 'row', alignItems: 'center', gap: token.marginXS } },
            react_1.default.createElement(components_1.Text, { style: { fontSize: theme.labelSize, color: theme.label } }, "\u4F4E"),
            react_1.default.createElement(components_1.View, { style: { flexDirection: 'row' } }, [0.1, 0.25, 0.4, 0.55, 0.7, 0.85, 1].map((f, i) => (react_1.default.createElement(components_1.View, { key: i, style: { width: 18, height: 10, backgroundColor: (0, theme_2.withAlpha)(base, alphaHex(f * maxV)) } })))),
            react_1.default.createElement(components_1.Text, { style: { fontSize: theme.labelSize, color: theme.label } }, "\u9AD8"))));
}
exports.default = HeatmapChart;
