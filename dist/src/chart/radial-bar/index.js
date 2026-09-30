"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RadialBarChart = RadialBarChart;
// RadialBar：径向条形图。多条同心环，每环一个指标，弧长 ∵ value/max（满圈 360°）。
// 环为弧描边 → Icon raw path（arcPath，round cap），方形画布 vb=size。入场各环扫角 0→目标、错峰。
// 环的矩形命中难，高亮改由右侧图例行驱动：悬停某行 → 对应环提亮、其余淡出 + 中心显示该项统计。
const react_1 = __importDefault(require("react"));
const components_1 = require("../../components");
const icon_1 = require("../../ui/icon");
const common_1 = require("../core/common");
const geometry_1 = require("../core/geometry");
const theme_1 = require("../core/theme");
const clamp01 = (v) => Math.max(0, Math.min(1, v));
function RadialBarChart(props) {
    const theme = (0, common_1.useChartTheme)();
    const { data, nameField = 'name', valueField = 'value', max, maxField, size = 260, color, centerTitle, legend = true, animation = true, animateDuration = 900, formatter, style, } = props;
    const p = (0, common_1.useEnter)(animation, animateDuration);
    const n = data.length;
    const fmt = (v) => (formatter ? formatter(v) : String(Math.round(v)));
    const fracs = data.map((d) => {
        const v = Number(d[valueField]) || 0;
        const m = maxField && d[maxField] != null ? Number(d[maxField]) : max != null ? max : Math.max(1, ...data.map((x) => Number(x[valueField]) || 0));
        return clamp01(v / (m || 1));
    });
    const cx = size / 2;
    const cy = size / 2;
    const ringGap = 4;
    const outerPad = 6;
    const centerHole = size * 0.2; // 预留中心空洞放统计，避免文字压环
    const stroke = n > 0 ? Math.max(4, (size / 2 - outerPad - centerHole - (n - 1) * ringGap) / n) : 0;
    const [hover, setHover] = react_1.default.useState(() => {
        const env = typeof process !== 'undefined' ? process.env.FLUX_CHART_HOVER : undefined;
        if (env != null && env !== '' && Number.isFinite(Number(env))) {
            const k = Number(env);
            return k >= 0 && k < n ? k : null;
        }
        return null;
    });
    const stagger = 0.4;
    const seg = (i) => {
        const start = n <= 1 ? 0 : (i / n) * stagger;
        return clamp01((p - start) / (1 - stagger));
    };
    const rings = data.map((d, i) => {
        const rOuter = size / 2 - outerPad - i * (stroke + ringGap);
        const r = rOuter - stroke / 2;
        const col = (0, theme_1.seriesColor)(i, color, theme);
        const t = seg(i);
        const trackD = (0, geometry_1.arcPath)(cx, cy, r, 0, 359.99);
        const valueD = (0, geometry_1.arcPath)(cx, cy, r, 0, 360 * fracs[i] * t);
        const dim = hover != null && hover !== i;
        return (react_1.default.createElement(components_1.View, { key: i, style: { position: 'absolute', left: 0, top: 0, width: size, height: size, opacity: dim ? 0.4 : 1 } },
            react_1.default.createElement(icon_1.Icon, { path: trackD, vb: size, size: size, color: theme.fillTrack, strokeWidth: stroke }),
            valueD ? (react_1.default.createElement(components_1.View, { style: { position: 'absolute', left: 0, top: 0 } },
                react_1.default.createElement(icon_1.Icon, { path: valueD, vb: size, size: size, color: col, strokeWidth: stroke }))) : null));
    });
    const activeName = hover != null ? String(data[hover][nameField] ?? '') : centerTitle;
    const activePct = hover != null ? `${Math.round(fracs[hover] * 100)}%` : null;
    const activeCol = hover != null ? (0, theme_1.seriesColor)(hover, color, theme) : theme.label;
    const activeVal = hover != null ? fmt(Number(data[hover][valueField]) || 0) : null;
    return (react_1.default.createElement(components_1.View, { style: [{ flexDirection: 'row', alignItems: 'center', gap: theme.labelSize + 10 }, style] },
        react_1.default.createElement(components_1.View, { style: { width: size, height: size, position: 'relative' } },
            rings,
            activeName != null ? (react_1.default.createElement(components_1.View, { style: { position: 'absolute', left: 0, top: 0, width: size, height: size, alignItems: 'center', justifyContent: 'center', gap: 2 } },
                react_1.default.createElement(components_1.Text, { style: { fontSize: size * 0.085, color: theme.label, opacity: 0.8 }, numberOfLines: 1 }, activeName),
                activePct ? react_1.default.createElement(components_1.Text, { style: { fontSize: size * 0.16, fontWeight: '700', color: activeCol } }, activePct) : null,
                activeVal ? react_1.default.createElement(components_1.Text, { style: { fontSize: size * 0.075, color: theme.label, opacity: 0.55 } }, activeVal) : null)) : null),
        legend && n > 0 ? (react_1.default.createElement(components_1.View, { style: { gap: 8, minWidth: 120 } }, data.map((d, i) => {
            const col = (0, theme_1.seriesColor)(i, color, theme);
            const dim = hover != null && hover !== i;
            return (react_1.default.createElement(components_1.Pressable, { key: i, onMouseEnter: () => setHover(i), onMouseLeave: () => setHover((h) => (h === i ? null : h)), style: { flexDirection: 'row', alignItems: 'center', gap: 8, opacity: dim ? 0.45 : 1 } },
                react_1.default.createElement(components_1.View, { style: { width: 10, height: 10, borderRadius: 5, backgroundColor: col } }),
                react_1.default.createElement(components_1.Text, { style: { flex: 1, fontSize: theme.labelSize + 1, color: theme.label }, numberOfLines: 1 }, String(d[nameField] ?? '')),
                react_1.default.createElement(components_1.Text, { style: { fontSize: theme.labelSize + 1, color: (0, theme_1.withAlpha)(theme.label, 'CC'), fontWeight: '600' } },
                    Math.round(fracs[i] * 100),
                    "%")));
        }))) : null));
}
exports.default = RadialBarChart;
