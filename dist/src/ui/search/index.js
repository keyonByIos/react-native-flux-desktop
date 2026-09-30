"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Search = Search;
// SEARCH：搜索框。Input 的组合封装（对齐 antd Input.Search）：
//   放大镜前缀（可点击触发搜索）+ onSearch（回车 / 点图标 / 点按钮）+ loading 旋转态 + enterButton 附着按钮。
// 纯组合零管线风险：键盘/IME/焦点仍走 Input 既有链路，本组件只管值透传与触发时机。
const react_1 = __importDefault(require("react"));
const components_1 = require("../../components");
const theme_1 = require("../../theme");
const input_1 = require("../input");
const icon_1 = require("../icon");
const button_1 = require("../button");
function Search(props) {
    const { token } = (0, theme_1.useToken)();
    const { onSearch, loading, enterButton, value, defaultValue, onChange, onPressEnter, size, disabled, style, ...rest } = props;
    const [inner, setInner] = react_1.default.useState(defaultValue ?? '');
    const val = value !== undefined ? value : inner;
    const setVal = (v) => {
        if (value === undefined)
            setInner(v);
        onChange && onChange(v);
    };
    const fire = () => {
        if (loading || disabled)
            return;
        onSearch && onSearch(val);
    };
    const prefixNode = (react_1.default.createElement(components_1.Pressable, { onPress: fire, style: { cursor: loading || disabled ? 'not-allowed' : 'pointer' } },
        react_1.default.createElement(icon_1.Icon, { name: loading ? 'loading' : 'search', animate: loading ? 'spin' : undefined, size: token.fontSize, color: disabled ? token.colorTextQuaternary : token.colorTextTertiary })));
    const inputEl = (react_1.default.createElement(input_1.Input, { ...rest, value: val, defaultValue: value === undefined ? defaultValue : undefined, onChange: setVal, onPressEnter: (v) => {
            onPressEnter && onPressEnter(v);
            fire();
        }, size: size, disabled: disabled, prefix: prefixNode, style: enterButton ? { flex: 1, borderTopRightRadius: 0, borderBottomRightRadius: 0 } : style }));
    if (enterButton === undefined || enterButton === false) {
        return react_1.default.createElement(components_1.View, { style: [{ width: '100%' }, style] }, inputEl);
    }
    const iconOnly = enterButton === true;
    return (react_1.default.createElement(components_1.View, { style: [{ flexDirection: 'row', alignItems: 'center', width: '100%' }, style] },
        inputEl,
        react_1.default.createElement(button_1.Button, { type: "primary", size: size === 'large' ? 'large' : size === 'small' ? 'small' : 'middle', loading: loading, disabled: disabled, onClick: fire, icon: iconOnly ? react_1.default.createElement(icon_1.Icon, { name: "search", size: token.fontSize, color: "#fff" }) : undefined, style: { borderTopLeftRadius: 0, borderBottomLeftRadius: 0, marginLeft: -token.lineWidth } }, iconOnly ? null : enterButton)));
}
exports.default = Search;
