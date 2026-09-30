"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.useChartTheme = useChartTheme;
exports.useEnter = useEnter;
exports.useMeasuredWidth = useMeasuredWidth;
exports.ChartLegend = ChartLegend;
exports.useLegendToggle = useLegendToggle;
exports.ReferenceLines = ReferenceLines;
exports.Plot = Plot;
// 图表共享层：主题 hook、入场进度、测宽 hook、图例，以及笛卡尔「画布 + 坐标轴 + 网格」容器 Plot。
// 所有矩形类图（line/area/column/bar）把几何交给 children(ctx)，帧与刻度集中在此，保证四图观感一致。
const react_1 = __importDefault(require("react"));
const components_1 = require("../../components");
const theme_1 = require("../../theme");
const useAnimation_1 = require("../../anim/useAnimation");
const easing_1 = require("../../anim/easing");
const space_1 = require("../../ui/space");
const theme_2 = require("./theme");
const scale_1 = require("./scale");
const grid_1 = require("./grid");
/** token -> 图表皮肤。 */
function useChartTheme() {
    const { token } = (0, theme_1.useToken)();
    return (0, theme_2.buildChartTheme)(token);
}
/** 入场进度 0→1；enabled=false 或抓帧模式（FLUX_GRAB_DIR）下恒返回 1——静态帧显示落位成品，实机才见动画。 */
function useEnter(enabled, duration) {
    const grab = typeof process !== 'undefined' && !!process.env.FLUX_GRAB_DIR;
    return (0, useAnimation_1.useAnimation)({ playing: enabled && !grab, duration, easing: easing_1.easeOutCubic });
}
/** 测宽：onLayout 回传内容宽度，首帧用 fallback（避免 0 宽空图）。 */
function useMeasuredWidth(fallback) {
    const [w, setW] = react_1.default.useState(fallback);
    const onLayout = (e) => {
        const nw = Math.round(e.nativeEvent.layout.w);
        if (nw > 0 && Math.abs(nw - w) > 0.5)
            setW(nw);
    };
    return [w, onLayout];
}
/** 图例：色点 / 色条 + 名称，用 Space 包裹保持等距（单一 size 同时控制行/列间距）。
 *  传 onToggleIndex 进入「可点切换」态：active[i]=false 的序列置灰，点击回调切换显隐（antd/G2 图例交互）。*/
function ChartLegend(props) {
    const { token } = (0, theme_1.useToken)();
    const { items, shape = 'circle', direction = 'horizontal', size = 'large', style, active, onToggleIndex } = props;
    const toggleable = typeof onToggleIndex === 'function';
    return (react_1.default.createElement(space_1.Space, { direction: direction, size: size, wrap: true, align: direction === 'vertical' ? 'start' : 'center', style: style }, items.map((it, i) => {
        const on = active ? active[i] !== false : true;
        const dotColor = on ? it.color : token.colorTextQuaternary;
        const label = (react_1.default.createElement(components_1.View, { style: { flexDirection: 'row', alignItems: 'center', gap: 6, opacity: on ? 1 : 0.5 } },
            shape === 'line' ? (react_1.default.createElement(components_1.View, { style: { width: 14, height: 3, borderRadius: 2, backgroundColor: dotColor } })) : (react_1.default.createElement(components_1.View, { style: { width: 9, height: 9, borderRadius: 5, backgroundColor: dotColor } })),
            react_1.default.createElement(components_1.Text, { style: { fontSize: token.fontSizeSM, color: on ? token.colorTextSecondary : token.colorTextQuaternary } }, it.name)));
        if (!toggleable)
            return react_1.default.createElement(components_1.View, { key: i }, label);
        return (react_1.default.createElement(components_1.Pressable, { key: i, onPress: () => onToggleIndex(i), style: { cursor: 'pointer' } }, label));
    })));
}
/** 图例显隐状态：返回隐藏集合 + 切换 + 判定 + 供 ChartLegend 的 active 数组。 */
function useLegendToggle(count) {
    const [hidden, setHidden] = react_1.default.useState(() => {
        // 抓帧模式可由 FLUX_CHART_HIDDEN（逗号分隔索引）预设隐藏，便于静态帧看切换态
        const env = typeof process !== 'undefined' ? process.env.FLUX_CHART_HIDDEN : undefined;
        if (env) {
            const ids = env.split(',').map((s) => Number(s.trim())).filter((n) => Number.isInteger(n) && n >= 0 && n < count);
            if (ids.length < count)
                return new Set(ids);
        }
        return new Set();
    });
    const isHidden = (i) => hidden.has(i);
    const toggle = (i) => setHidden((prev) => {
        const next = new Set(prev);
        if (next.has(i))
            next.delete(i);
        else {
            // 至少保留一条可见（全隐藏会让空图 + yMax 退化）
            if (next.size >= count)
                return prev;
            next.add(i);
        }
        return next;
    });
    const active = Array.from({ length: count }, (_, i) => !hidden.has(i));
    return { isHidden, toggle, active };
}
/**
 * 横向参考线：在给定 y 像素处画一条虚线贯穿绘图区，右端挂小标签。
 * 由子图在 children(ctx) 里调用（需 ctx 的 padL/plotW/yAt 把数据值换算成像素）。参考 antd/G2 的 annotation line。
 */
