"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.List = void 0;
// List：数据列表。header / footer / 分隔线 / 斑马可选，loading 复用 Spin。
// 参考 antd v5：dataSource + renderItem；List.Item 复合组件支持 actions / extra / itemLayout。
const react_1 = __importDefault(require("react"));
const components_1 = require("../../components");
const theme_1 = require("../../theme");
const spin_1 = require("../spin");
const ListContext = react_1.default.createContext({ itemLayout: 'vertical' });
function ListItem(props) {
    const { token } = (0, theme_1.useToken)();
    const { children, actions, extra, style } = props;
    const { itemLayout } = react_1.default.useContext(ListContext);
    const horizontal = itemLayout === 'horizontal';
    const content = (react_1.default.createElement(components_1.View, { style: { flex: 1 } },
        children,
        actions && actions.length ? (react_1.default.createElement(components_1.View, { style: { flexDirection: 'row', alignItems: 'center', marginTop: token.marginXS } }, actions.map((a, i) => (react_1.default.createElement(react_1.default.Fragment, { key: i },
            i > 0 ? (react_1.default.createElement(components_1.View, { style: { width: token.lineWidth, height: token.fontSize, backgroundColor: token.colorSplit, marginHorizontal: token.marginSM } })) : null,
            react_1.default.createElement(components_1.View, null, typeof a === 'string' ? react_1.default.createElement(components_1.Text, { style: { fontSize: token.fontSize, color: token.colorTextSecondary } }, a) : a)))))) : null));
    if (horizontal) {
        return (react_1.default.createElement(components_1.View, { style: [{ flexDirection: 'row', alignItems: 'flex-start' }, style] },
            content,
            extra != null ? react_1.default.createElement(components_1.View, { style: { marginLeft: token.margin } }, extra) : null));
    }
    return (react_1.default.createElement(components_1.View, { style: style },
        content,
        extra != null ? react_1.default.createElement(components_1.View, { style: { marginTop: token.marginSM } }, extra) : null));
}
function ListBase(props) {
    const { token } = (0, theme_1.useToken)();
    const { dataSource = [], renderItem, header, footer, bordered = false, split = true, size = 'default', loading = false, itemLayout = 'vertical', loadMore, style, } = props;
    const pad = size === 'small' ? token.paddingXS : size === 'large' ? token.padding : token.paddingSM;
    return (react_1.default.createElement(components_1.View, { style: [
            {
                backgroundColor: token.colorBgContainer,
                borderRadius: token.borderRadiusLG,
                borderWidth: bordered ? token.lineWidth : 0,
                borderColor: token.colorBorderSecondary,
                overflow: 'hidden',
            },
            style,
        ] },
        header != null ? (react_1.default.createElement(components_1.View, { style: {
                paddingHorizontal: pad,
                paddingVertical: token.paddingXS,
                borderBottomWidth: token.lineWidth,
                borderBottomColor: token.colorBorderSecondary,
            } }, typeof header === 'string' ? (react_1.default.createElement(components_1.Text, { style: { fontSize: token.fontSize, fontWeight: '500', color: token.colorText } }, header)) : (header))) : null,
        react_1.default.createElement(spin_1.Spin, { spinning: loading },
            react_1.default.createElement(ListContext.Provider, { value: { itemLayout } }, dataSource.map((item, i) => (react_1.default.createElement(components_1.View, { key: i, style: {
                    paddingHorizontal: pad,
                    paddingVertical: pad,
                    borderBottomWidth: split && i < dataSource.length - 1 ? token.lineWidth : 0,
                    borderBottomColor: token.colorSplit,
                } }, renderItem ? renderItem(item, i) : null))))),
        loadMore != null ? react_1.default.createElement(components_1.View, { style: { padding: pad } }, loadMore) : null,
        footer != null ? (react_1.default.createElement(components_1.View, { style: {
                paddingHorizontal: pad,
                paddingVertical: token.paddingXS,
                borderTopWidth: token.lineWidth,
                borderTopColor: token.colorBorderSecondary,
                backgroundColor: token.colorFillQuaternary,
            } }, footer)) : null));
}
exports.List = Object.assign(ListBase, { Item: ListItem });
exports.default = exports.List;
