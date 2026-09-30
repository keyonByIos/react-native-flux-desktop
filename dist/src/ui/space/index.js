"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Space = Space;
// Space：靠 Yoga 的 gap 实现，不额外包一层盒子。
const react_1 = __importDefault(require("react"));
const components_1 = require("../../components");
const theme_1 = require("../../theme");
function resolve(size, token) {
    if (typeof size === 'number')
        return size;
    if (size === 'small')
        return token.marginXS;
    if (size === 'large')
        return token.marginLG;
    return token.margin;
}
function Space(props) {
    const { token } = (0, theme_1.useToken)();
    const { direction = 'horizontal', size = 'small', align, wrap, split, block, children, style } = props;
    const [rowGap, colGap] = Array.isArray(size) ? size : [size, size];
    const alignMap = { start: 'flex-start', end: 'flex-end', center: 'center', baseline: 'baseline' };
    // 有 split 时把分隔符穿插进子项之间（无 split 保持 children 直渲染、纯 gap 不包盒）
    let content = children;
    if (split != null) {
        const items = react_1.default.Children.toArray(children);
        const arr = [];
        items.forEach((c, i) => {
            arr.push(react_1.default.createElement(react_1.default.Fragment, { key: `i${i}` }, c));
            if (i < items.length - 1)
                arr.push(react_1.default.createElement(react_1.default.Fragment, { key: `s${i}` }, split));
        });
        content = arr;
    }
    return (react_1.default.createElement(components_1.View, { style: [
            {
                flexDirection: direction === 'vertical' ? 'column' : 'row',
                gap: resolve(rowGap, token),
                flexWrap: wrap ? 'wrap' : 'nowrap',
            },
            align ? { alignItems: alignMap[align] } : null,
            wrap ? { columnGap: resolve(colGap, token) } : null,
            block ? { width: '100%' } : null,
            style,
        ] }, content));
}
