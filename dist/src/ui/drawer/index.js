"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Drawer = Drawer;
// DRAWER：从边缘滑出的面板 + 遮罩。与 Modal 同构（无 portal，绝对定位铺满最近 relative 祖先）。
// placement：left / right / top / bottom。宽度/高度走 token 派生。
const react_1 = __importDefault(require("react"));
const components_1 = require("../../components");
const theme_1 = require("../../theme");
const icon_1 = require("../icon");
const FadeIn_1 = require("../../anim/FadeIn");
function Drawer(props) {
    const { token } = (0, theme_1.useToken)();
    const { open, title, children, placement = 'right', onClose, maskClosable = true, mask = true, closable = true, extra, footer, size = token.controlHeightLG * 8, width, height, style } = props;
    if (!open)
        return null;
    const horizontal = placement === 'left' || placement === 'right';
    const cross = horizontal ? width ?? size : height ?? size;
    const panelBox = {
        position: 'absolute',
        backgroundColor: token.colorBgElevated,
        ...(horizontal
            ? { top: 0, bottom: 0, width: cross, [placement]: 0 }
            : { left: 0, right: 0, height: cross, [placement]: 0 }),
    };
    return (react_1.default.createElement(FadeIn_1.FadeIn, { duration: 200, style: { position: 'absolute', zIndex: 1000, left: 0, top: 0, right: 0, bottom: 0 } },
        mask ? (react_1.default.createElement(components_1.Pressable, { onPress: () => (maskClosable ? onClose && onClose() : undefined), style: { position: 'absolute', left: 0, top: 0, right: 0, bottom: 0, backgroundColor: token.colorBgMask } })) : null,
        react_1.default.createElement(components_1.View, { style: [panelBox, style] },
            react_1.default.createElement(components_1.View, { style: {
                    flexDirection: 'row',
                    alignItems: 'center',
                    paddingHorizontal: token.paddingLG,
                    paddingVertical: token.padding,
                    borderBottomWidth: token.lineWidth,
                    borderBottomColor: token.colorBorderSecondary,
                } },
                react_1.default.createElement(components_1.Text, { style: { flex: 1, fontSize: token.fontSizeLG, fontWeight: '600', color: token.colorText }, numberOfLines: 1 }, title),
                extra != null ? react_1.default.createElement(components_1.View, { style: { marginRight: closable ? token.marginSM : 0 } }, extra) : null,
                closable ? (react_1.default.createElement(components_1.Pressable, { onPress: () => onClose && onClose(), style: { paddingHorizontal: token.paddingXXS } },
                    react_1.default.createElement(icon_1.Icon, { name: "close", size: token.fontSizeLG, color: token.colorTextTertiary }))) : null),
            react_1.default.createElement(components_1.View, { style: { padding: token.paddingLG, flex: 1 } }, typeof children === 'string' ? (react_1.default.createElement(components_1.Text, { style: { fontSize: token.fontSize, color: token.colorText } }, children)) : (children)),
            footer != null ? (react_1.default.createElement(components_1.View, { style: { padding: token.paddingLG, borderTopWidth: token.lineWidth, borderTopColor: token.colorBorderSecondary } }, footer)) : null)));
}
exports.default = Drawer;
