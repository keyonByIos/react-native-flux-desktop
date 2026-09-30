"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.allocDragId = allocDragId;
exports.setSource = setSource;
exports.removeSource = removeSource;
exports.setTarget = setTarget;
exports.removeTarget = removeTarget;
exports.getDragState = getDragState;
exports.subscribeDrag = subscribeDrag;
exports.isDragging = isDragging;
exports.beginDrag = beginDrag;
exports.moveDrag = moveDrag;
exports.dropDrag = dropDrag;
exports.cancelDrag = cancelDrag;
let seq = 0;
/** 同步预分配一个稳定的拖拽句柄 id（渲染期即分配，effect 里再登记处理器） */
function allocDragId() {
    return ++seq;
}
const sources = new Map();
const targets = new Map();
function setSource(id, h) {
    sources.set(id, h);
}
function removeSource(id) {
    sources.delete(id);
}
function setTarget(id, h) {
    targets.set(id, h);
}
function removeTarget(id) {
    targets.delete(id);
}
const IDLE = { active: false, x: 0, y: 0, data: null, image: null, sourceId: null, overId: null, overPosition: null };
let state = IDLE;
const listeners = new Set();
function notify() {
    for (const l of listeners)
        l();
}
/** 快照：引用稳定（仅 notify 前重建），适配 React.useSyncExternalStore */
function getDragState() {
    return state;
}
function subscribeDrag(l) {
    listeners.add(l);
    return () => {
        listeners.delete(l);
    };
}
function isDragging() {
    return state.active;
}
/** 判定某 drop id 此刻是否可接收当前拖拽项（存在 + 类型匹配 + canDrop 放行） */
function acceptable(id) {
    if (id == null)
        return false;
    const t = targets.get(id);
    if (!t)
        return false;
    if (t.type && state.sourceId != null) {
        const s = sources.get(state.sourceId);
        if (s && s.type && s.type !== t.type)
            return false;
    }
    if (t.canDrop && !t.canDrop(state.data))
        return false;
    return true;
}
/**
 * 起拖：读 source 数据 + 预览函数，置 active，回调 onDragStart。
 * 由 host 在「按下后移动越过阈值」时调用（短按不起拖）。
 */
function beginDrag(sourceId, x, y) {
    const s = sources.get(sourceId);
    if (!s)
        return;
    const data = s.getDragData();
    const render = s.renderImage;
    state = {
        active: true,
        x,
        y,
        data,
        image: render ? (i) => render(i) : null,
        sourceId,
        overId: null,
        overPosition: null,
    };
    s.onDragStart?.(data);
    notify();
}
/**
 * 移动：更新坐标与半区；overId 变化时对旧目标派发 leave、对新（且可落）目标派发 enter。
 * 命中但不可落的目标被归一为 null（不高亮、不误派发 enter）。
 * position 随光标在同一目标内上下半移动而变（不重发 enter，仅更新 overPosition 供落点线跟随）。
 */
function moveDrag(x, y, overId, position = 'after') {
    if (!state.active)
        return;
    const eff = acceptable(overId) ? overId : null;
    const pos = eff != null ? position : null;
    if (eff !== state.overId) {
        if (state.overId != null)
            targets.get(state.overId)?.onDragLeave?.(state.data);
        if (eff != null)
            targets.get(eff)?.onDragEnter?.(state.data, pos ?? 'after');
    }
    state = { ...state, x, y, overId: eff, overPosition: pos };
    notify();
}
/** 释放：命中可落目标 → 派发 onDrop + source.onDragEnd('dropped')；否则 'cancelled' */
function dropDrag() {
    if (!state.active)
        return;
    const src = state.sourceId != null ? sources.get(state.sourceId) : undefined;
    if (state.overId != null) {
        targets.get(state.overId)?.onDrop?.(state.data, state.overPosition ?? 'after');
        src?.onDragEnd?.(state.data, 'dropped');
    }
    else {
        src?.onDragEnd?.(state.data, 'cancelled');
    }
    reset();
}
/** 取消：拖出窗口 / 失焦等异常终止，派发 leave + source.onDragEnd('cancelled') */
function cancelDrag() {
    if (!state.active)
        return;
    if (state.overId != null)
        targets.get(state.overId)?.onDragLeave?.(state.data);
    const src = state.sourceId != null ? sources.get(state.sourceId) : undefined;
    src?.onDragEnd?.(state.data, 'cancelled');
    reset();
}
function reset() {
    state = IDLE;
    notify();
}
