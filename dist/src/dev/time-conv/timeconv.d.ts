export interface StampInfo {

    ms: number;

    sec: number;

    unit: 's' | 'ms';
}

export declare function detectUnit(n: number): 's' | 'ms';

export declare function fromTimestamp(n: number): StampInfo | null;

export declare function parseToMs(input: string, tz: string): number | null;

export declare function tzOffsetLabel(ms: number, tz: string): string;

export declare function formatZoned(ms: number, tz: string): string;

export declare function relativeTime(ms: number, nowMs: number): string;
