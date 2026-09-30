"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CalendarHeatmapChart = CalendarHeatmapChart;
// CalendarHeatmap：日历热力图（GitHub 贡献图风格）。按日期聚合的数值 → 周列 × 星期行栅格，
// 每格以「基准色 + alpha 强度」映射数值；无数据/零值格作最浅底。含月份标签、星期标签、色阶图例。
// 轴对齐方块 → 全 View 拼装无锯齿。入场按列 (col) 错峰淡入，悬停逐格 tooltip 显 日期 + 数值。
const react_1 = __importDefault(require("react"));
const components_1 = require("../../components");
const theme_1 = require("../../theme");
const common_1 = require("../core/common");
const scale_1 = require("../core/scale");
const theme_2 = require("../core/theme");
const calendar_1 = require("../core/calendar");
const clamp01 = (v) => Math.max(0, Math.min(1, v));
const PAD_L = 30;
const PAD_T = 20;
const PAD_R = 8;
const PAD_B = 30;
const DEFAULT_WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
function CalendarHeatmapChart(props) {
    const theme = (0, common_1.useChartTheme)();
    const { token } = (0, theme_1.useToken)();
    const { data, dateField = 'date', valueField = 'value', cellSize = 12, cellGap = 3, startOfWeek = 0, color, levels, monthNames, weekdayNames = DEFAULT_WEEKDAYS, showMonthLabels = true, showWeekdayLabels = true, tooltip = true, animation = true, animateDuration = 900, valueFormatter = scale_1.compactNumber, style, } = props;
    const base = color ?? theme.primary;
    const datum = data.map((d) => ({ date: String(d[dateField]), value: Number(d[valueField]) || 0 }));
    const layout = (0, calendar_1.buildCalendar)(datum, { startOfWeek, monthNames });
    const p = (0, common_1.useEnter)(animation, animateDuration);
    const step = cellSize + cellGap;
    const w = PAD_L + layout.weeks * step + PAD_R;
    const h = PAD_T + 7 * step + PAD_B;
    const maxV = layout.max || 1;
    // date → value 快查（铺满网格时零/缺数据用 0）
    const vmap = new Map();
    for (const c of layout.cells)
        vmap.set(c.date, c.value);
    const alphaHex = (v) => {
        if (v <= 0)
            return '14';
        let t = v / maxV;
        if (levels && levels > 1)
            t = Math.ceil(t * levels) / levels;
        const a = 0.18 + 0.82 * clamp01(t);
        return Math.round(clamp01(a) * 255).toString(16).padStart(2, '0');
    };
    const [hover, setHover] = react_1.default.useState(() => {
        const env = typeof process !== 'undefined' ? process.env.FLUX_CHART_HOVER : undefined;
        if (env != null && env !== '' && Number.isFinite(Number(env))) {
            const k = Number(env);
            return k >= 0 && k < layout.totalDays ? k : null;
        }
        return null;
    });
    const activeIndex = tooltip ? hover : null;
    const TIP_W = 150;
    const cells = [];
    for (let i = 0; i < layout.totalDays; i++) {
        const col = Math.floor(i / 7);
        const row = i % 7;
        const ms = layout.startMs + i * 86400000;
        const dateStr = (0, calendar_1.formatDate)(ms);
        const v = vmap.get(dateStr);
        const hasData = v != null;
        const isActive = activeIndex === i;
        // 入场：按列错峰
        const t = clamp01(p * (layout.weeks + 1) - col);
        if (t <= 0)
            continue;
        const bg = hasData && v > 0 ? (0, theme_2.withAlpha)(base, alphaHex(v)) : (0, theme_2.withAlpha)(theme.label, '10');
        cells.push(react_1.default.createElement(components_1.Pressable, { key: i, onMouseEnter: tooltip ? () => setHover(i) : undefined, onMouseLeave: tooltip ? () => setHover((h) => (h === i ? null : h)) : undefined, style: {
                position: 'absolute',
                left: PAD_L + col * step,
                top: PAD_T + row * step,
                width: cellSize,
                height: cellSize,
                borderRadius: token.borderRadiusSM,
                backgroundColor: bg,
                opacity: activeIndex == null || isActive ? t : t * 0.5,
                borderWidth: isActive ? 1.5 : 0,
                borderColor: theme.ink,
            } }));
    }
    const active = activeIndex != null ? (() => {
        const col = Math.floor(activeIndex / 7);
        const row = activeIndex % 7;
        const ms = layout.startMs + activeIndex * 86400000;
        const dateStr = (0, calendar_1.formatDate)(ms);
        return { col, row, dateStr, value: vmap.get(dateStr) ?? 0 };
    })() : null;
    const tipLeft = active ? Math.min(PAD_L + active.col * step + step, Math.max(4, w - TIP_W - 4)) : 0;
    const tipTop = active ? Math.max(2, PAD_T + active.row * step - 46) : 0;
    return (react_1.default.createElement(components_1.View, { style: [{ width: w, gap: theme.labelSize }, style] },
        react_1.default.createElement(components_1.View, { style: { width: w, height: h, position: 'relative' } },
            showMonthLabels
                ? layout.monthMarkers.map((m, i) => (react_1.default.createElement(components_1.Text, { key: `m${i}`, numberOfLines: 1, style: { position: 'absolute', left: PAD_L + m.col * step, top: 2, fontSize: theme.labelSize, color: theme.label } }, m.label)))
                : null,
            showWeekdayLabels
                ? [1, 3, 5].map((row) => {
                    const wd = (row + startOfWeek) % 7;
                    return (react_1.default.createElement(components_1.Text, { key: `w${row}`, numberOfLines: 1, style: { position: 'absolute', left: 0, top: PAD_T + row * step + cellSize / 2 - theme.labelSize, width: PAD_L - 6, textAlign: 'right', fontSize: theme.labelSize, color: theme.label } }, weekdayNames[wd]));
                })
                : null,
            cells,
            active ? (react_1.default.createElement(components_1.View, { style: { position: 'absolute', left: tipLeft, top: tipTop, width: TIP_W, backgroundColor: theme.tooltipBg, borderRadius: 6, padding: 8, gap: 4 } },
                react_1.default.createElement(components_1.Text, { style: { fontSize: theme.labelSize, color: theme.tooltipText, opacity: 0.7 }, numberOfLines: 1 }, active.dateStr),
                react_1.default.createElement(components_1.View, { style: { flexDirection: 'row', alignItems: 'center', gap: 6 } },
                    react_1.default.createElement(components_1.View, { style: { width: 8, height: 8, borderRadius: 2, backgroundColor: (0, theme_2.withAlpha)(base, alphaHex(active.value)) } }),
                    react_1.default.createElement(components_1.Text, { style: { flex: 1, fontSize: theme.labelSize, color: theme.tooltipText }, numberOfLines: 1 }, "\u6570\u503C"),
                    react_1.default.createElement(components_1.Text, { style: { fontSize: theme.labelSize, color: theme.tooltipText, fontWeight: '600' } }, valueFormatter(active.value))))) : null),
        react_1.default.createElement(components_1.View, { style: { flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end', gap: token.marginXS, paddingRight: PAD_R } },
            react_1.default.createElement(components_1.Text, { style: { fontSize: theme.labelSize, color: theme.label } }, "Less"),
            react_1.default.createElement(components_1.View, { style: { flexDirection: 'row', gap: 2 } }, ['14', '40', '70', 'a8', 'e0'].map((aa, i) => (react_1.default.createElement(components_1.View, { key: i, style: { width: cellSize, height: cellSize, borderRadius: token.borderRadiusSM, backgroundColor: (0, theme_2.withAlpha)(base, aa) } })))),
            react_1.default.createElement(components_1.Text, { style: { fontSize: theme.labelSize, color: theme.label } }, "More"))));
}
exports.default = CalendarHeatmapChart;
