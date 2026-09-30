"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TagInput = TagInput;
// TAG-INPUT：可编辑标签输入。输入文字后回车/逗号确认添加 Tag，点 Tag 上的 × 移除。
// 受控/非受控双模式；支持 maxLength、去重、自定义分隔符。
const react_1 = __importDefault(require("react"));
const components_1 = require("../../components");
const theme_1 = require("../../theme");
const tag_1 = require("../tag");
const input_1 = require("../input");
function TagInput(props) {
    const { token } = (0, theme_1.useToken)();
    const { value: ctrlValue, defaultValue = [], onChange, max, allowDuplicate = false, separators = [',', '，'], placeholder = '输入后回车添加', disabled, tagSize = 'default', style, } = props;
    const [innerTags, setInnerTags] = react_1.default.useState(defaultValue);
    const tags = ctrlValue !== undefined ? ctrlValue : innerTags;
    const [inputVal, setInputVal] = react_1.default.useState('');
    const [focused, setFocused] = react_1.default.useState(false);
    const setTags = (next) => {
        if (ctrlValue === undefined)
            setInnerTags(next);
        onChange && onChange(next);
    };
    const addTag = (raw) => {
        const trimmed = raw.trim();
        if (!trimmed)
            return;
        if (max && tags.length >= max)
            return;
        if (!allowDuplicate && tags.includes(trimmed))
            return;
        setTags([...tags, trimmed]);
    };
    const removeTag = (idx) => {
        if (disabled)
            return;
        const next = [...tags];
        next.splice(idx, 1);
        setTags(next);
    };
    const handleInputChange = (text) => {
        // 检测分隔符：若输入含分隔符则拆分
        let hasSep = false;
        for (const sep of separators) {
            if (text.includes(sep)) {
                hasSep = true;
                const parts = text.split(sep);
                parts.forEach((p) => addTag(p));
                setInputVal('');
                break;
            }
        }
        if (!hasSep)
            setInputVal(text);
    };
    return (react_1.default.createElement(components_1.View, { style: [
            {
                flexDirection: 'row',
                flexWrap: 'wrap',
                alignItems: 'center',
                gap: token.marginXXS,
                minHeight: token.controlHeight,
                paddingHorizontal: token.paddingXS,
                paddingVertical: token.paddingXXS,
                borderWidth: token.lineWidth,
                borderColor: focused ? token.colorPrimary : token.colorBorder,
                borderRadius: token.borderRadius,
                backgroundColor: disabled ? token.colorFillQuaternary : token.colorBgContainer,
            },
            style,
        ] },
        tags.map((t, i) => (react_1.default.createElement(tag_1.Tag, { key: `${t}-${i}`, closable: !disabled, onClose: () => removeTag(i) }, t))),
        !disabled && (!max || tags.length < max) ? (react_1.default.createElement(components_1.View, { style: { minWidth: 80, flex: 1 } },
            react_1.default.createElement(input_1.Input, { value: inputVal, onChange: handleInputChange, onPressEnter: (v) => { addTag(v); setInputVal(''); }, onKeyDown: (key) => {
                    if (separators.includes(key)) {
                        addTag(inputVal);
                        setInputVal('');
                        return true;
                    }
                    if (key === 'Backspace' && inputVal === '' && tags.length > 0) {
                        removeTag(tags.length - 1);
                        return true;
                    }
                }, onFocus: () => setFocused(true), onBlur: () => setFocused(false), placeholder: tags.length === 0 ? placeholder : '', style: { borderWidth: 0, backgroundColor: 'transparent', paddingHorizontal: 0, minWidth: 60 } }))) : null));
}
exports.default = TagInput;
