/** 简单移动平均：不足窗口的前 window-1 项为 null。 */
export declare function sma(values: number[], window: number): (number | null)[];
/** 指数移动平均：以首值种子，k = 2/(window+1)。返回等长 number[]。 */
export declare function ema(values: number[], window: number): number[];
export interface MacdResult {
    dif: (number | null)[];
    dea: (number | null)[];
    hist: (number | null)[];
}
/** MACD：dif = EMA(fast) - EMA(slow)；dea = EMA(dif, signal)；hist = dif - dea。 */
export declare function macd(closes: number[], fast?: number, slow?: number, signal?: number): MacdResult;
/** RSI（Wilder 平滑）：默认 period 14，输出 0..100；暖机期 null。 */
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
/** KDJ：RSV 基于 n 周期最高/最低；K=2/3·prevK+1/3·RSV，D=2/3·prevD+1/3·K，J=3K-2D。默认 9/3/3。 */
export declare function kdj(rows: CandleRow[], n?: number, m1?: number, m2?: number): KdjResult;
export interface BollResult {
    mid: (number | null)[];
    upper: (number | null)[];
    lower: (number | null)[];
}
/** 布林带：mid = SMA(window)；上/下轨 = mid ± mult·标准差。默认 20/2。 */
export declare function bollinger(closes: number[], window?: number, mult?: number): BollResult;
