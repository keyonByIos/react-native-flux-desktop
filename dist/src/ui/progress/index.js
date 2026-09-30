"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Progress = Progress;
// Progress：线性 / 环形 / 仪表盘三种进度。轨道用 remainingColor，填充按 status 选语义色。
// 环形/仪表盘通过 Icon 的 raw path 能力绘制圆弧（Path2D 描边，round cap），入场从 0 缓动扫到目标。
const react_1 = __importDefault(require("react"));
const components_1 = require("../../components");
const theme_1 = require("../../theme");
const icon_1 = require("../icon");
const useAnimation_1 = require("../../anim/useAnimation");
const easing_1 = require("../../anim/easing");
// 极坐标：deg 以 12 点为 0，顺时针增长
function polar(cx, cy, r, deg) {
    const rad = ((deg - 90) * Math.PI) / 180;
    return [cx + r * Math.cos(rad), cy + r * Math.sin(rad)];
}
// 圆弧 path：从 startDeg 顺时针扫 sweepDeg；sweep<=0 返回空串（不绘制）
function arcPath(cx, cy, r, startDeg, sweepDeg) {
    if (sweepDeg <= 0.01)
        return '';
    const s = Math.min(sweepDeg, 359.99);
    const [sx, sy] = polar(cx, cy, r, startDeg);
    const [ex, ey] = polar(cx, cy, r, startDeg + s);
    const large = s > 180 ? 1 : 0;
    return `M ${sx.toFixed(2)} ${sy.toFixed(2)} A ${r.toFixed(2)} ${r.toFixed(2)} 0 ${large} 1 ${ex.toFixed(2)} ${ey.toFixed(2)}`;
}
function Progress(props) {
    const { token, getComponentToken } = (0, theme_1.useToken)();
    const ct = getComponentToken('Progress');
    const { type = 'line', percent = 0, status = 'normal', showInfo = true, size = 'default', width = 120, strokeWidth, strokeColor, trailColor, format, steps, success, gapDegree, gapPosition, style, } = props;
    const clamped = Math.max(0, Math.min(100, percent));
    const enter = (0, useAnimation_1.useAnimation)({ duration: 700, easing: easing_1.easeOutCubic });
    const breathe = (0, useAnimation_1.useAnimation)({ duration: 1600, loop: true, easing: easing_1.sinePulse, playing: status === 'active' });
    const shown = clamped * enter;
    const fillColor = strokeColor ??
        (status === 'exception'
            ? token.colorError
            : status === 'success' || clamped >= 100
                ? token.colorSuccess
                : token.colorPrimary);
    const trail = trailColor ?? ct.remainingColor;
    if (type === 'circle' || type === 'dashboard') {
        const stroke = strokeWidth ?? Math.round(width * 0.09);
        const c = width / 2;
        const r = (width - stroke) / 2;
        // circle 默认满环（gap=0、缺口在顶）；dashboard 默认底部留 75° 缺口
        const gp = gapPosition ?? (type === 'dashboard' ? 'bottom' : 'top');
        const gapDeg = type === 'dashboard' ? Math.max(0, Math.min(290, gapDegree ?? 75)) : Math.max(0, gapDegree ?? 0);
        const totalSweep = 360 - gapDeg;
        const gapCenter = gp === 'top' ? 0 : gp === 'right' ? 90 : gp === 'left' ? 270 : 180;
        const start = (((gapCenter + gapDeg / 2) % 360) + 360) % 360;
        const trackD = arcPath(c, c, r, start, totalSweep - 0.01);
        const progD = arcPath(c, c, r, start, (shown / 100) * totalSweep);
        const label = format ? format(clamped) : Math.round(clamped) + '%';
        return (react_1.default.createElement(components_1.View, { style: [{ width, height: width, alignItems: 'center', justifyContent: 'center' }, style] },
            react_1.default.createElement(icon_1.Icon, { path: trackD, vb: width, size: width, color: trail, strokeWidth: stroke }),
            react_1.default.createElement(components_1.View, { style: { position: 'absolute', left: 0, top: 0 } },
                react_1.default.createElement(icon_1.Icon, { path: progD, vb: width, size: width, color: fillColor, strokeWidth: stroke })),
            showInfo ? (react_1.default.createElement(components_1.View, { style: { position: 'absolute', left: 0, top: 0, width, height: width, alignItems: 'center', justifyContent: 'center' } }, status === 'exception' ? (react_1.default.createElement(icon_1.Icon, { name: "close", size: width * 0.28, color: token.colorError, strokeWidth: 2.5 })) : status === 'success' ? (react_1.default.createElement(icon_1.Icon, { name: "check", size: width * 0.28, color: token.colorSuccess, strokeWidth: 2.5 })) : (react_1.default.createElement(components_1.Text, { style: { fontSize: width * 0.2, fontWeight: '500', color: token.colorText } }, label)))) : null));
    }
    // line
    const thickness = size === 'small' ? ct.lineSizeSM : size === 'large' ? ct.lineSizeLG : ct.lineSize;
    const lineLabel = format ? format(clamped) : Math.round(clamped) + '%';
    const infoNode = showInfo ? (react_1.default.createElement(components_1.View, { style: {
            marginLeft: token.marginXS,
            minWidth: ct.innerFontSize * 3,
            alignItems: 'flex-end',
            justifyContent: 'center',
        } }, status === 'exception' ? (react_1.default.createElement(icon_1.Icon, { name: "close", size: ct.innerFontSize * 1.1, color: token.colorError, strokeWidth: 2.5 })) : status === 'success' ? (react_1.default.createElement(icon_1.Icon, { name: "check", size: ct.innerFontSize * 1.1, color: token.colorSuccess, strokeWidth: 2.5 })) : (react_1.default.createElement(components_1.Text, { style: { fontSize: ct.innerFontSize, color: token.colorText, textAlign: 'right' } }, lineLabel)))) : null;
    // 分格进度条：拆成 steps 个等宽色块
    if (steps && steps > 0) {
        const doneCount = Math.round((shown / 100) * steps);
        return (react_1.default.createElement(components_1.View, { style: [{ flexDirection: 'row', alignItems: 'center' }, style] },
            react_1.default.createElement(components_1.View, { style: { flex: 1, flexDirection: 'row' } }, Array.from({ length: steps }).map((_, i) => (react_1.default.createElement(components_1.View, { key: i, style: { flex: 1, height: Math.max(thickness, ct.lineSizeLG), borderRadius: 1, marginRight: i === steps - 1 ? 0 : 2, backgroundColor: i < doneCount ? fillColor : trail } })))),
            infoNode));
    }
    const successPct = success ? Math.max(0, Math.min(100, success.percent ?? 0)) : 0;
    return (react_1.default.createElement(components_1.View, { style: [{ flexDirection: 'row', alignItems: 'center' }, style] },
        react_1.default.createElement(components_1.View, { style: {
                flex: 1,
                position: 'relative',
                height: thickness,
                borderRadius: thickness / 2,
                backgroundColor: trail,
                overflow: 'hidden',
            } },
            react_1.default.createElement(components_1.View, { style: {
                    width: shown + '%',
                    height: '100%',
                    borderRadius: thickness / 2,
                    backgroundColor: fillColor,
                    opacity: status === 'active' ? 0.7 + 0.3 * breathe : 1,
                } }),
            successPct > 0 ? (react_1.default.createElement(components_1.View, { style: {
                    position: 'absolute',
                    left: 0,
                    top: 0,
                    width: successPct + '%',
                    height: '100%',
                    borderRadius: thickness / 2,
                    backgroundColor: success?.strokeColor ?? token.colorSuccess,
                } })) : null),
        infoNode));
}
