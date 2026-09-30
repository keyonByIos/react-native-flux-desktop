export type LogScope = 'system' | 'user';
/** 记录级别（与 LogViewer 6 级刻度一致）；LogThresholdLevel 额外允许 'none' 关闭 console 捕获。 */
export type LogRecordLevel = 'trace' | 'debug' | 'info' | 'warn' | 'error' | 'fatal';
export type LogThresholdLevel = LogRecordLevel | 'none';
/** 由 App 入口按 app.json.logger 注入：path=根目录（空→默认 dataDir()/logs），level=console 捕获最低阈值（默认 trace=全记）。 */
export declare function configureLogger(opts: {
    path?: string;
    level?: LogThresholdLevel;
}): void;
/** 当前生效配置（供 demo / 诊断展示）。 */
export declare function loggerConfig(): {
    dir: string;
    level: LogThresholdLevel;
};
export declare function logsDir(): string;
/** 系统日志：核心内部写点专用（生命周期 / 单实例 / 渲染）。默认 info；首参若是 `[tag] ...` 则取作来源。 */
export declare function sysLog(...args: unknown[]): void;
/** 带级别的系统日志（核心内部用；不丢弃打印，只是给行打级别）。 */
export declare function sysAt(level: LogRecordLevel, ...args: unknown[]): void;
/** 用户日志行：由 UserLogStore 调用，统一写入 user 日志、来源=channel、带级别。 */
export declare function userLogLine(channel: string, level: LogRecordLevel, args: unknown[]): void;
/** 捕获 console（log/info/warn/error/debug）→ 同步进系统日志（不分级，只要打印就记），并保留原输出。 */
export declare function enableConsoleCapture(): void;
export interface LogFileInfo {
    name: string;
    size: number;
}
/** 概览：日志根目录 + system/user 各自分片文件（新在前），供 demo 展示。 */
export declare function logOverview(): {
    dir: string;
    system: LogFileInfo[];
    user: LogFileInfo[];
};
/** 读某 scope 最新分片的末尾 N 行（供 demo 展示；读不受「系统日志用户不可写」限制）。 */
export declare function readLogTail(scope: LogScope, lines?: number): string[];
/** 结构化日志记录（readLogEntries 产出，形状与 LogViewer 的 LogEntry 兼容）。 */
export interface LogRecord {
    time: string;
    level: LogRecordLevel;
    source: string;
    message: string;
}
/** 解析最新分片末尾若干行为结构化记录（喂给 LogViewer）；旧式无级别行按 info 兜底。 */
export declare function readLogEntries(scope: LogScope, lines?: number): LogRecord[];
/** 关闭所有已打开的日志 fd（进程收尾可选；writeSync 已即时刷盘，不依赖此调用）。 */
export declare function closeLogs(): void;
