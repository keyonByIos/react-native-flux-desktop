"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Timeline = Timeline;
// Timeline：竖向时间轴。每项「圆点/自定义节点 + 连接线」+ 内容；末项不画连接线。
// 对齐 antd v5：mode（left / right / alternate）、item.dot（自定义节点）、item.label（备选/标签）、reverse。
const react_1 = __importDefault(require("react"));
const components_1 = require("../../components");
const theme_1 = require("../../theme");
function Timeline(props) {
    const { token, getComponentToken } = (0, theme_1.useToken)();
    const ct = getComponentToken('Timeline');
    const { items = [], mode = 'left', pending, reverse, children, style } = props;
    const dot = 10;
    const rail = 24;
    const resolve = (c) => {
        switch (c) {
            case 'green':
                return token.colorSuccess;
            case 'red':
                return token.colorError;
            case 'blue':
                return token.colorPrimary;
            case 'gray':
                return token.colorTextQuaternary;
            default:
                return c ?? token.colorPrimary;
        }
    };
    // 轴线列（圆点 / 自定义节点 + 连接线）
    const railCol = (it, last) => (react_1.default.createElement(components_1.View, { style: { width: rail, alignItems: 'center' } },
        it.dot != null ? (react_1.default.createElement(components_1.View, { style: { alignItems: 'center', justifyContent: 'center', minHeight: dot, marginTop: (ct.fontSize * token.lineHeight - dot) / 2 } }, it.dot)) : (react_1.default.createElement(components_1.View, { style: {
                width: dot,
                height: dot,
                borderRadius: dot / 2,
                marginTop: (ct.fontSize * token.lineHeight - dot) / 2,
                borderWidth: token.lineWidth,
                borderColor: resolve(it.color),
                backgroundColor: token.colorBgContainer,
            } })),
        !last ? react_1.default.createElement(components_1.View, { style: { width: token.lineWidth * 2, marginTop: token.marginXXS, flex: 1, backgroundColor: token.colorBorderSecondary } }) : null));
    const labelStyle = { fontSize: ct.fontSize, color: token.colorTextTertiary };
    // left / right 双列：rail + content
    const renderSide = (it, i, last) => {
        const right = mode === 'right';
        const body = (react_1.default.createElement(components_1.View, { style: { flex: 1, paddingBottom: last ? 0 : token.marginLG } },
            it.label != null ? react_1.default.createElement(components_1.View, { style: { marginBottom: token.marginXXS } },
                react_1.default.createElement(components_1.Text, { style: labelStyle }, it.label)) : null,
            react_1.default.createElement(components_1.View, null, it.children ?? it.content)));
        return (react_1.default.createElement(components_1.View, { key: it.key ?? i, style: { flexDirection: right ? 'row-reverse' : 'row', alignItems: 'stretch' } },
            railCol(it, last),
            body));
    };
    // alternate 三列：左格 | rail | 右格
    const renderAlternate = (it, i, last) => {
        const onLeft = it.position ? it.position === 'left' : i % 2 === 0;
        const content = react_1.default.createElement(components_1.View, null, it.children ?? it.content);
        const label = it.label != null ? react_1.default.createElement(components_1.Text, { style: labelStyle }, it.label) : null;
        return (react_1.default.createElement(components_1.View, { key: it.key ?? i, style: { flexDirection: 'row', alignItems: 'stretch' } },
            react_1.default.createElement(components_1.View, { style: { flex: 1, alignItems: 'flex-end', paddingRight: token.padding, paddingBottom: last ? 0 : token.marginLG } }, onLeft ? content : label),
            railCol(it, last),
            react_1.default.createElement(components_1.View, { style: { flex: 1, paddingLeft: token.padding, paddingBottom: last ? 0 : token.marginLG } }, onLeft ? label : content)));
    };
    let all = children ? [...items, { children }] : items.slice();
    if (reverse)
        all = all.slice().reverse();
    const pendingItem = pending != null && pending !== false ? { children: pending, color: 'gray' } : null;
    const total = all.length + (pendingItem ? 1 : 0);
    const renderItem = (it, i) => {
        const last = i === total - 1;
        return mode === 'alternate' ? renderAlternate(it, i, last) : renderSide(it, i, last);
    };
    return (react_1.default.createElement(components_1.View, { style: style },
        all.map(renderItem),
        pendingItem ? renderItem(pendingItem, all.length) : null));
}
exports.default = Timeline;
