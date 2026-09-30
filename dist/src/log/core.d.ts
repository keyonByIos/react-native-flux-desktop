export type LogScope = 'system' | 'user';

export type LogRecordLevel = 'trace' | 'debug' | 'info' | 'warn' | 'error' | 'fatal';
export type LogThresholdLevel = LogRecordLevel | 'none';

export declare function configureLogger(opts: {
    path?: string;
    level?: LogThresholdLevel;
}): void;

export declare function loggerConfig(): {
    dir: string;
    level: LogThresholdLevel;
};
export declare function logsDir(): string;

export declare function sysLog(...args: unknown[]): void;

export declare function sysAt(level: LogRecordLevel, ...args: unknown[]): void;

export declare function userLogLine(channel: string, level: LogRecordLevel, args: unknown[]): void;

export declare function enableConsoleCapture(): void;
export interface LogFileInfo {
    name: string;
    size: number;
}

export declare function logOverview(): {
    dir: string;
    system: LogFileInfo[];
    user: LogFileInfo[];
};

export declare function readLogTail(scope: LogScope, lines?: number): string[];

export interface LogRecord {
    time: string;
    level: LogRecordLevel;
    source: string;
    message: string;
}

export declare function readLogEntries(scope: LogScope, lines?: number): LogRecord[];

export declare function closeLogs(): void;
