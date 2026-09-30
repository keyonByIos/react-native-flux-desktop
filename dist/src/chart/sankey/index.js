"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SankeyChart = SankeyChart;
// Sankey：桑基图（分层流量）。layoutSankey 纯函数算节点/流带几何；节点为轴对齐矩形用 View 画，
// 流带为三次贝塞尔缎带——按 funnel 范式各自放进边长 S=max(带宽,带高) 的方形画布（vb=S，scale=1）交 Icon fill 光栅化。
// 入场：整体 alpha 0→1 淡入。节点按序号取色板色，流带取源节点色 + 半透明。label 在节点侧标名称。
// tooltip：悬浮节点→提亮其全部进出链路（压暗其余）+ 流入/流出气泡；悬浮链路（包围盒矩形命中）→自身提亮 + 流向气泡。
const react_1 = __importDefault(require("react"));
const components_1 = require("../../components");
const theme_1 = require("../../theme");
const icon_1 = require("../../ui/icon");
const common_1 = require("../core/common");
const sankey_1 = require("../core/sankey");
const theme_2 = require("../core/theme");
const scale_1 = require("../core/scale");
/** 单条流带：算全局包围盒 → 方形画布（S=max(bw,bh)）居中定位，path 用局部坐标（scale=1）。 */
function Ribbon(props) {
    const { sx, sy, tx, ty, w } = props;
    if (w <= 0.2)
        return null;
    const half = w / 2;
    const bx0 = sx;
    const bx1 = tx;
    const by0 = Math.min(sy, ty) - half;
    const by1 = Math.max(sy, ty) + half;
    const bw = bx1 - bx0;
    const bh = by1 - by0;
    const S = Math.max(bw, bh);
    if (S <= 0)
        return null;
    // 方形画布左上角：内容在盒内居中
    const left = bx0 - (S - bw) / 2;
    const top = by0 - (S - bh) / 2;
    const d = (0, sankey_1.sankeyRibbon)(sx - left, sy - top, tx - left, ty - top, w);
    return (react_1.default.createElement(components_1.View, { style: { position: 'absolute', left, top, width: S, height: S, pointerEvents: 'none' } },
        react_1.default.createElement(icon_1.Icon, { path: d, vb: S, size: S, color: props.color, mode: "fill" })));
}
/** 链路命中矩形包围盒（与 Ribbon 同数学，供透明 Pressable 抢 hover）。 */
function ribbonBox(sx, sy, tx, ty, w) {
    const half = w / 2;
    return { left: sx, top: Math.min(sy, ty) - half, width: tx - sx, height: Math.max(sy, ty) + half - (Math.min(sy, ty) - half) };
}
function SankeyChart(props) {
    const theme = (0, common_1.useChartTheme)();
    const { token } = (0, theme_1.useToken)();
    const { nodes: rawNodes, links: rawLinks, width = 640, height = 360, nodeWidth = 14, nodePadding = 14, label = true, tooltip = true, color, animation = true, animateDuration = 900, valueFormatter = scale_1.compactNumber, style, } = props;
    const p = (0, common_1.useEnter)(animation, animateDuration);
    const names = rawNodes.map((n) => (typeof n === 'string' ? n : n.name));
    const indexOf = (ref) => (typeof ref === 'number' ? ref : names.indexOf(ref));
    const linkInputs = rawLinks.map((l) => ({ source: indexOf(l.source), target: indexOf(l.target), value: l.value }));
    const layout = react_1.default.useMemo(() => (0, sankey_1.layoutSankey)(names, linkInputs, { width, height, nodeWidth, nodePadding }), 
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [JSON.stringify(names), JSON.stringify(linkInputs), width, height, nodeWidth, nodePadding]);
    const colorOf = (i) => (0, theme_2.seriesColor)(i, color, theme);
    const [hover, setHover] = react_1.default.useState(() => {
        const env = typeof process !== 'undefined' ? process.env.FLUX_CHART_HOVER : undefined;
        if (env != null && env !== '' && Number.isFinite(Number(env))) {
            const k = Number(env);
            return k >= 0 && k < layout.nodes.length ? { kind: 'node', i: k } : null;
        }
        return null;
    });
    const linkLit = (i) => hover != null && (hover.kind === 'link' ? hover.i === i : layout.links[i].source === hover.i || layout.links[i].target === hover.i);
    const anyHi = hover != null;
    // 节点悬浮时汇总流入/流出
    const focusNode = hover != null && hover.kind === 'node' ? layout.nodes[hover.i] : null;
    const inSum = focusNode ? layout.links.filter((l) => l.target === focusNode.index).reduce((a, b) => a + b.value, 0) : 0;
    const outSum = focusNode ? layout.links.filter((l) => l.source === focusNode.index).reduce((a, b) => a + b.value, 0) : 0;
    const focusLink = hover != null && hover.kind === 'link' ? layout.links[hover.i] : null;
    const TIP_W = 170;
    return (react_1.default.createElement(components_1.View, { style: [{ width, height, position: 'relative', opacity: animation ? p : 1 }, style] },
        layout.links.map((lk, i) => (react_1.default.createElement(Ribbon, { key: `l${i}`, sx: layout.nodes[lk.source].x1, sy: lk.y0, tx: layout.nodes[lk.target].x0, ty: lk.y1, w: lk.width, color: (0, theme_2.withAlpha)(colorOf(lk.source), linkLit(i) ? '99' : anyHi ? '1E' : '55') }))),
        layout.nodes.map((n) => (react_1.default.createElement(components_1.View, { key: `n${n.index}`, style: {
                position: 'absolute',
                left: n.x0,
                top: n.y0,
                width: nodeWidth,
                height: Math.max(1, n.y1 - n.y0),
                backgroundColor: colorOf(n.index),
                borderRadius: 2,
                opacity: hover != null && hover.kind === 'node' && hover.i === n.index ? 1 : anyHi ? 0.4 : 1,
            } }))),
        label
            ? layout.nodes.map((n) => {
                const last = n.depth === layout.columns - 1;
                const lh = n.y1 - n.y0;
                if (lh < 6)
                    return null;
                return (react_1.default.createElement(components_1.Text, { key: `t${n.index}`, numberOfLines: 1, style: {
                        position: 'absolute',
                        left: last ? undefined : n.x1 + 6,
                        right: last ? width - n.x0 + 6 : undefined,
                        top: n.y0 + lh / 2 - theme.labelSize,
                        fontSize: theme.labelSize,
                        color: token.colorText,
                        maxWidth: 120,
                    } },
                    n.name,
                    " ",
                    valueFormatter(n.value)));
            })
            : null,
        tooltip
            ? layout.links.map((lk, i) => {
                const b = ribbonBox(layout.nodes[lk.source].x1, lk.y0, layout.nodes[lk.target].x0, lk.y1, lk.width);
                return (react_1.default.createElement(components_1.Pressable, { key: `lh${i}`, onMouseEnter: () => setHover({ kind: 'link', i }), onMouseLeave: () => setHover((h) => (h && h.kind === 'link' && h.i === i ? null : h)), style: { position: 'absolute', left: b.left, top: b.top, width: Math.max(1, b.width), height: Math.max(1, b.height) } }));
            })
            : null,
        tooltip
            ? layout.nodes.map((n) => (react_1.default.createElement(components_1.Pressable, { key: `nh${n.index}`, onMouseEnter: () => setHover({ kind: 'node', i: n.index }), onMouseLeave: () => setHover((h) => (h && h.kind === 'node' && h.i === n.index ? null : h)), style: { position: 'absolute', left: n.x0 - 2, top: n.y0, width: nodeWidth + 4, height: Math.max(6, n.y1 - n.y0) } })))
            : null,
        tooltip && (focusNode || focusLink) ? (react_1.default.createElement(components_1.View, { pointerEvents: "none", style: { position: 'absolute', right: 6, top: 6, width: TIP_W, backgroundColor: theme.tooltipBg, borderRadius: 6, padding: 8, gap: 4 } }, focusNode ? (react_1.default.createElement(react_1.default.Fragment, null,
            react_1.default.createElement(components_1.View, { style: { flexDirection: 'row', alignItems: 'center', gap: 6 } },
                react_1.default.createElement(components_1.View, { style: { width: 8, height: 8, borderRadius: 4, backgroundColor: colorOf(focusNode.index) } }),
                react_1.default.createElement(components_1.Text, { style: { flex: 1, fontSize: theme.labelSize, color: theme.tooltipText, fontWeight: '600' }, numberOfLines: 1 }, focusNode.name)),
            react_1.default.createElement(components_1.View, { style: { flexDirection: 'row', justifyContent: 'space-between' } },
                react_1.default.createElement(components_1.Text, { style: { fontSize: theme.labelSize, color: theme.tooltipText, opacity: 0.7 } }, "\u6D41\u5165"),
                react_1.default.createElement(components_1.Text, { style: { fontSize: theme.labelSize, color: theme.tooltipText, fontWeight: '600' } }, valueFormatter(inSum))),
            react_1.default.createElement(components_1.View, { style: { flexDirection: 'row', justifyContent: 'space-between' } },
                react_1.default.createElement(components_1.Text, { style: { fontSize: theme.labelSize, color: theme.tooltipText, opacity: 0.7 } }, "\u6D41\u51FA"),
                react_1.default.createElement(components_1.Text, { style: { fontSize: theme.labelSize, color: theme.tooltipText, fontWeight: '600' } }, valueFormatter(outSum))))) : focusLink ? (react_1.default.createElement(react_1.default.Fragment, null,
            react_1.default.createElement(components_1.View, { style: { flexDirection: 'row', alignItems: 'center', gap: 6 } },
                react_1.default.createElement(components_1.View, { style: { width: 8, height: 8, borderRadius: 4, backgroundColor: colorOf(focusLink.source) } }),
                react_1.default.createElement(components_1.Text, { style: { flex: 1, fontSize: theme.labelSize, color: theme.tooltipText, fontWeight: '600' }, numberOfLines: 1 },
                    layout.nodes[focusLink.source].name,
                    " \u2192 ",
                    layout.nodes[focusLink.target].name)),
            react_1.default.createElement(components_1.View, { style: { flexDirection: 'row', justifyContent: 'space-between' } },
                react_1.default.createElement(components_1.Text, { style: { fontSize: theme.labelSize, color: theme.tooltipText, opacity: 0.7 } }, "\u6D41\u91CF"),
                react_1.default.createElement(components_1.Text, { style: { fontSize: theme.labelSize, color: theme.tooltipText, fontWeight: '600' } }, valueFormatter(focusLink.value))))) : null)) : null));
}
exports.default = SankeyChart;
