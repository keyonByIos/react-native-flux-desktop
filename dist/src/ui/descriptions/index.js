"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Descriptions = Descriptions;
// Descriptions：标题 + 一组 label/value。按 column 分栏，item.span 让某项跨多列。
const react_1 = __importDefault(require("react"));
const components_1 = require("../../components");
const theme_1 = require("../../theme");
function Descriptions(props) {
    const { token, getComponentToken } = (0, theme_1.useToken)();
    const ct = getComponentToken('Descriptions');
    const { title, extra, items = [], column = 2, bordered, layout = 'horizontal', size = 'default', colon = true, children, style, } = props;
    const vertical = layout === 'vertical';
    // children 是否为纯文本节点：字符串/数字塞进 <Text> 拿字号字色；React 元素/数组交给容器直接渲染，
    // 否则把 View/Pressable 嵌进 <Text> 会按单行文本测量，导致溢出重叠、被裁。
    const isPlain = (c) => typeof c === 'string' || typeof c === 'number';
    // size 收缩 bordered 单格纵向内边距
    const padBlock = size === 'small' ? 0 : size === 'middle' ? ct.cellPaddingBlock / 2 : ct.cellPaddingBlock;
    const padInline = size === 'small' ? ct.cellPaddingInline / 2 : ct.cellPaddingInline;
    // bordered 态需要按 span 累计分组成行（表格语义：每行 label|content 交替铺满整行）
    const rows = [];
    if (bordered) {
        let cur = [];
        let used = 0;
        for (const it of items) {
            const sp = Math.min(it.span ?? 1, column);
            if (used + sp > column && cur.length) {
                rows.push(cur);
                cur = [];
                used = 0;
            }
            cur.push(it);
            used += sp;
            if (used >= column) {
                rows.push(cur);
                cur = [];
                used = 0;
            }
        }
        if (cur.length)
            rows.push(cur);
    }
    // 非 bordered 单元格：horizontal 同行 / vertical 上下
    const plainCell = (it, i) => {
        const span = Math.min(it.span ?? 1, column);
        if (!vertical) {
            return (react_1.default.createElement(components_1.View, { key: it.key ?? i, style: {
                    width: `${(span / column) * 100}%`,
                    flexDirection: 'row',
                    paddingRight: token.paddingSM,
                    paddingBottom: ct.itemPaddingBottom,
                } },
                react_1.default.createElement(components_1.Text, { style: { fontSize: token.fontSize, color: ct.labelColor, marginRight: token.marginXS } }, it.label),
                isPlain(it.children) ? (react_1.default.createElement(components_1.Text, { style: { fontSize: token.fontSize, color: ct.contentColor, flex: 1 } },
                    colon ? '：' : '',
                    it.children)) : (react_1.default.createElement(components_1.View, { style: { flex: 1, flexDirection: 'row', alignItems: 'center' } },
                    colon ? react_1.default.createElement(components_1.Text, { style: { fontSize: token.fontSize, color: ct.contentColor } }, "\uFF1A") : null,
                    it.children))));
        }
        return (react_1.default.createElement(components_1.View, { key: it.key ?? i, style: {
                width: `${(span / column) * 100}%`,
                paddingRight: token.paddingSM,
                paddingBottom: ct.itemPaddingBottom,
            } },
            react_1.default.createElement(components_1.Text, { style: { fontSize: token.fontSize, color: ct.labelColor, marginBottom: token.marginXXS } }, it.label),
            isPlain(it.children) ? (react_1.default.createElement(components_1.Text, { style: { fontSize: token.fontSize, color: ct.contentColor } }, it.children)) : (react_1.default.createElement(components_1.View, { style: { flexDirection: 'row', alignItems: 'center' } }, it.children))));
    };
    // bordered 水平：label 格 + content 格
    const hLabel = (it, span, key) => (react_1.default.createElement(components_1.View, { key: `l-${key}`, style: {
            flexGrow: span,
            flexBasis: '0%',
            alignItems: 'center',
            backgroundColor: ct.labelBg,
            paddingHorizontal: padInline,
            paddingVertical: padBlock,
            borderRightWidth: token.lineWidth,
            borderRightColor: token.colorBorderSecondary,
        } },
        react_1.default.createElement(components_1.Text, { style: { fontSize: token.fontSize, color: ct.labelColor } }, it.label)));
    const hContent = (it, span, key) => (react_1.default.createElement(components_1.View, { key: `c-${key}`, style: {
            flexGrow: span,
            flexBasis: '0%',
            alignItems: 'center',
            paddingHorizontal: padInline,
            paddingVertical: padBlock,
            backgroundColor: token.colorBgContainer,
        } }, isPlain(it.children) ? (react_1.default.createElement(components_1.Text, { style: { fontSize: token.fontSize, color: ct.contentColor } }, it.children)) : (it.children)));
    const body = !bordered
        ? items.map(plainCell)
        : vertical
            ? // 垂直带框：每行 = 标签带 + 内容带
                rows.map((row, ri) => (react_1.default.createElement(components_1.View, { key: ri, style: { width: '100%', borderBottomWidth: token.lineWidth, borderBottomColor: token.colorBorderSecondary } },
                    react_1.default.createElement(components_1.View, { style: { width: '100%', flexDirection: 'row' } }, row.map((it, ci) => {
                        const span = Math.min(it.span ?? 1, column);
                        return (react_1.default.createElement(components_1.View, { key: it.key ?? ci, style: {
                                flexGrow: span,
                                flexBasis: '0%',
                                alignItems: 'center',
                                backgroundColor: ct.labelBg,
                                paddingHorizontal: padInline,
                                paddingVertical: padBlock,
                                borderRightWidth: ci < row.length - 1 ? token.lineWidth : 0,
                                borderRightColor: token.colorBorderSecondary,
                            } },
                            react_1.default.createElement(components_1.Text, { style: { fontSize: token.fontSize, color: ct.labelColor } }, it.label)));
                    })),
                    react_1.default.createElement(components_1.View, { style: { width: '100%', flexDirection: 'row' } }, row.map((it, ci) => {
                        const span = Math.min(it.span ?? 1, column);
                        return (react_1.default.createElement(components_1.View, { key: it.key ?? ci, style: {
                                flexGrow: span,
                                flexBasis: '0%',
                                alignItems: 'center',
                                paddingHorizontal: padInline,
                                paddingVertical: padBlock,
                                backgroundColor: token.colorBgContainer,
                                borderRightWidth: ci < row.length - 1 ? token.lineWidth : 0,
                                borderRightColor: token.colorBorderSecondary,
                            } }, isPlain(it.children) ? (react_1.default.createElement(components_1.Text, { style: { fontSize: token.fontSize, color: ct.contentColor } }, it.children)) : (it.children)));
                    })))))
            : rows.map((row, ri) => (react_1.default.createElement(components_1.View, { key: ri, style: {
                    width: '100%',
                    flexDirection: 'row',
                    borderBottomWidth: token.lineWidth,
                    borderBottomColor: token.colorBorderSecondary,
                } }, row.map((it, ci) => {
                const span = Math.min(it.span ?? 1, column);
                const key = it.key ?? ci;
                return (react_1.default.createElement(react_1.default.Fragment, { key: key },
                    hLabel(it, span, key),
                    hContent(it, span, key)));
            }))));
    const showHeader = title != null || extra != null;
    return (react_1.default.createElement(components_1.View, { style: style },
        showHeader ? (react_1.default.createElement(components_1.View, { style: { flexDirection: 'row', alignItems: 'center', marginBottom: token.margin } },
            react_1.default.createElement(components_1.Text, { style: { flex: 1, fontSize: ct.titleFontSize, fontWeight: '500', color: token.colorText } }, title),
            extra != null ? react_1.default.createElement(components_1.View, null, extra) : null)) : null,
        react_1.default.createElement(components_1.View, { style: {
                flexDirection: 'row',
                flexWrap: 'wrap',
                borderWidth: bordered ? token.lineWidth : 0,
                borderColor: token.colorBorderSecondary,
                borderRadius: bordered ? ct.borderRadius : 0,
                backgroundColor: bordered ? token.colorBgContainer : 'transparent',
                overflow: 'hidden',
            } },
            body,
            children)));
}
