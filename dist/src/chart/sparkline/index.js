"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SparklineChart = SparklineChart;
// Sparkline：迷你趋势图。无坐标轴，仅一条线（可选面积填充），用于卡片 / 表格里嵌一行走势。
// 入场：折线沿弧长自左向右描出（truncatePolyline），面积薄片随之揭示。
// tooltip：透明列命中→竖直准星 + 锚点 + 小气泡（类目/值），迷你图也能查数。
const react_1 = __importDefault(require("react"));
const canvas_1 = require("@napi-rs/canvas");
const components_1 = require("../../components");
const common_1 = require("../core/common");
const geometry_1 = require("../core/geometry");
const painter_1 = require("../../paint/painter");
const theme_1 = require("../core/theme");
// 每张 sparkline 分一个唯一合成 key（'sparkline:<uid>'），离屏 body 图烘进画后按此 key 存入 customBitmaps，
// 由单个 <Image source=key> 节点显示。uid 逐例递增，卸载时 dropCachedCanvas 回收。
let SPARK_SEQ = 0;
function SparklineChart(props) {
    const theme = (0, common_1.useChartTheme)();
    const { data, yField = 'value', xField, type = 'line', width, height = 48, color, endDot = true, smooth = false, tooltip = true, valueFormatter = (v) => String(Math.round(v * 100) / 100), animation = true, animateDuration = 900, style, } = props;
    const [measured, onLayout] = (0, common_1.useMeasuredWidth)(width ?? 160);
    const w = width ?? measured;
    const p = (0, common_1.useEnter)(animation, animateDuration);
    const col = color ?? theme.primary;
    const uidRef = react_1.default.useRef(null);
    if (uidRef.current == null)
        uidRef.current = ++SPARK_SEQ;
    const key = 'sparkline:' + uidRef.current;
    const vals = data.map((row) => Number(row[yField]) || 0);
    const labels = data.map((row, i) => (xField && row[xField] != null ? String(row[xField]) : String(i + 1)));
    const n = vals.length;
    const min = Math.min(...vals);
    const max = Math.max(...vals);
    const span = max - min || 1;
    const pad = 3;
    const innerW = Math.max(0, w - pad * 2);
    const innerH = Math.max(0, height - pad * 2);
    const xAt = (i) => pad + (n <= 1 ? innerW / 2 : (i / (n - 1)) * innerW);
    const yAt = (v) => pad + (1 - (v - min) / span) * innerH;
    const rawPts = vals.map((v, i) => [xAt(i), yAt(v)]);
    const pts = smooth ? (0, geometry_1.catmullRom)(rawPts) : rawPts;
    const total = (0, geometry_1.polylineLength)(pts);
    const shown = (0, geometry_1.truncatePolyline)(pts, p);
    const revealX = pad + innerW * p;
    const last = pts[pts.length - 1];
    // 折线 + 面积 + 端点画进一张 dpr 尺寸离屏 canvas，由单个 <Image source=key> 显示（本栈 image 即 canvas）。
    // 取代原「~74 面积薄片 + n 折线段 + 端点」三类 View，把 body 成本从 O(n) 节点降到 1 节点。
    const shownJson = JSON.stringify(shown);
    react_1.default.useLayoutEffect(() => {
        if (w <= 0 || height <= 0)
            return;
        const dpr = Math.max(2, (0, painter_1.getPaintDpr)() || 2); // ≥2× 超采样：静态图首帧 paintDpr 未定时也不发虚；dpr=2 屏精确 1:1
        const cw = Math.max(1, Math.round(w * dpr));
        const chh = Math.max(1, Math.round(height * dpr));
        const c = (0, canvas_1.createCanvas)(cw, chh);
        const cx = c.getContext('2d');
        cx.setTransform(dpr, 0, 0, dpr, 0, 0);
        cx.clearRect(0, 0, w, height);
        if (shown.length > 0) {
            cx.save();
            cx.beginPath();
            cx.rect(0, 0, Math.max(0, revealX), height);
            cx.clip();
            if (type === 'area' && shown.length > 1) {
                cx.beginPath();
                cx.moveTo(shown[0][0], height - pad);
                for (const [px, py] of shown)
                    cx.lineTo(px, py);
                cx.lineTo(shown[shown.length - 1][0], height - pad);
                cx.closePath();
                cx.fillStyle = (0, theme_1.withAlpha)(col, '44');
                cx.fill();
            }
            if (shown.length > 1) {
                cx.beginPath();
                cx.moveTo(shown[0][0], shown[0][1]);
                for (let i = 1; i < shown.length; i++)
                    cx.lineTo(shown[i][0], shown[i][1]);
                cx.strokeStyle = col;
                cx.lineWidth = 1.5;
                cx.lineJoin = 'round';
                cx.lineCap = 'round';
                cx.stroke();
            }
            cx.restore();
        }
        if (endDot && last && p > 0.98) {
            cx.beginPath();
            cx.arc(last[0], last[1], 2.5, 0, Math.PI * 2);
            cx.fillStyle = col;
            cx.fill();
        }
        (0, painter_1.putCachedCanvas)(key, c);
        return () => (0, painter_1.dropCachedCanvas)(key);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [key, w, height, pad, type, col, endDot, p, revealX, shownJson]);
    // 悬浮列：抓帧可由 FLUX_CHART_HOVER 预设点序号；命中列文档序最上抢 hover
    const [hover, setHover] = react_1.default.useState(() => {
        const env = typeof process !== 'undefined' ? process.env.FLUX_CHART_HOVER : undefined;
        if (env != null && env !== '' && Number.isFinite(Number(env))) {
            const k = Number(env);
            return k >= 0 && k < n ? k : null;
        }
        return null;
    });
    const colW = n > 0 ? innerW / n : innerW;
    const hiX = hover != null ? xAt(hover) : 0;
    const hiY = hover != null ? yAt(vals[hover]) : 0;
    const TIP_W = 96;
    const tipLeft = hover != null ? Math.max(2, Math.min(w - TIP_W - 2, hiX + 8 > w - TIP_W - 2 ? hiX - 8 - TIP_W : hiX + 8)) : 0;
    return (react_1.default.createElement(components_1.View, { style: [{ width: w, height, position: 'relative' }, style], onLayout: onLayout },
        react_1.default.createElement(components_1.Image, { source: key, resizeMode: "contain", style: { position: 'absolute', left: 0, top: 0, width: w, height } }),
        tooltip && hover != null ? (react_1.default.createElement(react_1.default.Fragment, null,
            react_1.default.createElement(components_1.View, { pointerEvents: "none", style: { position: 'absolute', left: hiX, top: pad, width: 1, height: innerH, backgroundColor: (0, theme_1.withAlpha)(col, '88') } }),
            react_1.default.createElement(components_1.View, { pointerEvents: "none", style: { position: 'absolute', left: hiX - 3.5, top: hiY - 3.5, width: 7, height: 7, borderRadius: 4, backgroundColor: col, borderWidth: 1.5, borderColor: theme.tooltipBg } }),
            react_1.default.createElement(components_1.View, { pointerEvents: "none", style: { position: 'absolute', left: tipLeft, top: 2, width: TIP_W, backgroundColor: theme.tooltipBg, borderRadius: 5, paddingVertical: 4, paddingHorizontal: 7, flexDirection: 'row', justifyContent: 'space-between', gap: 6 } },
                react_1.default.createElement(components_1.Text, { style: { fontSize: 10, color: theme.tooltipText, opacity: 0.75 }, numberOfLines: 1 }, labels[hover]),
                react_1.default.createElement(components_1.Text, { style: { fontSize: 10, color: theme.tooltipText, fontWeight: '600' }, numberOfLines: 1 }, valueFormatter(vals[hover]))))) : null,
        tooltip
            ? vals.map((_, i) => (react_1.default.createElement(components_1.Pressable, { key: `hit${i}`, onMouseEnter: () => setHover(i), onMouseLeave: () => setHover((h) => (h === i ? null : h)), style: { position: 'absolute', left: pad + i * colW, top: 0, width: colW, height } })))
            : null));
}
exports.default = SparklineChart;
