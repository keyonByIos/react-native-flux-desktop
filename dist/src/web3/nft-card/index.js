"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.NFTCard = NFTCard;
// NFTCard：NFT 藏品卡片展示（参照 @ant-design/web3 NFTCard，仅展示）。
// 复用现成 Card（cover 封面）+ Tag（代币标准）+ Address（合约，截断/复制/二维码）+ TokenPrice（价格）。
// 本组件只做数据编排与排版，不含交易/连接等交互；封面为图片，斜角/圆角均由 Card 外框 overflow 裁切。
const react_1 = __importDefault(require("react"));
const components_1 = require("../../components");
const theme_1 = require("../../theme");
const card_1 = require("../../ui/card");
const tag_1 = require("../../ui/tag");
const divider_1 = require("../../ui/divider");
const address_1 = require("../address");
const token_price_1 = require("../token-price");
function NFTCard(props) {
    const { token: tk } = (0, theme_1.useToken)();
    const { name, collection, standard, contract, tokenId, image, coverHeight = 200, price, priceLabel = '当前价格', chain, style, } = props;
    const cover = image == null ? null : typeof image === 'string' ? (react_1.default.createElement(components_1.View, { style: { width: '100%', height: coverHeight } },
        react_1.default.createElement(components_1.Image, { source: image, resizeMode: "cover", style: { width: '100%', height: coverHeight } }))) : (react_1.default.createElement(components_1.View, { style: { width: '100%', height: coverHeight } }, image));
    return (react_1.default.createElement(card_1.Card, { style: [{ width: 280 }, style], cover: cover },
        react_1.default.createElement(components_1.View, { style: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' } },
            react_1.default.createElement(components_1.Text, { style: { fontSize: tk.fontSizeLG, fontWeight: '600', color: tk.colorText, flexShrink: 1 }, numberOfLines: 1 }, name),
            standard ? react_1.default.createElement(tag_1.Tag, { color: "processing" }, standard) : null),
        collection ? (react_1.default.createElement(components_1.Text, { style: { fontSize: tk.fontSizeSM, color: tk.colorTextSecondary, marginTop: 2 } },
            collection,
            tokenId != null ? ` #${tokenId}` : '')) : null,
        contract ? (react_1.default.createElement(components_1.View, { style: { marginTop: tk.marginSM } },
            react_1.default.createElement(components_1.Text, { style: { fontSize: tk.fontSizeSM, color: tk.colorTextTertiary, marginBottom: tk.marginXXS } }, "\u5408\u7EA6\u5730\u5740"),
            react_1.default.createElement(address_1.Address, { address: contract, chain: chain, size: "small", prefix: false }))) : null,
        price ? (react_1.default.createElement(react_1.default.Fragment, null,
            react_1.default.createElement(components_1.View, { style: { marginVertical: tk.marginSM } },
                react_1.default.createElement(divider_1.Divider, null)),
            react_1.default.createElement(components_1.Text, { style: { fontSize: tk.fontSizeSM, color: tk.colorTextTertiary, marginBottom: tk.marginXXS } }, priceLabel),
            react_1.default.createElement(token_price_1.TokenPrice, { token: price.token, amount: price.amount, fiatPrice: price.fiatPrice, size: "small" }))) : null));
}
exports.default = NFTCard;
