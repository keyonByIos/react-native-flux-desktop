export type Easing = (t: number) => number;
export declare const linear: Easing;
export declare const easeInQuad: Easing;
export declare const easeOutQuad: Easing;
export declare const easeOutCubic: Easing;
export declare const easeInOutCubic: Easing;
/** 先快后慢带回弹，适合入场。 */
export declare const easeOutBack: Easing;
/** 正弦脉冲：0→1→0，适合呼吸/闪烁。 */
export declare const sinePulse: Easing;
/** 弹性出场（欠阻尼振荡逼近），末端多次回弹，适合俏皮入场。 */
export declare const easeOutElastic: Easing;
/**
 * 阻尼弹簧闭合解（欠阻尼）：输出可 >1（过冲后回摆），t=1 强制收敛到 1。
 * dampingRatio<1 振荡（越小越弹）；>=1 走临界阻尼无过冲。frequency 为每秒振荡周期数（越大越快到位）。
 * 用于「一次性入场/切换」的弹簧感；实时交互/手势跟随请用 useSpring（物理积分，帧率无关）。
 */
export declare function spring(options?: {
    dampingRatio?: number;
    frequency?: number;
}): Easing;
