"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SunburstChart = SunburstChart;
// Sunburst：环形树图（多层）。layoutSunburst 角度分区、子弧填满父弧；Icon raw path（mode=fill）逐弧画扇环。
// 入场：总扫角 0→360 揭示（同 Pie）。着色：按顶层分支取色板、逐环向白提亮（外环更浅）。中心显总计。
// 图例：列出顶层分支 + 占比，点击隐藏该分支并重排（颜色按原始分支锁定，切换不换色）。
const react_1 = __importDefault(require("react"));
const components_1 = require("../../components");
const theme_1 = require("../../theme");
const icon_1 = require("../../ui/icon");
const common_1 = require("../core/common");
const sunburst_1 = require("../core/sunburst");
const geometry_1 = require("../core/geometry");
const theme_2 = require("../core/theme");
const scale_1 = require("../core/scale");
function SunburstChart(props) {
    const theme = (0, common_1.useChartTheme)();
    const { token } = (0, theme_1.useToken)();
    const { data, size = 300, innerRadius = 0.16, maxDepth = Infinity, padAngle = 0.8, color, legend = true, label = false, animation = true, animateDuration = 1100, centerTitle, valueFormatter = scale_1.compactNumber, style, } = props;
    const p = (0, common_1.useEnter)(animation, animateDuration);
    const branches = data.children ?? [];
    const { isHidden, toggle, active } = (0, common_1.useLegendToggle)(branches.length);
    const total = (0, sunburst_1.aggregate)(data) || 1;
    // 隐藏分支后重排：仅保留可见顶层分支，角度在可见集内补满 360；颜色按原始分支下标锁定
    const visibleIdx = [];
    branches.forEach((_, i) => {
        if (!isHidden(i))
            visibleIdx.push(i);
    });
    const prunedRoot = { name: data.name, value: data.value, children: visibleIdx.map((i) => branches[i]) };
    const arcs = (0, sunburst_1.layoutSunburst)(prunedRoot, maxDepth);
    const rings = arcs.reduce((a, x) => Math.max(a, x.depth), 0) || 1;
    const cx = size / 2;
    const cy = size / 2;
    const rOuter = size / 2 - 4;
    const rHole = rOuter * Math.max(0, Math.min(0.6, innerRadius));
    const ringW = (rOuter - rHole) / rings;
    const colorOf = (branch) => (0, theme_2.seriesColor)(visibleIdx[branch] ?? branch, color, theme);
    const revealEnd = 360 * p;
    const legendItems = branches.map((b, i) => {
        const v = (0, sunburst_1.aggregate)(b);
        return { name: `${b.name}  ${((v / total) * 100).toFixed(0)}%`, color: (0, theme_2.seriesColor)(i, color, theme) };
    });
    return (react_1.default.createElement(components_1.View, { style: [{ flexDirection: 'row', alignItems: 'flex-start', gap: token.marginLG }, style] },
        react_1.default.createElement(components_1.View, { style: { width: size, height: size, position: 'relative' } },
            arcs.map((a, i) => {
                const e = Math.min(a.end, revealEnd);
                if (e <= a.start)
                    return null;
                const r0 = rHole + (a.depth - 1) * ringW;
                const r1 = rHole + a.depth * ringW;
                const d = (0, geometry_1.sectorPath)(cx, cy, r0 + 0.5, r1 - 0.5, a.start + padAngle / 2, e - a.start - padAngle);
                if (!d)
                    return null;
                const base = colorOf(a.branch);
                const fill = (0, theme_2.lighten)(base, Math.min(0.6, (a.depth - 1) * 0.18));
                return (react_1.default.createElement(components_1.View, { key: i, style: { position: 'absolute', left: 0, top: 0 } },
                    react_1.default.createElement(icon_1.Icon, { path: d, vb: size, size: size, color: fill, mode: "fill" })));
            }),
            react_1.default.createElement(components_1.View, { style: { position: 'absolute', left: 0, top: 0, width: size, height: size, alignItems: 'center', justifyContent: 'center' } },
                react_1.default.createElement(components_1.Text, { style: { fontSize: token.fontSizeXL, fontWeight: '600', color: token.colorText } }, valueFormatter(total)),
                centerTitle ? react_1.default.createElement(components_1.Text, { style: { fontSize: token.fontSizeSM, color: token.colorTextTertiary, marginTop: 2 } }, centerTitle) : null),
            label
                ? arcs
                    .filter((a) => a.depth === 1 && revealEnd >= a.end && a.end - a.start >= 18)
                    .map((a, i) => {
                    const mid = (a.start + a.end) / 2;
                    const [lx, ly] = (0, geometry_1.polar)(cx, cy, rOuter + 14, mid);
                    return (react_1.default.createElement(components_1.Text, { key: `sl${i}`, numberOfLines: 1, style: { position: 'absolute', left: lx - 30, top: ly - theme.labelSize, width: 60, textAlign: 'center', fontSize: theme.labelSize, color: colorOf(a.branch), fontWeight: '600' } },
                        ((a.value / total) * 100).toFixed(0),
                        "%"));
                })
                : null),
        legend && branches.length > 0 ? react_1.default.createElement(common_1.ChartLegend, { items: legendItems, direction: "vertical", size: "middle", active: active, onToggleIndex: toggle, style: { flex: 1, paddingTop: 4 } }) : null));
}
exports.default = SunburstChart;
