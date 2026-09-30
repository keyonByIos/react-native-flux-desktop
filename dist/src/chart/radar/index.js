"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RadarChart = RadarChart;
// Radar：雷达图。方形画布，Icon raw path 画网格（多边形环 + 辐条）与数据面（fill + stroke）。
// 入场：数据点从圆心按 p 外扩（r*v * p），呈「自中心绽开」。多 seriesField 叠加多边形。
const react_1 = __importDefault(require("react"));
const components_1 = require("../../components");
const theme_1 = require("../../theme");
const icon_1 = require("../../ui/icon");
const common_1 = require("../core/common");
const data_1 = require("../core/data");
const scale_1 = require("../core/scale");
const geometry_1 = require("../core/geometry");
const theme_2 = require("../core/theme");
function RadarChart(props) {
    const theme = (0, common_1.useChartTheme)();
    const { token } = (0, theme_1.useToken)();
    const { data, xField, yField, seriesField, size = 280, color, levels = 4, point = true, fill = true, legend = true, animation = true, animateDuration = 900, tooltip = true, style, } = props;
    const p = (0, common_1.useEnter)(animation, animateDuration);
    const prep = (0, data_1.prepare)(data, xField, yField, seriesField);
    const { isHidden, toggle, active: legendActive } = (0, common_1.useLegendToggle)(prep.series.length);
    const axes = prep.categories;
    const N = Math.max(axes.length, 3);
    const maxV = Math.max(1, ...prep.series.flatMap((s) => s.points.map((v) => v ?? 0)));
    const { niceMax } = (0, scale_1.niceTicks)(maxV);
    const cx = size / 2;
    const cy = size / 2;
    const rMax = size / 2 - 34;
    const ang = (i) => (i / N) * 360;
    // 网格：环多边形 + 辐条
    const gridD = (() => {
        let d = '';
        for (let l = 1; l <= levels; l++) {
            const fr = l / levels;
            const pts = axes.map((_, i) => (0, geometry_1.polar)(cx, cy, rMax * fr, ang(i)));
            d += (0, geometry_1.polygonPath)(pts);
        }
        for (let i = 0; i < N; i++) {
            const [x, y] = (0, geometry_1.polar)(cx, cy, rMax, ang(i));
            d += ` M ${cx.toFixed(2)} ${cy.toFixed(2)} L ${x.toFixed(2)} ${y.toFixed(2)}`;
        }
        return d;
    })();
    const legendItems = prep.series.map((s, i) => ({ name: s.name, color: (0, theme_2.seriesColor)(i, color, theme) }));
    const vertices = [];
    if (point && tooltip) {
        prep.series.forEach((s, si) => {
            if (isHidden(si))
                return;
            const col = (0, theme_2.seriesColor)(si, color, theme);
            axes.forEach((_a, i) => {
                const v = s.points[i] ?? 0;
                const [x, y] = (0, geometry_1.polar)(cx, cy, (v / niceMax) * rMax * p, ang(i));
                vertices.push({ x, y, value: v, col, series: s.name, axis: axes[i] });
            });
        });
    }
    const [hover, setHover] = react_1.default.useState(() => {
        const env = typeof process !== 'undefined' ? process.env.FLUX_CHART_HOVER : undefined;
        const k = env != null ? Number(env) : NaN;
        return Number.isInteger(k) && k >= 0 ? k : null;
    });
    const TIP_W = 128;
    const hl = hover != null && hover < vertices.length ? vertices[hover] : null;
    const tipLeft = hl ? (hl.x + 12 + TIP_W > size ? Math.max(2, hl.x - 12 - TIP_W) : hl.x + 12) : 0;
    const tipTop = hl ? Math.max(2, Math.min(size - 58, hl.y - 26)) : 0;
    return (react_1.default.createElement(components_1.View, { style: [{ gap: token.marginSM }, style] },
        react_1.default.createElement(components_1.View, { style: { width: size, height: size, position: 'relative' } },
            react_1.default.createElement(icon_1.Icon, { path: gridD, vb: size, size: size, color: theme.gridLine, strokeWidth: 1, mode: "stroke" }),
            prep.series.map((s, si) => {
                if (isHidden(si))
                    return null;
                const col = (0, theme_2.seriesColor)(si, color, theme);
                const pts = axes.map((_a, i) => {
                    const v = s.points[i] ?? 0;
                    return (0, geometry_1.polar)(cx, cy, (v / niceMax) * rMax * p, ang(i));
                });
                const d = (0, geometry_1.polygonPath)(pts);
                return (react_1.default.createElement(react_1.default.Fragment, { key: si },
                    fill ? (react_1.default.createElement(components_1.View, { style: { position: 'absolute', left: 0, top: 0 } },
                        react_1.default.createElement(icon_1.Icon, { path: d, vb: size, size: size, color: (0, theme_2.withAlpha)(col, '40'), mode: "fill" }))) : null,
                    react_1.default.createElement(components_1.View, { style: { position: 'absolute', left: 0, top: 0 } },
                        react_1.default.createElement(icon_1.Icon, { path: d, vb: size, size: size, color: col, strokeWidth: 2, mode: "stroke" })),
                    point
                        ? pts.map((pt, i) => (react_1.default.createElement(components_1.View, { key: `pt${i}`, style: { position: 'absolute', left: pt[0] - 3, top: pt[1] - 3, width: 6, height: 6, borderRadius: 3, backgroundColor: col } })))
                        : null));
            }),
            axes.map((a, i) => {
                const [lx, ly] = (0, geometry_1.polar)(cx, cy, rMax + 16, ang(i));
                return (react_1.default.createElement(components_1.Text, { key: `a${i}`, numberOfLines: 1, style: { position: 'absolute', left: lx - 34, top: ly - 8, width: 68, textAlign: 'center', fontSize: theme.labelSize, color: theme.label } }, a));
            }),
            vertices.map((v, i) => (react_1.default.createElement(components_1.Pressable, { key: `vh${i}`, onMouseEnter: () => setHover(i), onMouseLeave: () => setHover((cur) => (cur === i ? null : cur)), style: { position: 'absolute', left: v.x - 7, top: v.y - 7, width: 14, height: 14, borderRadius: 7 } }))),
            hl ? (react_1.default.createElement(react_1.default.Fragment, null,
                react_1.default.createElement(components_1.View, { style: { position: 'absolute', left: hl.x - 6, top: hl.y - 6, width: 12, height: 12, borderRadius: 6, borderWidth: 2, borderColor: hl.col, backgroundColor: theme.tooltipBg } }),
                react_1.default.createElement(components_1.View, { style: { position: 'absolute', left: tipLeft, top: tipTop, width: TIP_W, backgroundColor: theme.tooltipBg, borderRadius: 6, padding: 8, gap: 4 } },
                    react_1.default.createElement(components_1.Text, { numberOfLines: 1, style: { fontSize: theme.labelSize, color: theme.tooltipText, fontWeight: '600' } }, hl.series),
                    react_1.default.createElement(components_1.View, { style: { flexDirection: 'row', justifyContent: 'space-between' } },
                        react_1.default.createElement(components_1.Text, { style: { fontSize: theme.labelSize, color: theme.tooltipText, opacity: 0.7 } }, hl.axis),
                        react_1.default.createElement(components_1.Text, { style: { fontSize: theme.labelSize, color: hl.col, fontWeight: '600' } }, String(hl.value)))))) : null),
        legend && prep.series.length > 1 ? react_1.default.createElement(common_1.ChartLegend, { items: legendItems, active: legendActive, onToggleIndex: toggle }) : null));
}
exports.default = RadarChart;
