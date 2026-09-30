"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Slider = Slider;
// SLIDER：滑动条（对齐 antd 常用 API 的自绘降级实现）。
// 交互限制：本渲染栈无 pointer-capture 拖拽管线（见 Splitter 注释），故以「点击轨道/刻度 → 就近吸附到步位」为主，
// 位置切换用 useTween 补间滑动。几何一律取整，避免自绘管线逐边四舍五入导致手柄/圆点变形。
const react_1 = __importDefault(require("react"));
const components_1 = require("../../components");
const theme_1 = require("../../theme");
const useTween_1 = require("../../anim/useTween");
const easing_1 = require("../../anim/easing");
const RAIL_H = 4;
const HANDLE = 16;
function Slider(props) {
    const { token } = (0, theme_1.useToken)();
    const { min = 0, max = 100, step = 1, value, defaultValue, disabled, marks, tooltipVisible, formatter, onChange, style, } = props;
    const [inner, setInner] = react_1.default.useState(defaultValue ?? min);
    const cur = value !== undefined ? value : inner;
    const span = Math.max(max - min, 1);
    const stops = Math.max(1, Math.round(span / Math.max(step, 1e-6)));
    const [W, setW] = react_1.default.useState(0);
    const trackPad = HANDLE / 2;
    const usable = Math.max(W - HANDLE, 0);
    const clampV = (v) => Math.min(max, Math.max(min, v));
    const frac = (v) => (clampV(v) - min) / span;
    const posX = (v) => trackPad + frac(v) * usable;
    // 手柄/填充随目标值补间滑动（点击切档时 glide）
    const shown = (0, useTween_1.useTween)(cur, 200, easing_1.easeOutCubic);
    const shownX = posX(shown);
    const commit = (v) => {
        if (disabled)
            return;
        const snapped = clampV(Math.round((v - min) / step) * step + min);
        if (value === undefined)
            setInner(snapped);
        onChange && onChange(snapped);
    };
    const fmt = (v) => (formatter ? formatter(v) : String(Math.round(v * 100) / 100));
    const markKeys = marks ? Object.keys(marks).map(Number).filter((m) => m >= min && m <= max) : [];
    const hasMarks = markKeys.length > 0;
    // 统一纵向基线：TOP 为手柄顶部留白（气泡需要上方空间），容器高度显式算出，避免绝对定位手柄溢出到相邻节点。
    const TOP = tooltipVisible ? 28 : 12;
    const railTop = TOP + (HANDLE - RAIL_H) / 2;
    const handleTop = TOP;
    const containerH = TOP + HANDLE + (hasMarks ? 22 : 8);
    const zones = [];
    if (W > 0 && !disabled) {
        const zoneW = usable / stops;
        for (let i = 0; i <= stops; i++) {
            const v = min + i * step;
            const left = Math.min(Math.max(trackPad + i * zoneW - zoneW / 2, 0), Math.max(W - zoneW, 0));
            zones.push(react_1.default.createElement(components_1.Pressable, { key: i, onPress: () => commit(v), style: { position: 'absolute', left, top: 0, width: zoneW, height: containerH } }));
        }
    }
    return (react_1.default.createElement(components_1.View, { onLayout: (e) => setW(e.nativeEvent.layout.w), style: [{ position: 'relative', width: '100%', height: containerH, opacity: disabled ? 0.5 : 1 }, style] },
        react_1.default.createElement(components_1.View, { style: {
                position: 'absolute',
                left: trackPad,
                top: railTop,
                width: usable,
                height: RAIL_H,
                borderRadius: RAIL_H / 2,
                backgroundColor: token.colorSplit,
            } }),
        react_1.default.createElement(components_1.View, { style: {
                position: 'absolute',
                left: trackPad,
                top: railTop,
                width: Math.max(shownX - trackPad, 0),
                height: RAIL_H,
                borderRadius: RAIL_H / 2,
                backgroundColor: disabled ? token.colorTextQuaternary : token.colorPrimary,
            } }),
        markKeys.map((m) => (react_1.default.createElement(components_1.View, { key: `dot${m}`, style: {
                position: 'absolute',
                left: posX(m) - 2,
                top: handleTop + HANDLE / 2 - 2,
                width: 4,
                height: 4,
                borderRadius: 2,
                backgroundColor: frac(m) <= frac(cur) && !disabled ? token.colorPrimary : token.colorTextQuaternary,
            } }))),
        react_1.default.createElement(components_1.View, { style: {
                position: 'absolute',
                left: shownX - HANDLE / 2,
                top: handleTop,
                width: HANDLE,
                height: HANDLE,
                borderRadius: HANDLE / 2,
                backgroundColor: token.colorBgContainer,
                borderWidth: 2,
                borderColor: disabled ? token.colorTextQuaternary : token.colorPrimary,
            } }),
        tooltipVisible && W > 0 ? (react_1.default.createElement(components_1.View, { style: {
                position: 'absolute',
                left: Math.max(shownX - 22, 0),
                top: handleTop - 22,
                minWidth: 44,
                paddingHorizontal: 6,
                paddingVertical: 2,
                borderRadius: token.borderRadius,
                backgroundColor: token.colorText,
                alignItems: 'center',
            } },
            react_1.default.createElement(components_1.Text, { style: { fontSize: token.fontSizeSM, color: token.colorBgContainer } }, fmt(shown)))) : null,
        zones,
        markKeys.map((m) => (react_1.default.createElement(components_1.View, { key: `lb${m}`, style: { position: 'absolute', left: posX(m), top: handleTop + HANDLE + 4, width: 40, marginLeft: -20, alignItems: 'center' } },
            react_1.default.createElement(components_1.Text, { style: { fontSize: token.fontSizeSM, color: token.colorTextSecondary } }, marks[m]))))));
}
exports.default = Slider;
