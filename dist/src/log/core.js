"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.configureLogger = configureLogger;
exports.loggerConfig = loggerConfig;
exports.logsDir = logsDir;
exports.sysLog = sysLog;
exports.sysAt = sysAt;
exports.userLogLine = userLogLine;
exports.enableConsoleCapture = enableConsoleCapture;
exports.logOverview = logOverview;
exports.readLogTail = readLogTail;
exports.readLogEntries = readLogEntries;
exports.closeLogs = closeLogs;
// 日志核心：文件落盘 + 1MB 分片轮转 + 系统日志写入 + console 捕获 + 读取/概览。
// 落盘位置：dataDir()/logs/<scope>/<YYYY-MM-DD>-<n>.log（scope = system | user）。
//   dataDir() 复用 KV 的解析：env FLUX_DB_DIR > 打包 %APPDATA%\<应用名>（由 FLUX_APP_DIR 按应用隔离）> dev 仓库 src/。
// 设计：纯 Node fs（同步写，writeSync 即时刷盘，无需缓冲），零第三方依赖；写失败静默降级不抛。
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const db_1 = require("../app/db");
/** 单个日志文件上限：1MB，超出即滚动到下一分片（日期-序号 +1） */
const MAX_BYTES = 1024 * 1024;
const LEVEL_RANK = { trace: 0, debug: 1, info: 2, warn: 3, error: 4, fatal: 5, none: 100 };
const CONSOLE_LEVEL = { debug: 'debug', log: 'info', info: 'info', warn: 'warn', error: 'error' };
const LEVEL_SET = new Set(['trace', 'debug', 'info', 'warn', 'error', 'fatal']);
let configuredDir = null;
let minLevel = 'trace';
/** 由 App 入口按 app.json.logger 注入：path=根目录（空→默认 dataDir()/logs），level=console 捕获最低阈值（默认 trace=全记）。 */
function configureLogger(opts) {
    if (typeof opts.path === 'string' && opts.path.trim())
        configuredDir = opts.path.trim();
    if (opts.level && opts.level in LEVEL_RANK)
        minLevel = opts.level;
}
/** 当前生效配置（供 demo / 诊断展示）。 */
function loggerConfig() {
    return { dir: logsDir(), level: minLevel };
}
function shouldRecord(level) {
    return LEVEL_RANK[level] >= LEVEL_RANK[minLevel];
}
function pad(n, l = 2) {
    return String(n).padStart(l, '0');
}
function dateStr(d) {
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}
function ts(d) {
    return `${dateStr(d)} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}.${pad(d.getMilliseconds(), 3)}`;
}
function fmtArg(a) {
    if (typeof a === 'string')
        return a;
    if (a instanceof Error)
        return a.stack || `${a.name}: ${a.message}`;
    try {
        return JSON.stringify(a);
    }
    catch {
        return String(a);
    }
}
function fmt(args) {
    return args.map(fmtArg).join(' ');
}
function logsDir() {
    return configuredDir ?? path_1.default.join((0, db_1.dataDir)(), 'logs');
}
function scopeDir(scope) {
    return path_1.default.join(logsDir(), scope);
}
function fileAt(scope, date, index) {
    return path_1.default.join(scopeDir(scope), `${date}-${index}.log`);
}
const rot = {
    system: { date: '', index: 0, size: 0, fd: null },
    user: { date: '', index: 0, size: 0, fd: null },
};
/** 打开（或续用）该 scope 当天当前可写分片；跨天重置序号，跳过已满 1MB 的历史分片（含重启续写）。 */
function openAt(scope) {
    const st = rot[scope];
    const date = dateStr(new Date());
    if (st.date !== date) {
        st.date = date;
        st.index = 0;
    }
    try {
        fs_1.default.mkdirSync(scopeDir(scope), { recursive: true });
        if (st.index === 0)
            st.index = 1;
        let p = fileAt(scope, date, st.index);
        while (fs_1.default.existsSync(p) && fs_1.default.statSync(p).size >= MAX_BYTES) {
            st.index += 1;
            p = fileAt(scope, date, st.index);
        }
        const fd = fs_1.default.openSync(p, 'a');
        st.size = fs_1.default.existsSync(p) ? fs_1.default.statSync(p).size : 0;
        st.fd = fd;
        return fd;
    }
    catch {
        st.fd = null;
        return null;
    }
}
function write(scope, line) {
    const st = rot[scope];
    let fd = st.fd !== null ? st.fd : openAt(scope);
    if (fd === null)
        return; // 落盘不可用（只读盘等）→ 静默降级
    const buf = line.endsWith('\n') ? line : line + '\n';
    const bytes = Buffer.byteLength(buf);
    if (st.size + bytes > MAX_BYTES) {
        // 触顶 → 关当前、滚到下一分片重开
        try {
            fs_1.default.closeSync(fd);
        }
        catch {
            /* ignore */
        }
        st.index += 1;
        st.fd = null;
        fd = openAt(scope);
        if (fd === null)
            return;
    }
    try {
        fs_1.default.writeSync(fd, buf);
        st.size += bytes;
    }
    catch {
        /* ignore */
    }
}
/** 落一行：`<时间> <级别大写> [来源] <消息>`。 */
function emit(scope, level, source, message) {
    const src = source ? `[${source}] ` : '';
    write(scope, `${ts(new Date())} ${level.toUpperCase()} ${src}${message}`);
}
/** 系统日志：核心内部写点专用（生命周期 / 单实例 / 渲染）。默认 info；首参若是 `[tag] ...` 则取作来源。 */
function sysLog(...args) {
    sysAt('info', ...args);
}
/** 带级别的系统日志（核心内部用；不丢弃打印，只是给行打级别）。 */
function sysAt(level, ...args) {
    const head = args[0];
    if (typeof head === 'string') {
        const m = /^\[([^\]]+)\][ \t]*([\s\S]*)$/.exec(head);
        if (m) {
            emit('system', level, m[1], fmt([m[2], ...args.slice(1)]));
            return;
        }
    }
    emit('system', level, 'system', fmt(args));
}
/** 用户日志行：由 UserLogStore 调用，统一写入 user 日志、来源=channel、带级别。 */
function userLogLine(channel, level, args) {
    emit('user', level, channel, fmt(args));
}
let consolePatched = false;
/** 捕获 console（log/info/warn/error/debug）→ 同步进系统日志（不分级，只要打印就记），并保留原输出。 */
function enableConsoleCapture() {
    if (consolePatched)
        return;
    consolePatched = true;
    const orig = {
        log: console.log.bind(console),
        info: console.info.bind(console),
        warn: console.warn.bind(console),
        error: console.error.bind(console),
        debug: console.debug.bind(console),
    };
    ['log', 'info', 'warn', 'error', 'debug'].forEach((m) => {
        console[m] = (...args) => {
            if (shouldRecord(CONSOLE_LEVEL[m])) {
                try {
                    sysAt(CONSOLE_LEVEL[m], '[console]', ...args);
                }
                catch {
                    /* ignore */
                }
            }
            orig[m](...args);
        };
    });
}
/** 概览：日志根目录 + system/user 各自分片文件（新在前），供 demo 展示。 */
function logOverview() {
    const ls = (scope) => {
        try {
            return fs_1.default
                .readdirSync(scopeDir(scope))
                .filter((f) => f.endsWith('.log'))
                .map((f) => ({ name: f, size: fs_1.default.statSync(path_1.default.join(scopeDir(scope), f)).size }))
                .sort((a, b) => (a.name < b.name ? 1 : -1));
        }
        catch {
            return [];
        }
    };
    return { dir: logsDir(), system: ls('system'), user: ls('user') };
}
/** 读某 scope 最新分片的末尾 N 行（供 demo 展示；读不受「系统日志用户不可写」限制）。 */
function readLogTail(scope, lines = 50) {
    const dir = scopeDir(scope);
    let files;
    try {
        files = fs_1.default.readdirSync(dir).filter((f) => f.endsWith('.log')).sort();
    }
    catch {
        return [];
    }
    const last = files[files.length - 1];
    if (!last)
        return [];
    try {
        const content = fs_1.default.readFileSync(path_1.default.join(dir, last), 'utf8');
        return content.split('\n').filter((l) => l.length > 0).slice(-lines);
    }
    catch {
        return [];
    }
}
/** 解析最新分片末尾若干行为结构化记录（喂给 LogViewer）；旧式无级别行按 info 兜底。 */
function readLogEntries(scope, lines = 500) {
    const raw = readLogTail(scope, lines);
    const out = [];
    for (const line of raw) {
        const m = /^(\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}\.\d{3}) ([A-Z]+)(?: \[([^\]]+)\])?[ ]?([\s\S]*)$/.exec(line);
        if (m) {
            const lv = m[2].toLowerCase();
            out.push({ time: m[1], level: (LEVEL_SET.has(lv) ? lv : 'info'), source: m[3] ?? '', message: m[4] ?? '' });
        }
        else {
            out.push({ time: '', level: 'info', source: '', message: line });
        }
    }
    return out;
}
/** 关闭所有已打开的日志 fd（进程收尾可选；writeSync 已即时刷盘，不依赖此调用）。 */
function closeLogs() {
    ['system', 'user'].forEach((scope) => {
        const st = rot[scope];
        if (st.fd !== null) {
            try {
                fs_1.default.closeSync(st.fd);
            }
            catch {
                /* ignore */
            }
            st.fd = null;
        }
    });
}
