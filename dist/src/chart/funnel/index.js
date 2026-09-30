"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FunnelChart = FunnelChart;
// Funnel：漏斗图。整体呈「倒梯形」——每阶段是一个梯形，顶宽∝本阶段值、底宽∝下一阶段值，
// 阶段首尾相接（本阶段底宽 = 下一阶段顶宽）连成一条自上而下收窄的漏斗轮廓。
// 梯形用单个填充 path（Icon mode=fill）绘制：Skia 光栅化天生抗锯齿，避免水平薄片拼图的斜边阶梯。
// （Icon raw path 仅方形画布，故每阶段用边长 S=max(宽,高) 的方形盒子居中容纳梯形。）
// 左：阶段名；右：数值 + 相对上一阶段转化率。入场：每阶段梯形宽度自中心向两侧伸展、阶段错峰。
const react_1 = __importDefault(require("react"));
const components_1 = require("../../components");
const theme_1 = require("../../theme");
const icon_1 = require("../../ui/icon");
const common_1 = require("../core/common");
const data_1 = require("../core/data");
const scale_1 = require("../core/scale");
const theme_2 = require("../core/theme");
const clamp01 = (v) => Math.max(0, Math.min(1, v));
const LABEL_W = 96;
const VALUE_W = 112;
function FunnelChart(props) {
    const theme = (0, common_1.useChartTheme)();
    const { token } = (0, theme_1.useToken)();
    const { data, xField = 'stage', yField = 'value', width, stageHeight = 46, gap = 3, color, sortable = false, tooltip = true, animation = true, animateDuration = 1000, stagger = 0.4, valueFormatter = scale_1.compactNumber, style, } = props;
    const [measured, onLayout] = (0, common_1.useMeasuredWidth)(width ?? 520);
    const w = width ?? measured;
    const p = (0, common_1.useEnter)(animation, animateDuration);
    // 悬浮阶段：抓帧可由 FLUX_CHART_HOVER 预设，否则命中带 hover 驱动。
    const [hover, setHover] = react_1.default.useState(() => {
        const env = typeof process !== 'undefined' ? process.env.FLUX_CHART_HOVER : undefined;
        if (env != null && env !== '' && Number.isFinite(Number(env))) {
            const k = Number(env);
            return k >= 0 && k < (data ? data.length : 0) ? k : null;
        }
        return null;
    });
    const activeIndex = tooltip ? hover : null;
    let pairs = (0, data_1.flatPairs)(data, xField, yField);
    if (sortable)
        pairs = [...pairs].sort((a, b) => b.value - a.value);
    const n = Math.max(pairs.length, 1);
    const maxV = Math.max(1, ...pairs.map((d) => d.value));
    const first = pairs.length ? pairs[0].value : 1;
    const funnelW = Math.max(0, w - LABEL_W - VALUE_W);
    const centerX = LABEL_W + funnelW / 2;
    const totalH = n * stageHeight + (n - 1) * gap;
    const scale = (v) => (v / maxV) * funnelW;
    const seg = (i) => {
        const start = (i / n) * stagger;
        return clamp01((p - start) / (1 - stagger));
    };
    const nodes = [];
    pairs.forEach((d, i) => {
        const col = (0, theme_2.seriesColor)(i, color, theme);
        const t = seg(i);
        const topW = scale(d.value) * t;
        const nextV = i < pairs.length - 1 ? pairs[i + 1].value : d.value; // 末阶段底=顶（矩形收口）
        const botW = scale(nextV) * t;
        const top = i * (stageHeight + gap);
        // 梯形：单个填充 path（四边形），Skia 抗锯齿画斜边；方形盒子边长 S 居中于阶段带
        const S = Math.max(topW, botW, stageHeight);
        if (S > 0.5) {
            const n2 = (v) => Math.round(v * 100) / 100;
            const yTop = n2(S / 2 - stageHeight / 2);
            const yBot = n2(S / 2 + stageHeight / 2);
            const path = `M${n2((S - topW) / 2)} ${yTop} L${n2((S + topW) / 2)} ${yTop} L${n2((S + botW) / 2)} ${yBot} L${n2((S - botW) / 2)} ${yBot} Z`;
            nodes.push(react_1.default.createElement(components_1.View, { key: `f${i}`, style: { position: 'absolute', left: centerX - S / 2, top: top + stageHeight / 2 - S / 2, width: S, height: S, opacity: activeIndex == null || activeIndex === i ? 1 : 0.4 } },
                react_1.default.createElement(icon_1.Icon, { path: path, vb: S, size: S, color: col, mode: "fill" })));
        }
        const pct = (d.value / (pairs[Math.max(i - 1, 0)].value || 1)) * 100;
        const ofFirst = (d.value / (first || 1)) * 100;
        // 左：阶段名（垂直居中）
        nodes.push(react_1.default.createElement(components_1.Text, { key: `l${i}`, numberOfLines: 1, style: { position: 'absolute', left: 0, top: top + (stageHeight - 18) / 2, width: LABEL_W - 12, textAlign: 'right', fontSize: token.fontSize, color: token.colorText } }, d.label));
        // 右：数值 + 转化率
        nodes.push(react_1.default.createElement(components_1.View, { key: `v${i}`, style: { position: 'absolute', left: w - VALUE_W + 12, top: top + (stageHeight - 32) / 2, width: VALUE_W - 12 } },
            react_1.default.createElement(components_1.Text, { style: { fontSize: token.fontSize, color: token.colorText } }, valueFormatter(d.value)),
            react_1.default.createElement(components_1.Text, { style: { fontSize: token.fontSizeSM, color: theme.label } }, i === 0 ? '100%' : `${pct.toFixed(0)}% · 总${ofFirst.toFixed(0)}%`)));
    });
    // tooltip 气泡（悬浮阶段）：数值 / 转化率 / 占首阶段
    const TIP_W = 180;
    const tip = activeIndex != null && pairs[activeIndex]
        ? (() => {
            const d = pairs[activeIndex];
            const prev = pairs[Math.max(activeIndex - 1, 0)].value || 1;
            const pct = (d.value / prev) * 100;
            const ofFirst = (d.value / (first || 1)) * 100;
            return {
                title: d.label,
                color: (0, theme_2.seriesColor)(activeIndex, color, theme),
                rows: [
                    { name: '数值', value: valueFormatter(d.value) },
                    { name: '转化率', value: activeIndex === 0 ? '—' : `${pct.toFixed(1)}%` },
                    { name: '占首阶段', value: `${ofFirst.toFixed(1)}%` },
                ],
            };
        })()
        : null;
    const tipTop = activeIndex != null ? Math.max(0, activeIndex * (stageHeight + gap) + stageHeight / 2 - 46) : 0;
    const tipLeft = Math.max(4, Math.min(w - TIP_W - 4, centerX - TIP_W / 2));
    return (react_1.default.createElement(components_1.View, { style: [{ width: w, height: totalH, position: 'relative' }, style], onLayout: onLayout },
        nodes,
        tip ? (react_1.default.createElement(components_1.View, { style: { position: 'absolute', left: tipLeft, top: tipTop, width: TIP_W, backgroundColor: theme.tooltipBg, borderRadius: 6, padding: 8, gap: 4 } },
            react_1.default.createElement(components_1.View, { style: { flexDirection: 'row', alignItems: 'center', gap: 6 } },
                react_1.default.createElement(components_1.View, { style: { width: 8, height: 8, borderRadius: 4, backgroundColor: tip.color } }),
                react_1.default.createElement(components_1.Text, { style: { fontSize: theme.labelSize, color: theme.tooltipText, fontWeight: '600' }, numberOfLines: 1 }, tip.title)),
            tip.rows.map((r, i) => (react_1.default.createElement(components_1.View, { key: i, style: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' } },
                react_1.default.createElement(components_1.Text, { style: { fontSize: theme.labelSize, color: theme.tooltipText, opacity: 0.7 }, numberOfLines: 1 }, r.name),
                react_1.default.createElement(components_1.Text, { style: { fontSize: theme.labelSize, color: theme.tooltipText, fontWeight: '600' } }, r.value)))))) : null,
        tooltip
            ? pairs.map((_, i) => (react_1.default.createElement(components_1.Pressable, { key: `hit${i}`, onMouseEnter: () => setHover(i), onMouseLeave: () => setHover((h) => (h === i ? null : h)), style: { position: 'absolute', left: 0, top: i * (stageHeight + gap), width: w, height: stageHeight } })))
            : null));
}
exports.default = FunnelChart;
