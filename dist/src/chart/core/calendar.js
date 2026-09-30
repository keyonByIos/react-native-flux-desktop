"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseDate = parseDate;
exports.formatDate = formatDate;
exports.buildCalendar = buildCalendar;
// Calendar 日历热力图布局算法（纯函数，无渲染依赖，便于探针验证）。
// 输入按日期聚合的数值序列 → 输出「周列 × 星期行」栅格：每格 (col,row)、月份标记、值域。
// 采用 UTC 毫秒避免本地时区漂移；'YYYY-MM-DD' 手工解析，星期用 getUTCDay。
const DAY = 86400000;
const DEFAULT_MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
/** 解析 'YYYY-MM-DD' → UTC 毫秒；非法返回 null。 */
function parseDate(s) {
    const m = /^(\d{4})-(\d{1,2})-(\d{1,2})$/.exec(String(s).trim());
    if (!m)
        return null;
    const y = Number(m[1]);
    const mo = Number(m[2]);
    const d = Number(m[3]);
    if (mo < 1 || mo > 12 || d < 1 || d > 31)
        return null;
    const ms = Date.UTC(y, mo - 1, d);
    // 回读校验，排除 2/30 之类溢出被 Date.UTC 顺延的情况
    const dt = new Date(ms);
    if (dt.getUTCFullYear() !== y || dt.getUTCMonth() !== mo - 1 || dt.getUTCDate() !== d)
        return null;
    return ms;
}
/** 毫秒 → 'YYYY-MM-DD'。 */
function formatDate(ms) {
    const d = new Date(ms);
    const mo = String(d.getUTCMonth() + 1).padStart(2, '0');
    const day = String(d.getUTCDate()).padStart(2, '0');
    return `${d.getUTCFullYear()}-${mo}-${day}`;
}
/**
 * 构建日历栅格。
 * @param data 按日期聚合的数值（同日期重复取后者）
 * @param opts.startOfWeek 每周起始日 0=周日 .. 6=周六（默认 0，GitHub 用 0）
 * @param opts.monthNames 12 个月标签（默认英文）
 */
function buildCalendar(data, opts = {}) {
    const startOfWeek = opts.startOfWeek != null ? ((opts.startOfWeek % 7) + 7) % 7 : 0;
    const monthNames = opts.monthNames && opts.monthNames.length === 12 ? opts.monthNames : DEFAULT_MONTHS;
    // 去重（同日期取后者）+ 过滤非法
    const byDate = new Map();
    for (const d of data) {
        const ms = parseDate(d.date);
        if (ms == null)
            continue;
        byDate.set(formatDate(ms), Number(d.value) || 0);
    }
    if (byDate.size === 0)
        return { cells: [], weeks: 0, monthMarkers: [], min: 0, max: 0, startMs: 0, totalDays: 0 };
    const allMs = [];
    byDate.forEach((_, key) => {
        const ms = parseDate(key);
        if (ms != null)
            allMs.push(ms);
    });
    const minMs = Math.min(...allMs);
    const maxMs = Math.max(...allMs);
    // 网格起点对齐到 startOfWeek（minMs 所在周的首日）
    const startWd = new Date(minMs).getUTCDay();
    const offset = (startWd - startOfWeek + 7) % 7;
    const gridStart = minMs - offset * DAY;
    const totalDays = Math.round((maxMs - gridStart) / DAY) + 1;
    const weeks = Math.ceil(totalDays / 7);
    const cells = [];
    let min = Infinity;
    let max = -Infinity;
    byDate.forEach((value, key) => {
        const ms = parseDate(key);
        if (ms == null)
            return;
        const dayIdx = Math.round((ms - gridStart) / DAY);
        const col = Math.floor(dayIdx / 7);
        const row = (new Date(ms).getUTCDay() - startOfWeek + 7) % 7;
        cells.push({ date: key, col, row, value, ms });
        if (value < min)
            min = value;
        if (value > max)
            max = value;
    });
    cells.sort((a, b) => a.ms - b.ms);
    if (!Number.isFinite(min))
        min = 0;
    if (!Number.isFinite(max))
        max = 0;
    // 月标记：从首个数据日（minMs）起逐日扫描，跳过对齐到周首的前置填充日；
    // 月份变化时在该日所在列记一次（同列不重复）。
    const monthMarkers = [];
    const usedCols = new Set();
    let prevMonth = -1;
    for (let i = 0; i < totalDays; i++) {
        const ms = gridStart + i * DAY;
        if (ms < minMs)
            continue;
        const mo = new Date(ms).getUTCMonth();
        const col = Math.floor(i / 7);
        if (mo !== prevMonth) {
            if (!usedCols.has(col)) {
                monthMarkers.push({ label: monthNames[mo], col });
                usedCols.add(col);
            }
            prevMonth = mo;
        }
    }
    return { cells, weeks, monthMarkers, min, max, startMs: gridStart, totalDays: weeks * 7 };
}
