"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Anchor = Anchor;
// Anchor：侧边锚点导航。竖线 + 条目缩进，activeHref 高亮并让圆点凸出。
// 管线里没有 DOM scrollIntoView，滚动定位由外层受控 scrollY 完成（onLinkClick 给出目标偏移）。
const react_1 = __importDefault(require("react"));
const components_1 = require("../../components");
const theme_1 = require("../../theme");
function Anchor(props) {
    const { token } = (0, theme_1.useToken)();
    const { items, activeHref, onLinkClick, onChange, title, showLine = true, style } = props;
    const handleClick = (href) => {
        onLinkClick?.(href);
        onChange?.(href);
    };
    const renderItem = (link, depth) => {
        const active = link.href === activeHref;
        return (react_1.default.createElement(components_1.View, { key: link.href },
            react_1.default.createElement(components_1.Pressable, { onPress: () => handleClick(link.href), style: {
                    flexDirection: 'row',
                    alignItems: 'center',
                    paddingVertical: token.paddingXXS / 2 + 2,
                    paddingLeft: depth === 0 ? 0 : token.paddingSM + token.paddingXS,
                } },
                react_1.default.createElement(components_1.View, { style: {
                        width: 4,
                        height: 4,
                        borderRadius: 2,
                        backgroundColor: active ? token.colorPrimary : 'transparent',
                        borderWidth: token.lineWidth,
                        borderColor: active ? token.colorPrimary : token.colorSplit,
                        marginRight: token.marginXS,
                    } }),
                react_1.default.createElement(components_1.Text, { style: {
                        fontSize: token.fontSize,
                        color: active ? token.colorPrimary : token.colorTextSecondary,
                        fontWeight: active ? '500' : '400',
                    } }, link.title)),
            link.children ? link.children.map((c) => renderItem(c, depth + 1)) : null));
    };
    return (react_1.default.createElement(components_1.View, { style: [{ flexDirection: 'column' }, style] },
        title ? (react_1.default.createElement(components_1.Text, { style: {
                fontSize: token.fontSizeSM,
                color: token.colorTextTertiary,
                marginBottom: token.marginXS,
                paddingLeft: token.marginXS / 2,
            } }, title)) : null,
        react_1.default.createElement(components_1.View, { style: { flexDirection: 'row', alignItems: 'flex-start' } },
            showLine ? (react_1.default.createElement(components_1.View, { style: {
                    width: token.lineWidth * 2,
                    alignSelf: 'stretch',
                    backgroundColor: token.colorSplit,
                    marginHorizontal: token.marginXS / 2,
                } })) : null,
            react_1.default.createElement(components_1.View, { style: { flex: 1 } }, items.map((l) => renderItem(l, 0))))));
}
exports.default = Anchor;
