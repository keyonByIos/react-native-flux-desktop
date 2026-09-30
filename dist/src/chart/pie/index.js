"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PieChart = PieChart;
// Pie：饼 / 环形图。方形画布上用 Icon raw path（mode=fill）逐块画扇环；入场总扫角 0→360 推进。
// donut 中心显示总计或自定义；图例列出 类目 + 百分比。tooltip：悬浮扇区外扩提亮、邻区压暗 + 气泡。
const react_1 = __importDefault(require("react"));
const components_1 = require("../../components");
const theme_1 = require("../../theme");
const icon_1 = require("../../ui/icon");
const common_1 = require("../core/common");
const data_1 = require("../core/data");
const geometry_1 = require("../core/geometry");
const theme_2 = require("../core/theme");
const scale_1 = require("../core/scale");
function PieChart(props) {
    const theme = (0, common_1.useChartTheme)();
    const { token } = (0, theme_1.useToken)();
    const { data, angleField = 'value', colorField = 'type', size = 240, innerRadius = 0, color, legend = true, padAngle = 0, animation = true, animateDuration = 1000, centerTitle, label = false, tooltip = true, valueFormatter = scale_1.compactNumber, style, } = props;
    const p = (0, common_1.useEnter)(animation, animateDuration);
    const pairs = (0, data_1.flatPairs)(data, colorField, angleField);
    const { isHidden, toggle, active } = (0, common_1.useLegendToggle)(pairs.length);
    const visible = pairs.filter((d, i) => !isHidden(i));
    // 隐藏类目后占比重算：可见扇区补位填满 360°（图例百分比同步为新区间）
    const total = visible.reduce((a, b) => a + b.value, 0) || 1;
    const cx = size / 2;
    const cy = size / 2;
    const rOuter = size / 2 - 4;
    const rInner = rOuter * Math.max(0, Math.min(0.9, innerRadius));
    // 累积起始角（12 点为 0，顺时针）；color 按原始序号取，切换不换色
    let acc = 0;
    const slices = visible.map((d) => {
        const gi = pairs.indexOf(d);
        const frac = d.value / total;
        const start = acc * 360;
        acc += frac;
        const end = acc * 360;
        return { ...d, gi, frac, start, end, color: (0, theme_2.seriesColor)(gi, color, theme) };
    });
    const revealEnd = 360 * p;
    const legendItems = pairs.map((d, i) => {
        const s = slices.find((x) => x.label === d.label);
        return { name: `${d.label}  ${s ? (s.frac * 100).toFixed(0) : 0}%`, color: (0, theme_2.seriesColor)(i, color, theme) };
    });
    // 悬浮扇区：抓帧可由 FLUX_CHART_HOVER（原始序号）预设，否则由命中盒 hover 驱动
    const [hover, setHover] = react_1.default.useState(() => {
        const env = typeof process !== 'undefined' ? process.env.FLUX_CHART_HOVER : undefined;
        if (env != null && env !== '' && Number.isFinite(Number(env))) {
            const k = Number(env);
            return k >= 0 && k < pairs.length ? k : null;
        }
        return null;
    });
    const hi = hover != null && slices.some((s) => s.gi === hover) ? hover : null;
    // 气泡锚点：悬浮扇区中角外侧（靠边界自动收进画布）
    const hoverSlice = hi != null ? slices.find((s) => s.gi === hi) : null;
    const TIP_W = 140;
    let tipLeft = 4;
    let tipTop = 4;
    if (hoverSlice) {
        const [ax, ay] = (0, geometry_1.polar)(cx, cy, rOuter * 0.72, (hoverSlice.start + hoverSlice.end) / 2);
        tipLeft = Math.max(4, Math.min(size - TIP_W - 4, ax - TIP_W / 2));
        tipTop = Math.max(4, Math.min(size - 64, ay - 56));
    }
    return (react_1.default.createElement(components_1.View, { style: [{ flexDirection: 'row', alignItems: 'flex-start', gap: token.marginLG }, style] },
        react_1.default.createElement(components_1.View, { style: { width: size, height: size, position: 'relative' } },
            slices.map((s, i) => {
                const e = Math.min(s.end, revealEnd);
                if (e <= s.start)
                    return null;
                const gi = s.gi;
                const isHi = hi === gi;
                // 悬浮外扩 5px，其余扇区压暗（有任一悬浮时 0.45）
                const d = (0, geometry_1.sectorPath)(cx, cy, rInner, rOuter + (isHi ? 5 : 0), s.start + padAngle / 2, e - s.start - padAngle);
                if (!d)
                    return null;
                return (react_1.default.createElement(components_1.View, { key: i, style: { position: 'absolute', left: 0, top: 0, opacity: hi != null && !isHi ? 0.45 : 1 } },
                    react_1.default.createElement(icon_1.Icon, { path: d, vb: size, size: size, color: s.color, mode: "fill" })));
            }),
            innerRadius > 0 ? (react_1.default.createElement(components_1.View, { style: { position: 'absolute', left: 0, top: 0, width: size, height: size, alignItems: 'center', justifyContent: 'center' } },
                react_1.default.createElement(components_1.Text, { style: { fontSize: token.fontSizeXL, fontWeight: '600', color: token.colorText } }, valueFormatter(total)),
                centerTitle ? react_1.default.createElement(components_1.Text, { style: { fontSize: token.fontSizeSM, color: token.colorTextTertiary, marginTop: 2 } }, centerTitle) : null)) : null,
            label
                ? slices.map((s, i) => {
                    if (revealEnd < s.end || s.frac < 0.04)
                        return null;
                    const mid = (s.start + s.end) / 2;
                    const [lx, ly] = (0, geometry_1.polar)(cx, cy, rOuter + 16, mid);
                    return (react_1.default.createElement(components_1.Text, { key: `pl${i}`, numberOfLines: 1, style: { position: 'absolute', left: lx - 26, top: ly - theme.labelSize, width: 52, textAlign: 'center', fontSize: theme.labelSize, color: s.color, fontWeight: '600' } },
                        (s.frac * 100).toFixed(0),
                        "%"));
                })
                : null,
            tooltip && hoverSlice ? (react_1.default.createElement(components_1.View, { pointerEvents: "none", style: { position: 'absolute', left: tipLeft, top: tipTop, width: TIP_W, backgroundColor: theme.tooltipBg, borderRadius: 6, padding: 8, gap: 4 } },
                react_1.default.createElement(components_1.Text, { style: { fontSize: theme.labelSize, color: theme.tooltipText, opacity: 0.7 }, numberOfLines: 1 }, hoverSlice.label),
                react_1.default.createElement(components_1.View, { style: { flexDirection: 'row', alignItems: 'center', gap: 6 } },
                    react_1.default.createElement(components_1.View, { style: { width: 8, height: 8, borderRadius: 4, backgroundColor: hoverSlice.color } }),
                    react_1.default.createElement(components_1.Text, { style: { flex: 1, fontSize: theme.labelSize, color: theme.tooltipText }, numberOfLines: 1 }, angleField),
                    react_1.default.createElement(components_1.Text, { style: { fontSize: theme.labelSize, color: theme.tooltipText, fontWeight: '600' } }, valueFormatter(hoverSlice.value))),
                react_1.default.createElement(components_1.View, { style: { flexDirection: 'row', alignItems: 'center', gap: 6 } },
                    react_1.default.createElement(components_1.View, { style: { width: 8, height: 8, borderRadius: 4, backgroundColor: 'transparent' } }),
                    react_1.default.createElement(components_1.Text, { style: { flex: 1, fontSize: theme.labelSize, color: theme.tooltipText, opacity: 0.7 } }, "\u5360\u6BD4"),
                    react_1.default.createElement(components_1.Text, { style: { fontSize: theme.labelSize, color: theme.tooltipText, fontWeight: '600' } }, `${(hoverSlice.frac * 100).toFixed(1)}%`)))) : null,
            tooltip
                ? slices.flatMap((s, i) => (0, geometry_1.sectorHitBoxes)(cx, cy, rInner, rOuter, s.start + padAngle / 2, Math.min(s.end, revealEnd) - s.start - padAngle).map((b, k) => (react_1.default.createElement(components_1.Pressable, { key: `hit${i}-${k}`, onMouseEnter: () => setHover(s.gi), onMouseLeave: () => setHover((h) => (h === s.gi ? null : h)), style: { position: 'absolute', left: b.left, top: b.top, width: b.width, height: b.height } }))))
                : null),
        legend ? react_1.default.createElement(common_1.ChartLegend, { items: legendItems, direction: "vertical", size: "middle", active: active, onToggleIndex: toggle, style: { flex: 1, paddingTop: 4 } }) : null));
}
exports.default = PieChart;
