"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.easeOutElastic = exports.sinePulse = exports.easeOutBack = exports.easeInOutCubic = exports.easeOutCubic = exports.easeOutQuad = exports.easeInQuad = exports.linear = void 0;
exports.spring = spring;
const linear = (t) => t;
exports.linear = linear;
const easeInQuad = (t) => t * t;
exports.easeInQuad = easeInQuad;
const easeOutQuad = (t) => t * (2 - t);
exports.easeOutQuad = easeOutQuad;
const easeOutCubic = (t) => 1 - Math.pow(1 - t, 3);
exports.easeOutCubic = easeOutCubic;
const easeInOutCubic = (t) => t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
exports.easeInOutCubic = easeInOutCubic;
/** 先快后慢带回弹，适合入场。 */
const easeOutBack = (t) => {
    const c1 = 1.70158;
    const c3 = c1 + 1;
    return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
};
exports.easeOutBack = easeOutBack;
/** 正弦脉冲：0→1→0，适合呼吸/闪烁。 */
const sinePulse = (t) => 0.5 - 0.5 * Math.cos(t * Math.PI * 2);
exports.sinePulse = sinePulse;
/** 弹性出场（欠阻尼振荡逼近），末端多次回弹，适合俏皮入场。 */
const easeOutElastic = (t) => {
    const c4 = (2 * Math.PI) / 3;
    return t <= 0 ? 0 : t >= 1 ? 1 : Math.pow(2, -10 * t) * Math.sin((t * 10 - 0.75) * c4) + 1;
};
exports.easeOutElastic = easeOutElastic;
/**
 * 阻尼弹簧闭合解（欠阻尼）：输出可 >1（过冲后回摆），t=1 强制收敛到 1。
 * dampingRatio<1 振荡（越小越弹）；>=1 走临界阻尼无过冲。frequency 为每秒振荡周期数（越大越快到位）。
 * 用于「一次性入场/切换」的弹簧感；实时交互/手势跟随请用 useSpring（物理积分，帧率无关）。
 */
function spring(options = {}) {
    const zeta = options.dampingRatio ?? 0.6;
    const freq = options.frequency ?? 3.0;
    const omega = freq * Math.PI * 2;
    if (zeta >= 1) {
        // 临界/过阻尼：指数逼近，无过冲
        return (t) => (t <= 0 ? 0 : t >= 1 ? 1 : 1 - Math.exp(-omega * t) * (1 + omega * t));
    }
    const omegaD = omega * Math.sqrt(1 - zeta * zeta);
    return (t) => {
        if (t <= 0)
            return 0;
        if (t >= 1)
            return 1;
        const e = Math.exp(-zeta * omega * t);
        return 1 - e * (Math.cos(omegaD * t) + ((zeta * omega) / omegaD) * Math.sin(omegaD * t));
    };
}
