"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Layout = void 0;
exports.LayoutBase = LayoutBase;
exports.Header = Header;
exports.Sider = Sider;
exports.Content = Content;
exports.Footer = Footer;
// Layout：页级骨架（Header / Sider / Content / Footer）。
// 与 antd 不同的一点：所有底色都取自 token，因此换算法即换皮（antd 的 Sider 写死深蓝）。
const react_1 = __importDefault(require("react"));
const components_1 = require("../../components");
const theme_1 = require("../../theme");
const useTween_1 = require("../../anim/useTween");
const easing_1 = require("../../anim/easing");
const icon_1 = require("../icon");
/** 外层容器：默认纵向，hasSider 时横向；底色用 Layout 背景 */
function LayoutBase(props) {
    const { token } = (0, theme_1.useToken)();
    return (react_1.default.createElement(components_1.View, { style: [
            { flex: 1, flexDirection: props.hasSider ? 'row' : 'column', backgroundColor: token.colorBgLayout },
            props.style,
        ] }, props.children));
}
function Header(props) {
    const { token } = (0, theme_1.useToken)();
    return (react_1.default.createElement(components_1.View, { style: {
            flexDirection: 'row',
            alignItems: 'center',
            height: props.height ?? token.controlHeightLG * 2,
            paddingHorizontal: token.paddingLG,
            backgroundColor: token.colorBgContainer,
            borderBottomWidth: token.lineWidth,
            borderBottomColor: token.colorBorderSecondary,
        } }, props.children));
}
function Sider(props) {
    const { token } = (0, theme_1.useToken)();
    const [inner, setInner] = react_1.default.useState(props.defaultCollapsed ?? false);
    const collapsed = props.collapsed !== undefined ? props.collapsed : inner;
    const full = props.width ?? token.controlHeightLG * 6;
    const thin = props.collapsedWidth ?? token.controlHeightLG * 1.4;
    const bg = props.theme === 'dark' ? token.colorBgLayout : token.colorBgContainer;
    // 宽度补间：折叠切换时 260ms 缓动；trigger 箭头同步旋转（reverseArrow 再转 180°）
    const w = (0, useTween_1.useTween)(collapsed ? thin : full, 260, easing_1.easeOutCubic);
    const deg = (0, useTween_1.useTween)(collapsed ? 180 : 0, 260, easing_1.easeOutCubic) + (props.reverseArrow ? 180 : 0);
    const toggle = () => {
        if (props.collapsed === undefined)
            setInner(!inner);
        props.onCollapse && props.onCollapse(!collapsed);
    };
    return (react_1.default.createElement(components_1.View, { style: { width: w, flexDirection: 'column' } },
        react_1.default.createElement(components_1.View, { style: {
                flex: 1,
                overflow: 'hidden',
                backgroundColor: bg,
                borderRightWidth: token.lineWidth,
                borderRightColor: token.colorBorderSecondary,
            } }, props.children),
        props.collapsible && props.trigger !== null ? (react_1.default.createElement(components_1.Pressable, { onPress: toggle, style: {
                height: token.controlHeight,
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: bg,
                borderRightWidth: token.lineWidth,
                borderRightColor: token.colorBorderSecondary,
                borderTopWidth: token.lineWidth,
                borderTopColor: token.colorBorderSecondary,
            } },
            react_1.default.createElement(icon_1.Icon, { name: "left", size: token.fontSize, color: token.colorTextTertiary, rotate: deg }))) : null));
}
function Content(props) {
    const { token } = (0, theme_1.useToken)();
    return (react_1.default.createElement(components_1.View, { style: [{ flex: 1, padding: token.paddingLG }, props.style] }, props.children));
}
function Footer(props) {
    const { token } = (0, theme_1.useToken)();
    return (react_1.default.createElement(components_1.View, { style: {
            flexDirection: 'row',
            alignItems: 'center',
            padding: token.paddingLG,
            backgroundColor: token.colorBgContainer,
            borderTopWidth: token.lineWidth,
            borderTopColor: token.colorBorderSecondary,
            ...(props.style || {}),
        } }, props.children));
}
/** Layout + Header/Sider/Content/Footer 复合导出 */
exports.Layout = Object.assign(LayoutBase, { Header, Sider, Content, Footer });
exports.default = exports.Layout;
