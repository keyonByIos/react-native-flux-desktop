"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LineChart = LineChart;
// Line：多序列折线。@ant-design/charts 式 data + xField + yField(+ seriesField)。
// 入场：各序列沿弧长自左向右「描线」（truncatePolyline），顶点随到达依次浮现。
const react_1 = __importDefault(require("react"));
const components_1 = require("../../components");
const common_1 = require("../core/common");
const data_1 = require("../core/data");
const scale_1 = require("../core/scale");
const geometry_1 = require("../core/geometry");
const canvas_layer_1 = require("../core/canvas-layer");
const theme_1 = require("../core/theme");
function LineChart(props) {
    const theme = (0, common_1.useChartTheme)();
    const { data, xField, yField, seriesField, color, height = 260, width, point = true, lineWidth = 2, dash, smooth = false, step, label = false, legend = true, tooltip = true, animation = true, animateDuration = 900, yAxisFormatter = scale_1.compactNumber, xAxisFormatter, grid, referenceLine, style, } = props;
    const [measured, onLayout] = (0, common_1.useMeasuredWidth)(width ?? 520);
    const w = width ?? measured;
    const p = (0, common_1.useEnter)(animation, animateDuration);
    const prep = (0, data_1.prepare)(data, xField, yField, seriesField);
    const { isHidden, toggle, active } = (0, common_1.useLegendToggle)(prep.series.length);
    // yMax 按「可见序列」重算：隐藏某序列后坐标轴自适应剩余数据
    const visMax = react_1.default.useMemo(() => {
        let m = 0;
        prep.series.forEach((s, si) => {
            if (isHidden(si))
                return;
            s.points.forEach((v) => { if (v != null && v > m)
                m = v; });
        });
        return m || (0, data_1.maxValue)(prep);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [prep, isHidden]);
    const { niceMax, ticks } = (0, scale_1.niceTicks)(Math.max(visMax, (referenceLine ?? []).reduce((m, r) => Math.max(m, r.value), 0)));
    const legendItems = prep.series.map((s, i) => ({ name: s.name, color: (0, theme_1.seriesColor)(i, color, theme) }));
    const visRows = (i) => prep.series.map((s, si) => ({ s, si })).filter(({ si }) => !isHidden(si)).map(({ s, si }) => ({
        name: s.name,
        color: (0, theme_1.seriesColor)(si, color, theme),
        value: s.points[i] == null ? '—' : yAxisFormatter(s.points[i]),
    }));
    return (react_1.default.createElement(components_1.View, { style: [{ gap: theme.labelSize }, style], onLayout: onLayout },
        react_1.default.createElement(common_1.Plot, { width: w, height: height, categories: prep.categories, yTicks: ticks, yMax: niceMax, yFormatter: yAxisFormatter, xFormatter: xAxisFormatter, grid: grid, interactive: tooltip, tooltipFor: (i) => ({ title: prep.categories[i], rows: visRows(i) }) }, (ctx) => {
            const spec = [];
            const labelNodes = [];
            prep.series.forEach((s, si) => {
                if (isHidden(si))
                    return;
                const col = (0, theme_1.seriesColor)(si, color, theme);
                const full = [];
                s.points.forEach((v, i) => {
                    if (v == null)
                        return;
                    full.push([ctx.xAt(i), ctx.yAt(v)]);
                });
                // 阶梯：相邻点间插入转折（与 smooth 互斥，step 优先）；否则按 smooth 稠密或直折线
                let linePts = full;
                if (step && full.length > 1) {
                    linePts = [full[0]];
                    for (let i = 1; i < full.length; i++) {
                        const a = full[i - 1];
                        const b = full[i];
                        if (step === 'start')
                            linePts.push([b[0], a[1]]);
                        else if (step === 'end')
                            linePts.push([a[0], b[1]]);
                        else {
                            const mx = (a[0] + b[0]) / 2;
                            linePts.push([mx, a[1]], [mx, b[1]]);
                        }
                        linePts.push(b);
                    }
                }
                else if (smooth) {
                    linePts = (0, geometry_1.catmullRom)(full);
                }
                const total = (0, geometry_1.polylineLength)(linePts);
                const shown = (0, geometry_1.truncatePolyline)(linePts, p);
                let vis = [];
                if (point) {
                    // 揭示前沿的 x：顶点按其 x 是否已被描到而浮现（左→右，与平滑/直线无关）
                    const frontX = shown.length ? shown[shown.length - 1][0] : full.length ? full[0][0] : 0;
                    vis = full.filter((pt) => total <= 0 || pt[0] <= frontX + 0.5);
                    // 数据标签：同揭示节奏，在已浮现点上方显数值（仍用 Text 节点保字形清晰，数量受类目约束）
                    if (label) {
                        s.points.forEach((v, i) => {
                            if (v == null)
                                return;
                            const px = ctx.xAt(i);
                            if (total > 0 && px > frontX + 0.5)
                                return;
                            labelNodes.push(react_1.default.createElement(components_1.Text, { key: `lb${si}-${i}`, numberOfLines: 1, style: { position: 'absolute', left: px - 40, top: ctx.yAt(v) - theme.labelSize - 7, width: 80, textAlign: 'center', fontSize: theme.labelSize, color: col, fontWeight: '600', opacity: p } }, yAxisFormatter(v)));
                        });
                    }
                }
                // 悬浮高亮：在当前类目点位画一个带白边的强调环
                let hl = null;
                if (ctx.activeIndex != null && s.points[ctx.activeIndex] != null) {
                    const ai = ctx.activeIndex;
                    hl = [ctx.xAt(ai), ctx.yAt(s.points[ai])];
                }
                spec.push({ col, line: shown.map((pt) => [pt[0], pt[1]]), dots: vis.map((pt) => [pt[0], pt[1]]), hl });
            });
            const dashKey = dash ? dash.join(',') : '';
            return (react_1.default.createElement(react_1.default.Fragment, null,
                react_1.default.createElement(canvas_layer_1.CanvasLayer, { width: w, height: height, deps: [w, height, lineWidth, dashKey, p, JSON.stringify(spec)], draw: (c) => {
                        for (const sp of spec) {
                            if (sp.line.length > 1) {
                                c.save();
                                if (dash && dash[0] > 0)
                                    c.setLineDash([dash[0], Math.max(1, dash[1] ?? 4)]);
                                c.beginPath();
                                c.moveTo(sp.line[0][0], sp.line[0][1]);
                                for (let i = 1; i < sp.line.length; i++)
                                    c.lineTo(sp.line[i][0], sp.line[i][1]);
                                c.strokeStyle = sp.col;
                                c.lineWidth = lineWidth;
                                c.lineJoin = 'round';
                                c.lineCap = 'round';
                                c.stroke();
                                c.restore();
                            }
                            if (point && sp.dots.length) {
                                c.globalAlpha = p;
                                for (const dp of sp.dots) {
                                    c.beginPath();
                                    c.arc(dp[0], dp[1], 3, 0, Math.PI * 2);
                                    c.fillStyle = sp.col;
                                    c.fill();
                                }
                                c.globalAlpha = 1;
                            }
                            if (sp.hl) {
                                c.beginPath();
                                c.arc(sp.hl[0], sp.hl[1], 5, 0, Math.PI * 2);
                                c.fillStyle = '#ffffff';
                                c.fill();
                                c.lineWidth = 1.5;
                                c.strokeStyle = sp.col;
                                c.stroke();
                            }
                        }
                    } }),
                labelNodes,
                referenceLine && referenceLine.length ? react_1.default.createElement(common_1.ReferenceLines, { key: "ref", lines: referenceLine, ctx: ctx, theme: theme, formatter: yAxisFormatter }) : null));
        }),
        legend && prep.series.length > 1 ? react_1.default.createElement(common_1.ChartLegend, { items: legendItems, shape: "line", active: active, onToggleIndex: toggle }) : null));
}
exports.default = LineChart;
