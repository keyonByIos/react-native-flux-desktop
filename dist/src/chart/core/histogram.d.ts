export interface HistBin {

    x0: number;

    x1: number;

    count: number;
}

export declare function suggestBinCount(values: number[], maxBins?: number): number;

export declare function histogram(values: number[], opts?: {
    binCount?: number;
    binWidth?: number;
}): HistBin[];
