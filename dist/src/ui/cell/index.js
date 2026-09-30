"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Cell = Cell;
// Cell：列表项。左图标+标题+描述、右 extra+箭头，几何取自 Cell 组件 token。
const react_1 = __importDefault(require("react"));
const components_1 = require("../../components");
const theme_1 = require("../../theme");
const icon_1 = require("../icon");
function Cell(props) {
    const { token, getComponentToken } = (0, theme_1.useToken)();
    const ct = getComponentToken('Cell');
    const { title, description, icon, extra, arrow, clickable, disabled, onClick, onPress, bordered = true, children, style } = props;
    const fire = onClick ?? onPress;
    const [pressed, setPressed] = react_1.default.useState(false);
    const titleColor = disabled ? token.colorTextQuaternary : token.colorText;
    const shell = {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: ct.paddingBlock,
        paddingHorizontal: ct.paddingInline,
        borderBottomWidth: bordered ? token.lineWidth : 0,
        borderBottomColor: token.colorBorderSecondary,
        backgroundColor: pressed && !disabled ? ct.activeBg : 'transparent',
    };
    const lead = icon != null ? (react_1.default.createElement(components_1.View, { style: { marginRight: token.marginSM } }, typeof icon === 'string' ? react_1.default.createElement(icon_1.Icon, { name: icon, size: token.fontSizeLG, color: titleColor }) : icon)) : null;
    const body = (react_1.default.createElement(components_1.View, { style: { flex: 1, marginRight: token.marginSM } },
        title != null ? (react_1.default.createElement(components_1.Text, { style: { fontSize: token.fontSize, color: titleColor } }, title)) : null,
        description != null ? (react_1.default.createElement(components_1.Text, { style: {
                fontSize: ct.fontSizeDesc,
                lineHeight: ct.fontSizeDesc * 1.5,
                color: ct.descriptionColor,
                marginTop: token.marginXXS,
            } }, description)) : null,
        children));
    const tail = extra != null || arrow ? (react_1.default.createElement(components_1.View, { style: { flexDirection: 'row', alignItems: 'center' } },
        extra != null ? (typeof extra === 'string' ? (react_1.default.createElement(components_1.Text, { style: { fontSize: token.fontSize, color: token.colorTextTertiary } }, extra)) : (extra)) : null,
        arrow ? (react_1.default.createElement(components_1.View, { style: { marginLeft: token.marginXS } },
            react_1.default.createElement(icon_1.Icon, { name: "right", size: token.fontSize, color: token.colorTextQuaternary, strokeWidth: 2.5 }))) : null)) : null;
    if ((!fire && !clickable) || disabled) {
        // 禁用单元以普通 View 渲染无 press 处理，findCursor 落到 default；显式补 not-allowed。
        return (react_1.default.createElement(components_1.View, { style: [shell, disabled ? { cursor: 'not-allowed' } : null, style] },
            lead,
            body,
            tail));
    }
    return (react_1.default.createElement(components_1.Pressable, { onPress: fire, onPressIn: () => setPressed(true), onPressOut: () => setPressed(false), style: [shell, style] },
        lead,
        body,
        tail));
}
