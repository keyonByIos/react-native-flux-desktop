"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AreaChart = AreaChart;
// Area：面积图。复用 Plot；每序列在折线下方铺「竖向薄片」填充（本管线非方形画布不能整片 path 填充）。
// 入场：沿 x 方向推进 revealMaxX，薄片与折线同步左→右生长；stack 时逐序列堆叠基线。
const react_1 = __importDefault(require("react"));
const components_1 = require("../../components");
const common_1 = require("../core/common");
const data_1 = require("../core/data");
const scale_1 = require("../core/scale");
const geometry_1 = require("../core/geometry");
const mark_1 = require("../core/mark");
const theme_1 = require("../core/theme");
function truncateToX(pts, x) {
    if (pts.length === 0)
        return [];
    const out = [];
    for (let i = 0; i < pts.length; i++) {
        if (pts[i][0] <= x)
            out.push(pts[i]);
        else {
            if (i > 0) {
                const a = pts[i - 1];
                const b = pts[i];
                const r = b[0] - a[0] ? (x - a[0]) / (b[0] - a[0]) : 0;
                out.push([x, a[1] + (b[1] - a[1]) * r]);
            }
            break;
        }
    }
    return out;
}
/** 缩放 2 位十六进制 alpha（16 进制串 → 0..255 乘系数回串），渐变分段用 */
function scaleAlpha(aa, f) {
    const v = Math.max(0, Math.min(255, Math.round(parseInt(aa, 16) * f)));
    return v.toString(16).padStart(2, '0');
}
function AreaChart(props) {
    const theme = (0, common_1.useChartTheme)();
    const { data, xField, yField, seriesField, color, height = 260, width, stack = false, fillOpacity = '55', gradient = false, smooth = false, point = false, label = false, legend = true, tooltip = true, animation = true, animateDuration = 1000, yAxisFormatter = scale_1.compactNumber, xAxisFormatter, grid, referenceLine, style, } = props;
    const [measured, onLayout] = (0, common_1.useMeasuredWidth)(width ?? 520);
    const w = width ?? measured;
    const p = (0, common_1.useEnter)(animation, animateDuration);
    const prep = (0, data_1.prepare)(data, xField, yField, seriesField);
    const { isHidden, toggle, active } = (0, common_1.useLegendToggle)(prep.series.length);
    const n = prep.categories.length;
    // 堆叠：仅累加「可见序列」（隐藏序列不参与堆叠与 yMax）
    const lower = [];
    const upper = [];
    let acc = new Array(n).fill(0);
    prep.series.forEach((s, si) => {
        if (isHidden(si)) {
            lower.push([]);
            upper.push([]);
            return;
        }
        const lo = [];
        const up = [];
        s.points.forEach((v, i) => {
            const val = v ?? 0;
            lo.push(stack ? acc[i] : 0);
            up.push(stack ? acc[i] + val : val);
            if (stack)
                acc[i] += val;
        });
        lower.push(lo);
        upper.push(up);
    });
    const visSeries = [];
    prep.series.forEach((s, si) => {
        if (!isHidden(si))
            visSeries.push({ s, si });
    });
    const allVals = stack ? prep.categories.map((_, i) => acc[i]) : visSeries.flatMap(({ s }) => s.points.map((v) => v ?? 0));
    const { niceMax, ticks } = (0, scale_1.niceTicks)(Math.max(...allVals, (referenceLine ?? []).reduce((m, r) => Math.max(m, r.value), 0), 1));
    const legendItems = prep.series.map((s, i) => ({ name: s.name, color: (0, theme_1.seriesColor)(i, color, theme) }));
    return (react_1.default.createElement(components_1.View, { style: [{ gap: theme.labelSize }, style], onLayout: onLayout },
        react_1.default.createElement(common_1.Plot, { width: w, height: height, categories: prep.categories, yTicks: ticks, yMax: niceMax, yFormatter: yAxisFormatter, xFormatter: xAxisFormatter, grid: grid, interactive: tooltip, tooltipFor: (i) => ({ title: prep.categories[i], rows: visSeries.map(({ s, si }) => ({ name: s.name, color: (0, theme_1.seriesColor)(si, color, theme), value: s.points[i] == null ? '—' : yAxisFormatter(s.points[i]) })) }) }, (ctx) => {
            const revealX = ctx.padL + ctx.plotW * p;
            const marks = [];
            prep.series.forEach((_s, si) => {
                if (isHidden(si))
                    return;
                const col = (0, theme_1.seriesColor)(si, color, theme);
                const topPts = upper[si].map((v, i) => [ctx.xAt(i), ctx.yAt(v)]);
                const botPts = lower[si].map((v, i) => [ctx.xAt(i), ctx.yAt(v)]);
                // 平滑：先把上/下边界稠密成过点曲线，再按揭示前沿截断→薄片自然跟曲线走
                const shownTop = truncateToX(smooth ? (0, geometry_1.catmullRom)(topPts) : topPts, revealX);
                const shownBot = truncateToX(smooth ? (0, geometry_1.catmullRom)(botPts) : botPts, revealX);
                if (shownTop.length >= 2) {
                    const strips = [];
                    const x0 = shownTop[0][0];
                    const x1 = shownTop[shownTop.length - 1][0];
                    for (let x = x0; x <= x1; x += 3) {
                        const yt = (0, geometry_1.sampleYAtX)(shownTop, x);
                        const yb = (0, geometry_1.sampleYAtX)(shownBot, x);
                        if (yt == null || yb == null)
                            continue;
                        if (gradient) {
                            // 每片纵向拆 3 段，alpha 自顶向底 1 / 0.5 / 0.16 衰减；+0.6 重叠消除接缝发丝线
                            const top = Math.min(yt, yb);
                            const hSeg = Math.abs(yb - yt) / 3;
                            const fades = [1, 0.5, 0.16];
                            for (let k = 0; k < 3; k++) {
                                strips.push(react_1.default.createElement(components_1.View, { key: `${Math.round(x)}-${k}`, style: { position: 'absolute', left: x, top: top + hSeg * k, width: 3.6, height: hSeg + 0.6, backgroundColor: (0, theme_1.withAlpha)(col, scaleAlpha(fillOpacity, fades[k])) } }));
                            }
                        }
                        else {
                            strips.push(react_1.default.createElement(components_1.View, { key: Math.round(x), style: { position: 'absolute', left: x, top: Math.min(yt, yb), width: 3.6, height: Math.abs(yb - yt), backgroundColor: (0, theme_1.withAlpha)(col, fillOpacity) } }));
                        }
                    }
                    marks.push(react_1.default.createElement(components_1.View, { key: `ar${si}` }, strips));
                    marks.push(react_1.default.createElement(mark_1.Segments, { key: `al${si}`, pts: shownTop, color: col, width: 2 }));
                }
                // 数据点标记：仅画已揭示（x ≤ 前沿）的上边界点
                if (point) {
                    const visPts = topPts.filter((pt) => pt[0] <= revealX + 0.5);
                    if (visPts.length)
                        marks.push(react_1.default.createElement(mark_1.Dots, { key: `ap${si}`, pts: visPts, color: col, r: 3, opacity: p }));
                }
                // 数据标签：同揭示节奏，在上边界点上方显原值（堆叠时不显累加值）
                if (label) {
                    prep.series[si].points.forEach((v, i) => {
                        if (v == null)
                            return;
                        const px = ctx.xAt(i);
                        if (px > revealX + 0.5)
                            return;
                        marks.push(react_1.default.createElement(components_1.Text, { key: `al${si}-${i}`, numberOfLines: 1, style: { position: 'absolute', left: px - 40, top: ctx.yAt(upper[si][i]) - theme.labelSize - 7, width: 80, textAlign: 'center', fontSize: theme.labelSize, color: col, fontWeight: '600', opacity: p } }, yAxisFormatter(v)));
                    });
                }
                // 悬浮高亮：当前类目上边界点画强调环
                if (ctx.activeIndex != null) {
                    const ai = ctx.activeIndex;
                    marks.push(react_1.default.createElement(components_1.View, { key: `hl${si}`, style: { position: 'absolute', left: ctx.xAt(ai) - 5, top: ctx.yAt(upper[si][ai]) - 5, width: 10, height: 10, borderRadius: 5, backgroundColor: '#ffffff', borderWidth: 2, borderColor: col } }));
                }
            });
            if (referenceLine && referenceLine.length) {
                marks.push(react_1.default.createElement(common_1.ReferenceLines, { key: "ref", lines: referenceLine, ctx: ctx, theme: theme, formatter: yAxisFormatter }));
            }
            return react_1.default.createElement(react_1.default.Fragment, null, marks);
        }),
        legend && prep.series.length > 1 ? react_1.default.createElement(common_1.ChartLegend, { items: legendItems, active: active, onToggleIndex: toggle }) : null));
}
exports.default = AreaChart;
