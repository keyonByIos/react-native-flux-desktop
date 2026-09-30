"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.IDLE = exports.presets = void 0;
exports.styleAt = styleAt;
const easing_1 = require("./easing");
const IDLE = { opacity: 1, translateX: 0, translateY: 0, scale: 1, rotate: 0 };
exports.IDLE = IDLE;
/** 按进度 p∈[0,1] 把预设插值成绘制样式（p=1 落位、p=0 隐藏态）。 */
function styleAt(preset, p) {
    const f = preset.from;
    const mix = (from, to) => from + (to - from) * p;
    return {
        opacity: mix(f.opacity ?? 1, 1),
        transform: [
            { translateX: mix(f.translateX ?? 0, 0) },
            { translateY: mix(f.translateY ?? 0, 0) },
            { scale: mix(f.scale ?? 1, 1) },
            { rotate: `${mix(f.rotate ?? 0, 0)}deg` },
        ],
    };
}
/** 预设库：命名对齐 framer-motion / antd 惯例。 */
exports.presets = {
    /** 纯淡入淡出 */
    fade: { duration: 240, easing: easing_1.easeOutCubic, from: { opacity: 0 } },
    /** 从下方上滑落位（最常用入场） */
    slideUp: { duration: 320, easing: easing_1.easeOutCubic, from: { opacity: 0, translateY: 24 } },
    /** 从上方下滑落位（下拉面板/通知） */
    slideDown: { duration: 320, easing: easing_1.easeOutCubic, from: { opacity: 0, translateY: -24 } },
    /** 从右侧滑入（抽屉/侧栏） */
    slideLeft: { duration: 320, easing: easing_1.easeOutCubic, from: { opacity: 0, translateX: 24 } },
    /** 从左侧滑入 */
    slideRight: { duration: 320, easing: easing_1.easeOutCubic, from: { opacity: 0, translateX: -24 } },
    /** 缩放弹出：略过冲回弹，适合气泡/弹窗 */
    pop: { duration: 300, easing: easing_1.easeOutBack, from: { opacity: 0, scale: 0.8 } },
    /** 弹性放大：多次回弹，适合俏皮场合 */
    bounce: { duration: 640, easing: easing_1.easeOutElastic, from: { opacity: 0, scale: 0.6 } },
    /** 弹簧落位（ζ=0.7 近似不过冲） */
    springUp: { duration: 520, easing: (0, easing_1.spring)({ dampingRatio: 0.7, frequency: 2.2 }), from: { opacity: 0, translateY: 32 } },
};
