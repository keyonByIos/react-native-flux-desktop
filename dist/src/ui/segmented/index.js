"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Segmented = Segmented;
// Segmented：受控 / 非受控双模式。选中块是一枚「滑动滑块」——几何来自各 item onLayout，
// 位置/宽度用 useTween 补间，切换时平滑迁移（对齐 Tabs 墨条的做法）。
const react_1 = __importDefault(require("react"));
const components_1 = require("../../components");
const theme_1 = require("../../theme");
const useTween_1 = require("../../anim/useTween");
const easing_1 = require("../../anim/easing");
const icon_1 = require("../icon");
function Segmented(props) {
    const { token, getComponentToken } = (0, theme_1.useToken)();
    const ct = getComponentToken('Segmented');
    const { options, value, defaultValue, onChange, size = 'middle', block, disabled, shape = 'default', style } = props;
    function idOf(o, i) {
        return typeof o === 'string' ? o : o.value !== undefined ? o.value : i;
    }
    function labelOf(o) {
        return typeof o === 'string' ? o : o.label;
    }
    function iconOf(o) {
        return typeof o === 'string' ? undefined : o.icon;
    }
    function itemDisabled(o) {
        return typeof o === 'string' ? false : !!o.disabled;
    }
    const [inner, setInner] = react_1.default.useState(value !== undefined ? value : defaultValue ?? (options[0] != null ? idOf(options[0], 0) : ''));
    const active = value !== undefined ? value : inner;
    const height = size === 'small' ? token.controlHeightSM : size === 'large' ? token.controlHeightLG : token.controlHeight;
    const inset = ct.itemPaddingBlock;
    // 各 item 相对内层行的几何；滑块跟随 active 补间
    const [rects, setRects] = react_1.default.useState({});
    const reportRect = (key) => (e) => {
        const { x, w } = e.nativeEvent.layout;
        setRects((prev) => {
            const old = prev[key];
            if (old && old.x === x && old.w === w)
                return prev;
            return { ...prev, [key]: { x, w } };
        });
    };
    const activeId = String(active);
    const activeRect = rects[activeId];
    const thumbX = (0, useTween_1.useTween)(activeRect ? activeRect.x : 0, 240, easing_1.easeOutCubic);
    const thumbW = (0, useTween_1.useTween)(activeRect ? activeRect.w : 0, 240, easing_1.easeOutCubic);
    const trackRadius = shape === 'round' ? height / 2 : ct.borderRadius;
    const thumbRadius = shape === 'round' ? (height - inset * 2) / 2 : ct.borderRadius - 2;
    return (react_1.default.createElement(components_1.View, { style: [
            {
                alignSelf: block ? 'stretch' : 'flex-start',
                backgroundColor: ct.trackBg,
                borderRadius: trackRadius,
                padding: inset,
                height,
                opacity: disabled ? 0.5 : 1,
            },
            style,
        ] },
        react_1.default.createElement(components_1.View, { style: { flexDirection: 'row', flex: 1 } },
            activeRect ? (react_1.default.createElement(components_1.View, { style: {
                    position: 'absolute',
                    left: thumbX,
                    top: 0,
                    bottom: 0,
                    width: thumbW,
                    borderRadius: thumbRadius,
                    backgroundColor: ct.thumbBg,
                    opacity: thumbW > 0 ? 1 : 0,
                } })) : null,
            options.map((o, i) => {
                const id = idOf(o, i);
                const selected = id === active;
                const off = disabled || itemDisabled(o);
                const icon = iconOf(o);
                return (react_1.default.createElement(components_1.Pressable, { key: String(id), disabled: off, style: {
                        flex: block ? 1 : undefined,
                        paddingHorizontal: token.paddingSM,
                        alignItems: 'center',
                        justifyContent: 'center',
                    }, onLayout: reportRect(String(id)), onPress: () => {
                        if (off)
                            return;
                        if (value === undefined)
                            setInner(id);
                        onChange && onChange(id);
                    } },
                    react_1.default.createElement(components_1.View, { style: { flexDirection: 'row', alignItems: 'center', gap: token.marginXXS } },
                        icon != null ? (typeof icon === 'string' ? (react_1.default.createElement(icon_1.Icon, { name: icon, size: token.fontSize, color: selected ? token.colorText : token.colorTextTertiary })) : (icon)) : null,
                        react_1.default.createElement(components_1.Text, { style: {
                                fontSize: token.fontSize,
                                color: off ? token.colorTextQuaternary : selected ? token.colorText : token.colorTextTertiary,
                                fontWeight: selected ? '500' : '400',
                            } }, labelOf(o)))));
            }))));
}
exports.default = Segmented;
