"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Pagination = Pagination;
// Pagination：页码导航。对齐 antd v5 —— showTotal / size / disabled / itemRender / onChange(page, pageSize)。
// 省略号用 jump-prev/jump-next 标记，供 itemRender 定制；当前页主色描边 + 主色字，悬停页码变主色。
const react_1 = __importDefault(require("react"));
const components_1 = require("../../components");
const theme_1 = require("../../theme");
const icon_1 = require("../icon");
/** 生成页码序列：1 … 4 5 [6] 7 8 … N（当前页居中，两端固定，中间省略） */
function pageItems(current, pages) {
    if (pages <= 7)
        return Array.from({ length: pages }, (_, i) => i + 1);
    const out = [1];
    const left = Math.max(2, current - 1);
    const right = Math.min(pages - 1, current + 1);
    if (left > 2)
        out.push('jump-prev');
    for (let i = left; i <= right; i++)
        out.push(i);
    if (right < pages - 1)
        out.push('jump-next');
    out.push(pages);
    return out;
}
/** 单个可悬停单元：数字 / 箭头 / 省略号共用。悬停仅对可点（非禁用）单元生效。 */
function Cell(props) {
    const { box, font, token, active, disabled, ellipsis, bordered = true, onPress, render } = props;
    const [hover, setHover] = react_1.default.useState(false);
    const style = {
        minWidth: box,
        height: box,
        borderRadius: token.borderRadius,
        borderWidth: bordered ? token.lineWidth : 0,
        borderColor: active ? token.colorPrimary : token.colorBorderSecondary,
        alignItems: 'center',
        justifyContent: 'center',
        marginHorizontal: token.marginXXS / 2,
        paddingHorizontal: token.paddingXXS,
        backgroundColor: token.colorBgContainer,
    };
    const color = ellipsis
        ? token.colorTextTertiary
        : disabled
            ? token.colorTextQuaternary
            : active
                ? token.colorPrimary
                : hover
                    ? token.colorPrimary
                    : token.colorText;
    const content = render(color);
    if (!onPress || disabled) {
        // 禁用单元（如首尾页的prev/next）以普通 View 渲染无 press 处理，findCursor 会落到 default；
        // 显式补 not-allowed，与「禁用即不可点」的其余控件一致。省略号（无 onPress 且非禁用）保持 default。
        return react_1.default.createElement(components_1.View, { style: [style, { cursor: disabled ? 'not-allowed' : 'default' }] }, content);
    }
    return (react_1.default.createElement(components_1.Pressable, { onPress: onPress, onMouseEnter: () => setHover(true), onMouseLeave: () => setHover(false), style: style }, content));
}
function Pagination(props) {
    const { token } = (0, theme_1.useToken)();
    const { current, defaultCurrent = 1, total = 0, pageSize, defaultPageSize = 10, onChange, simple, disabled, size = 'default', hideOnSinglePage, showTotal, itemRender, style, } = props;
    const [inner, setInner] = react_1.default.useState(current ?? defaultCurrent);
    const active = current ?? inner;
    const ps = pageSize ?? defaultPageSize;
    const pages = Math.max(1, Math.ceil(total / ps));
    function go(p) {
        if (disabled)
            return;
        const np = Math.min(Math.max(1, p), pages);
        if (np === active)
            return;
        if (current === undefined)
            setInner(np);
        onChange && onChange(np, ps);
    }
    if (hideOnSinglePage && pages <= 1)
        return react_1.default.createElement(components_1.View, null);
    const box = size === 'small' ? token.controlHeightSM : token.controlHeight;
    const font = size === 'small' ? token.fontSizeSM : token.fontSize;
    const totalNode = showTotal ? (react_1.default.createElement(components_1.Text, { style: { fontSize: font, color: token.colorTextSecondary, marginHorizontal: token.marginXS } }, showTotal(total, [Math.max(0, (active - 1) * ps + 1), Math.min(active * ps, total)]))) : null;
    // itemRender 存在时，用其产出的自定义节点替换默认单元，外层再包一层可点容器
    const wrap = (page, type, defaultNode, onPress) => {
        if (!itemRender)
            return defaultNode;
        const custom = itemRender(page, type, defaultNode);
        return (react_1.default.createElement(components_1.Pressable, { key: type + page, disabled: disabled, onPress: onPress, style: { marginHorizontal: token.marginXXS / 2 } },
            react_1.default.createElement(react_1.default.Fragment, null, custom)));
    };
    const arrow = (dir) => {
        const p = dir === 'prev' ? active - 1 : active + 1;
        const dis = disabled || (dir === 'prev' ? active <= 1 : active >= pages);
        const node = (react_1.default.createElement(Cell, { key: dir, box: box, font: font, token: token, disabled: disabled, onPress: dis ? undefined : () => go(p), render: (c) => (react_1.default.createElement(icon_1.Icon, { name: dir === 'prev' ? 'left' : 'right', size: font, color: dis ? token.colorTextQuaternary : c, strokeWidth: 2.5 })) }));
        return wrap(p, dir, node, dis ? undefined : () => go(p));
    };
    if (simple) {
        return (react_1.default.createElement(components_1.View, { style: [{ flexDirection: 'row', alignItems: 'center' }, style] },
            totalNode,
            arrow('prev'),
            react_1.default.createElement(components_1.Text, { style: { fontSize: font, color: token.colorText, marginHorizontal: token.marginXS } },
                active,
                " / ",
                pages),
            arrow('next')));
    }
    return (react_1.default.createElement(components_1.View, { style: [{ flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap' }, style] },
        totalNode,
        arrow('prev'),
        pageItems(active, pages).map((p, i) => typeof p === 'number' ? (react_1.default.createElement(react_1.default.Fragment, { key: 'p' + p }, wrap(p, 'page', react_1.default.createElement(Cell, { box: box, font: font, token: token, active: p === active, disabled: disabled, onPress: () => go(p), render: (c) => (react_1.default.createElement(components_1.Text, { style: { fontSize: font, fontWeight: p === active ? '600' : '400', color: c } }, p)) }), () => go(p)))) : (react_1.default.createElement(react_1.default.Fragment, { key: 'e' + i }, wrap(0, p, react_1.default.createElement(Cell, { box: box, font: font, token: token, ellipsis: true, bordered: false, render: (c) => react_1.default.createElement(components_1.Text, { style: { fontSize: font, color: c, letterSpacing: 1 } }, "\u2022\u2022\u2022") }))))),
        arrow('next')));
}
exports.default = Pagination;
