import { TransformArray } from '../types';
import { type Easing } from './easing';
export interface AnimState {
    opacity?: number;
    translateX?: number;
    translateY?: number;
    scale?: number;
    rotate?: number;
}
export interface AnimPreset {
    /** 入场/退场共用时长（ms） */
    duration: number;
    easing: Easing;
    /** 隐藏态（进度 0） */
    from: AnimState;
}
declare const IDLE: AnimState;
/** 按进度 p∈[0,1] 把预设插值成绘制样式（p=1 落位、p=0 隐藏态）。 */
export declare function styleAt(preset: AnimPreset, p: number): {
    opacity: number;
    transform: TransformArray;
};
/** 预设库：命名对齐 framer-motion / antd 惯例。 */
export declare const presets: {
    /** 纯淡入淡出 */
    fade: {
        duration: number;
        easing: Easing;
        from: {
            opacity: number;
        };
    };
    /** 从下方上滑落位（最常用入场） */
    slideUp: {
        duration: number;
        easing: Easing;
        from: {
            opacity: number;
            translateY: number;
        };
    };
    /** 从上方下滑落位（下拉面板/通知） */
    slideDown: {
        duration: number;
        easing: Easing;
        from: {
            opacity: number;
            translateY: number;
        };
    };
    /** 从右侧滑入（抽屉/侧栏） */
    slideLeft: {
        duration: number;
        easing: Easing;
        from: {
            opacity: number;
            translateX: number;
        };
    };
    /** 从左侧滑入 */
    slideRight: {
        duration: number;
        easing: Easing;
        from: {
            opacity: number;
            translateX: number;
        };
    };
    /** 缩放弹出：略过冲回弹，适合气泡/弹窗 */
    pop: {
        duration: number;
        easing: Easing;
        from: {
            opacity: number;
            scale: number;
        };
    };
    /** 弹性放大：多次回弹，适合俏皮场合 */
    bounce: {
        duration: number;
        easing: Easing;
        from: {
            opacity: number;
            scale: number;
        };
    };
    /** 弹簧落位（ζ=0.7 近似不过冲） */
    springUp: {
        duration: number;
        easing: Easing;
        from: {
            opacity: number;
            translateY: number;
        };
    };
};
export type PresetName = keyof typeof presets;
export { IDLE };
