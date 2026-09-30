export interface DensityPoint {
    /** 采样位置（数据值） */
    value: number;
    /** 该位置的密度估计（非负，未归一化到面积=1 也无妨，轮廓按最大密度归一） */
    density: number;
}
/**
 * Silverman 经验带宽：h = 0.9 · min(sd, IQR/1.34) · n^(-1/5)。
 * 零方差 / 样本过少时退回基于极差的稳健值，最终保证 h>0。
 */
export declare function silvermanBandwidth(values: number[]): number;
/**
 * 高斯核 KDE。在 [min - 3h, max + 3h]（可裁剪到数据范围）均匀取 gridSize 个采样点，
 * 返回逐点密度。density 非负；无有效样本返回 []。
 * opts.at：给定自定义采样位置数组（优先于 gridSize/范围推导）。
 */
export declare function kde(values: number[], opts?: {
    bandwidth?: number;
    gridSize?: number;
    cutToRange?: boolean;
    at?: number[];
}): DensityPoint[];
/** 一组 DensityPoint[] 的最大密度（跨多条小提琴共享同一横向量程时用）。空返回 0。 */
export declare function maxDensity(series: DensityPoint[][]): number;
