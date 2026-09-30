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
const components_1 = require("../../components");
const theme_1 = require("../../theme");
const statistic_1 = require("../../ui/statistic");
function StatCard(props) {
    const { title, value, prefix, suffix, precision, animation = true, tag, trend, spark, loading, onClick, onPress, style } = props;
    const { token } = (0, theme_1.useToken)();
    const fire = onClick ?? onPress;
    const [hover, setHover] = react_1.default.useState(false);
    const good = trend ? (trend.direction === 'up') !== !!trend.invert : true;
    const trendColor = trend ? (good ? token.colorSuccess : token.colorError) : token.colorText;
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
            // 非可点时卡片就是行直接子节点，布局 style（flex/width）落在 body 上
            fire ? { flex: 1 } : style,
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
    // 可点时外层是 PressableBox（行直接子节点）：布局 style 转给外层，body 已在内层 flex:1 填满
    return (react_1.default.createElement(PressableBox, { onPress: fire, onHover: setHover, style: [{ minWidth: 0 }, style] }, body));
}
/** 迷你柱条：等高轨道内按比例起高，末条主色高亮当前值；flex:1 均分卡宽铺满底部 */
function Spark(props) {
    const { token } = (0, theme_1.useToken)();
    const H = 36;
    const max = Math.max(...props.bars, 1);
    const min = Math.min(...props.bars, 0);
    const span = max - min || 1;
    return (react_1.default.createElement(components_1.View, { style: { flexDirection: 'row', alignItems: 'flex-end', gap: 3, height: H, flexShrink: 0 } }, props.bars.map((b, i) => {
        const last = i === props.bars.length - 1;
        return (react_1.default.createElement(components_1.View, { key: i, style: {
                flex: 1,
                minWidth: 2,
                height: Math.max(3, ((b - min) / span) * (H - 6) + 6),
                borderRadius: 2,
                backgroundColor: last ? token.colorPrimary : token.colorFillSecondary,
            } }));
    })));
}
/** 可点外壳：有 onPress 时整卡可点（悬停回显由父级 border 高亮，按下轻微压暗） */
function PressableBox(props) {
    const { onPress, onHover, children, style } = props;
    const [pressed, setPressed] = react_1.default.useState(false);
    return react_1.default.createElement('pressable', {
        onPress,
        onPressIn: () => setPressed(true),
        onPressOut: () => setPressed(false),
        onMouseEnter: () => onHover?.(true),
        onMouseLeave: () => onHover?.(false),
        style: [style, { opacity: pressed ? 0.85 : 1, cursor: 'pointer' }],
    }, children);
}
/** 指标卡组：每行最多 perRow 张等分，超量按行分组；末行补空位保持卡宽一致 */
function StatisticGroup(props) {
    const { items, itemWidth, perRow = 4, style } = props;
    const { token } = (0, theme_1.useToken)();
    const rows = [];
    for (let i = 0; i < items.length; i += perRow)
        rows.push(items.slice(i, i + perRow));
    return (react_1.default.createElement(components_1.View, { style: [{ gap: token.marginSM }, style] }, rows.map((row, ri) => (
    // alignItems:stretch（行交叉轴=高）把本行所有卡拉到最高卡的等高；卡片直接作行子节点，
    // flex:1 只作用于主轴（宽），不会把高度 flexBasis:0 压塌（那是包一层列容器时的旧坑）
    react_1.default.createElement(components_1.View, { key: ri, style: { flexDirection: 'row', alignItems: 'stretch', gap: token.marginSM } },
        row.map((it, i) => (react_1.default.createElement(StatCard, { key: i, ...it, style: [itemWidth == null ? { flex: 1, minWidth: 0 } : { width: itemWidth }, it.style] }))),
        itemWidth == null && row.length < perRow
            ? Array.from({ length: perRow - row.length }, (_, k) => react_1.default.createElement(components_1.View, { key: `ph${k}`, style: { flex: 1 } }))
            : null)))));
}
exports.default = StatCard;
