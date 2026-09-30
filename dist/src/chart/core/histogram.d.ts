export interface HistBin {
    /** 区间下界（含） */
    x0: number;
    /** 区间上界（末箱含，其余不含） */
    x1: number;
    /** 落入该区间的样本数 */
    count: number;
}
/** 建议箱数：Freedman–Diaconis 优先，零 IQR / 样本 <2 时回退 Sturges；夹在 [1, maxBins]。 */
export declare function suggestBinCount(values: number[], maxBins?: number): number;
/**
 * 等宽分箱计数。opts.binCount 与 opts.binWidth 二选一（binWidth 优先）；都不给则用 suggestBinCount。
 * 末箱右闭（含 max），其余左闭右开。空/单值样本返回覆盖该值的 1 个箱。
 */
export declare function histogram(values: number[], opts?: {
    binCount?: number;
    binWidth?: number;
}): HistBin[];
