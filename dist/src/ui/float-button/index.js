"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FloatButton = void 0;
exports.FloatButtonBase = FloatButtonBase;
exports.Group = Group;
// FloatButton：悬浮按钮。圆形/方形浮动按钮，position:absolute 锚定到最近的定位父级。
// 根节点即按钮本体（不再套一层 absolute View，否则 right/bottom 会相对 0×0 包裹层失效）。
const react_1 = __importDefault(require("react"));
const components_1 = require("../../components");
const theme_1 = require("../../theme");
const icon_1 = require("../icon");
const FadeIn_1 = require("../../anim/FadeIn");
function FloatButtonBase(props) {
    const { token } = (0, theme_1.useToken)();
    const { icon, description, text, badge, type = 'default', shape = 'circle', size, onClick, onPress, tooltip, title, style, } = props;
    const [hover, setHover] = react_1.default.useState(false);
    const desc = description ?? text;
    const tip = tooltip ?? title;
    const fire = () => {
        if (onClick)
            onClick();
        else if (onPress)
            onPress();
    };
    const box = size ?? token.controlHeightLG + 8;
    const primary = type === 'primary';
    const bg = primary
        ? hover
            ? token.colorPrimaryHover
            : token.colorPrimary
        : hover
            ? token.colorFillQuaternary
            : token.colorBgContainer;
    const fg = primary ? token.colorTextLightSolid : token.colorText;
    const radius = shape === 'circle' ? box / 2 : token.borderRadiusLG;
    return (react_1.default.createElement(components_1.Pressable, { onPress: fire, onMouseEnter: () => setHover(true), onMouseLeave: () => setHover(false), style: [
            {
                position: 'absolute',
                right: token.marginLG,
                bottom: token.marginLG,
                width: box,
                minHeight: desc != null ? box + token.marginMD : box,
                borderRadius: radius,
                backgroundColor: bg,
                borderWidth: primary ? 0 : token.lineWidth,
                borderColor: token.colorBorderSecondary,
                alignItems: 'center',
                justifyContent: 'center',
                paddingVertical: token.paddingXXS,
            },
            style,
        ] },
        icon != null ? (react_1.default.createElement(components_1.View, null, typeof icon === 'string' ? react_1.default.createElement(icon_1.Icon, { name: icon, size: token.fontSizeLG, color: fg }) : icon)) : null,
        desc != null ? (react_1.default.createElement(components_1.Text, { style: { fontSize: token.fontSizeSM, color: fg, marginTop: token.marginXXS } }, desc)) : null,
        badge != null ? (react_1.default.createElement(components_1.View, { style: {
                position: 'absolute',
                top: 2,
                right: 2,
                minWidth: token.fontSizeSM + 6,
                height: token.fontSizeSM + 6,
                paddingHorizontal: token.paddingXXS / 2,
                borderRadius: (token.fontSizeSM + 6) / 2,
                backgroundColor: token.colorError,
                alignItems: 'center',
                justifyContent: 'center',
            } },
            react_1.default.createElement(components_1.Text, { style: { fontSize: token.fontSizeSM - 3, color: token.colorTextLightSolid } }, badge))) : null,
        tip && hover ? (react_1.default.createElement(components_1.View, { style: {
                position: 'absolute',
                right: box + token.marginXS,
                top: box / 2 - token.controlHeightSM / 2,
                paddingHorizontal: token.paddingXS,
                paddingVertical: token.paddingXXS,
                borderRadius: token.borderRadius,
                backgroundColor: token.colorText,
            } },
            react_1.default.createElement(components_1.Text, { style: { fontSize: token.fontSizeSM, color: token.colorBgContainer } }, tip))) : null));
}
function Group(props) {
    const { token } = (0, theme_1.useToken)();
    const { children, trigger, open, defaultOpen = false, onOpenChange, icon, closeIcon, style } = props;
    const [inner, setInner] = react_1.default.useState(defaultOpen);
    const isExpanded = open !== undefined ? open : inner;
    const setExpanded = (v) => {
        if (open === undefined)
            setInner(v);
        onOpenChange && onOpenChange(v);
    };
    const shellStyle = [
        {
            position: 'absolute',
            right: token.marginLG,
            bottom: token.marginLG,
            alignItems: 'center',
            backgroundColor: token.colorBgContainer,
            borderRadius: token.borderRadiusLG + token.paddingXXS,
            borderWidth: trigger ? 0 : token.lineWidth,
            borderColor: token.colorBorderSecondary,
            padding: trigger ? 0 : token.paddingXXS,
        },
        style,
    ];
    // 无 trigger：保持旧行为，子项常驻堆叠
    if (!trigger) {
        return react_1.default.createElement(components_1.View, { style: shellStyle }, children);
    }
    const enter = (0, FadeIn_1.useEnter)(isExpanded ? 200 : 0);
    return (react_1.default.createElement(components_1.View, { style: shellStyle },
        isExpanded ? (react_1.default.createElement(components_1.View, { style: { alignItems: 'center', opacity: enter, marginBottom: token.marginXS } }, children)) : null,
        react_1.default.createElement(components_1.Pressable, { onPress: () => trigger === 'click' && setExpanded(!isExpanded), onMouseEnter: () => trigger === 'hover' && setExpanded(true), onMouseLeave: () => trigger === 'hover' && setExpanded(false), style: {
                width: token.controlHeightLG + 8,
                height: token.controlHeightLG + 8,
                borderRadius: (token.controlHeightLG + 8) / 2,
                backgroundColor: token.colorPrimary,
                alignItems: 'center',
                justifyContent: 'center',
            } }, (() => {
            const trig = isExpanded ? closeIcon ?? 'close' : icon ?? 'menu';
            return typeof trig === 'string' ? (react_1.default.createElement(icon_1.Icon, { name: trig, size: token.fontSizeLG, color: token.colorTextLightSolid })) : (trig);
        })())));
}
/** FloatButton + FloatButton.Group 复合导出 */
exports.FloatButton = Object.assign(FloatButtonBase, { Group });
exports.default = exports.FloatButton;
