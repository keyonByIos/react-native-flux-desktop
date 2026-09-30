import { type Easing } from './easing';
import { TransformArray } from '../types';
export interface MotionOptions {

    mode?: 'tween' | 'spring';

    duration?: number;

    easing?: Easing;

    stiffness?: number;

    damping?: number;

    mass?: number;
}

export declare function useMotionValue(target: number, options?: MotionOptions): number;

export declare function useSpring(target: number, config?: {
    stiffness?: number;
    damping?: number;
    mass?: number;
}): number;

export interface TransformSpec {
    translateX?: number;
    translateY?: number;
    scale?: number;
    rotate?: number;
}

export declare function useTransformTween(target: TransformSpec, options?: MotionOptions): TransformArray;
