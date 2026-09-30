import { type Easing } from './easing';
import { TransformArray } from '../types';
export interface MotionOptions {
    /** 'tween' 定时补间（默认）| 'spring' 物理弹簧 */
    mode?: 'tween' | 'spring';
    /** tween 时长（ms） */
    duration?: number;
    /** tween 缓动函数 */
    easing?: Easing;
    /** spring 刚度（越大越快越硬） */
    stiffness?: number;
    /** spring 阻尼（越大越少回弹） */
    damping?: number;
    /** spring 质量 */
    mass?: number;
}
/**
 * 单一订阅循环内按 mode 分支：tween 走定时缓动，spring 走半隐式欧拉积分（子步保稳）。
 * 只在 hook 顶层调用一次 subscribe，规避「条件调用 hook」。静止即退订，不空转。
 */
export declare function useMotionValue(target: number, options?: MotionOptions): number;
/** 物理弹簧值：target 变化时从当前速度继续，适合交互/手势。config 用原始值传入避免每帧换引用重启。 */
export declare function useSpring(target: number, config?: {
    stiffness?: number;
    damping?: number;
    mass?: number;
}): number;
/** 变换目标（各分量可选，缺省按恒等：位移 0、缩放 1、旋转 0）。 */
export interface TransformSpec {
    translateX?: number;
    translateY?: number;
    scale?: number;
    rotate?: number;
}
/**
 * 把目标变换逐分量平滑到最新值，返回可直接用于 style.transform 的数组。
 * 分量固定调用 4 次 useMotionValue（不随 target 键增减而变），符合 hook 规则。
 * 全部落回恒等时 parseTransform 返回 null → painter 走快速路径，静止零开销。
 */
export declare function useTransformTween(target: TransformSpec, options?: MotionOptions): TransformArray;
