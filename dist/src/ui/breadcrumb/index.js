"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Breadcrumb = Breadcrumb;
// Breadcrumb：参考 antd v5 items。末项为当前页（colorText、不可点），其余可点，中间放分隔符。
// 扩展：item.separator 覆盖全局分隔符；itemRender + params 自定义节点渲染；可点项按压高亮主色。
const react_1 = __importDefault(require("react"));
const components_1 = require("../../components");
const theme_1 = require("../../theme");
function Breadcrumb(props) {
    const { token } = (0, theme_1.useToken)();
    const { items, separator = '/', itemRender, params = {}, style } = props;
    return (react_1.default.createElement(components_1.View, { style: [{ flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap' }, style] }, items.map((it, i) => {
        const last = i === items.length - 1;
        const clickable = !last && (it.onClick != null || it.href != null);
        const sep = it.separator != null ? it.separator : separator;
        const isPlain = (c) => typeof c === 'string' || typeof c === 'number';
        let node;
        if (itemRender) {
            node = itemRender(it, params, items, i);
        }
        else if (clickable) {
            node = (react_1.default.createElement(components_1.Pressable, { onPress: () => it.onClick && it.onClick() }, ({ pressed }) => isPlain(it.title) ? (react_1.default.createElement(components_1.Text, { style: { fontSize: token.fontSize, color: pressed ? token.colorPrimary : token.colorTextSecondary } }, it.title)) : (it.title)));
        }
        else {
            node = isPlain(it.title) ? (react_1.default.createElement(components_1.Text, { style: { fontSize: token.fontSize, color: last ? token.colorText : token.colorTextSecondary } }, it.title)) : (it.title);
        }
        return (react_1.default.createElement(components_1.View, { key: i, style: { flexDirection: 'row', alignItems: 'center' } },
            node,
            !last ? (react_1.default.createElement(components_1.Text, { style: { fontSize: token.fontSize, color: token.colorTextQuaternary, marginHorizontal: token.marginXXS } }, sep)) : null));
    })));
}
exports.default = Breadcrumb;
