export interface PreparedSeries {
    name: string;
    /** 与 categories 等长；无值处为 null */
    points: (number | null)[];
}
export interface PreparedData {
    categories: string[];
    series: PreparedSeries[];
}
export declare function prepare(data: Record<string, any>[], xField: string, yField: string, seriesField?: string): PreparedData;
/** 单序列扁平图（pie/bar 类目即 data 行）：直接取 xField=标签、yField=值。 */
export declare function flatPairs(data: Record<string, any>[], labelField: string, valueField: string): {
    label: string;
    value: number;
}[];
/** 序列在类目上的最大值（用于 y 轴定标）。 */
export declare function maxValue(prep: PreparedData): number;
