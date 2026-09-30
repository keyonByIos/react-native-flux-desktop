"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Row = Row;
exports.Col = Col;
// Grid：24 栏栅格，参考 antd Row/Col。Col 的 span 按 1/24 折算成弹性占比，
// Row 提供横/纵间距 gutter（走 token 或数字，支持 [水平, 垂直] 元组）。纯 flex 布局，无自绘。
const react_1 = __importDefault(require("react"));
const components_1 = require("../../components");
const theme_1 = require("../../theme");
/** justify：兼容 antd 关键字（start/end）与 CSS flexbox 值 */
const JUSTIFY = {
    start: 'flex-start',
    end: 'flex-end',
    center: 'center',
    'flex-start': 'flex-start',
    'flex-end': 'flex-end',
    'space-between': 'space-between',
    'space-around': 'space-around',
    'space-evenly': 'space-evenly',
};
/** align：兼容 antd 关键字（top/middle/bottom）与 CSS flexbox 值 */
const ALIGN = {
    top: 'flex-start',
    middle: 'center',
    bottom: 'flex-end',
    stretch: 'stretch',
    start: 'flex-start',
    center: 'center',
    end: 'flex-end',
    'flex-start': 'flex-start',
    'flex-end': 'flex-end',
};
function Row(props) {
    const { token } = (0, theme_1.useToken)();
    const { children, gutter, wrap = true, justify, align, style } = props;
    const gapVal = (g) => typeof g === 'number'
        ? g
        : g === 'large'
            ? token.marginLG
            : g === 'middle'
                ? token.margin
                : token.marginSM;
    const [cg, rg] = Array.isArray(gutter) ? [gapVal(gutter[0]), gapVal(gutter[1])] : [gapVal(gutter ?? 0), gapVal(gutter ?? 0)];
    return (react_1.default.createElement(components_1.View, { style: [
            {
                flexDirection: 'row',
                flexWrap: wrap ? 'wrap' : 'nowrap',
                justifyContent: justify ? JUSTIFY[justify] : undefined,
                alignItems: align ? ALIGN[align] : undefined,
                columnGap: cg,
                rowGap: rg,
            },
            style,
        ] }, children));
}
function Col(props) {
    const { children, span = 24, offset = 0, flex, style } = props;
    // 用 flexGrow 按 span 比例分配剩余空间，天然兼容 Row 的 gap，无需减像素
    const marginLeft = offset > 0 ? `${(offset / 24) * 100}%` : undefined;
    let flexStyle;
    if (flex === 'auto')
        flexStyle = { flexGrow: 1, flexShrink: 1, flexBasis: 'auto' };
    else if (typeof flex === 'number')
        flexStyle = { flexGrow: flex, flexShrink: 1, flexBasis: 0 };
    else
        flexStyle = { flexGrow: span, flexBasis: '0%' };
    return react_1.default.createElement(components_1.View, { style: [flexStyle, { marginLeft }, style] }, children);
}
exports.default = Row;
