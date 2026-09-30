"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Tag = void 0;
exports.TagBase = TagBase;
exports.CheckableTag = CheckableTag;
// Tag：预设色走语义 token，自定义色走 color-*Bg / Border / Text 三件套。
const react_1 = __importDefault(require("react"));
const components_1 = require("../../components");
const theme_1 = require("../../theme");
const icon_1 = require("../icon");
const motion_1 = require("../../anim/motion");
function TagBase(props) {
    const { token, getComponentToken } = (0, theme_1.useToken)();
    const ct = getComponentToken('Tag');
    const { color = 'default', bordered = true, closable, icon, onClose, onClick, onPress, textColor, children, style } = props;
    const fire = onClick ?? onPress;
    const palette = (() => {
        switch (color) {
            case 'success':
                return { bg: token.colorSuccessBg, bd: token.colorSuccessBorder, fg: token.colorSuccessText };
            case 'processing':
                return { bg: token.colorInfoBg, bd: token.colorInfoBorder, fg: token.colorInfoText };
            case 'error':
                return { bg: token.colorErrorBg, bd: token.colorErrorBorder, fg: token.colorErrorText };
            case 'warning':
                return { bg: token.colorWarningBg, bd: token.colorWarningBorder, fg: token.colorWarningText };
            case 'default':
                return { bg: ct.defaultBg, bd: token.colorBorder, fg: ct.defaultColor };
            default:
                // 自定义色：当作主色使用，底/边用半透明派生色
                return { bg: token.colorPrimaryBg, bd: token.colorPrimaryBorder, fg: color };
        }
    })();
    // 文字/图标色统一对齐 Text（token.colorText），除非显式传 textColor；bg/边框仍走语义色，保证对比度
    const fg = textColor ?? token.colorText;
    const shell = {
        flexDirection: 'row',
        alignItems: 'center',
        borderRadius: ct.borderRadiusSM,
        paddingHorizontal: token.paddingXS,
        paddingVertical: Math.max(1, token.paddingXXS - 2),
        borderWidth: bordered ? token.lineWidth : 0,
        borderStyle: ct.borderStyle === 'solid' ? 'solid' : 'dashed',
        borderColor: palette.bd,
        backgroundColor: palette.bg,
    };
    const [closePressed, setClosePressed] = react_1.default.useState(false);
    const closeTf = (0, motion_1.useTransformTween)(closePressed ? { scale: 0.75 } : { scale: 1 }, { mode: 'spring', stiffness: 500, damping: 30 });
    const body = (react_1.default.createElement(components_1.View, { style: [shell, style] },
        icon != null ? (react_1.default.createElement(components_1.View, { style: { marginRight: children != null ? token.marginXXS : 0, alignItems: 'center', justifyContent: 'center' } }, typeof icon === 'string' ? react_1.default.createElement(icon_1.Icon, { name: icon, size: token.fontSizeSM, color: fg, strokeWidth: 2.5 }) : icon)) : null,
        children != null ? (react_1.default.createElement(components_1.Text, { style: { fontSize: token.fontSizeSM, lineHeight: Math.round(token.fontSizeSM * 1.4), color: fg } }, children)) : null,
        closable ? (react_1.default.createElement(components_1.Pressable, { onPress: () => onClose && onClose(), onPressIn: () => setClosePressed(true), onPressOut: () => setClosePressed(false), style: { marginLeft: token.marginXXS, paddingHorizontal: 2, alignItems: 'center', justifyContent: 'center' } },
            react_1.default.createElement(components_1.View, { style: { transform: closeTf } },
                react_1.default.createElement(icon_1.Icon, { name: "close", size: token.fontSizeSM, color: token.colorTextTertiary, strokeWidth: 2.5 })))) : null));
    if (!fire)
        return body;
    return react_1.default.createElement(components_1.Pressable, { onPress: fire }, body);
}
function CheckableTag(props) {
    const { token } = (0, theme_1.useToken)();
    const { checked = false, onChange, children, style } = props;
    const [hover, setHover] = react_1.default.useState(false);
    const [pressed, setPressed] = react_1.default.useState(false);
    // 按压回弹：按下缩到 0.94，松手弹簧落回（与 Button 同款），静止即恒等零开销
    const transform = (0, motion_1.useTransformTween)(pressed ? { scale: 0.94 } : { scale: 1 }, { mode: 'spring', stiffness: 500, damping: 30 });
    const bg = checked ? token.colorPrimary : hover ? token.colorFillQuaternary : 'transparent';
    const bd = checked ? token.colorPrimary : token.colorBorder;
    const fg = checked ? token.colorTextLightSolid : token.colorText;
    return (react_1.default.createElement(components_1.Pressable, { onPress: () => onChange && onChange(!checked), onPressIn: () => setPressed(true), onPressOut: () => setPressed(false), onMouseEnter: () => setHover(true), onMouseLeave: () => setHover(false), style: [
            {
                borderRadius: token.borderRadiusSM,
                paddingHorizontal: token.paddingXS,
                paddingVertical: Math.max(1, token.paddingXXS - 2),
                borderWidth: token.lineWidth,
                borderStyle: 'solid',
                borderColor: bd,
                backgroundColor: bg,
                transform,
            },
            style,
        ] },
        react_1.default.createElement(components_1.Text, { style: { fontSize: token.fontSizeSM, lineHeight: Math.round(token.fontSizeSM * 1.4), color: fg } }, children)));
}
/** Tag + Tag.CheckableTag 复合导出 */
exports.Tag = Object.assign(TagBase, { CheckableTag });
exports.default = exports.Tag;
