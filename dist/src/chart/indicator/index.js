"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.IndicatorChart = IndicatorChart;
// Indicator：技术指标副图（金融专属）。与 CandlestickChart 共用左右留白(PAD_L/PAD_R)与 band 定位参数，
// 故同宽 + 同数据长度时，x 逐根蜡烛像素对齐 —— 把 K 线主图与若干副图纵向堆叠即成「多面板行情」。
// 支持 VOL（量柱）/ MACD（红绿柱 + DIF/DEA 双线 + 零轴）/ RSI（单线 + 30·70 参考带）/ KDJ（K/D/J 三线）。
// 全为轴对齐矩形 + 竖/横线 + 旋转细条折线，无斜边 → View 拼装天然无锯齿。入场沿 x 逐根揭示（与主图同向）。
const react_1 = __importDefault(require("react"));
const components_1 = require("../../components");
const theme_1 = require("../../theme");
const common_1 = require("../core/common");
const scale_1 = require("../core/scale");
const grid_1 = require("../core/grid");
const mark_1 = require("../core/mark");
const theme_2 = require("../core/theme");
const indicators_1 = require("../core/indicators");
const PAD_L = 54;
const PAD_R = 14;
const PAD_T = 10;
const PAD_B = 22;
function IndicatorChart(props) {
    const theme = (0, common_1.useChartTheme)();
    const { token } = (0, theme_1.useToken)();
    const { data, xField = 'date', openField = 'open', highField = 'high', lowField = 'low', closeField = 'close', volumeField = 'volume', type, params, label, height = 120, width, upColor, downColor, showXAxis = true, grid, yFormatter, legend = true, animation = true, animateDuration = 1000, tooltip = true, style, } = props;
    const [measured, onLayout] = (0, common_1.useMeasuredWidth)(width ?? 560);
    const w = width ?? measured;
    const p = (0, common_1.useEnter)(animation, animateDuration);
    const up = upColor ?? token.colorError;
    const down = downColor ?? token.colorSuccess;
    const rows = data
        .map((r) => ({
        label: String(r[xField]),
        o: Number(r[openField]),
        h: Number(r[highField]),
        l: Number(r[lowField]),
        c: Number(r[closeField]),
        v: Number(r[volumeField]) || 0,
    }))
        .filter((r) => Number.isFinite(r.c));
    const n = rows.length;
    const closes = rows.map((r) => r.c);
    const plotW = Math.max(0, w - PAD_L - PAD_R);
    const bottomPad = showXAxis ? PAD_B : 0;
    const plotH = Math.max(0, height - PAD_T - bottomPad);
    const top = PAD_T;
    const bot = PAD_T + plotH;
    const band = (0, scale_1.bandScale)(n, [PAD_L, PAD_L + plotW], { paddingInner: 0.62, paddingOuter: 0.24 });
    const bw = Math.max(2, Math.min(band.bandwidth, 9));
    const cx = (i) => band.scale(i) + band.bandwidth / 2;
    // ---- 按类型装配：值域 / 刻度 / 柱 / 折线原始序列 / 参考线 ----
    let d0 = 0;
    let d1 = 1;
    let ticks = [0, 1];
    let bars = [];
    let rawLines = [];
    let refs = [];
    let legendItems = [];
    let barName = '';
    let lineNames = [];
    const fmt = yFormatter ?? (type === 'VOL' ? scale_1.compactNumber : (v) => v.toFixed(1));
    if (type === 'VOL') {
        const maxV = Math.max(1, ...rows.map((r) => r.v));
        d0 = 0;
        d1 = maxV * 1.05;
        ticks = [0, maxV / 2, maxV];
        bars = rows.map((r, i) => ({ i, value: r.v, color: r.c >= r.o ? up : down }));
        barName = '成交量';
        legendItems = [{ name: '成交量', color: up }];
    }
    else if (type === 'MACD') {
        const [fast = 12, slow = 26, signal = 9] = params ?? [];
        const m = (0, indicators_1.macd)(closes, fast, slow, signal);
        const all = [...m.dif, ...m.dea, ...m.hist].filter((v) => v != null);
        const mAbs = Math.max(0.0001, ...all.map((v) => Math.abs(v)));
        d0 = -mAbs * 1.1;
        d1 = mAbs * 1.1;
        ticks = (0, scale_1.linearTicks)(d0, d1, 2);
        bars = m.hist.map((v, i) => ({ i, value: v ?? 0, color: (v ?? 0) >= 0 ? up : down }));
        const difCol = theme.palette[0];
        const deaCol = theme.palette[2];
        rawLines = [
            { series: m.dif, color: difCol, width: 1.5 },
            { series: m.dea, color: deaCol, width: 1.5 },
        ];
        refs = [{ value: 0, color: theme.axisLine }];
        barName = 'HIST';
        lineNames = ['DIF', 'DEA'];
        legendItems = [
            { name: `DIF(${fast},${slow},${signal})`, color: difCol },
            { name: 'DEA', color: deaCol },
        ];
    }
    else if (type === 'RSI') {
        const [period = 14] = params ?? [];
        const r = (0, indicators_1.rsi)(closes, period);
        d0 = 0;
        d1 = 100;
        ticks = [0, 50, 100];
        refs = [
            { value: 70, color: token.colorError, label: '70' },
            { value: 30, color: token.colorSuccess, label: '30' },
        ];
        rawLines = [{ series: r, color: theme.palette[0], width: 1.8 }];
        lineNames = [`RSI(${period})`];
        legendItems = [{ name: `RSI(${period})`, color: theme.palette[0] }];
    }
    else {
        const [nn = 9, m1 = 3, m2 = 3] = params ?? [];
        const kk = (0, indicators_1.kdj)(rows.map((r) => ({ high: r.h, low: r.l, close: r.c })), nn, m1, m2);
        const all = [...kk.k, ...kk.d, ...kk.j].filter((v) => v != null);
        d0 = all.length ? Math.min(...all) : 0;
        d1 = all.length ? Math.max(...all) : 100;
        if (d0 === d1) {
            d0 -= 1;
            d1 += 1;
        }
        ticks = (0, scale_1.linearTicks)(d0, d1, 2);
        refs = [
            { value: 20, color: theme.gridLine },
            { value: 80, color: theme.gridLine },
        ];
        rawLines = [
            { series: kk.k, color: theme.palette[0], width: 1.5 },
            { series: kk.d, color: theme.palette[7], width: 1.5 },
            { series: kk.j, color: theme.palette[5], width: 1.5 },
        ];
        lineNames = ['K', 'D', 'J'];
        legendItems = [
            { name: 'K', color: theme.palette[0] },
            { name: 'D', color: theme.palette[7] },
            { name: 'J', color: theme.palette[5] },
        ];
    }
    const sy = (0, scale_1.linearScale)([d0, d1], [bot, top]);
    const reveal = Math.ceil(n * p);
    const buildPts = (series) => {
        const out = [];
        for (let i = 0; i < series.length && i < reveal; i++) {
            const v = series[i];
            if (v == null || !Number.isFinite(v))
                continue;
            out.push([cx(i), sy(v)]);
        }
        return out;
    };
    const lines = rawLines.map((ln) => ({ pts: buildPts(ln.series), color: ln.color, width: ln.width }));
    const nodes = [];
    // 网格（横 / 可选纵）+ y 刻度
    nodes.push(react_1.default.createElement(grid_1.GridLines, { key: "grid", area: { left: PAD_L, top, width: plotW, height: plotH }, horizontal: ticks.map((t) => sy(t)), vertical: grid?.vertical ? rows.map((_, i) => cx(i)) : [], config: grid, fallbackColor: theme.gridLine }));
    ticks.forEach((t, i) => {
        nodes.push(react_1.default.createElement(components_1.Text, { key: `yl${i}`, style: { position: 'absolute', right: w - PAD_L + 8, top: sy(t) - theme.labelSize, width: PAD_L - 10, textAlign: 'right', fontSize: theme.labelSize, color: theme.label } }, fmt(t)));
    });
    // 参考线（虚线）
    refs.forEach((rf, i) => {
        const y = sy(rf.value);
        let k = 0;
        for (let x = PAD_L; x < PAD_L + plotW; x += 6) {
            nodes.push(react_1.default.createElement(components_1.View, { key: `rf${i}-${k++}`, style: { position: 'absolute', left: x, top: y, width: 3, height: 1, backgroundColor: rf.color } }));
        }
    });
    // 柱
    const zeroY = sy(0);
    bars.forEach((b) => {
        if (b.i >= reveal)
            return;
        const y = sy(b.value);
        const t = Math.min(zeroY, y);
        const h = Math.abs(zeroY - y);
        nodes.push(react_1.default.createElement(components_1.View, { key: `b${b.i}`, style: { position: 'absolute', left: cx(b.i) - bw / 2, top: t, width: bw, height: Math.max(0, h), backgroundColor: b.color } }));
    });
    // 折线
    lines.forEach((ln, i) => {
        if (ln.pts.length > 1)
            nodes.push(react_1.default.createElement(mark_1.Segments, { key: `ln${i}`, pts: ln.pts, color: ln.color, width: ln.width }));
    });
    // 时间标签
    if (showXAxis) {
        const lstep = Math.max(1, Math.ceil(n / 6));
        rows.forEach((r, i) => {
            if (i % lstep !== 0 && i !== n - 1)
                return;
            nodes.push(react_1.default.createElement(components_1.Text, { key: `xl${i}`, numberOfLines: 1, style: { position: 'absolute', left: cx(i) - plotW / 12, top: bot + 6, width: plotW / 6, textAlign: 'center', fontSize: theme.labelSize, color: theme.label } }, r.label));
        });
    }
    // 面板标题
    if (label) {
        nodes.push(react_1.default.createElement(components_1.Text, { key: "lbl", style: { position: 'absolute', left: PAD_L + 4, top: top - 2, fontSize: theme.labelSize, color: theme.label } }, label));
    }
    // 逐根悬浮：与主图同向的竖直准星 + 时刻/指标数值气泡（抓帧可由 FLUX_CHART_HOVER 预设）
    const [hover, setHover] = react_1.default.useState(() => {
        const env = typeof process !== 'undefined' ? process.env.FLUX_CHART_HOVER : undefined;
        const k = env != null ? Number(env) : NaN;
        return Number.isInteger(k) && k >= 0 && k < n ? k : null;
    });
    const TIP_W = 120;
    const hi = hover != null && hover < n ? hover : null;
    const tipRows = (() => {
        if (hi == null)
            return [];
        const out = [];
        const bar = bars.find((b) => b.i === hi);
        if (bar && barName)
            out.push({ name: barName, value: bar.value, color: bar.color });
        rawLines.forEach((ln, k) => {
            const v = ln.series[hi];
            if (v != null && Number.isFinite(v))
                out.push({ name: lineNames[k] ?? `L${k}`, value: v, color: ln.color });
        });
        return out;
    })();
    const hx = hi != null ? cx(hi) : 0;
    const tipLeft = hi != null ? (hx + 10 + TIP_W > w ? Math.max(4, hx - 10 - TIP_W) : hx + 10) : 0;
    return (react_1.default.createElement(components_1.View, { style: [{ gap: theme.labelSize }, style], onLayout: onLayout },
        react_1.default.createElement(components_1.View, { style: { width: w, height, position: 'relative' } },
            nodes,
            tooltip && n > 0
                ? rows.map((_, i) => (react_1.default.createElement(components_1.Pressable, { key: `ib${i}`, onMouseEnter: () => setHover(i), onMouseLeave: () => setHover((cur) => (cur === i ? null : cur)), style: { position: 'absolute', left: Math.max(PAD_L, cx(i) - band.step / 2), top, width: Math.max(1, band.step), height: plotH } })))
                : null,
            hi != null ? (react_1.default.createElement(react_1.default.Fragment, null,
                react_1.default.createElement(components_1.View, { style: { position: 'absolute', left: hx, top, width: 1, height: plotH, backgroundColor: (0, theme_2.withAlpha)(theme.tooltipText, '55') } }),
                react_1.default.createElement(components_1.View, { style: { position: 'absolute', left: tipLeft, top: top + 2, width: TIP_W, backgroundColor: theme.tooltipBg, borderRadius: 6, padding: 8, gap: 4 } },
                    react_1.default.createElement(components_1.Text, { numberOfLines: 1, style: { fontSize: theme.labelSize, color: theme.tooltipText, fontWeight: '600' } }, rows[hi].label),
                    tipRows.map((r, k) => (react_1.default.createElement(components_1.View, { key: `tr${k}`, style: { flexDirection: 'row', justifyContent: 'space-between' } },
                        react_1.default.createElement(components_1.Text, { style: { fontSize: theme.labelSize, color: theme.tooltipText, opacity: 0.7 } }, r.name),
                        react_1.default.createElement(components_1.Text, { style: { fontSize: theme.labelSize, color: r.color, fontWeight: '600' } }, fmt(r.value)))))))) : null),
        legend && legendItems.length > 1 ? react_1.default.createElement(common_1.ChartLegend, { items: legendItems, shape: "line" }) : null));
}
exports.default = IndicatorChart;
