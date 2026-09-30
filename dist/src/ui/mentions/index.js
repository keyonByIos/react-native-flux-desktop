"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Mentions = Mentions;
// MENTIONS：提及组件。TextArea + 「@触发词」检测 + 过滤建议面板。
// 本栈 EditableController 不暴露光标位，故采用「尾部 token 检测」策略：仅当文本以
// `@查询串`（无空白）结尾时弹面板——覆盖绝大多数「打字到末尾」场景；选点替换尾部 token。
// 面板定位沿用 AutoComplete 范式：实测宿主盒宽、面板贴其下方、延迟关闭化解失焦/点击竞态。
const react_1 = __importDefault(require("react"));
const components_1 = require("../../components");
const theme_1 = require("../../theme");
const text_area_1 = require("../text-area");
const FadeIn_1 = require("../../anim/FadeIn");
const norm = (o) => (typeof o === 'string' ? { value: o } : o);
function Mentions(props) {
    const { token } = (0, theme_1.useToken)();
    const { value, defaultValue = '', options, prefix = '@', placeholder, disabled, autoFocus, rows, maxHeight = 200, style, onChange, onSelect, } = props;
    const [inner, setInner] = react_1.default.useState(defaultValue);
    const text = value !== undefined ? value : inner;
    const [box, setBox] = react_1.default.useState({ w: 0, h: 0 });
    const [hover, setHover] = react_1.default.useState(null);
    // 尾部 token：文本以 `prefix+非空白串` 结尾（prefix 刚敲下时空查询也命中）
    const p = react_1.default.useMemo(() => new RegExp(`${prefix.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}([^\\s]*)$`), [prefix]);
    const m = p.exec(text);
    const query = m ? m[1] : null;
    const filtered = query === null
        ? []
        : options.map(norm).filter((o) => (query === '' ? true : o.value.toLowerCase().includes(query.toLowerCase())));
    const showPanel = !disabled && query !== null && filtered.length > 0;
    const setText = (v) => {
        if (value === undefined)
            setInner(v);
        onChange && onChange(v);
    };
    const pick = (o) => {
        if (o.disabled || query === null)
            return;
        onSelect && onSelect(o);
        setText(text.slice(0, text.length - (query.length + 1)) + prefix + o.value + ' ');
    };
    return (react_1.default.createElement(components_1.View, { style: [{ position: 'relative' }, style], onLayout: (e) => setBox({ w: e.nativeEvent.layout.w, h: e.nativeEvent.layout.h }) },
        react_1.default.createElement(text_area_1.TextArea, { value: text, placeholder: placeholder, disabled: disabled, autoFocus: autoFocus, rows: rows, onChange: setText }),
        showPanel ? (react_1.default.createElement(components_1.View, { style: {
                position: 'absolute',
                zIndex: 1050,
                left: 0,
                top: box.h + token.marginXXS,
                width: box.w,
            } },
            react_1.default.createElement(FadeIn_1.FadeIn, { duration: 140 },
                react_1.default.createElement(components_1.Pressable, { onPressIn: () => undefined },
                    react_1.default.createElement(components_1.View, { style: {
                            backgroundColor: token.colorBgElevated,
                            borderWidth: token.lineWidth,
                            borderColor: token.colorSplit,
                            borderRadius: token.borderRadiusLG,
                            paddingVertical: token.paddingXXS,
                            shadowColor: 'rgba(0,0,0,0.15)',
                            shadowOpacity: 1,
                            shadowRadius: 12,
                            shadowOffset: { width: 0, height: 4 },
                        } },
                        react_1.default.createElement(components_1.ScrollView, { style: { maxHeight } }, filtered.map((o) => {
                            const active = hover === o.value && !o.disabled;
                            return (react_1.default.createElement(components_1.Pressable, { key: o.value, onPress: () => pick(o), onMouseEnter: () => setHover(o.value), onMouseLeave: () => setHover((h) => (h === o.value ? null : h)), style: {
                                    paddingHorizontal: token.paddingSM,
                                    paddingVertical: token.paddingXS,
                                    backgroundColor: active ? token.colorFillTertiary : 'transparent',
                                    opacity: o.disabled ? 0.4 : 1,
                                    cursor: o.disabled ? 'not-allowed' : 'pointer',
                                } }, typeof o.label === 'string' || o.label == null ? (react_1.default.createElement(components_1.Text, { style: { fontSize: token.fontSize, color: token.colorText } }, o.label ?? o.value)) : (o.label)));
                        }))))))) : null));
}
exports.default = Mentions;
