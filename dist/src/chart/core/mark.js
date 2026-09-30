"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Segments = Segments;
exports.Dots = Dots;
// 矩形绘图基元：用「旋转细条 View」拼折线段、用方块 View 拼顶点圆点——
// 这是本管线里在非方形画布上画斜线的既有稳妥手法（Icon raw path 只能方形等比）。
const react_1 = __importDefault(require("react"));
const components_1 = require("../../components");
/** 折线段：相邻点连成旋转细条。pts 为画布绝对坐标；dash 给定 [实段, 空白] 时沿段长拆子条拼虚线。 */
function Segments(props) {
    const { pts, color, width = 2, opacity = 1, dash } = props;
    const segs = [];
    for (let i = 0; i < pts.length - 1; i++) {
        const [x1, y1] = pts[i];
        const [x2, y2] = pts[i + 1];
        const len = Math.hypot(x2 - x1, y2 - y1);
        if (len < 0.5)
            continue;
        const ang = (Math.atan2(y2 - y1, x2 - x1) * 180) / Math.PI;
        if (dash && dash[0] > 0) {
            const on = dash[0];
            const off = Math.max(1, dash[1] ?? 4);
            const period = on + off;
            let k = 0;
            for (let d = 0; d < len; d += period) {
                const segLen = Math.min(on, len - d);
                if (segLen < 0.8)
                    break;
                const r = (d + segLen / 2) / len; // 子条中心沿线比例位置
                const cx = x1 + (x2 - x1) * r;
                const cy = y1 + (y2 - y1) * r;
                segs.push(react_1.default.createElement(components_1.View, { key: `${i}-d${k++}`, style: {
                        position: 'absolute',
                        left: cx - segLen / 2,
                        top: cy - width / 2,
                        width: segLen,
                        height: width,
                        borderRadius: width / 2,
                        backgroundColor: color,
                        opacity,
                        transform: [{ rotate: ang }],
                    } }));
            }
            continue;
        }
        segs.push(react_1.default.createElement(components_1.View, { key: i, style: {
                position: 'absolute',
                left: (x1 + x2) / 2 - len / 2,
                top: (y1 + y2) / 2 - width / 2,
                width: len,
                height: width,
                borderRadius: width / 2,
                backgroundColor: color,
                opacity,
                transform: [{ rotate: ang }],
            } }));
    }
    return react_1.default.createElement(react_1.default.Fragment, null, segs);
}
/** 顶点圆点。 */
function Dots(props) {
    const { pts, color, r = 3, opacity = 1, bg } = props;
    return (react_1.default.createElement(react_1.default.Fragment, null, pts.map((p, i) => (react_1.default.createElement(components_1.View, { key: i, style: {
            position: 'absolute',
            left: p[0] - r,
            top: p[1] - r,
            width: r * 2,
            height: r * 2,
            borderRadius: r,
            backgroundColor: bg ?? color,
            opacity,
            borderWidth: bg ? 1.5 : 0,
            borderColor: color,
        } })))));
}
