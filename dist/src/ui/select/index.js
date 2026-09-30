"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Select = Select;
// SELECT：触发器 + 下拉选项面板。单选 / 多选（multiple）；受控 value + 非受控兜底。
// 下拉用绝对定位面板（文档顺序覆盖，同 ColorPicker），不依赖浮层 z 栈。
const react_1 = __importDefault(require("react"));
const components_1 = require("../../components");
const theme_1 = require("../../theme");
const icon_1 = require("../icon");
const FadeIn_1 = require("../../anim/FadeIn");
const useOverlayGate_1 = require("../../events/useOverlayGate");
function Select(props) {
    const { token } = (0, theme_1.useToken)();
    const { options, value, defaultValue, mode, placeholder = '请选择', disabled, allowClear, size = 'middle', status, placement = 'bottomLeft', maxTagCount, open, onChange, style, } = props;
    const multiple = mode === 'multiple';
    const norm = (v) => v === undefined ? [] : Array.isArray(v) ? v : [v];
    const [inner, setInner] = react_1.default.useState(norm(defaultValue));
    const selected = value !== undefined ? norm(value) : inner;
    const [expanded, setExpanded] = react_1.default.useState(false);
    const showPanel = open !== undefined ? open : expanded;
    // 点击空白处关闭 + 同屏互斥（受控常驻展开 open / disabled 不参与）
    const { onTriggerAbs, onPanelAbs } = (0, useOverlayGate_1.useOverlayGate)(showPanel && open === undefined && !disabled, () => setExpanded(false));
    const commit = (next) => {
        if (value === undefined)
            setInner(next);
        onChange && onChange(multiple ? next : next[next.length - 1]);
    };
    const toggle = (opt) => {
        if (disabled || opt.disabled)
            return;
        const on = selected.includes(opt.value);
        let next;
        if (multiple) {
            next = on ? selected.filter((v) => v !== opt.value) : [...selected, opt.value];
        }
        else {
            next = [opt.value];
            if (open === undefined)
                setExpanded(false);
        }
        commit(next);
    };
    const clear = () => {
        commit([]);
    };
    const labelOf = (v) => {
        const o = options.find((x) => x.value === v);
        return o ? o.label : v;
    };
    const hasValue = selected.length > 0;
    const h = size === 'large' ? token.controlHeightLG : size === 'small' ? token.controlHeightSM : token.controlHeight;
    const borderColor = status === 'error' ? token.colorError : status === 'warning' ? token.colorWarning : showPanel ? token.colorPrimary : token.colorBorder;
    const up = placement === 'topLeft' || placement === 'topRight';
    const alignRight = placement === 'bottomRight' || placement === 'topRight';
    // maxTagCount：多选超出部分折叠为 +N
    const overflow = multiple && maxTagCount !== undefined && selected.length > maxTagCount;
    const shownTags = overflow ? selected.slice(0, maxTagCount) : selected;
    const restCount = overflow ? selected.length - maxTagCount : 0;
    return (react_1.default.createElement(components_1.View, { style: [{ position: 'relative' }, style], onLayoutAbs: onTriggerAbs },
        react_1.default.createElement(components_1.Pressable, { disabled: disabled, onPress: () => (open === undefined ? setExpanded((v) => !v) : undefined), style: {
                minHeight: h,
                paddingHorizontal: token.paddingSM,
                paddingVertical: token.paddingXXS,
                flexDirection: 'row',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: token.marginXXS,
                borderWidth: token.lineWidth,
                borderStyle: 'solid',
                borderColor,
                borderRadius: token.borderRadius,
                backgroundColor: token.colorBgContainer,
                opacity: disabled ? 0.65 : 1,
            } },
            hasValue ? (multiple ? (react_1.default.createElement(react_1.default.Fragment, null,
                shownTags.map((v) => (react_1.default.createElement(components_1.View, { key: v, style: {
                        flexDirection: 'row',
                        alignItems: 'center',
                        paddingHorizontal: token.paddingXXS,
                        height: token.controlHeightSM - token.marginXXS,
                        borderRadius: token.borderRadiusSM,
                        backgroundColor: token.colorFillSecondary,
                    } },
                    react_1.default.createElement(components_1.Text, { style: { fontSize: token.fontSizeSM, color: token.colorText } }, labelOf(v))))),
                overflow ? (react_1.default.createElement(components_1.View, { style: {
                        alignItems: 'center',
                        justifyContent: 'center',
                        paddingHorizontal: token.paddingXXS,
                        height: token.controlHeightSM - token.marginXXS,
                        borderRadius: token.borderRadiusSM,
                        backgroundColor: token.colorFillSecondary,
                    } },
                    react_1.default.createElement(components_1.Text, { style: { fontSize: token.fontSizeSM, color: token.colorTextSecondary } },
                        "+",
                        restCount))) : null)) : (react_1.default.createElement(components_1.Text, { style: { fontSize: token.fontSize, color: token.colorText, flex: 1 }, numberOfLines: 1 }, labelOf(selected[0])))) : (react_1.default.createElement(components_1.Text, { style: { fontSize: token.fontSize, color: token.colorTextQuaternary, flex: 1 } }, placeholder)),
            allowClear && hasValue && !disabled ? (react_1.default.createElement(components_1.Pressable, { onPress: clear, style: { paddingHorizontal: token.paddingXXS } },
                react_1.default.createElement(icon_1.Icon, { name: "closeCircle", size: token.fontSize, color: token.colorTextQuaternary }))) : (react_1.default.createElement(icon_1.Icon, { name: "down", size: token.fontSizeSM, color: token.colorTextQuaternary, rotate: showPanel ? 180 : 0 }))),
        showPanel ? (react_1.default.createElement(components_1.View, { onLayoutAbs: onPanelAbs, style: {
                position: 'absolute',
                zIndex: 1050,
                left: alignRight ? undefined : 0,
                right: alignRight ? 0 : undefined,
                top: up ? undefined : h + token.marginXXS,
                bottom: up ? h + token.marginXXS : undefined,
                width: '100%',
                maxHeight: token.controlHeightLG * 5,
                paddingVertical: token.paddingXXS,
                borderWidth: token.lineWidth,
                borderStyle: 'solid',
                borderColor: token.colorBorderSecondary,
                borderRadius: token.borderRadiusLG,
                backgroundColor: token.colorBgElevated,
            } },
            react_1.default.createElement(FadeIn_1.FadeIn, { duration: 160 },
                react_1.default.createElement(components_1.ScrollView, { style: { maxHeight: token.controlHeightLG * 5 - token.padding } }, options.map((opt) => {
                    const on = selected.includes(opt.value);
                    return (react_1.default.createElement(components_1.Pressable, { key: opt.value, disabled: opt.disabled, onPress: () => toggle(opt), style: {
                            flexDirection: 'row',
                            alignItems: 'center',
                            paddingHorizontal: token.paddingSM,
                            paddingVertical: token.paddingXS,
                            backgroundColor: 'transparent',
                            opacity: opt.disabled ? 0.45 : 1,
                        } },
                        react_1.default.createElement(components_1.Text, { style: {
                                flex: 1,
                                fontSize: token.fontSize,
                                color: on ? token.colorPrimary : token.colorText,
                                fontWeight: on ? '500' : '400',
                            } }, opt.label),
                        on && multiple ? react_1.default.createElement(icon_1.Icon, { name: "check", size: token.fontSizeSM, color: token.colorPrimary, strokeWidth: 3 }) : null));
                }))))) : null));
}
