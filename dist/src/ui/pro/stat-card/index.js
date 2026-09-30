"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.StatCard = StatCard;
exports.StatisticGroup = StatisticGroup;
// StatCard：仪表盘指标卡（Pro 菜单组件）。标题 + count-up 大数值 + 前后缀 + 趋势角标 + 迷你柱条。
// 组合既有 Statistic 的数值格式化思路，柱条用 flex 等高轨道 + 比例高度自绘，零图表依赖。
// 一张卡 = 一个 StatCard；一排多卡 = StatisticGroup（等分宽 + 间隙）。
const react_1 = __importDefault(require("react"));
const components_1 = require("../../../components");
const theme_1 = require("../../../theme");
const statistic_1 = require("../../statistic");
function StatCard(props) {
    const { title, value, prefix, suffix, precision, animation = true, tag, trend, spark, loading, onClick, onPress, style } = props;
    const { token } = (0, theme_1.useToken)();
    const fire = onClick ?? onPress;
    const good = trend ? (trend.direction === 'up') !== !!trend.invert : true;
    const trendColor = trend ? (good ? token.colorSuccess : token.colorError) : token.colorText;
    const body = (react_1.default.createElement(components_1.View, { style: [
            {
                padding: token.paddingLG,
                gap: token.marginXS,
                borderRadius: token.borderRadiusLG,
                borderWidth: 1,
                borderColor: token.colorBorderSecondary,
                backgroundColor: token.colorBgContainer,
                flexDirection: 'row',
                alignItems: 'flex-end',
                justifyContent: 'space-between',
            },
            style,
        ] },
        react_1.default.createElement(components_1.View, { style: { gap: token.marginXXS } },
            react_1.default.createElement(components_1.View, { style: { flexDirection: 'row', alignItems: 'center', gap: token.marginXS } },
                react_1.default.createElement(components_1.Text, { style: { fontSize: token.fontSize, color: token.colorTextSecondary } }, title),
                tag != null ? (react_1.default.createElement(components_1.View, { style: { paddingHorizontal: 6, borderRadius: token.borderRadiusSM, backgroundColor: token.colorFillSecondary } },
                    react_1.default.createElement(components_1.Text, { style: { fontSize: 10, color: token.colorTextTertiary, lineHeight: 16 } }, tag))) : null),
            react_1.default.createElement(statistic_1.Statistic, { value: value, prefix: prefix, suffix: suffix, precision: precision, animation: animation, loading: loading, valueStyle: { fontSize: token.fontSizeXL + 8, fontWeight: '600' } }),
            trend ? (react_1.default.createElement(components_1.View, { style: { flexDirection: 'row', alignItems: 'center', gap: 4 } },
                react_1.default.createElement(components_1.Text, { style: { fontSize: token.fontSizeSM, color: trendColor, fontWeight: '600' } },
                    trend.direction === 'up' ? '↑' : '↓',
                    " ",
                    trend.value),
                react_1.default.createElement(components_1.Text, { style: { fontSize: token.fontSizeSM, color: token.colorTextTertiary } }, "\u8F83\u4E0A\u671F"))) : null),
        spark && spark.length > 0 ? react_1.default.createElement(Spark, { bars: spark }) : null));
    if (!fire)
        return body;
    return (react_1.default.createElement(PressableBox, { onPress: fire, style: { flexShrink: 0 } }, body));
}
/** 迷你柱条：等高轨道内按比例起高，末条主色高亮当前值 */
function Spark(props) {
    const { token } = (0, theme_1.useToken)();
    const H = 40;
    const max = Math.max(...props.bars, 1);
    const min = Math.min(...props.bars, 0);
    const span = max - min || 1;
    return (react_1.default.createElement(components_1.View, { style: { flexDirection: 'row', alignItems: 'flex-end', gap: 3, height: H } }, props.bars.map((b, i) => {
        const last = i === props.bars.length - 1;
        return (react_1.default.createElement(components_1.View, { key: i, style: {
                width: 7,
                height: Math.max(3, ((b - min) / span) * (H - 6) + 6),
                borderRadius: 2,
                backgroundColor: last ? token.colorPrimary : token.colorFillSecondary,
            } }));
    })));
}
/** 可点外壳：有 onPress 时整卡可点（focus 态轻微压暗） */
function PressableBox(props) {
    const { onPress, children, style } = props;
    const [pressed, setPressed] = react_1.default.useState(false);
    return react_1.default.createElement('pressable', { onPress, onPressIn: () => setPressed(true), onPressOut: () => setPressed(false), style: [style, { opacity: pressed ? 0.85 : 1, cursor: 'pointer' }] }, children);
}
/** 一排指标卡：换行自适应，默认每卡 260 起 */
function StatisticGroup(props) {
    const { items, itemWidth, style } = props;
    const { token } = (0, theme_1.useToken)();
    return (react_1.default.createElement(components_1.View, { style: [{ flexDirection: 'row', flexWrap: 'wrap', gap: token.marginSM }, style] }, items.map((it, i) => (react_1.default.createElement(components_1.View, { key: i, style: { flex: itemWidth == null ? 1 : undefined, minWidth: itemWidth ?? 240 } },
        react_1.default.createElement(StatCard, { ...it }))))));
}
exports.default = StatCard;
