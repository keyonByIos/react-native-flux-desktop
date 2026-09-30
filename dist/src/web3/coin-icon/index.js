"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CoinIcon = CoinIcon;
// CoinIcon：区块链币种图标（参照 @ant-design/web3 icons，仅展示）。
// 每个币种由若干着色图层组成：同 viewBox 的 path 叠成一张图，纯色填充走 Icon(mode='fill')，
// 源里 <g translate> 的位移还原成该图层的像素平移；命中失败时用 symbol 哈希派生字母圆牌兜底。
const react_1 = __importDefault(require("react"));
const components_1 = require("../../components");
const theme_1 = require("../../theme");
const icon_1 = require("../../ui/icon");
const svgs_1 = require("./svgs");
const utils_1 = require("../utils");
function CoinIcon(props) {
    const { token } = (0, theme_1.useToken)();
    const { symbol, size = 24, shape = 'plain', bg, style } = props;
    const def = (0, svgs_1.getCoinDef)(symbol);
    // 未命中：字母圆牌兜底（配色由 symbol 哈希派生，确定性、可复现）
    if (!def) {
        const label = ((symbol || '?').trim().replace(/[^A-Za-z0-9]/g, '').slice(0, 3) || '?').toUpperCase();
        const fill = (0, utils_1.hslToHex)((0, utils_1.fnvHash)(label) % 360, 0.55, 0.5);
        return (react_1.default.createElement(components_1.View, { style: [
                {
                    width: size,
                    height: size,
                    borderRadius: shape === 'square' ? token.borderRadiusSM : size / 2,
                    backgroundColor: fill,
                    alignItems: 'center',
                    justifyContent: 'center',
                },
                style,
            ] },
            react_1.default.createElement(components_1.Text, { style: { color: token.colorTextLightSolid, fontSize: size * 0.4, fontWeight: '600' } }, label)));
    }
    const vb = def.vb;
    return (react_1.default.createElement(components_1.View, { style: [
            { width: size, height: size },
            shape !== 'plain'
                ? {
                    borderRadius: shape === 'circle' ? size / 2 : token.borderRadiusSM,
                    overflow: 'hidden',
                    backgroundColor: bg ?? token.colorBgContainer,
                }
                : null,
            style,
        ] }, def.layers.map((ly, i) => {
        const layerStyle = { position: 'absolute', left: 0, top: 0, width: size, height: size };
        if (ly.tx || ly.ty) {
            // 源 <g translate(tx,ty)> 在 vb 坐标系；等比映射为像素平移
            layerStyle.transform = [
                { translateX: ((ly.tx ?? 0) / vb) * size },
                { translateY: ((ly.ty ?? 0) / vb) * size },
            ];
        }
        return react_1.default.createElement(icon_1.Icon, { key: i, path: ly.d, vb: vb, mode: "fill", color: ly.fill, size: size, style: layerStyle });
    })));
}
exports.default = CoinIcon;
