"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ScatterChart = ScatterChart;
// Scatter：散点图。x/y 均为连续数值（不复用类目 Plot），自成帧画双轴网格。
// 入场：点按序号错峰「淡入 + 由 0 放大到目标半径」（复用 column 的 seg 错峰数学）。seriesField 分组着色。
const react_1 = __importDefault(require("react"));
const components_1 = require("../../components");
const common_1 = require("../core/common");
const scale_1 = require("../core/scale");
const theme_1 = require("../core/theme");
const grid_1 = require("../core/grid");
const clamp01 = (v) => Math.max(0, Math.min(1, v));
const PAD_L = 48;
const PAD_R = 18;
const PAD_T = 16;
const PAD_B = 30;
function ScatterChart(props) {
    const theme = (0, common_1.useChartTheme)();
    const { data, xField, yField, seriesField, sizeField, sizeRange = [4, 22], size = 5, color, width, height = 280, legend = true, tooltip = true, animation = true, animateDuration = 1000, stagger = 0.5, xAxisFormatter = scale_1.compactNumber, yAxisFormatter = scale_1.compactNumber, grid, style, } = props;
    const [measured, onLayout] = (0, common_1.useMeasuredWidth)(width ?? 520);
    const w = width ?? measured;
    const p = (0, common_1.useEnter)(animation, animateDuration);
    // 直接从 data 抽点并按 seriesField 分组（散点 x 为真实数值，不走类目 prepare）。
    const groups = new Map();
    const order = [];
    for (const row of data) {
        const x = Number(row[xField]);
        const y = Number(row[yField]);
        if (!Number.isFinite(x) || !Number.isFinite(y))
            continue;
        const s = sizeField ? Number(row[sizeField]) : 0;
        const name = seriesField ? String(row[seriesField]) : yField;
        if (!groups.has(name)) {
            groups.set(name, []);
            order.push(name);
        }
        groups.get(name).push({ x, y, s: Number.isFinite(s) ? s : 0 });
    }
    const allPts = [...groups.values()].flat();
    // 图例点切分组：隐藏后轴域只按可见点重算（缩放到剩余数据），点不画
    const { isHidden, toggle, active } = (0, common_1.useLegendToggle)(order.length);
    const visPts = order.flatMap((name, gi) => (isHidden(gi) ? [] : groups.get(name)));
    const pts = visPts.length > 0 ? visPts : allPts;
    const xLo = Math.min(...pts.map((d) => d.x));
    const xHi = Math.max(...pts.map((d) => d.x));
    const yLo = Math.min(...pts.map((d) => d.y));
    const yHi = Math.max(...pts.map((d) => d.y));
    const xt = (0, scale_1.linearTicks)(xLo, xHi, 5);
    const yt = (0, scale_1.linearTicks)(yLo, yHi, 4);
    const xd = [xt[0], xt[xt.length - 1]];
    const yd = [yt[0], yt[yt.length - 1]];
    const plotW = Math.max(0, w - PAD_L - PAD_R);
    const plotH = Math.max(0, height - PAD_T - PAD_B);
    const sx = (0, scale_1.linearScale)(xd, [PAD_L, PAD_L + plotW]);
    const sy = (0, scale_1.linearScale)(yd, [PAD_T + plotH, PAD_T]);
    const baseline = PAD_T + plotH;
    const legendItems = order.map((name, i) => ({ name, color: (0, theme_1.seriesColor)(i, color, theme) }));
    // 气泡半径：√ 面积比例（视觉面积正比于值）；定义域取可见点 s 的 min/max
    const sVals = pts.map((d) => d.s);
    const sLo = Math.sqrt(Math.max(0, Math.min(...sVals, 0)));
    const sHi = Math.sqrt(Math.max(...sVals, 1));
    const radiusFor = (v) => {
        if (!sizeField)
            return size;
        const t = sHi > sLo ? (Math.sqrt(Math.max(0, v)) - sLo) / (sHi - sLo) : 0.5;
        return sizeRange[0] + t * (sizeRange[1] - sizeRange[0]);
    };
    const total = Math.max(1, allPts.length);
    let idx = 0;
    // 逐点悬浮：记住悬中点的像素位置与数值。
    const [hover, setHover] = react_1.default.useState(null);
    const TIP_W = 150;
    const tipLeft = hover ? (hover.px + 12 + TIP_W > w ? Math.max(4, hover.px - 12 - TIP_W) : hover.px + 12) : 0;
    return (react_1.default.createElement(components_1.View, { style: [{ gap: theme.labelSize }, style], onLayout: onLayout },
        react_1.default.createElement(components_1.View, { style: { width: w, height, position: 'relative' } },
            react_1.default.createElement(grid_1.GridLines, { area: { left: PAD_L, top: PAD_T, width: plotW, height: plotH }, horizontal: yt.map((t) => sy(t)), vertical: xt.map((t) => sx(t)), config: grid, fallbackColor: theme.gridLine }),
            yt.map((t, i) => (react_1.default.createElement(components_1.Text, { key: `gy${i}`, style: { position: 'absolute', right: w - PAD_L + 8, top: sy(t) - theme.labelSize, width: PAD_L - 12, textAlign: 'right', fontSize: theme.labelSize, color: theme.label } }, yAxisFormatter(t)))),
            xt.map((t, i) => (react_1.default.createElement(components_1.Text, { key: `gx${i}`, style: { position: 'absolute', left: sx(t) - 24, top: baseline + 8, width: 48, textAlign: 'center', fontSize: theme.labelSize, color: theme.label } }, xAxisFormatter(t)))),
            react_1.default.createElement(components_1.View, { style: { position: 'absolute', left: PAD_L, top: baseline, width: plotW, height: 1, backgroundColor: theme.axisLine } }),
            react_1.default.createElement(components_1.View, { style: { position: 'absolute', left: PAD_L, top: PAD_T, width: 1, height: plotH, backgroundColor: theme.axisLine } }),
            order.map((name, gi) => {
                if (isHidden(gi))
                    return null;
                const col = (0, theme_1.seriesColor)(gi, color, theme);
                return groups.get(name).map((pt, pi) => {
                    const my = idx++;
                    const t = clamp01((p - (my / total) * stagger) / (1 - stagger));
                    const r = radiusFor(pt.s) * t;
                    const px = sx(pt.x);
                    const py = sy(pt.y);
                    return (react_1.default.createElement(components_1.Pressable, { key: `p${gi}-${pi}`, onMouseEnter: tooltip ? () => setHover({ px, py, tx: pt.x, ty: pt.y, ts: pt.s, name, col }) : undefined, onMouseLeave: tooltip ? () => setHover(null) : undefined, style: {
                            position: 'absolute',
                            left: px - r,
                            top: py - r,
                            width: r * 2,
                            height: r * 2,
                            borderRadius: r,
                            backgroundColor: col,
                            opacity: 0.85 * t,
                        } }));
                });
            }),
            hover ? (react_1.default.createElement(components_1.View, { style: { position: 'absolute', left: tipLeft, top: Math.max(4, hover.py - 18), width: TIP_W, backgroundColor: theme.tooltipBg, borderRadius: 6, padding: 8, gap: 4 } },
                react_1.default.createElement(components_1.View, { style: { flexDirection: 'row', alignItems: 'center', gap: 6 } },
                    react_1.default.createElement(components_1.View, { style: { width: 8, height: 8, borderRadius: 4, backgroundColor: hover.col } }),
                    react_1.default.createElement(components_1.Text, { style: { flex: 1, fontSize: theme.labelSize, color: theme.tooltipText }, numberOfLines: 1 }, hover.name)),
                react_1.default.createElement(components_1.View, { style: { flexDirection: 'row', justifyContent: 'space-between' } },
                    react_1.default.createElement(components_1.Text, { style: { fontSize: theme.labelSize, color: theme.tooltipText, opacity: 0.7 } }, xField),
                    react_1.default.createElement(components_1.Text, { style: { fontSize: theme.labelSize, color: theme.tooltipText, fontWeight: '600' } }, xAxisFormatter(hover.tx))),
                react_1.default.createElement(components_1.View, { style: { flexDirection: 'row', justifyContent: 'space-between' } },
                    react_1.default.createElement(components_1.Text, { style: { fontSize: theme.labelSize, color: theme.tooltipText, opacity: 0.7 } }, yField),
                    react_1.default.createElement(components_1.Text, { style: { fontSize: theme.labelSize, color: theme.tooltipText, fontWeight: '600' } }, yAxisFormatter(hover.ty))),
                sizeField ? (react_1.default.createElement(components_1.View, { style: { flexDirection: 'row', justifyContent: 'space-between' } },
                    react_1.default.createElement(components_1.Text, { style: { fontSize: theme.labelSize, color: theme.tooltipText, opacity: 0.7 } }, sizeField),
                    react_1.default.createElement(components_1.Text, { style: { fontSize: theme.labelSize, color: theme.tooltipText, fontWeight: '600' } }, yAxisFormatter(hover.ts)))) : null)) : null),
        legend && order.length > 1 ? react_1.default.createElement(common_1.ChartLegend, { items: legendItems, active: active, onToggleIndex: toggle }) : null));
}
exports.default = ScatterChart;
