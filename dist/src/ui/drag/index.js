"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.useDrag = useDrag;
exports.useDrop = useDrop;
exports.DragLayer = DragLayer;
// DRAG：应用内拖拽（in-app DnD）的 React 侧接口 —— useDrag / useDrop 钩子 + DragLayer 预览浮层。
// 钩子把处理器登记进 window/drag 总线、并返回可直接 spread 到 <View> 的标记 props（{ __drag:{id} } / { __drop:{id} }）；
// host 输入管线沿命中节点上溯读标记驱动拖拽，本文件不参与事件处理。
// DragLayer 挂 Window 根（同 ContextMenuLayer / TextSelectionLayer），订阅总线渲染跟随光标的 ghost。
const react_1 = __importDefault(require("react"));
const components_1 = require("../../components");
const theme_1 = require("../../theme");
const drag_1 = require("../../window/drag");
function makeSourceHandlers(ref) {
    return {
        getDragData: () => ref.current.getDragData(),
        type: ref.current.type,
        renderImage: (i) => ref.current.renderImage?.(i),
        onDragStart: (i) => ref.current.onDragStart?.(i),
        onDragEnd: (i, r) => ref.current.onDragEnd?.(i, r),
    };
}
function makeTargetHandlers(ref) {
    return {
        canDrop: (i) => ref.current.canDrop?.(i) ?? true,
        onDragEnter: (i, p) => ref.current.onDragEnter?.(i, p),
        onDragLeave: (i) => ref.current.onDragLeave?.(i),
        onDrop: (i, p) => ref.current.onDrop?.(i, p),
        type: ref.current.type,
    };
}
/**
 * 声明一个拖拽源。返回 [bind, { isDragging }]：
 *   bind spread 到要能拖起的 <View>；isDragging 表示本项此刻正被拖。
 * 短按（未越位移阈值）仍是普通点击，不触发拖拽。
 */
function useDrag(options) {
    const ref = react_1.default.useRef(options);
    ref.current = options; // 每次渲染刷新，处理器永远取最新（规避闭包过期）
    const idRef = react_1.default.useRef(0);
    if (idRef.current === 0)
        idRef.current = (0, drag_1.allocDragId)(); // 渲染期同步分配 id：首帧标记即有效
    react_1.default.useEffect(() => {
        (0, drag_1.setSource)(idRef.current, makeSourceHandlers(ref));
        return () => (0, drag_1.removeSource)(idRef.current);
    }, []);
    // 每次渲染把最新处理器写回（type / renderImage 等可能变）
    react_1.default.useEffect(() => {
        (0, drag_1.setSource)(idRef.current, makeSourceHandlers(ref));
    });
    const isDragging = react_1.default.useSyncExternalStore(drag_1.subscribeDrag, () => {
        const s = (0, drag_1.getDragState)();
        return s.active && s.sourceId === idRef.current;
    });
    return [{ __drag: { id: idRef.current } }, { isDragging }];
}
/**
 * 声明一个放置目标。返回 [bind, { isOver, position }]：
 *   bind spread 到要能接收拖放的 <View>；isOver 表示「正有可落项悬停于此」（已含类型/canDrop 判定）；
 *   position 为光标在本目标内的半区（上半 'before' / 下半 'after'），未悬停时 null——供实时绘制插入位置线。
 */
function useDrop(options = {}) {
    const ref = react_1.default.useRef(options);
    ref.current = options;
    const idRef = react_1.default.useRef(0);
    if (idRef.current === 0)
        idRef.current = (0, drag_1.allocDragId)();
    react_1.default.useEffect(() => {
        (0, drag_1.setTarget)(idRef.current, makeTargetHandlers(ref));
        return () => (0, drag_1.removeTarget)(idRef.current);
    }, []);
    react_1.default.useEffect(() => {
        (0, drag_1.setTarget)(idRef.current, makeTargetHandlers(ref));
    });
    const isOver = react_1.default.useSyncExternalStore(drag_1.subscribeDrag, () => {
        const s = (0, drag_1.getDragState)();
        return s.active && s.overId === idRef.current;
    });
    const position = react_1.default.useSyncExternalStore(drag_1.subscribeDrag, () => {
        const s = (0, drag_1.getDragState)();
        return s.active && s.overId === idRef.current ? s.overPosition : null;
    });
    return [{ __drop: { id: idRef.current } }, { isOver, position }];
}
/**
 * 拖拽预览浮层：挂 Window 根，订阅总线渲染跟随光标的 ghost（半透明，pointerEvents=none 穿透）。
 * zIndex 1090（高于右键菜单 1070 / message 1080 之下不冲突，始终盖在正文上）。
 */
function DragLayer() {
    const { token } = (0, theme_1.useToken)();
    const s = react_1.default.useSyncExternalStore(drag_1.subscribeDrag, drag_1.getDragState);
    if (!s.active)
        return null;
    const custom = s.image ? s.image(s.data) : null;
    return (react_1.default.createElement(components_1.View, { pointerEvents: "none", style: { position: 'absolute', zIndex: 1090, left: s.x + 14, top: s.y + 14 } }, custom != null ? (react_1.default.createElement(components_1.View, { style: {
            padding: token.paddingXS,
            borderRadius: token.borderRadius,
            borderWidth: token.lineWidth,
            borderStyle: 'solid',
            borderColor: token.colorBorderSecondary,
            backgroundColor: token.colorBgElevated,
            opacity: 0.9,
            shadowColor: 'rgba(0,0,0,0.2)',
            shadowOpacity: 1,
            shadowRadius: 8,
            shadowOffset: { width: 0, height: 4 },
        } }, custom)) : (react_1.default.createElement(components_1.View, { style: {
            minWidth: 88,
            height: 36,
            borderRadius: token.borderRadius,
            backgroundColor: token.colorPrimary,
            opacity: 0.5,
        } }))));
}
exports.default = DragLayer;
