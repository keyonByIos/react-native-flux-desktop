export interface CalendarDatum {
    /** 'YYYY-MM-DD' */
    date: string;
    value: number;
}
export interface CalendarCell {
    date: string;
    /** 周列序号（0 起） */
    col: number;
    /** 星期行序号（0 起，相对 startOfWeek） */
    row: number;
    value: number;
    /** UTC 毫秒 */
    ms: number;
}
export interface MonthMarker {
    /** 月份标签（默认英文 3 字母） */
    label: string;
    /** 该月首日所在（或起始）周列 */
    col: number;
}
export interface CalendarLayout {
    cells: CalendarCell[];
    /** 总周数（列数） */
    weeks: number;
    monthMarkers: MonthMarker[];
    /** 值域下界（含 0） */
    min: number;
    max: number;
    /** 网格起点 UTC 毫秒（对齐到 startOfWeek，可能早于首个数据日） */
    startMs: number;
    /** 网格覆盖的总天数（weeks*7 向上取整后） */
    totalDays: number;
}
/** 解析 'YYYY-MM-DD' → UTC 毫秒；非法返回 null。 */
export declare function parseDate(s: string): number | null;
/** 毫秒 → 'YYYY-MM-DD'。 */
export declare function formatDate(ms: number): string;
/**
 * 构建日历栅格。
 * @param data 按日期聚合的数值（同日期重复取后者）
 * @param opts.startOfWeek 每周起始日 0=周日 .. 6=周六（默认 0，GitHub 用 0）
 * @param opts.monthNames 12 个月标签（默认英文）
 */
export declare function buildCalendar(data: CalendarDatum[], opts?: {
    startOfWeek?: number;
    monthNames?: string[];
}): CalendarLayout;
