"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Statistic = Statistic;
// Statistic：数值展示。小标题 + 大号数值，可带前后缀。
// animation 开启时数值从 0 补间到目标（count-up），千分位格式化自动叠加。
const react_1 = __importDefault(require("react"));
const components_1 = require("../../components");
const useTween_1 = require("../../anim/useTween");
const easing_1 = require("../../anim/easing");
const theme_1 = require("../../theme");
/** 千分位：只处理整数部分，小数/前缀字符原样保留 */
function groupDigits(raw, sep) {
    const m = /^(-?\d+)(\.\d+)?$/.exec(raw);
    if (!m)
        return raw;
    const int = m[1].replace(/^-/, '');
    const grouped = int.replace(/\B(?=(\d{3})+(?!\d))/g, sep);
    return (raw.startsWith('-') ? '-' : '') + grouped + (m[2] ?? '');
}
function Statistic(props) {
    const { token, getComponentToken } = (0, theme_1.useToken)();
    const ct = getComponentToken('Statistic');
    const { title, value, prefix, suffix, animation, groupSeparator = ',', precision, loading, formatter, valueStyle, style } = props;
    const isNum = typeof value === 'number' && Number.isFinite(value);
    const tweened = (0, useTween_1.useTween)(isNum && animation ? value : 0, 1200, easing_1.easeOutCubic);
    const shown = (() => {
        if (formatter)
            return formatter(value);
        if (!isNum)
            return value;
        const target = value;
        const decimals = precision !== undefined
            ? precision
            : String(target).includes('.')
                ? (String(target).split('.')[1] ?? '').length
                : 0;
        const cur = animation ? tweened : target;
        const fixed = cur.toFixed(decimals);
        return groupSeparator === false ? fixed : groupDigits(fixed, groupSeparator);
    })();
    // 坑告：loading 翻转回真值时，大字号数值行的测量高不重排（停在骨架小高），后续兄弟会叠上来——
    // 调用方勿对已挂载的 Statistic 做 loading false↔true 切换（要切整块重挂 key）。
    if (loading) {
        return (react_1.default.createElement(components_1.View, { style: style },
            title != null ? (react_1.default.createElement(components_1.Text, { style: { fontSize: ct.titleFontSize, color: token.colorTextTertiary, marginBottom: token.marginXXS } }, title)) : null,
            react_1.default.createElement(components_1.View, { style: {
                    width: ct.contentFontSize * 4,
                    height: ct.contentFontSize,
                    borderRadius: token.borderRadius,
                    backgroundColor: token.colorFillSecondary,
                } })));
    }
    return (react_1.default.createElement(components_1.View, { style: style },
        title != null ? (react_1.default.createElement(components_1.Text, { style: { fontSize: ct.titleFontSize, color: token.colorTextTertiary, marginBottom: token.marginXXS } }, title)) : null,
        react_1.default.createElement(components_1.View, { style: { flexDirection: 'row', alignItems: 'baseline', flexShrink: 0 } },
            prefix != null ? react_1.default.createElement(components_1.Text, { style: { fontSize: ct.contentFontSize, color: token.colorText, marginRight: token.marginXXS } }, prefix) : null,
            react_1.default.createElement(components_1.Text, { style: [{ fontSize: ct.contentFontSize, fontWeight: '500', color: token.colorText }, valueStyle] }, shown),
            suffix != null ? react_1.default.createElement(components_1.Text, { style: { fontSize: ct.titleFontSize, color: token.colorTextTertiary, marginLeft: token.marginXXS } }, suffix) : null)));
}
