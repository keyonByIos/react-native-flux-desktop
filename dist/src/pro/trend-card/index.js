"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TrendCard = TrendCard;
// TrendCard：行情趋势卡（Pro 高阶组件）。名称 + 大字现价（count-up）+ 涨跌额/涨跌幅染色 + 内嵌面积迷你走势。
// 与 StatCard 区分：StatCard 是通用指标（柱条 Spark），TrendCard 面向金融/行情（真实折线 + 现价涨跌语义）。
// 走势线色随涨跌方向；明暗主题自适应（涨跌取语义 token）。
const react_1 = __importDefault(require("react"));
const components_1 = require("../../components");
const theme_1 = require("../../theme");
const statistic_1 = require("../../ui/statistic");
const sparkline_1 = require("../../chart/sparkline");
function TrendCard(props) {
    const { token } = (0, theme_1.useToken)();
    const { name, symbol, price, change, changePercent, prevClose, prefix, precision = 2, series, upColor, downColor, animation = true, sparkHeight = 44, onClick, onPress, style, } = props;
    const fire = onClick ?? onPress;
    const [hover, setHover] = react_1.default.useState(false);
    const [pressed, setPressed] = react_1.default.useState(false);
    const up = upColor ?? token.colorError;
    const down = downColor ?? token.colorSuccess;
    // 涨跌：优先显式 change，其次 price - prevClose
    const resolvedChange = change ?? (prevClose != null ? price - prevClose : 0);
    const isUp = resolvedChange >= 0;
    const dirColor = isUp ? up : down;
    const base = prevClose != null && prevClose !== 0 ? prevClose : price - resolvedChange;
    const resolvedPct = changePercent ?? (base !== 0 ? (resolvedChange / base) * 100 : 0);
    const sign = isUp ? '↑' : '↓';
    const arrow = isUp ? '+' : '';
    const borderCol = hover && fire ? token.colorPrimary : token.colorBorderSecondary;
    const body = (react_1.default.createElement(components_1.View, { style: [
            {
                padding: token.paddingLG,
                gap: token.marginXS,
                borderRadius: token.borderRadiusLG,
                borderWidth: 1,
                borderColor: borderCol,
                backgroundColor: token.colorBgContainer,
            },
            style,
        ] },
        react_1.default.createElement(components_1.View, { style: { flexDirection: 'row', alignItems: 'center', gap: token.marginXS } },
            name != null ? react_1.default.createElement(components_1.Text, { style: { fontSize: token.fontSize, color: token.colorTextSecondary } }, name) : null,
            symbol != null ? (react_1.default.createElement(components_1.View, { style: { paddingHorizontal: 6, borderRadius: token.borderRadiusSM, backgroundColor: token.colorFillSecondary } },
                react_1.default.createElement(components_1.Text, { style: { fontSize: 10, color: token.colorTextTertiary, lineHeight: 16 } }, symbol))) : null),
        react_1.default.createElement(components_1.View, { style: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', gap: token.marginSM } },
            react_1.default.createElement(components_1.View, { style: { gap: 2, flex: 1 } },
                react_1.default.createElement(statistic_1.Statistic, { value: price, prefix: prefix, precision: precision, animation: animation, valueStyle: { fontSize: token.fontSizeXL + 6, fontWeight: '600', color: dirColor } }),
                react_1.default.createElement(components_1.View, { style: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 6 } },
                    react_1.default.createElement(components_1.Text, { style: { fontSize: token.fontSize, color: dirColor, fontWeight: '600', flexShrink: 0 } },
                        sign,
                        " ",
                        Math.abs(resolvedChange).toFixed(precision)),
                    react_1.default.createElement(components_1.Text, { style: { fontSize: token.fontSize, color: dirColor, fontWeight: '600', flexShrink: 0 } }, `${arrow}${resolvedPct.toFixed(2)}%`))),
            series && series.length > 1 ? (react_1.default.createElement(sparkline_1.SparklineChart, { data: series.map((v) => ({ value: v })), type: "area", width: 104, height: sparkHeight, color: dirColor, smooth: true, animation: animation, style: { flexShrink: 0 } })) : null)));
    if (!fire)
        return body;
    return react_1.default.createElement('pressable', {
        onPress: fire,
        onPressIn: () => setPressed(true),
        onPressOut: () => setPressed(false),
        onMouseEnter: () => setHover(true),
        onMouseLeave: () => setHover(false),
        style: [{ opacity: pressed ? 0.85 : 1, cursor: 'pointer', flexShrink: 0 }],
    }, body);
}
exports.default = TrendCard;
