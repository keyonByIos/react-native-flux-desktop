export interface SequenceStep {

    offset?: number;

    duration?: number;

    run: () => void | (() => void);
}
export interface SequenceHandle {

    total: number;

    cancel: () => void;
}
export declare function runSequence(steps: SequenceStep[]): SequenceHandle;
