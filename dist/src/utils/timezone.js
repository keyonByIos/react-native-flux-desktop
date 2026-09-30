"use strict";
// 时区工具：把「绝对时刻 Date」按指定 IANA 时区（默认 Asia/Shanghai）拆解为日历字段，
// 以及反向由日历字段构造该时区下的时刻。全部基于 Node 内置 Intl.DateTimeFormat（Node 18+ 自带 full-icu）。
// 日期类组件（Calendar / DatePicker / TimePicker）用它在展示与比较时统一走「目标时区的年/月/日/时/分/秒」，
// 而 value 依旧是绝对时刻 Date，语义不变。
Object.defineProperty(exports, "__esModule", { value: true });
exports.getZonedParts = getZonedParts;
exports.zonedTimeToUtc = zonedTimeToUtc;
exports.isSameZonedDay = isSameZonedDay;
exports.weekdayOfCalendar = weekdayOfCalendar;
exports.daysInCalendarMonth = daysInCalendarMonth;
exports.formatZonedDate = formatZonedDate;
exports.formatZonedTime = formatZonedTime;
const WEEKDAY_INDEX = {
    Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6,
};
const formatterCache = new Map();
function getFormatter(timeZone) {
    let f = formatterCache.get(timeZone);
    if (!f) {
        try {
            f = new Intl.DateTimeFormat('en-US', {
                timeZone,
                hour12: false,
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
                weekday: 'short',
            });
        }
        catch {
            // 非法时区名回退 UTC，避免运行期抛错
            f = new Intl.DateTimeFormat('en-US', {
                timeZone: 'UTC',
                hour12: false,
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
                weekday: 'short',
            });
        }
        formatterCache.set(timeZone, f);
    }
    return f;
}
/** 把绝对时刻按指定时区拆解为日历字段。 */
function getZonedParts(date, timeZone) {
    const parts = getFormatter(timeZone).formatToParts(date);
    const pick = (type) => parts.find((p) => p.type === type)?.value ?? '0';
    let hour = parseInt(pick('hour'), 10);
    if (hour >= 24)
        hour -= 24; // 部分 ICU 版本 hour12:false 时零点会给出 24
    const wdRaw = pick('weekday');
    return {
        year: parseInt(pick('year'), 10),
        month: parseInt(pick('month'), 10) - 1,
        day: parseInt(pick('day'), 10),
        hour,
        minute: parseInt(pick('minute'), 10),
        second: parseInt(pick('second'), 10),
        weekday: WEEKDAY_INDEX[wdRaw] ?? new Date(date).getDay(),
    };
}
/** 指定时区相对 UTC 的偏移（毫秒）：wall-clock = utc + offset。 */
function zonedOffsetMs(instant, timeZone) {
    const p = getZonedParts(instant, timeZone);
    const asUTC = Date.UTC(p.year, p.month, p.day, p.hour, p.minute, p.second);
    // 去掉秒级噪声，offset 通常是分钟粒度
    return asUTC - Math.floor(instant.getTime() / 1000) * 1000;
}
/**
 * 由「目标时区的日历字段」构造对应的绝对时刻 Date（迭代校准偏移，覆盖 DST 边界）。
 * 用于点击日历格后回吐一个在该时区落在正确日期上的 Date 实例。
 */
function zonedTimeToUtc(year, month, day, hour, minute, second, timeZone) {
    const target = Date.UTC(year, month, day, hour, minute, second);
    let ts = target;
    for (let i = 0; i < 3; i++) {
        const offset = zonedOffsetMs(new Date(ts), timeZone);
        const next = target - offset;
        if (next === ts)
            break;
        ts = next;
    }
    return new Date(ts);
}
/** 两个绝对时刻在指定时区下是否为同一个日历日。 */
function isSameZonedDay(a, b, timeZone) {
    const pa = getZonedParts(a, timeZone);
    const pb = getZonedParts(b, timeZone);
    return pa.year === pb.year && pa.month === pb.month && pa.day === pb.day;
}
/** 某日历日（年/月 0-11/日）是星期几，0=周日。星期几与时刻无关，直接用 UTC 推算。 */
function weekdayOfCalendar(year, month, day) {
    return new Date(Date.UTC(year, month, day)).getUTCDay();
}
/** 某年某月（月 0-11）的天数。 */
function daysInCalendarMonth(year, month) {
    return new Date(Date.UTC(year, month + 1, 0)).getUTCDate();
}
function pad2(n) {
    return n < 10 ? `0${n}` : `${n}`;
}
/** 按指定时区格式化日期为 YYYY-MM-DD。 */
function formatZonedDate(date, timeZone) {
    const p = getZonedParts(date, timeZone);
    return `${p.year}-${pad2(p.month + 1)}-${pad2(p.day)}`;
}
/** 按指定时区格式化时间为 HH:mm:ss。 */
function formatZonedTime(date, timeZone, withSecond = true) {
    const p = getZonedParts(date, timeZone);
    const base = `${pad2(p.hour)}:${pad2(p.minute)}`;
    return withSecond ? `${base}:${pad2(p.second)}` : base;
}
