"use strict";
// 帧调度：把一次 React commit 内产生的多次变更合并成一帧，避免每个 setState 都重绘整窗。
// 独立成模块是为了断开 reconciler ↔ window host 的循环依赖。
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerFrameTask = registerFrameTask;
exports.scheduleFrame = scheduleFrame;
const tasks = new Set();
let scheduled = false;
function registerFrameTask(task) {
    tasks.add(task);
    return () => tasks.delete(task);
}
function scheduleFrame() {
    if (scheduled)
        return;
    scheduled = true;
    // setImmediate 比 setTimeout(0) 更适合 Node：在当前 I/O 轮次末尾就执行，交互延迟更低
    setImmediate(() => {
        scheduled = false;
        for (const task of tasks) {
            try {
                task();
            }
            catch (e) {
                console.error('[flux-skia] frame task failed: ' + (e && e.stack ? e.stack : e));
            }
        }
    });
}
