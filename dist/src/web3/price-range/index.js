"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PriceRange = PriceRange;
// PriceRange：代币价格的区间展示（参照 @ant-design/web3 PriceRange，仅展示）。
// 主行「min – max symbol」，副行可选一条迷你区间轨：底槽 + 已选段（主色）+ 两端游标，全轴对齐矩形。
const react_1 = __importDefault(require("react"));
const components_1 = require("../../components");
const theme_1 = require("../../theme");
const utils_1 = require("../utils");
function badge(symbol, px, fg) {
    const bg = (0, utils_1.hslToHex)((0, utils_1.fnvHash)(symbol) % 360, 0.55, 0.5);
    return (react_1.default.createElement(components_1.View, { style: { width: px, height: px, borderRadius: px / 2, backgroundColor: bg, alignItems: 'center', justifyContent: 'center' } },
        react_1.default.createElement(components_1.Text, { style: { fontSize: px * 0.42, fontWeight: '600', color: fg } }, symbol ? symbol.slice(0, 2) : '?')));
}
function PriceRange(props) {
    const { token: tk } = (0, theme_1.useToken)();
    const { token, min, max, precision = 4, label, showBar = true, barWidth = 200, style } = props;
    const meta = typeof token === 'string' ? { symbol: token } : token;
    return (react_1.default.createElement(components_1.View, { style: [{ alignSelf: 'flex-start' }, style] },
        label ? (react_1.default.createElement(components_1.Text, { style: { fontSize: tk.fontSizeSM, color: tk.colorTextSecondary, marginBottom: tk.marginXXS } }, label)) : null,
        react_1.default.createElement(components_1.View, { style: { flexDirection: 'row', alignItems: 'center' } },
            react_1.default.createElement(components_1.View, { style: { marginRight: tk.marginXS } }, badge(meta.symbol, tk.fontSizeLG, tk.colorTextLightSolid)),
            react_1.default.createElement(components_1.Text, { style: { fontSize: tk.fontSizeLG, fontWeight: '600', color: tk.colorText } }, `${(0, utils_1.formatAmount)(min, precision)} – ${(0, utils_1.formatAmount)(max, precision)} ${meta.symbol}`)),
        showBar ? (react_1.default.createElement(components_1.View, { style: { marginTop: tk.marginXS } },
            react_1.default.createElement(components_1.View, { style: { width: barWidth, height: 4, borderRadius: 2, backgroundColor: tk.colorFillSecondary } }),
            react_1.default.createElement(components_1.View, { style: {
                    marginTop: -4,
                    width: barWidth,
                    height: 4,
                    borderRadius: 2,
                    backgroundColor: tk.colorPrimary,
                } }),
            react_1.default.createElement(components_1.View, { style: { position: 'relative', width: barWidth, height: 0 } },
                react_1.default.createElement(components_1.View, { style: { position: 'absolute', left: 0, top: -6, width: 2, height: 8, borderRadius: 1, backgroundColor: tk.colorPrimary } }),
                react_1.default.createElement(components_1.View, { style: { position: 'absolute', right: 0, top: -6, width: 2, height: 8, borderRadius: 1, backgroundColor: tk.colorPrimary } })))) : null));
}
exports.default = PriceRange;
