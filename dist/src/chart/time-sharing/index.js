"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TimeSharingChart = TimeSharingChart;
// TimeSharing：分时图（金融专属）。盘中现价折线 + 均价线 + 现价下方面积，昨收价虚线基准。
// y 轴以昨收为中心对称定标（[昨收-Δ, 昨收+Δ]），左轴显价格、右轴显涨跌幅%。现价线按末点相对昨收涨跌着色。
// 折线/面积用 View 拼装（Segments 旋转细条 + 竖向薄片），入场沿弧长自左向右描出（truncatePolyline）。
const react_1 = __importDefault(require("react"));
const components_1 = require("../../components");
const theme_1 = require("../../theme");
const common_1 = require("../core/common");
const scale_1 = require("../core/scale");
const geometry_1 = require("../core/geometry");
const mark_1 = require("../core/mark");
const theme_2 = require("../core/theme");
const grid_1 = require("../core/grid");
const PAD_L = 54;
const PAD_R = 54;
const PAD_T = 12;
const PAD_B = 22;
function TimeSharingChart(props) {
    const theme = (0, common_1.useChartTheme)();
    const { token } = (0, theme_1.useToken)();
    const { data, xField = 'time', priceField = 'price', avgField = 'avg', prevClose, showAvg = true, showArea = true, upColor, downColor, avgColor, height = 280, width, animation = true, animateDuration = 1100, yFormatter = (v) => v.toFixed(2), grid, tooltip = true, style, } = props;
    const [measured, onLayout] = (0, common_1.useMeasuredWidth)(width ?? 560);
    const w = width ?? measured;
    const p = (0, common_1.useEnter)(animation, animateDuration);
    const up = upColor ?? token.colorError;
    const down = downColor ?? token.colorSuccess;
    const avgCol = avgColor ?? '#F6BD16';
    const prices = data.map((r) => Number(r[priceField])).filter((v) => Number.isFinite(v));
    const n = prices.length;
    const base = Number.isFinite(prevClose) ? prevClose : n ? prices[0] : 1;
    const avgs = data.map((r) => (avgField in r ? Number(r[avgField]) : null));
    const plotW = Math.max(0, w - PAD_L - PAD_R);
    const plotH = Math.max(0, height - PAD_T - PAD_B);
    const baseline = PAD_T + plotH;
    let maxAbs = 0;
    for (let i = 0; i < n; i++) {
        maxAbs = Math.max(maxAbs, Math.abs(prices[i] - base));
        const a = avgs[i];
        if (a != null && Number.isFinite(a))
            maxAbs = Math.max(maxAbs, Math.abs(a - base));
    }
    const delta = maxAbs * 1.15 || base * 0.02 || 1;
    const sy = (0, scale_1.linearScale)([base - delta, base + delta], [baseline, PAD_T]);
    const xAt = (i) => PAD_L + (n <= 1 ? plotW / 2 : (i / (n - 1)) * plotW);
    const pts = prices.map((v, i) => [xAt(i), sy(v)]);
    const avgPts = showAvg ? prices.map((_, i) => [xAt(i), sy((avgs[i] != null && Number.isFinite(avgs[i])) ? avgs[i] : prices[i])]) : [];
    const last = n ? prices[n - 1] : base;
    const lineCol = last >= base ? up : down;
    const nodes = [];
    // 横向网格（4 分位）——统一交给共享 GridLines
    nodes.push(react_1.default.createElement(grid_1.GridLines, { key: "grid", area: { left: PAD_L, top: PAD_T, width: plotW, height: plotH }, horizontal: [0, 0.25, 0.5, 0.75, 1].map((f) => PAD_T + f * plotH), config: grid, fallbackColor: theme.gridLine }));
    // 左价格 / 右涨跌幅标签
    const fr = [0, 0.25, 0.5, 0.75, 1];
    fr.forEach((f, i) => {
        const y = PAD_T + f * plotH;
        const price = base + delta - f * 2 * delta;
        const pct = ((price - base) / base) * 100;
        const isBase = i === 2;
        nodes.push(react_1.default.createElement(components_1.Text, { key: `pl${i}`, style: { position: 'absolute', right: w - PAD_L + 8, top: y - theme.labelSize, width: PAD_L - 10, textAlign: 'right', fontSize: theme.labelSize, color: theme.label } }, yFormatter(price)));
        nodes.push(react_1.default.createElement(components_1.Text, { key: `pc${i}`, style: { position: 'absolute', left: PAD_L + plotW + 8, top: y - theme.labelSize, width: PAD_R - 10, textAlign: 'left', fontSize: theme.labelSize, color: isBase ? theme.label : pct >= 0 ? up : down } }, `${pct >= 0 ? '+' : ''}${pct.toFixed(2)}%`));
    });
    // 昨收虚线基准
    const baseY = sy(base);
    for (let x = PAD_L; x < PAD_L + plotW; x += 6) {
        nodes.push(react_1.default.createElement(components_1.View, { key: `dash${x}`, style: { position: 'absolute', left: x, top: baseY, width: 3, height: 1, backgroundColor: theme.axisLine } }));
    }
    // 面积（现价下方竖向薄片，随揭示 x 增长）
    if (showArea && n > 1) {
        const revealX = PAD_L + plotW * p;
        const step = 3;
        for (let x = PAD_L; x <= Math.min(revealX, xAt(n - 1)); x += step) {
            const ty = (0, geometry_1.sampleYAtX)(pts, x);
            if (ty == null)
                continue;
            nodes.push(react_1.default.createElement(components_1.View, { key: `ar${x}`, style: { position: 'absolute', left: x, top: ty, width: step + 0.6, height: Math.max(0, baseline - ty), backgroundColor: (0, theme_2.withAlpha)(lineCol, '2E') } }));
        }
    }
    // 均价线 + 现价线
    if (avgPts.length > 1)
        nodes.push(react_1.default.createElement(mark_1.Segments, { key: "avg", pts: (0, geometry_1.truncatePolyline)(avgPts, p), color: avgCol, width: 1.5 }));
    if (pts.length > 1)
        nodes.push(react_1.default.createElement(mark_1.Segments, { key: "price", pts: (0, geometry_1.truncatePolyline)(pts, p), color: lineCol, width: 1.8 }));
    // 时间标签（抽稀）
    const lstep = Math.max(1, Math.ceil(n / 4));
    for (let i = 0; i < n; i++) {
        if (i % lstep !== 0 && i !== n - 1)
            continue;
        const lbl = data[i] ? String(data[i][xField]) : '';
        nodes.push(react_1.default.createElement(components_1.Text, { key: `xt${i}`, numberOfLines: 1, style: { position: 'absolute', left: xAt(i) - plotW / 8, top: baseline + 6, width: plotW / 4, textAlign: 'center', fontSize: theme.labelSize, color: theme.label } }, lbl));
    }
    // 末点脉冲
    if (n > 0 && p > 0.98) {
        nodes.push(react_1.default.createElement(components_1.View, { key: "end", style: { position: 'absolute', left: xAt(n - 1) - 3, top: sy(last) - 3, width: 6, height: 6, borderRadius: 3, backgroundColor: lineCol } }));
    }
    // 逐点悬浮：等宽命中带铺满绘图区，十字准星落在真实数据点（抓帧可由 FLUX_CHART_HOVER 预设）
    const [hover, setHover] = react_1.default.useState(() => {
        const env = typeof process !== 'undefined' ? process.env.FLUX_CHART_HOVER : undefined;
        const k = env != null ? Number(env) : NaN;
        return Number.isInteger(k) && k >= 0 && k < n ? k : null;
    });
    const TIP_W = 150;
    const bandW = n > 0 ? plotW / n : 0;
    const hp = hover != null && hover < n ? hover : null;
    const hPrice = hp != null ? prices[hp] : 0;
    const hAvg = hp != null ? avgs[hp] : null;
    const hPct = hp != null ? ((hPrice - base) / base) * 100 : 0;
    const hUp = hp != null ? hPrice >= base : true;
    const hx = hp != null ? xAt(hp) : 0;
    const hy = hp != null ? sy(hPrice) : 0;
    const tipLeft = hp != null ? (hx + 12 + TIP_W > w ? Math.max(4, hx - 12 - TIP_W) : hx + 12) : 0;
    const tipRow = (k, v, col) => (react_1.default.createElement(components_1.View, { key: k, style: { flexDirection: 'row', justifyContent: 'space-between' } },
        react_1.default.createElement(components_1.Text, { style: { fontSize: theme.labelSize, color: theme.tooltipText, opacity: 0.7 } }, k),
        react_1.default.createElement(components_1.Text, { style: { fontSize: theme.labelSize, color: col, fontWeight: '600' } }, v)));
    return (react_1.default.createElement(components_1.View, { style: [{ width: w, height, position: 'relative' }, style], onLayout: onLayout },
        nodes,
        tooltip && n > 0
            ? prices.map((_, i) => (react_1.default.createElement(components_1.Pressable, { key: `hb${i}`, onMouseEnter: () => setHover(i), onMouseLeave: () => setHover((cur) => (cur === i ? null : cur)), style: { position: 'absolute', left: PAD_L + bandW * i, top: PAD_T, width: Math.max(1, bandW), height: plotH } })))
            : null,
        hp != null ? (react_1.default.createElement(react_1.default.Fragment, null,
            react_1.default.createElement(components_1.View, { style: { position: 'absolute', left: hx, top: PAD_T, width: 1, height: plotH, backgroundColor: (0, theme_2.withAlpha)(theme.tooltipText, '55') } }),
            react_1.default.createElement(components_1.View, { style: { position: 'absolute', left: PAD_L, top: hy, width: plotW, height: 1, backgroundColor: (0, theme_2.withAlpha)(theme.tooltipText, '55') } }),
            react_1.default.createElement(components_1.View, { style: { position: 'absolute', left: hx - 4, top: hy - 4, width: 8, height: 8, borderRadius: 4, borderWidth: 2, borderColor: lineCol, backgroundColor: theme.tooltipBg } }),
            react_1.default.createElement(components_1.View, { style: { position: 'absolute', left: tipLeft, top: Math.max(4, hy - 40), width: TIP_W, backgroundColor: theme.tooltipBg, borderRadius: 6, padding: 8, gap: 4 } },
                react_1.default.createElement(components_1.Text, { style: { fontSize: theme.labelSize, color: theme.tooltipText, fontWeight: '600' } }, data[hp] ? String(data[hp][xField]) : ''),
                tipRow('现价', yFormatter(hPrice), hUp ? up : down),
                showAvg && hAvg != null && Number.isFinite(hAvg) ? tipRow('均价', yFormatter(hAvg), avgCol) : null,
                tipRow('涨跌幅', `${hPct >= 0 ? '+' : ''}${hPct.toFixed(2)}%`, hUp ? up : down)))) : null));
}
exports.default = TimeSharingChart;
