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

    duration: number;
    easing: Easing;

    from: AnimState;
}
declare const IDLE: AnimState;

export declare function styleAt(preset: AnimPreset, p: number): {
    opacity: number;
    transform: TransformArray;
};

export declare const presets: {

    fade: {
        duration: number;
        easing: Easing;
        from: {
            opacity: number;
        };
    };

    slideUp: {
        duration: number;
        easing: Easing;
        from: {
            opacity: number;
            translateY: number;
        };
    };

    slideDown: {
        duration: number;
        easing: Easing;
        from: {
            opacity: number;
            translateY: number;
        };
    };

    slideLeft: {
        duration: number;
        easing: Easing;
        from: {
            opacity: number;
            translateX: number;
        };
    };

    slideRight: {
        duration: number;
        easing: Easing;
        from: {
            opacity: number;
            translateX: number;
        };
    };

    pop: {
        duration: number;
        easing: Easing;
        from: {
            opacity: number;
            scale: number;
        };
    };

    bounce: {
        duration: number;
        easing: Easing;
        from: {
            opacity: number;
            scale: number;
        };
    };

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
