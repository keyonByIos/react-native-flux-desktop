export interface DensityPoint {

    value: number;

    density: number;
}

export declare function silvermanBandwidth(values: number[]): number;

export declare function kde(values: number[], opts?: {
    bandwidth?: number;
    gridSize?: number;
    cutToRange?: boolean;
    at?: number[];
}): DensityPoint[];

export declare function maxDensity(series: DensityPoint[][]): number;
