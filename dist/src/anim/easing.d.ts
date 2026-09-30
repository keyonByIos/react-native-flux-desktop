export type Easing = (t: number) => number;
export declare const linear: Easing;
export declare const easeInQuad: Easing;
export declare const easeOutQuad: Easing;
export declare const easeOutCubic: Easing;
export declare const easeInOutCubic: Easing;

export declare const easeOutBack: Easing;

export declare const sinePulse: Easing;

export declare const easeOutElastic: Easing;

export declare function spring(options?: {
    dampingRatio?: number;
    frequency?: number;
}): Easing;
