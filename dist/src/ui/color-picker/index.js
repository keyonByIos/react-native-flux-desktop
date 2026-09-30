"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PRESET_COLORS = void 0;
exports.ColorPicker = ColorPicker;
// COLORPICKER：降级为「触发器 + 预设色板面板」。完整 HSV 拾色需要手势拖拽管线，
// 待 pointer capture 落地后再升级；当前预设色覆盖 antd 官方 24 色。
// 对齐 antd v5：size（触发器高度）/ showText（色值文本）/ presets（自定义预设行）/ allowClear（清除）/ placement（四向弹出）。
const react_1 = __importDefault(require("react"));
const components_1 = require("../../components");
const theme_1 = require("../../theme");
const icon_1 = require("../icon");
const FadeIn_1 = require("../../anim/FadeIn");
const useOverlayGate_1 = require("../../events/useOverlayGate");
/** antd 官方预设 24 色（每色系取 50/100 两档中偏浅的一档 + 主档） */
exports.PRESET_COLORS = [
    '#e6f4ff', '#91caff', '#4096ff', '#1677ff',
    '#e6fffb', '#87e8de', '#36cfc9', '#13c2c2',
    '#f6ffed', '#b7eb8f', '#73d13d', '#52c41a',
    '#feffe6', '#fffb8f', '#fadb14', '#faad14',
    '#fff7e6', '#ffd591', '#ffa940', '#fa8c16',
    '#fff1f0', '#ffa39e', '#ff7875', '#f5222d',
    '#fff0f6', '#ffadd2', '#f759ab', '#eb2f96',
    '#f9f0ff', '#d3adf7', '#9254de', '#722ed1',
    '#f0f5ff', '#adc6ff', '#597ef7', '#2f54eb',
    '#fafafa', '#d9d9d9', '#8c8c8c', '#1f1f1f',
];
function ColorPicker(props) {
    const { token } = (0, theme_1.useToken)();
    const { value, defaultValue = '#1677ff', disabled, size = 'middle', showText = true, presets, allowClear, placement = 'bottomLeft', open, onChange, style, } = props;
    const [inner, setInner] = react_1.default.useState(defaultValue);
    const color = value !== undefined ? value : inner;
    const [expanded, setExpanded] = react_1.default.useState(false);
    const showPanel = open !== undefined ? open : expanded;
    // 点击空白处关闭 + 同屏互斥（受控常驻展开 open / disabled 不参与）
    const { onTriggerAbs, onPanelAbs } = (0, useOverlayGate_1.useOverlayGate)(showPanel && open === undefined && !disabled, () => setExpanded(false));
    const commit = (c) => {
        if (disabled)
            return;
        if (value === undefined)
            setInner(c);
        onChange && onChange(c);
        if (open === undefined)
            setExpanded(false);
    };
    const triggerH = size === 'large' ? token.controlHeightLG : size === 'small' ? token.controlHeightSM : token.controlHeight;
    const swatch = triggerH - token.marginXS;
    const cell = swatch + token.marginXXS;
    const panelW = cell * 8 + token.paddingSM * 2;
    const up = placement === 'topLeft' || placement === 'topRight';
    const alignRight = placement === 'bottomRight' || placement === 'topRight';
    const textNode = typeof showText === 'function' ? showText(color || undefined) : showText ? (color ? color.toUpperCase() : '空') : null;
    return (react_1.default.createElement(components_1.View, { style: [{ position: 'relative' }, style], onLayoutAbs: onTriggerAbs },
        react_1.default.createElement(components_1.Pressable, { disabled: disabled, onPress: () => (open === undefined ? setExpanded((v) => !v) : undefined), style: {
                flexDirection: 'row',
                alignItems: 'center',
                alignSelf: 'flex-start',
                paddingHorizontal: token.paddingXS,
                height: triggerH,
                gap: token.marginXS,
                borderWidth: token.lineWidth,
                borderStyle: 'solid',
                borderColor: token.colorBorder,
                borderRadius: token.borderRadius,
                backgroundColor: token.colorBgContainer,
                opacity: disabled ? 0.65 : 1,
            } },
            react_1.default.createElement(components_1.View, { style: {
                    width: swatch,
                    height: swatch,
                    borderRadius: token.borderRadiusSM,
                    backgroundColor: color || token.colorFillQuaternary,
                    borderWidth: token.lineWidth,
                    borderColor: token.colorFillSecondary,
                } }),
            textNode != null ? (react_1.default.createElement(components_1.Text, { style: { fontSize: token.fontSize, color: color ? token.colorText : token.colorTextQuaternary } }, textNode)) : null),
        showPanel ? (react_1.default.createElement(components_1.View, { onLayoutAbs: onPanelAbs, style: {
                position: 'absolute',
                zIndex: 1050,
                left: alignRight ? undefined : 0,
                right: alignRight ? 0 : undefined,
                top: up ? undefined : triggerH + token.marginXXS,
                bottom: up ? triggerH + token.marginXXS : undefined,
                width: panelW,
                padding: token.paddingSM,
                gap: token.marginXXS,
                borderWidth: token.lineWidth,
                borderStyle: 'solid',
                borderColor: token.colorBorderSecondary,
                borderRadius: token.borderRadiusLG,
                backgroundColor: token.colorBgElevated,
            } },
            react_1.default.createElement(FadeIn_1.FadeIn, { duration: 160 },
                presets ? (react_1.default.createElement(components_1.View, { style: { marginBottom: token.marginXS } },
                    react_1.default.createElement(components_1.Text, { style: { fontSize: token.fontSizeSM, color: token.colorTextSecondary, marginBottom: token.marginXXS } }, "\u9884\u8BBE"),
                    react_1.default.createElement(components_1.View, { style: { flexDirection: 'row', flexWrap: 'wrap', gap: token.marginXXS } }, presets.map((c) => (react_1.default.createElement(components_1.Pressable, { key: `p-${c}`, onPress: () => commit(c), style: { width: cell, height: cell, alignItems: 'center', justifyContent: 'center' } },
                        react_1.default.createElement(components_1.View, { style: {
                                width: swatch,
                                height: swatch,
                                borderRadius: token.borderRadiusSM,
                                backgroundColor: c,
                                borderWidth: token.lineWidth,
                                borderColor: token.colorFillSecondary,
                                alignItems: 'center',
                                justifyContent: 'center',
                            } }, c.toLowerCase() === (color ?? '').toLowerCase() ? (react_1.default.createElement(icon_1.Icon, { name: "check", size: swatch * 0.7, color: token.colorTextBase, strokeWidth: 3 })) : null))))),
                    react_1.default.createElement(components_1.View, { style: { height: token.lineWidth, backgroundColor: token.colorBorderSecondary, marginTop: token.marginXS } }))) : null,
                react_1.default.createElement(components_1.View, { style: { flexDirection: 'row', flexWrap: 'wrap', gap: token.marginXXS } }, exports.PRESET_COLORS.map((c) => (react_1.default.createElement(components_1.Pressable, { key: c, onPress: () => commit(c), style: { width: cell, height: cell, alignItems: 'center', justifyContent: 'center' } },
                    react_1.default.createElement(components_1.View, { style: {
                            width: swatch,
                            height: swatch,
                            borderRadius: token.borderRadiusSM,
                            backgroundColor: c,
                            borderWidth: token.lineWidth,
                            borderColor: token.colorFillSecondary,
                            alignItems: 'center',
                            justifyContent: 'center',
                        } }, c.toLowerCase() === (color ?? '').toLowerCase() ? (react_1.default.createElement(icon_1.Icon, { name: "check", size: swatch * 0.7, color: token.colorTextBase, strokeWidth: 3 })) : null))))),
                allowClear ? (react_1.default.createElement(components_1.Pressable, { onPress: () => commit(''), style: {
                        marginTop: token.marginXS,
                        height: token.controlHeightSM,
                        borderRadius: token.borderRadius,
                        borderWidth: token.lineWidth,
                        borderStyle: 'solid',
                        borderColor: token.colorBorder,
                        alignItems: 'center',
                        justifyContent: 'center',
                    } },
                    react_1.default.createElement(components_1.Text, { style: { fontSize: token.fontSizeSM, color: token.colorTextSecondary } }, "\u6E05\u9664\u989C\u8272"))) : null))) : null));
}
