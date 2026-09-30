"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PriceCard = PriceCard;
exports.PriceTable = PriceTable;
// PriceCard / PriceTable：定价方案卡（Pro 高阶组件）。
// 一张卡 = 一个方案：名称 + 描述 + 大字价格（前缀币种 + 后缀周期）+ 权益清单（含/不含打勾打叉）+ CTA 按钮。
// recommended 变体：主色描边加粗 + 顶部角标「推荐」+ 主色按钮，用于引导视线聚焦。
// PriceTable：一排方案卡等分并排，推荐卡靠边框/角标自然聚焦。
// 纯组合既有 Button/Icon/Text/View，零图表依赖，几何与颜色取自 token，明暗自适应。
const react_1 = __importDefault(require("react"));
const components_1 = require("../../components");
const theme_1 = require("../../theme");
const button_1 = require("../../ui/button");
const icon_1 = require("../../ui/icon");
function PriceCard(props) {
    const { token } = (0, theme_1.useToken)();
    const { name, description, price, currency, period, note, features = [], actionText = '立即购买', onAction, recommended, badge = '推荐', style, } = props;
    const borderColor = recommended ? token.colorPrimary : token.colorBorderSecondary;
    const formatPrice = typeof price === 'number' ? price.toLocaleString() : price;
    return (react_1.default.createElement(components_1.View, { style: [
            {
                padding: token.paddingLG,
                gap: token.marginSM,
                borderRadius: token.borderRadiusLG,
                borderWidth: recommended ? 2 : 1,
                borderColor,
                backgroundColor: token.colorBgContainer,
                minWidth: 240,
            },
            style,
        ] },
        recommended ? (react_1.default.createElement(components_1.View, { style: {
                alignSelf: 'flex-end',
                paddingHorizontal: token.paddingSM,
                paddingVertical: 2,
                borderRadius: token.borderRadiusSM,
                backgroundColor: token.colorPrimary,
            } },
            react_1.default.createElement(components_1.Text, { style: { fontSize: token.fontSizeSM, color: '#fff', lineHeight: 18 } }, badge))) : null,
        react_1.default.createElement(components_1.View, { style: { gap: token.marginXXS } },
            react_1.default.createElement(components_1.Text, { style: { fontSize: token.fontSizeLG, fontWeight: '600', color: token.colorText } }, name),
            description != null ? (react_1.default.createElement(components_1.Text, { style: { fontSize: token.fontSizeSM, color: token.colorTextTertiary } }, description)) : null),
        react_1.default.createElement(components_1.View, { style: { flexDirection: 'row', alignItems: 'flex-end', gap: 4 } },
            currency != null ? (react_1.default.createElement(components_1.Text, { style: { fontSize: token.fontSizeLG, color: token.colorTextSecondary, marginBottom: 6 } }, currency)) : null,
            react_1.default.createElement(components_1.Text, { style: { fontSize: token.fontSizeXL + 8, fontWeight: '700', color: recommended ? token.colorPrimary : token.colorText, lineHeight: 40 } }, formatPrice),
            period != null ? (react_1.default.createElement(components_1.Text, { style: { fontSize: token.fontSizeSM, color: token.colorTextTertiary, marginBottom: 6 } }, period)) : null),
        note != null ? (react_1.default.createElement(components_1.Text, { style: { fontSize: token.fontSizeSM, color: token.colorTextTertiary, marginTop: -token.marginXXS } }, note)) : null,
        react_1.default.createElement(components_1.View, { style: { height: 1, backgroundColor: token.colorBorderSecondary } }),
        react_1.default.createElement(components_1.View, { style: { gap: token.marginXS } }, features.map((f, i) => (react_1.default.createElement(FeatureRow, { key: i, label: f.label, included: f.included ?? true })))),
        react_1.default.createElement(button_1.Button, { type: recommended ? 'primary' : 'default', block: true, shape: "round", onPress: onAction, style: { marginTop: token.marginXS } }, actionText)));
}
/** 单条权益：打勾（含）/ 打叉（不含，文案置灰）/ 加号（增值） */
function FeatureRow(props) {
    const { token } = (0, theme_1.useToken)();
    const { label, included } = props;
    const isPlus = included === 'plus';
    const on = included === true || isPlus;
    const color = isPlus ? token.colorWarning : on ? token.colorSuccess : token.colorTextQuaternary;
    const iconName = isPlus ? 'plus' : on ? 'check' : 'close';
    const textColor = on ? token.colorText : token.colorTextQuaternary;
    return (react_1.default.createElement(components_1.View, { style: { flexDirection: 'row', alignItems: 'center', gap: token.marginXS } },
        react_1.default.createElement(components_1.View, { style: { width: 16, alignItems: 'center' } },
            react_1.default.createElement(icon_1.Icon, { name: iconName, size: 14, color: color })),
        react_1.default.createElement(components_1.Text, { style: { fontSize: token.fontSize, color: textColor, flex: 1 } }, label)));
}
/** 方案卡组：每行最多 perRow 张等分等高，超量按行分组；末行补空位保持卡宽对齐。
 *  等高靠行容器 alignItems:stretch 直接把卡片盒拉伸到行高（行高=同行最高卡内容），
 *  勿用 height:'100%'——在 ScrollView 内本 Yoga 会把 100% 解析到定高滚动视口，致卡片被拉到整屏高。 */
function PriceTable(props) {
    const { items, itemWidth, perRow = 4, style } = props;
    const { token } = (0, theme_1.useToken)();
    const rows = [];
    for (let i = 0; i < items.length; i += perRow)
        rows.push(items.slice(i, i + perRow));
    return (react_1.default.createElement(components_1.View, { style: [{ gap: token.marginMD }, style] }, rows.map((row, ri) => (react_1.default.createElement(components_1.View, { key: ri, style: { flexDirection: 'row', alignItems: 'stretch', gap: token.marginMD } },
        row.map((it, i) => (react_1.default.createElement(PriceCard, { key: i, ...it, style: itemWidth != null ? { width: itemWidth } : { flex: 1, minWidth: 0 } }))),
        itemWidth == null && row.length < perRow
            ? Array.from({ length: perRow - row.length }, (_, k) => react_1.default.createElement(components_1.View, { key: `ph${k}`, style: { flex: 1 } }))
            : null)))));
}
exports.default = PriceCard;
