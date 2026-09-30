"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RoseChart = RoseChart;
// Rose：南丁格尔玫瑰图。方形画布，Icon raw path（mode=fill）逐块画扇形——每类目等分角度、半径∝值。
// roseType：'radius' 半径线性正比；'area' 面积正比（半径∝√值，视觉更均衡）。入场：半径 0→目标「绽放」。
// tooltip：悬浮花瓣外扩提亮、邻瓣压暗 + 气泡（值 + 占比）。
const react_1 = __importDefault(require("react"));
const components_1 = require("../../components");
const theme_1 = require("../../theme");
const icon_1 = require("../../ui/icon");
const common_1 = require("../core/common");
const data_1 = require("../core/data");
const geometry_1 = require("../core/geometry");
const theme_2 = require("../core/theme");
const scale_1 = require("../core/scale");
function RoseChart(props) {
    const theme = (0, common_1.useChartTheme)();
    const { token } = (0, theme_1.useToken)();
    const { data, xField = 'type', yField = 'value', size = 260, innerRadius = 0, roseType = 'radius', color, legend = true, padAngle = 1, label = false, tooltip = true, animation = true, animateDuration = 1000, valueFormatter = scale_1.compactNumber, style, } = props;
    const p = (0, common_1.useEnter)(animation, animateDuration);
    const pairs = (0, data_1.flatPairs)(data, xField, yField);
    const { isHidden, toggle, active } = (0, common_1.useLegendToggle)(pairs.length);
    // 隐藏类目后：角度在可见集内重分、半径按可见集最大值缩放，中心合计同步减少
    const visible = pairs.map((d, i) => ({ d, i })).filter((x) => !isHidden(x.i));
    const total = visible.reduce((a, b) => a + b.d.value, 0) || 1;
    const maxV = Math.max(1, ...visible.map((x) => x.d.value));
    const cx = size / 2;
    const cy = size / 2;
    const rMax = size / 2 - 6;
    const rInner = rMax * Math.max(0, Math.min(0.9, innerRadius));
    const N = Math.max(visible.length, 1);
    const step = 360 / N;
    const radiusFor = (v) => {
        const ratio = roseType === 'area' ? Math.sqrt(v / maxV) : v / maxV;
        return rInner + (rMax - rInner) * ratio;
    };
    const legendItems = pairs.map((d, i) => ({ name: `${d.label}  ${valueFormatter(d.value)}`, color: (0, theme_2.seriesColor)(i, color, theme) }));
    // 悬浮花瓣：抓帧可由 FLUX_CHART_HOVER（原始序号）预设，否则由命中盒驱动
    const [hover, setHover] = react_1.default.useState(() => {
        const env = typeof process !== 'undefined' ? process.env.FLUX_CHART_HOVER : undefined;
        if (env != null && env !== '' && Number.isFinite(Number(env))) {
            const k = Number(env);
            return k >= 0 && k < pairs.length ? k : null;
        }
        return null;
    });
    // 命中盒用完全绽放半径（与 label 同策略：入场期间不抢交互）
    const petals = visible.map((x, k) => ({
        ...x,
        start: k * step + padAngle / 2,
        sweep: step - padAngle,
        rFull: radiusFor(x.d.value),
    }));
    const hiPet = hover != null ? petals.find((x) => x.i === hover) : null;
    const TIP_W = 140;
    let tipLeft = 4;
    let tipTop = 4;
    if (hiPet) {
        const mid = hiPet.start + hiPet.sweep / 2;
        const [ax, ay] = (0, geometry_1.polar)(cx, cy, Math.max(hiPet.rFull * 0.6, rInner + 10), mid);
        tipLeft = Math.max(4, Math.min(size - TIP_W - 4, ax - TIP_W / 2));
        tipTop = Math.max(4, Math.min(size - 64, ay - 56));
    }
    return (react_1.default.createElement(components_1.View, { style: [{ flexDirection: 'row', alignItems: 'flex-start', gap: token.marginLG }, style] },
        react_1.default.createElement(components_1.View, { style: { width: size, height: size, position: 'relative' } },
            petals.map((x, k) => {
                const r = x.rFull * p;
                if (r <= rInner + 0.5)
                    return null;
                const isHi = hover === x.i;
                const path = (0, geometry_1.sectorPath)(cx, cy, rInner, Math.min(r + (isHi ? 5 : 0), rMax + 5), x.start, x.sweep);
                if (!path)
                    return null;
                return (react_1.default.createElement(components_1.View, { key: x.i, style: { position: 'absolute', left: 0, top: 0, opacity: hover != null && !isHi ? 0.45 : 1 } },
                    react_1.default.createElement(icon_1.Icon, { path: path, vb: size, size: size, color: (0, theme_2.seriesColor)(x.i, color, theme), mode: "fill" })));
            }),
            innerRadius > 0 ? (react_1.default.createElement(components_1.View, { style: { position: 'absolute', left: 0, top: 0, width: size, height: size, alignItems: 'center', justifyContent: 'center' } },
                react_1.default.createElement(components_1.Text, { style: { fontSize: token.fontSizeXL, fontWeight: '600', color: token.colorText } }, valueFormatter(total)))) : null,
            label && p > 0.85
                ? petals.map((x) => {
                    const mid = x.start + x.sweep / 2;
                    const [lx, ly] = (0, geometry_1.polar)(cx, cy, x.rFull + 12, mid);
                    return (react_1.default.createElement(components_1.Text, { key: `rl${x.i}`, numberOfLines: 1, style: { position: 'absolute', left: lx - 30, top: ly - theme.labelSize, width: 60, textAlign: 'center', fontSize: theme.labelSize, color: (0, theme_2.seriesColor)(x.i, color, theme), fontWeight: '600' } }, valueFormatter(x.d.value)));
                })
                : null,
            tooltip && hiPet && p >= 1 ? (react_1.default.createElement(components_1.View, { pointerEvents: "none", style: { position: 'absolute', left: tipLeft, top: tipTop, width: TIP_W, backgroundColor: theme.tooltipBg, borderRadius: 6, padding: 8, gap: 4 } },
                react_1.default.createElement(components_1.Text, { style: { fontSize: theme.labelSize, color: theme.tooltipText, opacity: 0.7 }, numberOfLines: 1 }, hiPet.d.label),
                react_1.default.createElement(components_1.View, { style: { flexDirection: 'row', alignItems: 'center', gap: 6 } },
                    react_1.default.createElement(components_1.View, { style: { width: 8, height: 8, borderRadius: 4, backgroundColor: (0, theme_2.seriesColor)(hiPet.i, color, theme) } }),
                    react_1.default.createElement(components_1.Text, { style: { flex: 1, fontSize: theme.labelSize, color: theme.tooltipText }, numberOfLines: 1 }, yField),
                    react_1.default.createElement(components_1.Text, { style: { fontSize: theme.labelSize, color: theme.tooltipText, fontWeight: '600' } }, valueFormatter(hiPet.d.value))),
                react_1.default.createElement(components_1.View, { style: { flexDirection: 'row', alignItems: 'center', gap: 6 } },
                    react_1.default.createElement(components_1.View, { style: { width: 8, height: 8, borderRadius: 4, backgroundColor: 'transparent' } }),
                    react_1.default.createElement(components_1.Text, { style: { flex: 1, fontSize: theme.labelSize, color: theme.tooltipText, opacity: 0.7 } }, "\u5360\u6BD4"),
                    react_1.default.createElement(components_1.Text, { style: { fontSize: theme.labelSize, color: theme.tooltipText, fontWeight: '600' } }, `${((hiPet.d.value / total) * 100).toFixed(1)}%`)))) : null,
            tooltip && p >= 1
                ? petals.flatMap((x) => (0, geometry_1.sectorHitBoxes)(cx, cy, rInner, x.rFull, x.start, x.sweep).map((b, k) => (react_1.default.createElement(components_1.Pressable, { key: `hit${x.i}-${k}`, onMouseEnter: () => setHover(x.i), onMouseLeave: () => setHover((h) => (h === x.i ? null : h)), style: { position: 'absolute', left: b.left, top: b.top, width: b.width, height: b.height } }))))
                : null),
        legend ? react_1.default.createElement(common_1.ChartLegend, { items: legendItems, direction: "vertical", size: "middle", active: active, onToggleIndex: toggle, style: { flex: 1, paddingTop: 4 } }) : null));
}
exports.default = RoseChart;
