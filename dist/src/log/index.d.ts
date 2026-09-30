export { sysLog, sysAt, userLogLine, enableConsoleCapture, configureLogger, loggerConfig, logOverview, readLogTail, readLogEntries, logsDir, closeLogs, } from './core';
export type { LogRecordLevel, LogThresholdLevel, LogScope, LogFileInfo, LogRecord } from './core';
/**
 * 用户日志存储（App.log）：实际开发默认允许，直接 write(channel, ...) 即写（首次自动登记通道）。
 * init(channel) 可选，用于显式声明；拒绝保留名 system / 原型污染名。所有通道写进统一 user 日志。
 */
export declare class UserLogStore {
    private _channels;
    /** 可选：显式声明一个通道（幂等，记一条就绪行）。不声明也可直接 write。 */
    init(channel: string): void;
    /** 写用户日志（info 级）：无需预先注册（首次写自动登记通道）。 */
    write(channel: string, ...args: unknown[]): void;
    /** 分级写入（与 LogViewer 6 级刻度对齐；均不要求预先注册）。 */
    trace(channel: string, ...args: unknown[]): void;
    debug(channel: string, ...args: unknown[]): void;
    info(channel: string, ...args: unknown[]): void;
    warn(channel: string, ...args: unknown[]): void;
    error(channel: string, ...args: unknown[]): void;
    fatal(channel: string, ...args: unknown[]): void;
    private _w;
    isInit(channel: string): boolean;
    /** 已注册通道名列表 */
    channels(): string[];
    private _assert;
}
