"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Masonry = Masonry;
// Masonry：瀑布流。按「最短列优先」把条目分配到 N 列（依赖条目 height，无需运行时测量），
// 渲染为 N 个纵向列 flex 容器，列间 columnGap、列内 rowGap。纯 flex 布局，无自绘。
const react_1 = __importDefault(require("react"));
const components_1 = require("../../components");
const theme_1 = require("../../theme");
function Masonry(props) {
    const { token } = (0, theme_1.useToken)();
    const { data, columns = 4, gutter = 'middle', renderItem, style } = props;
    const gv = (g) => typeof g === 'number'
        ? g
        : g === 'large'
            ? token.marginLG
            : g === 'middle'
                ? token.margin
                : token.marginSM;
    const [hGap, vGap] = Array.isArray(gutter) ? [gv(gutter[0]), gv(gutter[1])] : [gv(gutter), gv(gutter)];
    // 最短列优先：逐条放进当前累计高度最矮的列
    const cols = Array.from({ length: Math.max(1, columns) }, () => []);
    const heights = new Array(Math.max(1, columns)).fill(0);
    data.forEach((item, i) => {
        let target = 0;
        for (let c = 1; c < columns; c++)
            if (heights[c] < heights[target])
                target = c;
        cols[target].push(react_1.default.createElement(components_1.View, { key: item.key ?? i, style: { height: item.height } }, renderItem(item, i)));
        heights[target] += item.height + vGap;
    });
    return (react_1.default.createElement(components_1.View, { style: [{ flexDirection: 'row', columnGap: hGap }, style] }, cols.map((col, ci) => (react_1.default.createElement(components_1.View, { key: ci, style: { flex: 1, rowGap: vGap } }, col)))));
}
exports.default = Masonry;
