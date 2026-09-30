"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.InputNumber = InputNumber;
// INPUTNUMBER：数值输入，无键盘管线，用上下步进按钮调值（受控/非受控 + min/max/step 夹取）。
// 对齐 antd v5：size（高度三档）/ status（error/warning 描边）/ controls（步进按钮显隐）/ prefix / placeholder / formatter。
const react_1 = __importDefault(require("react"));
const components_1 = require("../../components");
const theme_1 = require("../../theme");
const icon_1 = require("../icon");
function clamp(v, min, max) {
    if (min !== undefined && v < min)
        return min;
    if (max !== undefined && v > max)
        return max;
    return v;
}
function InputNumber(props) {
    const { token } = (0, theme_1.useToken)();
    const { value, defaultValue, min, max, step = 1, disabled, suffix, prefix, placeholder = '', size = 'middle', status, controls = true, formatter, style, onChange, } = props;
    const [inner, setInner] = react_1.default.useState(defaultValue);
    // null 与 undefined 同义（空值）：否则受控传 null 会把字面量 "null" 当值显在框里。
    // 受控判定仍用 !== undefined：传 null 也算受控（此时框显空占位）。
    const current = value !== undefined ? value ?? undefined : inner;
    const triggerH = size === 'large' ? token.controlHeightLG : size === 'small' ? token.controlHeightSM : token.controlHeight;
    const commit = (v) => {
        const next = clamp(v, min, max);
        if (value === undefined)
            setInner(next);
        onChange && onChange(next);
    };
    const canUp = !disabled && (max === undefined || (current ?? 0) + step <= max);
    const canDown = !disabled && (min === undefined || (current ?? 0) - step >= min);
    const borderColor = status === 'error' ? token.colorError : status === 'warning' ? token.colorWarning : token.colorBorder;
    const btn = (dir) => {
        const enabled = dir === 'up' ? canUp : canDown;
        return (react_1.default.createElement(components_1.Pressable, { disabled: !enabled, onPress: () => commit((current ?? 0) + (dir === 'up' ? step : -step)), style: {
                flex: 1,
                alignItems: 'center',
                justifyContent: 'center',
                opacity: enabled ? 1 : 0.35,
            } },
            react_1.default.createElement(icon_1.Icon, { name: dir, size: token.fontSizeSM, color: token.colorTextSecondary, strokeWidth: 2.5 })));
    };
    const half = (triggerH - token.lineWidth * 2) / 2;
    const display = current == null ? placeholder : formatter ? formatter(current) : `${current}${suffix ? ` ${suffix}` : ''}`;
    return (react_1.default.createElement(components_1.View, { style: [
            {
                flexDirection: 'row',
                alignItems: 'center',
                width: token.controlHeightLG * 3,
                height: triggerH,
                borderWidth: token.lineWidth,
                borderStyle: 'solid',
                borderColor,
                borderRadius: token.borderRadius,
                backgroundColor: disabled ? token.colorFillQuaternary : token.colorBgContainer,
                opacity: disabled ? 0.65 : 1,
                overflow: 'hidden',
            },
            style,
        ] },
        react_1.default.createElement(components_1.View, { style: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingLeft: token.paddingSM } },
            prefix != null ? (react_1.default.createElement(components_1.Text, { style: { fontSize: token.fontSize, color: token.colorTextQuaternary, marginRight: token.marginXXS } }, prefix)) : null,
            react_1.default.createElement(components_1.Text, { style: { fontSize: token.fontSize, color: current == null ? token.colorTextQuaternary : token.colorText } }, display)),
        controls ? (react_1.default.createElement(components_1.View, { style: {
                width: triggerH,
                alignSelf: 'stretch',
                borderLeftWidth: token.lineWidth,
                borderLeftColor: token.colorBorderSecondary,
            } },
            react_1.default.createElement(components_1.View, { style: { height: half } }, btn('up')),
            react_1.default.createElement(components_1.View, { style: { height: half, borderTopWidth: token.lineWidth, borderTopColor: token.colorBorderSecondary } }, btn('down')))) : null));
}
exports.default = InputNumber;
