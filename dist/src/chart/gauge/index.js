"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GaugeChart = GaugeChart;
// Gauge：仪表盘。方形画布，Icon raw path 描边弧（round cap）——轨道 + 值弧，缺口在底（270° 环）。
// 入场：值弧扫角 0→目标（复用 arcPath 与 Progress 同款做法）。中心显示数值 / 单位。
const react_1 = __importDefault(require("react"));
const components_1 = require("../../components");
const theme_1 = require("../../theme");
const icon_1 = require("../../ui/icon");
const common_1 = require("../core/common");
const geometry_1 = require("../core/geometry");
const theme_2 = require("../core/theme");
const START = 225; // 12 点为 0、顺时针：225° 起、扫 270°，缺口居中在底
const TOTAL = 270;
function GaugeChart(props) {
    const theme = (0, common_1.useChartTheme)();
    const { token } = (0, theme_1.useToken)();
    const { value = 0, max = 100, size = 200, strokeWidth, color, title, formatter, animation = true, animateDuration = 1100, tooltip = true, style, } = props;
    const p = (0, common_1.useEnter)(animation, animateDuration);
    const stroke = strokeWidth ?? Math.round(size * 0.1);
    const cx = size / 2;
    const cy = size / 2;
    const r = (size - stroke) / 2 - 2;
    const frac = Math.max(0, Math.min(1, value / (max || 1)));
    const auto = frac >= 0.85 ? token.colorError : frac >= 0.6 ? token.colorWarning : token.colorPrimary;
    const valColor = color ?? auto;
    const trackD = (0, geometry_1.arcPath)(cx, cy, r, START, TOTAL - 0.01);
    const valueD = (0, geometry_1.arcPath)(cx, cy, r, START, TOTAL * frac * p);
    const label = formatter ? formatter(value) : (Math.round(frac * 100) + '%');
    // 悬浮：值弧端点标记点 + 数值气泡（抓帧可由 FLUX_CHART_HOVER=1 预设）
    const [hover, setHover] = react_1.default.useState(() => {
        const env = typeof process !== 'undefined' ? process.env.FLUX_CHART_HOVER : undefined;
        return env != null && Number(env) === 1;
    });
    const tipAngle = START + TOTAL * frac * p;
    const [tipX, tipY] = (0, geometry_1.polar)(cx, cy, r, tipAngle);
    const rawLabel = formatter ? formatter(value) : String(value);
    return (react_1.default.createElement(components_1.View, { style: [{ width: size, height: size, alignItems: 'center', justifyContent: 'center', position: 'relative' }, style] },
        react_1.default.createElement(icon_1.Icon, { path: trackD, vb: size, size: size, color: theme.fillTrack, strokeWidth: stroke }),
        react_1.default.createElement(components_1.View, { style: { position: 'absolute', left: 0, top: 0 } },
            react_1.default.createElement(icon_1.Icon, { path: valueD, vb: size, size: size, color: valColor, strokeWidth: stroke })),
        react_1.default.createElement(components_1.View, { style: { position: 'absolute', left: 0, top: 0, width: size, height: size, alignItems: 'center', justifyContent: 'center' } },
            react_1.default.createElement(components_1.Text, { style: { fontSize: size * 0.2, fontWeight: '600', color: hover ? valColor : token.colorText } }, label),
            title ? react_1.default.createElement(components_1.Text, { style: { fontSize: token.fontSizeSM, color: token.colorTextTertiary, marginTop: 2 } }, title) : null),
        tooltip ? (react_1.default.createElement(components_1.Pressable, { onMouseEnter: () => setHover(true), onMouseLeave: () => setHover(false), style: { position: 'absolute', left: 0, top: 0, width: size, height: size } })) : null,
        tooltip && hover && frac > 0 ? (react_1.default.createElement(react_1.default.Fragment, null,
            react_1.default.createElement(components_1.View, { style: { position: 'absolute', left: tipX - 5, top: tipY - 5, width: 10, height: 10, borderRadius: 5, borderWidth: 2, borderColor: valColor, backgroundColor: theme.tooltipBg } }),
            react_1.default.createElement(components_1.View, { style: { position: 'absolute', left: size / 2 - 70, top: size + 4, width: 140, backgroundColor: theme.tooltipBg, borderRadius: 6, padding: 8, gap: 4 } },
                react_1.default.createElement(components_1.View, { style: { flexDirection: 'row', justifyContent: 'space-between' } },
                    react_1.default.createElement(components_1.Text, { style: { fontSize: theme.labelSize, color: theme.tooltipText, opacity: 0.7 } }, "\u6570\u503C"),
                    react_1.default.createElement(components_1.Text, { style: { fontSize: theme.labelSize, color: valColor, fontWeight: '600' } }, rawLabel)),
                react_1.default.createElement(components_1.View, { style: { flexDirection: 'row', justifyContent: 'space-between' } },
                    react_1.default.createElement(components_1.Text, { style: { fontSize: theme.labelSize, color: theme.tooltipText, opacity: 0.7 } }, "\u5360\u6BD4"),
                    react_1.default.createElement(components_1.Text, { style: { fontSize: theme.labelSize, color: theme.tooltipText, fontWeight: '600' } }, `${Math.round(frac * 100)}%`)),
                react_1.default.createElement(components_1.View, { style: { flexDirection: 'row', justifyContent: 'space-between' } },
                    react_1.default.createElement(components_1.Text, { style: { fontSize: theme.labelSize, color: theme.tooltipText, opacity: 0.7 } }, "\u4E0A\u9650"),
                    react_1.default.createElement(components_1.Text, { style: { fontSize: theme.labelSize, color: (0, theme_2.withAlpha)(theme.tooltipText, 'AA') } }, formatter ? formatter(max) : String(max)))))) : null));
}
exports.default = GaugeChart;
