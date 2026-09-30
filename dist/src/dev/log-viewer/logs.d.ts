export type LogLevel = 'trace' | 'debug' | 'info' | 'warn' | 'error' | 'fatal';

export declare const LEVEL_RANK: Record<LogLevel, number>;
export declare const ALL_LEVELS: LogLevel[];
export interface LogEntry {

    time?: string;
    level: LogLevel;

    source?: string;
    message: string;
}
export interface LogFilter {

    minLevel?: LogLevel;

    query?: string;
}

export declare function filterLogs(logs: LogEntry[], filter?: LogFilter): LogEntry[];

export declare function summarize(logs: LogEntry[]): Record<LogLevel, number>;
