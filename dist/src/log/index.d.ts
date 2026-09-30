export { sysLog, sysAt, userLogLine, enableConsoleCapture, configureLogger, loggerConfig, logOverview, readLogTail, readLogEntries, logsDir, closeLogs, } from './core';
export type { LogRecordLevel, LogThresholdLevel, LogScope, LogFileInfo, LogRecord } from './core';

export declare class UserLogStore {
    private _channels;

    init(channel: string): void;

    write(channel: string, ...args: unknown[]): void;

    trace(channel: string, ...args: unknown[]): void;
    debug(channel: string, ...args: unknown[]): void;
    info(channel: string, ...args: unknown[]): void;
    warn(channel: string, ...args: unknown[]): void;
    error(channel: string, ...args: unknown[]): void;
    fatal(channel: string, ...args: unknown[]): void;
    private _w;
    isInit(channel: string): boolean;

    channels(): string[];
    private _assert;
}
