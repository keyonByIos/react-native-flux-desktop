"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TextSelectionLayer = TextSelectionLayer;
// TEXT-SELECT：静态文本「长按选中」的高亮浮层（无 portal 范式，对齐 ContextMenuLayer）。
// 订阅 src/window/textselect store，把选中行矩形画成半透明主色块；pointerEvents=none 让命中穿透回正文。
// 须挂在 Window 根；zIndex 1065（内容之上、右键菜单 1070 之下）。
const react_1 = __importDefault(require("react"));
const components_1 = require("../../components");
const theme_1 = require("../../theme");
const textselect_1 = require("../../window/textselect");
function TextSelectionLayer() {
    const { token } = (0, theme_1.useToken)();
    const state = react_1.default.useSyncExternalStore(textselect_1.subscribeTextSelection, textselect_1.getTextSelectionState);
    if (!state.visible || state.rects.length === 0)
        return null;
    return (react_1.default.createElement(components_1.View, { pointerEvents: "none", style: { position: 'absolute', zIndex: 1065, left: 0, top: 0 } }, state.rects.map((r, i) => (react_1.default.createElement(components_1.View, { key: i, pointerEvents: "none", style: { position: 'absolute', left: r.x, top: r.y, width: r.w, height: r.h, backgroundColor: token.colorPrimary, opacity: 0.25 } })))));
}
exports.default = TextSelectionLayer;
