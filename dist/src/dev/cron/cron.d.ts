export interface CronFields {
    minute: number[];
    hour: number[];
    dom: number[];
    month: number[];
    dow: number[];
    domStar: boolean;
    dowStar: boolean;
}

export declare function parseCron(expr: string): CronFields;

export declare function nextRun(f: CronFields, from: Date, guardDays?: number): Date | null;

export declare function nextRuns(expr: string, from: Date, count?: number): Date[];

export declare function describeCron(expr: string): string;
export declare function isValidCron(expr: string): boolean;