function ReferenceLines(props) {
    const { lines, ctx, color = '#E86452', theme, formatter } = props;
    const nodes = [];
    lines.forEach((rl, i) => {
        const y = ctx.yAt(rl.value);
        if (y < ctx.padT - 1 || y > ctx.baseline + 1)
            return; // 超出绘图区不画
        const c = rl.color ?? color;
        for (let x = ctx.padL; x < ctx.padL + ctx.plotW; x += 6) {
            nodes.push(react_1.default.createElement(components_1.View, { key: `r${i}-${x}`, style: { position: 'absolute', left: x, top: y, width: 3, height: 1, backgroundColor: c, opacity: 0.9 } }));
        }
        const text = rl.label != null ? rl.label : formatter ? formatter(rl.value) : String(rl.value);
        if (text) {
            nodes.push(react_1.default.createElement(components_1.Text, { key: `rt${i}`, style: {
                    position: 'absolute',
                    right: 2,
                    top: y - theme.labelSize - 2,
                    fontSize: theme.labelSize,
                    color: c,
                    fontWeight: '600',
                }, numberOfLines: 1 }, text));
        }
    });
    return react_1.default.createElement(react_1.default.Fragment, null, nodes);
}
const PAD_L = 44;
const PAD_R = 18;
const PAD_T = 16;
const PAD_B = 30;
const TIP_W = 150;
/** 坐标轴 + 网格 + 类目标签的静态帧；mark（线/柱/面）由 children 画在相对容器上。可选悬浮交互。 */
function Plot(props) {
    const theme = useChartTheme();
    const { width, height, categories, yTicks, yMax, yFormatter, xFormatter, showGrid = true, grid, xLabelPositions, interactive, tooltipFor, children } = props;
    const plotW = Math.max(0, width - PAD_L - PAD_R);
    const plotH = Math.max(0, height - PAD_T - PAD_B);
    const n = categories.length;
    const xAt = (i) => PAD_L + (n <= 1 ? plotW / 2 : (i / (n - 1)) * plotW);
    const yAt = (v) => PAD_T + (1 - (vMax(v) / (yMax || 1))) * plotH;
    const vMax = (v) => Math.max(0, Math.min(yMax || 1, v));
    const baseline = PAD_T + plotH;
    const band = (count, inner = 0.35) => (0, scale_1.bandScale)(count, [PAD_L, PAD_L + plotW], { paddingInner: inner });
    const fmtY = yFormatter ?? ((v) => String(v));
    const fmtX = xFormatter ?? ((s) => s);
    const labelXs = xLabelPositions ?? categories.map((_, i) => xAt(i));
    const gridCfg = { ...grid, show: showGrid && grid?.show !== false };
    const gridYs = yTicks.map((t) => PAD_T + (1 - (Math.max(0, Math.min(yMax || 1, t)) / (yMax || 1))) * plotH);
    const gridXs = grid?.vertical ? labelXs : [];
    // 悬浮类目：抓帧模式可由 FLUX_CHART_HOVER 预设（便于静态帧看到 tooltip），否则由命中列 hover 驱动。
    const [hover, setHover] = react_1.default.useState(() => {
        const env = typeof process !== 'undefined' ? process.env.FLUX_CHART_HOVER : undefined;
        if (env != null && env !== '' && Number.isFinite(Number(env))) {
            const k = Number(env);
            return k >= 0 && k < n ? k : null;
        }
        return null;
    });
    const activeIndex = interactive ? hover : null;
    const crossX = activeIndex != null ? labelXs[activeIndex] : 0;
    const tip = activeIndex != null && tooltipFor ? tooltipFor(activeIndex) : null;
    const flip = activeIndex != null && crossX + 12 + TIP_W > width; // 靠右边界翻到准星左侧
    const tipLeft = flip ? crossX - 12 - TIP_W : crossX + 12;
    return (react_1.default.createElement(components_1.View, { style: { width, height, position: 'relative' } },
        react_1.default.createElement(grid_1.GridLines, { area: { left: PAD_L, top: PAD_T, width: plotW, height: plotH }, horizontal: gridYs, vertical: gridXs, config: gridCfg, fallbackColor: theme.gridLine }),
        yTicks.map((t, i) => {
            const y = PAD_T + (1 - (Math.max(0, Math.min(yMax || 1, t)) / (yMax || 1))) * plotH;
            return (react_1.default.createElement(components_1.Text, { key: `yl${i}`, style: {
                    position: 'absolute',
                    right: width - PAD_L + 8,
                    top: y - theme.labelSize,
                    width: PAD_L - 12,
                    textAlign: 'right',
                    fontSize: theme.labelSize,
                    color: theme.label,
                } }, fmtY(t)));
        }),
        react_1.default.createElement(components_1.View, { style: { position: 'absolute', left: PAD_L, top: baseline, width: plotW, height: 1, backgroundColor: theme.axisLine } }),
        categories.map((c, i) => (react_1.default.createElement(components_1.Text, { key: `x${i}`, style: {
                position: 'absolute',
                left: labelXs[i] - plotW / Math.max(n, 1) / 2 - 6,
                top: baseline + 8,
                width: (plotW / Math.max(n, 1)) + 12,
                textAlign: 'center',
                fontSize: theme.labelSize,
                color: activeIndex === i ? theme.label : theme.label,
                opacity: activeIndex === i ? 1 : 0.85,
                fontWeight: activeIndex === i ? '600' : 'normal',
            }, numberOfLines: 1 }, fmtX(c)))),
        react_1.default.createElement(components_1.View, { style: { position: 'absolute', left: 0, top: 0, width, height } }, children({ padL: PAD_L, padT: PAD_T, plotW, plotH, xAt, yAt, baseline, band, activeIndex })),
        activeIndex != null ? (react_1.default.createElement(components_1.View, { style: { position: 'absolute', left: crossX, top: PAD_T, width: 1, height: plotH, backgroundColor: theme.axisLine } })) : null,
        tip ? (react_1.default.createElement(components_1.View, { style: { position: 'absolute', left: Math.max(4, tipLeft), top: PAD_T + 6, width: TIP_W, backgroundColor: theme.tooltipBg, borderRadius: 6, padding: 8, gap: 4 } },
            react_1.default.createElement(components_1.Text, { style: { fontSize: theme.labelSize, color: theme.tooltipText, opacity: 0.7 } }, tip.title),
            tip.rows.map((r, i) => (react_1.default.createElement(components_1.View, { key: i, style: { flexDirection: 'row', alignItems: 'center', gap: 6 } },
                r.color ? react_1.default.createElement(components_1.View, { style: { width: 8, height: 8, borderRadius: 4, backgroundColor: r.color } }) : null,
                react_1.default.createElement(components_1.Text, { style: { flex: 1, fontSize: theme.labelSize, color: theme.tooltipText }, numberOfLines: 1 }, r.name),
                react_1.default.createElement(components_1.Text, { style: { fontSize: theme.labelSize, color: theme.tooltipText, fontWeight: '600' } }, r.value)))))) : null,
        interactive ? (react_1.default.createElement(components_1.View, { onMouseMove: (e) => {
                const lx = e.nativeEvent.locationX;
                let bi = 0;
                let bd = Infinity;
                for (let i = 0; i < labelXs.length; i++) {
                    const d = Math.abs(labelXs[i] - lx);
                    if (d < bd) {
                        bd = d;
                        bi = i;
                    }
                }
                setHover((h) => (h === bi ? h : bi));
            }, onMouseMoveLeave: () => setHover(null), style: { position: 'absolute', left: 0, top: 0, width, height } })) : null));
}
