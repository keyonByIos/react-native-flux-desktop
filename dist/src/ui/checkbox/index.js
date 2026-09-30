"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Checkbox = void 0;
// Checkbox：方框 + 勾选，选中态填 colorPrimary；indeterminate 半选横杠；受控 / 非受控双模式。
// Checkbox.Group：数组值管理，context 下发，支持 options 简写或 children 手写。勾选用 Icon 矢量层（check），不依赖字体字形。
const react_1 = __importDefault(require("react"));
const components_1 = require("../../components");
const theme_1 = require("../../theme");
const icon_1 = require("../icon");
const space_1 = require("../space");
const useTween_1 = require("../../anim/useTween");
const easing_1 = require("../../anim/easing");
const GroupCtx = react_1.default.createContext(null);
function CheckboxBase(props) {
    const { token, getComponentToken } = (0, theme_1.useToken)();
    const ct = getComponentToken('Checkbox');
    const { checked, defaultChecked = false, disabled, label, indeterminate, value, onChange, style } = props;
    const ctx = react_1.default.useContext(GroupCtx);
    const inGroup = ctx !== null && value !== undefined;
    const [inner, setInner] = react_1.default.useState(defaultChecked);
    const on = inGroup ? ctx.value.indexOf(value) >= 0 : checked !== undefined ? checked : inner;
    const isDisabled = !!disabled || !!ctx?.disabled;
    const size = ct.controlInteractiveSize;
    // 勾选 / 半选横杠 pop-in：带过冲的 easeOutBack 把 0→1 补间成 scale+opacity，选中从中心弹出、取消缩回消失
    const popCheck = (0, useTween_1.useTween)(on ? 1 : 0, 200, easing_1.easeOutBack);
    const showDash = !!indeterminate && !on;
    const popDash = (0, useTween_1.useTween)(showDash ? 1 : 0, 200, easing_1.easeOutBack);
    const checkScale = Math.max(0.01, popCheck);
    const checkOpacity = Math.min(1, Math.max(0, popCheck));
    const dashScale = Math.max(0.01, popDash);
    const dashOpacity = Math.min(1, Math.max(0, popDash));
    const toggle = () => {
        if (isDisabled)
            return;
        const next = !on;
        if (inGroup)
            ctx.toggle(value, next);
        else {
            if (checked === undefined)
                setInner(next);
            onChange && onChange(next);
        }
    };
    const box = {
        width: size,
        height: size,
        borderRadius: ct.borderRadiusSM,
        borderWidth: token.lineWidth,
        borderStyle: 'solid',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: on ? ct.colorPrimary : token.colorBgContainer,
        borderColor: on || showDash ? ct.colorPrimary : token.colorBorder,
        opacity: isDisabled ? 0.65 : 1,
    };
    return (react_1.default.createElement(components_1.Pressable, { disabled: isDisabled, onPress: toggle, style: [{ flexDirection: 'row', alignItems: 'center' }, style] },
        react_1.default.createElement(components_1.View, { style: box },
            react_1.default.createElement(components_1.View, { style: { opacity: checkOpacity, transform: [{ scale: checkScale }] } },
                react_1.default.createElement(icon_1.Icon, { name: "check", size: size * 0.78, color: token.colorTextOnPrimaryBackground, strokeWidth: 3 })),
            showDash ? (react_1.default.createElement(components_1.View, { style: {
                    position: 'absolute',
                    width: size * 0.5,
                    height: token.lineWidth * 2.5,
                    borderRadius: token.lineWidth,
                    backgroundColor: ct.colorPrimary,
                    opacity: dashOpacity,
                    transform: [{ scale: dashScale }],
                } })) : null),
        label != null ? (react_1.default.createElement(components_1.Text, { style: {
                marginLeft: token.marginXS,
                fontSize: token.fontSize,
                color: isDisabled ? token.colorTextQuaternary : token.colorText,
            } }, label)) : null));
}
function Group(props) {
    const { token } = (0, theme_1.useToken)();
    const { value, defaultValue, options, disabled, onChange, children, style } = props;
    const [inner, setInner] = react_1.default.useState(defaultValue ?? []);
    const val = value !== undefined ? value : inner;
    const toggle = (v, checked) => {
        const next = checked ? val.concat(v) : val.filter((x) => x !== v);
        if (value === undefined)
            setInner(next);
        onChange && onChange(next);
    };
    const ctx = { value: val, disabled, toggle };
    return (react_1.default.createElement(GroupCtx.Provider, { value: ctx },
        react_1.default.createElement(components_1.View, { style: [{ flexDirection: 'row', flexWrap: 'wrap', columnGap: token.marginLG, rowGap: token.marginXS }, style] },
            react_1.default.createElement(space_1.Space, null, options
                ? options.map((o) => {
                    const opt = typeof o === 'object' ? o : { label: String(o), value: o };
                    return react_1.default.createElement(CheckboxBase, { key: String(opt.value), value: opt.value, label: opt.label, disabled: opt.disabled });
                })
                : children))));
}
exports.Checkbox = Object.assign(CheckboxBase, { Group });
exports.default = exports.Checkbox;
