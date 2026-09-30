"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MindMapChart = MindMapChart;
// MindMapChart：思维导图。根节点居中、一级分支左右两侧分布（或全在一侧），
// 父子间 S 形贝塞尔连线；三种节点样式 filled（主色块）/ line（纯文字+叶下划线）/ box（描边盒）。
// 布局在 draw 内完成（节点宽 = canvas measureText 实测），产出框存入 ref 供点击命中反算。
// collapsible=true 时点击带子节点的项可展开/收起其子树。渲染走 CanvasLayer 单画布。
const react_1 = __importDefault(require("react"));
const components_1 = require("../../components");
const canvas_layer_1 = require("../core/canvas-layer");
const common_1 = require("../core/common");
const mindmap_layout_1 = require("../core/mindmap-layout");
const mindmap_render_1 = require("../core/mindmap-render");
function MindMapChart(props) {
    const theme = (0, common_1.useChartTheme)();
    const { data, width, height, side = 'both', nodeStyle = 'filled', nodeH = 24, padX = 9, levelGap = 28, leafGap = 10, fontSize = 12, lineWidth = 1.2, collapsible = false, defaultCollapsed, onToggle, animation = true, animateDuration = 600, style, } = props;
    const reveal = (0, common_1.useEnter)(animation, animateDuration);
    const [collapsed, setCollapsed] = react_1.default.useState(() => new Set(defaultCollapsed ?? []));
    // 布局在 draw 内产出（依赖 measureText），存 ref 供命中反算
    const boxesRef = react_1.default.useRef([]);
    const posRef = react_1.default.useRef({ x: -1, y: -1 });
    const [hoverId, setHoverId] = react_1.default.useState(null);
    const draw = (ctx) => {
        // 统一按 600 字重测宽：实色块/灰盒根节点用粗体绘制时不溢出
        const font = `600 ${fontSize}px ${theme.fontFamily}`;
        const measure = (s) => {
            ctx.font = font;
            return ctx.measureText(s).width;
        };
        const { boxes, edges } = (0, mindmap_layout_1.layoutMindMap)(data, { width, height, side, nodeH, padX, levelGap, leafGap }, measure, collapsed);
        boxesRef.current = boxes;
        (0, mindmap_render_1.drawMindMap)(ctx, boxes, edges, {
            nodeStyle,
            fontFamily: theme.fontFamily,
            fontSize,
            primary: theme.primary,
            edgeColor: theme.axisLine,
            palette: theme.palette,
            rootBg: '#ebebeb',
            rootText: '#262626',
            padX,
            lineWidth,
            reveal,
        });
    };
    const deps = [
        JSON.stringify(data), width, height, side, nodeStyle, reveal,
        fontSize, nodeH, padX, levelGap, leafGap, lineWidth,
        [...collapsed].sort().join(','),
    ];
    const hitTest = (x, y) => {
        for (const b of boxesRef.current) {
            if (x >= b.x && x <= b.x + b.w && y >= b.y && y <= b.y + b.h)
                return b;
        }
        return null;
    };
    return (react_1.default.createElement(components_1.View, { style: [{ width, height, position: 'relative' }, style] },
        react_1.default.createElement(canvas_layer_1.CanvasLayer, { width: width, height: height, draw: draw, deps: deps }),
        collapsible ? (react_1.default.createElement(components_1.Pressable, { style: { position: 'absolute', left: 0, top: 0, width, height, cursor: hoverId ? 'pointer' : 'default' }, onMouseMove: (e) => {
                const x = e.nativeEvent.locationX;
                const y = e.nativeEvent.locationY;
                posRef.current = { x, y };
                const hit = hitTest(x, y);
                const id = hit && hit.hasChildren ? hit.id : null;
                setHoverId((prev) => (prev === id ? prev : id));
            }, onMouseMoveLeave: () => {
                posRef.current = { x: -1, y: -1 };
                setHoverId((prev) => (prev == null ? prev : null));
            }, onPress: () => {
                const { x, y } = posRef.current;
                const hit = hitTest(x, y);
                if (!hit || !hit.hasChildren)
                    return;
                setCollapsed((prev) => {
                    const next = new Set(prev);
                    const nowExpanded = next.has(hit.id);
                    if (nowExpanded)
                        next.delete(hit.id);
                    else
                        next.add(hit.id);
                    onToggle?.(hit.id, nowExpanded);
                    return next;
                });
            } })) : null));
}
exports.default = MindMapChart;
