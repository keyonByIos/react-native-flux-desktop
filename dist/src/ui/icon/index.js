"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getIconDef = exports.iconPaths = void 0;
exports.Icon = Icon;
// Icon：token 感知的矢量图标。名字 → SVG path（见 paths.ts），交 painter 走 Path2D 光栅化。
// 不依赖任何图标字体，天生抗锯齿、跨平台一致，彻底规避缺字豆腐块问题。
const react_1 = __importDefault(require("react"));
const theme_1 = require("../../theme");
const paths_1 = require("./paths");
const useAnimation_1 = require("../../anim/useAnimation");
var paths_2 = require("./paths");
Object.defineProperty(exports, "iconPaths", { enumerable: true, get: function () { return paths_2.iconPaths; } });
Object.defineProperty(exports, "getIconDef", { enumerable: true, get: function () { return paths_2.getIconDef; } });
function Icon(props) {
    const { token } = (0, theme_1.useToken)();
    const { name, path, vb, size, color, strokeWidth, rotate, mode: modeProp, style, animate, animateDuration } = props;
    const def = path == null ? (0, paths_1.getIconDef)(String(name)) : null;
    const d = path != null ? path : def ? def.d : '';
    const viewBox = vb != null ? vb : paths_1.ICON_VIEWBOX;
    const side = size ?? token.fontSize;
    const mode = modeProp ?? (path != null ? 'stroke' : def && def.mode === 'fill' ? 'fill' : 'stroke');
    // 内置循环动画：spin 绕心旋转（复用 rotate）· breath 呼吸（transform scale + opacity 脉动，不参与布局）
    const spinning = animate === 'spin';
    const breathing = animate === 'breath';
    const animating = spinning || breathing;
    const p = (0, useAnimation_1.useAnimation)({
        duration: animateDuration ?? (spinning ? 900 : 1800),
        loop: animating,
        playing: animating,
    });
    let effRotate = rotate ?? 0;
    let animStyle;
    if (spinning) {
        effRotate = (rotate ?? 0) + p * 360;
    }
    else if (breathing) {
        // 0→1→0 平滑波（余弦缓入缓出），避免锯齿循环处跳变
        const wave = 0.5 - 0.5 * Math.cos(p * Math.PI * 2);
        animStyle = { opacity: 0.45 + 0.55 * wave, transform: [{ scale: 0.82 + 0.28 * wave }] };
    }
    return react_1.default.createElement('icon', {
        d,
        vb: viewBox,
        mode,
        color: color ?? token.colorText,
        strokeWidth: strokeWidth ?? 2,
        rotate: effRotate,
        style: [{ width: side, height: side }, animStyle, style],
    });
}
exports.default = Icon;
