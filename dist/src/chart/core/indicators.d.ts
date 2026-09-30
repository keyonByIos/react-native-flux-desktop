
export declare function sma(values: number[], window: number): (number | null)[];

export declare function ema(values: number[], window: number): number[];
export interface MacdResult {
    dif: (number | null)[];
    dea: (number | null)[];
    hist: (number | null)[];
}

export declare function macd(closes: number[], fast?: number, slow?: number, signal?: number): MacdResult;

export declare function rsi(closes: number[], period?: number): (number | null)[];
export interface CandleRow {
    high: number;
    low: number;
    close: number;
}
export interface KdjResult {
    k: (number | null)[];
    d: (number | null)[];
    j: (number | null)[];
}

export declare function kdj(rows: CandleRow[], n?: number, m1?: number, m2?: number): KdjResult;
export interface BollResult {
    mid: (number | null)[];
    upper: (number | null)[];
    lower: (number | null)[];
}

export declare function bollinger(closes: number[], window?: number, mult?: number): BollResult;
