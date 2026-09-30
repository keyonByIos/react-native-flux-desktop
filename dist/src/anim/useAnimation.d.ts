import { type Easing } from './easing';
export interface AnimationOptions {

    duration?: number;

    delay?: number;

    loop?: boolean;

    easing?: Easing;

    playing?: boolean;
}
export declare function useAnimation(options?: AnimationOptions): number;
