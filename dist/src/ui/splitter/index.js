"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Splitter = void 0;
exports.SplitterPanel = SplitterPanel;
// Splitter：可分割面板（对齐 antd Splitter / Splitter.Panel 的降级实现）。
// 面板尺寸用百分比 + useTween 缓动；折叠按钮内嵌在分割条上。
// 指针拖拽调宽需要 pointer capture 管线（OPEN_QUESTIONS 旧条目），暂以「点按钮折叠」交互为主。
const react_1 = __importDefault(require("react"));
const components_1 = require("../../components");
const theme_1 = require("../../theme");
const useTween_1 = require("../../anim/useTween");
const easing_1 = require("../../anim/easing");
const icon_1 = require("../icon");
function collapsibleEnds(c) {
    if (!c)
        return { start: false, end: false };
    if (c === true)
        return { start: true, end: true };
    return { start: !!c.start, end: !!c.end };
}
/** 把 number | "30%" | "30px" 归一为百分比数值（px 无法换算，退回落默认） */
function toPct(v) {
    if (v === undefined)
        return undefined;
    if (typeof v === 'number')
        return v;
    if (/px/i.test(v))
        return undefined;
    const n = parseFloat(v);
    return Number.isFinite(n) ? n : undefined;
}
function SplitterPanel(props) {
    // 真正的几何由 Splitter 统一计算，这里只是内容槽
    return react_1.default.createElement(react_1.default.Fragment, null, props.children);
}
function SplitterBase(props) {
    const { token } = (0, theme_1.useToken)();
    const { children, layout = 'horizontal', onCollapse, style } = props;
    const panels = react_1.default.Children.toArray(children).filter((c) => react_1.default.isValidElement(c));
    // 目标占比：折叠归 0，其余按声明尺寸归一化到 100%；面板数固定，逐个 useTween 补间安全
    const [collapsed, setCollapsed] = react_1.default.useState({});
    const declared = panels.map((p) => toPct(p.props.defaultSize ?? p.props.size) ?? 100 / panels.length);
    const sumOpen = declared.reduce((a, b, i) => a + (collapsed[i] ? 0 : b), 0) || 1;
    const finalPcts = panels.map((_, i) => (collapsed[i] ? 0 : (declared[i] / sumOpen) * 100));
    const shownPcts = panels.map((_, i) => (0, useTween_1.useTween)(finalPcts[i], 280, easing_1.easeOutCubic));
    const vertical = layout === 'vertical';
    const toggle = (i) => {
        const next = { ...collapsed, [i]: !collapsed[i] };
        setCollapsed(next);
        onCollapse?.(i, !!next[i]);
    };
    const bar = (i) => {
        if (i === panels.length - 1)
            return null;
        // 折叠 i+1：其 start 端可折叠；折叠 i：其 end 端可折叠
        const nextStart = collapsibleEnds(panels[i + 1].props.collapsible).start;
        const prevEnd = collapsibleEnds(panels[i].props.collapsible).end;
        return (react_1.default.createElement(components_1.View, { style: {
                width: vertical ? undefined : token.paddingSM,
                height: vertical ? token.paddingSM : undefined,
                backgroundColor: token.colorSplit,
                alignItems: 'center',
                justifyContent: 'center',
                flexDirection: vertical ? 'row' : 'column',
            } },
            nextStart ? (react_1.default.createElement(components_1.Pressable, { onPress: () => toggle(i + 1), style: { padding: token.paddingXXS / 2 } },
                react_1.default.createElement(icon_1.Icon, { name: vertical ? 'down' : 'right', size: token.fontSizeSM, color: token.colorTextTertiary, rotate: collapsed[i + 1] ? 180 : 0 }))) : null,
            prevEnd ? (react_1.default.createElement(components_1.Pressable, { onPress: () => toggle(i), style: { padding: token.paddingXXS / 2 } },
                react_1.default.createElement(icon_1.Icon, { name: vertical ? 'up' : 'left', size: token.fontSizeSM, color: token.colorTextTertiary, rotate: collapsed[i] ? 180 : 0 }))) : null));
    };
    return (react_1.default.createElement(components_1.View, { style: [
            { flexDirection: vertical ? 'column' : 'row', flex: 1, overflow: 'hidden' },
            style,
        ] }, panels.map((p, i) => (react_1.default.createElement(react_1.default.Fragment, { key: i },
        react_1.default.createElement(components_1.View, { style: {
                [vertical ? 'height' : 'width']: `${Math.round(shownPcts[i] * 10) / 10}%`,
                display: collapsed[i] && shownPcts[i] < 0.5 ? 'none' : 'flex',
                overflow: 'hidden',
            } }, p),
        bar(i))))));
}
exports.Splitter = Object.assign(SplitterBase, { Panel: SplitterPanel });
exports.default = exports.Splitter;
