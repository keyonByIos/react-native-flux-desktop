"use strict";
// 文件拖放总线：把 host 从原生收到的 OS 级 drop 事件（无光标坐标，底座版本限制）
// 路由到「当前激活的」放置目标。组件通过 registerDropZone 订阅，得到 onEnter/onLeave/onDrop。
//
// 由于底座的 DroppedFile/HoveredFile 只带文件路径、不带屏幕坐标，无法做多目标精确命中，
// 故按「最后被 hover / 激活」的单个目标路由；多文件在同一个宏任务内聚合后一次性回调。
Object.defineProperty(exports, "__esModule", { value: true });
exports.activateDropZone = activateDropZone;
exports.registerDropZone = registerDropZone;
exports.unregisterDropZone = unregisterDropZone;
exports.feedDrop = feedDrop;
let seq = 0;
const zones = new Map();
/** 当前路由目标（最后一次激活/注册的 zone） */
let activeId = null;
/** 聚合同一批次内连续到达的多个 DroppedFile */
let buffer = [];
let flushTimer = null;
/** 把一个 zone 提升为当前激活目标（组件在 hover/聚焦时调用，改善多目标路由） */
function activateDropZone(id) {
    if (zones.has(id))
        activeId = id;
}
function currentTarget() {
    if (activeId != null && zones.has(activeId))
        return zones.get(activeId);
    const first = zones.values().next();
    return first.done ? null : first.value;
}
/** 注册一个放置目标，返回卸载函数 */
function registerDropZone(handlers) {
    const id = ++seq;
    zones.set(id, handlers);
    if (activeId == null)
        activeId = id;
    return id;
}
function unregisterDropZone(id) {
    zones.delete(id);
    if (activeId === id) {
        const keys = [...zones.keys()];
        activeId = keys.length ? keys[keys.length - 1] : null;
    }
}
/** host 在每次原生 drop 事件回调时喂进来；action 来自 Rust（enter/leave/drop） */
function feedDrop(action, path) {
    if (zones.size === 0)
        return;
    if (action === 'enter' || action === 'over') {
        currentTarget()?.onEnter?.();
        return;
    }
    if (action === 'leave') {
        for (const z of zones.values())
            z.onLeave?.();
        buffer = [];
        if (flushTimer) {
            clearTimeout(flushTimer);
            flushTimer = null;
        }
        return;
    }
    // drop：可能一帧内连续多文件，聚合到下一宏任务统一派发
    if (path)
        buffer.push(path);
    if (flushTimer)
        clearTimeout(flushTimer);
    flushTimer = setTimeout(() => {
        flushTimer = null;
        const paths = buffer;
        buffer = [];
        if (paths.length)
            currentTarget()?.onDrop?.(paths);
        for (const z of zones.values())
            z.onLeave?.();
    }, 0);
}
