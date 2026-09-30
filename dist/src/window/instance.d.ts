
export declare function isSingleInstanceEnforced(): boolean;

export interface SecondInstancePayload {

    argv: string[];

    cwd: string;

    pid: number;
}
type SecondInstanceHandler = (payload: SecondInstancePayload) => void;

export declare function onSecondInstance(cb: SecondInstanceHandler): void;
export interface SingleInstanceOptions {

    name?: string;

    allowMulti?: boolean;

    onSecondInstance?: SecondInstanceHandler;
}

export declare function acquireSingleInstance(opts?: string | SingleInstanceOptions): boolean;

export declare function releaseSingleInstance(): void;
export {};
