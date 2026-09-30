"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TreemapChart = TreemapChart;
// Treemap：矩形树图（单层）。squarify 布局面积∝值；cell 为离散矩形→逐块 Pressable 悬浮（零歧义）。
// 入场按值序错峰淡入；悬浮：其余降透明度 + 白描边 + 气泡（名称/值/占比）。colorField 分组着色 + 图例切换。
const react_1 = __importDefault(require("react"));
const components_1 = require("../../components");
const common_1 = require("../core/common");
const treemap_1 = require("../core/treemap");
const scale_1 = require("../core/scale");
const theme_1 = require("../core/theme");
const TIP_W = 160;
function TreemapChart(props) {
    const theme = (0, common_1.useChartTheme)();
    const { data, nameField = 'name', valueField = 'value', colorField, width, height = 300, gap = 2, label = true, tooltip = true, color, legend = true, animation = true, animateDuration = 900, valueFormatter = scale_1.compactNumber, style, } = props;
    const [measured, onLayout] = (0, common_1.useMeasuredWidth)(width ?? 520);
    const w = width ?? measured;
    const p = (0, common_1.useEnter)(animation, animateDuration);
    const [hover, setHover] = react_1.default.useState(() => {
        const env = typeof process !== 'undefined' ? process.env.FLUX_CHART_HOVER : undefined;
        if (env != null && env !== '' && Number.isFinite(Number(env)))
            return Number(env);
        return null;
    });
    const rows = data.map((d) => ({
        name: String(d[nameField] ?? ''),
        value: Number(d[valueField]) || 0,
        group: colorField ? String(d[colorField] ?? '') : '',
    }));
    // 分组顺序（首现序）→ 组色索引；无 colorField 时按叶子索引着色
    const groups = [];
    if (colorField)
        rows.forEach((r) => { if (!groups.includes(r.group))
            groups.push(r.group); });
    const { isHidden, toggle, active } = (0, common_1.useLegendToggle)(Math.max(groups.length, 1));
    const shown = colorField ? rows.filter((r) => !isHidden(groups.indexOf(r.group))) : rows;
    const rects = (0, treemap_1.squarify)(shown.map((r) => r.value), 0, 0, w, height);
    const totalArea = rects.length ? shown.reduce((a, b) => a + Math.max(0, b.value), 0) : 1;
    const colorOf = (leafIndex) => {
        const r = shown[leafIndex];
        if (colorField)
            return (0, theme_1.seriesColor)(groups.indexOf(r.group), color, theme);
        return (0, theme_1.seriesColor)(leafIndex, color, theme);
    };
    const legendItems = groups.map((g, i) => ({ name: g, color: (0, theme_1.seriesColor)(i, color, theme) }));
    // 悬浮气泡内容
    const hi = hover != null && hover < rects.length ? hover : null;
    const tipRect = hi != null ? rects[hi] : null;
    const tipLeft = tipRect ? Math.max(4, Math.min(w - TIP_W - 4, tipRect.x + tipRect.w / 2 - TIP_W / 2)) : 0;
    return (react_1.default.createElement(components_1.View, { style: [{ gap: theme.labelSize }, style], onLayout: onLayout },
        react_1.default.createElement(components_1.View, { style: { width: w, height, position: 'relative' } },
            rects.map((rc, i) => {
                const col = colorOf(i);
                const inset = gap / 2;
                const cw = Math.max(0, rc.w - gap);
                const ch = Math.max(0, rc.h - gap);
                const stagger = Math.min(0.6, rects.length > 1 ? 0.6 : 0);
                const t = Math.max(0, Math.min(1, (p - (i / rects.length) * stagger) / (1 - stagger)));
                const isHover = hi === i;
                const dim = hi != null && !isHover;
                const showLabel = label && cw > 46 && ch > 30;
                return (react_1.default.createElement(components_1.Pressable, { key: i, onMouseEnter: tooltip ? () => setHover(i) : undefined, onMouseLeave: tooltip ? () => setHover((h) => (h === i ? null : h)) : undefined, style: {
                        position: 'absolute',
                        left: rc.x + inset,
                        top: rc.y + inset,
                        width: cw,
                        height: ch,
                        borderRadius: 3,
                        backgroundColor: col,
                        opacity: dim ? 0.35 : t,
                        borderWidth: isHover ? 2 : 0,
                        borderColor: isHover ? '#ffffff' : 'transparent',
                        padding: 6,
                    } }, showLabel ? (react_1.default.createElement(components_1.View, { style: { flex: 1 }, pointerEvents: "none" },
                    react_1.default.createElement(components_1.Text, { numberOfLines: 1, style: { fontSize: theme.labelSize, color: '#ffffff', fontWeight: '600' } }, shown[i].name),
                    ch > 46 ? (react_1.default.createElement(components_1.Text, { numberOfLines: 1, style: { fontSize: theme.labelSize, color: '#ffffffcc', marginTop: 2 } }, valueFormatter(shown[i].value))) : null)) : null));
            }),
            tooltip && tipRect ? (react_1.default.createElement(components_1.View, { style: { position: 'absolute', left: tipLeft, top: 8, width: TIP_W, backgroundColor: theme.tooltipBg, borderRadius: 6, padding: 8, gap: 4, pointerEvents: 'none' } },
                react_1.default.createElement(components_1.View, { style: { flexDirection: 'row', alignItems: 'center', gap: 6 } },
                    react_1.default.createElement(components_1.View, { style: { width: 8, height: 8, borderRadius: 4, backgroundColor: colorOf(hi) } }),
                    react_1.default.createElement(components_1.Text, { style: { flex: 1, fontSize: theme.labelSize, color: theme.tooltipText }, numberOfLines: 1 }, shown[hi].name)),
                react_1.default.createElement(components_1.View, { style: { flexDirection: 'row', justifyContent: 'space-between' } },
                    react_1.default.createElement(components_1.Text, { style: { fontSize: theme.labelSize, color: theme.tooltipText, opacity: 0.7 } }, valueField),
                    react_1.default.createElement(components_1.Text, { style: { fontSize: theme.labelSize, color: theme.tooltipText, fontWeight: '600' } }, valueFormatter(shown[hi].value))),
                react_1.default.createElement(components_1.View, { style: { flexDirection: 'row', justifyContent: 'space-between' } },
                    react_1.default.createElement(components_1.Text, { style: { fontSize: theme.labelSize, color: theme.tooltipText, opacity: 0.7 } }, "\u5360\u6BD4"),
                    react_1.default.createElement(components_1.Text, { style: { fontSize: theme.labelSize, color: theme.tooltipText, fontWeight: '600' } },
                        ((shown[hi].value / totalArea) * 100).toFixed(1),
                        "%")))) : null),
        legend && colorField && groups.length > 1 ? react_1.default.createElement(common_1.ChartLegend, { items: legendItems, active: active, onToggleIndex: toggle }) : null));
}
exports.default = TreemapChart;
