"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.movingAverage = movingAverage;
exports.CandlestickChart = CandlestickChart;
// Candlestick：K线图 / 蜡烛图（金融专属）。每根蜡烛 = 实体（开→收）+ 上下影线（高/低）。
// 价轴为连续数值、不从 0 起（用 linearTicks 跨 [最低,最高] 定标），x 为时间类目（band 定位）。
// 全为轴对齐矩形 + 竖线，无斜边 → View 拼装即可，天然无锯齿（区别于漏斗梯形的斜边 path 方案）。
// 可选成交量副图：底部量柱，颜色随该根涨跌。入场：每根蜡烛自实体中心竖向生长、左右错峰。
const react_1 = __importDefault(require("react"));
const components_1 = require("../../components");
const theme_1 = require("../../theme");
const common_1 = require("../core/common");
const scale_1 = require("../core/scale");
const theme_2 = require("../core/theme");
const grid_1 = require("../core/grid");
const mark_1 = require("../core/mark");
const clamp01 = (v) => Math.max(0, Math.min(1, v));
/** 简单移动平均：对 close 序列取 window 均线，不足窗口的前项返回 null。 */
function movingAverage(values, window) {
    const out = [];
    let sum = 0;
    for (let i = 0; i < values.length; i++) {
        sum += values[i];
        if (i >= window)
            sum -= values[i - window];
        out.push(i >= window - 1 ? sum / window : null);
    }
    return out;
}
const PAD_L = 54;
const PAD_R = 14;
const PAD_T = 12;
const PAD_B = 22;
const VOL_H = 52;
const VOL_GAP = 10;
function CandlestickChart(props) {
    const theme = (0, common_1.useChartTheme)();
    const { token } = (0, theme_1.useToken)();
    const { data, xField = 'date', openField = 'open', highField = 'high', lowField = 'low', closeField = 'close', volumeField, upColor, downColor, hollowUp = false, showVolume, height = 320, width, animation = true, animateDuration = 1000, stagger = 0.6, yFormatter = (v) => v.toFixed(2), overlays, grid, variant = 'candle', showXAxis = true, tooltip = true, style, } = props;
    const [measured, onLayout] = (0, common_1.useMeasuredWidth)(width ?? 560);
    const w = width ?? measured;
    const p = (0, common_1.useEnter)(animation, animateDuration);
    const up = upColor ?? token.colorError;
    const down = downColor ?? token.colorSuccess;
    const showVol = (showVolume ?? !!volumeField) && !!volumeField;
    const rows = data
        .map((r) => ({
        label: String(r[xField]),
        o: Number(r[openField]),
        h: Number(r[highField]),
        l: Number(r[lowField]),
        c: Number(r[closeField]),
        v: volumeField ? Number(r[volumeField]) || 0 : 0,
    }))
        .filter((r) => Number.isFinite(r.o) && Number.isFinite(r.h) && Number.isFinite(r.l) && Number.isFinite(r.c));
    const n = rows.length;
    const plotW = Math.max(0, w - PAD_L - PAD_R);
    const bottomPad = showXAxis ? PAD_B : 0;
    const volArea = showVol ? VOL_H + VOL_GAP : 0;
    const priceH = Math.max(0, height - PAD_T - bottomPad - volArea);
    const priceTop = PAD_T;
    const priceBot = PAD_T + priceH;
    let lo = n ? Math.min(...rows.map((r) => r.l)) : 0;
    let hi = n ? Math.max(...rows.map((r) => r.h)) : 1;
    if (!Number.isFinite(lo) || !Number.isFinite(hi) || lo === hi) {
        lo = (hi || 1) - 1;
        hi = (hi || 1) + 1;
    }
    const pad = (hi - lo) * 0.06;
    const ticks = (0, scale_1.linearTicks)(lo - pad, hi + pad, 4);
    const d0 = ticks[0];
    const d1 = ticks[ticks.length - 1];
    const sy = (0, scale_1.linearScale)([d0, d1], [priceBot, priceTop]);
    const band = (0, scale_1.bandScale)(n, [PAD_L, PAD_L + plotW], { paddingInner: 0.62, paddingOuter: 0.24 });
    const bw = Math.max(2, Math.min(band.bandwidth, 9));
    const cx = (i) => band.scale(i) + band.bandwidth / 2;
    const maxV = Math.max(1, ...rows.map((r) => r.v));
    const volTop = priceBot + VOL_GAP;
    const volBot = volTop + VOL_H;
    const vy = (0, scale_1.linearScale)([0, maxV], [volBot, volTop]);
    const seg = (i) => {
        const start = n <= 1 ? 0 : (i / n) * stagger;
        return clamp01((p - start) / (1 - stagger));
    };
    const nodes = [];
    // 价格网格（横 / 可选纵）+ 价格刻度
    nodes.push(react_1.default.createElement(grid_1.GridLines, { key: "grid", area: { left: PAD_L, top: priceTop, width: plotW, height: priceH }, horizontal: ticks.map((t) => sy(t)), vertical: grid?.vertical ? rows.map((_, i) => cx(i)) : [], config: grid, fallbackColor: theme.gridLine }));
    ticks.forEach((t, i) => {
        const y = sy(t);
        nodes.push(react_1.default.createElement(components_1.Text, { key: `yl${i}`, style: { position: 'absolute', right: w - PAD_L + 8, top: y - theme.labelSize, width: PAD_L - 10, textAlign: 'right', fontSize: theme.labelSize, color: theme.label } }, yFormatter(t)));
    });
    // 蜡烛
    rows.forEach((r, i) => {
        const t = seg(i);
        if (t <= 0)
            return;
        const isUp = r.c >= r.o;
        const col = isUp ? up : down;
        const center = cx(i);
        const midY = sy((r.o + r.c) / 2);
        const grow = (y) => midY + (y - midY) * t;
        const yH = grow(sy(r.h));
        const yL = grow(sy(r.l));
        const yO = grow(sy(r.o));
        const yC = grow(sy(r.c));
        const bodyTop = Math.min(yO, yC);
        const bodyH = Math.max(1, Math.abs(yC - yO));
        if (variant === 'ohlc') {
            // 竹线：高低价竖线 + 左开盘短划 + 右收盘短划（全轴对齐，无锯齿）
            nodes.push(react_1.default.createElement(components_1.View, { key: `ol${i}`, style: { position: 'absolute', left: center - 0.75, top: yH, width: 1.5, height: Math.max(0, yL - yH), backgroundColor: col } }));
            nodes.push(react_1.default.createElement(components_1.View, { key: `oo${i}`, style: { position: 'absolute', left: center - bw / 2, top: yO - 0.75, width: bw / 2, height: 1.5, backgroundColor: col } }));
            nodes.push(react_1.default.createElement(components_1.View, { key: `oc${i}`, style: { position: 'absolute', left: center, top: yC - 0.75, width: bw / 2, height: 1.5, backgroundColor: col } }));
        }
        else {
            // 影线
            nodes.push(react_1.default.createElement(components_1.View, { key: `wk${i}`, style: { position: 'absolute', left: center - 0.75, top: yH, width: 1.5, height: Math.max(0, yL - yH), backgroundColor: col } }));
            // 实体
            const hollow = hollowUp && isUp;
            nodes.push(react_1.default.createElement(components_1.View, { key: `bd${i}`, style: {
                    position: 'absolute',
                    left: center - bw / 2,
                    top: bodyTop,
                    width: bw,
                    height: bodyH,
                    borderRadius: 0,
                    backgroundColor: hollow ? 'transparent' : col,
                    borderWidth: hollow ? 1 : 0,
                    borderColor: col,
                } }));
        }
        // 量柱
        if (showVol) {
            const vTop = volBot - (volBot - vy(r.v)) * t;
            nodes.push(react_1.default.createElement(components_1.View, { key: `vb${i}`, style: { position: 'absolute', left: center - bw / 2, top: vTop, width: bw, height: Math.max(0, volBot - vTop), backgroundColor: (0, theme_2.withAlpha)(col, 'AA') } }));
        }
    });
    // 叠加折线（均线等）：与蜡烛共享价格轴，按入场进度 p 沿 x 逐步揭示（K 线与折线重叠）
    const ovColors = (overlays ?? []).map((ov, oi) => ov.color ?? theme.palette[(oi + 2) % theme.palette.length]);
    (overlays ?? []).forEach((ov, oi) => {
        const pts = [];
        rows.forEach((_, i) => {
            const v = ov.values[i];
            if (v == null || !Number.isFinite(v))
                return;
            pts.push([cx(i), sy(v)]);
        });
        const shown = pts.slice(0, Math.max(0, Math.ceil(pts.length * p)));
        if (shown.length > 1)
            nodes.push(react_1.default.createElement(mark_1.Segments, { key: `ov${oi}`, pts: shown, color: ovColors[oi], width: ov.width ?? 1.5 }));
    });
    // 时间标签（抽稀）
    const lstep = Math.max(1, Math.ceil(n / 6));
    rows.forEach((r, i) => {
        if (!showXAxis)
            return;
        if (i % lstep !== 0 && i !== n - 1)
            return;
        nodes.push(react_1.default.createElement(components_1.Text, { key: `xl${i}`, numberOfLines: 1, style: { position: 'absolute', left: cx(i) - plotW / 12, top: (showVol ? volBot : priceBot) + 6, width: plotW / 6, textAlign: 'center', fontSize: theme.labelSize, color: theme.label } }, r.label));
    });
    if (showVol) {
        nodes.push(react_1.default.createElement(components_1.View, { key: "vbase", style: { position: 'absolute', left: PAD_L, top: volBot, width: plotW, height: 1, backgroundColor: theme.axisLine } }));
        nodes.push(react_1.default.createElement(components_1.Text, { key: "vlbl", style: { position: 'absolute', left: PAD_L + 4, top: volTop - 2, fontSize: theme.labelSize, color: theme.label } }, "\u6210\u4EA4\u91CF"));
    }
    const legendItems = [
        { name: '阳线 (涨)', color: up },
        { name: '阴线 (跌)', color: down },
    ];
    (overlays ?? []).forEach((ov, oi) => legendItems.push({ name: ov.name ?? `均线${oi + 1}`, color: ovColors[oi] }));
    // 逐根悬浮：命中带按 band 步进铺满全宽（矩形命中，与 heatmap 同法）；抓帧可由 FLUX_CHART_HOVER 预设
    const [hoverIdx, setHoverIdx] = react_1.default.useState(() => {
        const env = typeof process !== 'undefined' ? process.env.FLUX_CHART_HOVER : undefined;
        const k = env != null ? Number(env) : NaN;
        return Number.isInteger(k) && k >= 0 && k < n ? k : null;
    });
    const TIP_W = 168;
    const hr = hoverIdx != null ? rows[hoverIdx] : null;
    const hUp = hr ? hr.c >= hr.o : false;
    const hPct = hr && hr.o !== 0 ? ((hr.c - hr.o) / hr.o) * 100 : 0;
    const tipLeft = hoverIdx != null ? (cx(hoverIdx) + 14 + TIP_W > w ? Math.max(4, cx(hoverIdx) - 14 - TIP_W) : cx(hoverIdx) + 14) : 0;
    const hoverBands = tooltip && n > 0 ? rows.map((_, i) => (react_1.default.createElement(components_1.Pressable, { key: `hb${i}`, onMouseEnter: () => setHoverIdx(i), onMouseLeave: () => setHoverIdx((cur) => (cur === i ? null : cur)), style: { position: 'absolute', left: Math.max(PAD_L, cx(i) - band.step / 2), top: PAD_T, width: band.step, height: (showVol ? volBot : priceBot) - PAD_T } }))) : null;
    const tipRow = (k, v, col) => (react_1.default.createElement(components_1.View, { key: k, style: { flexDirection: 'row', justifyContent: 'space-between' } },
        react_1.default.createElement(components_1.Text, { style: { fontSize: theme.labelSize, color: theme.tooltipText, opacity: 0.7 } }, k),
        react_1.default.createElement(components_1.Text, { style: { fontSize: theme.labelSize, color: col, fontWeight: '600' } }, v)));
    return (react_1.default.createElement(components_1.View, { style: [{ gap: theme.labelSize }, style], onLayout: onLayout },
        react_1.default.createElement(components_1.View, { style: { width: w, height, position: 'relative' } },
            nodes,
            hoverBands,
            hr ? (react_1.default.createElement(components_1.View, { style: { position: 'absolute', left: cx(hoverIdx), top: PAD_T, width: 1, height: (showVol ? volBot : priceBot) - PAD_T, backgroundColor: (0, theme_2.withAlpha)(theme.tooltipText, '55') } })) : null,
            hr ? (react_1.default.createElement(components_1.View, { style: { position: 'absolute', left: tipLeft, top: PAD_T + 6, width: TIP_W, backgroundColor: theme.tooltipBg, borderRadius: 6, padding: 8, gap: 4 } },
                react_1.default.createElement(components_1.Text, { style: { fontSize: theme.labelSize, color: theme.tooltipText, fontWeight: '600' } }, hr.label),
                tipRow('开', yFormatter(hr.o), theme.tooltipText),
                tipRow('收', yFormatter(hr.c), hUp ? up : down),
                tipRow('高', yFormatter(hr.h), theme.tooltipText),
                tipRow('低', yFormatter(hr.l), theme.tooltipText),
                tipRow('涨跌幅', `${hPct >= 0 ? '+' : ''}${hPct.toFixed(2)}%`, hUp ? up : down),
                showVol ? tipRow('量', (0, scale_1.compactNumber)(hr.v), theme.tooltipText) : null)) : null),
        react_1.default.createElement(common_1.ChartLegend, { items: legendItems })));
}
exports.default = CandlestickChart;
