"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DatePicker = DatePicker;
// DATEPICKER：触发器显示已选日期，点开内联 Calendar 面板选日。
// 复用 Calendar 组件；面板绝对定位覆盖（同 Select），不依赖浮层 z 栈。
// 对齐 antd v5：size（触发器高度）/ status（error/warning 描边）/ placement（四向弹出）/ disabledDate（透传 Calendar）。
const react_1 = __importDefault(require("react"));
const components_1 = require("../../components");
const theme_1 = require("../../theme");
const timezone_1 = require("../../utils/timezone");
const icon_1 = require("../icon");
const calendar_1 = require("../calendar");
const FadeIn_1 = require("../../anim/FadeIn");
const useOverlayGate_1 = require("../../events/useOverlayGate");
function DatePicker(props) {
    const { token } = (0, theme_1.useToken)();
    const timezone = (0, theme_1.useTimezone)();
    const { value, defaultValue, placeholder = '请选择日期', disabled, allowClear, size = 'middle', status, placement = 'bottomLeft', disabledDate, dateCellRender, dateFullCellRender, open, onChange, style, } = props;
    const [inner, setInner] = react_1.default.useState(defaultValue);
    const selected = value !== undefined ? value : inner;
    const [expanded, setExpanded] = react_1.default.useState(false);
    const showPanel = open !== undefined ? open : expanded;
    // 点击空白处关闭 + 同屏互斥（受控常驻展开 open / disabled 不参与）
    const { onTriggerAbs, onPanelAbs } = (0, useOverlayGate_1.useOverlayGate)(showPanel && open === undefined && !disabled, () => setExpanded(false));
    const triggerH = size === 'large' ? token.controlHeightLG : size === 'small' ? token.controlHeightSM : token.controlHeight;
    const up = placement === 'topLeft' || placement === 'topRight';
    const alignRight = placement === 'bottomRight' || placement === 'topRight';
    const borderColor = status === 'error' ? token.colorError : status === 'warning' ? token.colorWarning : showPanel ? token.colorPrimary : token.colorBorder;
    const pick = (d) => {
        if (value === undefined)
            setInner(d);
        onChange && onChange(d);
        if (open === undefined)
            setExpanded(false);
    };
    const clear = () => {
        if (value === undefined)
            setInner(undefined);
        onChange && onChange(undefined);
    };
    return (react_1.default.createElement(components_1.View, { style: [{ position: 'relative' }, style], onLayoutAbs: onTriggerAbs },
        react_1.default.createElement(components_1.Pressable, { disabled: disabled, onPress: () => (open === undefined ? setExpanded((v) => !v) : undefined), style: {
                width: token.controlHeightLG * 4,
                height: triggerH,
                paddingHorizontal: token.paddingSM,
                flexDirection: 'row',
                alignItems: 'center',
                borderWidth: token.lineWidth,
                borderStyle: 'solid',
                borderColor,
                borderRadius: token.borderRadius,
                backgroundColor: token.colorBgContainer,
                opacity: disabled ? 0.65 : 1,
            } },
            react_1.default.createElement(icon_1.Icon, { name: "calendar", size: token.fontSize, color: token.colorTextQuaternary, style: { marginRight: token.marginXS } }),
            react_1.default.createElement(components_1.Text, { style: {
                    flex: 1,
                    fontSize: token.fontSize,
                    color: selected ? token.colorText : token.colorTextQuaternary,
                } }, selected ? (0, timezone_1.formatZonedDate)(selected, timezone) : placeholder),
            allowClear && selected && !disabled ? (react_1.default.createElement(components_1.Pressable, { onPress: clear, style: { paddingHorizontal: token.paddingXXS } },
                react_1.default.createElement(icon_1.Icon, { name: "closeCircle", size: token.fontSizeSM, color: token.colorTextQuaternary }))) : null),
        showPanel ? (react_1.default.createElement(components_1.View, { onLayoutAbs: onPanelAbs, style: {
                position: 'absolute',
                zIndex: 1050,
                left: alignRight ? undefined : 0,
                right: alignRight ? 0 : undefined,
                top: up ? undefined : triggerH + token.marginXXS,
                bottom: up ? triggerH + token.marginXXS : undefined,
            } },
            react_1.default.createElement(FadeIn_1.FadeIn, { duration: 160 },
                react_1.default.createElement(calendar_1.Calendar, { value: selected, onChange: pick, disabledDate: disabledDate, dateCellRender: dateCellRender, dateFullCellRender: dateFullCellRender })))) : null));
}
