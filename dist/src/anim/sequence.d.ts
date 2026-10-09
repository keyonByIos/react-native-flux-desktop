export interface SequenceStep {
    /** 相对上一步【开始】时间的偏移（ms）；省略 = 接在上一步结束时间之后（顺序） */
    offset?: number;
    /** 该步自身时长（ms），仅用于计算后续步骤的默认起点 */
    duration?: number;
    /** 步骤启动回调（在该步的调度时刻触发）；可返回清理函数，cancel 时对已启动步骤调用 */
    run: () => void | (() => void);
}
export interface SequenceHandle {
    /** 时间线总时长（ms）：最后一步的开始 + 其 duration */
    total: number;
    /** 作废全部未触发步骤，并对已启动步骤调用其清理函数 */
    cancel: () => void;
}
export declare function runSequence(steps: SequenceStep[]): SequenceHandle;
