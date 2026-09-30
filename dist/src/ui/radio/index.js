"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Radio = void 0;
// Radio：外圈 + 内点，选中态描 colorPrimary 并放一个 dotSize 的实心点；受控 / 非受控双模式。
// Radio.Button：按钮风格（选中态主色描边 + 主色文字），组内相邻边框塌陷、两端圆角。
// Radio.Group：单值管理，context 下发；options 简写 + optionType（radio/button）+ size 三档。
const react_1 = __importDefault(require("react"));
const components_1 = require("../../components");
const theme_1 = require("../../theme");
const space_1 = require("../space");
const useTween_1 = require("../../anim/useTween");
const easing_1 = require("../../anim/easing");
const GroupCtx = react_1.default.createContext(null);
/** 圆点风格单选框 */
function CircleRadio(props) {
    const { token, getComponentToken } = (0, theme_1.useToken)();
    const ct = getComponentToken('Radio');
    const { checked, defaultChecked = false, disabled, label, value, onChange, style } = props;
    const ctx = react_1.default.useContext(GroupCtx);
    const inGroup = ctx !== null && value !== undefined;
    const [inner, setInner] = react_1.default.useState(defaultChecked);
    const on = inGroup ? ctx.value === value : checked !== undefined ? checked : inner;
    const isDisabled = !!disabled || !!ctx?.disabled;
    const size = ct.size;
    const dot = ct.dotSize;
    // 内点 pop-in：常驻渲染，用带过冲的 easeOutBack 把 0→1 补间成 scale+opacity，选中时从中心弹出。
    const pop = (0, useTween_1.useTween)(on ? 1 : 0, 200, easing_1.easeOutBack);
    const dotScale = Math.max(0.01, pop);
    const dotOpacity = Math.min(1, Math.max(0, pop));
    const pick = () => {
        if (isDisabled)
            return;
        if (inGroup)
            ctx.select(value);
        else if (!on) {
            if (checked === undefined)
                setInner(true);
            onChange && onChange(true);
        }
    };
    const ring = {
        width: size,
        height: size,
        borderRadius: size / 2,
        borderWidth: token.lineWidth,
        borderStyle: 'solid',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: token.colorBgContainer,
        borderColor: on ? ct.colorPrimary : token.colorBorder,
        opacity: isDisabled ? 0.65 : 1,
    };
    return (react_1.default.createElement(components_1.Pressable, { disabled: isDisabled, onPress: pick, style: [{ flexDirection: 'row', alignItems: 'center' }, style] },
        react_1.default.createElement(components_1.View, { style: ring },
            react_1.default.createElement(components_1.View, { style: {
                    width: dot,
                    height: dot,
                    borderRadius: dot / 2,
                    backgroundColor: ct.colorPrimary,
                    opacity: dotOpacity,
                    transform: [{ scale: dotScale }],
                } })),
        label != null ? (react_1.default.createElement(components_1.Text, { style: {
                marginLeft: token.marginXS,
                fontSize: token.fontSize,
                color: isDisabled ? token.colorTextQuaternary : token.colorText,
            } }, label)) : null));
}
/** 尺寸 → 高度 / 字号 / 水平内边距 */
function sizeMetrics(token, size) {
    if (size === 'large')
        return { h: token.controlHeightLG, fs: token.fontSizeLG, px: token.padding };
    if (size === 'small')
        return { h: token.controlHeightSM, fs: token.fontSizeSM, px: token.paddingXS };
    return { h: token.controlHeight, fs: token.fontSize, px: token.paddingSM };
}
/** 按钮风格单选框 */
function ButtonRadio(props) {
    const { token, getComponentToken } = (0, theme_1.useToken)();
    const ct = getComponentToken('Radio');
    const { checked, disabled, label, value, onChange, style, __pos = 'both', __size = 'middle' } = props;
    const ctx = react_1.default.useContext(GroupCtx);
    const inGroup = ctx !== null && value !== undefined;
    const on = inGroup ? ctx.value === value : !!checked;
    const isDisabled = !!disabled || !!ctx?.disabled;
    const m = sizeMetrics(token, __size);
    const radius = token.borderRadius;
    const border = {
        borderTopLeftRadius: __pos === 'first' || __pos === 'both' ? radius : 0,
        borderBottomLeftRadius: __pos === 'first' || __pos === 'both' ? radius : 0,
        borderTopRightRadius: __pos === 'last' || __pos === 'both' ? radius : 0,
        borderBottomRightRadius: __pos === 'last' || __pos === 'both' ? radius : 0,
    };
    const pick = () => {
        if (isDisabled)
            return;
        if (inGroup)
            ctx.select(value);
        else if (!on)
            onChange && onChange(true);
    };
    return (react_1.default.createElement(components_1.Pressable, { disabled: isDisabled, onPress: pick, style: [
            {
                height: m.h,
                paddingLeft: m.px,
                paddingRight: m.px,
                alignItems: 'center',
                justifyContent: 'center',
                borderWidth: token.lineWidth,
                borderStyle: 'solid',
                borderColor: on ? ct.colorPrimary : token.colorBorder,
                backgroundColor: on ? token.colorBgContainer : token.colorFillQuaternary,
                marginLeft: __pos === 'first' || __pos === 'both' ? 0 : -token.lineWidth,
                opacity: isDisabled ? 0.65 : 1,
            },
            border,
            style,
        ] }, label != null ? (react_1.default.createElement(components_1.Text, { style: { fontSize: m.fs, color: isDisabled ? token.colorTextQuaternary : on ? ct.colorPrimary : token.colorText } }, label)) : null));
}
function Group(props) {
    const { token } = (0, theme_1.useToken)();
    const { value, defaultValue, options, optionType = 'radio', size = 'middle', disabled, onChange, children, style } = props;
    const [inner, setInner] = react_1.default.useState(defaultValue);
    const val = value !== undefined ? value : inner;
    const select = (v) => {
        if (value === undefined)
            setInner(v);
        onChange && onChange(v);
    };
    const ctx = { value: val, disabled, select };
    const isButton = optionType === 'button';
    const rendered = options
        ? options.map((o, i) => {
            const opt = typeof o === 'object' ? o : { label: String(o), value: o };
            const pos = options.length === 1 ? 'both' : i === 0 ? 'first' : i === options.length - 1 ? 'last' : 'none';
            return isButton ? (react_1.default.createElement(ButtonRadio, { key: String(opt.value), value: opt.value, label: opt.label, disabled: opt.disabled, __pos: pos, __size: size })) : (react_1.default.createElement(CircleRadio, { key: String(opt.value), value: opt.value, label: opt.label, disabled: opt.disabled }));
        })
        : children;
    return (react_1.default.createElement(GroupCtx.Provider, { value: ctx },
        react_1.default.createElement(components_1.View, { style: isButton
                ? [{ flexDirection: 'row', alignItems: 'center' }, style]
                : [{ flexDirection: 'row', flexWrap: 'wrap', columnGap: token.marginLG, rowGap: token.marginXS }, style] }, isButton ? rendered : react_1.default.createElement(space_1.Space, null, rendered))));
}
function RadioBase(props) {
    return react_1.default.createElement(CircleRadio, { ...props });
}
exports.Radio = Object.assign(RadioBase, { Group, Button: ButtonRadio });
exports.default = exports.Radio;
