"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Avatar = void 0;
// Avatar：圆形 / 圆角方块占位。无图时用文本首字 / icon / children 居中填充。
// 对齐 antd v5：size / shape / src / icon / Avatar.Group（重叠 + max 溢出计数）。
const react_1 = __importDefault(require("react"));
const components_1 = require("../../components");
const theme_1 = require("../../theme");
const icon_1 = require("../icon");
function sizePx(ct, size) {
    return typeof size === 'number'
        ? size
        : size === 'large'
            ? ct.containerSizeLG
            : size === 'small'
                ? ct.containerSizeSM
                : ct.containerSize;
}
function fontOf(ct, size) {
    return typeof size === 'number'
        ? size * 0.5
        : size === 'large'
            ? ct.textFontSizeLG
            : size === 'small'
                ? ct.textFontSizeSM
                : ct.textFontSize;
}
function AvatarBase(props) {
    const { token, getComponentToken } = (0, theme_1.useToken)();
    const ct = getComponentToken('Avatar');
    const { size = 'default', shape = 'circle', src, alt, icon, backgroundColor, children, style } = props;
    const px = sizePx(ct, size);
    const fontSize = fontOf(ct, size);
    const shell = {
        width: px,
        height: px,
        borderRadius: shape === 'circle' ? px / 2 : ct.borderRadius,
        backgroundColor: backgroundColor ?? token.colorFillContent,
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
    };
    if (src) {
        return (react_1.default.createElement(components_1.View, { style: [shell, style] },
            react_1.default.createElement(components_1.Image, { source: src, resizeMode: "cover", style: { width: px, height: px } })));
    }
    if (icon != null) {
        const iconColor = backgroundColor ? token.colorTextLightSolid : token.colorText;
        const node = typeof icon === 'string' ? react_1.default.createElement(icon_1.Icon, { name: icon, size: fontSize, color: iconColor }) : icon;
        return react_1.default.createElement(components_1.View, { style: [shell, { backgroundColor: backgroundColor ?? token.colorFillSecondary }, style] }, node);
    }
    return (react_1.default.createElement(components_1.View, { style: [shell, style] },
        react_1.default.createElement(components_1.Text, { style: { fontSize, color: backgroundColor ? token.colorTextLightSolid : token.colorText } }, children ?? (alt ? alt.slice(0, 1) : '?'))));
}
function AvatarGroup(props) {
    const { token, getComponentToken } = (0, theme_1.useToken)();
    const ct = getComponentToken('Avatar');
    const { max, maxStyle, maxText, space = 8, size = 'default', shape = 'circle', style, children } = props;
    const kids = react_1.default.Children.toArray(children);
    const overflow = max !== undefined && kids.length > max;
    const shown = overflow ? kids.slice(0, max) : kids;
    const rest = overflow ? kids.length - max : 0;
    const px = sizePx(ct, size);
    const wrap = (child, i) => (react_1.default.createElement(components_1.View, { key: i, style: { marginLeft: i === 0 ? 0 : -space, borderWidth: token.lineWidth, borderColor: token.colorBgContainer, borderRadius: shape === 'circle' ? px / 2 : ct.borderRadius } }, child));
    return (react_1.default.createElement(components_1.View, { style: [{ flexDirection: 'row', alignItems: 'center' }, style] },
        shown.map((c, i) => wrap(c, i)),
        overflow ? (react_1.default.createElement(components_1.View, { style: [
                {
                    marginLeft: -space,
                    width: px,
                    height: px,
                    borderRadius: shape === 'circle' ? px / 2 : ct.borderRadius,
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: token.colorFillSecondary,
                    borderWidth: token.lineWidth,
                    borderColor: token.colorBgContainer,
                },
                maxStyle,
            ] },
            react_1.default.createElement(components_1.Text, { style: { fontSize: fontOf(ct, size) * 0.7, color: token.colorTextSecondary } }, maxText ?? `+${rest}`))) : null));
}
exports.Avatar = Object.assign(AvatarBase, { Group: AvatarGroup });
