"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.InputOTP = InputOTP;
// INPUT-OTP：一次性验证码输入。N 格拆分显示、键盘录入/退格、掩码、完成回调。
// 实现策略：真实 Input 透明叠加在视觉格子层上方——Input 负责全部键盘/IME 管线，
// 格子层只负责渲染每个字符（或掩码点）及聚焦下划线动画。
const react_1 = __importDefault(require("react"));
const components_1 = require("../../components");
const theme_1 = require("../../theme");
const input_1 = require("../input");
function InputOTP(props) {
    const { token } = (0, theme_1.useToken)();
    const { length = 6, value: ctrlValue, defaultValue = '', onChange, onComplete, masked, disabled, status, direction = 'horizontal', style, } = props;
    const [innerValue, setInnerValue] = react_1.default.useState(defaultValue);
    const val = ctrlValue !== undefined ? ctrlValue : innerValue;
    const [focused, setFocused] = react_1.default.useState(false);
    const handleChange = (v) => {
        const trimmed = v.slice(0, length);
        if (ctrlValue === undefined)
            setInnerValue(trimmed);
        onChange && onChange(trimmed);
        if (trimmed.length === length)
            onComplete && onComplete(trimmed);
    };
    // 每格显示字符
    const cells = [];
    for (let i = 0; i < length; i++) {
        if (i < val.length) {
            cells.push(masked ? '•' : val[i]);
        }
        else {
            cells.push('');
        }
    }
    // 聚焦格：当前待填位置（value 长度，若已满则最后一格）
    const focusIdx = Math.min(val.length, length - 1);
    const cellSize = token.controlHeightLG + 8; // ~48+ 保证足够点击区
    const gap = token.marginXS;
    return (react_1.default.createElement(components_1.View, { style: [{ position: 'relative' }, style] },
        react_1.default.createElement(input_1.Input, { value: val, onChange: handleChange, maxLength: length, disabled: disabled, status: status, onFocus: () => setFocused(true), onBlur: () => setFocused(false), style: {
                position: 'absolute',
                left: 0,
                top: 0,
                width: cellSize * length + gap * (length - 1),
                height: cellSize,
                opacity: 0,
            } }),
        react_1.default.createElement(components_1.View, { style: {
                flexDirection: direction === 'horizontal' ? 'row' : 'column',
                gap,
            } }, cells.map((ch, i) => {
            const isActive = focused && i === focusIdx;
            const borderColor = status === 'error'
                ? token.colorError
                : status === 'warning'
                    ? token.colorWarning
                    : isActive
                        ? token.colorPrimary
                        : token.colorBorder;
            return (react_1.default.createElement(components_1.View, { key: i, style: {
                    width: cellSize,
                    height: cellSize,
                    borderRadius: token.borderRadius,
                    borderWidth: isActive ? 2 : 1,
                    borderColor,
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: token.colorBgContainer,
                } },
                react_1.default.createElement(components_1.Text, { style: { fontSize: token.fontSizeLG, fontWeight: '600', color: token.colorText } }, ch),
                isActive && ch === '' ? (react_1.default.createElement(components_1.View, { style: {
                        position: 'absolute',
                        bottom: 6,
                        width: 2,
                        height: cellSize * 0.4,
                        borderRadius: 1,
                        backgroundColor: token.colorPrimary,
                    } })) : null));
        }))));
}
exports.default = InputOTP;
