"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TokenPrice = TokenPrice;
// TokenPrice：代币数量的展示（参照 @ant-design/web3 TokenPrice，仅展示）。
// 左侧代币徽标（无图标时用 symbol 哈希派生的字母圆牌），中间「数量 + 符号」主行与「法币估值」副行，
// 右侧涨跌幅药丸（涨绿/跌红语义色，invert 可反转为涨红）。全轴对齐 + 复用现成原子件。
const react_1 = __importDefault(require("react"));
const components_1 = require("../../components");
const theme_1 = require("../../theme");
const utils_1 = require("../utils");
function tokenBadge(symbol, px, fg) {
    const hue = (0, utils_1.fnvHash)(symbol) % 360;
    const bg = (0, utils_1.hslToHex)(hue, 0.55, 0.5);
    const label = symbol ? symbol.slice(0, 2) : '?';
    return (react_1.default.createElement(components_1.View, { style: {
            width: px,
            height: px,
            borderRadius: px / 2,
            backgroundColor: bg,
            alignItems: 'center',
            justifyContent: 'center',
        } },
        react_1.default.createElement(components_1.Text, { style: { fontSize: px * 0.42, fontWeight: '600', color: fg } }, label)));
}
function TokenPrice(props) {
    const { token: tk } = (0, theme_1.useToken)();
    const { token, amount, fiatPrice, change, precision = 4, fiatPrefix = '$', invert = false, size = 'middle', style, } = props;
    const meta = typeof token === 'string' ? { symbol: token } : token;
    const mainFs = size === 'small' ? tk.fontSize : size === 'large' ? tk.fontSizeXL : tk.fontSizeLG;
    const subFs = size === 'small' ? tk.fontSizeSM : tk.fontSize;
    const badgePx = size === 'small' ? tk.controlHeightSM : size === 'large' ? tk.controlHeight : tk.fontSizeLG;
    const up = (change ?? 0) >= 0;
    const upColor = invert ? tk.colorError : tk.colorSuccess;
    const downColor = invert ? tk.colorSuccess : tk.colorError;
    const chgColor = up ? upColor : downColor;
    return (react_1.default.createElement(components_1.View, { style: [{ flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-start' }, style] },
        react_1.default.createElement(components_1.View, { style: { marginRight: tk.marginXS } }, meta.icon ?? tokenBadge(meta.symbol, badgePx, tk.colorTextLightSolid)),
        react_1.default.createElement(components_1.View, { style: { justifyContent: 'center' } },
            react_1.default.createElement(components_1.Text, { style: { fontSize: mainFs, fontWeight: '600', color: tk.colorText } }, `${(0, utils_1.formatAmount)(amount, precision)} ${meta.symbol}`),
            fiatPrice != null ? (react_1.default.createElement(components_1.Text, { style: { fontSize: subFs, color: tk.colorTextSecondary, marginTop: 2 } }, `${fiatPrefix}${(0, utils_1.formatAmount)(amount * fiatPrice, 2)}${meta.name ? ` · ${meta.name}` : ''}`)) : meta.name ? (react_1.default.createElement(components_1.Text, { style: { fontSize: subFs, color: tk.colorTextSecondary, marginTop: 2 } }, meta.name)) : null),
        change != null ? (react_1.default.createElement(components_1.View, { style: {
                marginLeft: tk.marginSM,
                paddingHorizontal: tk.paddingXS,
                paddingVertical: tk.paddingXXS,
                borderRadius: tk.borderRadiusSM,
                backgroundColor: chgColor,
            } },
            react_1.default.createElement(components_1.Text, { style: { fontSize: tk.fontSizeSM, fontWeight: '600', color: tk.colorTextLightSolid } }, (0, utils_1.formatPercent)(change)))) : null));
}
exports.default = TokenPrice;
