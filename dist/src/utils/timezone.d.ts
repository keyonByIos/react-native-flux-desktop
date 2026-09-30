
export interface ZonedParts {

    year: number;

    month: number;

    day: number;

    hour: number;

    minute: number;

    second: number;

    weekday: number;
}

export declare function getZonedParts(date: Date, timeZone: string): ZonedParts;

export declare function zonedTimeToUtc(year: number, month: number, day: number, hour: number, minute: number, second: number, timeZone: string): Date;

export declare function isSameZonedDay(a: Date, b: Date, timeZone: string): boolean;

export declare function weekdayOfCalendar(year: number, month: number, day: number): number;

export declare function daysInCalendarMonth(year: number, month: number): number;

export declare function formatZonedDate(date: Date, timeZone: string): string;

export declare function formatZonedTime(date: Date, timeZone: string, withSecond?: boolean): string;
