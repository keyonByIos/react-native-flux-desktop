import { type Easing } from './easing';
export interface AnimationOptions {
    /** 单次时长（ms） */
    duration?: number;
    /** 延迟（ms） */
    delay?: number;
    /** 是否循环 */
    loop?: boolean;
    /** 缓动函数（用 ref 持有，避免每次渲染换引用导致动画重启） */
    easing?: Easing;
    /** 是否播放；false 时直接返回终值 1 */
    playing?: boolean;
}
export declare function useAnimation(options?: AnimationOptions): number;
