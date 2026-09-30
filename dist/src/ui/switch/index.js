"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Switch = Switch;
// Switch：轨道 + 手柄，几何全取自 Switch 组件 token；受控 / 非受控双模式。
// 手柄用 useTween 做左右滑动补间（position 随 checked 迁移）。
// 对齐 antd v5：loading（手柄内旋转指示器 + 禁交互）/ checkedChildren·unCheckedChildren（轨道内文字或图标，自动加宽）。
const react_1 = __importDefault(require("react"));
const components_1 = require("../../components");
const theme_1 = require("../../theme");
const icon_1 = require("../icon");
const useTween_1 = require("../../anim/useTween");
const useAnimation_1 = require("../../anim/useAnimation");
function Switch(props) {
    const { token, getComponentToken } = (0, theme_1.useToken)();
    const ct = getComponentToken('Switch');
    const { checked, defaultChecked = false, disabled, loading, size = 'default', checkedChildren, unCheckedChildren, onChange, style } = props;
    const [inner, setInner] = react_1.default.useState(defaultChecked);
    const on = checked !== undefined ? checked : inner;
    // small 尺寸整体缩到 0.8，与 antd 的 size="small" 语义一致。
    // 关键：所有几何取整，避免自绘管线逐边四舍五入导致手柄偏移 / 圆角变形（分数 margin、分数轨道高）。
    const scale = size === 'small' ? 0.8 : 1;
    const handle = Math.round(ct.handleSize * scale);
    const margin = Math.round(ct.innerMinMargin * scale);
    const hasKids = checkedChildren != null || unCheckedChildren != null;
    // 轨道高 = 手柄 + 上下 margin，保证手柄绝对垂直居中；轨道宽不小于轨道高
    const trackH = handle + margin * 2;
    const trackW = Math.max(trackH, Math.round((ct.minLineWidth + (hasKids ? handle * 1.4 : 0)) * scale));
    const inactive = disabled || loading;
    const toggle = () => {
        if (inactive)
            return;
        const next = !on;
        if (checked === undefined)
            setInner(next);
        onChange && onChange(next);
    };
    // 手柄目标位：开=右端，关=左端；补间跟随
    const knobLeft = (0, useTween_1.useTween)(on ? trackW - handle - margin : margin, 200);
    // 加载指示器旋转角
    const angle = (0, useAnimation_1.useAnimation)({ duration: 900, loop: true, playing: !!loading }) * 360;
    const kid = (node, onSide) => typeof node === 'string' || typeof node === 'number' ? (react_1.default.createElement(components_1.Text, { style: { fontSize: token.fontSizeSM * scale, color: onSide ? token.colorTextLightSolid : token.colorTextSecondary } }, node)) : (react_1.default.createElement(react_1.default.Fragment, null, node));
    const shell = {
        width: trackW,
        height: trackH,
        borderRadius: trackH / 2,
        padding: 0,
        position: 'relative',
        backgroundColor: on ? token.colorPrimary : ct.color,
        opacity: disabled ? 0.65 : 1,
    };
    return (react_1.default.createElement(components_1.Pressable, { disabled: inactive, onPress: toggle, style: [shell, style] },
        on && checkedChildren != null ? (react_1.default.createElement(components_1.View, { style: { position: 'absolute', left: margin + 4, top: 0, bottom: 0, justifyContent: 'center' } }, kid(checkedChildren, true))) : null,
        !on && unCheckedChildren != null ? (react_1.default.createElement(components_1.View, { style: { position: 'absolute', right: margin + 4, top: 0, bottom: 0, justifyContent: 'center' } }, kid(unCheckedChildren, false))) : null,
        react_1.default.createElement(components_1.View, { style: {
                position: 'absolute',
                left: knobLeft,
                top: margin,
                width: handle,
                height: handle,
                borderRadius: handle / 2,
                backgroundColor: ct.handleBg,
                alignItems: 'center',
                justifyContent: 'center',
            } }, loading ? react_1.default.createElement(icon_1.Icon, { name: "loading", size: handle * 0.7, color: token.colorPrimary, strokeWidth: 3, rotate: angle }) : null)));
}
