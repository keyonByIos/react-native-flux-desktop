export interface BoxStats {

    count: number;
    min: number;
    max: number;
    q1: number;
    median: number;
    q3: number;

    iqr: number;

    whiskerLow: number;

    whiskerHigh: number;

    outliers: number[];
    mean: number;
}

export declare function quantileSorted(arr: number[], p: number): number;

export declare function boxStats(values: number[]): BoxStats | null;

export declare function boxDomain(boxes: BoxStats[]): [number, number];
