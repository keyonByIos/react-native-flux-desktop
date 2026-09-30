"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserLogStore = exports.closeLogs = exports.logsDir = exports.readLogEntries = exports.readLogTail = exports.logOverview = exports.loggerConfig = exports.configureLogger = exports.enableConsoleCapture = exports.userLogLine = exports.sysAt = exports.sysLog = void 0;
// 日志模块对外门面。
// 分层（对齐 KV 的「系统/用户」双层范式）：
//   · 系统日志（scope=system）：核心内部写点（生命周期 / 单实例 / 渲染）+ console 捕获，用户不可直接写。
//   · 用户日志（scope=user）：实际开发默认允许，直接 App.log.write(channel, ...) 即写（首次自动登记通道）；
//     所有通道统一汇入同一份 user 日志（行前缀 [channel]）。App.log.init(channel) 可选，用于显式声明。
const core_1 = require("./core");
var core_2 = require("./core");
Object.defineProperty(exports, "sysLog", { enumerable: true, get: function () { return core_2.sysLog; } });
Object.defineProperty(exports, "sysAt", { enumerable: true, get: function () { return core_2.sysAt; } });
Object.defineProperty(exports, "userLogLine", { enumerable: true, get: function () { return core_2.userLogLine; } });
Object.defineProperty(exports, "enableConsoleCapture", { enumerable: true, get: function () { return core_2.enableConsoleCapture; } });
Object.defineProperty(exports, "configureLogger", { enumerable: true, get: function () { return core_2.configureLogger; } });
Object.defineProperty(exports, "loggerConfig", { enumerable: true, get: function () { return core_2.loggerConfig; } });
Object.defineProperty(exports, "logOverview", { enumerable: true, get: function () { return core_2.logOverview; } });
Object.defineProperty(exports, "readLogTail", { enumerable: true, get: function () { return core_2.readLogTail; } });
Object.defineProperty(exports, "readLogEntries", { enumerable: true, get: function () { return core_2.readLogEntries; } });
Object.defineProperty(exports, "logsDir", { enumerable: true, get: function () { return core_2.logsDir; } });
Object.defineProperty(exports, "closeLogs", { enumerable: true, get: function () { return core_2.closeLogs; } });
/** 用户不可占用的通道名（系统保留） */
const RESERVED_CHANNELS = new Set(['system']);
/** 原型污染防护 */
const BANNED_CHANNELS = new Set(['__proto__', 'constructor', 'prototype']);
/**
 * 用户日志存储（App.log）：实际开发默认允许，直接 write(channel, ...) 即写（首次自动登记通道）。
 * init(channel) 可选，用于显式声明；拒绝保留名 system / 原型污染名。所有通道写进统一 user 日志。
 */
class UserLogStore {
    constructor() {
        this._channels = new Set();
    }
    /** 可选：显式声明一个通道（幂等，记一条就绪行）。不声明也可直接 write。 */
    init(channel) {
        this._assert(channel);
        if (this._channels.has(channel))
            return;
        this._channels.add(channel);
        (0, core_1.userLogLine)(channel, 'info', ['channel ready']);
    }
    /** 写用户日志（info 级）：无需预先注册（首次写自动登记通道）。 */
    write(channel, ...args) {
        this._w(channel, 'info', args);
    }
    /** 分级写入（与 LogViewer 6 级刻度对齐；均不要求预先注册）。 */
    trace(channel, ...args) {
        this._w(channel, 'trace', args);
    }
    debug(channel, ...args) {
        this._w(channel, 'debug', args);
    }
    info(channel, ...args) {
        this._w(channel, 'info', args);
    }
    warn(channel, ...args) {
        this._w(channel, 'warn', args);
    }
    error(channel, ...args) {
        this._w(channel, 'error', args);
    }
    fatal(channel, ...args) {
        this._w(channel, 'fatal', args);
    }
    _w(channel, level, args) {
        this._assert(channel);
        this._channels.add(channel);
        (0, core_1.userLogLine)(channel, level, args);
    }
    isInit(channel) {
        return this._channels.has(channel);
    }
    /** 已注册通道名列表 */
    channels() {
        return Array.from(this._channels);
    }
    _assert(channel) {
        if (RESERVED_CHANNELS.has(channel)) {
            throw new Error(`Application.log: 通道名 "${channel}" 为系统保留，用户不可占用`);
        }
        if (BANNED_CHANNELS.has(channel)) {
            throw new Error(`Application.log: 非法通道名 "${channel}"`);
        }
    }
}
exports.UserLogStore = UserLogStore;
