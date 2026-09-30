export interface CalendarDatum {

    date: string;
    value: number;
}
export interface CalendarCell {
    date: string;

    col: number;

    row: number;
    value: number;

    ms: number;
}
export interface MonthMarker {

    label: string;

    col: number;
}
export interface CalendarLayout {
    cells: CalendarCell[];

    weeks: number;
    monthMarkers: MonthMarker[];

    min: number;
    max: number;

    startMs: number;

    totalDays: number;
}

export declare function parseDate(s: string): number | null;

export declare function formatDate(ms: number): string;

export declare function buildCalendar(data: CalendarDatum[], opts?: {
    startOfWeek?: number;
    monthNames?: string[];
}): CalendarLayout;
