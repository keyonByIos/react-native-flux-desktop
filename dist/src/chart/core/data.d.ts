export interface PreparedSeries {
    name: string;

    points: (number | null)[];
}
export interface PreparedData {
    categories: string[];
    series: PreparedSeries[];
}
export declare function prepare(data: Record<string, any>[], xField: string, yField: string, seriesField?: string): PreparedData;

export declare function flatPairs(data: Record<string, any>[], labelField: string, valueField: string): {
    label: string;
    value: number;
}[];

export declare function maxValue(prep: PreparedData): number;
