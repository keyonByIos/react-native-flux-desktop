"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Popconfirm = Popconfirm;
// POPCONFIRM：气泡确认框。复用 Popover 的定位/箭头/浮层门控，内容区固定为「图标+标题+描述 + 取消/确定按钮」。
// 无 portal：面板绝对定位贴触发器。确认/取消后自动收起（受控时回推 open=false）。
const react_1 = __importDefault(require("react"));
const components_1 = require("../../components");
const theme_1 = require("../../theme");
const popover_1 = require("../popover");
const button_1 = require("../button");
const icon_1 = require("../icon");
function Popconfirm(props) {
    const { token } = (0, theme_1.useToken)();
    const { title, description, children, open, placement = 'top', okText = '确定', cancelText = '取消', hideCancel, danger, okButtonLoading, icon, onConfirm, onCancel, onOpenChange, style, } = props;
    const [inner, setInner] = react_1.default.useState(false);
    const show = open !== undefined ? open : inner;
    const setShow = (next) => {
        if (open === undefined)
            setInner(next);
        onOpenChange && onOpenChange(next);
    };
    const confirm = () => {
        onConfirm && onConfirm();
        setShow(false);
    };
    const cancel = () => {
        onCancel && onCancel();
        setShow(false);
    };
    const hasTitle = title != null;
    const headIcon = icon === null ? null : icon != null ? icon : react_1.default.createElement(icon_1.Icon, { name: "exclamationCircle", size: token.fontSize, color: token.colorWarning });
    const content = (react_1.default.createElement(components_1.View, { style: { width: 240 } },
        react_1.default.createElement(components_1.View, { style: { flexDirection: 'row', alignItems: 'flex-start' } },
            headIcon ? react_1.default.createElement(components_1.View, { style: { marginRight: token.marginXS, marginTop: 1 } }, headIcon) : null,
            react_1.default.createElement(components_1.View, { style: { flex: 1 } },
                hasTitle ? (react_1.default.createElement(components_1.Text, { style: { fontSize: token.fontSize, color: token.colorText } }, title)) : null,
                description != null ? (react_1.default.createElement(components_1.Text, { style: {
                        fontSize: token.fontSizeSM,
                        color: token.colorTextSecondary,
                        marginTop: hasTitle ? token.marginXXS : 0,
                    } }, description)) : null)),
        react_1.default.createElement(components_1.View, { style: { flexDirection: 'row', justifyContent: 'flex-end', marginTop: token.margin } },
            hideCancel ? null : (react_1.default.createElement(components_1.View, { style: { marginRight: token.marginXS } },
                react_1.default.createElement(button_1.Button, { size: "small", onPress: cancel }, cancelText))),
            react_1.default.createElement(button_1.Button, { size: "small", type: "primary", danger: danger, loading: okButtonLoading, onPress: confirm }, okText))));
    return (react_1.default.createElement(popover_1.Popover, { open: show, onOpenChange: setShow, placement: placement, arrow: true, trigger: "click", content: content, style: style }, children));
}
exports.default = Popconfirm;
