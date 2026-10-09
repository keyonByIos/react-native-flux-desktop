/** 线性（连续）比例尺：value -> pixel，带 invert。 */
export interface LinearScale {
    (value: number): number;
    invert: (px: number) => number;
    domain: [number, number];
    range: [number, number];
}
export declare function linearScale(domain: [number, number], range: [number, number]): LinearScale;
/**
 * 把数据最大值向上取整到「漂亮」的轴界，并产出等距刻度（恒从 0 起）。
 * 复刻 d3/ECharts 的 1/2/5 × 10ⁿ 步进启发式，保证轴刻度可读。
 */
export declare function niceTicks(max: number, count?: number): {
    niceMax: number;
    ticks: number[];
};
/** 带宽（类目）比例尺：n 个等距槽位。 */
export interface BandScale {
    /** 槽位 i 的左沿（px） */
    scale: (i: number) => number;
    /** 可用柱宽 */
    bandwidth: number;
    /** bandwidth + 内间隙 */
    step: number;
}
export declare function bandScale(count: number, range: [number, number], opts?: {
    paddingInner?: number;
    paddingOuter?: number;
}): BandScale;
/** 数值紧凑格式化：12345 -> 12.3k，供轴与标签复用。 */
export declare function compactNumber(v: number): string;
/**
 * 线性轴刻度：给定 [min,max] 产出跨界的「漂亮」等距刻度（1/2/5 × 10ⁿ 步进）。
 * 与 niceTicks 的区别：niceTicks 恒从 0 起，本函数支持任意（含负）下界，供散点 x 轴等用。
 */
export declare function linearTicks(min: number, max: number, count?: number): number[];
