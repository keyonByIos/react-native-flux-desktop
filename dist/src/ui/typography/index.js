"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Typography = void 0;
exports.Title = Title;
exports.Paragraph = Paragraph;
exports.TextEl = TextEl;
exports.Link = Link;
// Typography：标题 / 段落 / 内联文本 / 链接。字号行高全部由 fontSize 系列 token 推导，
// 不引入 antd 的 heading token 表 —— 保持「seed → 派生」一条链。
const react_1 = __importDefault(require("react"));
const components_1 = require("../../components");
const theme_1 = require("../../theme");
const icon_1 = require("../icon");
const clipboard_1 = require("../../window/clipboard");
/** 复制后缀：点击写剪贴板，图标 copy→check 且变主色 2s 后复位 */
function CopySuffix(props) {
    const { token } = (0, theme_1.useToken)();
    const [copied, setCopied] = react_1.default.useState(false);
    const timer = react_1.default.useRef(null);
    react_1.default.useEffect(() => () => {
        if (timer.current)
            clearTimeout(timer.current);
    }, []);
    return (react_1.default.createElement(components_1.Pressable, { style: { cursor: 'pointer', marginLeft: token.marginXXS, alignSelf: 'center' }, onPress: () => {
            (0, clipboard_1.writeClipboard)(props.getText());
            setCopied(true);
            if (timer.current)
                clearTimeout(timer.current);
            timer.current = setTimeout(() => setCopied(false), 2000);
            props.cfg?.onCopy?.();
        } },
        react_1.default.createElement(icon_1.Icon, { name: copied ? 'check' : 'copy', size: token.fontSize, color: copied ? token.colorSuccess : token.colorTextTertiary })));
}
function typeColor(token, t) {
    if (t === 'secondary')
        return token.colorTextSecondary;
    if (t === 'success')
        return token.colorSuccess;
    if (t === 'warning')
        return token.colorWarning;
    if (t === 'danger')
        return token.colorError;
    return token.colorText;
}
/** 由装饰 props 合成一段 TextStyle：颜色 / 字重 / 斜体 / 装饰线（可叠加）/ mark 底色 */
function decorStyle(token, d, color) {
    const lines = [];
    if (d.underline)
        lines.push('underline');
    if (d.delete)
        lines.push('line-through');
    return {
        color: d.disabled ? token.colorTextQuaternary : color,
        fontWeight: d.strong ? '600' : '400',
        fontStyle: d.italic ? 'italic' : 'normal',
        textDecorationLine: (lines.length ? lines.join(' ') : 'none'),
        backgroundColor: d.mark ? token.colorWarningBg : 'transparent',
    };
}
/** 标题：级别越高字号越大，尺寸全部从 fontSizeLG/XL 派生 */
function Title(props) {
    const { token } = (0, theme_1.useToken)();
    const { level = 1, children, style, ...d } = props;
    const size = level === 1
        ? token.fontSizeXL + token.sizeStep * 2
        : level === 2
            ? token.fontSizeXL
            : level === 3
                ? token.fontSizeLG + token.sizeStep
                : level === 4
                    ? token.fontSizeLG
                    : token.fontSize;
    return (react_1.default.createElement(components_1.View, { style: [{ marginBottom: token.marginXS }, style] },
        react_1.default.createElement(components_1.Text, { style: [
                { fontSize: size, lineHeight: size * token.lineHeight },
                decorStyle(token, d, typeColor(token, d.type)),
                // 标题恒为半粗体，strong 再加重一档
                { fontWeight: d.strong ? '700' : '600' },
            ] }, children)));
}
function Paragraph(props) {
    const { token } = (0, theme_1.useToken)();
    const { children, ellipsis, copyable, style, ...d } = props;
    const rows = ellipsis ? (typeof ellipsis === 'object' ? ellipsis.rows ?? 1 : 1) : undefined;
    const base = { fontSize: token.fontSize, lineHeight: token.fontSize * token.lineHeight };
    const textNode = (react_1.default.createElement(components_1.Text, { style: [base, decorStyle(token, d, typeColor(token, d.type)), style], numberOfLines: rows }, children));
    if (!copyable)
        return react_1.default.createElement(components_1.View, { style: { marginBottom: token.marginXS } }, textNode);
    const cfg = typeof copyable === 'object' ? copyable : undefined;
    const getText = () => cfg?.text ?? (typeof children === 'string' ? children : '');
    return (react_1.default.createElement(components_1.View, { style: { marginBottom: token.marginXS, flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center' } },
        textNode,
        react_1.default.createElement(CopySuffix, { getText: getText, cfg: cfg })));
}
/** 内联文本：语义色 + 装饰变体 */
function TextEl(props) {
    const { token } = (0, theme_1.useToken)();
    const { children, code, copyable, style, ...d } = props;
    const textNode = code ? (
    // code 有底色，单独包一层
    react_1.default.createElement(components_1.View, { style: {
            alignSelf: 'flex-start',
            backgroundColor: token.colorFillTertiary,
            borderRadius: token.borderRadiusSM,
            paddingHorizontal: token.paddingXXS,
            paddingVertical: token.paddingXXS / 2,
        } },
        react_1.default.createElement(components_1.Text, { style: [{ fontSize: token.fontSizeSM }, decorStyle(token, d, token.colorText), style] }, children))) : (react_1.default.createElement(components_1.Text, { style: [{ fontSize: token.fontSize }, decorStyle(token, d, typeColor(token, d.type)), style] }, children));
    if (!copyable)
        return textNode;
    const cfg = typeof copyable === 'object' ? copyable : undefined;
    const getText = () => cfg?.text ?? (typeof children === 'string' ? children : '');
    return (react_1.default.createElement(components_1.View, { style: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', alignSelf: 'flex-start' } },
        textNode,
        react_1.default.createElement(CopySuffix, { getText: getText, cfg: cfg })));
}
/** 链接：colorLink 着色，hover 变主色并下划线，可点击 */
function Link(props) {
    const { token } = (0, theme_1.useToken)();
    const { children, disabled, onClick, style } = props;
    const [hover, setHover] = react_1.default.useState(false);
    const active = hover && !disabled;
    const color = disabled ? token.colorTextQuaternary : active ? token.colorPrimaryHover : token.colorLink;
    return (react_1.default.createElement(components_1.Pressable, { onPress: disabled ? undefined : onClick, onMouseEnter: () => setHover(true), onMouseLeave: () => setHover(false), style: { alignSelf: 'flex-start', cursor: disabled ? 'not-allowed' : 'pointer' } },
        react_1.default.createElement(components_1.Text, { style: [
                {
                    fontSize: token.fontSize,
                    color,
                    textDecorationLine: active ? 'underline' : 'none',
                },
                style,
            ] }, children)));
}
exports.Typography = { Title, Paragraph, Text: TextEl, Link };
exports.default = exports.Typography;
