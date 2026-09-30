"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DepthChart = DepthChart;
// Depth：订单簿深度图（金融专属）。x=价格、y=累计挂单量；买盘(bid)在左、卖盘(ask)在右，两侧阶梯在中价(mid)处达峰。
// 阶梯 = 水平段 + 竖直段，全轴对齐 → View 矩形拼装天然无锯齿（无需 path）。入场按 p 从基线生长高度。
// cumulative=true 画累计深度（默认，山形）；false 画每档挂单量的梳状深度。
const react_1 = __importDefault(require("react"));
const components_1 = require("../../components");
const theme_1 = require("../../theme");
const common_1 = require("../core/common");
const scale_1 = require("../core/scale");
const grid_1 = require("../core/grid");
const theme_2 = require("../core/theme");
const PAD_L = 54;
const PAD_R = 14;
const PAD_T = 12;
const PAD_B = 22;
function DepthChart(props) {
    const theme = (0, common_1.useChartTheme)();
    const { token } = (0, theme_1.useToken)();
    const { bids, asks, cumulative = true, bidColor, askColor, height = 260, width, grid, priceFormatter = (v) => v.toFixed(2), sizeFormatter = scale_1.compactNumber, animation = true, animateDuration = 1000, tooltip = true, style, } = props;
    const [measured, onLayout] = (0, common_1.useMeasuredWidth)(width ?? 560);
    const w = width ?? measured;
    const p = (0, common_1.useEnter)(animation, animateDuration);
    const bidCol = bidColor ?? token.colorSuccess;
    const askCol = askColor ?? token.colorError;
    const plotW = Math.max(0, w - PAD_L - PAD_R);
    const plotH = Math.max(0, height - PAD_T - PAD_B);
    const top = PAD_T;
    const bot = PAD_T + plotH;
    const bidAsc = bids.filter((d) => Number.isFinite(d.price) && Number.isFinite(d.size)).slice().sort((a, b) => a.price - b.price);
    const askAsc = asks.filter((d) => Number.isFinite(d.price) && Number.isFinite(d.size)).slice().sort((a, b) => a.price - b.price);
    // 累计序列：bid 前缀和（价升→量增，达峰于 mid）；ask 后缀和（价升→量减，mid 处最大）
    const cumOf = (arr, prefix) => {
        const out = new Array(arr.length).fill(0);
        if (prefix) {
            let s = 0;
            for (let i = 0; i < arr.length; i++) {
                s += arr[i].size;
                out[i] = s;
            }
        }
        else {
            let s = 0;
            for (let i = arr.length - 1; i >= 0; i--) {
                s += arr[i].size;
                out[i] = s;
            }
        }
        return out;
    };
    const bidY = cumulative ? cumOf(bidAsc, true) : bidAsc.map((d) => d.size);
    const askY = cumulative ? cumOf(askAsc, false) : askAsc.map((d) => d.size);
    const allPrices = [...bidAsc.map((d) => d.price), ...askAsc.map((d) => d.price)];
    const minP = allPrices.length ? Math.min(...allPrices) : 0;
    const maxP = allPrices.length ? Math.max(...allPrices) : 1;
    const maxCum = Math.max(1, ...bidY, ...askY);
    const mid = bidAsc.length && askAsc.length ? (bidAsc[bidAsc.length - 1].price + askAsc[0].price) / 2 : (minP + maxP) / 2;
    const sx = (0, scale_1.linearScale)([minP, maxP === minP ? minP + 1 : maxP], [PAD_L, PAD_L + plotW]);
    const sy = (0, scale_1.linearScale)([0, maxCum * 1.05], [bot, top]);
    const pticks = (0, scale_1.linearTicks)(minP, maxP, 4);
    const nodes = [];
    // 网格 + y（挂单量）刻度
    const yticks = [0, maxCum / 2, maxCum];
    nodes.push(react_1.default.createElement(grid_1.GridLines, { key: "grid", area: { left: PAD_L, top, width: plotW, height: plotH }, horizontal: yticks.map((t) => sy(t)), config: grid, fallbackColor: theme.gridLine }));
    yticks.forEach((t, i) => {
        nodes.push(react_1.default.createElement(components_1.Text, { key: `yl${i}`, style: { position: 'absolute', right: w - PAD_L + 8, top: sy(t) - theme.labelSize, width: PAD_L - 10, textAlign: 'right', fontSize: theme.labelSize, color: theme.label } }, sizeFormatter(t)));
    });
    // 价格刻度（底部）
    pticks.forEach((t, i) => {
        nodes.push(react_1.default.createElement(components_1.Text, { key: `xl${i}`, numberOfLines: 1, style: { position: 'absolute', left: sx(t) - 28, top: bot + 6, width: 56, textAlign: 'center', fontSize: theme.labelSize, color: theme.label } }, priceFormatter(t)));
    });
    // 阶梯填充：逐段矩形（左沿到下一档 x，高度=本档累计），乘 p 生长
    const drawStep = (arr, ys, color, keyp) => {
        for (let i = 0; i < arr.length; i++) {
            const x0 = sx(arr[i].price);
            const x1 = i + 1 < arr.length ? sx(arr[i + 1].price) : x0 + plotW / Math.max(arr.length, 1) / 2;
            const h = (bot - sy(ys[i])) * p;
            nodes.push(react_1.default.createElement(components_1.View, { key: `${keyp}${i}`, style: { position: 'absolute', left: Math.min(x0, x1), top: bot - h, width: Math.max(0.6, Math.abs(x1 - x0)), height: Math.max(0, h), backgroundColor: (0, theme_2.withAlpha)(color, '55') } }));
            // 阶梯顶边 + 竖直段（实线轮廓）
            nodes.push(react_1.default.createElement(components_1.View, { key: `${keyp}t${i}`, style: { position: 'absolute', left: Math.min(x0, x1), top: bot - h, width: Math.max(0.6, Math.abs(x1 - x0)), height: 1.5, backgroundColor: color } }));
        }
    };
    drawStep(bidAsc, bidY, bidCol, 'bid');
    drawStep(askAsc, askY, askCol, 'ask');
    // 中价虚线
    const mx = sx(mid);
    for (let y = top; y < bot; y += 6) {
        nodes.push(react_1.default.createElement(components_1.View, { key: `mid${y}`, style: { position: 'absolute', left: mx, top: y, width: 1, height: 3, backgroundColor: theme.axisLine } }));
    }
    const legendItems = [
        { name: '买盘 (Bid)', color: bidCol },
        { name: '卖盘 (Ask)', color: askCol },
    ];
    const levels = [
        ...bidAsc.map((d, i) => ({ price: d.price, size: d.size, cum: bidY[i], side: 'bid' })),
        ...askAsc.map((d, i) => ({ price: d.price, size: d.size, cum: askY[i], side: 'ask' })),
    ].sort((a, b) => a.price - b.price);
    const [hover, setHover] = react_1.default.useState(() => {
        const env = typeof process !== 'undefined' ? process.env.FLUX_CHART_HOVER : undefined;
        const k = env != null ? Number(env) : NaN;
        return Number.isInteger(k) && k >= 0 && k < levels.length ? k : null;
    });
    const TIP_W = 132;
    const bandOf = (i) => {
        const c = sx(levels[i].price);
        const prevC = i > 0 ? sx(levels[i - 1].price) : PAD_L;
        const nextC = i < levels.length - 1 ? sx(levels[i + 1].price) : PAD_L + plotW;
        const left = Math.max(PAD_L, (prevC + c) / 2);
        const right = Math.min(PAD_L + plotW, (c + nextC) / 2);
        return { left, width: Math.max(1, right - left) };
    };
    const hl = hover != null && hover < levels.length ? levels[hover] : null;
    const hCol = hl ? (hl.side === 'bid' ? bidCol : askCol) : theme.label;
    const hx = hl ? sx(hl.price) : 0;
    const hy = hl ? sy(hl.cum) : 0;
    const tipLeft = hl ? (hx + 12 + TIP_W > w ? Math.max(4, hx - 12 - TIP_W) : hx + 12) : 0;
    return (react_1.default.createElement(components_1.View, { style: [{ gap: theme.labelSize }, style], onLayout: onLayout },
        react_1.default.createElement(components_1.View, { style: { width: w, height, position: 'relative' } },
            nodes,
            tooltip && levels.length > 0
                ? levels.map((_, i) => {
                    const b = bandOf(i);
                    return (react_1.default.createElement(components_1.Pressable, { key: `db${i}`, onMouseEnter: () => setHover(i), onMouseLeave: () => setHover((cur) => (cur === i ? null : cur)), style: { position: 'absolute', left: b.left, top, width: b.width, height: plotH } }));
                })
                : null,
            hl ? (react_1.default.createElement(react_1.default.Fragment, null,
                react_1.default.createElement(components_1.View, { style: { position: 'absolute', left: hx, top, width: 1, height: plotH, backgroundColor: (0, theme_2.withAlpha)(theme.tooltipText, '55') } }),
                react_1.default.createElement(components_1.View, { style: { position: 'absolute', left: hx - 4, top: bot - (bot - hy) * p - 4, width: 8, height: 8, borderRadius: 4, borderWidth: 2, borderColor: hCol, backgroundColor: theme.tooltipBg } }),
                react_1.default.createElement(components_1.View, { style: { position: 'absolute', left: tipLeft, top: Math.max(4, hy - 44), width: TIP_W, backgroundColor: theme.tooltipBg, borderRadius: 6, padding: 8, gap: 4 } },
                    react_1.default.createElement(components_1.Text, { style: { fontSize: theme.labelSize, color: theme.tooltipText, fontWeight: '600' } }, `${hl.side === 'bid' ? '买盘' : '卖盘'} ${priceFormatter(hl.price)}`),
                    react_1.default.createElement(components_1.View, { style: { flexDirection: 'row', justifyContent: 'space-between' } },
                        react_1.default.createElement(components_1.Text, { style: { fontSize: theme.labelSize, color: theme.tooltipText, opacity: 0.7 } }, "\u6302\u5355\u91CF"),
                        react_1.default.createElement(components_1.Text, { style: { fontSize: theme.labelSize, color: hCol, fontWeight: '600' } }, sizeFormatter(hl.size))),
                    cumulative ? (react_1.default.createElement(components_1.View, { style: { flexDirection: 'row', justifyContent: 'space-between' } },
                        react_1.default.createElement(components_1.Text, { style: { fontSize: theme.labelSize, color: theme.tooltipText, opacity: 0.7 } }, "\u7D2F\u8BA1\u91CF"),
                        react_1.default.createElement(components_1.Text, { style: { fontSize: theme.labelSize, color: theme.tooltipText, fontWeight: '600' } }, sizeFormatter(hl.cum)))) : null))) : null),
        react_1.default.createElement(common_1.ChartLegend, { items: legendItems })));
}
exports.default = DepthChart;
