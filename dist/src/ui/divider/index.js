"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Divider = Divider;
// Divider：全部尺寸与颜色都来自 token，组件里不出现任何字面量像素。
const react_1 = __importDefault(require("react"));
const components_1 = require("../../components");
const theme_1 = require("../../theme");
function Divider(props) {
    const { token } = (0, theme_1.useToken)();
    const { type = 'horizontal', variant, dashed, plain, children, orientation = 'center', style } = props;
    const vertical = type === 'vertical';
    // variant 优先，回退旧版 dashed 布尔
    const line = variant ?? (dashed ? 'dashed' : 'solid');
    const seg = (grow, side) => (react_1.default.createElement(components_1.View, { style: [
            vertical
                ? { width: 0, borderWidth: token.lineWidth, alignSelf: 'stretch', marginHorizontal: token.marginXS }
                : { flex: grow, height: 0, borderTopWidth: token.lineWidth },
            {
                borderColor: token.colorSplit,
                borderStyle: line,
                backgroundColor: line === 'solid' ? token.colorSplit : undefined,
            },
        ], key: side }));
    if (!children) {
        return (react_1.default.createElement(components_1.View, { style: [
                vertical
                    ? { flexDirection: 'row', alignSelf: 'stretch' }
                    : { marginVertical: token.margin },
                style,
            ] }, seg(1, 'only')));
    }
    const before = orientation === 'left' ? 0.02 : 1;
    const after = orientation === 'right' ? 0.02 : 1;
    return (react_1.default.createElement(components_1.View, { style: [{ flexDirection: 'row', alignItems: 'center', marginVertical: token.margin }, style] },
        seg(before, 'before'),
        react_1.default.createElement(components_1.Text, { style: {
                marginHorizontal: token.paddingXS,
                fontSize: token.fontSize,
                fontWeight: plain ? '400' : '500',
                color: token.colorText,
            } }, children),
        seg(after, 'after')));
}
