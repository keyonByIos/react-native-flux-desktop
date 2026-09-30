"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BulletChart = BulletChart;
// Bullet：子弹图。紧凑 KPI 呈现——每行一条：浅色定性区间带（如 差/中/良）铺底 + 深色性能条（实际值）+ 竖线目标标记。
// 横向布局（x 线性值、y 类目），轴对齐矩形 → View 拼装，无锯齿。入场性能条自左生长、目标标记淡入。
// 悬停逐行 tooltip 显 实际 / 目标 / 所处区间。适合仪表盘、目标达成度并排对比。
const react_1 = __importDefault(require("react"));
const components_1 = require("../../components");
const common_1 = require("../core/common");
const grid_1 = require("../core/grid");
const scale_1 = require("../core/scale");
const theme_1 = require("../core/theme");
const PAD_L = 96;
const PAD_R = 16;
const PAD_T = 10;
const PAD_B = 24;
const TIP_W = 150;
const clamp01 = (v) => Math.max(0, Math.min(1, v));
function BulletChart(props) {
    const theme = (0, common_1.useChartTheme)();
    const { data, labelField = 'label', valueField = 'value', targetField = 'target', ranges = [], rangeColors, color, targetColor, max, height, width, barRatio = 0.42, label = false, tooltip = true, animation = true, animateDuration = 800, valueFormatter = scale_1.compactNumber, grid, style, } = props;
    const rows = data.map((d) => ({
        label: String(d[labelField] ?? ''),
        value: Number(d[valueField]) || 0,
        target: Number(d[targetField]),
    }));
    const n = rows.length;
    const rowH = 40;
    const h = height ?? Math.max(60, n * rowH + PAD_T + PAD_B);
    const [measured, onLayout] = (0, common_1.useMeasuredWidth)(width ?? 520);
    const w = width ?? measured;
    const p = (0, common_1.useEnter)(animation, animateDuration);
    // 量程
    let hi = max != null ? max : 0;
    if (max == null) {
        hi = Math.max(1, ...ranges, ...rows.map((r) => r.value), ...rows.filter((r) => Number.isFinite(r.target)).map((r) => r.target));
    }
    const ticks = (0, scale_1.linearTicks)(0, hi, 4).filter((t) => t >= 0);
    const domHi = Math.max(hi, ticks[ticks.length - 1]);
    const plotW = Math.max(0, w - PAD_L - PAD_R);
    const plotH = Math.max(0, h - PAD_T - PAD_B);
    const xScale = (0, scale_1.linearScale)([0, domHi], [PAD_L, PAD_L + plotW]);
    const baseline = PAD_T + plotH;
    const band = (0, scale_1.bandScale)(n, [PAD_T, PAD_T + plotH], { paddingInner: 0.42, paddingOuter: 0.24 });
    const gridXs = ticks.map((t) => xScale(t));
    // 区间带边界：[0, ...ranges, domHi]（裁到 domHi）
    const bounds = [0, ...ranges.filter((r) => r > 0 && r < domHi), domHi];
    const defaultBand = (i) => (0, theme_1.withAlpha)(theme.label, i === bounds.length - 2 ? '26' : i % 2 === 0 ? '14' : '20');
    const bandColorAt = (i) => (rangeColors && rangeColors[i]) || defaultBand(i);
    const [hover, setHover] = react_1.default.useState(() => {
        const env = typeof process !== 'undefined' ? process.env.FLUX_CHART_HOVER : undefined;
        if (env != null && env !== '' && Number.isFinite(Number(env))) {
            const k = Number(env);
            return k >= 0 && k < n ? k : null;
        }
        return null;
    });
    const activeIndex = tooltip ? hover : null;
    const rangeLabel = (v) => {
        for (let i = 0; i < ranges.length; i++)
            if (v <= ranges[i])
                return `区间 ${i + 1}`;
        return `区间 ${ranges.length + 1}`;
    };
    const tip = activeIndex != null ? buildTip(activeIndex) : null;
    const rowY = activeIndex != null ? band.scale(activeIndex) + band.bandwidth / 2 : 0;
    const perfEndX = activeIndex != null ? xScale(Math.max(rows[activeIndex].value, 0)) : 0;
    const flip = activeIndex != null && perfEndX + 12 + TIP_W > w;
    const tipLeft = flip ? perfEndX - 12 - TIP_W : perfEndX + 12;
    function buildTip(i) {
        const r = rows[i];
        return {
            title: r.label,
            rows: [
                { name: '实际', value: valueFormatter(r.value), color: color ?? theme.primary },
                ...(Number.isFinite(r.target) ? [{ name: '目标', value: valueFormatter(r.target) }] : []),
                ...(ranges.length ? [{ name: '所处区间', value: rangeLabel(r.value) }] : []),
            ],
        };
    }
    const perfColor = color ?? theme.primary;
    const tgtColor = targetColor ?? theme.ink ?? theme.label;
    const marks = [];
    rows.forEach((r, i) => {
        const cy = band.scale(i) + band.bandwidth / 2;
        const dim = activeIndex != null && activeIndex !== i;
        const op = dim ? 0.4 : 1;
        // 区间带（铺满行高，纵向分块）
        for (let k = 0; k < bounds.length - 1; k++) {
            const x0 = xScale(bounds[k]);
            const x1 = xScale(bounds[k + 1]);
            const bh = band.bandwidth;
            marks.push(react_1.default.createElement(components_1.View, { key: `rg${i}-${k}`, style: { position: 'absolute', left: x0, top: cy - bh / 2, width: Math.max(0, x1 - x0), height: bh, backgroundColor: bandColorAt(k), opacity: op } }));
        }
        // 性能条（居中细条，自左生长）
        const barH = Math.max(4, band.bandwidth * barRatio);
        const fullW = Math.max(0, xScale(Math.min(r.value, domHi)) - PAD_L);
        marks.push(react_1.default.createElement(components_1.View, { key: `pf${i}`, style: { position: 'absolute', left: PAD_L, top: cy - barH / 2, width: fullW * p, height: barH, backgroundColor: perfColor, borderRadius: 2, opacity: op } }));
        // 目标标记（竖线，高于性能条）
        if (Number.isFinite(r.target)) {
            const tx = xScale(Math.min(r.target, domHi));
            const th = barH * 1.7;
            marks.push(react_1.default.createElement(components_1.View, { key: `tg${i}`, style: { position: 'absolute', left: tx - 1.5, top: cy - th / 2, width: 3, height: th, backgroundColor: tgtColor, borderRadius: 1.5, opacity: op * clamp01((p - 0.5) * 2) } }));
        }
        if (label && p > 0.85) {
            marks.push(react_1.default.createElement(components_1.Text, { key: `lb${i}`, style: { position: 'absolute', left: PAD_L + fullW + 6, top: cy - theme.labelSize, fontSize: theme.labelSize, color: theme.label, opacity: op }, numberOfLines: 1 }, valueFormatter(r.value)));
        }
    });
    return (react_1.default.createElement(components_1.View, { style: [{ gap: theme.labelSize }, style], onLayout: onLayout },
        react_1.default.createElement(components_1.View, { style: { width: w, height: h, position: 'relative' } },
            react_1.default.createElement(grid_1.GridLines, { area: { left: PAD_L, top: PAD_T, width: plotW, height: plotH }, vertical: gridXs, config: { ...grid, show: grid?.show !== false }, fallbackColor: theme.gridLine }),
            ticks.map((tk, i) => (react_1.default.createElement(components_1.Text, { key: `xl${i}`, style: { position: 'absolute', left: xScale(tk) - 30, top: baseline + 6, width: 60, textAlign: 'center', fontSize: theme.labelSize, color: theme.label }, numberOfLines: 1 }, valueFormatter(tk)))),
            rows.map((r, i) => (react_1.default.createElement(components_1.Text, { key: `yl${i}`, style: { position: 'absolute', right: w - PAD_L + 8, top: band.scale(i) + band.bandwidth / 2 - theme.labelSize, width: PAD_L - 12, textAlign: 'right', fontSize: theme.labelSize, color: theme.label, fontWeight: activeIndex === i ? '600' : 'normal', opacity: activeIndex === i ? 1 : 0.85 }, numberOfLines: 1 }, r.label))),
            react_1.default.createElement(components_1.View, { style: { position: 'absolute', left: 0, top: 0, width: w, height: h } }, marks),
            tip ? (react_1.default.createElement(components_1.View, { style: { position: 'absolute', left: Math.max(4, tipLeft), top: Math.max(PAD_T, Math.min(rowY - 26, h - 90)), width: TIP_W, backgroundColor: theme.tooltipBg, borderRadius: 6, padding: 8, gap: 3 } },
                react_1.default.createElement(components_1.Text, { style: { fontSize: theme.labelSize, color: theme.tooltipText, opacity: 0.7 } }, tip.title),
                tip.rows.map((r, i) => (react_1.default.createElement(components_1.View, { key: i, style: { flexDirection: 'row', alignItems: 'center', gap: 6 } },
                    r.color ? react_1.default.createElement(components_1.View, { style: { width: 8, height: 8, borderRadius: 4, backgroundColor: r.color } }) : react_1.default.createElement(components_1.View, { style: { width: 8 } }),
                    react_1.default.createElement(components_1.Text, { style: { flex: 1, fontSize: theme.labelSize, color: theme.tooltipText }, numberOfLines: 1 }, r.name),
                    react_1.default.createElement(components_1.Text, { style: { fontSize: theme.labelSize, color: theme.tooltipText, fontWeight: '600' } }, r.value)))))) : null,
            tooltip
                ? rows.map((_, i) => (react_1.default.createElement(components_1.Pressable, { key: `hit${i}`, onMouseEnter: () => setHover(i), onMouseLeave: () => setHover((h) => (h === i ? null : h)), style: { position: 'absolute', left: PAD_L, top: band.scale(i) - band.step * 0.21, width: plotW, height: band.step } })))
                : null)));
}
exports.default = BulletChart;
