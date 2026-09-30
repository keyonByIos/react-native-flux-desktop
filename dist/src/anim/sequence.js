"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.runSequence = runSequence;
function runSequence(steps) {
    const timers = [];
    const cleanups = [];
    let cancelled = false;
    // 每步起点：显式 offset 相对上一步【开始】；否则接上一步【结束】
    let prevStart = 0;
    let prevEnd = 0;
    const starts = [];
    steps.forEach((s, i) => {
        const start = s.offset != null ? prevStart + s.offset : prevEnd;
        starts[i] = start;
        prevStart = start;
        prevEnd = start + (s.duration ?? 0);
    });
    steps.forEach((s, i) => {
        timers.push(setTimeout(() => {
            if (cancelled)
                return;
            try {
                const cleanup = s.run();
                if (cleanup)
                    cleanups.push(cleanup);
            }
            catch (e) {
                console.error('[flux] sequence step failed: ' + (e && e.stack ? e.stack : e));
            }
        }, starts[i]));
    });
    return {
        total: Math.max(prevEnd, 0),
        cancel: () => {
            cancelled = true;
            timers.forEach(clearTimeout);
            cleanups.forEach((c) => {
                try {
                    c();
                }
                catch {
                    /* 清理失败不打断整体作废 */
                }
            });
            cleanups.length = 0;
        },
    };
}
