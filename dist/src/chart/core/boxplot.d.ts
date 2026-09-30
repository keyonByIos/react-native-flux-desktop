export interface BoxStats {
    /** 参与统计的有效样本数 */
    count: number;
    min: number;
    max: number;
    q1: number;
    median: number;
    q3: number;
    /** Q3 - Q1 */
    iqr: number;
    /** 下须端点：>= 下 fence 的最小值 */
    whiskerLow: number;
    /** 上须端点：<= 上 fence 的最大值 */
    whiskerHigh: number;
    /** 落在 fence 之外的点 */
    outliers: number[];
    mean: number;
}
/** 升序数值数组上的 type-7 分位数（0..1）。要求 arr 已排序且非空。 */
export declare function quantileSorted(arr: number[], p: number): number;
/** 由原始数值算箱线图统计；无有效样本返回 null。 */
export declare function boxStats(values: number[]): BoxStats | null;
/** 一组 BoxStats 的绘图值域下/上界（含须线与离群点），供 y 轴定域。 */
export declare function boxDomain(boxes: BoxStats[]): [number, number];
