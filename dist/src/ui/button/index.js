"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Button = Button;
// Button：对齐 antd 官方 API —— type(5) × size(3) × shape(default/circle/round) + danger/disabled/block/ghost/loading + icon（含纯图标方形）。
// 颜色与几何全部取自 token，交互态由 Pressable 的 pressed + 本地 hover 状态合成。
const react_1 = __importDefault(require("react"));
const components_1 = require("../../components");
const useAnimation_1 = require("../../anim/useAnimation");
const motion_1 = require("../../anim/motion");
const easing_1 = require("../../anim/easing");
const theme_1 = require("../../theme");
const color_1 = require("../../utils/color");
const icon_1 = require("../icon");
function Button(props) {
    const { token, getComponentToken } = (0, theme_1.useToken)();
    const ct = getComponentToken('Button');
    const { type = 'default', size = 'middle', shape = 'default', danger, disabled, block, ghost, loading, color, onPress, onClick, icon, children, style, } = props;
    const [hover, setHover] = react_1.default.useState(false);
    const [pressed, setPressed] = react_1.default.useState(false);
    // loading 图标旋转：loop 锯齿 0..1 映射 0..360°，只有 loading 时才订阅
    const spinP = (0, useAnimation_1.useAnimation)({ duration: 800, loop: true, easing: easing_1.linear, playing: !!loading });
    // 按压回弹：按下缩到 0.97，松手用弹簧弹回（轻微过冲）；disabled/loading 不响应，静止即恒等零开销
    const transform = (0, motion_1.useTransformTween)(pressed && !disabled && !loading ? { scale: 0.97 } : { scale: 1 }, { mode: 'spring', stiffness: 500, damping: 30 });
    // 纯图标（有 icon 无文字）→ 方形：宽度=高度、去横向内边距（antd 同此）
    const iconOnly = !!icon && children == null;
    const square = shape === 'circle' || iconOnly;
    // 自定义主色：用 antd 同款 HSV 算法派生 10 级色板，hover 取浅一级(4)、active 取深一级(6)
    const custom = color && (0, color_1.isValidColor)(color) ? (0, color_1.generate)(color) : null;
    const p = (() => {
        const main = custom ? color : danger ? token.colorError : token.colorPrimary;
        const mainHover = custom ? custom[4] : danger ? token.colorErrorHover : token.colorPrimaryHover;
        const mainActive = custom ? custom[6] : danger ? token.colorErrorActive : token.colorPrimaryActive;
        // 实色底上的文字：自定义色按对比度在白/近黑间自动择一，否则用 token 固定色
        const solidText = custom
            ? (0, color_1.readability)(main, '#ffffff') >= (0, color_1.readability)(main, '#141414')
                ? '#ffffff'
                : '#141414'
            : ct.solidTextColor;
        // 幽灵态：背景恒透明，描边/文字走主色（primary/link/text，含自定义色）或浅色（default，用于深/彩底）
        if (ghost) {
            if (type === 'primary' || type === 'link' || type === 'text' || custom) {
                return {
                    bg: 'transparent',
                    border: 'transparent',
                    color: main,
                    hoverBg: 'transparent',
                    hoverBorder: 'transparent',
                    hoverColor: mainHover,
                    activeBg: 'transparent',
                    activeBorder: 'transparent',
                    activeColor: mainActive,
                };
            }
            return {
                bg: 'transparent',
                border: token.colorBgContainer,
                color: token.colorBgContainer,
                hoverBg: 'transparent',
                hoverBorder: token.colorBgElevated,
                hoverColor: token.colorBgElevated,
                activeBg: 'transparent',
                activeBorder: token.colorBgContainer,
                activeColor: token.colorBgContainer,
            };
        }
        if (type === 'primary') {
            return {
                bg: main,
                border: main,
                color: solidText,
                hoverBg: mainHover,
                hoverBorder: mainHover,
                hoverColor: solidText,
                activeBg: mainActive,
                activeBorder: mainActive,
                activeColor: solidText,
            };
        }
        if (type === 'text') {
            return {
                bg: 'transparent',
                border: 'transparent',
                color: custom ? main : danger ? token.colorError : ct.defaultColor,
                hoverBg: custom ? (0, color_1.fade)(main, 0.1) : token.colorFillTertiary,
                hoverBorder: 'transparent',
                hoverColor: custom ? mainHover : danger ? token.colorError : ct.defaultColor,
                activeBg: custom ? (0, color_1.fade)(main, 0.2) : token.colorFillSecondary,
                activeBorder: 'transparent',
                activeColor: custom ? mainActive : danger ? token.colorError : ct.defaultColor,
            };
        }
        if (type === 'link') {
            return {
                bg: 'transparent',
                border: 'transparent',
                color: custom ? main : danger ? token.colorError : token.colorLink,
                hoverBg: 'transparent',
                hoverBorder: 'transparent',
                hoverColor: custom ? mainHover : danger ? token.colorErrorHover : token.colorLinkHover,
                activeBg: 'transparent',
                activeBorder: 'transparent',
                activeColor: custom ? mainActive : danger ? token.colorErrorActive : token.colorLinkActive,
            };
        }
        // default / dashed：自定义色时描边与文字都走该色，实色底仍留容器背景
        return {
            bg: ct.defaultBg,
            border: custom ? main : ct.defaultBorderColor,
            color: custom ? main : ct.defaultColor,
            hoverBg: ct.defaultBg,
            hoverBorder: custom ? mainHover : danger ? token.colorErrorHover : token.colorPrimaryHover,
            hoverColor: custom ? mainHover : danger ? token.colorErrorHover : token.colorPrimaryHover,
            activeBg: ct.defaultBg,
            activeBorder: custom ? mainActive : danger ? token.colorErrorActive : token.colorPrimaryActive,
            activeColor: custom ? mainActive : danger ? token.colorErrorActive : token.colorPrimaryActive,
        };
    })();
    const height = size === 'small' ? ct.controlHeightSM : size === 'large' ? ct.controlHeightLG : token.controlHeight;
    const fontSize = size === 'small' ? ct.contentFontSizeSM : size === 'large' ? ct.contentFontSizeLG : ct.contentFontSize;
    const radius = shape === 'circle' || shape === 'round' ? height / 2 : type === 'link' ? 0 : ct.borderRadius;
    const paddingInline = square
        ? 0
        : type === 'text' || type === 'link'
            ? token.paddingXS
            : size === 'small'
                ? token.paddingXS
                : ct.paddingInline;
    const fixedWidth = square ? height : undefined;
    const shell = (pressed) => {
        const active = pressed;
        const hovered = hover && !pressed;
        const bg = active ? p.activeBg : hovered ? p.hoverBg : p.bg;
        const border = active ? p.activeBorder : hovered ? p.hoverBorder : p.border;
        const color = active ? p.activeColor : hovered ? p.hoverColor : p.color;
        const base = {
            height,
            width: block ? '100%' : fixedWidth,
            borderRadius: radius,
            paddingHorizontal: paddingInline,
            borderWidth: type === 'text' || (type === 'link' && !ghost) ? 0 : token.lineWidth,
            borderStyle: type === 'dashed' ? 'dashed' : 'solid',
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
        };
        // loading 只负责拦点击与显圈，配色维持当前态（antd 同此）；只有 disabled 才置灰
        if (disabled) {
            return {
                ...base,
                backgroundColor: type === 'text' || type === 'link' ? 'transparent' : token.colorBgContainerDisabled,
                borderColor: token.colorBorder,
                opacity: type === 'text' || type === 'link' ? 0.5 : 1,
            };
        }
        return { ...base, backgroundColor: bg, borderColor: border };
    };
    const contentStyle = {
        fontSize,
        fontWeight: ct.fontWeight,
        color: disabled ? token.colorTextQuaternary : p.color,
        textDecorationLine: type === 'link' && hover && !disabled ? 'underline' : 'none',
    };
    const fire = () => {
        if (onPress)
            onPress();
        else if (onClick)
            onClick();
    };
    return (react_1.default.createElement(components_1.Pressable, { disabled: disabled || loading, onPress: fire, onPressIn: () => setPressed(true), onPressOut: () => setPressed(false), onMouseEnter: () => setHover(true), onMouseLeave: () => setHover(false), style: ({ pressed: ps }) => [shell(ps), { transform }, style] },
        loading ? (react_1.default.createElement(icon_1.Icon, { name: "loading", size: fontSize, color: disabled ? token.colorTextQuaternary : p.color, rotate: spinP * 360, style: { marginRight: children ? token.marginXXS : 0 } })) : null,
        icon && !loading ? react_1.default.createElement(components_1.View, { style: { marginRight: children ? token.marginXXS : 0 } }, icon) : null,
        children != null ? (typeof children === 'string' || typeof children === 'number' ? (react_1.default.createElement(components_1.Text, { style: contentStyle }, children)) : (children)) : null));
}
