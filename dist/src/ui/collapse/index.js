"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Collapse = Collapse;
// Collapse / CollapsePanel：手风琴。参考 antd v5 items 配置式，就地展开/收起，
// 箭头用 Icon + rotate 属性做旋转，展开内容用 opacity 过渡（useAnimation 驱动）。
const react_1 = __importDefault(require("react"));
const components_1 = require("../../components");
const theme_1 = require("../../theme");
const icon_1 = require("../icon");
const useTween_1 = require("../../anim/useTween");
const easing_1 = require("../../anim/easing");
function PanelBody(props) {
    const { token } = (0, theme_1.useToken)();
    const { item, expanded } = props;
    // 内容自然高度：常驻渲染 + onLayout 实测，作为 height 补间的目标（收起时也能提前量到，首次展开不跳变）
    const [contentH, setContentH] = react_1.default.useState(0);
    // 高度补间：展开→实测内容高，收起→0；配 overflow:hidden 逐帧裁出「下滑展开」。
    // height 是真实布局尺寸（非 transform），故下方兄弟面板随每帧高度自然被推下去，无需 FLIP。
    const h = (0, useTween_1.useTween)(expanded ? contentH : 0, 240, easing_1.easeOutCubic);
    const handleLayout = (e) => {
        const nh = e.nativeEvent.layout.h;
        setContentH((prev) => (Math.abs(nh - prev) > 0.5 ? nh : prev));
    };
    return (react_1.default.createElement(components_1.View, { style: { height: h, overflow: 'hidden' } },
        react_1.default.createElement(components_1.View, { onLayout: handleLayout, style: {
                // 绝对定位：脱离流，按自身内容量高——否则收起态下父级 height:0 + overflow:hidden 会把子 Text 按可用高 0 量→塔成 0 高→内容永不显示
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                paddingHorizontal: token.padding,
                paddingVertical: token.paddingSM,
                borderTopWidth: token.lineWidth,
                borderTopColor: token.colorSplit,
            } }, typeof item.children === 'string' ? (react_1.default.createElement(components_1.Text, { style: { fontSize: token.fontSize, color: token.colorTextSecondary, lineHeight: token.fontSize * token.lineHeight } }, item.children)) : (item.children))));
}
function Panel(props) {
    const { token } = (0, theme_1.useToken)();
    const { item, expanded, onToggle, last, ghost, expandIconPosition, size, collapsible, expandIcon, } = props;
    const [hover, setHover] = react_1.default.useState(false);
    // 箭头旋转随展开状态缓动（Icon 支持任意角度）
    const chevronDeg = (0, useTween_1.useTween)(expanded ? 90 : 0, 200, easing_1.easeOutCubic);
    const fg = item.disabled ? token.colorTextQuaternary : token.colorText;
    // collapsible 优先于 item.disabled：'disabled' 强制不可点；'icon' 仅箭头响应
    const disabled = !!item.disabled || collapsible === 'disabled';
    const headerPressable = collapsible !== 'icon' && !disabled;
    const padV = size === 'large' ? token.padding : token.paddingSM;
    const headFont = size === 'large' ? token.fontSizeLG : token.fontSize;
    // 外框（border + 圆角 + overflow 裁剪）统一上移到 Collapse 外层容器：
    // 收尾面板旧写法是「top=0 的非等宽边框 + 下圆角」，而 painter 的非等宽分支只填直边带、不描圆角弧，
    // 导致下两角出现断开缺口。改由外层等宽边框走描边分支画完整圆角，面板本身只留面板间分隔线。
    const shell = {
        borderBottomWidth: last ? 0 : token.lineWidth,
        borderBottomColor: token.colorSplit,
    };
    const chevron = expandIcon != null ? (expandIcon({ isActive: expanded })) : (react_1.default.createElement(icon_1.Icon, { name: "right", size: token.fontSizeSM, color: fg, strokeWidth: 2.5, rotate: chevronDeg }));
    // 'icon' 模式：箭头自带 Pressable，只有点它才切换
    const chevronNode = collapsible === 'icon' && !disabled ? (react_1.default.createElement(components_1.Pressable, { onPress: onToggle, style: { marginRight: token.marginXS } }, chevron)) : (react_1.default.createElement(components_1.View, { style: { marginRight: token.marginXS } }, chevron));
    return (react_1.default.createElement(components_1.View, { style: shell },
        react_1.default.createElement(components_1.Pressable, { disabled: !headerPressable, onMouseEnter: () => setHover(true), onMouseLeave: () => setHover(false), onPress: onToggle, style: {
                flexDirection: 'row',
                alignItems: 'center',
                paddingHorizontal: token.padding,
                paddingVertical: padV,
                backgroundColor: hover && !disabled && !ghost ? token.colorFillQuaternary : 'transparent',
            } },
            expandIconPosition === 'start' ? chevronNode : null,
            item.icon != null ? (react_1.default.createElement(components_1.View, { style: { marginRight: token.marginXS } }, typeof item.icon === 'string' ? react_1.default.createElement(icon_1.Icon, { name: item.icon, size: headFont, color: fg }) : item.icon)) : null,
            react_1.default.createElement(components_1.Text, { style: { flex: 1, fontSize: headFont, fontWeight: '500', color: fg } }, item.label),
            expandIconPosition === 'end' ? (react_1.default.createElement(components_1.View, { style: { marginLeft: token.marginXS } }, chevron)) : null),
        react_1.default.createElement(PanelBody, { item: item, expanded: expanded, last: last })));
}
function Collapse(props) {
    const { token } = (0, theme_1.useToken)();
    const { items, activeKey, defaultActiveKey, onChange, accordion, bordered = true, ghost, expandIconPosition = 'start', size = 'default', collapsible, expandIcon, style, } = props;
    const [inner, setInner] = react_1.default.useState(defaultActiveKey ?? []);
    const active = activeKey ?? inner;
    function toggle(key) {
        const next = active.includes(key)
            ? active.filter((k) => k !== key)
            : accordion
                ? [key]
                : [...active, key];
        if (activeKey === undefined)
            setInner(next);
        onChange && onChange(next);
    }
    const radius = token.borderRadiusLG;
    return (react_1.default.createElement(components_1.View, { style: [
            {
                borderRadius: radius,
                overflow: 'hidden',
                backgroundColor: ghost ? 'transparent' : token.colorBgContainer,
                borderWidth: bordered && !ghost ? token.lineWidth : 0,
                borderColor: token.colorBorderSecondary,
            },
            style,
        ] }, items.map((it, i) => (react_1.default.createElement(Panel, { key: it.key, item: it, expanded: active.includes(it.key), onToggle: () => toggle(it.key), last: i === items.length - 1, ghost: !!ghost, expandIconPosition: expandIconPosition, size: size, collapsible: collapsible, expandIcon: expandIcon })))));
}
exports.default = Collapse;
