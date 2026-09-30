"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Flex = Flex;
// Flex：弹性布局容器，参考 antd v5 Flex。justify/align/gap/wrap 直接映射到 flexbox。
// gap 走 token（'small'|'middle'|'large' 或数字）。纯布局，无自绘。
const react_1 = __importDefault(require("react"));
const components_1 = require("../../components");
const theme_1 = require("../../theme");
function Flex(props) {
    const { token } = (0, theme_1.useToken)();
    const { children, vertical, wrap, justify, align, flex, gap, style } = props;
    const gapValue = (g) => typeof g === 'number' ? g : g === 'large' ? token.marginLG : g === 'middle' ? token.margin : token.marginSM;
    let gapStyle = {};
    if (gap != null) {
        if (Array.isArray(gap)) {
            gapStyle = { rowGap: gapValue(gap[0]), columnGap: gapValue(gap[1]) };
        }
        else {
            gapStyle = { gap: gapValue(gap) };
        }
    }
    return (react_1.default.createElement(components_1.View, { style: [
            {
                flexDirection: vertical ? 'column' : 'row',
                justifyContent: justify,
                alignItems: align,
                flexWrap: wrap,
                flex: flex,
                ...gapStyle,
            },
            style,
        ] }, children));
}
exports.default = Flex;
