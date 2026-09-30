/** 某时刻在指定时区下的日历拆解结果 */
export interface ZonedParts {
    /** 四位年 */
    year: number;
    /** 月，0-11（与 JS getMonth 对齐） */
    month: number;
    /** 日，1-31 */
    day: number;
    /** 时，0-23 */
    hour: number;
    /** 分，0-59 */
    minute: number;
    /** 秒，0-59 */
    second: number;
    /** 星期，0=周日 … 6=周六 */
    weekday: number;
}
/** 把绝对时刻按指定时区拆解为日历字段。 */
export declare function getZonedParts(date: Date, timeZone: string): ZonedParts;
/**
 * 由「目标时区的日历字段」构造对应的绝对时刻 Date（迭代校准偏移，覆盖 DST 边界）。
 * 用于点击日历格后回吐一个在该时区落在正确日期上的 Date 实例。
 */
export declare function zonedTimeToUtc(year: number, month: number, day: number, hour: number, minute: number, second: number, timeZone: string): Date;
/** 两个绝对时刻在指定时区下是否为同一个日历日。 */
export declare function isSameZonedDay(a: Date, b: Date, timeZone: string): boolean;
/** 某日历日（年/月 0-11/日）是星期几，0=周日。星期几与时刻无关，直接用 UTC 推算。 */
export declare function weekdayOfCalendar(year: number, month: number, day: number): number;
/** 某年某月（月 0-11）的天数。 */
export declare function daysInCalendarMonth(year: number, month: number): number;
/** 按指定时区格式化日期为 YYYY-MM-DD。 */
export declare function formatZonedDate(date: Date, timeZone: string): string;
/** 按指定时区格式化时间为 HH:mm:ss。 */
export declare function formatZonedTime(date: Date, timeZone: string, withSecond?: boolean): string;
