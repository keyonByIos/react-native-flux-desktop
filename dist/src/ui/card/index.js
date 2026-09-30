"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Card = void 0;
exports.CardBase = CardBase;
exports.Meta = Meta;
// Card：cover / header / body / actions 多段，几何取自 Card 组件 token。
// 对齐 antd v5：cover / loading（复用 Skeleton）/ hoverable / type=inner / size / bordered。
const react_1 = __importDefault(require("react"));
const components_1 = require("../../components");
const theme_1 = require("../../theme");
const skeleton_1 = require("../skeleton");
function CardBase(props) {
    const { token, getComponentToken } = (0, theme_1.useToken)();
    const ct = getComponentToken('Card');
    const { title, extra, bordered = true, size = 'default', type, cover, loading, hoverable, actions, children, style, headerStyle, bodyStyle } = props;
    const [hover, setHover] = react_1.default.useState(false);
    const pad = size === 'small' ? token.padding : ct.paddingLG;
    const borderColor = hoverable && hover ? token.colorPrimary : token.colorBorderSecondary;
    const root = (react_1.default.createElement(components_1.View, { style: [
            {
                borderRadius: ct.borderRadiusLG,
                backgroundColor: type === 'inner' ? token.colorFillQuaternary : token.colorBgContainer,
                borderWidth: bordered ? token.lineWidth : 0,
                borderColor,
                overflow: 'hidden',
            },
            // hoverable 时布局 style 交给外层 Pressable，root 只做其行内子项（flex:1 作宽、交叉轴自动拉高）；
            // 否则 flex:1 会落在 root 上、被外层列容器解析成高度 flexBasis:0 → 整卡坐塌
            hoverable ? { flex: 1, minWidth: 0 } : style,
        ] },
        title != null || extra != null ? (react_1.default.createElement(components_1.View, { style: [
                {
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    paddingHorizontal: pad,
                    paddingVertical: size === 'small' ? token.paddingXS : pad,
                    borderBottomWidth: token.lineWidth,
                    borderBottomColor: token.colorBorderSecondary,
                    backgroundColor: ct.headerBg,
                },
                headerStyle,
            ] },
            react_1.default.createElement(components_1.Text, { style: { fontSize: ct.headerFontSize, fontWeight: '500', color: token.colorText } }, title),
            extra != null ? react_1.default.createElement(components_1.View, null, extra) : null)) : null,
        cover != null ? react_1.default.createElement(components_1.View, null, cover) : null,
        react_1.default.createElement(components_1.View, { style: [{ padding: pad }, bodyStyle] }, loading ? react_1.default.createElement(skeleton_1.Skeleton, { active: true, avatar: true, paragraph: 3 }) : children),
        actions && actions.length ? (react_1.default.createElement(components_1.View, { style: {
                flexDirection: 'row',
                borderTopWidth: token.lineWidth,
                borderTopColor: token.colorBorderSecondary,
                backgroundColor: ct.actionsBg,
            } }, actions.map((a, i) => (react_1.default.createElement(components_1.View, { key: i, style: {
                flex: 1,
                alignItems: 'center',
                paddingVertical: token.paddingXS,
                borderLeftWidth: i === 0 ? 0 : token.lineWidth,
                borderLeftColor: token.colorBorderSecondary,
            } }, a))))) : null));
    if (hoverable) {
        // 外层 Pressable 是真正的布局子节点：接 style（flex/width 等）；row 方使 root 交叉轴（高）随拉伸
        return (react_1.default.createElement(components_1.Pressable, { onMouseEnter: () => setHover(true), onMouseLeave: () => setHover(false), style: [{ flexDirection: 'row', flexShrink: 0 }, style] }, root));
    }
    return root;
}
function Meta(props) {
    const { token } = (0, theme_1.useToken)();
    const { avatar, title, description, style } = props;
    return (react_1.default.createElement(components_1.View, { style: [{ flexDirection: 'row', alignItems: 'flex-start' }, style] },
        avatar != null ? react_1.default.createElement(components_1.View, { style: { marginRight: token.margin } }, avatar) : null,
        react_1.default.createElement(components_1.View, { style: { flex: 1 } },
            title != null ? (react_1.default.createElement(components_1.Text, { style: { fontSize: token.fontSizeLG, fontWeight: '500', color: token.colorText } }, title)) : null,
            description != null ? (react_1.default.createElement(components_1.Text, { style: { fontSize: token.fontSizeSM, color: token.colorTextSecondary, marginTop: token.marginXXS } }, description)) : null)));
}
/** Card + Card.Meta 复合导出 */
exports.Card = Object.assign(CardBase, { Meta });
