
export interface LinearScale {
    (value: number): number;
    invert: (px: number) => number;
    domain: [number, number];
    range: [number, number];
}
export declare function linearScale(domain: [number, number], range: [number, number]): LinearScale;

export declare function niceTicks(max: number, count?: number): {
    niceMax: number;
    ticks: number[];
};

export interface BandScale {

    scale: (i: number) => number;

    bandwidth: number;

    step: number;
}
export declare function bandScale(count: number, range: [number, number], opts?: {
    paddingInner?: number;
    paddingOuter?: number;
}): BandScale;

export declare function compactNumber(v: number): string;

export declare function linearTicks(min: number, max: number, count?: number): number[];
