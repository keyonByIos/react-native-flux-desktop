"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FlowChart = FlowChart;
// FlowChart：流程图（DAG 分层布局）。节点为圆角块或「彩色头 + 白底体」两段卡，
// 边为正交圆角折线 + 目标箭头。highlightOnClick 开启链路高亮：点击任一节点，
// 其全部上游祖先 + 下游后代（即经过该节点的整条群流程）着色为深链路边框，
// 链路外元素淡出；再次点击同一节点取消高亮。
// 渲染走 CanvasLayer 单画布；命中用 1 个透明覆盖层 + 坐标反算（O(1) 节点）。
const react_1 = __importDefault(require("react"));
const components_1 = require("../../components");
const canvas_layer_1 = require("../core/canvas-layer");
const common_1 = require("../core/common");
const flow_layout_1 = require("../core/flow-layout");
const flow_render_1 = require("../core/flow-render");
function darken(hex, t) {
    const m = /^#([0-9a-fA-F]{6})$/.exec(hex);
    if (!m)
        return hex;
    const n = parseInt(m[1], 16);
    const f = (c) => Math.max(0, Math.min(255, Math.round(c * (1 - t))));
    return `#${((1 << 24) + (f(n >> 16 & 255) << 16) + (f(n >> 8 & 255) << 8) + f(n & 255)).toString(16).slice(1)}`;
}
function FlowChart(props) {
    const theme = (0, common_1.useChartTheme)();
    const { graph, width, height, highlightOnClick = false, selectedId, defaultSelectedId = null, onSelectChange, nodeW = 170, nodeH = 44, nodeH2 = 62, gapX = 90, gapY = 28, padding = 40, fontSize = theme.labelSize + 2, subFontSize = theme.labelSize, animation = true, animateDuration = 600, style, } = props;
    const reveal = (0, common_1.useEnter)(animation, animateDuration);
    const [innerSel, setInnerSel] = react_1.default.useState(defaultSelectedId);
    const sel = selectedId !== undefined ? selectedId : innerSel;
    // 最近一次鼠标局部坐标（onPress 不带坐标，用 onMouseMove 追踪的位点反算命中）
    const posRef = react_1.default.useRef({ x: -1, y: -1 });
    const [hoverId, setHoverId] = react_1.default.useState(null);
    const { boxes, edges } = (0, flow_layout_1.layoutFlow)(graph, {
        width, height, nodeW, nodeH, nodeH2, gapX, gapY, padding,
    });
    const chain = react_1.default.useMemo(() => (highlightOnClick && sel != null ? (0, flow_layout_1.chainOf)(sel, graph.edges) : null), [highlightOnClick, sel, graph]);
    const hitTest = (x, y) => {
        for (const b of boxes) {
            if (x >= b.x && x <= b.x + b.w && y >= b.y && y <= b.y + b.h)
                return b.id;
        }
        return null;
    };
    const draw = (ctx) => {
        (0, flow_render_1.drawFlow)(ctx, boxes, edges, {
            fontFamily: theme.fontFamily,
            fontSize, subFontSize,
            primary: theme.primary,
            edgeColor: theme.axisLine,
            edgeWidth: 1.2,
            bodyTextColor: '#595959', // 卡体恒白底 → 正文取固定中性深灰，不随主题翻浅（否则暗主题下白卡上隐形）
            chainStroke: darken(theme.primary, 0.55),
            chainText: theme.primary,
            chain, selectedId: sel, reveal,
        });
    };
    const deps = [
        JSON.stringify(graph), width, height, reveal, sel,
        nodeW, nodeH, nodeH2, gapX, gapY, padding, fontSize, subFontSize,
    ];
    return (react_1.default.createElement(components_1.View, { style: [{ width, height, position: 'relative' }, style] },
        react_1.default.createElement(canvas_layer_1.CanvasLayer, { width: width, height: height, draw: draw, deps: deps }),
        highlightOnClick ? (react_1.default.createElement(components_1.Pressable, { style: { position: 'absolute', left: 0, top: 0, width, height, cursor: hoverId ? 'pointer' : 'default' }, onMouseMove: (e) => {
                const x = e.nativeEvent.locationX;
                const y = e.nativeEvent.locationY;
                posRef.current = { x, y };
                const id = hitTest(x, y);
                setHoverId((prev) => (prev === id ? prev : id));
            }, onMouseMoveLeave: () => {
                posRef.current = { x: -1, y: -1 };
                setHoverId((prev) => (prev == null ? prev : null));
            }, onPress: () => {
                const { x, y } = posRef.current;
                const id = hitTest(x, y);
                const next = id === sel ? null : id;
                if (selectedId === undefined)
                    setInnerSel(next);
                onSelectChange?.(next);
            } })) : null));
}
exports.default = FlowChart;
