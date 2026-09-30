"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AutoComplete = AutoComplete;
// AUTOCOMPLETE：自动完成。Input + 过滤建议下拉。无 portal，面板绝对定位贴输入框下方。
// 失焦与选项点击竞态：onBlur 延迟 150ms 关闭，鼠标移入面板即取消，保证选项点击先于关闭命中。
const react_1 = __importDefault(require("react"));
const components_1 = require("../../components");
const theme_1 = require("../../theme");
const input_1 = require("../input");
const FadeIn_1 = require("../../anim/FadeIn");
function normalize(opt) {
    return typeof opt === 'string' ? { value: opt } : opt;
}
function AutoComplete(props) {
    const { token } = (0, theme_1.useToken)();
    const { options, value, defaultValue = '', placeholder, disabled, allowClear, autoFocus, size = 'middle', filterOption = true, maxHeight = 256, style, onChange, onSelect, onSearch, } = props;
    const [inner, setInner] = react_1.default.useState(defaultValue);
    const text = value !== undefined ? value : inner;
    const [open, setOpen] = react_1.default.useState(!!autoFocus);
    const [hover, setHover] = react_1.default.useState(-1);
    const [box, setBox] = react_1.default.useState({ w: 0, h: 0 });
    const closeTimer = react_1.default.useRef(null);
    const cancelClose = () => {
        if (closeTimer.current) {
            clearTimeout(closeTimer.current);
            closeTimer.current = null;
        }
    };
    const scheduleClose = () => {
        cancelClose();
        closeTimer.current = setTimeout(() => setOpen(false), 150);
    };
    react_1.default.useEffect(() => () => cancelClose(), []);
    const norm = options.map(normalize);
    const filtered = filterOption === false
        ? norm
        : norm.filter((o) => typeof filterOption === 'function'
            ? filterOption(text, o.value)
            : text === '' || o.value.toLowerCase().includes(text.toLowerCase()));
    const showPanel = open && !disabled && filtered.length > 0;
    const setText = (v) => {
        if (value === undefined)
            setInner(v);
        onChange && onChange(v);
        onSearch && onSearch(v);
    };
    const pick = (v) => {
        if (value === undefined)
            setInner(v);
        onChange && onChange(v);
        onSelect && onSelect(v);
        setOpen(false);
    };
    return (react_1.default.createElement(components_1.View, { style: [{ position: 'relative' }, style], onLayout: (e) => setBox({ w: e.nativeEvent.layout.w, h: e.nativeEvent.layout.h }) },
        react_1.default.createElement(input_1.Input, { value: text, placeholder: placeholder, disabled: disabled, allowClear: allowClear, autoFocus: autoFocus, size: size, style: { width: '100%' }, onChange: setText, onFocus: () => setOpen(true), onBlur: scheduleClose }),
        showPanel ? (react_1.default.createElement(components_1.View, { style: {
                position: 'absolute',
                zIndex: 1050,
                left: 0,
                top: box.h + token.marginXXS,
                width: box.w,
            } },
            react_1.default.createElement(FadeIn_1.FadeIn, { duration: 140 },
                react_1.default.createElement(components_1.Pressable, { onPressIn: () => undefined, onMouseEnter: cancelClose, onMouseLeave: scheduleClose },
                    react_1.default.createElement(components_1.View, { style: {
                            backgroundColor: token.colorBgElevated,
                            borderRadius: token.borderRadiusLG,
                            borderWidth: token.lineWidth,
                            borderColor: token.colorSplit,
                            paddingVertical: token.paddingXXS,
                        } },
                        react_1.default.createElement(components_1.ScrollView, { style: { maxHeight } }, filtered.map((o, i) => {
                            const activeItem = o.value === text;
                            const bg = hover === i ? token.colorFillTertiary : activeItem ? token.colorPrimaryBg : 'transparent';
                            return (react_1.default.createElement(components_1.Pressable, { key: `${o.value}-${i}`, onMouseEnter: () => setHover(i), onMouseLeave: () => setHover((h) => (h === i ? -1 : h)), onPress: () => pick(o.value), style: { paddingHorizontal: token.paddingSM, paddingVertical: token.paddingXXS + 2, backgroundColor: bg } }, typeof o.label === 'string' || o.label == null ? (react_1.default.createElement(components_1.Text, { style: {
                                    fontSize: token.fontSize,
                                    color: activeItem ? token.colorPrimaryText : token.colorText,
                                } }, o.label ?? o.value)) : (react_1.default.createElement(components_1.View, null, o.label))));
                        }))))))) : null));
}
exports.default = AutoComplete;
