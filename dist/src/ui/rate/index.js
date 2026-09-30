"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Rate = Rate;
// Rate：星级评分。整星 / 半星点击设值，悬停预览；只读态展示 value。星形走矢量 Icon。
// 对齐 antd v5：allowHalf（半星裁剪 + 左右半区悬停热区）/ character（自定义字符或图标）。
const react_1 = __importDefault(require("react"));
const components_1 = require("../../components");
const theme_1 = require("../../theme");
const icon_1 = require("../icon");
const useTween_1 = require("../../anim/useTween");
const easing_1 = require("../../anim/easing");
// 单颗星：把「非空」的 0→1 用带过冲的 easeOutBack 补间成 scale，点亮时弹一下（hover 扫过会依次弹起）。
// 半星 = 空层铺满 + 填充层裁剪到左半；填充层宽度 full=star / half=star/2 / empty=0。
function RateStar(p) {
    const pop = (0, useTween_1.useTween)(p.fill !== 'empty' ? 1 : 0, 240, easing_1.easeOutBack);
    const scale = Math.max(0.5, 0.7 + 0.3 * pop);
    const glyph = (color, filled) => {
        if (p.character == null) {
            return react_1.default.createElement(icon_1.Icon, { name: filled ? 'star-filled' : 'star', size: p.star, color: color, strokeWidth: 2 });
        }
        if (typeof p.character === 'string' || typeof p.character === 'number') {
            return (react_1.default.createElement(components_1.Text, { style: { fontSize: p.star, lineHeight: p.star * 1.2, color } }, p.character));
        }
        return react_1.default.createElement(react_1.default.Fragment, null, p.character);
    };
    const fillW = p.fill === 'full' ? p.star : p.fill === 'half' ? p.star / 2 : 0;
    return (react_1.default.createElement(components_1.View, { style: { width: p.star, height: p.star, marginRight: p.marginRight, position: 'relative' } },
        react_1.default.createElement(components_1.View, { style: { transform: [{ scale }] } },
            glyph(p.emptyColor, false),
            p.fill !== 'empty' ? (react_1.default.createElement(components_1.View, { style: { position: 'absolute', left: 0, top: 0, width: fillW, overflow: 'hidden' } },
                react_1.default.createElement(components_1.View, { style: { width: p.star } }, glyph(p.filledColor, true)))) : null),
        react_1.default.createElement(components_1.Pressable, { disabled: p.readonly, onMouseEnter: () => p.onHover(p.allowHalf ? p.idx - 0.5 : p.idx), onMouseLeave: p.onLeave, onPress: () => p.onPress(p.allowHalf ? p.idx - 0.5 : p.idx), style: { position: 'absolute', left: 0, top: 0, width: p.allowHalf ? p.star / 2 : p.star, height: p.star } }),
        p.allowHalf ? (react_1.default.createElement(components_1.Pressable, { disabled: p.readonly, onMouseEnter: () => p.onHover(p.idx), onMouseLeave: p.onLeave, onPress: () => p.onPress(p.idx), style: { position: 'absolute', left: p.star / 2, top: 0, width: p.star / 2, height: p.star } })) : null));
}
function Rate(props) {
    const { token } = (0, theme_1.useToken)();
    const { value, defaultValue = 0, count = 5, onChange, readOnly, disabled, allowClear, allowHalf, character, size, gap, color, style, } = props;
    const [inner, setInner] = react_1.default.useState(value ?? defaultValue);
    const [hover, setHover] = react_1.default.useState(-1);
    const active = value ?? inner;
    const shown = hover >= 0 ? hover : active;
    const star = size ?? token.fontSizeLG + 2;
    const g = gap ?? token.marginXXS;
    const readonly = readOnly || disabled;
    const filledColor = color ?? token.colorWarning;
    const emptyColor = token.colorFillSecondary;
    const press = (v) => {
        if (readonly)
            return;
        const next = allowClear && v === active ? 0 : v;
        if (value === undefined)
            setInner(next);
        onChange && onChange(next);
    };
    return (react_1.default.createElement(components_1.View, { style: [{ flexDirection: 'row', alignItems: 'center' }, style] }, Array.from({ length: count }).map((_, i) => {
        const idx = i + 1;
        const fill = shown >= idx ? 'full' : allowHalf && shown >= idx - 0.5 ? 'half' : 'empty';
        return (react_1.default.createElement(RateStar, { key: i, idx: idx, fill: fill, star: star, filledColor: filledColor, emptyColor: emptyColor, character: character, allowHalf: !!allowHalf, marginRight: g, readonly: !!readonly, onHover: (v) => !readonly && setHover(v), onLeave: () => !readonly && setHover(-1), onPress: press }));
    })));
}
exports.default = Rate;
