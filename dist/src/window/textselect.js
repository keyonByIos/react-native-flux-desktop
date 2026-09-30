"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.showTextSelection = showTextSelection;
exports.clearTextSelection = clearTextSelection;
exports.getTextSelectionState = getTextSelectionState;
exports.subscribeTextSelection = subscribeTextSelection;
let state = { visible: false, rects: [], text: '' };
const listeners = new Set();
function notify() {
    for (const l of listeners)
        l();
}
/** 选中一批行矩形（窗口逻辑坐标），携带其完整文本供复制 */
function showTextSelection(rects, text) {
    state = { visible: true, rects, text };
    notify();
}
function clearTextSelection() {
    if (!state.visible)
        return;
    state = { visible: false, rects: [], text: '' };
    notify();
}
function getTextSelectionState() {
    return state;
}
function subscribeTextSelection(l) {
    listeners.add(l);
    return () => {
        listeners.delete(l);
    };
}
